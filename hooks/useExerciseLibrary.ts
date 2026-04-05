
import { useState, useEffect, useCallback } from 'react';
import { db, isFirebaseConfigured } from '../firebase-config';
import { collection, query, getDocs, limit as firestoreLimit, startAfter } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { Exercise } from '../types';

const PAGE_SIZE = 20;

const useExerciseLibrary = (muscleGroupId: string = 'all', equipmentId: string = 'all', searchTerm: string = '') => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  // Expanded Master Mock Data to simulate ExerciseDB's vast library
  const getMockData = useCallback(() => {
    const base = [
      { id: 'ex_1', name: 'Barbell Bench Press', bodyPart: 'chest', equipment: 'barbell', target: 'pectorals', recording_type: 'weight_reps', muscle_tags: ['chest', 'triceps'], gifUrl: 'https://v2.exercisedb.io/image/0025', instructions: ['Lie on a flat bench with your feet firmly on the ground.', 'Grip the barbell with hands slightly wider than shoulder-width apart.', 'Lower the bar to your mid-chest, keeping your elbows tucked at a 45-degree angle.', 'Press the bar back up to the starting position.'], videoUrl: '#' },
      { id: 'ex_2', name: 'Lat Pulldown', bodyPart: 'back', equipment: 'cable', target: 'lats', recording_type: 'weight_reps', muscle_tags: ['back', 'biceps'], gifUrl: 'https://v2.exercisedb.io/image/0150', instructions: ['Sit down at the lat pulldown machine and adjust the knee pad.', 'Grasp the bar with a wide grip.', 'Pull the bar down to your upper chest, squeezing your back muscles.', 'Slowly return the bar to the starting position.'], videoUrl: '#' },
      { id: 'ex_3', name: 'Back Squat', bodyPart: 'upper legs', equipment: 'barbell', target: 'quadriceps', recording_type: 'weight_reps', muscle_tags: ['legs', 'quads'], gifUrl: 'https://v2.exercisedb.io/image/0032', instructions: ['Break at hips', 'Drive through heels'], videoUrl: '#' },
      { id: 'ex_4', name: 'Alternating Curl -- Seated', bodyPart: 'Biceps', equipment: 'dumbbell', target: 'biceps', recording_type: 'weight_reps', muscle_tags: ['arms', 'biceps'], gifUrl: 'https://v2.exercisedb.io/image/0285', instructions: ['The Alternating seated curl is a great biceps builder.', 'This exercise lets you focus on your biceps without letting you cheat with your body.', 'Alternating arms gives each side a little rest so you can pump out a few more repetitions.', 'To perform this exercise you will need a pair of dumbbells and a place to sit.', 'Keep your wrists straight and palms up.', 'This is a "must have" for anyone looking for great arms.'], videoUrl: '#' },
      { id: 'ex_5', name: 'Seated Row', bodyPart: 'back', equipment: 'cable', target: 'rhomboids', recording_type: 'weight_reps', muscle_tags: ['back'], gifUrl: 'https://v2.exercisedb.io/image/0180', instructions: ['Pull to waist', 'Retract shoulders'], videoUrl: '#' },
      { id: 'ex_6', name: 'Lateral Raise', bodyPart: 'shoulders', equipment: 'dumbbell', target: 'deltoids', recording_type: 'weight_reps', muscle_tags: ['shoulders'], gifUrl: 'https://v2.exercisedb.io/image/0334', instructions: ['Raise to shoulder height', 'Slight elbow bend'], videoUrl: '#' },
      { id: 'ex_7', name: 'Leg Extension', bodyPart: 'upper legs', equipment: 'machine', target: 'quadriceps', recording_type: 'weight_reps', muscle_tags: ['legs', 'quads'], gifUrl: 'https://v2.exercisedb.io/image/0585', instructions: ['Extend legs fully', 'Squeeze quads at top'], videoUrl: '#' },
      { id: 'ex_8', name: 'Tricep Pushdown', bodyPart: 'upper arms', equipment: 'cable', target: 'triceps', recording_type: 'weight_reps', muscle_tags: ['arms', 'triceps'], gifUrl: 'https://v2.exercisedb.io/image/0200', instructions: ['Push down to lockout', 'Keep elbows tucked'], videoUrl: '#' },
      { id: 'ex_9', name: 'Leg Press', bodyPart: 'upper legs', equipment: 'machine', target: 'quadriceps', recording_type: 'weight_reps', muscle_tags: ['legs'], gifUrl: 'https://v2.exercisedb.io/image/0561', instructions: ['Lower under control', 'Push back up'], videoUrl: '#' },
      { id: 'ex_10', name: 'Deadlift', bodyPart: 'back', equipment: 'barbell', target: 'glutes', recording_type: 'weight_reps', muscle_tags: ['back', 'legs'], gifUrl: 'https://v2.exercisedb.io/image/0031', instructions: ['Flat back', 'Drive through floor'], videoUrl: '#' },
      { id: 'ex_11', name: 'Alternating Curl -- Standing', bodyPart: 'Biceps', equipment: 'dumbbell', target: 'biceps', recording_type: 'weight_reps', muscle_tags: ['arms', 'biceps'], gifUrl: 'https://v2.exercisedb.io/image/0286', instructions: ['The standing alternating curl is a bodybuilding staple.', 'You can use more weight than the seated variation because you can cheat by using your body to help swing the weight up.', 'For strength development, use heavier dumbbells even though you won\'t be able to perform as many repetitions.', 'Using dumbbells allows you to use both elbow flexion and supination.'], videoUrl: '#' },
      { id: 'ex_12', name: 'Alternating Hammer Curl -- Seated', bodyPart: 'Biceps', equipment: 'dumbbell', target: 'biceps', recording_type: 'weight_reps', muscle_tags: ['arms', 'biceps'], gifUrl: 'https://v2.exercisedb.io/image/0290', instructions: ['The alternating hammer curl performed while seated helps build wrist and forearm strength.', 'At the same time this exercise develops the brachioradialis.', 'This exercise is a great way to finish your biceps workout.', 'Replacing the bench with a swiss ball would increase the demand on your core muscles.'], videoUrl: '#' },
      { 
        id: 'ex_13', 
        name: 'Alternating Split-Squat Jump', 
        bodyPart: 'Legs', 
        equipment: 'body weight', 
        target: 'quadriceps', 
        recording_type: 'weight_reps', 
        muscle_tags: ['Legs', 'Abs and Core', 'Full Body', 'Hips & Buttocks'], 
        gifUrl: 'https://v2.exercisedb.io/image/0017', 
        videoUrl: 'https://player.vimeo.com/video/902839943?badge=0&autopause=0&player_id=0&app_id=58479',
        overview: "The alternating split-squat jump is not for beginners. This exercise is very demanding and requires a strong base before attempting. After performing a few reps you will feel like you ran wind sprints. It's a good exercise for building strength and explosiveness for sports such as basketball, volleyball and other jumping sports. While building strength this exercise is also good for cardiovascular endurance. You might consider this exercise if you are cross training.",
        instructions: [
            'Stand with your feet staggered about 18 to 24 inches apart, front and back.',
            'Jump up and while in the air quickly switch legs forward and backward.',
            'Land and absorb the impact softly by bending both legs until the back knee is about an inch from the ground.',
            "Keep your chest up and maintain good posture throughout. The front knee shouldn't move too far past the toes."
        ],
        mistakes: ['Hunching and not keeping the chest up'],
        purposes: ['Leg power', 'Hip power']
      },
    ] as Exercise[];

    // Generate more mock variations for pagination demo
    const extended = [...base];
    for (let i = 14; i <= 60; i++) {
        const template = base[i % base.length];
        extended.push({
            ...template,
            id: `ex_${i}`,
            name: `${template.name} Var. ${i}`,
            videoUrl: '#',
        });
    }
    return extended;
  }, []);

  useEffect(() => {
    // Reset when filters change
    setPage(1);
    setExercises([]);
    setHasMore(true);
  }, [muscleGroupId, equipmentId, searchTerm]);

  useEffect(() => {
    const fetchExercises = async () => {
      setLoading(true);
      try {
        let library: Exercise[] = [];
        
        if (!isFirebaseConfigured) {
          library = getMockData();
        } else {
          const col = collection(db, "exercise_library");
          const q = query(col, firestoreLimit(100));
          const snap = await getDocs(q);
          library = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Exercise));
        }

        // Apply filtering
        let filtered = library.filter(ex => {
          const mMatch = muscleGroupId === 'all' || ex.bodyPart.toLowerCase() === muscleGroupId.toLowerCase();
          const eMatch = equipmentId === 'all' || ex.equipment.toLowerCase() === equipmentId.toLowerCase();
          const sMatch = !searchTerm || ex.name.toLowerCase().includes(searchTerm.toLowerCase());
          return mMatch && eMatch && sMatch;
        });

        // Apply pagination (Local simulation)
        const startIndex = 0;
        const endIndex = page * PAGE_SIZE;
        const paginated = filtered.slice(startIndex, endIndex);

        setExercises(paginated);
        setHasMore(endIndex < filtered.length);
      } catch (err) {
        console.error("Library Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchExercises();
  }, [muscleGroupId, equipmentId, searchTerm, page, getMockData]);

  const loadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
    }
  };

  return { exercises, loading, hasMore, loadMore };
};

export default useExerciseLibrary;
