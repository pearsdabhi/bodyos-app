
import React, { useState } from 'react';
import { ClipboardList, Loader2, Sparkles, Wand2, CalendarDays, PlusCircle, CheckCircle, Save, ShieldCheck } from 'lucide-react';
import { generateWeeklyPlan } from '../geminiService';
import { WorkoutSession } from '../types';
import { db, isFirebaseConfigured } from '../firebase-config';
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const parseWorkoutForStorage = (aiRawResponse: string, needsReview: boolean, asTemplate: boolean = false): any => {
  try {
    const jsonMatch = aiRawResponse.match(/<data>([\s\S]*?)<\/data>/);
    let workoutData;

    if (jsonMatch) {
      const rawData = JSON.parse(jsonMatch[1]);
      workoutData = rawData.payload || rawData;
    } else {
      return null;
    }

    const processItem = (item: any) => {
      if (item.type === 'EXERCISE') {
        const ex = item;
        return {
          type: 'EXERCISE',
          exerciseId: ex.db_id || ex.id || `ex_${Date.now()}_${Math.random()}`,
          db_id: ex.db_id || ex.id || 'N/A',
          name: ex.name,
          recording_type: ex.recording_type || 'weight_reps',
          muscle_tags: ex.muscle_tags || [],
          restTimer: ex.suggested_rest || 90,
          timer_suppressed: ex.timer_suppressed || false,
          notes: ex.trainer_notes || "",
          sets: Array(ex.sets || 3).fill(null).map((_, i) => ({
            id: `${ex.db_id || 'ex'}-${i}-${Date.now()}`,
            weight: 0,
            target_weight: ex.suggested_weight || 0,
            reps: ex.reps || 10,
            completed: false,
            rpe: 8,
            ghost_weight: ex.ghost_metadata?.prev_weight || 0,
            ghost_reps: ex.ghost_metadata?.prev_reps || 0
          }))
        };
      } else if (item.type === 'SUPERSET') {
        return {
          type: 'SUPERSET',
          id: `super_${Date.now()}_${Math.random()}`,
          restAfterGroup: item.restAfterGroup || 90,
          exercises: item.exercises.map((ex: any) => ({
            type: 'EXERCISE',
            exerciseId: ex.db_id || ex.id || `ex_${Date.now()}_${Math.random()}`,
            db_id: ex.db_id || ex.id || 'N/A',
            name: ex.name,
            recording_type: ex.recording_type || 'weight_reps',
            muscle_tags: ex.muscle_tags || [],
            timer_suppressed: true,
            sets: Array(ex.sets || 3).fill(null).map((_, i) => ({
              id: `${ex.db_id || 'ex'}-${i}-${Date.now()}`,
              weight: 0,
              target_weight: ex.suggested_weight || 0,
              reps: ex.reps || 10,
              completed: false,
              ghost_weight: ex.ghost_metadata?.prev_weight || 0,
              ghost_reps: ex.ghost_metadata?.prev_reps || 0
            }))
          }))
        };
      }
    };

    return {
      id: `${asTemplate ? 'temp' : 'nexus'}_${Date.now()}`,
      userId: 'current_user',
      title: workoutData.workout_title || "ReviVX Nexus Session",
      subCategory: asTemplate ? "Custom Routine" : (workoutData.sub_category || "Instant Workout"),
      createdAt: Date.now(),
      date: new Date().toISOString(),
      needs_review: needsReview,
      is_template: asTemplate,
      items: workoutData.items ? workoutData.items.map(processItem) : (workoutData.exercises || []).map((ex: any) => processItem({...ex, type: 'EXERCISE'})),
      is_tracked: false
    };
  } catch (error) {
    console.error("Parse Error:", error);
    return null;
  }
};

