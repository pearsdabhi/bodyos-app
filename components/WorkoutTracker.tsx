
import React, { useState, useEffect } from 'react';
import { 
  Flame, 
  Check, 
  Timer, 
  ShieldCheck, 
  Loader2, 
  Plus, 
  Pause, 
  Layers, 
  Ghost, 
  BrainCircuit,
  Zap,
  X,
  Navigation,
  Dumbbell,
  Target
} from 'lucide-react';
import { WorkoutSession, SessionExercise, SetLog, WorkoutItem, Superset } from '../types';
import { db, isFirebaseConfigured } from '../firebase-config';
import { collection, query, orderBy, limit, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const WorkoutTracker: React.FC = () => {
  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [restTime, setRestTime] = useState(0);
  const [isRestActive, setIsRestActive] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'info' | 'success' } | null>(null);

  useEffect(() => {
    const fetchSession = async () => {
      setIsLoading(true);
      if (!isFirebaseConfigured) {
        const stored = localStorage.getItem('bodyos_virtual_sessions');
        const virtual: WorkoutSession[] = stored ? JSON.parse(stored) : [];
        const latest = virtual.filter(s => !s.is_tracked).sort((a, b) => b.createdAt - a.createdAt)[0];
        setSession(latest || null);
      } else {
        try {
          const sessionsCol = collection(db, 'user_sessions');
          const q = query(sessionsCol, orderBy('createdAt', 'desc'), limit(1));
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) setSession(querySnapshot.docs[0].data() as WorkoutSession);
        } catch (error) { console.error(error); }
      }
      setIsLoading(false);
    };
    fetchSession();
  }, []);

  useEffect(() => {
    let interval: number;
    if (isRestActive && restTime > 0) {
      interval = window.setInterval(() => setRestTime(prev => prev - 1), 1000);
    } else if (restTime === 0 && isRestActive) {
      if ('vibrate' in navigator) navigator.vibrate(500);
      setIsRestActive(false);
    }
    return () => clearInterval(interval);
  }, [isRestActive, restTime]);

  const showToast = (message: string, type: 'info' | 'success' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleToggleSetComplete = (itemIndex: number, setIndex: number, exerciseIndex?: number) => {
    if (!session) return;
    const newItems = [...session.items];
    const item = newItems[itemIndex];

    if (item.type === 'EXERCISE') {
      const set = item.sets[setIndex];
      set.completed = !set.completed;
      if (set.completed && !item.timer_suppressed) {
        setRestTime(item.restTimer);
        setIsRestActive(true);
      }
    } else {
      const exercise = item.exercises[exerciseIndex!];
      const set = exercise.sets[setIndex];
      set.completed = !set.completed;
      const isLastInSuperset = exerciseIndex === item.exercises.length - 1;
      if (set.completed) {
        if (!isLastInSuperset) {
          showToast("Go to paired exercise!");
        } else {
          const allDone = item.exercises.every(ex => ex.sets[setIndex]?.completed);
          if (allDone) {
            setRestTime(item.restAfterGroup);
            setIsRestActive(true);
            showToast("Superset complete!", "success");
          }
        }
      }
    }
    setSession({ ...session, items: newItems });
  };

  const updateSetValues = (itemIndex: number, setIndex: number, field: keyof SetLog, value: any, exIdx?: number) => {
    if (!session) return;
    const newItems = [...session.items];
    const item = newItems[itemIndex];
    const targetSet = item.type === 'EXERCISE' ? item.sets[setIndex] : item.exercises[exIdx!].sets[setIndex];
    (targetSet as any)[field] = field === 'completed' ? value : Number(value);
    setSession({ ...session, items: newItems });
  };

  const renderExerciseSets = (itemIndex: number, exercise: SessionExercise, exIdx?: number, isSuperset: boolean = false) => (
    <div className="space-y-4">
      <div className="grid grid-cols-12 gap-4 px-6 text-[9px] font-black text-slate-600 uppercase tracking-[0.3em]">
        <div className="col-span-1">Set</div>
        <div className="col-span-4">Target Load</div>
        <div className="col-span-4">Reps</div>
        <div className="col-span-3 text-center">Status</div>
      </div>
      {exercise.sets.map((set, setIdx) => (
        <div key={setIdx} className={`grid grid-cols-12 gap-4 items-center p-5 rounded-[2rem] transition-all bg-slate-900 border ${set.completed ? 'border-emerald-500/30' : 'border-slate-800 shadow-[4px_4px_8px_#01030a,-4px_-4px_8px_#03091e]'}`}>
          <div className="col-span-1 text-center font-black text-slate-700 italic">{setIdx + 1}</div>
          <div className="col-span-4 relative group">
            <input 
              type="number"
              placeholder={set.ghost_weight ? `${set.ghost_weight}kg` : '0'}
              value={exercise.recording_type === 'time' ? (set.time_seconds || '') : exercise.recording_type === 'distance' ? (set.distance_km || '') : (set.weight || '')}
              onChange={(e) => updateSetValues(itemIndex, setIdx, exercise.recording_type === 'time' ? 'time_seconds' : exercise.recording_type === 'distance' ? 'distance_km' : 'weight', e.target.value, exIdx)}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 px-4 text-sm text-white font-black text-center outline-none focus:border-cyan-500/50 transition-all placeholder:text-slate-800"
            />
            {set.ghost_weight && !set.weight && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none flex items-center gap-1.5 opacity-40">
                <Ghost size={12} className="text-cyan-400" />
                <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">{set.ghost_weight}kg</span>
              </div>
            )}
          </div>
          <div className="col-span-4 relative">
             <input 
                type="number" 
                placeholder={set.ghost_reps ? `${set.ghost_reps}` : '10'}
                value={set.reps || ''} 
                onChange={(e) => updateSetValues(itemIndex, setIdx, 'reps', e.target.value, exIdx)}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 px-4 text-sm text-white font-black text-center outline-none focus:border-cyan-500/50 transition-all placeholder:text-slate-800"
              />
              {set.ghost_reps && !set.reps && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none flex items-center gap-1.5 opacity-40">
                <Ghost size={12} className="text-cyan-400" />
                <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">{set.ghost_reps}</span>
              </div>
            )}
          </div>
          <div className="col-span-3 flex justify-center">
            <button 
              onClick={() => handleToggleSetComplete(itemIndex, setIdx, exIdx)}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all border-2 ${set.completed ? 'bg-emerald-500 border-emerald-400 text-slate-950 shadow-[0_0_20px_#10b98144]' : 'bg-slate-950 border-slate-800 text-slate-800 hover:text-cyan-400'}`}
            >
              <Check size={24} strokeWidth={3} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  if (isLoading) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-cyan-400" size={40} /></div>;
  if (!session) return <div className="p-20 text-center text-slate-500 uppercase font-black tracking-[0.3em] flex flex-col items-center gap-6"><BrainCircuit size={64} className="opacity-10 animate-pulse" /> Nexus Logic Standby</div>;

  return (
    <div className="space-y-10 pb-32 max-w-5xl mx-auto px-4 relative">
      {toast && (
        <div className="fixed top-24 inset-x-4 z-[100] flex justify-center animate-in slide-in-from-top-4">
          <div className={`px-8 py-5 rounded-[2.5rem] shadow-2xl border-4 flex items-center gap-4 backdrop-blur-2xl ${toast.type === 'success' ? 'bg-emerald-500/90 border-slate-950 text-slate-950 font-black uppercase italic tracking-tighter' : 'bg-cyan-500/90 border-slate-950 text-slate-950 font-black uppercase italic tracking-tighter'}`}>
            <Zap size={24} className="fill-current" />
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* SESSION HEADER - NEUMORPHIC */}
      <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-10 shadow-[12px_12px_24px_#01030a,-12px_-12px_24px_#03091e] flex justify-between items-center relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-[80px]" />
        <div className="relative z-10">
          <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none mb-3">{session.title}</h2>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-xl">
              <Ghost size={12} className="text-cyan-400" />
              <p className="text-[10px] text-cyan-400 font-black uppercase tracking-widest">Ghost Engine Active</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-slate-950 border border-slate-800 rounded-xl">
              <BrainCircuit size={12} className="text-slate-600" />
              <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest">Logic v2.5</p>
            </div>
          </div>
        </div>
        <div className="w-16 h-16 bg-slate-950 rounded-[2rem] border border-slate-800 flex items-center justify-center text-cyan-500 shadow-inner group-hover:scale-110 transition-transform duration-500">
          <ShieldCheck size={32} />
        </div>
      </div>

      {isRestActive && (
        <div className="fixed bottom-28 right-8 z-50 animate-in slide-in-from-bottom-10">
          <div className="bg-cyan-500 text-slate-950 px-10 py-6 rounded-[3rem] shadow-2xl flex items-center justify-between gap-10 border-8 border-slate-950 min-w-[320px] scale-110 origin-bottom-right">
            <div className="flex items-center gap-4">
              <Timer size={32} className="animate-spin duration-1000" />
              <p className="text-4xl font-black font-mono tracking-tighter">{restTime}s</p>
            </div>
            <button onClick={() => setIsRestActive(false)} className="bg-slate-950 text-white p-4 rounded-full shadow-lg active:scale-90 transition-transform">
              <Pause size={24} fill="currentColor" />
            </button>
          </div>
        </div>
      )}

      <div className="space-y-12">
        {session.items.map((item, idx) => (
          <div key={idx} className={`p-8 rounded-[3.5rem] shadow-[8px_8px_16px_#01030a,-8px_-8px_16px_#03091e] ${item.type === 'SUPERSET' ? 'bg-gradient-to-br from-violet-600/10 to-slate-900 border-2 border-violet-500/30' : 'bg-slate-900 border border-slate-800'}`}>
            {item.type === 'EXERCISE' ? (
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-950 rounded-2xl flex items-center justify-center text-cyan-400 shadow-inner border border-slate-800">
                      {item.recording_type === 'weight_reps' ? <Dumbbell size={24}/> : <Target size={24}/>}
                    </div>
                    <h3 className="text-2xl font-black text-white tracking-tighter uppercase italic">{item.name}</h3>
                  </div>
                </div>
                {renderExerciseSets(idx, item)}
              </div>
            ) : (
              <div className="space-y-10">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-violet-600 text-slate-950 rounded-3xl flex items-center justify-center shadow-xl shadow-violet-600/20"><Layers size={28} /></div>
                  <div>
                    <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase leading-none">Superset Matrix</h3>
                    <p className="text-[10px] text-violet-400 font-black uppercase tracking-[0.2em] mt-2">Active Linked Progression</p>
                  </div>
                </div>
                <div className="space-y-12 pl-6 border-l-2 border-violet-500/20 ml-2">
                  {item.exercises.map((ex, exIdx) => (
                    <div key={exIdx} className="space-y-6">
                       <h4 className="text-lg font-black text-slate-200 tracking-tight uppercase italic flex items-center gap-3">
                         <div className="w-2 h-2 rounded-full bg-violet-500 shadow-[0_0_8px_#8b5cf6]" /> {ex.name}
                       </h4>
                       {renderExerciseSets(idx, ex, exIdx, true)}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <button className="w-full py-8 mt-12 bg-emerald-500 text-slate-950 rounded-[3rem] font-black text-2xl uppercase italic tracking-tighter shadow-[0_0_40px_rgba(16,185,129,0.3)] hover:bg-emerald-400 transition-all flex items-center justify-center gap-4 group active:scale-[0.97] border-4 border-slate-950">
        <Flame size={32} className="fill-current group-hover:scale-125 transition-transform" /> 
        Commit Session to Logic Engine
      </button>
    </div>
  );
};

export default WorkoutTracker;
