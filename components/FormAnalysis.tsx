
import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Camera, 
  Video, 
  ScanEye, 
  Loader2, 
  RotateCcw,
  Maximize2,
  Zap, 
  Upload,
  FileVideo,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  Target,
  Clock,
  Trash2,
  Activity,
  Award,
  History,
  TrendingUp
} from 'lucide-react';
import { analyzeSquatVideo } from '../geminiService';
import { GoogleGenAI, Type } from "@google/genai";

interface VideoAnalysisResult {
  maxDepthTimestamp: string;
  formScore: number;
  flaws: {
    heelLift: boolean;
    spinalRounding: boolean;
    description: string;
  };
  cues: string[];
}

const TabButton: React.FC<{label: string, isActive: boolean, onClick: () => void}> = ({label, isActive, onClick}) => (
  <button
    onClick={onClick}
    className={`py-3 px-1 text-sm font-black transition-all border-b-2 ${
      isActive
        ? 'text-emerald-400 border-emerald-400'
        : 'text-slate-500 border-transparent hover:text-white'
    }`}
  >
    {label}
  </button>
);


const FormAnalysis: React.FC = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.defaultTab || 'form');

  useEffect(() => {
    setActiveTab(location.state?.defaultTab || 'form');
  }, [location.state]);


  // === FORM ANALYSIS STATE & LOGIC ===
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const formFileInputRef = useRef<HTMLInputElement>(null);
  
  const [isLiveActive, setIsLiveActive] = useState(false);
  const [isAnalyzingForm, setIsAnalyzingForm] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<VideoAnalysisResult | null>(null);
  const [videoFile, setVideoFile] = useState<string | null>(null);
  const [videoMimeType, setVideoMimeType] = useState<string>('');
  const poseRef = useRef<any>(null);

  useEffect(() => {
    if (activeTab !== 'form') return;
    if ((window as any).Pose) {
      const pose = new (window as any).Pose({
        locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
      });
      pose.setOptions({
        modelComplexity: 1, smoothLandmarks: true, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5
      });
      pose.onResults(onPoseResults);
      poseRef.current = pose;
    }
  }, [activeTab]);

  const onPoseResults = (results: any) => {
    if (!canvasRef.current || !videoRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (results.poseLandmarks && (window as any).drawConnectors) {
      (window as any).drawConnectors(ctx, results.poseLandmarks, (window as any).POSE_CONNECTIONS, { color: '#22d3ee', lineWidth: 4 });
      (window as any).drawLandmarks(ctx, results.poseLandmarks, { color: '#06b6d4', lineWidth: 2, radius: 3 });
    }
  };

  const startLiveAnalysis = async () => {
    setVideoFile(null);
    setAnalysisResult(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 1280, height: 720, facingMode: 'user' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setIsLiveActive(true);
          requestAnimationFrame(processFrame);
        };
      }
    } catch (err) { console.error("Camera Access Error:", err); }
  };

  const processFrame = async () => {
    if (!isLiveActive || !videoRef.current || !poseRef.current) return;
    await poseRef.current.send({ image: videoRef.current });
    if (isLiveActive) requestAnimationFrame(processFrame);
  };

  const handleFormVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoMimeType(file.type);
      const reader = new FileReader();
      reader.onloadend = () => {
        setVideoFile(reader.result as string);
        setIsLiveActive(false); 
        setAnalysisResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const runVideoAnalysis = async () => {
    if (!videoFile) return;
    setIsAnalyzingForm(true);
    setAnalysisResult(null);
    try {
      const base64 = videoFile.split(',')[1];
      const result = await analyzeSquatVideo(base64, videoMimeType);
      setAnalysisResult(result);
    } catch (err) {
      console.error("Form BODYOS Video Error:", err);
    } finally {
      setIsAnalyzingForm(false);
    }
  };

  // === PHYSIQUE SCAN STATE & LOGIC ===
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [sideImage, setSideImage] = useState<string | null>(null);
  const [isScanningPhysique, setIsScanningPhysique] = useState(false);
  const [physiqueResult, setPhysiqueResult] = useState<any>(null);
  const [gallery, setGallery] = useState([
    { id: '1', date: 'Sep 24', bodyFat: '16.5%', front: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=300' },
  ]);
  const frontInputRef = useRef<HTMLInputElement>(null);
  const sideInputRef = useRef<HTMLInputElement>(null);

  const handlePhysiqueImageUpload = (type: 'front' | 'side', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'front') setFrontImage(reader.result as string);
        else setSideImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzePhysique = async () => {
    if (!frontImage) return;
    setIsScanningPhysique(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { inlineData: { data: frontImage.split(',')[1], mimeType: 'image/jpeg' } },
            { text: `Analyze this progress photo. Return JSON ONLY with keys: "body_fat_est", "muscle_symmetry": {"shoulders": "score 1-10", "arms": "score 1-10"}, "posture_notes", "weak_points": ["list"], "v_taper_ratio": number. Be objective like a professional bodybuilding judge.` }
          ]
        },
        config: { responseMimeType: 'application/json', responseSchema: { type: Type.OBJECT, properties: { body_fat_est: { type: Type.STRING }, muscle_symmetry: { type: Type.OBJECT, properties: { shoulders: { type: Type.STRING }, arms: { type: Type.STRING }}}, posture_notes: { type: Type.STRING }, weak_points: { type: Type.ARRAY, items: { type: Type.STRING }}, v_taper_ratio: { type: Type.NUMBER }}, required: ['body_fat_est', 'muscle_symmetry', 'posture_notes', 'weak_points', 'v_taper_ratio']}}
      });
      setPhysiqueResult(JSON.parse(response.text || '{}'));
    } catch (err) { console.error("Physique BODYOS Error:", err); } 
    finally { setIsScanningPhysique(false); }
  };

  const saveToGallery = () => {
    if (physiqueResult && frontImage) {
      setGallery([{ id: Date.now().toString(), date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit' }), bodyFat: physiqueResult.body_fat_est, front: frontImage }, ...gallery]);
      setPhysiqueResult(null);
      setFrontImage(null);
      setSideImage(null);
    }
  };


  return (
    <div className="space-y-8 pb-20">
      <div className="px-2">
        <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
          Elite Vision Suite <ScanEye className="text-cyan-400" />
        </h1>
        <p className="text-slate-400 mt-1">BODYOS-powered biomechanical and anatomical analysis.</p>

        <div className="mt-8 border-b border-slate-800 flex items-center gap-4">
          <TabButton label="Exercise Form" isActive={activeTab === 'form'} onClick={() => setActiveTab('form')} />
          <TabButton label="Physique Check" isActive={activeTab === 'physique'} onClick={() => setActiveTab('physique')} />
        </div>
      </div>

      {activeTab === 'form' && (
        <div className="animate-in fade-in duration-300">
           <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 px-2 mb-8">
            <p className="text-slate-500 text-sm font-medium">Multi-frame biomechanical video assessment.</p>
            <div className="flex gap-3">
              <input type="file" ref={formFileInputRef} className="hidden" accept="video/*" onChange={handleFormVideoUpload} />
              <button onClick={() => formFileInputRef.current?.click()} className="px-6 py-4 bg-slate-900 border border-slate-800 text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:text-cyan-400 hover:border-cyan-500/30 transition-all flex items-center gap-2">
                <Upload size={16} /> Upload Video
              </button>
              {!isLiveActive ? (
                <button onClick={startLiveAnalysis} className="px-6 py-4 bg-cyan-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-cyan-500/20 hover:scale-105 active:scale-95 transition-all">Live Scan</button>
              ) : (
                <button onClick={() => { setIsLiveActive(false); if (videoRef.current?.srcObject) (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop()); }} className="px-6 py-4 bg-slate-800 text-slate-400 border border-slate-700 rounded-2xl font-black text-xs uppercase tracking-widest hover:text-white transition-all">Stop Live</button>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-4 shadow-2xl relative overflow-hidden group aspect-video flex items-center justify-center">
                {!isLiveActive && !videoFile && (<div className="text-center space-y-4 opacity-20"><Video size={80} className="mx-auto text-slate-600" /><p className="text-sm font-black uppercase tracking-[0.3em]">Select Feed or Upload</p></div>)}
                {videoFile ? (<video src={videoFile} controls className="w-full h-full object-contain rounded-[2.5rem]" />) : (<video ref={videoRef} className={`w-full h-full object-cover rounded-[2.5rem] scale-x-[-1] transition-opacity duration-500 ${isLiveActive ? 'opacity-100' : 'opacity-0'}`} playsInline muted />)}
                <canvas ref={canvasRef} className={`absolute inset-4 pointer-events-none scale-x-[-1] ${videoFile ? 'hidden' : ''}`} width={1280} height={720} />
                {videoFile && !analysisResult && (<div className="absolute bottom-10 inset-x-0 flex justify-center z-20"><button onClick={runVideoAnalysis} disabled={isAnalyzingForm} className="bg-white text-slate-950 px-10 py-5 rounded-[2rem] font-black text-lg shadow-2xl flex items-center gap-3 hover:scale-105 active:scale-95 transition-all group/btn">{isAnalyzingForm ? <Loader2 className="animate-spin" size={24} /> : <Zap size={24} className="fill-current group-hover/btn:animate-pulse" />}{isAnalyzingForm ? 'Analyzing Biomechanics...' : 'Run Video BODYOS Report'}</button></div>)}
                {isLiveActive && (<div className="absolute top-8 right-8 flex items-center gap-2 bg-slate-950/60 backdrop-blur-md px-4 py-2 rounded-full border border-slate-800 text-[10px] font-black text-cyan-400 uppercase tracking-widest animate-pulse"><div className="w-2 h-2 rounded-full bg-cyan-400" />Live Tracking Active</div>)}
              </div>
            </div>
            <div className="lg:col-span-5 space-y-6">
              {isAnalyzingForm && (<div className="h-full flex flex-col items-center justify-center bg-slate-900 border border-slate-800 rounded-[3rem] p-12 text-center animate-pulse"><Loader2 size={48} className="text-cyan-400 animate-spin mb-4" /><h3 className="text-xl font-black text-white">BODYOS Nexus Processing</h3><p className="text-slate-500 text-xs mt-2 uppercase tracking-widest">Identifying key movement frames & musculoskeletal stressors...</p></div>)}
              {analysisResult && (<div className="h-full bg-slate-900 border border-slate-800 rounded-[3rem] p-8 shadow-2xl animate-in slide-in-from-right-8 duration-700 flex flex-col space-y-8 overflow-y-auto max-h-[600px] no-scrollbar"><div className="flex items-center justify-between"><div><h2 className="text-2xl font-black text-white tracking-tighter">Biomechanical Report</h2><p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Anatomical Analysis Complete</p></div><div className={`w-16 h-16 rounded-2xl flex items-center justify-center border-2 text-2xl font-black ${analysisResult.formScore > 80 ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5' : analysisResult.formScore > 50 ? 'border-amber-500/30 text-amber-400 bg-amber-500/5' : 'border-rose-500/30 text-rose-400 bg-rose-500/5'}`}>{analysisResult.formScore}</div></div><div className="grid grid-cols-2 gap-4"><div className="bg-slate-950/50 border border-slate-800 p-5 rounded-3xl"><p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2"><Clock size={12} className="text-cyan-400" /> Max Depth</p><p className="text-2xl font-black text-white">{analysisResult.maxDepthTimestamp}s</p></div><div className="bg-slate-950/50 border border-slate-800 p-5 rounded-3xl"><p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2"><Target size={12} className="text-emerald-400" /> Stability</p><p className="text-2xl font-black text-white">Optimum</p></div></div><div className="space-y-4"><h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">Technical Flaws Detected</h3><div className="flex flex-col gap-2"><div className={`flex items-center justify-between p-4 rounded-2xl border ${analysisResult.flaws.heelLift ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}><div className="flex items-center gap-3">{analysisResult.flaws.heelLift ? <ShieldAlert size={18} /> : <ShieldCheck size={18} />}<span className="text-xs font-bold uppercase tracking-widest">Heel Integrity</span></div><span className="text-[10px] font-black">{analysisResult.flaws.heelLift ? 'FAIL' : 'PASS'}</span></div><div className={`flex items-center justify-between p-4 rounded-2xl border ${analysisResult.flaws.spinalRounding ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}><div className="flex items-center gap-3">{analysisResult.flaws.spinalRounding ? <ShieldAlert size={18} /> : <ShieldCheck size={18} />}<span className="text-xs font-bold uppercase tracking-widest">Lumbar Neutrality</span></div><span className="text-[10px] font-black">{analysisResult.flaws.spinalRounding ? 'FAIL' : 'PASS'}</span></div></div><p className="text-xs text-slate-500 font-medium italic p-4 bg-slate-950 border border-slate-800 rounded-2xl">"{analysisResult.flaws.description}"</p></div><div className="space-y-4 pt-4 border-t border-slate-800"><h3 className="text-xs font-black text-cyan-400 uppercase tracking-widest flex items-center gap-2"><Zap size={14} /> Elite Coaching Cues</h3><div className="space-y-3">{analysisResult.cues.map((cue, idx) => (<div key={idx} className="flex gap-4 group/cue"><div className="w-6 h-6 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-[10px] font-black group-hover/cue:bg-cyan-500 group-hover/cue:text-slate-950 transition-colors shrink-0">{idx + 1}</div><p className="text-sm text-slate-300 font-medium leading-relaxed">{cue}</p></div>))}</div></div><button onClick={() => setAnalysisResult(null)} className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all mt-auto"><RotateCcw size={14} /> Reset Analysis</button></div>)}
              {!isAnalyzingForm && !analysisResult && (<div className="h-full flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-slate-800 rounded-[3rem] bg-slate-900/10 group hover:border-cyan-500/20 transition-all"><div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-slate-700 mb-6 group-hover:text-cyan-400 transition-colors ring-8 ring-slate-800/10"><Maximize2 size={32} /></div><h3 className="text-lg font-black text-slate-400">Viewfinder Standby</h3><p className="text-slate-600 text-[9px] font-bold uppercase tracking-widest mt-2 max-w-[150px] mx-auto leading-relaxed italic">Awaiting video input for high-precision joint tracking and depth assessment.</p></div>)}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'physique' && (
        <div className="animate-in fade-in duration-300">
           <p className="text-slate-500 text-sm font-medium px-2 mb-8">Multimodal judge-level anatomical scan.</p>
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                {['front', 'side'].map((type) => (<div key={type} onClick={() => (type === 'front' ? frontInputRef : sideInputRef).current?.click()} className={`aspect-[3/4] rounded-[2.5rem] border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden relative group shadow-2xl ${(type === 'front' ? frontImage : sideImage) ? 'border-emerald-500/40' : 'border-slate-800 hover:border-emerald-500/30 bg-slate-950/50'}`}>{(type === 'front' ? frontImage : sideImage) ? (<img src={type === 'front' ? frontImage! : sideImage!} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-700" />) : (<div className="text-center p-4"><Camera size={40} className="mx-auto mb-3 text-slate-700 group-hover:text-emerald-500 transition-all" /><p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{type} view</p></div>)}<input type="file" ref={type === 'front' ? frontInputRef : sideInputRef} className="hidden" onChange={(e) => handlePhysiqueImageUpload(type as any, e)} /></div>))}
              </div>
              <button onClick={analyzePhysique} disabled={!frontImage || isScanningPhysique} className={`w-full py-6 rounded-[2rem] font-black flex items-center justify-center gap-3 transition-all text-xl tracking-tight ${!frontImage || isScanningPhysique ? 'bg-slate-800 text-slate-600' : 'bg-emerald-500 text-white shadow-2xl shadow-emerald-500/20 active:scale-95'}`}>{isScanningPhysique ? <Loader2 className="animate-spin" size={28} /> : <Zap size={28} />}{isScanningPhysique ? 'Computing Silhouettes...' : 'Start Global Scan'}</button>
            </div>
            <div className="space-y-6">
              {physiqueResult ? (<div className="animate-in slide-in-from-right-8 duration-500 space-y-6"><div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden"><div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 blur-[100px]" /><div className="grid grid-cols-2 gap-10 mb-10"><div className="space-y-1"><p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Judge Body Fat</p><p className="text-5xl font-black text-white tracking-tighter">{physiqueResult.body_fat_est}</p></div><div className="space-y-1"><p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">V-Taper Ratio</p><p className="text-5xl font-black text-cyan-400 tracking-tighter">{physiqueResult.v_taper_ratio}</p></div></div><div className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-8 mb-8"><h3 className="text-xs font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2 mb-4"><Award size={16} /> Muscle Symmetry</h3><div className="grid grid-cols-2 gap-4"><div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-700/50"><p className="text-[9px] font-bold text-slate-500 uppercase mb-1">Shoulders</p><p className="text-xl font-black text-white">{physiqueResult.muscle_symmetry.shoulders}/10</p></div><div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-700/50"><p className="text-[9px] font-bold text-slate-500 uppercase mb-1">Arms</p><p className="text-xl font-black text-white">{physiqueResult.muscle_symmetry.arms}/10</p></div></div></div><div className="space-y-4 mb-10"><h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Target size={16} className="text-amber-400" /> Improvement Protocol</h3><div className="p-5 bg-slate-900 rounded-2xl border border-slate-800 space-y-2"><p className="text-xs text-slate-300 font-medium">Weak Points:</p><div className="flex flex-wrap gap-2">{physiqueResult.weak_points.map((p: string, i: number) => (<span key={i} className="px-2 py-1 bg-amber-500/10 text-amber-500 text-[10px] font-black uppercase rounded-lg border border-amber-500/20">{p}</span>))}</div><p className="text-xs text-slate-500 mt-4 leading-relaxed italic">"{physiqueResult.posture_notes}"</p></div></div><div className="flex gap-4"><button onClick={saveToGallery} className="flex-1 py-5 bg-emerald-500 text-white font-black rounded-2xl shadow-xl hover:bg-emerald-600 transition-all flex items-center justify-center gap-2"><Award size={20} /> Record Progress</button><button onClick={() => { setPhysiqueResult(null); setFrontImage(null); setSideImage(null); }} className="p-5 bg-slate-800 text-slate-400 rounded-2xl hover:text-rose-400 transition-colors"><Trash2 size={24} /></button></div></div></div>) : (<div className="h-full bg-slate-900/30 border-2 border-dashed border-slate-800 rounded-[3rem] p-12 flex flex-col items-center justify-center text-center"><div className="w-24 h-24 bg-slate-900 rounded-[2.5rem] flex items-center justify-center text-slate-700 mb-8 shadow-inner"><Maximize2 size={48} /></div><h3 className="text-2xl font-black text-slate-300">Biometric Studio Standby</h3><p className="text-sm text-slate-500 mt-3 max-w-xs leading-relaxed font-medium">Upload progress photos to initialize the judge-level musculoskeletal analyzer.</p></div>)}
            </div>
           </div>
           <section className="space-y-8 pt-16 border-t border-slate-900">
             <div className="flex items-center justify-between">
               <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-4">Progression Log <History className="text-slate-700" /></h2>
               <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 rounded-full text-xs font-bold text-slate-500 border border-slate-800"><TrendingUp size={16} className="text-emerald-500" /> Tracking Active</div>
             </div>
             <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
               {gallery.map(item => (<div key={item.id} className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-3 hover:border-emerald-500/30 transition-all group cursor-pointer shadow-xl"><div className="aspect-[3/4] rounded-[2rem] overflow-hidden mb-4 relative"><img src={item.front} className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" /></div><div className="px-3 pb-3 flex items-center justify-between"><div><p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">{item.date}</p><p className="text-xl font-black text-white">{item.bodyFat}</p></div><div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-all"><ChevronRight size={18} /></div></div></div>))}
             </div>
           </section>
        </div>
      )}
    </div>
  );
};

export default FormAnalysis;
