
import React, { useState, useMemo } from 'react';
import { 
  Dumbbell, 
  Loader2, 
  Search,
  LayoutGrid,
  ClipboardList,
  Library,
  Ghost,
  X
} from 'lucide-react';
import useExerciseLibrary from '../hooks/useExerciseLibrary';
import { Exercise } from '../types';
import WorkoutPlanner from './WorkoutPlanner';
import WorkoutTracker from './WorkoutTracker';
import RoutineBuilder from './RoutineBuilder';

const BODY_PARTS = [
  "All", "Abs and Core", "Back", "Biceps", "Calves", "Cardio-Respiratory System",
  "Chest", "Forearms", "Full Body", "Hips & Buttocks", "Legs", "Neck",
  "Shoulders", "Triceps", "Upper Body"
];

const BODY_PART_MAP: { [key: string]: string } = {
    "All": "all",
    "Biceps": "Biceps",
    "Triceps": "upper arms",
    "Legs": "Legs",
    "Abs and Core": "waist",
    "Shoulders": "shoulders",
    "Back": "back",
    "Chest": "chest",
    "Calves": "lower legs",
    "Forearms": "lower arms",
};

const ExerciseDetail: React.FC<{ exercise: Exercise; onClose: () => void }> = ({ exercise, onClose }) => {
  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-lg flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-[#0c111c] border border-slate-800 rounded-3xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col relative">
        <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-slate-900/50 rounded-full text-slate-500 hover:text-white z-20 transition-colors">
          <X size={20} />
        </button>
        
        <div className="flex-1 overflow-y-auto no-scrollbar p-8">
          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* Video Player */}
              <div className="bg-black rounded-2xl aspect-video overflow-hidden border border-slate-800 shadow-xl">
                {exercise.videoUrl && exercise.videoUrl !== '#' ? (
                  <iframe 
                    src={exercise.videoUrl} 
                    className="w-full h-full"
                    allow="autoplay; fullscreen; picture-in-picture" 
                    title={exercise.name}
                  ></iframe>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-600">No Video Available</div>
                )}
              </div>

              {/* Text Sections */}
              <div className="space-y-6">
                <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase">{exercise.name}</h1>
                
                {exercise.overview && (
                  <div className="space-y-2">
                    <h2 className="text-lg font-bold text-slate-300">Overview</h2>
                    <p className="text-slate-400 text-sm leading-relaxed">{exercise.overview}</p>
                  </div>
                )}
                
                {exercise.instructions && (
                  <div className="space-y-3">
                    <h2 className="text-lg font-bold text-slate-300">Description</h2>
                    <ul className="list-disc list-inside space-y-2 text-slate-400 text-sm">
                      {exercise.instructions.map((step, i) => <li key={i}>{step}</li>)}
                    </ul>
                  </div>
                )}

                {exercise.mistakes && (
                  <div className="space-y-3">
                    <h2 className="text-lg font-bold text-slate-300">Mistakes</h2>
                    <ul className="list-disc list-inside space-y-2 text-slate-400 text-sm">
                      {exercise.mistakes.map((mistake, i) => <li key={i}>{mistake}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-sm font-bold text-slate-400 mb-4 uppercase tracking-wider">Muscle Groups</h3>
                <div className="space-y-2">
                  {exercise.muscle_tags.map((tag, i) => (
                    <p key={i} className="text-slate-300 text-sm capitalize">{tag}</p>
                  ))}
                </div>
              </div>
              
              {exercise.purposes && (
                 <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                  <h3 className="text-sm font-bold text-slate-400 mb-4 uppercase tracking-wider">Purposes</h3>
                  <div className="space-y-2">
                    {exercise.purposes.map((purpose, i) => (
                      <p key={i} className="text-slate-300 text-sm">{purpose}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


const Workouts: React.FC = () => {
  const [activeTab, setActiveTab] = useState('library');
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState({ muscle: 'Legs', equipment: 'All' });
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  
  const mappedMuscle = BODY_PART_MAP[filter.muscle] || filter.muscle.toLowerCase();
  const { exercises, loading: loadingExercises } = useExerciseLibrary(mappedMuscle, filter.equipment, searchQuery);

  const filteredExercises = useMemo(() => {
    return exercises;
  }, [exercises]);

  return (
    <div className="space-y-8 pb-24 animate-in fade-in duration-700 relative">
       {selectedExercise && (
        <ExerciseDetail 
          exercise={selectedExercise} 
          onClose={() => setSelectedExercise(null)} 
        />
      )}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 px-2">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter flex items-center gap-3 italic uppercase">
            Training Lab <Dumbbell className="text-cyan-400" />
          </h1>
          <p className="text-slate-400 mt-1 font-medium max-w-lg leading-relaxed">
            Neural architecture and symmetry auditing for high-performance biology.
          </p>
        </div>
      </div>

      {/* Sub Navigation */}
      <div className="mt-8 border-b border-slate-900 flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth">
        {[
          { id: 'library', label: 'Library', icon: <Library size={14} /> },
          { id: 'planner', label: 'Nexus Plan', icon: <Ghost size={14} /> },
          { id: 'builder', label: 'Builder', icon: <LayoutGrid size={14} /> },
          { id: 'tracker', label: 'Session', icon: <ClipboardList size={14} /> },
        ].map((tab) => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)} 
            className={`
              py-4 px-5 text-[10px] font-black transition-all border-b-4 uppercase tracking-widest flex items-center gap-2 whitespace-nowrap
              ${activeTab === tab.id ? 'text-cyan-400 border-cyan-400 bg-cyan-500/5 shadow-[0_4px_20px_rgba(34,211,238,0.1)]' : 'text-slate-600 border-transparent hover:text-slate-300'}
            `}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>
      
      {activeTab === 'library' && (
        <div className="animate-in fade-in duration-300 pt-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-3">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-1 sticky top-24">
                {BODY_PARTS.map((part) => (
                  <button
                    key={part}
                    onClick={() => setFilter({ ...filter, muscle: part })}
                    className={`w-full text-left px-6 py-3 rounded-2xl text-sm font-bold transition-all flex justify-between items-center ${
                      filter.muscle === part
                        ? 'bg-cyan-500 text-slate-950 shadow-lg'
                        : 'text-slate-400 hover:bg-slate-800/50'
                    }`}
                  >
                    {part}
                    {filter.muscle === part && (
                      <div className="w-0 h-0 
                        border-t-[10px] border-t-transparent
                        border-l-[15px] border-l-slate-950
                        border-b-[10px] border-b-transparent">
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-9 space-y-8">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
                <h2 className="text-2xl font-black text-white mb-2">Hyperstrike Exercise Videos</h2>
                <p className="text-sm text-slate-500 mb-6">Currently showing {filteredExercises.length} exercises</p>
                <div className="flex gap-4">
                  <input
                    type="text"
                    placeholder="Search all exercises"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-cyan-500/50 transition-all"
                  />
                  <button className="bg-slate-800 border border-slate-700 px-6 rounded-xl text-sm font-bold text-slate-300 hover:bg-slate-700">
                    Search
                  </button>
                </div>
              </div>
              
              <div className="space-y-6">
                {loadingExercises ? (
                  <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-cyan-400" /></div>
                ) : (
                  filteredExercises.map((ex) => (
                    <div 
                      key={ex.id} 
                      onClick={() => setSelectedExercise(ex)}
                      className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-lg flex flex-col sm:flex-row gap-6 cursor-pointer hover:border-cyan-500/30 transition-all group"
                    >
                      <img src={ex.gifUrl} alt={ex.name} className="w-32 h-32 object-cover bg-slate-800 rounded-2xl border border-slate-700 flex-shrink-0" />
                      <div className="flex-1">
                        <h3 className="text-xl font-black text-cyan-400 mb-2 uppercase italic tracking-tighter">{ex.name}</h3>
                        <p className="text-sm text-slate-400 leading-relaxed mb-4 line-clamp-3">{Array.isArray(ex.instructions) ? ex.instructions.join(' ') : ex.overview}</p>
                        <span className="text-sm font-bold text-white underline group-hover:text-cyan-400 transition-colors">
                          Watch Video
                        </span>
                      </div>
                    </div>
                  ))
                )}
                {filteredExercises.length === 0 && !loadingExercises && (
                   <div className="text-center py-20 bg-slate-900/50 border-2 border-dashed border-slate-800 rounded-[2.5rem] text-slate-600">
                     <p className="font-bold">No exercises found for this filter.</p>
                   </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'planner' && <div className="pt-8"><WorkoutPlanner onPlanInitialized={() => setActiveTab('tracker')} /></div>}
      {activeTab === 'builder' && <div className="pt-8"><RoutineBuilder /></div>}
      {activeTab === 'tracker' && <div className="pt-8"><WorkoutTracker /></div>}
    </div>
  );
};

export default Workouts;
