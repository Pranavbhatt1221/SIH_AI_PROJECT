import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  UploadCloud,
  Camera,
  ScanFace,
  CheckCircle2,
  Play,
  Image as ImageIcon,
  User,
  ShieldAlert,
  Sliders,
  ShieldCheck,
  Eye,
  ArrowLeft,
  ArrowRight,
  ArrowUpDown,
  Smile,
  RefreshCw,
  XCircle,
} from 'lucide-react';
import { PageView } from '../types';

// ─── Liveness types ───────────────────────────────────────────────────────────

type LivenessPhase =
  | 'idle'        // camera off
  | 'preparing'   // camera on, 3-second countdown before first challenge
  | 'challenge'   // showing a challenge, collecting motion frames
  | 'passed'      // all challenges passed, auto-capture in 1 s
  | 'failed';     // challenge timed out without enough motion

interface Challenge {
  id: string;
  text: string;
  subtext: string;
  Icon: React.FC<{ className?: string }>;
  color: string;          // tailwind text colour
  ringColor: string;      // tailwind ring / border colour
  motionThreshold: number; // mean absolute pixel delta needed (0-255)
  durationMs: number;     // window to complete the challenge
}

const ALL_CHALLENGES: Challenge[] = [
  {
    id: 'blink',
    text: 'Blink your eyes twice',
    subtext: 'Open wide, then blink slowly',
    Icon: Eye,
    color: 'text-cyan-400',
    ringColor: 'border-cyan-400',
    motionThreshold: 3.5,
    durationMs: 5000,
  },
  {
    id: 'turn_left',
    text: 'Turn head LEFT',
    subtext: 'Slowly look to your left',
    Icon: ArrowLeft,
    color: 'text-violet-400',
    ringColor: 'border-violet-400',
    motionThreshold: 4.0,
    durationMs: 5000,
  },
  {
    id: 'turn_right',
    text: 'Turn head RIGHT',
    subtext: 'Slowly look to your right',
    Icon: ArrowRight,
    color: 'text-amber-400',
    ringColor: 'border-amber-400',
    motionThreshold: 4.0,
    durationMs: 5000,
  },
  {
    id: 'nod',
    text: 'Nod your head',
    subtext: 'Slowly nod up and down once',
    Icon: ArrowUpDown,
    color: 'text-emerald-400',
    ringColor: 'border-emerald-400',
    motionThreshold: 4.0,
    durationMs: 5000,
  },
  {
    id: 'smile',
    text: 'Give a natural smile',
    subtext: 'Relax and smile at the camera',
    Icon: Smile,
    color: 'text-pink-400',
    ringColor: 'border-pink-400',
    motionThreshold: 3.0,
    durationMs: 4000,
  },
];

