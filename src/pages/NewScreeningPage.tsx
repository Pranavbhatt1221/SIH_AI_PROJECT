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
  HelpCircle,
  ShieldCheck,
  Globe
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
      alert('Camera permission not granted or device not found. You can upload a live face photo instead.');
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
      alert('Please upload a physical document image (Passport, National ID, Driving Licence) to begin screening.');
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
    <div className="space-y-6 pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-blue-700 text-xs font-semibold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Inspection Terminal Capture</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Initiate Document & Biometric Screening</h1>
          <p className="text-xs text-slate-500">
            Upload travel document credentials and traveler portrait for automated OCR extraction, database verification, and biometric cross-matching.
          </p>
        </div>
      </div>

      {/* Main Form Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Document Upload (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Document Type Selector */}
          <div className="rounded-xl bg-white border border-slate-200 p-5 space-y-3 shadow-sm">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
              Document Classification
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {['Passport', 'Visa', 'National ID', 'Driving Licence', 'Travel Permit', 'Other'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setDocType(type)}
                  className={`py-2 px-1 text-center rounded-lg text-xs font-semibold transition-all border cursor-pointer ${
                    docType === type
                      ? 'bg-blue-50 border-blue-600 text-blue-900 shadow-sm'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Document Upload Box */}
          <div className="rounded-xl bg-white border border-slate-200 p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                1. Upload Physical Document Image
              </label>
              {docImage && (
                <span className="text-[11px] text-emerald-700 font-semibold flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Document Attached</span>
                </span>
              )}
            </div>

            {/* Drop / Preview Area */}
            <div className="relative border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-6 text-center transition-all bg-slate-50/50 flex flex-col items-center justify-center min-h-[220px]">
              {docImage ? (
                <div className="space-y-3 w-full flex flex-col items-center">
                  <div className="relative rounded-lg overflow-hidden border border-slate-300 max-h-56 shadow-sm">
                    <img
                      src={docImage}
                      alt="Document Preview"
                      className="max-h-56 object-contain rounded"
                    />
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-slate-900/80 text-[10px] text-white font-medium">
                      DOCUMENT SCAN
                    </div>
                  </div>
                  <div className="text-xs text-slate-600 font-medium">
                    {docFileName || 'credential_document.jpg'} {docFileSize ? `• ${docFileSize}` : ''} • {docType}
                  </div>
                  <label className="cursor-pointer text-xs text-blue-700 hover:text-blue-800 hover:underline font-semibold">
                    <span>Upload a Different Document Image</span>
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
                  <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-800">Click or Drag & Drop Document Image</div>
                    <div className="text-xs text-slate-500 mt-0.5">Supports Passports, National IDs, Visas, and Permits (JPEG, PNG)</div>
                  </div>
                  <span className="px-4 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-semibold shadow-sm">
                    Browse Files on Computer
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
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2 text-slate-600">
                <Sliders className="w-4 h-4 text-slate-500" />
                <span>Error Level Analysis Mode:</span>
              </div>
              <select
                value={tamperingPreset}
                onChange={(e) => setTamperingPreset(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-slate-800 text-xs focus:outline-none focus:border-blue-600 shadow-sm"
              >
                <option value="AUTO">AUTO (Automated Forensics)</option>
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
          <div className="rounded-xl bg-white border border-slate-200 p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ScanFace className="w-4 h-4 text-blue-700" />
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  2. Traveler Facial Capture
                </label>
              </div>
              {liveFaceImage && (
                <span className="text-[11px] text-emerald-700 font-semibold flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Face Captured</span>
                </span>
              )}
            </div>

            <p className="text-[11px] text-slate-500">
              Live biometric image is compared against the credential photograph for 1:1 facial verification.
            </p>

            {/* Webcam / Snapshot Viewport */}
            <div className="relative rounded-xl overflow-hidden bg-slate-900 border border-slate-300 aspect-video flex items-center justify-center">
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
                    <div className="w-32 h-44 border-2 border-white/75 rounded-[50%] flex items-center justify-center border-dashed">
                      <div className="text-[10px] text-white font-medium bg-black/60 px-1.5 py-0.5 rounded">
                        ALIGN FACE
                      </div>
                    </div>
                  </div>
                </>
              ) : liveFaceImage ? (
                <div className="relative w-full h-full flex items-center justify-center p-2 bg-slate-100">
                  <img
                    src={liveFaceImage}
                    alt="Traveler Face"
                    className="max-h-full max-w-full object-contain rounded"
                  />
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-slate-900/80 text-[10px] text-white font-medium">
                    PORTRAIT LOADED
                  </div>
                </div>
              ) : (
                <div className="text-center p-4 space-y-2">
                  <User className="w-10 h-10 text-slate-400 mx-auto" />
                  <div className="text-xs text-slate-300">No traveler portrait loaded yet</div>
                  <div className="text-[10px] text-slate-400">Capture live via camera or upload a portrait file</div>
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
                    className="flex-1 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer shadow-sm"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Capture Photo</span>
                  </button>
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="py-2 px-3 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-300 cursor-pointer shadow-sm"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={startCamera}
                    className="flex-1 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-semibold flex items-center justify-center space-x-1.5 cursor-pointer transition-colors shadow-sm"
                  >
                    <Camera className="w-3.5 h-3.5 text-blue-700" />
                    <span>Live Camera Capture</span>
                  </button>
                  <label className="flex-1 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-semibold flex items-center justify-center space-x-1.5 cursor-pointer transition-colors shadow-sm">
                    <ImageIcon className="w-3.5 h-3.5 text-blue-700" />
                    <span>Upload Portrait</span>
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

          {/* Launch Screening Button */}
          <div className="pt-2">
            <button
              onClick={handleSubmit}
              className="w-full py-3.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm tracking-wide shadow-sm hover:shadow transition-all flex items-center justify-center space-x-2 cursor-pointer active:scale-95"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>EXECUTE DOCUMENT VERIFICATION</span>
            </button>
            <p className="text-[11px] text-slate-500 text-center mt-2 font-medium">
              OCR Field Extraction &bull; Central Registry Cross-Check &bull; Biometric Verification
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

