
import * as React from 'react';
import { useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Dumbbell, 
  Utensils, 
  ShieldUser, 
  User, 
  Loader2,
  Library,
  Scan
} from 'lucide-react';
import Dashboard from './components/Dashboard.tsx';
import Workouts from './components/Workouts.tsx';
import MealsStudio from './components/MealsStudio.tsx';
import NexusLink from './components/NexusLink.tsx';
import Settings from './components/Settings.tsx';
import OnboardingWizard from './components/OnboardingWizard.tsx';
import FormAnalysis from './components/FormAnalysis.tsx';
import { AuthProvider, useAuthContext } from './contexts/AuthContext.tsx';
import { AppTab } from './types.ts';

const BottomNav: React.FC = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === '/' + path;

  const navItems = [
    { label: 'Dash', icon: <LayoutDashboard size={20} />, tab: AppTab.HOME },
    { label: 'Train', icon: <Dumbbell size={20} />, tab: AppTab.WORKOUTS },
    { label: 'Fuel', icon: <Utensils size={20} />, tab: AppTab.MEALS },
    { label: 'Coach', icon: <ShieldUser size={20} />, tab: AppTab.TRAINER },
    { label: 'Scan', icon: <Scan size={20} />, tab: AppTab.SCANNER },
    { label: 'Profile', icon: <User size={20} />, tab: AppTab.PROFILE },
  ];

  return (
    <nav className="fixed bottom-6 inset-x-4 h-20 bg-slate-900/90 backdrop-blur-2xl border border-slate-800/50 rounded-[2.5rem] px-2 flex items-center justify-around z-50 shadow-[10px_10px_20px_#01030a,-10px_-10px_20px_#03091e]">
      {navItems.map((item) => (
        <Link
          key={item.tab}
          to={`/${item.tab}`}
          className={`
            flex flex-col items-center gap-1 transition-all duration-300 relative px-2
            ${isActive(item.tab) ? 'text-cyan-400 scale-110' : 'text-slate-500 hover:text-slate-300'}
          `}
        >
          <div className={`p-2.5 rounded-2xl transition-all ${isActive(item.tab) ? 'bg-cyan-500/10 shadow-[inset_2px_2px_5px_#01030a,inset_-2px_-2px_5px_#03091e]' : ''}`}>
            {item.icon}
          </div>
          <span className="text-[8px] font-black uppercase tracking-widest">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
};

const MainApp: React.FC = () => {
  const { user, loading } = useAuthContext();
  const [onboardingDone, setOnboardingDone] = useState(localStorage.getItem('onboardingComplete') === 'true');

  if (loading) return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center space-y-4">
      <Loader2 className="animate-spin text-emerald-500" size={48} />
      <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] animate-pulse">Establishing Nexus Handshake</p>
    </div>
  );

  if (!user || !onboardingDone) {
    return <OnboardingWizard onFinish={() => {
      localStorage.setItem('onboardingComplete', 'true');
      setOnboardingDone(true);
    }} />;
  }

  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-emerald-500/30">
        <main className="flex-1 overflow-x-hidden pb-32">
          <div className="max-w-6xl mx-auto p-6 lg:p-12">
            <Routes>
              <Route path={`/${AppTab.HOME}`} element={<Dashboard />} />
              <Route path={`/${AppTab.WORKOUTS}`} element={<Workouts />} />
              <Route path={`/${AppTab.MEALS}`} element={<MealsStudio />} />
              <Route path={`/${AppTab.TRAINER}`} element={<NexusLink />} />
              <Route path={`/${AppTab.PROFILE}`} element={<Settings />} />
              <Route path={`/${AppTab.SCANNER}`} element={<FormAnalysis />} />
              <Route path="/" element={<Navigate to={`/${AppTab.HOME}`} replace />} />
            </Routes>
          </div>
        </main>
        <BottomNav />
      </div>
    </Router>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
};

export default App;
