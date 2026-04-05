
export enum AppTab {
  HOME = 'home',
  WORKOUTS = 'workouts',
  MEALS = 'meals',
  TRAINER = 'trainer',
  PROFILE = 'profile',
  SCANNER = 'scanner'
}

export interface User {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  trainer_link?: string;
  role?: 'client' | 'trainer';
  privacy_settings?: {
    hide_weight_from_trainer: boolean;
    hide_macros_from_trainer: boolean;
  };
}

export type PermissionType = 'view_biometrics' | 'edit_routines' | 'audit_symmetry' | 'manage_nutrition';

export interface Relationship {
  id: string;
  trainerId: string;
  clientId: string;
  permissions: PermissionType[];
  status: 'pending' | 'active' | 'revoked';
  createdAt: number;
}

export interface MealLogEntry {
  id: string;
  name: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  timestamp: number; // For hourly bucketing
}

export type RecordingType = 'weight_reps' | 'time' | 'distance';

export interface SetLog {
  id?: string;
  weight: number;
  target_weight?: number;
  reps: number;
  completed: boolean;
  ghost_weight?: number;
  ghost_reps?: number;
  // Added optional fields for time and distance tracking
  time_seconds?: number;
  distance_km?: number;
}

export interface SessionExercise {
  type: 'EXERCISE';
  exerciseId: string;
  db_id: string;
  name: string;
  recording_type: RecordingType;
  sets: SetLog[];
  restTimer: number;
  muscle_tags: string[];
  // Added optional field for UI control
  timer_suppressed?: boolean;
}

export interface Superset {
  type: 'SUPERSET';
  id: string;
  exercises: SessionExercise[];
  restAfterGroup: number;
}

export type WorkoutItem = SessionExercise | Superset;

export interface WorkoutSession {
  id: string;
  userId: string;
  date: string;
  title: string;
  items: WorkoutItem[];
  is_tracked?: boolean;
  createdAt: number;
}

export interface Exercise {
  id: string;
  name: string;
  bodyPart: string;
  equipment: string;
  gifUrl: string;
  target: string;
  recording_type: RecordingType;
  muscle_tags: string[];
  instructions: string[];
  videoUrl?: string;
  overview?: string;
  mistakes?: string[];
  purposes?: string[];
}

// Added Message interface for chat components
export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  image?: string;
}

// Added RoutineTemplate interface for the Routine Builder
export interface RoutineTemplate {
  id: string;
  name: string;
  items: WorkoutItem[];
  createdAt: number;
}
