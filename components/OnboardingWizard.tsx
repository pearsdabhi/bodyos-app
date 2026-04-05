
import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { useAuthContext } from '../contexts/AuthContext.tsx';
import { 
  ChevronLeft, 
  Check, 
  Dumbbell, 
  Target, 
  Flame, 
  Scale, 
  Activity, 
  Award,
  Wrench,
  Zap,
  RefreshCcw,
  User,
  Shield,
  Circle,
  CheckCircle2,
  Trophy,
  Star,
  ZapIcon
} from 'lucide-react';

interface OnboardingWizardProps {
  onFinish: (data: any) => void;
}

const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ onFinish }) => {
  const [step, setStep] = useState(1);
  const { user, signIn } = useAuthContext();
  const [formData, setFormData] = useState({
    gender: '',
    height: 180,
    heightUnit: 'cm' as 'cm' | 'ft',
    weight: 90,
    weightUnit: 'kg' as 'kg' | 'lbs',
    experience: '',
    goals: [] as string[],
    frequency: ''
  });

  const totalSteps = 7; // Including Login

  const nextStep = () => setStep(s => Math.min(s + 1, totalSteps));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  useEffect(() => {
    if (user && step === 1) {
      setStep(2);
    }
  }, [user, step]);

  const handleFinish = () => {
    onFinish(formData);
  };

  const progress = ((step - 1) / (totalSteps - 1)) * 100;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col p-6 font-sans">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={prevStep} 
          className={`p-3 bg-slate-900/50 rounded-full text-white transition-all hover:bg-slate-800 ${step <= 2 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        >
          <ChevronLeft size={20} />
        </button>
        <div className="flex-1 max-w-[200px] mx-4">
          <div className="h-1 bg-slate-900 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <div className="w-10" />
      </div>

      <div className="flex-1 flex flex-col max-w-lg mx-auto w-full">
        {step === 1 && <LoginStep onSignIn={signIn} />}
        
        {step === 2 && (
          <SelectionStep 
            title="Select Your Gender"
            subtitle="Help us customize your experience"
            options={[
              { id: 'male', label: 'Male', icon: <User size={20} className="text-blue-400" /> },
              { id: 'female', label: 'Female', icon: <User size={20} className="text-rose-400" /> },
              { id: 'non-binary', label: 'Non-binary', icon: <Activity size={20} className="text-violet-400" /> },
              { id: 'private', label: 'Prefer not to say', icon: <Shield size={20} className="text-slate-400" /> },
            ]}
            selected={formData.gender}
            onSelect={(id) => setFormData({ ...formData, gender: id })}
          />
        )}

        {step === 3 && (
          <PickerStep
            title="Enter Your Height"
            subtitle="This helps us provide accurate analysis"
            unitType="height"
            unit={formData.heightUnit}
            value={formData.height}
            onUnitChange={(u) => setFormData({ ...formData, heightUnit: u as any })}
            onValueChange={(v) => setFormData({ ...formData, height: v })}
          />
        )}

        {step === 4 && (
          <PickerStep
            title="Enter Your Weight"
            subtitle="This helps us provide accurate analysis"
            unitType="weight"
            unit={formData.weightUnit}
            value={formData.weight}
            onUnitChange={(u) => setFormData({ ...formData, weightUnit: u as any })}
            onValueChange={(v) => setFormData({ ...formData, weight: v })}
          />
        )}

        {step === 5 && (
          <SelectionStep 
            title="Your Experience Level"
            subtitle="Help us tailor feedback to your level"
            options={[
              { id: 'beginner', label: 'Beginner', icon: <Star size={20} className="text-emerald-400" /> },
              { id: 'intermediate', label: 'Intermediate', icon: <ZapIcon size={20} className="text-cyan-400" /> },
              { id: 'advanced', label: 'Advanced', icon: <Dumbbell size={20} className="text-orange-400" /> },
              { id: 'professional', label: 'Professional', icon: <Trophy size={20} className="text-amber-400" /> },
            ]}
            selected={formData.experience}
            onSelect={(id) => setFormData({ ...formData, experience: id })}
          />
        )}

        {step === 6 && (
          <MultiSelectionStep 
            title="Your Fitness Goals"
            subtitle="What do you want to achieve?"
            options={[
              { id: 'form', label: 'Fix Lifting Form', icon: <Wrench size={18} className="text-slate-400" /> },
              { id: 'muscle', label: 'Build Muscle', icon: <Dumbbell size={18} className="text-emerald-500" /> },
              { id: 'strength', label: 'Increase Strength', icon: <Zap size={18} className="text-orange-500" /> },
              { id: 'weight', label: 'Lose Weight', icon: <Flame size={18} className="text-rose-500" /> },
              { id: 'bodyfat', label: 'Estimate Bodyfat', icon: <Activity size={18} className="text-blue-400" /> },
              { id: 'other', label: 'Other', icon: <Target size={18} className="text-slate-400" /> },
            ]}
            selected={formData.goals}
            onToggle={(id) => {
              const goals = formData.goals.includes(id) 
                ? formData.goals.filter(g => g !== id) 
                : [...formData.goals, id];
              setFormData({ ...formData, goals });
            }}
          />
        )}

        {step === 7 && (
          <SelectionStep 
            title="Training Frequency"
            subtitle="How often do you train?"
            options={[
              { id: '1-2', label: '1-2 times per week', icon: <div className="w-5 h-5 flex items-center justify-center bg-slate-800 rounded text-[10px] font-black">1</div> },
              { id: '3-4', label: '3-4 times per week', icon: <div className="w-5 h-5 flex items-center justify-center bg-slate-800 rounded text-[10px] font-black">3</div> },
              { id: '5-6', label: '5-6 times per week', icon: <div className="w-5 h-5 flex items-center justify-center bg-slate-800 rounded text-[10px] font-black">5</div> },
              { id: 'daily', label: 'Daily training', icon: <div className="w-5 h-5 flex items-center justify-center bg-slate-800 rounded text-[10px] font-black">7</div> },
              { id: 'varies', label: 'Varies', icon: <RefreshCcw size={18} className="text-slate-400" /> },
            ]}
            selected={formData.frequency}
            onSelect={(id) => setFormData({ ...formData, frequency: id })}
          />
        )}

        {step > 1 && (
          <div className="mt-auto space-y-4 py-6">
            <button 
              onClick={step === totalSteps ? handleFinish : nextStep}
              className="w-full bg-white text-black py-5 rounded-[1.25rem] font-black text-lg transition-all active:scale-95 shadow-xl hover:bg-slate-200"
            >
              Next
            </button>
            <button 
              onClick={nextStep}
              className="w-full text-slate-500 font-bold text-sm uppercase tracking-widest hover:text-white transition-colors"
            >
              Skip
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const LoginStep = ({ onSignIn }: { onSignIn: () => void }) => (
  <div className="flex-1 flex flex-col items-center justify-center text-center space-y-12 animate-in fade-in duration-700">
    <div className="space-y-4">
      <div className="w-20 h-20 bg-emerald-500/10 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
        <Zap size={40} className="text-emerald-500 fill-current" />
      </div>
      <h1 className="text-5xl font-black italic tracking-tighter uppercase leading-none">
        Elite <span className="text-emerald-400">Calibration</span>
      </h1>
      <p className="text-slate-400 max-w-xs mx-auto font-medium">Synchronize your profile with the Nexus Logic engine.</p>
    </div>
    <button 
      onClick={onSignIn} 
      className="w-full bg-white text-black px-8 py-5 rounded-[2rem] font-black text-xl flex items-center justify-center gap-4 shadow-2xl hover:bg-slate-200 transition-all active:scale-95"
    >
      <img src="https://www.google.com/favicon.ico" className="w-6 h-6" alt="G" />
      Sync with Google
    </button>
  </div>
);

const SelectionStep = ({ title, subtitle, options, selected, onSelect }: any) => (
  <div className="flex-1 flex flex-col space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div className="space-y-2">
      <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">{title}</h2>
      <p className="text-slate-500 font-medium text-lg">{subtitle}</p>
    </div>
    <div className="space-y-3">
      {options.map((opt: any) => (
        <button
          key={opt.id}
          onClick={() => onSelect(opt.id)}
          className={`w-full p-6 rounded-2xl border flex items-center justify-between transition-all duration-300 ${
            selected === opt.id 
              ? 'bg-slate-900 border-white text-white shadow-lg' 
              : 'bg-slate-900/50 border-transparent text-slate-500 hover:border-slate-800'
          }`}
        >
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-black/40 border ${selected === opt.id ? 'border-white/20' : 'border-slate-800'}`}>
              {opt.icon}
            </div>
            <span className="font-bold text-lg">{opt.label}</span>
          </div>
          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
            selected === opt.id ? 'bg-white border-white scale-110' : 'border-slate-800'
          }`}>
            {selected === opt.id && <Check size={14} className="text-black stroke-[4]" />}
          </div>
        </button>
      ))}
    </div>
  </div>
);

const MultiSelectionStep = ({ title, subtitle, options, selected, onToggle }: any) => (
  <div className="flex-1 flex flex-col space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div className="space-y-2">
      <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">{title}</h2>
      <p className="text-slate-500 font-medium text-lg">{subtitle}</p>
    </div>
    <div className="grid grid-cols-1 gap-3">
      {options.map((opt: any) => (
        <button
          key={opt.id}
          onClick={() => onToggle(opt.id)}
          className={`p-6 rounded-2xl border flex items-center justify-between transition-all duration-300 ${
            selected.includes(opt.id) 
              ? 'bg-slate-900 border-white text-white' 
              : 'bg-slate-900/50 border-transparent text-slate-500 hover:border-slate-800'
          }`}
        >
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-black/40 border ${selected.includes(opt.id) ? 'border-white/20' : 'border-slate-800'}`}>
              {opt.icon}
            </div>
            <span className="font-bold text-lg">{opt.label}</span>
          </div>
          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
            selected.includes(opt.id) ? 'bg-white border-white scale-110' : 'border-slate-800'
          }`}>
            {selected.includes(opt.id) && <Check size={14} className="text-black stroke-[4]" />}
          </div>
        </button>
      ))}
    </div>
  </div>
);

const PickerStep = ({ title, subtitle, unitType, unit, value, onUnitChange, onValueChange }: any) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const range = unitType === 'height' 
    ? (unit === 'cm' ? Array.from({ length: 100 }, (_, i) => 130 + i) : Array.from({ length: 40 }, (_, i) => (4.5 + (i * 0.1)).toFixed(1)))
    : (unit === 'kg' ? Array.from({ length: 150 }, (_, i) => 40 + i) : Array.from({ length: 300 }, (_, i) => 80 + i));

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const itemHeight = 56; // Matching CSS height of each item
    const index = Math.round(element.scrollTop / itemHeight);
    const newVal = range[index];
    if (newVal !== undefined && newVal !== value) {
      onValueChange(newVal);
    }
  };

  return (
    <div className="flex-1 flex flex-col space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2">
        <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">{title}</h2>
        <p className="text-slate-500 font-medium text-lg">{subtitle}</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 p-1.5 rounded-[1.25rem] flex shadow-inner">
        <button 
          onClick={() => onUnitChange(unitType === 'height' ? 'cm' : 'kg')}
          className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all duration-300 ${unit === (unitType === 'height' ? 'cm' : 'kg') ? 'bg-white text-black shadow-xl' : 'text-slate-500 hover:text-slate-300'}`}
        >
          Metric ({unitType === 'height' ? 'cm' : 'kg'})
        </button>
        <button 
          onClick={() => onUnitChange(unitType === 'height' ? 'ft' : 'lbs')}
          className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all duration-300 ${unit === (unitType === 'height' ? 'ft' : 'lbs') ? 'bg-white text-black shadow-xl' : 'text-slate-500 hover:text-slate-300'}`}
        >
          Imperial ({unitType === 'height' ? 'ft/in' : 'lbs'})
        </button>
      </div>

      <div className="relative flex-1 flex flex-col items-center justify-center">
        <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] mb-8">Select {unitType.toUpperCase()}</p>
        
        <div className="relative w-full h-[280px] overflow-hidden">
          {/* Visual Guides */}
          <div className="absolute inset-0 pointer-events-none z-10">
            <div className="h-1/3 bg-gradient-to-b from-black via-black/80 to-transparent" />
            <div className="absolute top-1/2 -translate-y-1/2 w-full h-14 border-y border-slate-800 bg-slate-900/10 backdrop-blur-[1px]" />
            <div className="absolute bottom-0 w-full h-1/3 bg-gradient-to-t from-black via-black/80 to-transparent" />
          </div>
          
          <div 
            ref={scrollRef}
            onScroll={handleScroll}
            className="h-full overflow-y-auto no-scrollbar snap-y snap-mandatory py-[112px]" // Center the first item
          >
            {range.map((val) => (
              <div key={val} className="h-14 flex items-center justify-center snap-center">
                <span className={`text-2xl font-black transition-all duration-300 ${Number(value) === Number(val) ? 'text-white scale-125' : 'text-slate-800 scale-100'}`}>
                  {val} {unit}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 text-center animate-in slide-in-from-top-4">
          <p className="text-6xl font-black text-white">{value} {unit}</p>
          <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mt-2">This field is optional</p>
        </div>
      </div>
    </div>
  );
};

export default OnboardingWizard;
