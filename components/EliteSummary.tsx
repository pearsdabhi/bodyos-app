import React, { useState, useEffect } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { 
  Trophy, 
  Activity, 
  Target, 
  PieChart, 
  ChevronRight, 
  Sparkles,
  Award,
  TrendingUp,
  Zap
} from 'lucide-react';
import AthleteCard from './AthleteCard';

const EliteSummary: React.FC = () => {
  const [metrics, setMetrics] = useState({
    formScore: 88,
    symmetryScore: 91,
    macroAccuracy: 94,
    history: [
      { date: 'Mon', score: 72 },
      { date: 'Tue', score: 78 },
      { date: 'Wed', score: 75 },
      { date: 'Thu', score: 82 },
      { date: 'Fri', score: 85 },
      { date: 'Sat', score: 88 },
      { date: 'Sun', score: 91 },
    ]
  });

  const athleteData = {
    name: "Athlete Alpha",
    physiqueUrl: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800",
    form: metrics.formScore,
    symmetry: metrics.symmetryScore,
    macro: metrics.macroAccuracy
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 pb-20">
      {/* Header Section */}
      <header className="mb-10 flex justify-between items-end px-2">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter flex items-center gap-3">
            Elite Summary <Trophy className="text-emerald-400" />
          </h1>
          <p className="text-slate-400 mt-2 font-medium italic">Biometric standing & social share engine.</p>
        </div>
        <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] font-black text-emerald-400 uppercase tracking-widest animate-pulse">
           Tier: Alpha Prime
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Dashboard Metrics */}
        <div className="lg:col-span-7 space-y-8">
          {/* Primary Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <MetricCard 
              title="Form Score" 
              value={`${metrics.formScore}%`} 
              icon={<Activity className="text-cyan-400" />} 
              desc="Based on last 5 vision sessions"
            />
            <MetricCard 
              title="Symmetry" 
              value={`${metrics.symmetryScore}`} 
              icon={<Target className="text-emerald-400" />} 
              desc="Latest physique judge scan"
            />
            <MetricCard 
              title="Nutrition" 
              value={`${metrics.macroAccuracy}%`} 
              icon={<PieChart className="text-amber-400" />} 
              desc="7-day calorie adherence"
            />
          </div>

          {/* Progress Chart */}
          <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px]" />
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3">
                  <TrendingUp size={18} className="text-emerald-400" /> Progression Index
               </h3>
               <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Last 7 Sessions</div>
            </div>
            
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={metrics.history}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    stroke="#475569" 
                    fontSize={10} 
                    fontWeight="bold" 
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#020617', 
                      border: '1px solid #1e293b',
                      borderRadius: '1rem',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#10b981" 
                    strokeWidth={4} 
                    fillOpacity={1} 
                    fill="url(#colorScore)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AI Coach Action */}
          <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-[2.5rem] p-8 flex justify-between items-center shadow-2xl shadow-emerald-500/10 group cursor-pointer hover:scale-[1.01] transition-all">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-white border border-white/20">
                 <Sparkles size={32} />
              </div>
              <div>
                <h2 className="text-xl font-black text-white italic tracking-tight flex items-center gap-2">
                  Coach Analysis Complete
                </h2>
                <p className="text-emerald-100/70 text-sm mt-1 font-medium">"Integrity +12% this week. Optimal for PR attempt tomorrow."</p>
              </div>
            </div>
            <button className="bg-white/20 hover:bg-white/30 p-4 rounded-full transition-all text-white">
              <ChevronRight size={24} />
            </button>
          </div>
        </div>

        {/* Shareable Card Section */}
        <div className="lg:col-span-5 flex flex-col items-center">
           <div className="w-full text-center mb-6">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-2 flex items-center justify-center gap-2">
                <Award size={14} className="text-emerald-400" /> Digital Profile Card
              </h3>
              <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest italic">Sync with Physique Engine for auto-update</p>
           </div>
           <AthleteCard athleteData={athleteData} />
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ title, value, icon, desc }: { title: string; value: string; icon: React.ReactNode; desc: string }) => (
  <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] hover:border-emerald-500/30 transition-all shadow-xl group">
    <div className="flex justify-between items-start mb-6">
      <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center group-hover:bg-slate-700 transition-colors shadow-inner">
        {icon}
      </div>
      <span className="text-[9px] text-slate-600 uppercase font-black tracking-widest">{title}</span>
    </div>
    <div className="text-4xl font-black text-white tracking-tighter mb-2">{value}</div>
    <p className="text-[10px] text-slate-500 leading-tight font-medium uppercase tracking-widest">{desc}</p>
  </div>
);

export default EliteSummary;