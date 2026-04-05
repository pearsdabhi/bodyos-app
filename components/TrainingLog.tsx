
import React, { useState } from 'react';
import History from './History';
import ProgressPhotos from './ProgressPhotos';
import BenchmarkProgress from './BenchmarkProgress';

const InsightsView: React.FC = () => {
    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            <div className="flex items-center justify-center p-1.5 bg-slate-900 border border-slate-800 rounded-2xl">
                 <div className="flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest bg-white text-slate-950 shadow-lg text-center">
                    Exercise Progress
                 </div>
            </div>

            <BenchmarkProgress />
        </div>
    );
};

const TrainingLog: React.FC = () => {
    const [activeView, setActiveView] = useState<'history' | 'photos' | 'insights'>('insights');

    return (
        <div className="space-y-8">
            <div className="border-b border-slate-800 flex items-center gap-6">
                 <button
                    onClick={() => setActiveView('history')}
                    className={`py-4 text-sm font-black uppercase tracking-wider transition-all ${
                        activeView === 'history' ? 'text-white border-b-2 border-white' : 'text-slate-500 hover:text-white'
                    }`}
                >
                    History
                </button>
                <button
                    onClick={() => setActiveView('photos')}
                    className={`py-4 text-sm font-black uppercase tracking-wider transition-all ${
                        activeView === 'photos' ? 'text-white border-b-2 border-white' : 'text-slate-500 hover:text-white'
                    }`}
                >
                    Progress Photos
                </button>
                <button
                    onClick={() => setActiveView('insights')}
                    className={`py-4 text-sm font-black uppercase tracking-wider transition-all ${
                        activeView === 'insights' ? 'text-white border-b-2 border-white' : 'text-slate-500 hover:text-white'
                    }`}
                >
                    Insights
                </button>
            </div>

            {activeView === 'history' && <History />}
            {activeView === 'photos' && <ProgressPhotos />}
            {activeView === 'insights' && <InsightsView />}
        </div>
    );
};

export default TrainingLog;
