
import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  Scan, 
  Loader2, 
  Zap, 
  Utensils, 
  User, 
  X, 
  Maximize2, 
  ShieldCheck, 
  Sparkles,
  Target,
  Activity,
  Award
} from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
import { analyzeMeal } from '../geminiService';

type ScanMode = 'FOOD' | 'BODY' | 'POSE';

const UniversalScanner: React.FC = () => {
  const [mode, setMode] = useState<ScanMode>('FOOD');
  const [isLive, setIsLive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [results, setResults] = useState<any>(null);
  const [status, setStatus] = useState('');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const poseRef = useRef<any>(null);

  // Initialize MediaPipe Pose if available
  useEffect(() => {
    if ((window as any).Pose) {
      const pose = new (window as any).Pose({
        locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
      });
      pose.setOptions({
        modelComplexity: 1, 
        smoothLandmarks: true, 
        minDetectionConfidence: 0.5, 
        minTrackingConfidence: 0.5
      });
      pose.onResults(onPoseResults);
      poseRef.current = pose;
    }
  }, []);

  const onPoseResults = (results: any) => {
    if (!canvasRef.current || !videoRef.current || mode !== 'POSE') return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (results.poseLandmarks && (window as any).drawConnectors) {
      (window as any).drawConnectors(ctx, results.poseLandmarks, (window as any).POSE_CONNECTIONS, { color: '#22d3ee', lineWidth: 4 });
      (window as any).drawLandmarks(ctx, results.poseLandmarks, { color: '#06b6d4', lineWidth: 2, radius: 3 });
    }
  };

  useEffect(() => {
    if (isLive) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isLive]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment', width: 1280, height: 720 } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          if (mode === 'POSE') requestAnimationFrame(processPoseFrame);
        };
      }
    } catch (err) {
      console.error("Camera access error:", err);
      setIsLive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
    }
  };

  const processPoseFrame = async () => {
    if (!isLive || !videoRef.current || !poseRef.current || mode !== 'POSE') return;
    await poseRef.current.send({ image: videoRef.current });
    requestAnimationFrame(processPoseFrame);
  };

  const captureAndAnalyze = async () => {
    if (!videoRef.current) return;
    setIsLoading(true);
    setResults(null);
    setStatus('Capturing Frame...');

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0);
      const base64 = canvas.toDataURL('image/jpeg');
      setCapturedImage(base64);
      setIsLive(false);

      try {
        const rawBase64 = base64.split(',')[1];
        if (mode === 'FOOD') {
          setStatus('Identifying Macros...');
          const res = await analyzeMeal(rawBase64);
          setResults(res);
        } else if (mode === 'BODY') {
          setStatus('Auditing Physique...');
          const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
          const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: {
              parts: [
                { inlineData: { data: rawBase64, mimeType: 'image/jpeg' } },
                { text: `As a professional bodybuilding judge and kinesiologist, analyze this physique scan. Provide an objective body fat estimate, muscle symmetry scores (1-10) for major groups, posture notes, and specific anatomical weak points. Return JSON.` }
              ]
            },
            config: {
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  body_fat: { type: Type.STRING },
                  symmetry: {
                    type: Type.OBJECT,
                    properties: {
                      shoulders: { type: Type.NUMBER },
                      arms: { type: Type.NUMBER },
                      legs: { type: Type.NUMBER },
                      back: { type: Type.NUMBER }
                    }
                  },
                  posture: { type: Type.STRING },
                  weak_points: { type: Type.ARRAY, items: { type: Type.STRING } },
                  grade: { type: Type.STRING }
                },
                required: ['body_fat', 'symmetry', 'posture', 'weak_points', 'grade']
              }
            }
          });
          setResults(JSON.parse(response.text || '{}'));
        }
      } catch (err) {
        console.error("Analysis Error:", err);
        setStatus('Analysis Failed');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const reset = () => {
    setCapturedImage(null);
    setResults(null);
    setIsLive(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 max-w-7xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 px-2">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter flex items-center gap-3 italic">
            NEXUS VISION <Scan className="text-emerald-400" />
          </h1>
          <p className="text-slate-400 mt-1 font-medium">Unified Multimodal Scanner v3.0</p>
        </div>
        
        <div className="flex bg-slate-900 border border-slate-800 p-1.5 rounded-2xl">
          {(['FOOD', 'BODY', 'POSE'] as ScanMode[]).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); reset(); }}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === m ? 'bg-emerald-500 text-slate-950 shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* VIEWPORT SECTION */}
        <div className="lg:col-span-7">
          <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-4 shadow-2xl relative overflow-hidden aspect-[4/3] flex items-center justify-center">
            {!isLive && !capturedImage && (
              <div className="text-center space-y-6 opacity-30">
                <div className="w-24 h-24 bg-slate-950 border border-slate-800 rounded-[2.5rem] flex items-center justify-center mx-auto">
                   <Camera size={48} className="text-slate-700" />
                </div>
                <button 
                  onClick={() => setIsLive(true)}
                  className="px-8 py-4 bg-emerald-500 text-slate-950 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
                >
                  Wake Sensors
                </button>
              </div>
            )}

            {isLive && (
              <div className="w-full h-full relative rounded-[2rem] overflow-hidden">
                <video ref={videoRef} className="w-full h-full object-cover grayscale brightness-75" playsInline muted />
                <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" width={1280} height={720} />
                
                {/* HUD Overlays */}
                <div className="absolute inset-8 border border-emerald-500/20 rounded-[2rem] flex items-center justify-center pointer-events-none">
                  <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-emerald-500 rounded-tl-xl shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                  <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-emerald-500 rounded-tr-xl shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                  <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-emerald-500 rounded-bl-xl shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                  <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-emerald-500 rounded-br-xl shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                  
                  {mode !== 'POSE' && <div className="w-full h-0.5 bg-emerald-500/40 absolute animate-[scan_2s_infinite]" />}
                </div>

                <div className="absolute top-8 left-8 flex items-center gap-3">
                   <div className="px-4 py-2 bg-slate-950/80 backdrop-blur-md rounded-full border border-slate-800 text-[9px] font-black text-emerald-400 uppercase tracking-widest animate-pulse flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full bg-emerald-500" />
                     {mode} VISION ACTIVE
                   </div>
                </div>

                <div className="absolute bottom-10 inset-x-0 flex justify-center">
                   <button 
                     onClick={captureAndAnalyze}
                     className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(255,255,255,0.3)] active:scale-90 transition-transform group"
                   >
                      <div className="w-16 h-16 border-4 border-slate-950 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Zap className="text-slate-950 fill-current" size={32} />
                      </div>
                   </button>
                </div>
              </div>
            )}

            {capturedImage && (
              <div className="w-full h-full relative rounded-[2rem] overflow-hidden animate-in zoom-in duration-500">
                <img src={capturedImage} className="w-full h-full object-cover grayscale opacity-60" alt="Captured" />
                {isLoading && (
                  <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm flex flex-col items-center justify-center text-center space-y-4">
                    <Loader2 className="animate-spin text-emerald-500" size={48} />
                    <p className="text-sm font-black text-white uppercase tracking-widest animate-pulse">{status}</p>
                  </div>
                )}
                <button 
                  onClick={reset}
                  className="absolute top-8 right-8 w-12 h-12 bg-slate-950/80 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-slate-800 hover:bg-slate-800 transition-all"
                >
                  <X size={24} />
                </button>
              </div>
            )}
          </div>
          
          <style>{`
            @keyframes scan {
              0% { top: 0; }
              50% { top: 100%; }
              100% { top: 0; }
            }
          `}</style>
        </div>

        {/* RESULTS SECTION */}
        <div className="lg:col-span-5">
           {!results && !isLoading && (
             <div className="h-full bg-slate-900 border border-slate-800 rounded-[3rem] p-10 flex flex-col items-center justify-center text-center space-y-6 border-dashed border-2 opacity-50">
                <div className="w-20 h-20 bg-slate-950 border border-slate-800 rounded-[2.5rem] flex items-center justify-center text-slate-700">
                   <Target size={32} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-black text-white uppercase tracking-tighter italic">Analysis Standby</h3>
                  <p className="text-xs text-slate-500 font-medium px-10 leading-relaxed uppercase tracking-widest">
                    Capture a frame to initialize the {mode.toLowerCase()} logic engine for deep biometric auditing.
                  </p>
                </div>
             </div>
           )}

           {results && mode === 'FOOD' && (
             <div className="animate-in slide-in-from-right-8 duration-500 space-y-6">
                <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[80px]" />
                  <h2 className="text-3xl font-black text-white tracking-tighter mb-10 italic uppercase border-b border-slate-800 pb-4">{results.meal_name}</h2>
                  
                  <div className="space-y-8">
                    <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-6 flex justify-between items-center">
                       <div>
                         <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Energy Density</p>
                         <p className="text-4xl font-black text-white">{results.total_kcal} <span className="text-xl opacity-40">kcal</span></p>
                       </div>
                       <Sparkles className="text-emerald-500/20" size={40} />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { label: 'PRO', val: results.macros.protein, color: 'text-rose-400', bg: 'bg-rose-500/5' },
                        { label: 'CAR', val: results.macros.carbs, color: 'text-amber-400', bg: 'bg-amber-500/5' },
                        { label: 'FAT', val: results.macros.fat, color: 'text-cyan-400', bg: 'bg-cyan-500/5' },
                      ].map(m => (
                        <div key={m.label} className={`${m.bg} p-5 rounded-2xl border border-white/5 text-center`}>
                          <p className="text-[9px] font-black text-slate-500 uppercase mb-1">{m.label}</p>
                          <p className={`text-xl font-black ${m.color}`}>{m.val}g</p>
                        </div>
                      ))}
                    </div>

                    <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl">
                      <p className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Award size={14} /> Recovery Insight
                      </p>
                      <p className="text-xs text-slate-300 font-medium italic leading-relaxed">"{results.recovery_insight}"</p>
                    </div>
                  </div>
                </div>
                <button onClick={reset} className="w-full py-5 bg-emerald-500 text-slate-950 font-black rounded-2xl uppercase tracking-widest shadow-xl active:scale-95 transition-all">Clear & Scan Next</button>
             </div>
           )}

           {results && mode === 'BODY' && (
             <div className="animate-in slide-in-from-right-8 duration-500 space-y-6">
                <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden">
                   <div className="flex justify-between items-start mb-10">
                      <div>
                        <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Anatomical Audit</p>
                        <h2 className="text-3xl font-black text-white italic tracking-tighter">ELITE {results.grade}</h2>
                      </div>
                      <div className="px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-center">
                        <p className="text-[9px] font-black text-slate-500 uppercase mb-0.5">EST. BF%</p>
                        <p className="text-2xl font-black text-white leading-none">{results.body_fat}</p>
                      </div>
                   </div>

                   <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        {Object.entries(results.symmetry).map(([key, val]: any) => (
                          <div key={key} className="bg-slate-950/50 border border-slate-800 p-4 rounded-2xl flex justify-between items-center">
                             <span className="text-[9px] font-black text-slate-500 uppercase">{key}</span>
                             <span className="text-lg font-black text-emerald-400">{val}/10</span>
                          </div>
                        ))}
                      </div>

                      <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl">
                         <h4 className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                           <ShieldCheck size={14} /> Critical Weak Points
                         </h4>
                         <div className="flex flex-wrap gap-2">
                           {results.weak_points.map((p: string) => (
                             <span key={p} className="px-3 py-1 bg-amber-500/10 text-amber-500 text-[9px] font-black uppercase rounded-lg border border-amber-500/10">{p}</span>
                           ))}
                         </div>
                      </div>

                      <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl">
                         <h4 className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                           <Activity size={14} /> Posture Audit
                         </h4>
                         <p className="text-xs text-slate-400 leading-relaxed font-medium">"{results.posture}"</p>
                      </div>
                   </div>
                </div>
                <button onClick={reset} className="w-full py-5 bg-cyan-500 text-slate-950 font-black rounded-2xl uppercase tracking-widest shadow-xl active:scale-95 transition-all">Reset Scanner</button>
             </div>
           )}

           {mode === 'POSE' && (
             <div className="h-full bg-slate-900 border border-slate-800 rounded-[3rem] p-10 flex flex-col items-center justify-center text-center space-y-6">
                <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-[2.5rem] flex items-center justify-center text-emerald-400 animate-pulse">
                   <Activity size={32} />
                </div>
                <div className="space-y-4">
                  <h3 className="text-xl font-black text-white italic tracking-tighter uppercase">Neural Joint Tracking</h3>
                  <p className="text-xs text-slate-500 font-medium px-6 leading-relaxed uppercase tracking-widest">
                    Live MediaPipe Pose Engine active. Tracking 33 key joints at 30fps for biomechanical audit.
                  </p>
                </div>
                <div className="pt-6 grid grid-cols-2 gap-4 w-full">
                  <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl">
                    <p className="text-[9px] font-black text-slate-600 uppercase mb-1">Latency</p>
                    <p className="text-xl font-black text-emerald-400">12ms</p>
                  </div>
                  <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl">
                    <p className="text-[9px] font-black text-slate-600 uppercase mb-1">Confidence</p>
                    <p className="text-xl font-black text-emerald-400">98%</p>
                  </div>
                </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default UniversalScanner;
