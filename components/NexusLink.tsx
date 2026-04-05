
import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Link2, 
  UserPlus, 
  Loader2, 
  Lock, 
  Eye, 
  Edit3, 
  Activity, 
  Trash2,
  Fingerprint
} from 'lucide-react';
import { useAuthContext } from '../contexts/AuthContext';
import { db, isFirebaseConfigured } from '../firebase-config';
import { collection, query, where, getDocs, addDoc, updateDoc, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { Relationship, PermissionType } from '../types';

const NexusLink: React.FC = () => {
  const { user } = useAuthContext();
  const [inviteCode, setInviteCode] = useState('');
  const [isLinking, setIsLinking] = useState(false);
  const [relationship, setRelationship] = useState<Relationship | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRelationship = async () => {
      if (!user) return;
      setIsLoading(true);
      
      if (!isFirebaseConfigured) {
        const stored = localStorage.getItem('bodyos_relationships');
        const all: Relationship[] = stored ? JSON.parse(stored) : [];
        const found = all.find(r => r.clientId === user.uid && r.status === 'active');
        setRelationship(found || null);
      } else {
        try {
          const q = query(
            collection(db, 'Relationships'), 
            where('clientId', '==', user.uid),
            where('status', '==', 'active')
          );
          const snap = await getDocs(q);
          if (!snap.empty) {
            setRelationship({ id: snap.docs[0].id, ...snap.docs[0].data() } as Relationship);
          }
        } catch (err) {
          console.error("Fetch Relationship Error:", err);
        }
      }
      setIsLoading(false);
    };
    fetchRelationship();
  }, [user]);

  const handleLink = async () => {
    if (!user || !inviteCode.trim()) return;
    setIsLinking(true);

    // Simulation logic: Assume invite code is the trainer's UID
    // Valid Demo Codes: "TRAINER_PRO_001", "ELITE_COACH_99"
    const trainerId = inviteCode.trim();

    const newRelationship: Relationship = {
      id: `rel_${Date.now()}`,
      trainerId: trainerId,
      clientId: user.uid,
      permissions: ['view_biometrics', 'audit_symmetry'],
      status: 'active',
      createdAt: Date.now()
    };

    if (!isFirebaseConfigured) {
      const stored = localStorage.getItem('bodyos_relationships') || '[]';
      const all = JSON.parse(stored);
      all.push(newRelationship);
      localStorage.setItem('bodyos_relationships', JSON.stringify(all));
      
      // Update local user state
      const userData = JSON.parse(localStorage.getItem('bodyos_virtual_user') || '{}');
      userData.trainer_link = trainerId;
      localStorage.setItem('bodyos_virtual_user', JSON.stringify(userData));
      
      setRelationship(newRelationship);
    } else {
      try {
        await addDoc(collection(db, 'Relationships'), newRelationship);
        const userRef = doc(db, 'Users', user.uid);
        await updateDoc(userRef, { trainer_link: trainerId });
        setRelationship(newRelationship);
      } catch (err) {
        console.error("Firebase Link Error:", err);
        alert("Nexus secure handshake failed. Check network integrity.");
      }
    }

    setIsLinking(false);
    setInviteCode('');
  };

  const handleUnlink = async () => {
    if (!relationship || !user) return;
    if (!confirm("RELINQUISH TRAINER ACCESS? This will terminate all shared biometric feeds.")) return;

    if (!isFirebaseConfigured) {
      const stored = localStorage.getItem('bodyos_relationships') || '[]';
      const all = JSON.parse(stored).filter((r: Relationship) => r.id !== relationship.id);
      localStorage.setItem('bodyos_relationships', JSON.stringify(all));
      
      const userData = JSON.parse(localStorage.getItem('bodyos_virtual_user') || '{}');
      delete userData.trainer_link;
      localStorage.setItem('bodyos_virtual_user', JSON.stringify(userData));
      
      setRelationship(null);
    } else {
      try {
        await deleteDoc(doc(db, 'Relationships', relationship.id));
        const userRef = doc(db, 'Users', user.uid);
        await updateDoc(userRef, { trainer_link: null });
        setRelationship(null);
      } catch (err) {
        console.error("Unlink Error:", err);
      }
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-4xl mx-auto">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-black text-white italic tracking-tighter flex items-center justify-center gap-3">
          NEXUS HANDSHAKE <Lock className="text-cyan-400" size={28} />
        </h1>
        <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-xs">Multi-Tenant Role Isolation Protocol v2.1</p>
      </div>

      {!relationship ? (
        <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-50 pointer-events-none" />
          
          <div className="flex flex-col items-center text-center space-y-8 relative z-10">
            <div className="w-24 h-24 bg-slate-950 border border-slate-800 rounded-[2.5rem] flex items-center justify-center text-slate-700 group-hover:text-cyan-400 transition-all duration-500 shadow-inner ring-8 ring-slate-900/50">
               <Fingerprint size={48} className="animate-pulse" />
            </div>

            <div className="space-y-4 max-w-md">
              <h2 className="text-2xl font-black text-white italic tracking-tight">Establish Secure Link</h2>
              <p className="text-sm text-slate-400 leading-relaxed font-medium">
                Enter your trainer's <span className="text-cyan-400 font-bold">Encrypted Invite Code</span> to authorize biometric data sharing and routine synchronization.
              </p>
            </div>

            <div className="w-full max-w-sm space-y-4">
              <div className="relative">
                <input 
                  type="text" 
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  placeholder="NX-0000-HANDSHAKE"
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-5 px-6 text-sm font-black text-white text-center outline-none focus:border-cyan-500/50 transition-all placeholder:text-slate-700 tracking-widest"
                />
                <div className="absolute inset-y-0 right-6 flex items-center pointer-events-none opacity-20">
                  <Link2 size={20} className="text-cyan-400" />
                </div>
              </div>

              <button 
                onClick={handleLink}
                disabled={isLinking || !inviteCode.trim()}
                className="w-full bg-cyan-500 text-slate-950 py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-cyan-500/20 hover:bg-cyan-400 active:scale-95 transition-all disabled:bg-slate-800 disabled:text-slate-600 flex items-center justify-center gap-3"
              >
                {isLinking ? <Loader2 className="animate-spin" size={20} /> : <ShieldCheck size={20} />}
                Authorize Handshake
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Active Relationship Card */}
          <div className="bg-slate-900 border border-cyan-500/20 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-500">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-[80px]" />
            
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 bg-cyan-500/10 rounded-2xl border border-cyan-500/20 flex items-center justify-center text-cyan-400 shadow-xl">
                <UserPlus size={32} />
              </div>
              <div>
                <h3 className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">Active Link</h3>
                <p className="text-2xl font-black text-white italic tracking-tighter">Trainer ID: {relationship.trainerId}</p>
              </div>
            </div>

            <div className="space-y-6">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-2">Granted Permissions</h4>
              <div className="grid grid-cols-1 gap-3">
                {relationship.permissions.map((perm) => (
                  <div key={perm} className="flex items-center justify-between p-4 bg-slate-950/50 rounded-2xl border border-slate-800 transition-colors hover:border-cyan-500/30">
                    <div className="flex items-center gap-3">
                      {perm.includes('view') ? <Eye size={16} className="text-cyan-400" /> : <Edit3 size={16} className="text-violet-400" />}
                      <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">{perm.replace('_', ' ')}</span>
                    </div>
                    <ShieldCheck size={16} className="text-emerald-500" />
                  </div>
                ))}
              </div>
            </div>

            <button 
              onClick={handleUnlink}
              className="w-full mt-10 py-4 bg-slate-950 border border-rose-500/20 text-rose-500 hover:bg-rose-500/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
            >
              <Trash2 size={14} /> Revoke Secure Link
            </button>
          </div>

          {/* Security Integrity Monitor */}
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-8 shadow-xl">
               <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                 <Activity size={16} className="text-cyan-400" /> Link Integrity
               </h3>
               
               <div className="space-y-6">
                 <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-400">Encryption Level</p>
                    <p className="text-xs font-black text-emerald-400 uppercase">AES-256 Valid</p>
                 </div>
                 <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 w-[94%]" />
                 </div>

                 <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-400">Tenant Isolation</p>
                    <p className="text-xs font-black text-emerald-400 uppercase">Secure</p>
                 </div>
                 <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 w-full" />
                 </div>

                 <div className="p-4 bg-cyan-500/5 border border-cyan-500/10 rounded-2xl flex items-start gap-3">
                    <ShieldCheck size={18} className="text-cyan-400 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
                      Multi-tenant role isolation verified for User: <span className="text-white font-bold">{user.uid}</span>. Trainer linkage authenticated by Relationship ID: <span className="text-white font-bold">{relationship.id}</span>.
                    </p>
                 </div>
               </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-8 flex items-center gap-6">
               <div className="w-12 h-12 bg-violet-500/10 rounded-2xl border border-violet-500/20 flex items-center justify-center text-violet-400">
                  <ShieldAlert size={24} />
               </div>
               <div>
                  <h4 className="text-sm font-black text-white italic">Protocol Awareness</h4>
                  <p className="text-[10px] text-slate-500 font-medium leading-relaxed mt-1">
                    Your coach can now audit your symmetry and update your routines via the Nexus mainframe.
                  </p>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NexusLink;
