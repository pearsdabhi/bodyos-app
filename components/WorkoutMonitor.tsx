
import React, { useRef, useEffect, useState } from 'react';
import { ScanEye, Loader2, Sparkles, Zap, Activity, Target, Video, Info } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";

const calculateAngle = (P1: any, P2: any, P3: any) => {
  if (!P1 || !P2 || !P3) return 0;
  const radians = Math.atan2(P3.y - P2.y, P3.x - P2.x) - 
                  Math.atan2(P1.y - P2.y, P1.x - P2.x);
  let angle = Math.abs((radians * 180.0) / Math.PI);
  if (angle > 180.0) angle = 360 - angle;
  return Math.round(angle);
};

const WorkoutMonitor: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isActive, setIsActive] = useState(false);
  const [currentAngle, setCurrentAngle] = useState<number>(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<{ score: number; cue: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isActive) return;

    // @ts-ignore
    if (typeof window.Pose === 'undefined' || typeof window.Camera === 'undefined') {
      setError("Vision libraries failed to initialize. Please check your connection.");
      return;
    }

    // @ts-ignore
    const pose = new window.Pose({
      locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
    });

    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    pose.onResults((results: any) => {
      if (!canvasRef.current) return;
      const canvasCtx = canvasRef.current.getContext('2d');
      if (!canvasCtx) return;

      canvasCtx.save();
      canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      
      canvasCtx.scale(-1, 1);
      canvasCtx.translate(-canvasRef.current.width, 0);

      if (results.poseLandmarks) {
        // @ts-ignore
        window.drawConnectors(canvasCtx, results.poseLandmarks, window.POSE_CONNECTIONS,
          { color: '#22d3ee', lineWidth: 4 });
        // @ts-ignore
        window.drawLandmarks(canvasCtx, results.poseLandmarks,
          { color: '#f43f5e', lineWidth: 2, radius: 4 });

        const hip = results.poseLandmarks[24];
        const knee = results.poseLandmarks[26];
        const ankle = results.poseLandmarks[28];
        if (hip && knee && ankle) {
          const angle = calculateAngle(hip, knee, ankle);
          setCurrentAngle(angle);
        }
      }
      canvasCtx.restore();
    });

    // @ts-ignore
    const camera = new window.Camera(videoRef.current, {
      onFrame: async () => {
        if (videoRef.current) await pose.send({ image: videoRef.current });
      },
      width: 640,
      height: 480
    });
    
    camera.start().catch((err: any) => {
      console.error(err);
      setError("Camera access denied. Enable camera to use Bio-Monitor.");
      setIsActive(false);
    });

    return () => {
      camera.stop();
    };
  }, [isActive]);

  const processFrame = async () => {
    if (!videoRef.current) return;
    setIsAnalyzing(true);
    setAnalysis(null);

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = 640;
    tempCanvas.height = 480;
    const ctx = tempCanvas.getContext('2d');
    if (ctx) ctx.drawImage(videoRef.current, 0, 0);
    const base64 = tempCanvas.toDataURL('image/jpeg').split(',')[1];

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { inlineData: { data: base64, mimeType: 'image/jpeg' } },
            { text: `As a biomechanical expert, analyze this lifting form. Real-time joint angle at this frame: ${currentAngle}°. Check for stability and spinal neutrality. Provide a Form Score (0-100) and 1 specific correction cue. Return JSON.` }
          ]
        },
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.NUMBER },
              cue: { type: Type.STRING }
            },
            required: ['score', 'cue']
          }
        }
      });

      const result = JSON.parse(response.text || '{}');
      setAnalysis(result);
    } catch (err) {
      console.error(err);
      setError("Analysis timeout. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col h-full group relative transition-all hover:border-emerald-500/20">
      <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20 shadow-inner">
            <Activity size={20} />
          </div>
          <div>
            <h3 className="font-black text-white text-xs uppercase tracking-widest leading-none">Bio-Monitor</h3>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">Vision Engine V3.1</p>
          </div>
        </div>
        {!isActive ? (
          <button 
            onClick={() => setIsActive(true)}
            className="px-5 py-2.5 bg-emerald-500 text-slate-950 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/20 active:scale-95"
          >
            Init Camera
          </button>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[9px] font-black text-emerald-400 uppercase tracking-widest animate-pulse">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Active
          </div>
        )}
      </div>

      <div className="relative flex-1 bg-black overflow-hidden flex items-center justify-center min-h-[300px]">
        {!isActive ? (
          <div className="text-center space-y-4 px-10 transition-all group-hover:scale-105 duration-700">
            <div className="w-20 h-20 bg-slate-900/50 rounded-[2rem] flex items-center justify-center mx-auto text-slate-700 shadow-inner">
               <Video size={40} className="opacity-30" />
            </div>
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">Sensors Offline</p>
          </div>
        ) : (
          <>
            <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover scale-x-[-1] opacity-40 grayscale group-hover:grayscale-0 transition-all duration-1000" playsInline muted />
            <canvas ref={canvasRef} className="relative z-10 w-full h-full object-cover" width={640} height={480} />
            
            <div className="absolute top-6 left-6 z-20 space-y-3">
              <div className="px-5 py-3 bg-slate-950/80 backdrop-blur-md rounded-2xl border border-slate-800 shadow-2xl transition-transform hover:scale-110">
                <p className="text-[9px] font-black text-slate-500 uppercase mb-0.5 tracking-widest">Knee Angle</p>
                <div className="flex items-baseline gap-1">
                  <p className="text-3xl font-black text-white">{currentAngle}</p>
                  <span className="text-xs font-bold text-slate-600">deg</span>
                </div>
              </div>
            </div>

            <div className="absolute bottom-6 inset-x-6 z-20 flex gap-3">
              <button 
                onClick={processFrame}
                disabled={isAnalyzing}
                className={`
                  flex-1 py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl flex items-center justify-center gap-3 transition-all
                  ${isAnalyzing ? 'bg-slate-800 text-slate-500' : 'bg-white text-slate-950 hover:bg-emerald-50 active:scale-95'}
                `}
              >
                {isAnalyzing ? <Loader2 className="animate-spin" size={16} /> : <Zap size={16} className="fill-current" />}
                {isAnalyzing ? 'Synthesizing...' : 'Analyze Biometrics'}
              </button>
            </div>
          </>
        )}
        
        {error && (
          <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 z-30 bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl backdrop-blur-md text-center">
             <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest">{error}</p>
             <button onClick={() => setError(null)} className="mt-2 text-[8px] font-black text-slate-500 uppercase hover:text-white underline">Dismiss</button>
          </div>
        )}
      </div>

      {analysis && (
        <div className="p-8 bg-slate-950 border-t border-slate-800 animate-in slide-in-from-bottom-4 duration-700">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Stability Rating</p>
              <div className="flex items-baseline gap-2">
                 <h4 className={`text-5xl font-black tracking-tighter ${analysis.score > 80 ? 'text-emerald-400' : analysis.score > 60 ? 'text-amber-400' : 'text-rose-400'}`}>
                   {analysis.score}
                 </h4>
                 <span className="text-sm font-bold text-slate-700">/100</span>
              </div>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center text-cyan-400 border border-slate-800 shadow-xl group/score">
              <Target size={28} className="group-hover/score:rotate-45 transition-transform duration-500" />
            </div>
          </div>
          <div className="p-5 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl relative overflow-hidden group/cue">
            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/40" />
            <div className="flex items-center gap-3 mb-2">
               <Info size={14} className="text-emerald-500/50" />
               <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Coaching Alert</p>
            </div>
            <p className="text-xs font-bold text-emerald-100 italic leading-relaxed">
              "{analysis.cue}"
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkoutMonitor;
