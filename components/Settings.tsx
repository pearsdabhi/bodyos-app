
import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Shield, 
  Eye, 
  EyeOff, 
  Lock, 
  LogOut, 
  ChevronRight,
  UserCheck
} from 'lucide-react';
import { useAuthContext } from '../contexts/AuthContext';

const Settings: React.FC = () => {
  const { user, signOut } = useAuthContext();
  const [privacy, setPrivacy] = useState({
    hideWeight: false,
    hideMacros: true
  });

  return (
    <div className="space-y-10 animate-in fade-in duration-700 max-w-2xl mx-auto pb-32">
      <header className="px-2">
        <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">Athlete Profile</h1>
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mt-2">Privacy & System Config</p>
      </header>

      {/* USER CARD */}
      <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-10 shadow-[12px_12px_24px_#01030a,-12px_-12px_24px_#03091e] flex items-center gap-6 mx-2">
        <div className="w-20 h-20 rounded-full bg-slate-800 border-4 border-slate-950 shadow-xl overflow-hidden ring-2 ring-emerald-500/20">
           <img src={user?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.uid}`} alt="Profile" />
        </div>
        <div>
           <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase">{user?.displayName || 'Alpha Athlete'}</h2>
           <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{user?.email}</p>
           <div className="flex gap-2 mt-3">
              <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[8px] font-black text-emerald-500 uppercase tracking-widest">Active Client</span>
              <span className="px-3 py-1 bg-slate-800 rounded-full text-[8px] font-black text-slate-500 uppercase tracking-widest">V2.1 Nexus</span>
           </div>
        </div>
      </div>

      {/* PRIVACY TOGGLES */}
      <section className="px-2 space-y-6">
        <div className="flex items-center gap-2 mb-4">
           <Shield size={16} className="text-emerald-500" />
           <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Trainer Visibility Controls</h3>
        </div>
        
        <div className="space-y-4">
           <div 
             onClick={() => setPrivacy(p => ({...p, hideWeight: !p.hideWeight}))}
             className={`p-6 rounded-[2rem] border transition-all cursor-pointer flex justify-between items-center ${privacy.hideWeight ? 'bg-slate-950 border-slate-800 text-slate-600' : 'bg-slate-900 border-emerald-500/20 text-white shadow-lg'}`}
           >
              <div className="flex items-center gap-4">
                 {privacy.hideWeight ? <EyeOff size={20} /> : <Eye size={20} />}
                 <div>
                    <p className="text-sm font-black uppercase italic tracking-tighter">Biometric Weight Feed</p>
                    <p className="text-[8px] font-bold uppercase tracking-widest mt-1">{privacy.hideWeight ? 'Hidden from Trainer' : 'Visible to Trainer'}</p>
                 </div>
              </div>
              <div className={`w-12 h-6 rounded-full p-1 transition-colors ${privacy.hideWeight ? 'bg-slate-800' : 'bg-emerald-500'}`}>
                 <div className={`w-4 h-4 rounded-full bg-white transition-transform ${privacy.hideWeight ? 'translate-x-0' : 'translate-x-6'}`} />
              </div>
           </div>

           <div 
             onClick={() => setPrivacy(p => ({...p, hideMacros: !p.hideMacros}))}
             className={`p-6 rounded-[2rem] border transition-all cursor-pointer flex justify-between items-center ${privacy.hideMacros ? 'bg-slate-950 border-slate-800 text-slate-600' : 'bg-slate-900 border-emerald-500/20 text-white shadow-lg'}`}
           >
              <div className="flex items-center gap-4">
                 {privacy.hideMacros ? <EyeOff size={20} /> : <Eye size={20} />}
                 <div>
                    <p className="text-sm font-black uppercase italic tracking-tighter">Detailed Macro Log</p>
                    <p className="text-[8px] font-bold uppercase tracking-widest mt-1">{privacy.hideMacros ? 'Hidden from Trainer' : 'Visible to Trainer'}</p>
                 </div>
              </div>
              <div className={`w-12 h-6 rounded-full p-1 transition-colors ${privacy.hideMacros ? 'bg-slate-800' : 'bg-emerald-500'}`}>
                 <div className={`w-4 h-4 rounded-full bg-white transition-transform ${privacy.hideMacros ? 'translate-x-0' : 'translate-x-6'}`} />
              </div>
           </div>
        </div>
      </section>

      {/* ACCOUNT ACTIONS */}
      <section className="px-2 pt-10">
         <button 
           onClick={signOut}
           className="w-full py-6 bg-rose-500/10 border border-rose-500/20 rounded-[2rem] text-rose-500 font-black text-xs uppercase tracking-[0.4em] flex items-center justify-center gap-4 hover:bg-rose-500 hover:text-white transition-all shadow-xl shadow-rose-500/5"
         >
           <LogOut size={20} /> Relinquish Nexus Session
         </button>
      </section>

      <footer className="text-center pt-20">
         <p className="text-[7px] font-black text-slate-800 uppercase tracking-[1em]">Central Nexus Isolation Protocol ACTIVE</p>
      </footer>
    </div>
  );
};

export default Settings;
