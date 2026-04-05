
import React, { useState, useEffect, useRef } from 'react';
import { 
  Waves, 
  Scale, 
  Clock, 
  Target, 
  ShieldCheck, 
  Flame, 
  Activity,
  ChevronRight,
  Zap,
  Calendar as CalendarIcon,
  TrendingUp,
  Award,
  Circle,
  CheckCircle2,
  BarChart3,
  Dumbbell,
  Heart,
  Utensils,
  Search,
  Scan,
  Sparkles,
  Info,
  Footprints,
  ChevronLeft,
  GraduationCap,
  ArrowUpRight,
  Minus,
  Settings,
  MoreVertical,
  X,
  Pause,
  ChevronDown
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from 'recharts';
import { useNexusLogic } from '../hooks/useNexusLogic';
import { useAuthContext } from '../contexts/AuthContext';
import { AppTab, WorkoutSession } from '../types';
import { Link } from 'react-router-dom';
import TrainingLog from './TrainingLog';

// Habit-Specific Detail View (Calendar + Heatmap)
const HabitDetailOverlay: React.FC<{ 
  habit: { title: string; count: string; color: string }; 
  onClose: () => void 
}> = ({ habit, onClose }) => {
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const trackedDays = [13, 26]; // Mock tracked days

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="p-6 flex items-center justify-between border-b border-slate-900">
        <button onClick={onClose} className="p-2 text-slate-400 hover:text-white"><ChevronLeft size={24} /></button>
        <h2 className="text-xl font-black text-white italic uppercase tracking-tighter">{habit.title}</h2>
        <button className="p-2 text-slate-400 hover:text-white"><GraduationCap size={24} /></button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-10">
        {/* Streak Stats */}
        <div className="grid grid-cols-2 gap-px bg-slate-900 border-b border-slate-900">
          <div className="p-8 bg-slate-950">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Today</p>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-slate-700">--</span>
              <span className="text-[10px] font-black text-slate-600 uppercase">{habit.title === 'Weigh-In' ? 'lbs' : 'kcal'}</span>
            </div>
          </div>
          <div className="p-8 bg-slate-950 border-l border-slate-900">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Streak</p>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-white">0</span>
              <span className="text-[10px] font-black text-slate-600 uppercase px-1">days</span>
            </div>
          </div>
        </div>

        {/* Calendar Section */}
        <div className="p-6 space-y-8">
          <div className="space-y-4">
            {/* Weekdays */}
            <div className="grid grid-cols-7 gap-2 text-center">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                <span key={d} className="text-[10px] font-black text-slate-600 uppercase">{d}</span>
              ))}
            </div>
            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-2">
              {/* Padding for Jan 2026 starting on Thu */}
              <div className="aspect-square flex items-center justify-center text-[10px] text-slate-800 font-bold">29</div>
              <div className="aspect-square flex items-center justify-center text-[10px] text-slate-800 font-bold">30</div>
              <div className="aspect-square flex items-center justify-center text-[10px] text-slate-800 font-bold">31</div>
              {days.map(d => {
                const isTracked = trackedDays.includes(d);
                const isToday = d === 26;
                return (
                  <div key={d} className="aspect-square flex items-center justify-center relative">
                    <div className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all ${
                      isTracked ? 'border-emerald-500 text-emerald-500 bg-emerald-500/5' : 
                      isToday ? 'border-white text-white' : 'border-slate-800 text-slate-500'
                    }`}>
                      <span className="text-xs font-black">{d}</span>
                    </div>
                    {isToday && <div className="absolute bottom-0 w-1 h-1 bg-white rounded-full translate-y-1" />}
                  </div>
                )
              })}
              <div className="aspect-square flex items-center justify-center text-[10px] text-slate-800 font-bold">1</div>
            </div>
          </div>

          {/* Month/Year Nav */}
          <div className="flex justify-between items-center px-2">
             <div className="flex gap-2">
                <button className="w-10 h-10 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center text-slate-400"><ChevronLeft size={16} /></button>
                <button className="w-10 h-10 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center text-slate-400"><ChevronRight size={16} /></button>
             </div>
             <div className="flex gap-3">
                <button className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl flex items-center gap-2 text-[10px] font-black uppercase text-white">
                  January <ChevronDown size={14} className="text-slate-600" />
                </button>
                <button className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl flex items-center gap-2 text-[10px] font-black uppercase text-white">
                  2026 <ChevronDown size={14} className="text-slate-600" />
                </button>
             </div>
          </div>

          {/* Legend */}
          <div className="flex bg-slate-900/50 border border-slate-800 p-4 rounded-2xl justify-around">
             <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full border border-emerald-500 bg-emerald-500/10" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tracked</span>
             </div>
             <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full border border-slate-700 bg-slate-800" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Untracked</span>
             </div>
          </div>

          {/* Activity Heatmap Section */}
          <div className="space-y-6 pt-6 border-t border-slate-900">
             <h3 className="text-sm font-black text-white uppercase tracking-tighter italic">2026 Overview</h3>
             <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-[2.5rem] space-y-4">
                <div className="grid grid-cols-[repeat(52,1fr)] gap-0.5 w-full">
                  {Array.from({ length: 52 * 7 }).map((_, i) => (
                    <div key={i} className={`aspect-square rounded-[1px] ${i === 12 ? 'bg-emerald-500' : 'bg-slate-800 opacity-30'}`} />
                  ))}
                </div>
                <div className="flex justify-between text-[8px] font-black text-slate-600 uppercase tracking-widest px-1">
                   <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Original Detailed View for Metric Trends
const MetricDetailOverlay: React.FC<{ 
  metric: { title: string; value: string; unit: string; color: string; subtitle?: string }; 
  onClose: () => void 
}> = ({ metric, onClose }) => {
  const [range, setRange] = useState('1W');
  const mockData = [
    { date: 'Jan 12', val: 183.5 },
    { date: 'Jan 15', val: 183.2 },
    { date: 'Jan 18', val: 183.8 },
    { date: 'Jan 21', val: 183.0 },
    { date: 'Jan 24', val: 183.0 },
    { date: 'Jan 26', val: 183.0 },
  ];

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="p-6 flex items-center justify-between border-b border-slate-900">
        <button onClick={onClose} className="p-2 text-slate-400 hover:text-white"><ChevronLeft size={24} /></button>
        <h2 className="text-xl font-black text-white italic uppercase tracking-tighter">{metric.title}</h2>
        <button className="p-2 text-slate-400 hover:text-white"><GraduationCap size={24} /></button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-px bg-slate-900 border-b border-slate-900">
          <div className="p-8 bg-slate-950">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Average</p>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-white">{metric.value}</span>
              <span className="text-[10px] font-black text-slate-600 uppercase">{metric.unit}</span>
            </div>
            <p className="text-[10px] font-bold text-slate-600 uppercase mt-2">Jan 12 - Feb 1, 2026</p>
          </div>
          <div className="p-8 bg-slate-950 border-l border-slate-900 flex flex-col justify-between">
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Difference</p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-white">0.0</span>
                <span className="text-[10px] font-black text-slate-600 uppercase">{metric.unit}</span>
              </div>
            </div>
            <div className="flex justify-end">
              <button className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center text-slate-400 border border-slate-800">
                <MoreVertical size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Chart Section */}
        <div className="p-6 space-y-6">
          <div className="h-64 w-full relative">
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={mockData}>
                 <defs>
                   <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor={metric.color} stopOpacity={0.2}/>
                     <stop offset="95%" stopColor={metric.color} stopOpacity={0}/>
                   </linearGradient>
                 </defs>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                 <XAxis dataKey="date" hide />
                 <YAxis hide domain={['dataMin - 10', 'dataMax + 10']} />
                 <Tooltip contentStyle={{ backgroundColor: '#020617', border: 'none', borderRadius: '1rem' }} />
                 <Area type="monotone" dataKey="val" stroke={metric.color} fillOpacity={1} fill="url(#colorVal)" strokeWidth={3} />
                 <ReferenceLine y={183} stroke="#334155" strokeDasharray="3 3" />
               </AreaChart>
             </ResponsiveContainer>
             <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col gap-10 text-[10px] font-black text-slate-700 uppercase">
                <span>200</span>
                <span>150</span>
                <span>100</span>
                <span>50</span>
                <span>0</span>
             </div>
          </div>

          {/* Controls */}
          <div className="flex justify-between items-center gap-2">
            <div className="flex bg-slate-900 p-1 rounded-2xl flex-1 overflow-x-auto no-scrollbar">
              {['1W', '1M', '3M', '6M', '1Y', 'All'].map(t => (
                <button 
                  key={t} 
                  onClick={() => setRange(t)}
                  className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${range === t ? 'bg-slate-800 text-white' : 'text-slate-600'}`}
                >
                  {t}
                </button>
              ))}
            </div>
            <button className="bg-slate-900 p-3 rounded-2xl border border-slate-800 text-slate-400 flex items-center gap-2">
               <span className="text-[10px] font-black uppercase tracking-widest">D</span>
               <ChevronRight size={14} className="rotate-90" />
            </button>
          </div>

          {/* Legend */}
          <div className="flex justify-center gap-6 py-4">
             <div className="flex items-center gap-2">
                <ChevronRight size={12} className="text-rose-500 rotate-[-45deg]" />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Scale {metric.title.split(' ')[1] || 'Metric'}</span>
             </div>
             <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: metric.color }} />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Trend {metric.title.split(' ')[1] || 'Metric'}</span>
             </div>
          </div>

          {/* Tutorial Box */}
          <div className="bg-violet-600/10 border border-violet-500/20 p-8 rounded-[2.5rem] space-y-4">
             <div className="flex items-center gap-3">
                <GraduationCap size={24} className="text-violet-400" />
                <h3 className="text-sm font-black text-white uppercase tracking-widest">What is {metric.title}?</h3>
             </div>
             <p className="text-xs text-slate-400 leading-relaxed font-medium">
                {metric.title} data tends to be quite noisy. Your {metric.title} Trend is the signal in all of that noise, smoothed via central Nexus logic.
             </p>
             <div className="flex justify-between items-center pt-4">
                <button className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors">Dismiss Tutorial</button>
                <button className="px-6 py-2.5 bg-violet-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl">Next</button>
             </div>
          </div>

          {/* Insights Panel */}
          <div className="space-y-6 pt-6">
            <h3 className="text-sm font-black text-white uppercase tracking-widest">Insights & Data</h3>
            <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 space-y-6">
               <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Metric Changes</h4>
               {[
                 { label: '3-day', val: '0.0', trend: 'Increase' },
                 { label: '7-day', val: '0.0', trend: 'Increase' },
                 { label: '14-day', val: '--', trend: 'Waiting' },
                 { label: '30-day', val: '--', trend: 'Waiting' },
               ].map(i => (
                 <div key={i.label} className="flex items-center justify-between">
                    <p className="text-[10px] font-black text-slate-200 uppercase tracking-widest w-16">{i.label}</p>
                    <div className="flex-1 h-px bg-slate-800 mx-4" />
                    <p className="text-sm font-black text-white w-16 text-right">{i.val} {metric.unit}</p>
                    <div className="w-24 flex items-center justify-end gap-2 text-slate-500">
                       {i.trend === 'Increase' ? <TrendingUp size={12} className="text-emerald-500" /> : <Pause size={12} />}
                       <span className="text-[9px] font-black uppercase tracking-widest">{i.trend}</span>
                    </div>
                 </div>
               ))}
            </div>
          </div>

          {/* Data Sources */}
          <div className="space-y-4">
             <h3 className="text-sm font-black text-white uppercase tracking-widest">Data Sources</h3>
             <div className="bg-slate-900 border border-slate-800 p-6 rounded-[2rem] flex items-center justify-between">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 bg-slate-950 rounded-xl flex items-center justify-center text-slate-600"><Scale size={20} /></div>
                   <div>
                      <p className="text-xs font-black text-white uppercase tracking-widest">Scale {metric.title.split(' ')[1]}</p>
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Manage Data</p>
                   </div>
                </div>
                <ChevronRight size={18} className="text-slate-700" />
             </div>
          </div>

          {/* Historical Log */}
          <div className="space-y-4 pt-4">
             <h3 className="text-sm font-black text-white uppercase tracking-widest">January 2026</h3>
             <div className="space-y-3">
               {[
                 { date: 'Mon, Jan 26', val: metric.value },
                 { date: 'Sun, Jan 25', val: metric.value },
                 { date: 'Sat, Jan 24', val: metric.value },
               ].map((entry, idx) => (
                 <div key={idx} className="bg-slate-900/50 border border-slate-800 p-6 rounded-[2rem] flex items-center justify-between">
                   <div>
                      <p className="text-sm font-black text-white uppercase tracking-tighter italic">{entry.val} {metric.unit}</p>
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">{entry.date}</p>
                   </div>
                   <div className="flex items-center gap-2 text-slate-600">
                      <Minus size={14} />
                      <span className="text-[9px] font-black uppercase tracking-widest">No Change</span>
                   </div>
                 </div>
               ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const { user } = useAuthContext();
  const [activeCategory, setActiveCategory] = useState<'health' | 'meals' | 'workouts'>('meals');
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const { symmetryAudit, fatigueStatus } = useNexusLogic(sessions);
  const [viewMode, setViewMode] = useState<'consumed' | 'remaining'>('consumed');
  const [activePage, setActivePage] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Drill down state
  const [selectedMetric, setSelectedMetric] = useState<any>(null);
  const [selectedHabit, setSelectedHabit] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem('bodyos_virtual_sessions');
    if (stored) setSessions(JSON.parse(stored));
  }, []);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollLeft = e.currentTarget.scrollLeft;
    const width = e.currentTarget.offsetWidth;
    const page = Math.round(scrollLeft / width);
    setActivePage(page);
  };

  // Mock Weekly Data
  const weeklyData = [
    { day: 'M', k: 3226, p: 182, f: 71, c: 462, current_k: 3226 },
    { day: 'T', k: 3226, p: 182, f: 71, c: 462, current_k: 2800 },
    { day: 'W', k: 3226, p: 182, f: 71, c: 462, current_k: 3100 },
    { day: 'T', k: 3226, p: 182, f: 71, c: 462, current_k: 1500 },
    { day: 'F', k: 3226, p: 182, f: 71, c: 462, current_k: 3400 },
    { day: 'S', k: 3226, p: 182, f: 71, c: 462, current_k: 0 },
    { day: 'S', k: 3226, p: 182, f: 71, c: 462, current_k: 0 },
  ];

  const goals = { k: 3226, p: 182, f: 71, c: 462 };

  const bodyMetricsList = [
    'Neck', 'Shoulders', 'Bust', 'Chest', 'Waist', 'Hips',
    'Left Bicep', 'Right Bicep', 'Left Forearm', 'Right Forearm',
    'Left Wrist', 'Right Wrist', 'Left Thigh', 'Right Thigh',
    'Left Calf', 'Right Calf', 'Left Ankle', 'Right Ankle',
    'Waist to Height', 'Waist to Hip'
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-32">
      {selectedMetric && (
        <MetricDetailOverlay metric={selectedMetric} onClose={() => setSelectedMetric(null)} />
      )}
      {selectedHabit && (
        <HabitDetailOverlay habit={selectedHabit} onClose={() => setSelectedHabit(null)} />
      )}

      {/* Header */}
      <header className="px-4 space-y-1">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Monday, January 26</p>
        <h1 className="text-5xl font-black text-white italic tracking-tighter uppercase leading-none">Dashboard</h1>
      </header>

      {/* Category Navigation */}
      <div className="flex gap-2 p-1.5 bg-slate-900/50 border border-slate-800 rounded-2xl mx-4 sticky top-4 z-30 shadow-2xl backdrop-blur-md">
        {[
          { id: 'health', label: 'Overall Health', icon: <Heart size={14} /> },
          { id: 'meals', label: 'Meals', icon: <Utensils size={14} /> },
          { id: 'workouts', label: 'Workout', icon: <Dumbbell size={14} /> },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id as any)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeCategory === cat.id ? 'bg-white text-slate-950 shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
          >
            {cat.icon}
            <span className="hidden sm:inline">{cat.label}</span>
          </button>
        ))}
      </div>

      {activeCategory === 'meals' && (
        <div className="space-y-8 animate-in fade-in duration-500 px-4">
          {/* HORIZONTAL SWIPABLE SECTION */}
          <div className="space-y-4">
            <h2 className="text-sm font-black text-white uppercase tracking-widest px-1">
              {activePage === 0 ? 'Weekly Nutrition' : activePage === 1 ? 'Energy Balance' : 'Daily Nutrition'}
            </h2>
            
            <div 
              ref={scrollRef}
              onScroll={handleScroll}
              className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar -mx-4 px-4 gap-4"
            >
              {/* PAGE 1: Weekly Bars */}
              <div 
                onClick={() => setSelectedMetric({ title: 'Weekly Nutrition', value: '94', unit: '%', color: '#60a5fa' })}
                className="min-w-full snap-center bg-[#0d0d0d] border border-slate-800/50 rounded-[2.5rem] p-8 shadow-xl space-y-6 cursor-pointer hover:border-slate-700 transition-colors"
              >
                <div className="flex flex-col gap-5 w-full">
                  {[
                    { label: 'k', color: '#60a5fa', val: goals.k, icon: <Flame size={10} /> },
                    { label: 'P', color: '#f87171', val: goals.p },
                    { label: 'F', color: '#fbbf24', val: goals.f },
                    { label: 'C', color: '#34d399', val: goals.c },
                  ].map((type) => (
                    <div key={type.label} className="flex items-center gap-4">
                      <div className="flex flex-col items-center gap-1 w-6 shrink-0">
                         <div className="w-1.5 h-10 rounded-full bg-slate-800/50 relative overflow-hidden">
                           <div className="absolute bottom-0 w-full rounded-full" style={{ height: '90%', backgroundColor: type.color }} />
                         </div>
                         <span className="text-[8px] font-black text-slate-600 uppercase">M</span>
                      </div>
                      <div className="flex flex-1 justify-around items-end h-10">
                        {weeklyData.slice(1).map((d, i) => (
                           <div key={i} className="w-1.5 h-10 rounded-full bg-slate-800/20 relative">
                              <div className="absolute bottom-0 w-full rounded-full bg-slate-600/30" style={{ height: '70%' }} />
                           </div>
                        ))}
                      </div>
                      <div className="text-right min-w-[70px]">
                        <p className="text-xs font-black text-white leading-none">
                          {type.val} {type.icon || <span className="text-[8px] ml-0.5 text-slate-400 uppercase">{type.label}</span>}
                        </p>
                        <p className="text-[7px] font-bold text-slate-700 uppercase tracking-widest">of {type.val}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* PAGE 2: Energy Balance Chart */}
              <div 
                onClick={() => setSelectedMetric({ title: 'Energy Balance', value: '3094', unit: 'kcal', color: '#fbbf24' })}
                className="min-w-full snap-center bg-[#0d0d0d] border border-slate-800/50 rounded-[2.5rem] p-8 shadow-xl space-y-6 flex flex-col items-center justify-center cursor-pointer hover:border-slate-700 transition-colors"
              >
                <div className="w-full h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={weeklyData}>
                      <Area type="monotone" dataKey="current_k" stroke="#fbbf24" strokeDasharray="5 5" fill="transparent" />
                      <ReferenceLine y={3226} stroke="#fbbf24" strokeWidth={1} strokeDasharray="3 3" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-3 gap-8 w-full text-center">
                  <div>
                    <p className="text-xl font-black text-white uppercase italic">N/A</p>
                    <p className="text-[7px] font-black text-slate-600 uppercase tracking-widest flex items-center justify-center gap-1"><div className="w-1.5 h-3 bg-blue-500 rounded-sm" /> Nutrition</p>
                  </div>
                  <div>
                    <p className="text-xl font-black text-white">3226</p>
                    <p className="text-[7px] font-black text-slate-600 uppercase tracking-widest flex items-center justify-center gap-1"><Waves size={8} className="text-yellow-500" /> Targets</p>
                  </div>
                  <div>
                    <p className="text-xl font-black text-white italic">N/A</p>
                    <p className="text-[7px] font-black text-slate-600 uppercase tracking-widest">Difference</p>
                  </div>
                </div>
                <div className="flex bg-slate-800 p-1 rounded-xl w-full max-w-[200px]">
                  <button className="flex-1 py-2 text-[8px] font-black text-slate-400 uppercase">Expenditure</button>
                  <button className="flex-1 py-2 bg-white text-slate-900 rounded-lg text-[8px] font-black uppercase shadow-lg">Targets</button>
                </div>
              </div>

              {/* PAGE 3: Daily Ring */}
              <div 
                onClick={() => setSelectedMetric({ title: 'Daily Nutrition', value: '1420', unit: 'kcal', color: '#10b981' })}
                className="min-w-full snap-center bg-[#0d0d0d] border border-slate-800/50 rounded-[2.5rem] p-8 shadow-xl flex flex-col items-center cursor-pointer hover:border-slate-700 transition-colors"
              >
                 <div className="relative w-44 h-44 flex items-center justify-center mb-6">
                    <svg className="w-full h-full -rotate-90">
                      <circle cx="88" cy="88" r="80" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-900" />
                      <circle cx="88" cy="88" r="80" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="502" strokeDashoffset="502" className="text-slate-800" style={{ strokeDashoffset: 502 * (1 - 1) }} />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-5xl font-black text-white tracking-tighter">0</span>
                      <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Consumed</span>
                    </div>
                 </div>
                 <div className="grid grid-cols-3 gap-4 w-full text-center mb-8">
                    <div>
                      <p className="text-xl font-black text-white">3226</p>
                      <p className="text-[7px] font-black text-slate-600 uppercase tracking-widest">Remaining</p>
                    </div>
                    <div className="opacity-20">
                      <p className="text-xl font-black text-white">0</p>
                      <p className="text-[7px] font-black text-slate-600 uppercase tracking-widest">Consumed</p>
                    </div>
                    <div>
                      <p className="text-xl font-black text-white">3226</p>
                      <p className="text-[7px] font-black text-slate-600 uppercase tracking-widest">Target</p>
                    </div>
                 </div>
                 <div className="flex gap-10 w-full px-2 border-t border-slate-900 pt-6">
                    {['Protein', 'Fat', 'Carbs'].map((label, i) => (
                      <div key={label} className="flex-1 text-center space-y-1">
                        <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">{label}</p>
                        <div className="h-0.5 bg-slate-900 rounded-full" />
                        <p className="text-[10px] font-black text-white">0 / {i===0?182:i===1?71:462}g</p>
                      </div>
                    ))}
                 </div>
              </div>
            </div>

            {/* Pagination Dots */}
            <div className="flex justify-center gap-1.5">
               {[0, 1, 2].map(i => (
                 <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all ${activePage === i ? 'bg-white w-3' : 'bg-slate-800'}`} />
               ))}
            </div>

            {/* Consumed / Remaining Toggle */}
            <div className="flex justify-center">
               <div className="flex bg-slate-900 p-1 rounded-2xl w-full max-w-[240px] shadow-inner">
                  <button onClick={() => setViewMode('consumed')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'consumed' ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-500'}`}>Consumed</button>
                  <button onClick={() => setViewMode('remaining')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'remaining' ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-500'}`}>Remaining</button>
               </div>
            </div>
          </div>

          {/* INSIGHTS & ANALYTICS */}
          <section className="space-y-4">
            <h2 className="text-sm font-black text-white uppercase tracking-widest px-1">Insights & Analytics</h2>
            <div className="grid grid-cols-2 gap-4">
              <InsightCard onClick={() => setSelectedMetric({ title: 'Expenditure', value: '3094', unit: 'kcal', color: '#f97316' })} title="Expenditure" subtitle="Last 7 Days" value="3094" unit="kcal" color="#f97316" data={[{v:3000}, {v:3050}, {v:3020}, {v:3094}, {v:3080}, {v:3100}, {v:3094}]} />
              <InsightCard onClick={() => setSelectedMetric({ title: 'Weight Trend', value: '183.0', unit: 'lbs', color: '#8b5cf6' })} title="Weight Trend" subtitle="Last 7 Days" value="183.0" unit="lbs" color="#8b5cf6" data={[{v:184}, {v:183.8}, {v:183.5}, {v:183.2}, {v:183.0}, {v:183.0}, {v:183.0}]} />
              <InsightCard onClick={() => setSelectedMetric({ title: 'Energy Balance', value: '0', unit: 'kcal surplus', color: '#ef4444' })} title="Energy Balance" subtitle="Last 7 Days" value="0" unit="kcal surplus" color="#ef4444" isDashed />
              <InsightCard onClick={() => setSelectedMetric({ title: 'Goal Progress', value: '2', unit: '%', color: '#10b981' })} title="Goal Progress" subtitle="Last 13 Days" value="2" unit="%" color="#10b981" progress={2} />
            </div>
          </section>

          {/* HABITS */}
          <section className="space-y-4">
            <h2 className="text-sm font-black text-white uppercase tracking-widest px-1">Habits</h2>
            <div className="grid grid-cols-2 gap-4">
              <HabitGrid onClick={() => setSelectedHabit({ title: 'Weigh-In', count: '0/7', color: '#10b981' })} title="Weigh-In" count="0/7" />
              <HabitGrid onClick={() => setSelectedHabit({ title: 'Food Logging', count: '0/7', color: '#34d399' })} title="Food Logging" count="0/7" />
            </div>
          </section>
        </div>
      )}

      {activeCategory === 'health' && (
        <div className="space-y-12 px-4 animate-in fade-in duration-500">
          
          {/* BODY METRICS SECTION */}
          <section className="space-y-6">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-sm font-black text-white uppercase tracking-widest">Body Metrics</h2>
              <ChevronRight size={16} className="text-slate-700" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <MetricGrid onClick={() => setSelectedMetric({ title: 'Scale Weight', value: '183.0', unit: 'lbs', color: '#10b981' })} title="Scale Weight" subtitle="Last 7 Entries" value="183.0" unit="lbs" trend color="#10b981" />
              <MetricGrid onClick={() => setSelectedMetric({ title: 'Visual Body Fat', value: '20.0', unit: '%', color: '#22d3ee' })} title="Visual Body Fat" subtitle="Last 7 Entries" value="20.0" unit="%" trend color="#22d3ee" />
              
              <div className="bg-[#0d0d0d] border border-slate-800 rounded-[2rem] aspect-square flex flex-col items-center justify-center opacity-30 group hover:border-slate-700 transition-all cursor-pointer">
                 <CalendarIcon size={32} className="text-slate-700 mb-2" />
                 <p className="text-[8px] font-black text-slate-600 uppercase">No Photos</p>
                 <ChevronRight size={14} className="mt-4 text-slate-800" />
              </div>

              <MetricGrid onClick={() => setSelectedMetric({ title: 'Full Body', value: '20.0%', unit: 'Visual Body Fat', color: '#10b981' })} title="Full Body" subtitle="Jan 13, 2026" value="20.0%" unit="Visual Body Fat" sub="1 metric" color="#10b981" showIndicator />

              {bodyMetricsList.map(m => (
                <MetricGrid key={m} onClick={() => setSelectedMetric({ title: m, value: '---', unit: 'in', color: '#334155' })} title={m} subtitle="Last 7 Entries" value="---" unit="in" color="#334155" />
              ))}
            </div>
          </section>

          {/* NUTRITION SECTION */}
          <section className="space-y-6">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-sm font-black text-white uppercase tracking-widest">Nutrition</h2>
              <button className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800">See All</button>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <SummaryMiniCard onClick={() => setSelectedMetric({ title: 'Calories', value: '0', unit: 'kcal', color: '#60a5fa' })} title="Calories" value="0" unit="kcal" color="#60a5fa" />
               <SummaryMiniCard onClick={() => setSelectedMetric({ title: 'Protein', value: '0', unit: 'g', color: '#f87171' })} title="Protein" value="0" unit="g" color="#f87171" />
               <SummaryMiniCard onClick={() => setSelectedMetric({ title: 'Fat', value: '0', unit: 'g', color: '#fbbf24' })} title="Fat" value="0" unit="g" color="#fbbf24" />
               <SummaryMiniCard onClick={() => setSelectedMetric({ title: 'Carbs', value: '0', unit: 'g', color: '#34d399' })} title="Carbs" value="0" unit="g" color="#34d399" />
            </div>
          </section>

          {/* GENERAL SECTION */}
          <section className="space-y-6">
            <h2 className="text-sm font-black text-white uppercase tracking-widest px-1">General</h2>
            <div className="grid grid-cols-2 gap-4">
              <MetricGrid onClick={() => setSelectedMetric({ title: 'Steps', value: '---', unit: 'steps', color: '#8b5cf6' })} title="Steps" subtitle="Last 7 Days" value="---" unit="steps" color="#8b5cf6" />
            </div>
          </section>
        </div>
      )}

      {activeCategory === 'workouts' && (
        <div className="px-4 animate-in fade-in duration-500">
           <TrainingLog />
        </div>
      )}

      {/* Logic Payload Conclusion */}
      <footer className="pt-20 pb-10 text-center opacity-10">
         <p className="text-[8px] font-black text-slate-800 uppercase tracking-[0.8em]">Central Nexus v2.5.3 Synchronized</p>
      </footer>
    </div>
  );
};

const SummaryMiniCard = ({ title, value, unit, color, onClick }: any) => (
  <div onClick={onClick} className="bg-[#0d0d0d] border border-slate-800 p-6 rounded-[2rem] shadow-lg space-y-4 group hover:border-slate-700 transition-all cursor-pointer">
    <div className="flex justify-between items-start">
      <div>
        <h4 className="text-[10px] font-black text-slate-200 uppercase tracking-widest leading-none">{title}</h4>
        <p className="text-[8px] font-bold text-slate-600 uppercase mt-1">Today</p>
      </div>
      <ChevronRight size={14} className="text-slate-800 group-hover:text-slate-400" />
    </div>
    <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
      <div className="h-full opacity-40" style={{ width: '20%', backgroundColor: color }} />
    </div>
    <div className="flex items-baseline gap-1">
      <p className="text-xl font-black text-white tracking-tighter">{value}</p>
      <span className="text-[8px] font-black text-slate-700 uppercase tracking-widest">{unit}</span>
    </div>
  </div>
);

const InsightCard = ({ title, subtitle, value, unit, color, data, isDashed, progress, onClick }: any) => (
  <div onClick={onClick} className="bg-[#0d0d0d] border border-slate-800/60 p-6 rounded-[2.5rem] shadow-lg flex flex-col space-y-4 group hover:border-slate-700 transition-all cursor-pointer">
    <div className="flex justify-between items-start">
      <div>
        <h4 className="text-[10px] font-black text-slate-200 uppercase tracking-widest">{title}</h4>
        <p className="text-[8px] font-bold text-slate-600 uppercase mt-1">{subtitle}</p>
      </div>
      <ChevronRight size={14} className="text-slate-800 group-hover:text-slate-400 transition-colors" />
    </div>
    <div className="h-8 w-full opacity-40">
      {data ? (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <Area type="monotone" dataKey="v" stroke={color} fill={`${color}33`} strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      ) : isDashed ? (
        <div className="w-full h-px border-t border-dashed border-slate-700 mt-4" />
      ) : progress !== undefined ? (
        <div className="w-full h-1 bg-slate-900 rounded-full mt-4 overflow-hidden">
           <div className="h-full bg-emerald-500" style={{ width: `${progress}%` }} />
        </div>
      ) : null}
    </div>
    <p className="text-xl font-black text-white leading-none">
      {value} <span className="text-[9px] text-slate-600 font-bold uppercase ml-1">{unit}</span>
    </p>
  </div>
);

const HabitGrid = ({ title, count, onClick }: any) => (
  <div onClick={onClick} className="bg-[#0d0d0d] border border-slate-800 p-6 rounded-[2.5rem] shadow-lg flex flex-col space-y-4 cursor-pointer hover:border-slate-700 transition-colors">
    <div className="flex justify-between items-start">
      <div>
        <h4 className="text-[10px] font-black text-slate-200 uppercase tracking-widest">{title}</h4>
        <p className="text-[8px] font-bold text-slate-600 uppercase mt-1">Last 30 Days</p>
      </div>
      <ChevronRight size={14} className="text-slate-800" />
    </div>
    <div className="grid grid-cols-7 gap-1 opacity-20">
      {[...Array(28)].map((_, i) => (
        <div key={i} className={`w-full aspect-square rounded-sm ${i === 12 ? 'bg-emerald-500 opacity-100' : 'bg-slate-800'}`} />
      ))}
    </div>
    <p className="text-[10px] font-black text-white">{count} <span className="text-slate-600 uppercase ml-1 tracking-widest">this week</span></p>
  </div>
);

const MetricGrid = ({ title, subtitle, value, unit, sub, trend, color, showIndicator, onClick }: any) => (
  <div onClick={onClick} className="bg-[#0d0d0d] border border-slate-800 p-6 rounded-[2rem] shadow-lg space-y-3 group hover:border-slate-700 transition-all cursor-pointer">
    <div className="flex justify-between items-start">
       <div className="space-y-0.5">
         <h4 className="text-[9px] font-black text-slate-200 uppercase tracking-widest leading-tight">{title}</h4>
         <p className="text-[7px] font-bold text-slate-600 uppercase tracking-widest">{subtitle}</p>
       </div>
       <ChevronRight size={14} className="text-slate-800 group-hover:text-slate-400" />
    </div>
    {trend && (
      <div className="h-6 w-full opacity-40">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={[{v:10}, {v:12}, {v:11}, {v:10}, {v:10}]}>
            <Area type="monotone" dataKey="v" stroke={color} fill={`${color}33`} strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    )}
    {showIndicator && (
      <div className="h-1 w-full bg-slate-900 rounded-full overflow-hidden mt-1">
        <div className="h-full bg-emerald-500 w-[60%]" />
      </div>
    )}
    <div className="flex items-baseline gap-1">
      <p className="text-xl font-black text-white tracking-tighter">{value}</p>
      <span className="text-[8px] font-black text-slate-700 uppercase tracking-widest">{unit}</span>
    </div>
    {sub && <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest border-t border-slate-900 pt-1 mt-2">{sub}</p>}
  </div>
);

export default Dashboard;
