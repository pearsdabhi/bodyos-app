
import React, { useState } from 'react';
import { Film, Loader2, Sparkles, Download, Key, RefreshCw, AlertCircle } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

const VideoStudio: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [status, setStatus] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    // Check for API Key
    const hasKey = await (window as any).aistudio.hasSelectedApiKey();
    if (!hasKey) {
      await (window as any).aistudio.openSelectKey();
    }

    setIsGenerating(true);
    setError(null);
    setVideoUrl(null);
    setStatus('Initializing generation engine...');

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt,
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: '16:9'
        }
      });

      setStatus('Processing cinematic frames (this may take 1-2 minutes)...');

      // Polling loop for Veo
      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        try {
          operation = await ai.operations.getVideosOperation({ operation: operation });
        } catch (pollErr: any) {
           if (pollErr.message?.includes("Requested entity was not found")) {
             setError("Project mismatch or session expired. Please re-select your API key.");
             await (window as any).aistudio.openSelectKey();
             throw pollErr;
           }
           throw pollErr;
        }
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (downloadLink) {
        setStatus('Fetching final video file...');
        const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        if (!response.ok) throw new Error("Failed to download video bytes.");
        const blob = await response.blob();
        setVideoUrl(URL.createObjectURL(blob));
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Generation failed. Ensure you have a paid billing account.');
    } finally {
      setIsGenerating(false);
      setStatus('');
    }
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            Cinema Studio <Film className="text-violet-500" />
          </h1>
          <p className="text-slate-400 mt-1">Cinematic BODYOS video generation powered by Google Veo.</p>
        </div>
        <div className="flex gap-4">
          <a 
            href="https://ai.google.dev/gemini-api/docs/billing" 
            target="_blank" 
            className="text-xs text-slate-500 hover:text-cyan-400 underline transition-colors"
          >
            Billing Requirements
          </a>
          <button 
            onClick={async () => await (window as any).aistudio.openSelectKey()}
            className="flex items-center gap-2 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg transition-colors border border-slate-700"
          >
            <Key size={14} /> Change Project
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <label className="text-sm font-bold text-slate-500 uppercase tracking-widest">
                Visual Prompt
              </label>
              <div className="px-2 py-0.5 rounded bg-violet-500/10 text-violet-400 text-[10px] font-bold">16:9 • 720p</div>
            </div>
            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your scene: 'An epic space voyage through a crystalline nebula, neon light trails, ultra-detailed...'"
              className="w-full h-48 bg-slate-800/50 border border-slate-700 rounded-2xl p-4 text-slate-200 focus:outline-none focus:border-violet-500/50 transition-colors resize-none mb-4 placeholder:text-slate-600 font-medium"
            />
            <button 
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className={`
                w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all
                ${isGenerating || !prompt.trim() 
                  ? 'bg-slate-800 text-slate-600 cursor-not-allowed' 
                  : 'bg-gradient-to-tr from-violet-600 to-cyan-600 text-white shadow-lg shadow-violet-500/20 hover:scale-[1.02] active:scale-95'
                }
              `}
            >
              {isGenerating ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
              {isGenerating ? 'Synthesizing...' : 'Generate Cinematic Motion'}
            </button>
          </div>

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl flex items-start gap-3 text-rose-400 text-sm animate-in fade-in slide-in-from-top-2">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <RefreshCw size={14} /> Production Log
            </h3>
            <div className="space-y-2">
              {status ? (
                <div className="flex items-center gap-3 text-cyan-400 font-medium animate-pulse">
                  <div className="w-2 h-2 rounded-full bg-cyan-500" />
                  <p className="text-xs">{status}</p>
                </div>
              ) : (
                <p className="text-xs text-slate-600 italic">Ready for production...</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-4 shadow-2xl flex items-center justify-center min-h-[300px] relative overflow-hidden group">
          {videoUrl ? (
            <div className="w-full h-full space-y-4">
              <video 
                src={videoUrl} 
                controls 
                autoPlay 
                loop 
                className="w-full h-auto rounded-[2rem] shadow-2xl"
              />
              <a 
                href={videoUrl} 
                download="bodyos-render.mp4"
                className="flex items-center justify-center gap-2 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition-all text-sm"
              >
                <Download size={18} /> Download Production File
              </a>
            </div>
          ) : (
            <div className="text-center p-10 space-y-4 opacity-30 group-hover:opacity-50 transition-opacity">
              <Film size={80} className="mx-auto text-slate-600" />
              <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Preview Window</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoStudio;
