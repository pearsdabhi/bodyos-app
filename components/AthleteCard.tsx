
import React, { useRef } from 'react';
import { toPng } from 'html-to-image';
import { Download, Share2, Command } from 'lucide-react';

interface AthleteData {
  name: string;
  physiqueUrl: string;
  form: number;
  symmetry: number;
  macro: number;
}

const AthleteCard: React.FC<{ athleteData: AthleteData }> = ({ athleteData }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const downloadCard = async () => {
    if (cardRef.current === null) return;
    try {
      const dataUrl = await toPng(cardRef.current, { 
        cacheBust: true,
        style: { borderRadius: '2rem' }
      });
      const link = document.createElement('a');
      link.download = `BODYOS-Elite-Card-${athleteData.name}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Export Error:", err);
    }
  };

  const shareCard = async () => {
    if (cardRef.current === null) return;
    try {
      const dataUrl = await toPng(cardRef.current);
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], 'bodyos-elite-card.png', { type: 'image/png' });
      
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'My BODYOS Elite Stats',
          text: `Check out my progress on BODYOS! My current form integrity is ${athleteData.form}%.`,
        });
      } else {
        alert("Sharing not supported on this browser. Try downloading the card instead.");
      }
    } catch (err) {
      console.error("Share Error:", err);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 p-4">
      <div 
        ref={cardRef} 
        className="relative w-[350px] h-[500px] rounded-[2rem] overflow-hidden bg-slate-950 border-4 border-emerald-500 shadow-2xl shadow-emerald-500/20"
      >
        <img 
          src={athleteData.physiqueUrl} 
          className="absolute inset-0 w-full h-full object-cover opacity-70 grayscale hover:grayscale-0 transition-all duration-700" 
          alt="Physique" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
        
        <div className="absolute top-8 left-8 flex items-center gap-2">
          <div className="w-6 h-6 bg-emerald-500 rounded-md flex items-center justify-center">
            <Command size={14} className="text-slate-950" />
          </div>
          <span className="text-sm font-black tracking-tighter text-white">BODYOS</span>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-8">
          <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em] mb-1">Elite Athlete</p>
          <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-6 text-white leading-none">
            {athleteData.name}
          </h2>
          <div className="grid grid-cols-3 gap-2">
            <StatBox label="FORM" value={athleteData.form} />
            <StatBox label="SYM" value={athleteData.symmetry} />
            <StatBox label="MACRO" value={athleteData.macro} />
          </div>
        </div>
        
        <div className="absolute top-8 right-8 bg-emerald-500 text-slate-950 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
          V1-ELITE
        </div>
      </div>

      <div className="flex gap-4 w-full max-w-[350px]">
        <button 
          onClick={downloadCard} 
          className="flex-1 flex items-center justify-center gap-2 bg-slate-900 border border-slate-800 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all text-emerald-400"
        >
          <Download size={18} /> Save PNG
        </button>
        <button 
          onClick={shareCard} 
          className="flex-1 flex items-center justify-center gap-2 bg-emerald-500 text-slate-950 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/20"
        >
          <Share2 size={18} /> Share
        </button>
      </div>
    </div>
  );
};

const StatBox = ({ label, value }: { label: string; value: number }) => (
  <div className="bg-slate-900/80 backdrop-blur-md p-3 rounded-2xl text-center border border-emerald-500/20 shadow-inner">
    <div className="text-2xl font-black text-emerald-400 tracking-tighter">{value}</div>
    <div className="text-[8px] uppercase font-black text-slate-500 leading-none mt-1">{label}</div>
  </div>
);

export default AthleteCard;