/** Pick `n` unique challenges at random */
function pickChallenges(n: number): Challenge[] {
  const shuffled = [...ALL_CHALLENGES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface NewScreeningPageProps {
  setCurrentPage: (page: PageView) => void;
  onStartAnalysis: (payload: any) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const NewScreeningPage: React.FC<NewScreeningPageProps> = ({
  setCurrentPage,
  onStartAnalysis,
}) => {
  const [docType, setDocType] = useState('Passport');

  // Uploaded images state
  const [docImage, setDocImage] = useState<string | null>(null);
  const [docFileName, setDocFileName] = useState<string>('');
  const [docFileSize, setDocFileSize] = useState<string>('');

  const [liveFaceImage, setLiveFaceImage] = useState<string | null>(null);
  const [tamperingPreset, setTamperingPreset] = useState<string>('AUTO');

  // ── Camera refs ─────────────────────────────────────────────────────────────
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);           // hidden capture canvas
  const motionCanvasRef = useRef<HTMLCanvasElement>(null);     // hidden motion-diff canvas
  const prevFrameRef = useRef<ImageData | null>(null);        // last sampled frame
  const motionRafRef = useRef<number | null>(null);           // requestAnimationFrame id
  const challengeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prepTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Liveness state ──────────────────────────────────────────────────────────
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [livenessPhase, setLivenessPhase] = useState<LivenessPhase>('idle');
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [challengeIndex, setChallengeIndex] = useState(0);
  const [prepCountdown, setPrepCountdown] = useState(3);
  const [challengeProgress, setChallengeProgress] = useState(0); // 0-100
  const [motionScore, setMotionScore] = useState(0);             // current rolling mean delta
  const [challengePassed, setChallengePassed] = useState<boolean[]>([]);
  const [livenessScore, setLivenessScore] = useState<number | null>(null); // 0-100

  // ── Camera helpers ──────────────────────────────────────────────────────────

  const stopCamera = useCallback(() => {
    // Cancel animation frame for motion detection
    if (motionRafRef.current) cancelAnimationFrame(motionRafRef.current);
    motionRafRef.current = null;
    if (challengeTimerRef.current) clearTimeout(challengeTimerRef.current);
    if (prepTimerRef.current) clearTimeout(prepTimerRef.current);

    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      videoRef.current.srcObject = null;
    }
    prevFrameRef.current = null;
    setIsCameraActive(false);
    setLivenessPhase('idle');
    setChallengeIndex(0);
    setPrepCountdown(3);
    setChallengeProgress(0);
    setMotionScore(0);
    setChallengePassed([]);
  }, []);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Mirror horizontally to match what traveler sees in the live mirror preview
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
      setLiveFaceImage(dataUrl);
    }
    stopCamera();
  }, [stopCamera]);

  // ── Motion detection loop ───────────────────────────────────────────────────
  // Runs via requestAnimationFrame while a challenge is active.
  // Computes mean absolute pixel delta between consecutive video frames
  // on a small downscaled canvas (80×60) for performance.

  const startMotionLoop = useCallback(
    (threshold: number, onPass: () => void) => {
      const mc = motionCanvasRef.current;
      const video = videoRef.current;
      if (!mc || !video) return;

      const W = 80, H = 60;
      mc.width = W;
      mc.height = H;
      const ctx = mc.getContext('2d', { willReadFrequently: true })!;
      prevFrameRef.current = null;

      const tick = () => {
        if (video.readyState < 2) {
          motionRafRef.current = requestAnimationFrame(tick);
          return;
        }
        ctx.drawImage(video, 0, 0, W, H);
        const curr = ctx.getImageData(0, 0, W, H);

        if (prevFrameRef.current) {
          const prev = prevFrameRef.current.data;
          const cur = curr.data;
          let sum = 0;
          const len = cur.length;
          for (let i = 0; i < len; i += 4) {
            sum +=
              Math.abs(cur[i] - prev[i]) +
              Math.abs(cur[i + 1] - prev[i + 1]) +
              Math.abs(cur[i + 2] - prev[i + 2]);
          }
          // Mean delta across all pixels (0-255 scale)
          const delta = sum / (3 * W * H);
          setMotionScore(Math.round(delta * 10) / 10);

          if (delta >= threshold) {
            // Motion sufficient → challenge passed
            if (motionRafRef.current) cancelAnimationFrame(motionRafRef.current);
            motionRafRef.current = null;
            onPass();
            return;
          }
        }
        prevFrameRef.current = curr;
        motionRafRef.current = requestAnimationFrame(tick);
      };

      motionRafRef.current = requestAnimationFrame(tick);
    },
    []
  );

  // ── Liveness challenge orchestration ────────────────────────────────────────

  const runChallenge = useCallback(
    (index: number, challengeList: Challenge[], passedSoFar: boolean[]) => {
      if (index >= challengeList.length) {
        // All challenges complete
        const score = Math.round((passedSoFar.filter(Boolean).length / challengeList.length) * 100);
        setLivenessScore(score);
        setLivenessPhase('passed');
        setChallengePassed(passedSoFar);
        // Auto-capture after 750ms while user is still centered and looking at camera
        challengeTimerRef.current = setTimeout(capturePhoto, 750);
        return;
      }

      const challenge = challengeList[index];
      setChallengeIndex(index);
      setLivenessPhase('challenge');
      setChallengeProgress(0);
      setMotionScore(0);

      let elapsed = 0;
      const tick = 80; // ms per progress tick
      const totalTicks = challenge.durationMs / tick;

      const progressTimer = setInterval(() => {
        elapsed += tick;
        setChallengeProgress(Math.min(100, (elapsed / challenge.durationMs) * 100));
        if (elapsed >= challenge.durationMs) {
          clearInterval(progressTimer);
        }
      }, tick);

      // Timeout → mark failed and move on
      challengeTimerRef.current = setTimeout(() => {
        if (motionRafRef.current) { cancelAnimationFrame(motionRafRef.current); motionRafRef.current = null; }
        clearInterval(progressTimer);
        const newPassed = [...passedSoFar, false];
        setChallengePassed(newPassed);
        setLivenessPhase('failed');
      }, challenge.durationMs + 200);

      // Start motion detection; on pass → advance to next challenge
      startMotionLoop(challenge.motionThreshold, () => {
        if (challengeTimerRef.current) clearTimeout(challengeTimerRef.current);
        clearInterval(progressTimer);
        const newPassed = [...passedSoFar, true];
        setChallengePassed(newPassed);
        // Brief green flash then next challenge
        setTimeout(() => runChallenge(index + 1, challengeList, newPassed), 700);
      });
    },
    [startMotionLoop, capturePhoto]
  );

  const startLiveness = useCallback(async () => {
    try {
      setIsCameraActive(true);
      setLivenessPhase('preparing');
      setPrepCountdown(3);
      setChallengeIndex(0);
      setChallengePassed([]);
      setLivenessScore(null);

      const selected = pickChallenges(2);
      setChallenges(selected);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
      });
      if (videoRef.current) videoRef.current.srcObject = stream;

      // 3-second preparation countdown
      let count = 3;
      const countdown = setInterval(() => {
        count--;
        setPrepCountdown(count);
        if (count <= 0) {
          clearInterval(countdown);
          runChallenge(0, selected, []);
        }
      }, 1000);
      prepTimerRef.current = countdown as unknown as ReturnType<typeof setTimeout>;

    } catch (err) {
      console.error('Camera access error', err);
      alert('Camera permission not granted or device not found. You can upload a face photo instead.');
      setIsCameraActive(false);
      setLivenessPhase('idle');
    }
  }, [runChallenge]);

  const retryLiveness = useCallback(() => {
    // Clear timers, reset, restart
    if (motionRafRef.current) { cancelAnimationFrame(motionRafRef.current); motionRafRef.current = null; }
    if (challengeTimerRef.current) clearTimeout(challengeTimerRef.current);
    prevFrameRef.current = null;
    setLivenessPhase('preparing');
    setPrepCountdown(3);
    setChallengePassed([]);
    setMotionScore(0);
    setLivenessScore(null);

    const selected = pickChallenges(2);
    setChallenges(selected);
    setChallengeIndex(0);

    let count = 3;
    const countdown = setInterval(() => {
      count--;
      setPrepCountdown(count);
      if (count <= 0) {
        clearInterval(countdown);
        runChallenge(0, selected, []);
      }
    }, 1000);
    prepTimerRef.current = countdown as unknown as ReturnType<typeof setTimeout>;
  }, [runChallenge]);

  // ── File upload handlers ─────────────────────────────────────────────────────
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDocFileName(file.name);
      setDocFileSize((file.size / 1024 / 1024).toFixed(2) + ' MB');
      const reader = new FileReader();
      reader.onload = (event) => setDocImage(event.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleFaceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setLiveFaceImage(event.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  // ── Submit ───────────────────────────────────────────────────────────────────
  const handleSubmit = () => {
    if (!docImage && !liveFaceImage) {
      alert('Screening cannot proceed: Both a passport / document image AND a traveler live face photo are required.');
      return;
    }
    if (!docImage) {
      alert('Screening cannot proceed: Please upload a passport / document image first.');
      return;
    }
    if (!liveFaceImage) {
      alert('Screening cannot proceed: Please capture or upload the traveler live face photo first.');
      return;
    }
    const payload = {
      demo_case_id: null,
      document_type: docType,
      document_image: docImage,
      live_face_image: liveFaceImage,
      tampering_preset: tamperingPreset,
    };
    onStartAnalysis(payload);
    setCurrentPage('processing');
  };

  // ── Derived helpers ──────────────────────────────────────────────────────────
  const currentChallenge = challenges[challengeIndex] ?? null;
  const isFormReady = Boolean(docImage && liveFaceImage);

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8 pb-16">

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs font-bold uppercase tracking-wider">
            <ScanFace className="w-4 h-4" />
            <span>Checkpoint Capture Layer</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">Initiate New Identity Screening</h1>
          <p className="text-xs text-slate-400">
            Upload ANY passport or document image. PaddleOCR will separate the text fields, cross-check against the Authorized Database, and InsightFace will verify the face.
          </p>
        </div>
      </div>

      {/* Main Form Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* ── Left: Document Upload ─────────────────────────────────────────── */}
        <div className="lg:col-span-7 space-y-6">
          {/* Document Type */}
          <div className="rounded-xl bg-navy-900 border border-navy-750 p-5 space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Document Classification
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {['Passport', 'Visa', 'National ID', 'Driving Licence', 'Travel Permit', 'Other'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setDocType(type)}
                  className={`py-2 px-1 text-center rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                    docType === type
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-sm'
                      : 'bg-navy-850 hover:bg-navy-800 border-navy-750 text-slate-300'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Document Upload */}
          <div className="rounded-xl bg-navy-900 border border-navy-750 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                1. Upload Physical Document Image
              </label>
              {docImage && (
                <span className="text-[11px] text-emerald-400 font-mono flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Image Loaded</span>
                </span>
              )}
            </div>

            <div className="relative border-2 border-dashed border-navy-700 hover:border-cyan-500/50 rounded-xl p-6 text-center transition-all bg-navy-950/50 flex flex-col items-center justify-center min-h-[220px]">
              {docImage ? (
                <div className="space-y-3 w-full flex flex-col items-center">
                  <div className="relative rounded-lg overflow-hidden border border-navy-700 max-h-52 shadow-lg">
                    <img src={docImage} alt="Document Preview" className="max-h-52 object-contain rounded" />
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/80 text-[10px] font-mono text-cyan-400 border border-cyan-400/30">
                      DOCUMENT SCAN
                    </div>
                  </div>
                  <div className="text-xs text-slate-300 font-mono">
                    {docFileName || 'custom_document.jpg'} {docFileSize ? `• ${docFileSize}` : ''} • {docType}
                  </div>
                  <label className="cursor-pointer text-xs text-cyan-400 hover:underline font-bold">
                    <span>Upload a Different Image</span>
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
              ) : (
                <label className="cursor-pointer flex flex-col items-center space-y-3 py-4 w-full">
                  <div className="w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">Click or Drag &amp; Drop ANY Passport Image</div>
                    <div className="text-xs text-slate-400 mt-0.5">PaddleOCR will detect characters, extract Name, Passport No, DOB, Expiry</div>
                  </div>
                  <span className="px-4 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-750 text-slate-200 border border-navy-700 text-xs font-bold">
                    Browse File from Computer
                  </span>
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>
              )}
            </div>

            {/* ELA mode selector */}
            <div className="pt-2 border-t border-navy-800 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2 text-slate-400">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <span>Error Level Analysis Mode:</span>
              </div>
              <select
                value={tamperingPreset}
                onChange={(e) => setTamperingPreset(e.target.value)}
                className="bg-navy-850 border border-navy-700 rounded-lg px-2.5 py-1 text-slate-200 text-xs font-mono focus:outline-none focus:border-cyan-500"
              >
                <option value="AUTO">AUTO (CV Algorithm)</option>
                <option value="CLEAN">Clean Document (Low ELA)</option>
                <option value="PHOTO_TAMPERED">Photo Splicing (High ELA)</option>
                <option value="TEXT_TAMPERED">Text Alteration (DOB Spliced)</option>
                <option value="STAMP_TAMPERED">Stamp Forgery (Cloned Vector)</option>
              </select>
            </div>
          </div>
        </div>

        {/* ── Right: Live Face / Liveness Check ────────────────────────────── */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-xl bg-navy-900 border border-navy-750 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ScanFace className="w-4 h-4 text-cyan-400" />
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  2. Traveler Face (Live Scan or Upload)
                </label>
              </div>
              {liveFaceImage && !isCameraActive && (
                <span className="text-[11px] text-emerald-400 font-mono flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Face Ready</span>
                </span>
              )}
            </div>

            <p className="text-[11px] text-slate-400">
              InsightFace extracts 512-D ArcFace embeddings from this face and compares it against the passport photo.
            </p>

            {/* ── Video viewport with liveness overlay ── */}
            <div className="relative rounded-xl overflow-hidden bg-navy-950 border border-navy-750 aspect-video flex items-center justify-center">

              {/* Video element — always mounted when camera is active */}
              {isCameraActive && (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ transform: 'scaleX(-1)' }}
                />
              )}

              {/* ── IDLE / face preview ── */}
              {!isCameraActive && (
                <>
                  {liveFaceImage ? (
                    <div className="relative w-full h-full flex items-center justify-center p-2 bg-navy-950">
                      <img
                        src={liveFaceImage}
                        alt="Traveler Face"
                        className="max-h-full max-w-full object-contain rounded"
                      />
                      <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/80 text-[10px] font-mono text-emerald-400 border border-emerald-400/30 flex items-center space-x-1">
                        <ShieldCheck className="w-3 h-3" />
                        <span>LIVENESS VERIFIED</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center p-4 space-y-2">
                      <User className="w-10 h-10 text-slate-600 mx-auto" />
                      <div className="text-xs text-slate-400">No traveler portrait loaded yet</div>
                      <div className="text-[10px] text-slate-500">Scan live via WebCam or upload a selfie</div>
                    </div>
                  )}
                </>
              )}

              {/* ── PREPARING overlay (countdown) ── */}
              {isCameraActive && livenessPhase === 'preparing' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 z-10 space-y-4">
                  {/* Oval guide */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-32 h-44 border-2 border-cyan-400/60 rounded-[50%] border-dashed" />
                  </div>
                  <div className="relative z-20 text-center space-y-2">
                    <div className="text-5xl font-black text-cyan-400 drop-shadow-lg">{prepCountdown}</div>
                    <div className="text-sm font-bold text-white">Get ready for liveness check</div>
                    <div className="flex items-center space-x-1.5 text-[11px] text-cyan-300 bg-black/50 px-3 py-1 rounded-full">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>Anti-Spoofing • Challenge-Response</span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {challenges.length} challenge{challenges.length !== 1 ? 's' : ''} will follow
                    </div>
                  </div>
                </div>
              )}

              {/* ── CHALLENGE overlay ── */}
              {isCameraActive && livenessPhase === 'challenge' && currentChallenge && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 z-10">
                  {/* Oval guide */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className={`w-32 h-44 border-2 ${currentChallenge.ringColor}/70 rounded-[50%] border-dashed`} />
                  </div>

                  {/* Challenge card */}
                  <div className="relative z-20 flex flex-col items-center space-y-3">
                    {/* Step indicator */}
                    <div className="flex items-center space-x-1.5">
                      {challenges.map((_, i) => (
                        <div
                          key={i}
                          className={`h-1.5 rounded-full transition-all duration-300 ${
                            i < challengeIndex
                              ? 'w-5 bg-emerald-400'
                              : i === challengeIndex
                              ? `w-8 ${currentChallenge.color.replace('text-', 'bg-')}`
                              : 'w-5 bg-slate-600'
                          }`}
                        />
                      ))}
                    </div>

                    {/* Challenge icon + text */}
                    <div className="bg-black/70 border border-slate-700 rounded-2xl px-5 py-4 text-center space-y-2 backdrop-blur-sm max-w-[200px]">
                      <currentChallenge.Icon className={`w-8 h-8 mx-auto ${currentChallenge.color}`} />
                      <div className={`text-sm font-black ${currentChallenge.color}`}>
                        {currentChallenge.text}
                      </div>
                      <div className="text-[10px] text-slate-400">{currentChallenge.subtext}</div>
                      {/* Motion indicator */}
                      <div className="flex items-center justify-center space-x-1.5 text-[10px] text-slate-400">
                        <div className={`w-1.5 h-1.5 rounded-full ${motionScore > currentChallenge.motionThreshold * 0.5 ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
                        <span>Motion: {motionScore.toFixed(1)}</span>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="w-40 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${currentChallenge.color.replace('text-', 'bg-')}`}
                        style={{ width: `${100 - challengeProgress}%`, transition: 'width 80ms linear' }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ── PASSED overlay ── */}
              {isCameraActive && livenessPhase === 'passed' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-emerald-950/70 z-10 space-y-3">
                  {/* Keep center oval guide visible so user stays centered */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-32 h-44 border-2 border-emerald-400/80 rounded-[50%] border-dashed animate-pulse" />
                  </div>
                  <div className="relative z-20 text-center space-y-1">
                    <ShieldCheck className="w-12 h-12 text-emerald-400 drop-shadow-lg mx-auto animate-bounce" />
                    <div className="text-base font-black text-emerald-400">Liveness Verified!</div>
                    <div className="text-xs text-emerald-300 font-bold">Hold still • Capturing portrait photo…</div>
                  </div>
                </div>
              )}

              {/* ── FAILED overlay ── */}
              {isCameraActive && livenessPhase === 'failed' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-950/80 z-10 space-y-4">
                  <XCircle className="w-12 h-12 text-red-400" />
                  <div className="text-sm font-black text-red-400">Challenge Not Detected</div>
                  <div className="text-[11px] text-slate-400 text-center px-4">
                    Not enough movement was detected.<br />Ensure your face is well-lit and move more clearly.
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={retryLiveness}
                      className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Retry</span>
                    </button>
                    <button
                      onClick={stopCamera}
                      className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-bold cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Hidden canvases */}
              <canvas ref={canvasRef} className="hidden" />
              <canvas ref={motionCanvasRef} className="hidden" />
            </div>

            {/* ── Camera / Upload Controls ── */}
            <div className="flex items-center space-x-2">
              {isCameraActive ? (
                /* While liveness is running, only show Cancel */
                <button
                  type="button"
                  onClick={stopCamera}
                  className="py-2 px-4 rounded-lg bg-navy-800 hover:bg-navy-750 text-slate-300 text-xs font-bold border border-navy-700 cursor-pointer w-full"
                >
                  Cancel Live Scan
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={startLiveness}
                    className="flex-1 py-2 rounded-lg bg-navy-850 hover:bg-navy-800 text-slate-200 border border-navy-700 text-xs font-bold flex items-center justify-center space-x-1.5 cursor-pointer transition-colors"
                  >
                    <Camera className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Live WebCam + Liveness</span>
                  </button>
                  <label className="flex-1 py-2 rounded-lg bg-navy-850 hover:bg-navy-800 text-slate-200 border border-navy-700 text-xs font-bold flex items-center justify-center space-x-1.5 cursor-pointer transition-colors">
                    <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Upload Face Photo</span>
                    <input type="file" accept="image/*" onChange={handleFaceUpload} className="hidden" />
                  </label>
                </>
              )}
            </div>

            {/* Liveness badge (shown after capture) */}
            {!isCameraActive && liveFaceImage && livenessScore !== null && (
              <div className="flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-3 py-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <div className="text-[11px]">
                  <span className="text-emerald-400 font-bold">Liveness score {livenessScore}%</span>
                  <span className="text-slate-400"> — Anti-spoofing challenge passed</span>
                </div>
              </div>
            )}
          </div>

          {/* ── Requirements Status Card ── */}
          <div className="rounded-xl bg-navy-900 border border-navy-750 p-4 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                Mandatory Screening Inputs
              </span>
              <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                isFormReady
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}>
                {isFormReady ? 'READY TO SCREEN' : 'ACTION REQUIRED'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className={`p-2.5 rounded-lg border flex items-center space-x-2 transition-all ${
                docImage
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                  : 'bg-navy-950 border-navy-800 text-slate-400'
              }`}>
                <CheckCircle2 className={`w-4 h-4 shrink-0 ${docImage ? 'text-emerald-400' : 'text-slate-600'}`} />
                <div className="truncate">
                  <div className="font-bold text-[11px]">1. Passport Scan</div>
                  <div className={`text-[10px] truncate ${docImage ? 'text-emerald-400 font-semibold' : 'text-amber-400'}`}>
                    {docImage ? 'Uploaded ✓' : 'Missing ✗'}
                  </div>
                </div>
              </div>

              <div className={`p-2.5 rounded-lg border flex items-center space-x-2 transition-all ${
                liveFaceImage
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                  : 'bg-navy-950 border-navy-800 text-slate-400'
              }`}>
                <CheckCircle2 className={`w-4 h-4 shrink-0 ${liveFaceImage ? 'text-emerald-400' : 'text-slate-600'}`} />
                <div className="truncate">
                  <div className="font-bold text-[11px]">2. Live Face Photo</div>
                  <div className={`text-[10px] truncate ${liveFaceImage ? 'text-emerald-400 font-semibold' : 'text-amber-400'}`}>
                    {liveFaceImage ? 'Captured ✓' : 'Missing ✗'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Launch Button ── */}
          <div className="pt-1">
            <button
              onClick={handleSubmit}
              disabled={!isFormReady}
              className={`w-full py-4 rounded-xl font-black text-sm tracking-wider shadow-xl transition-all flex items-center justify-center space-x-2 ${
                isFormReady
                  ? 'bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-cyan-500/25 cursor-pointer active:scale-95'
                  : 'bg-navy-850 text-slate-500 border border-navy-750 cursor-not-allowed opacity-60 shadow-none'
              }`}
            >
              <Play className={`w-5 h-5 ${isFormReady ? 'fill-slate-950 text-slate-950' : 'fill-slate-600 text-slate-600'}`} />
              <span>
                {!docImage && !liveFaceImage
                  ? 'UPLOAD PASSPORT & CAPTURE LIVE PHOTO TO PROCEED'
                  : !docImage
                  ? 'UPLOAD PASSPORT DOCUMENT TO PROCEED'
                  : !liveFaceImage
                  ? 'CAPTURE TRAVELER LIVE PHOTO TO PROCEED'
                  : 'RUN AI SCREENING PIPELINE'}
              </span>
            </button>
            <p className="text-[10px] text-slate-500 text-center mt-2 font-mono">
              PaddleOCR Character Extraction &bull; DB Cross-Check &bull; InsightFace Embeddings
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