const ActionButtons: React.FC<{ aiResponse: string, onInitialized?: () => void }> = ({ aiResponse, onInitialized }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [needsReview, setNeedsReview] = useState(false);

  const handleSave = async (asTemplate: boolean) => {
    setIsSaving(true);
    const structuredWorkout = parseWorkoutForStorage(aiResponse, needsReview, asTemplate); 
    
    if (!structuredWorkout) {
      alert("Nexus Logic Failure: Could not decode session parameters.");
      setIsSaving(false);
      return;
    }

    if (!isFirebaseConfigured) {
      const key = asTemplate ? 'bodyos_templates' : 'bodyos_virtual_sessions';
      const stored = localStorage.getItem(key);
      const items = stored ? JSON.parse(stored) : [];
      items.push(structuredWorkout);
      localStorage.setItem(key, JSON.stringify(items));
      
      if (!asTemplate && onInitialized) {
        onInitialized();
      } else if (asTemplate) {
        alert("Routine archived in Template Vault.");
      }
      setIsSaving(false);
      return;
    }

    try {
      const col = asTemplate ? 'user_templates' : 'user_sessions';
      await addDoc(collection(db, col), structuredWorkout);
      if (!asTemplate && onInitialized) onInitialized();
    } catch (error) {
      console.error("Firebase Error:", error);
      alert("Nexus transmission failure.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div 
        onClick={() => setNeedsReview(!needsReview)}
        className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${needsReview ? 'bg-amber-500/10 border-amber-500/40 text-amber-400' : 'bg-slate-800 border-slate-700 text-slate-500'}`}
      >
        <span className="text-[10px] font-black uppercase tracking-widest">Flag for Master Review</span>
        {needsReview ? <CheckCircle size={16} /> : <div className="w-4 h-4 rounded-full border border-slate-600" />}
      </div>
      
      <div className="flex gap-3">
        <button 
          onClick={() => handleSave(false)}
          disabled={isSaving}
          className="flex-1 bg-cyan-500 text-black font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-cyan-400 transition-all shadow-lg shadow-cyan-500/20 disabled:bg-slate-700 uppercase text-xs tracking-widest"
        >
          {isSaving ? <Loader2 className="animate-spin" size={20} /> : <PlusCircle size={20} />}
          Initialize Session
        </button>
        
        <button 
          onClick={() => handleSave(true)}
          disabled={isSaving}
          className="px-6 bg-slate-800 text-slate-300 border border-slate-700 font-black rounded-2xl hover:bg-slate-700 transition-all flex items-center justify-center"
          title="Archive Template"
        >
          <Save size={20} />
        </button>
      </div>
    </div>
  );
};

const WorkoutPlanner: React.FC<{ onPlanInitialized?: () => void }> = ({ onPlanInitialized }) => {
  const [formData, setFormData] = useState({
    style: 'Bodybuilding',
    level: 'Intermediate',
    goal: 'Build Muscle',
    equipment: 'Standard Gym Access'
  });
  const [markdownPlan, setMarkdownPlan] = useState<string | null>(null);
  const [rawResponse, setRawResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const generatePlan = async () => {
    setIsLoading(true);
    setMarkdownPlan(null);
    setRawResponse(null);
    try {
      const response = await generateWeeklyPlan(formData);
      if (response) {
        setRawResponse(response);
        const markdown = response.replace(/<data>[\s\S]*?<\/data>/, '').trim();
        setMarkdownPlan(markdown);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-8 shadow-2xl space-y-6">
            <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-3"><Wand2 size={16} /> v2.0 Logic Hub</h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Architectural Style</label>
                <select name="style" value={formData.style} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-cyan-500/50">
                  <option>Bodybuilding</option>
                  <option>Powerlifting</option>
                  <option>Hybrid Athlete</option>
                  <option>HIIT / Cardio</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Primary Goal</label>
                <select name="goal" value={formData.goal} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-cyan-500/50">
                  <option>Build Muscle</option>
                  <option>Fat Loss</option>
                  <option>Maximum Strength</option>
                  <option>Conditioning</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Available Equipment</label>
                <input name="equipment" type="text" value={formData.equipment} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-cyan-500/50" />
              </div>
            </div>
          </div>
          <button onClick={generatePlan} disabled={isLoading} className={`w-full py-5 rounded-2xl font-black text-base uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${isLoading ? 'bg-slate-800 text-slate-600' : 'bg-cyan-500 text-white shadow-2xl shadow-cyan-500/20 active:scale-95'}`}>
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
            {isLoading ? 'Architecting...' : 'Build v2.0 Routine'}
          </button>
        </div>

        <div className="lg:col-span-8">
          <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-8 shadow-2xl min-h-[500px] flex flex-col relative overflow-hidden">
            {isLoading && (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-10">
                <div className="relative w-24 h-24 mb-6">
                  <Loader2 size={96} className="text-cyan-400 animate-spin opacity-20 absolute inset-0" />
                  <ShieldCheck size={48} className="text-cyan-400 absolute inset-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                </div>
                <h3 className="text-xl font-black text-white italic tracking-tighter uppercase">Nexus v2.0 Engaged</h3>
                <p className="text-[10px] text-slate-500 uppercase tracking-[0.3em] mt-2">Auditing symmetry & verifying tenant isolation...</p>
              </div>
            )}
            {!isLoading && !markdownPlan && (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-10 opacity-30">
                <CalendarDays size={64} className="mb-6 text-slate-700" />
                <h3 className="text-xl font-black text-slate-300 uppercase italic">Standby Mode</h3>
                <p className="text-xs text-slate-600 uppercase tracking-widest mt-2">Awaiting Parameter Injection</p>
              </div>
            )}
            {!isLoading && markdownPlan && (
              <div className="animate-in fade-in h-full flex flex-col">
                <div className="prose prose-invert prose-sm bg-slate-950/50 p-8 rounded-[2.5rem] border border-slate-800 flex-1 overflow-y-auto custom-scrollbar mb-6 shadow-inner">
                  <pre className="whitespace-pre-wrap font-sans bg-transparent p-0 text-slate-300 leading-relaxed">{markdownPlan}</pre>
                </div>
                {rawResponse && <ActionButtons aiResponse={rawResponse} onInitialized={onPlanInitialized} />}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkoutPlanner;
