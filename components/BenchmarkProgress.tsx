
import React, { useState } from 'react';
import { Dumbbell, TrendingUp, Calendar, Zap, Repeat, Weight, ChevronDown } from 'lucide-react';

const benchmarkData = [
  { 
    name: 'Barbell Bench Press', 
    current: 87.49, 
    goal: 265,
    historicalProgress: [ { date: '2025-06-01', weight: 80 }, { date: '2025-07-20', weight: 87.49 } ],
    forecast: { sets: 3, reps: 5, weight: 90 }
  },
  { 
    name: 'Barbell Squat', 
    current: 285, 
    goal: 308,
    historicalProgress: [ { date: '2025-01-15', weight: 260 }, { date: '2025-07-20', weight: 285 } ],
    forecast: { sets: 3, reps: 5, weight: 287.5 }
  },
  { 
    name: 'Barbell Deadlift', 
    current: 415, 
    goal: 352, // Goal already surpassed
    historicalProgress: [ { date: '2025-01-15', weight: 380 }, { date: '2025-07-20', weight: 415 } ],
    forecast: { sets: 1, reps: 5, weight: 365 } // Deload/maintenance
  },
  { name: 'Barbell Bicep Curl', current: 42.01, goal: null, historicalProgress: [], forecast: null },
  { name: 'Barbell Tricep Extension', current: null, goal: null, historicalProgress: [], forecast: null },
  { name: 'Barbell Shoulder Press', current: 29.17, goal: null, historicalProgress: [], forecast: null },
];

const calculateETA = (current: number, goal: number, history: {date: string, weight: number}[]) => {
    if (history.length < 2 || current >= goal) return null;

    const sortedHistory = [...history].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const first = sortedHistory[0];
    const last = sortedHistory[sortedHistory.length - 1];

    const weightGained = last.weight - first.weight;
    const daysPassed = (new Date(last.date).getTime() - new Date(first.date).getTime()) / (1000 * 3600 * 24);

    if (daysPassed <= 0 || weightGained <= 0) return null;

    const gainPerDay = weightGained / daysPassed;
    const weightNeeded = goal - current;
    const daysToGoal = Math.ceil(weightNeeded / gainPerDay);

    const etaDate = new Date();
    etaDate.setDate(etaDate.getDate() + daysToGoal);

    return etaDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const BenchmarkProgress: React.FC = () => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-xl animate-in fade-in duration-500">
      <div className="flex justify-between items-start">
        <div>
            <h3 className="font-black text-white text-lg mb-1">Benchmark Exercise Progress</h3>
            <p className="text-xs text-slate-500">Last Updated: {new Date().toISOString().split('T')[0]}</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-[9px] font-black text-cyan-400 uppercase tracking-widest">
            <TrendingUp size={12} />
            Forecasting Active
        </div>
      </div>
      
      <div className="mt-8 space-y-4">
        {benchmarkData.map((exercise, index) => {
          if (!exercise.current && !exercise.goal) return null;
          
          const progress = exercise.goal && exercise.current ? (exercise.current / exercise.goal) * 100 : 0;
          const eta = exercise.goal && exercise.current ? calculateETA(exercise.current, exercise.goal, exercise.historicalProgress) : null;
          const isExpanded = expandedIndex === index;

          return (
            <div key={index} className="bg-slate-950/50 border border-slate-800 p-6 rounded-[2rem] transition-all duration-300">
              <div className="flex items-start gap-6">
                <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center shrink-0">
                  <Dumbbell size={24} className="text-slate-600"/>
                </div>
                
                <div className="flex-1">
                  <p className="text-cyan-400 font-bold text-sm mb-4">{exercise.name}</p>
                  <div className="flex justify-between items-baseline mb-2">
                    <p className="text-2xl font-black text-white">
                      {exercise.current ? exercise.current.toFixed(2) : '--'}
                      <span className="text-sm font-bold text-slate-500 ml-2"> of goal </span>
                      <span className="ml-2">{exercise.goal ? exercise.goal : '--'} lbs</span>
                    </p>
                    {exercise.goal && (
                         <button 
                            onClick={() => toggleExpand(index)}
                            className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors"
                        >
                            Forecast <ChevronDown size={16} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        </button>
                    )}
                  </div>
                  
                  <div className="w-full bg-slate-800 rounded-full h-2.5 shadow-inner">
                    <div 
                      className={`h-2.5 rounded-full transition-all duration-1000 ${progress >= 100 ? 'bg-emerald-500' : 'bg-cyan-400'}`}
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-500 font-bold mt-2">
                    Goal Progress: {progress.toFixed(2)}%
                  </p>
                </div>
              </div>
              
              {isExpanded && exercise.goal && (
                <div className="mt-6 pt-6 border-t border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-500">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><Calendar size={12}/> Target ETA</h4>
                        {eta ? (
                            <p className="text-3xl font-black text-white">{eta}</p>
                        ) : (
                            <p className="text-sm font-bold text-slate-600 italic">{progress >= 100 ? 'Goal Achieved!' : 'Insufficient Data'}</p>
                        )}
                    </div>
                     <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><Zap size={12}/> Next Session Plan</h4>
                        {exercise.forecast ? (
                            <div className="flex items-center gap-4 text-white font-black text-2xl">
                                <div className="flex items-center gap-2"><Repeat size={16} className="text-cyan-400"/> {exercise.forecast.sets}x{exercise.forecast.reps}</div>
                                <div className="flex items-center gap-2"><Weight size={16} className="text-cyan-400"/> {exercise.forecast.weight}lbs</div>
                            </div>
                        ) : (
                             <p className="text-sm font-bold text-slate-600 italic">No forecast available.</p>
                        )}
                    </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BenchmarkProgress;
