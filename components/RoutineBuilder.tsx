
import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Save, 
  Search, 
  Clock, 
  Wand2, 
  Loader2, 
  Layers, 
  X,
  GripVertical,
  Box,
  Dumbbell,
  Timer,
  Zap,
  Ghost
} from 'lucide-react';
import useExerciseLibrary from '../hooks/useExerciseLibrary';
import { Exercise, RoutineTemplate, WorkoutItem, SessionExercise, Superset, RecordingType } from '../types';
import { isFirebaseConfigured, db } from '../firebase-config';
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const RoutineBuilder: React.FC = () => {
  const [routineName, setRoutineName] = useState('Elite Alpha Protocol');
  const [items, setItems] = useState<WorkoutItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMuscle, setFilterMuscle] = useState('all');
  const [filterEquip, setFilterEquip] = useState('all');
  const [isSaving, setIsSaving] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);
  
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);
  const [activePreview, setActivePreview] = useState<Exercise | null>(null);

  const { exercises: library, loading: loadingLibrary, hasMore, loadMore } = useExerciseLibrary(filterMuscle, filterEquip, searchTerm);

  const sidebarScrollRef = useRef<HTMLDivElement>(null);

  const handleSidebarScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 50 && hasMore && !loadingLibrary) {
      loadMore();
    }
  };

  const createSessionExercise = (ex: Exercise): SessionExercise => {
    // Simulated "Ghost Text" - Fetching from a mock previous session
    const ghostData = { weight: 80, reps: 10 }; // Normally fetched from history
    
    return {
      type: 'EXERCISE',
      exerciseId: `build_${Date.now()}_${ex.id}`,
      db_id: ex.id,
      name: ex.name,
      recording_type: ex.recording_type,
      muscle_tags: ex.muscle_tags,
      sets: Array(3).fill(null).map((_, i) => ({
        id: `set_${Date.now()}_${i}`,
        weight: 0,
        reps: 0,
        ghost_weight: ghostData.weight,
        ghost_reps: ghostData.reps,
        completed: false
      })),
      restTimer: 90,
      timer_suppressed: false
    };
  };

  const addExercise = (ex: Exercise) => {
    setItems(prev => [...prev, createSessionExercise(ex)]);
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.type === 'EXERCISE' ? item.exerciseId !== id : item.id !== id));
  };

  // Advanced Superset logic: suppresses timers between paired items
  const handleSupersetMerge = (data: WorkoutItem[], fromIndex: number, toIndex: number) => {
    const updated = [...data];
    const draggedItem = updated[fromIndex];
    const targetItem = updated[toIndex];
    
    const extract = (item: WorkoutItem) => item.type === 'EXERCISE' ? [item] : item.exercises;
    const merged = [...extract(targetItem), ...extract(draggedItem)];
    
    // Auto-suppress timers for all but the last exercise in the group
    const formatted = merged.map((ex, idx) => ({ 
      ...ex, 
      timer_suppressed: idx < merged.length - 1 
    }));

    updated.splice(fromIndex, 1);
    updated[fromIndex < toIndex ? toIndex - 1 : toIndex] = { 
      id: `group_${Date.now()}`, 
      type: 'SUPERSET', 
      exercises: formatted, 
      restAfterGroup: 90 
    };
    return updated;
  };

  const onDrop = (e: React.DragEvent, toIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== toIndex) {
      setItems(prev => handleSupersetMerge(prev, draggedIndex, toIndex));
    }
    setDraggedIndex(null);
    setDropTargetIndex(null);
  };

  const saveRoutine = async () => {
    if (items.length === 0) return;
    setIsSaving(true);
    const template: RoutineTemplate = { id: `temp_${Date.now()}`, name: routineName, items, createdAt: Date.now() };
    if (!isFirebaseConfigured) {
      const stored = localStorage.getItem('bodyos_templates');
      const all = stored ? JSON.parse(stored) : [];
      all.push(template);
      localStorage.setItem('bodyos_templates', JSON.stringify(all));
      alert("Routine archived in Vault.");
    } else {
      try {
        await addDoc(collection(db, 'user_templates'), template);
        alert("Elite Protocol Handshake complete.");
      } catch (err) { console.error(err); }
    }
    setIsSaving(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
      <div className="lg:col-span-8 space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-8 shadow-[15px_15px_30px_#01030a,-15px_-15px_30px_#03091e] space-y-8 min-h-[600px] relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1">
              <input 
                type="text" 
                value={routineName}
                onChange={(e) => setRoutineName(e.target.value)}
                className="bg-transparent border-none text-3xl font-black text-white focus:outline-none w-full placeholder:text-slate-800 italic uppercase tracking-tighter"
                placeholder="UNNAMED PROTOCOL..."
              />
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Manual Master Architecture v2.0</p>
            </div>
            <button 
              onClick={saveRoutine}
              disabled={isSaving || items.length === 0}
              className="px-8 py-4 bg-emerald-500 text-slate-950 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-emerald-400 active:scale-95 transition-all flex items-center gap-3 disabled:bg-slate-800 disabled:text-slate-600"
            >
              {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
              Commit Protocol
            </button>
          </div>

          <div className="space-y-4">
            {items.length === 0 && (
              <div className="py-24 text-center bg-slate-950/50 border-2 border-dashed border-slate-800 rounded-[2.5rem] opacity-30 flex flex-col items-center">
                <Wand2 size={48} className="mb-4 text-slate-700" />
                <p className="text-xs font-black uppercase tracking-widest">Awaiting movement units</p>
                <p className="text-[9px] text-slate-600 font-bold mt-2 italic">Drag movements together to create Superset Matrices</p>
              </div>
            )}
            
            {items.map((item, idx) => (
              <div 
                key={item.type === 'EXERCISE' ? item.exerciseId : item.id}
                draggable
                onDragStart={() => setDraggedIndex(idx)}
                onDragOver={(e) => { e.preventDefault(); setDropTargetIndex(idx); }}
                onDrop={(e) => onDrop(e, idx)}
                className={`
                  p-6 rounded-[2.5rem] transition-all relative overflow-hidden group/item cursor-grab active:cursor-grabbing
                  ${draggedIndex === idx ? 'opacity-40 scale-95 ring-2 ring-emerald-500' : 'opacity-100'}
                  ${dropTargetIndex === idx ? 'ring-4 ring-cyan-500/50 bg-cyan-500/10' : ''}
                  ${item.type === 'SUPERSET' ? 'bg-gradient-to-br from-violet-600/10 to-slate-900 border-2 border-violet-500/30 shadow-xl' : 'bg-slate-800/40 border border-slate-800 hover:border-slate-700 shadow-lg'}
                `}
              >
                <div className="flex items-center gap-6">
                  <GripVertical size={24} className="text-slate-600" />
                  {item.type === 'EXERCISE' ? (
                    <>
                      <div className="flex-1">
                        <h4 className="text-lg font-black text-white italic uppercase tracking-tight leading-none mb-2">{item.name}</h4>
                        <div className="flex items-center gap-3">
                           <div className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-950 rounded text-cyan-400 border border-cyan-500/10">
                              <Ghost size={10} />
                              <span className="text-[8px] font-black uppercase tracking-widest">Ghost logic active</span>
                           </div>
                           <span className="text-[8px] text-slate-500 font-black uppercase tracking-widest">{item.muscle_tags[0]}</span>
                        </div>
                      </div>
                      <button onClick={() => removeItem(item.exerciseId)} className="p-3 text-slate-600 hover:text-rose-500"><Trash2 size={20} /></button>
                    </>
                  ) : (
                    <div className="flex-1 space-y-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <Layers size={20} className="text-violet-400" />
                          <h4 className="text-lg font-black text-white italic uppercase tracking-tighter">Linked Matrix Unit</h4>
                        </div>
                        <button onClick={() => removeItem(item.id)} className="p-2 text-slate-600 hover:text-rose-500"><X size={18}/></button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {item.exercises.map((ex, i) => (
                          <div key={ex.exerciseId} className={`bg-slate-950/40 p-4 rounded-2xl border ${i < item.exercises.length - 1 ? 'border-violet-500/10' : 'border-emerald-500/10'}`}>
                            <p className="text-sm font-black text-slate-200">{ex.name}</p>
                            <p className="text-[8px] text-slate-600 font-bold uppercase tracking-widest mt-1">
                               {i < item.exercises.length - 1 ? 'Timer Suppressed' : 'Rest Sequence Active'}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="lg:col-span-4 space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-8 shadow-xl space-y-6 sticky top-8">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-white uppercase tracking-wider text-xs flex items-center gap-2"><Box size={16} className="text-cyan-400"/> Core library</h3>
          </div>

          <div className="space-y-4">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
              <input 
                type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search Vault..."
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-white outline-none focus:border-cyan-500/20"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <select onChange={(e) => setFilterMuscle(e.target.value)} className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-[10px] font-black text-slate-500 uppercase outline-none">
                <option value="all">Any Muscle</option>
                <option value="chest">Chest</option>
                <option value="back">Back</option>
                <option value="upper arms">Arms</option>
              </select>
              <select onChange={(e) => setFilterEquip(e.target.value)} className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-[10px] font-black text-slate-500 uppercase outline-none">
                <option value="all">Any Tool</option>
                <option value="barbell">Barbell</option>
                <option value="dumbbell">Dumbbell</option>
              </select>
            </div>
          </div>

          <div 
            ref={sidebarScrollRef}
            onScroll={handleSidebarScroll}
            className="space-y-2 overflow-y-auto max-h-[450px] custom-scrollbar pr-2"
          >
            {library.map(ex => (
              <div 
                key={ex.id} 
                onClick={() => addExercise(ex)}
                className="w-full p-4 bg-slate-800/30 border border-slate-800 rounded-2xl flex items-center justify-between group hover:border-cyan-500/30 hover:bg-slate-800/50 transition-all cursor-pointer shadow-inner"
              >
                <div className="flex-1">
                  <p className="text-sm font-black text-slate-200 group-hover:text-cyan-400 transition-colors italic leading-tight">{ex.name}</p>
                  <p className="text-[8px] text-slate-600 font-bold uppercase tracking-widest mt-1">{ex.target}</p>
                </div>
                <div className="text-slate-700 group-hover:text-cyan-400/50">
                  <Plus size={14} strokeWidth={3} />
                </div>
              </div>
            ))}
            {loadingLibrary && <div className="py-4 text-center"><Loader2 className="animate-spin text-cyan-400 mx-auto" size={20} /></div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoutineBuilder;
