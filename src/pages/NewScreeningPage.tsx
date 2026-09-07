import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  Camera,
  FileText,
  ScanFace,
  CheckCircle2,
  AlertTriangle,
  Play,
  RefreshCw,
  Image as ImageIcon,
  User,
  ShieldAlert,
  Sliders,
  HelpCircle
} from 'lucide-react';
import { PageView } from '../types';

interface NewScreeningPageProps {
  setCurrentPage: (page: PageView) => void;
  onStartAnalysis: (payload: any) => void;
}

export const NewScreeningPage: React.FC<NewScreeningPageProps> = ({
  setCurrentPage,
  onStartAnalysis
}) => {
  const [docType, setDocType] = useState('Passport');

  // Uploaded images state
  const [docImage, setDocImage] = useState<string | null>(null);
  const [docFileName, setDocFileName] = useState<string>('');
  const [docFileSize, setDocFileSize] = useState<string>('');

  const [liveFaceImage, setLiveFaceImage] = useState<string | null>(null);
  const [tamperingPreset, setTamperingPreset] = useState<string>('AUTO');

  // Webcam live capture state
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDocFileName(file.name);
      setDocFileSize((file.size / 1024 / 1024).toFixed(2) + ' MB');
      const reader = new FileReader();
      reader.onload = (event) => {
        setDocImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFaceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setLiveFaceImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Webcam controls
  const startCamera = async () => {
    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Camera access error', err);
      alert('Camera permission not granted or device not found. You can upload a live face selfie file instead.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setLiveFaceImage(dataUrl);
        stopCamera();
      }
    }
  };

  const handleSubmit = () => {
    if (!docImage) {
      alert('Please upload any document image (Passport, National ID, Driving Licence) to begin screening.');
      return;
    }

    const payload = {
      demo_case_id: null,
      document_type: docType,
      document_image: docImage,
      live_face_image: liveFaceImage || docImage,
      tampering_preset: tamperingPreset
    };

    onStartAnalysis(payload);
    setCurrentPage('processing');
  };

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
        {/* Left Column: Document Upload (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Document Type Selector */}
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

          {/* Document Upload Box */}
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

            {/* Drop / Preview Area */}
            <div className="relative border-2 border-dashed border-navy-700 hover:border-cyan-500/50 rounded-xl p-6 text-center transition-all bg-navy-950/50 flex flex-col items-center justify-center min-h-[220px]">
              {docImage ? (
                <div className="space-y-3 w-full flex flex-col items-center">
                  <div className="relative rounded-lg overflow-hidden border border-navy-700 max-h-52 shadow-lg">
                    <img
                      src={docImage}
                      alt="Document Preview"
                      className="max-h-52 object-contain rounded"
                    />
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/80 text-[10px] font-mono text-cyan-400 border border-cyan-400/30">
                      DOCUMENT SCAN
                    </div>
                  </div>
                  <div className="text-xs text-slate-300 font-mono">
                    {docFileName || 'custom_document.jpg'} {docFileSize ? `• ${docFileSize}` : ''} • {docType}
                  </div>
                  <label className="cursor-pointer text-xs text-cyan-400 hover:underline font-bold">
                    <span>Upload a Different Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              ) : (
                <label className="cursor-pointer flex flex-col items-center space-y-3 py-4 w-full">
                  <div className="w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">Click or Drag & Drop ANY Passport Image</div>
                    <div className="text-xs text-slate-400 mt-0.5">PaddleOCR will detect characters, extract Name, Passport No, DOB, Expiry</div>
                  </div>
                  <span className="px-4 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-750 text-slate-200 border border-navy-700 text-xs font-bold">
                    Browse File from Computer
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Tampering Simulation Mode */}
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

        {/* Right Column: Live Face Scan / Photo Upload (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-xl bg-navy-900 border border-navy-750 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ScanFace className="w-4 h-4 text-cyan-400" />
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  2. Traveler Face (Live Scan or Upload)
                </label>
              </div>
              {liveFaceImage && (
                <span className="text-[11px] text-emerald-400 font-mono flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Face Ready</span>
                </span>
              )}
            </div>

            <p className="text-[11px] text-slate-400">
              InsightFace extracts 512-D ArcFace embeddings from this face and compares it against the passport photo.
            </p>

            {/* Webcam / Snapshot Viewport */}
            <div className="relative rounded-xl overflow-hidden bg-navy-950 border border-navy-750 aspect-video flex items-center justify-center">
              {isCameraActive ? (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  {/* Biometric Oval Alignment Guide */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-32 h-44 border-2 border-cyan-400/70 rounded-[50%] flex items-center justify-center border-dashed">
                      <div className="text-[10px] text-cyan-400 font-mono bg-black/60 px-1.5 py-0.5 rounded">
                        ALIGN FACE
                      </div>
                    </div>
                  </div>
                </>
              ) : liveFaceImage ? (
                <div className="relative w-full h-full flex items-center justify-center p-2 bg-navy-950">
                  <img
                    src={liveFaceImage}
                    alt="Traveler Face"
                    className="max-h-full max-w-full object-contain rounded"
                  />
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/80 text-[10px] font-mono text-cyan-400 border border-cyan-400/30">
                    PORTRAIT LOADED
                  </div>
                </div>
              ) : (
                <div className="text-center p-4 space-y-2">
                  <User className="w-10 h-10 text-slate-600 mx-auto" />
                  <div className="text-xs text-slate-400">No traveler portrait loaded yet</div>
                  <div className="text-[10px] text-slate-500">Scan live via WebCam or upload a selfie</div>
                </div>
              )}
              <canvas ref={canvasRef} className="hidden" />
            </div>

            {/* Camera / Upload Controls */}
            <div className="flex items-center space-x-2">
              {isCameraActive ? (
                <>
                  <button
                    type="button"
                    onClick={capturePhoto}
                    className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Capture Face</span>
                  </button>
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="py-2 px-3 rounded-lg bg-navy-800 hover:bg-navy-750 text-slate-300 text-xs font-bold border border-navy-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={startCamera}
                    className="flex-1 py-2 rounded-lg bg-navy-850 hover:bg-navy-800 text-slate-200 border border-navy-700 text-xs font-bold flex items-center justify-center space-x-1.5 cursor-pointer transition-colors"
                  >
                    <Camera className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Live WebCam Scan</span>
                  </button>
                  <label className="flex-1 py-2 rounded-lg bg-navy-850 hover:bg-navy-800 text-slate-200 border border-navy-700 text-xs font-bold flex items-center justify-center space-x-1.5 cursor-pointer transition-colors">
                    <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Upload Face Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFaceUpload}
                      className="hidden"
                    />
                  </label>
                </>
              )}
            </div>
          </div>

          {/* Launch AI Screening Pipeline Button */}
          <div className="pt-2">
            <button
              onClick={handleSubmit}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-sm tracking-wider shadow-xl shadow-cyan-500/25 transition-all flex items-center justify-center space-x-2 cursor-pointer active:scale-95"
            >
              <Play className="w-5 h-5 fill-slate-950" />
              <span>RUN AI SCREENING PIPELINE</span>
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
