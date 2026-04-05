
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, MicOff, Video, VideoOff, Power, Loader2, Sparkles, MessageSquare } from 'lucide-react';
import { GoogleGenAI, Modality } from '@google/genai';
import { encode, decode, decodeAudioData } from '../geminiService';

const LiveSession: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [status, setStatus] = useState<'idle' | 'connecting' | 'active'>('idle');
  const [transcription, setTranscription] = useState<string[]>([]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const frameIntervalRef = useRef<number | null>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const startStream = async () => {
    setStatus('connecting');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true, 
        video: isVideoOn 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // Initialize GoogleGenAI using process.env.API_KEY directly
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const outputNode = audioContextRef.current.createGain();
      outputNode.connect(audioContextRef.current.destination);

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setStatus('active');
            setIsActive(true);
            
            // Stream audio from the microphone to the model
            const source = inputAudioContextRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              if (isMuted) return;
              const inputData = e.inputBuffer.getChannelData(0);
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) int16[i] = inputData[i] * 32768;
              const pcmBlob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };
              // Ensure session is connected before sending
              sessionPromise.then(s => s.sendRealtimeInput({ media: pcmBlob }));
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContextRef.current!.destination);

            // Stream video frames to the model
            if (isVideoOn) {
              frameIntervalRef.current = window.setInterval(() => {
                if (!videoRef.current || !canvasRef.current) return;
                const ctx = canvasRef.current.getContext('2d');
                if (!ctx) return;
                canvasRef.current.width = videoRef.current.videoWidth || 640;
                canvasRef.current.height = videoRef.current.videoHeight || 480;
                ctx.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
                canvasRef.current.toBlob((blob) => {
                  if (blob) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      const base64 = (reader.result as string).split(',')[1];
                      // Use session promise to prevent race conditions
                      sessionPromise.then(s => s.sendRealtimeInput({ media: { data: base64, mimeType: 'image/jpeg' } }));
                    };
                    reader.readAsDataURL(blob);
                  }
                }, 'image/jpeg', 0.6);
              }, 1000); // 1 FPS for efficient visual context
            }
          },
          onmessage: async (message) => {
            if (message.serverContent?.outputTranscription) {
              setTranscription(prev => [...prev, `BODYOS: ${message.serverContent?.outputTranscription?.text}`].slice(-5));
            }
            if (message.serverContent?.inputTranscription) {
               setTranscription(prev => [...prev, `You: ${message.serverContent?.inputTranscription?.text}`].slice(-5));
            }

            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio && audioContextRef.current) {
              const ctx = audioContextRef.current;
              // Maintain smooth playback with a running nextStartTime
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              const buffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = buffer;
              source.connect(outputNode);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
              source.onended = () => sourcesRef.current.delete(source);
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onclose: () => stopStream(),
          onerror: (e) => console.error("Live Error:", e)
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
          systemInstruction: 'You are BODYOS Live, a multimodal real-time expert. Engage naturally with the user using vision and voice.',
          outputAudioTranscription: {},
          inputAudioTranscription: {}
        }
      });
      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error(err);
      setStatus('idle');
    }
  };

  const stopStream = () => {
    if (sessionRef.current) sessionRef.current.close();
    if (frameIntervalRef.current) clearInterval(frameIntervalRef.current);
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
    }
    setIsActive(false);
    setStatus('idle');
    setTranscription([]);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            Live Multimodal <div className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 text-xs">BETA</div>
          </h1>
          <p className="text-slate-400 mt-1">Real-time voice and vision interaction powered by BODYOS.</p>
        </div>
        <button 
          onClick={isActive ? stopStream : startStream}
          className={`
            px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all
            ${isActive 
              ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/20' 
              : 'bg-cyan-500 hover:bg-cyan-600 text-white shadow-lg shadow-cyan-500/20'
            }
          `}
        >
          {status === 'connecting' ? <Loader2 className="animate-spin" size={20} /> : <Power size={20} />}
          {isActive ? 'End Session' : status === 'connecting' ? 'Connecting...' : 'Start Session'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="relative aspect-video bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl group">
            {!isActive && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 bg-slate-950/50 backdrop-blur-sm z-10">
                <Sparkles size={48} className="mb-4 opacity-20" />
                <p className="text-sm font-medium">Session Inactive</p>
              </div>
            )}
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className={`w-full h-full object-cover transition-opacity duration-500 ${isVideoOn ? 'opacity-100' : 'opacity-0'}`} 
            />
            <canvas ref={canvasRef} className="hidden" />
            
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-slate-950/80 backdrop-blur-md px-6 py-3 rounded-2xl border border-slate-800 shadow-xl z-20">
              <button 
                onClick={() => setIsMuted(!isMuted)}
                className={`p-3 rounded-xl transition-colors ${isMuted ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-800 text-white hover:bg-slate-700'}`}
              >
                {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
              </button>
              <button 
                onClick={() => setIsVideoOn(!isVideoOn)}
                className={`p-3 rounded-xl transition-colors ${!isVideoOn ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-800 text-white hover:bg-slate-700'}`}
              >
                {!isVideoOn ? <VideoOff size={20} /> : <Video size={20} />}
              </button>
            </div>
            
            {isActive && (
              <div className="absolute top-6 left-6 flex items-center gap-2 bg-green-500/20 text-green-400 px-3 py-1.5 rounded-full border border-green-500/20 text-xs font-bold animate-pulse">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                LIVE
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex-1 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <MessageSquare size={14} /> Real-time Feed
            </h3>
            <div className="flex-1 space-y-4 overflow-y-auto pr-2">
              {transcription.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-600 text-center px-4">
                  <p className="text-xs">Transcriptions will appear here as you speak.</p>
                </div>
              ) : (
                transcription.map((t, i) => (
                  <div key={i} className={`p-3 rounded-xl text-sm ${t.startsWith('BODYOS:') ? 'bg-cyan-500/10 text-cyan-200 border border-cyan-500/10' : 'bg-slate-800 text-slate-300'}`}>
                    {t}
                  </div>
                ))
              )}
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-violet-600/20 to-cyan-500/20 border border-violet-500/20 rounded-3xl p-6">
            <h4 className="font-bold text-white mb-2 text-sm">Visual Interaction</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Show objects, documents, or your environment to BODYOS. It analyzes video frames in real-time alongside your voice.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveSession;
