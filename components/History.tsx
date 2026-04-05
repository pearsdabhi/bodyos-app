
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Award, Dumbbell } from 'lucide-react';

// Mock data for a workout session
const mockWorkoutData = {
  '2026-01-05': {
    summary: {
      title: 'Training Summary 1',
      started: '01:33:52',
      active: '00:17:23',
      rest: '00:04:47',
      completed: 7,
      volume: '15980 lbs'
    },
    exercises: [
      { name: 'Barbell Incline Bench Press', best: '180 lbs', sets: ['45 lbs x 10 reps', '95 lbs x 10 reps', '135 lbs x 8 reps', '155 lbs x 6 reps', '160 lbs x 6 reps', '180 lbs x 6 reps'] },
      { name: 'Dumbbell Bench Press', best: '160 lbs', sets: ['120 lbs x 8 reps', '140 lbs x 8 reps', '160 lbs x 8 reps', '150 lbs x 8 reps'] },
      { name: 'Cable Cross-over', best: null, sets: ['45 lbs x 15 reps', '75 lbs x 15 reps', '75 lbs x 15 reps'] },
      { name: 'Dumbbell Seated Shoulder Press', best: '100 lbs', sets: ['90 lbs x 10 reps', '100 lbs x 10 reps'] },
      { name: 'Dumbbell Lateral Raise', best: '40 lbs', sets: ['40 lbs x 12 reps', '30 lbs x 12 reps'] },
    ]
  }
};

const History: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 0, 5));
  const [selectedDate, setSelectedDate] = useState(new Date(2026, 0, 5));

  const daysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const changeMonth = (offset: number) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + offset);
      return newDate;
    });
  };
  
  const workoutForSelectedDate = mockWorkoutData[selectedDate.toISOString().split('T')[0] as keyof typeof mockWorkoutData];

  const renderCalendar = () => {
    const totalDays = daysInMonth(currentDate);
    const startingDay = firstDayOfMonth(currentDate);
    const blanks = Array(startingDay === 0 ? 6 : startingDay - 1).fill(null);
    const days = Array.from({ length: totalDays }, (_, i) => i + 1);

    return (
      <div className="grid grid-cols-7 gap-2 text-center">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => <div key={d} className="text-[10px] font-black text-slate-600 uppercase">{d}</div>)}
        {blanks.map((_, i) => <div key={`blank-${i}`} />)}
        {days.map(d => {
          const isSelected = selectedDate.getDate() === d && selectedDate.getMonth() === currentDate.getMonth();
          const hasWorkout = d === 5; // Mocking workout day
          return (
            <button
              key={d}
              onClick={() => setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), d))}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-black transition-all mx-auto ${
                isSelected ? 'bg-cyan-500 text-slate-950 shadow-lg' :
                hasWorkout ? 'bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700' :
                'text-slate-500 hover:bg-slate-800'
              }`}
            >
              {d}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <h2 className="text-sm font-black text-white uppercase tracking-widest px-1">Training History</h2>
      
      <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-black text-white">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
          <div className="flex items-center gap-2">
            <button onClick={() => changeMonth(-1)} className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:bg-slate-700"><ChevronLeft size={16} /></button>
            <button onClick={() => setCurrentDate(new Date())} className="px-4 py-2 bg-slate-800 rounded-lg text-xs font-bold text-slate-300 hover:bg-slate-700">Today</button>
            <button onClick={() => changeMonth(1)} className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:bg-slate-700"><ChevronRight size={16} /></button>
          </div>
        </div>
        {renderCalendar()}
        <div className="mt-6 flex items-center gap-4 text-xs font-medium text-slate-500">
          <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-cyan-500/20 border border-cyan-500" /> Progress Photos</div>
          <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-slate-700" /> Notes</div>
          <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-slate-700" /> Body Stats</div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-black text-white">{selectedDate.toLocaleString('default', { month: 'long', day: 'numeric', year: 'numeric' })}</h3>
        {workoutForSelectedDate ? (
          <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-xl divide-y divide-slate-800">
            {/* Summary Section */}
            <div className="p-8">
              <h4 className="font-bold text-slate-200 mb-4">{workoutForSelectedDate.summary.title}</h4>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-sm">
                <div><p className="text-xs text-slate-500">Started</p><p className="font-semibold">{workoutForSelectedDate.summary.started}</p></div>
                <div><p className="text-xs text-slate-500">Active</p><p className="font-semibold">{workoutForSelectedDate.summary.active}</p></div>
                <div><p className="text-xs text-slate-500">Rest</p><p className="font-semibold">{workoutForSelectedDate.summary.rest}</p></div>
                <div><p className="text-xs text-slate-500">Completed</p><p className="font-semibold">{workoutForSelectedDate.summary.completed}</p></div>
                <div><p className="text-xs text-slate-500">Volume</p><p className="font-semibold">{workoutForSelectedDate.summary.volume}</p></div>
              </div>
            </div>

            {/* Exercises List */}
            {workoutForSelectedDate.exercises.map((ex, idx) => (
              <div key={idx} className="p-8 flex flex-col md:flex-row gap-6">
                <div className="md:w-1/3">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center">
                       <Dumbbell size={24} className="text-cyan-400" />
                    </div>
                    <div>
                      <h5 className="font-bold text-white">{ex.name}</h5>
                      {ex.best && <p className="text-xs text-cyan-400 font-semibold flex items-center gap-1 mt-1"><Award size={12} /> BEST: {ex.best}</p>}
                    </div>
                  </div>
                </div>
                <div className="md:w-2/3 grid grid-cols-2 gap-x-8 gap-y-2">
                  {ex.sets.map((set, setIdx) => (
                    <div key={setIdx} className="flex items-center text-sm">
                      <span className="text-slate-500 w-6">{setIdx + 1}</span>
                      <span className="text-slate-300">{set}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-slate-900/50 border-2 border-dashed border-slate-800 rounded-[2.5rem] text-slate-600">
            <p className="font-bold">No training data for this day.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
