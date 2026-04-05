
import { useMemo } from 'react';
import { WorkoutSession } from '../types';

export const useNexusLogic = (sessions: WorkoutSession[]) => {
  // Symmetry Audit: [Weekly Pull Volume] / [Weekly Push Volume]
  const symmetryAudit = useMemo(() => {
    let pushVolume = 0;
    let pullVolume = 0;
    
    // Simple tag-based volume calculation for the last 7 days
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recentSessions = sessions.filter(s => s.createdAt > oneWeekAgo && s.is_tracked);

    recentSessions.forEach(session => {
      session.items.forEach(item => {
        if (item.type === 'EXERCISE') {
          const vol = item.sets.reduce((acc, set) => acc + (set.completed ? (set.weight * set.reps) : 0), 0);
          // Simplified logic: checking if name contains 'Press' or 'Push' vs 'Row' or 'Pull'
          const name = item.name.toLowerCase();
          if (name.includes('press') || name.includes('push') || name.includes('squat')) pushVolume += vol;
          if (name.includes('row') || name.includes('pull') || name.includes('deadlift') || name.includes('curl')) pullVolume += vol;
        }
      });
    });

    const ratio = pushVolume === 0 ? 1 : pullVolume / pushVolume;
    let status: 'STABLE' | 'WARNING_PUSH' | 'WARNING_PULL' = 'STABLE';
    let message = "Symmetry Balanced";

    // New V2.0 Threshold: 1.25
    if (ratio < 0.8) {
      status = 'WARNING_PUSH';
      message = "Push dominant - Add pulling movements";
    } else if (ratio > 1.25) {
      status = 'WARNING_PULL';
      message = "Pull dominant - Add pushing movements";
    }

    return { ratio: ratio.toFixed(2), status, message, pushVolume, pullVolume };
  }, [sessions]);

  // Muscle Fatigue Score: Exponential Decay Formula
  // Fatigue = 100 * e^(-0.02 * hours_since_last_session)
  const fatigueStatus = useMemo(() => {
    const lastSession = sessions.filter(s => s.is_tracked).sort((a, b) => b.createdAt - a.createdAt)[0];
    if (!lastSession) return { score: 0, state: 'PEAK' };

    const hoursSince = (Date.now() - lastSession.createdAt) / (1000 * 60 * 60);
    const score = Math.round(100 * Math.exp(-0.015 * hoursSince)); // k=0.015 for moderate recovery speed

    let state: 'RECOVERY' | 'STABLE' | 'PEAK' = 'STABLE';
    if (score > 75) state = 'RECOVERY';
    if (score < 30) state = 'PEAK';

    return { score, state, hoursSince: Math.round(hoursSince) };
  }, [sessions]);

  return { symmetryAudit, fatigueStatus };
};
