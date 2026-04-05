
import React, { useState, useEffect, useRef } from 'react';
import { 
  Utensils, 
  Plus, 
  ChevronRight, 
  Flame, 
  Zap, 
  TrendingUp, 
  Clock, 
  Waves,
  BrainCircuit,
  Info,
  History,
  Target,
  ChevronLeft,
  Search,
  Scan,
  Sparkles,
  ZapIcon,
  Library,
  MessageSquare,
  X,
  Camera,
  MoreVertical,
  Trash2,
  Copy,
  CheckCircle2
} from 'lucide-react';
import { MealLogEntry } from '../types';
import { analyzeMeal } from '../geminiService';

const DailyGoal = { kcal: 3226, protein: 182, fat: 71, carbs: 462 };

const MealsStudio: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [log, setLog] = useState<MealLogEntry[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeAddTab, setActiveAddTab] = useState<'search' | 'scan' | 'ai' | 'quick' | 'lib' | 'describe'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHour, setSelectedHour] = useState<number | null>(null);

  // Load log
  useEffect(() => {
    const stored = localStorage.getItem('bodyos_meal_log');
    if (stored) setLog(JSON.parse(stored));
  }, []);

  const saveLog = (newLog: MealLogEntry[]) => {
    setLog(newLog);
    localStorage.setItem('bodyos_meal_log', JSON.stringify(newLog));
  };

  const getDaysOfWeek = () => {
    const days = [];
    for (let i = -3; i <= 3; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      days.push(d);
    }
    return days;
  };

  const filteredLog = log.filter(entry => {
    const entryDate = new Date(entry.timestamp);
    return entryDate.toDateString() === selectedDate.toDateString();
  });

  const totals = filteredLog.reduce((acc, curr) => ({
    kcal: acc.kcal + curr.kcal,
    protein: acc.protein + curr.protein,
    carbs: acc.carbs + curr.carbs,
    fat: acc.fat + curr.fat
  }), { kcal: 0, protein: 0, carbs: 0, fat: 0 });

  const addMeal = (hour: number) => {
    const now = new Date(selectedDate);
    now.setHours(hour, 0, 0, 0);
    
    const newEntry: MealLogEntry = {
      id: `meal_${Date.now()}`,
      name: searchQuery || "Quick Fuel",
      kcal: 450, // Mocked for UI flow
      protein: 30,
      carbs: 50,
      fat: 15,
      timestamp: now.getTime()
    };
    
    saveLog([...log, newEntry]);
    setShowAddModal(false);
    setSearchQuery('');
  };

  const deleteMeal = (id: string) => {
    saveLog(log.filter(m => m.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 pb-32">
      {/* HEADER: DATE NAV & MACRO SUMMARY */}
      <div className="sticky top-0 z-40 bg-[#020617]/80 backdrop-blur-xl border-b border-slate-900 px-4 pt-4 pb-6 space-y-6">
        <div className="flex items-center justify-between">
          <button className="p-2 text-slate-500"><History size={20} /></button>
          <div className="flex items-center gap-4">
            <button onClick={() => {
              const d = new Date(selectedDate);
              d.setDate(d.getDate() - 1);
              setSelectedDate(d);
            }}><ChevronLeft size={20} className="text-slate-500" /></button>
            <h1 className="text-sm font-black uppercase tracking-[0.2em] text-white">
              {selectedDate.toDateString() === new Date().toDateString() ? 'Today' : selectedDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </h1>
            <button onClick={() => {
              const d = new Date(selectedDate);
              d.setDate(d.getDate() + 1);
              setSelectedDate(d);
            }}><ChevronRight size={20} className="text-slate-500" /></button>
          </div>
          <button className="p-2 text-slate-500"><MoreVertical size={20} /></button>
        </div>

        {/* HORIZONTAL DATE SELECTOR */}
        <div className="flex justify-between px-2">
          {getDaysOfWeek().map((date, i) => {
            const isSelected = date.toDateString() === selectedDate.toDateString();
            return (
              <button 
                key={i}
                onClick={() => setSelectedDate(date)}
                className={`flex flex-col items-center gap-1 transition-all ${isSelected ? 'scale-110' : 'opacity-40'}`}
              >
                <span className="text-[10px] font-black text-slate-500 uppercase">{date.toLocaleDateString(undefined, { weekday: 'short' }).charAt(0)}</span>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-black border-2 ${isSelected ? 'bg-slate-800 border-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>
                  {date.getDate()}
                </div>
              </button>
            );
          })}
        </div>

        {/* MACRO PILLS (REF: MF UI) */}
        <div className="grid grid-cols-4 gap-2 px-2">
          <MacroPill label="K" current={totals.kcal} goal={DailyGoal.kcal} icon={<Flame size={10} />} />
          <MacroPill label="P" current={totals.protein} goal={DailyGoal.protein} />
          <MacroPill label="F" current={totals.fat} goal={DailyGoal.fat} />
          <MacroPill label="C" current={totals.carbs} goal={DailyGoal.carbs} />
        </div>
      </div>

      {/* TIMELINE LOG */}
      <div className="px-6 py-8 space-y-10 relative">
        {/* Timeline Path */}
        <div className="absolute left-[39px] top-10 bottom-10 w-px bg-slate-800/50" />
        
        {Array.from({ length: 24 }).map((_, hour) => {
          // Displaying 5 AM to 11 PM to match usual waking hours
          if (hour < 5) return null;
          
          const hourEntries = filteredLog.filter(e => new Date(e.timestamp).getHours() === hour);
          const displayHour = hour > 12 ? `${hour - 12} PM` : hour === 12 ? '12 PM' : `${hour} AM`;

          return (
            <div key={hour} className="flex gap-8 group">
              <div className="w-10 shrink-0 text-right">
                <span className="text-[10px] font-black text-slate-600 uppercase whitespace-nowrap">{displayHour}</span>
              </div>
              
              <div className="relative flex-1">
                {/* Timeline Node */}
                <div className={`absolute -left-[35px] top-1.5 w-2.5 h-2.5 rounded-full z-10 transition-all ${hourEntries.length > 0 ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-slate-800'}`} />
                
                {hourEntries.length > 0 ? (
                  <div className="space-y-3">
                    {hourEntries.map((entry) => (
                      <div key={entry.id} className="bg-slate-900/50 border border-slate-800 p-5 rounded-[2rem] shadow-lg flex justify-between items-center group/card hover:bg-slate-900 transition-all">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-emerald-400">
                            <Utensils size={18} />
                          </div>
                          <div>
                            <h4 className="text-sm font-black text-white italic uppercase tracking-tighter">{entry.name}</h4>
                            <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest mt-1">P:{entry.protein}g F:{entry.fat}g C:{entry.carbs}g</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-lg font-black text-white">{entry.kcal}</p>
                            <p className="text-[7px] font-black text-slate-700 uppercase">kcal</p>
                          </div>
                          <button onClick={() => deleteMeal(entry.id)} className="p-2 text-slate-700 hover:text-rose-500 opacity-0 group-hover/card:opacity-100 transition-opacity">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <button 
                    onClick={() => { setSelectedHour(hour); setShowAddModal(true); }}
                    className="flex items-center gap-3 py-1 text-slate-700 hover:text-emerald-500 transition-colors"
                  >
                    <div className="w-6 h-6 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center">
                      <Plus size={14} />
                    </div>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ADD FOOD MODAL (REF: MF SEARCH UI) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-[#020617] flex flex-col animate-in slide-in-from-bottom duration-300">
          <div className="p-4 border-b border-slate-900 flex items-center gap-4">
            <button onClick={() => setShowAddModal(false)} className="p-2 text-slate-400"><X size={24} /></button>
            <div className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-full text-[10px] font-black uppercase text-slate-400 tracking-widest">
              {selectedHour !== null && (selectedHour > 12 ? `${selectedHour - 12} PM` : `${selectedHour} AM`)}
            </div>
            <div className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-full text-[10px] font-black uppercase text-slate-400 tracking-widest">
              {totals.kcal} / {DailyGoal.kcal}
            </div>
          </div>

          <div className="flex border-b border-slate-900 px-4">
            <TabBtn active={activeAddTab === 'scan'} icon={<Scan size={16} />} label="Scan" onClick={() => setActiveAddTab('scan')} />
            <TabBtn active={activeAddTab === 'search'} icon={<Search size={16} />} label="Search" onClick={() => setActiveAddTab('search')} />
            <TabBtn active={activeAddTab === 'ai'} icon={<Sparkles size={16} />} label="AI" onClick={() => setActiveAddTab('ai')} />
            <TabBtn active={activeAddTab === 'quick'} icon={<ZapIcon size={16} />} label="Quick" onClick={() => setActiveAddTab('quick')} />
            <TabBtn active={activeAddTab === 'lib'} icon={<Library size={16} />} label="Library" onClick={() => setActiveAddTab('lib')} />
            <TabBtn active={activeAddTab === 'describe'} icon={<MessageSquare size={16} />} label="Describe" onClick={() => setActiveAddTab('describe')} />
          </div>

          <div className="flex-1 p-6 flex flex-col justify-center items-center text-center opacity-40">
             <div className="p-10 bg-slate-900/50 border border-slate-800 rounded-[3rem] space-y-4">
                <History size={48} className="mx-auto text-slate-700" />
                <div className="space-y-1">
                   <p className="font-black uppercase tracking-widest text-sm">No history yet</p>
                   <p className="text-xs font-bold">Search for foods below</p>
                </div>
             </div>
          </div>

          {/* SEARCH BAR AT BOTTOM (REF: IMAGE 2) */}
          <div className="p-6 bg-[#020617] border-t border-slate-900 space-y-4">
             <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-2xl p-2 pl-4">
                <Search size={20} className="text-slate-500" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for a food"
                  className="flex-1 bg-transparent border-none outline-none text-white font-bold"
                />
                <button 
                  onClick={() => addMeal(selectedHour || 12)}
                  className="bg-white text-slate-950 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-emerald-400 transition-all"
                >
                   Log Foods
                </button>
             </div>
          </div>
        </div>
      )}

      {/* Logic Payload Conclusion */}
      <footer className="pt-10 text-center opacity-10">
         <p className="text-[8px] font-black text-slate-800 uppercase tracking-[0.8em]">Nutrition Logic v2.5.1 Synchronized</p>
      </footer>
    </div>
  );
};

const MacroPill = ({ label, current, goal, icon }: { label: string, current: number, goal: number, icon?: React.ReactNode }) => (
  <div className="bg-slate-900 border border-slate-800 rounded-xl p-2 flex flex-col items-center">
    <div className="flex items-center gap-1 text-[8px] font-black text-slate-500 uppercase tracking-widest">
      {icon} {label}
    </div>
    <div className="text-[10px] font-black text-white mt-1">
      {current} <span className="opacity-30">/ {goal}</span>
    </div>
    <div className="w-full h-0.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
      <div className="h-full bg-emerald-500" style={{ width: `${Math.min((current/goal)*100, 100)}%` }} />
    </div>
  </div>
);

const TabBtn = ({ active, icon, label, onClick }: { active: boolean, icon: React.ReactNode, label: string, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-2 py-4 px-4 border-b-2 transition-all ${active ? 'border-white text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
  >
    {icon}
    <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
  </button>
);

export default MealsStudio;
