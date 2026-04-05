
import React, { useRef, useEffect, useState } from 'react';
import { ScanEye, Loader2, Sparkles, X, Target, Zap } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";

interface FormAnalyzerProps {
  onClose: () => void;
}

const calculateAngle = (P1: any, P2: any, P3: any) => {
  if (!P1 || !P2 || !P3) return 0;
  const radians = Math.atan2(P3.y - P2.y, P3.x - P2.x) - 
                  Math.atan2(P1.y - P2.y, P1.x - P2.x);
  
  let angle = Math.abs((radians * 180.0) / Math.PI);
  
  if (angle > 180.0) {
    angle = 360 - angle;
  }
  
  return Math.round(angle);
};

const FormAnalyzer: React.FC<FormAnalyzerProps> = ({ onClose }) => {
  const webcamRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [formScore, setFormScore] = useState<number | null>(null);
  const [currentAngle, setCurrentAngle] = useState<number>(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [feedback, setFeedback] = useState<string>('');

  useEffect(() => {
    // @ts-ignore
    if (typeof window.Pose === 'undefined' || typeof window.Camera === 'undefined') return;

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

        // Squat Biomechanics: Hip(24), Knee(26), Ankle(28)
        const hip = results.poseLandmarks[24];
        const knee = results.poseLandmarks[26];
        const ankle = results.poseLandmarks[28];
        const angle = calculateAngle(hip, knee, ankle);
        setCurrentAngle(angle);
      }
      canvasCtx.restore();
    });

    // @ts-ignore
    const camera = new window.Camera(webcamRef.current, {
      onFrame: async () => {
        if (webcamRef.current) {
          await pose.send({ image: webcamRef.current });
        }
      },
      width: 640,
      height: 480
    });
    camera.start();

    return () => {
      camera.stop();
    };
  }, []);

  const getFormScore = async () => {
    if (!webcamRef.current) return;
    setIsAnalyzing(true);
    setFeedback('Capturing biomechanical frame...');

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = 640;
    tempCanvas.height = 480;
    tempCanvas.getContext('2d')?.drawImage(webcamRef.current, 0, 0);
    const base64 = tempCanvas.toDataURL('image/jpeg').split(',')[1];

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { inlineData: { data: base64, mimeType: 'image/jpeg' } },
            { text: `Analyze this lift. Real-time knee angle detected: ${currentAngle}°. Provide a Form Score (0-100) and 1 coaching cue. Return JSON.` }
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
      setFormScore(result.score);
      setFeedback(result.cue);
    } catch (err) {
      console.error(err);
      setFeedback('Analysis failed. Check connectivity.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-xl p-4 sm:p-8 animate-in fade-in duration-300">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-[3rem] overflow-hidden shadow-2xl flex flex-col md:flex-row">
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 z-50 p-3 bg-slate-950/50 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-all border border-slate-800"
        >
          <X size={24} />
        </button>

        <div className="relative w-full md:w-3/5 aspect-video bg-black flex items-center justify-center overflow-hidden">
          <video ref={webcamRef} className="absolute inset-0 w-full h-full object-cover scale-x-[-1] opacity-50" playsInline muted />
          <canvas ref={canvasRef} className="relative z-10 w-full h-full object-cover" width={640} height={480} />
          
          <div className="absolute top-8 left-8 z-20 flex flex-col gap-2">
            <div className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-[10px] font-black uppercase tracking-widest animate-pulse flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Live Biometrics
            </div>
            <div className="px-4 py-2 bg-slate-950/80 backdrop-blur-md rounded-2xl border border-slate-800 shadow-xl">
              <p className="text-[9px] font-black text-slate-500 uppercase mb-0.5">Joint Angle</p>
              <p className="text-2xl font-black text-white">{currentAngle}°</p>
            </div>
          </div>
        </div>

        <div className="w-full md:w-2/5 p-10 flex flex-col justify-between border-l border-slate-800">
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-black text-white tracking-tighter flex items-center gap-3">
                Form Vision <ScanEye className="text-cyan-400" />
              </h2>
              <p className="text-slate-500 text-xs mt-2 font-medium">Real-time biomechanical scoring powered by BODYOS.</p>
            </div>

            {formScore !== null && (
              <div className="bg-slate-950/40 border border-slate-800 rounded-[2rem] p-8 text-center animate-in zoom-in duration-500 shadow-inner">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Session Score</p>
                <div className={`text-7xl font-black ${formScore > 80 ? 'text-emerald-400' : formScore > 50 ? 'text-amber-400' : 'text-rose-400'}`}>
                  {formScore}
                </div>
                {feedback && (
                  <div className="mt-6 p-4 bg-cyan-500/10 border border-cyan-500/10 rounded-2xl text-xs font-bold text-cyan-200 italic leading-relaxed">
                    "{feedback}"
                  </div>
                )}
              </div>
            )}

            {!formScore && !isAnalyzing && (
              <div className="text-center py-10 opacity-30">
                <Sparkles size={48} className="mx-auto text-slate-600 mb-2" />
                <p className="text-xs font-black text-slate-500 uppercase">Stand in frame to begin</p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <button 
              onClick={getFormScore}
              disabled={isAnalyzing}
              className={`w-full py-6 rounded-2xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-3
                ${isAnalyzing ? 'bg-slate-800 text-slate-600' : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-xl shadow-emerald-500/20 active:scale-95'}
              `}
            >
              {isAnalyzing ? <Loader2 className="animate-spin" size={24} /> : <Zap size={24} className="fill-current" />}
              {isAnalyzing ? 'Analyzing Rep...' : 'Score My Form'}
            </button>
            <p className="text-[10px] text-slate-600 font-black text-center uppercase tracking-widest">Hold bottom position for 1s</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormAnalyzer;
