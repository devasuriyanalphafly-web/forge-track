import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Dumbbell,
  SlidersHorizontal,
  Target,
  Sparkles,
  BicepsFlexed,
  Activity,
  CircleDot,
  Cable,
  Gauge,
  PersonStanding,
  Footprints,
  MoveUp,
  MoveDown,
  MoveHorizontal,
  Shield,
  Zap,
  CircleGauge,
  Weight,
} from 'lucide-react';
import API from '../api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import toast from 'react-hot-toast';
import './Exercises.css';


const EXERCISE_IMAGE_MAP = [
  {
    match: ['bench press'],
    url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c149a?w=900&q=82',
  },
  {
    match: ['incline dumbbell press', 'chest fly'],
    url: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=900&q=82',
  },
  {
    match: ['push up', 'push-up'],
    url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=900&q=82',
  },
  {
    match: ['lat pulldown', 'pull up', 'pull-up'],
    url: 'https://images.unsplash.com/photo-1581009137042-c552e485697a?w=900&q=82',
  },
  {
    match: ['barbell row', 'dumbbell row', 'seated cable row'],
    url: 'https://images.unsplash.com/photo-1603287681836-b174ce5074c2?w=900&q=82',
  },
  {
    match: ['barbell squat', 'squat', 'leg press', 'leg extension', 'leg curl'],
    url: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=900&q=82',
  },
  {
    match: ['walking lunges', 'lunge', 'lunges'],
    url: 'https://images.unsplash.com/photo-1534368420009-621bfab424a8?w=900&q=82',
  },
  {
    match: ['romanian deadlift', 'deadlift'],
    url: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=900&q=82',
  },
  {
    match: ['overhead press', 'shoulder press', 'front raise', 'lateral raise'],
    url: 'https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=900&q=82',
  },
  {
    match: ['barbell curl', 'dumbbell curl', 'hammer curl', 'bicep curl'],
    url: 'https://images.unsplash.com/photo-1584863231364-2edc166de576?w=900&q=82',
  },
  {
    match: ['tricep pushdown', 'skull crusher', 'bench dips', 'tricep'],
    url: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=900&q=82',
  },
  {
    match: ['plank', 'crunch', 'russian twist', 'hanging leg raise'],
    url: 'https://images.unsplash.com/photo-1594737625785-cf4354cc31f9?w=900&q=82',
  },
  {
    match: ['burpees', 'burpee'],
    url: 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=900&q=82',
  },
];

const FALLBACK_EXERCISE_IMAGE =
  'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=900&q=82';

const getExerciseImage = (exercise) => {
  if (exercise?.image_url) {
    return exercise.image_url;
  }

  const name = String(exercise?.name || '').toLowerCase();

  const matched = EXERCISE_IMAGE_MAP.find((item) =>
    item.match.some((keyword) => name.includes(keyword))
  );

  return matched?.url || FALLBACK_EXERCISE_IMAGE;
};

const getExerciseIcon = (exercise) => {
  const name = String(exercise?.name || '').toLowerCase();
  const muscle = String(exercise?.muscle_group || '').toLowerCase();

  if (
    name.includes('squat') ||
    name.includes('lunge') ||
    muscle.includes('leg')
  ) {
    return Footprints;
  }

  if (
    name.includes('deadlift') ||
    name.includes('row') ||
    name.includes('pulldown') ||
    name.includes('pull up') ||
    muscle.includes('back')
  ) {
    return MoveUp;
  }

  if (
    name.includes('press') &&
    (muscle.includes('shoulder') || name.includes('overhead'))
  ) {
    return MoveUp;
  }

  if (
    name.includes('curl') ||
    muscle.includes('bicep') ||
    muscle.includes('tricep') ||
    muscle.includes('arm')
  ) {
    return BicepsFlexed;
  }

  if (
    name.includes('plank') ||
    name.includes('crunch') ||
    name.includes('twist') ||
    muscle.includes('core')
  ) {
    return Shield;
  }

  if (
    name.includes('push up') ||
    name.includes('bench') ||
    name.includes('fly') ||
    muscle.includes('chest')
  ) {
    return Activity;
  }

  if (
    name.includes('burpee') ||
    muscle.includes('full body')
  ) {
    return Zap;
  }

  return Dumbbell;
};

const getEquipmentIcon = (equipment) => {
  const value = String(equipment || '').toLowerCase();

  if (value.includes('cable')) return Cable;
  if (value.includes('bodyweight')) return PersonStanding;
  if (value.includes('machine')) return Gauge;
  if (value.includes('barbell')) return Weight;
  if (value.includes('dumbbell')) return Dumbbell;
  if (value.includes('pull-up') || value.includes('pull up')) return MoveHorizontal;

  return CircleDot;
};

const getMuscleIcon = (muscle) => {
  const value = String(muscle || '').toLowerCase();

  if (value.includes('leg')) return Footprints;
  if (value.includes('bicep') || value.includes('tricep') || value.includes('arm')) {
    return BicepsFlexed;
  }
  if (value.includes('core')) return Shield;
  if (value.includes('back')) return MoveUp;
  if (value.includes('shoulder')) return MoveUp;
  if (value.includes('chest')) return Activity;
  if (value.includes('full body')) return Zap;

  return Target;
};

const DIFFICULTIES = [
  'All',
  'Beginner',
  'Intermediate',
  'Advanced',
];

function Exercises({ setIsAuthenticated }) {
  const [exercises, setExercises] = useState([]);
  const [search, setSearch] = useState('');
  const [filterMuscle, setFilterMuscle] = useState('All');
  const [filterDiff, setFilterDiff] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const response = await API.get('exercises/');

        const data = Array.isArray(response.data)
          ? response.data
          : response.data?.results || [];

        setExercises(data);
      } catch (error) {
        console.error(error);
        toast.error('Failed to load exercises');
        setExercises([]);
      } finally {
        setLoading(false);
      }
    };

    fetchExercises();
  }, []);

  const muscles = useMemo(() => {
    return [
      'All',
      ...new Set(
        exercises
          .map((exercise) => exercise.muscle_group)
          .filter(Boolean)
      ),
    ];
  }, [exercises]);

  const filteredExercises = useMemo(() => {
    const normalizedSearch = search
      .trim()
      .toLowerCase();

    return exercises.filter((exercise) => {
      const matchSearch =
        !normalizedSearch ||
        exercise.name
          ?.toLowerCase()
          .includes(normalizedSearch);

      const matchMuscle =
        filterMuscle === 'All' ||
        exercise.muscle_group === filterMuscle;

      const matchDifficulty =
        filterDiff === 'All' ||
        exercise.difficulty === filterDiff;

      return (
        matchSearch &&
        matchMuscle &&
        matchDifficulty
      );
    });
  }, [
    exercises,
    search,
    filterMuscle,
    filterDiff,
  ]);

  const clearFilters = () => {
    setSearch('');
    setFilterMuscle('All');
    setFilterDiff('All');
  };

  const hasActiveFilters =
    search.trim() !== '' ||
    filterMuscle !== 'All' ||
    filterDiff !== 'All';

  return (
    <div className="exercises-page">
      <Navbar setIsAuthenticated={setIsAuthenticated} />

      <main className="exercises-container">
        <section className="exercises-header">
          <div>
            <p className="exercises-eyebrow">
              Training Library
            </p>

            <h1 className="exercises-title">
              Exercise Library
            </h1>

            <p className="exercises-subtitle">
              Browse, search and filter your complete
              training database.
            </p>
          </div>

          <div className="exercises-header-badge">
            <Sparkles size={16} />
            Training Database
          </div>
        </section>

        <section className="exercises-hero">
          <img
            src="https://images.wallpapersden.com/image/download/sports-exercise-man_Z2dma2uUmZqaraWkpJRnbW1lrWZtZWU.jpg"
            alt="Athlete training in gym"
          />

          <div className="exercises-hero-overlay" />

          <div className="exercises-hero-content">
            <span>TRAIN SMARTER</span>

            <strong>
              Build better sessions with the right exercises.
            </strong>

            <p>
              Explore movements by muscle group,
              difficulty and equipment.
            </p>
          </div>
        </section>

        <section className="exercises-filter-panel">
          <div className="exercises-filter-heading">
            <div>
              <SlidersHorizontal size={17} />

              <div>
                <h3>Find an exercise</h3>
                <p>
                  Search or narrow the library with filters.
                </p>
              </div>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                className="exercises-clear-btn"
                onClick={clearFilters}
              >
                Clear filters
              </button>
            )}
          </div>

          <div className="exercises-filter-row">
            <div className="exercises-search">
              <Search size={17} />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search exercises..."
                aria-label="Search exercises"
              />
            </div>

            <div className="exercises-select-wrap">
              <label htmlFor="muscle-filter">
                Muscle
              </label>

              <select
                id="muscle-filter"
                value={filterMuscle}
                onChange={(event) =>
                  setFilterMuscle(event.target.value)
                }
              >
                {muscles.map((muscle) => (
                  <option
                    key={muscle}
                    value={muscle}
                  >
                    {muscle}
                  </option>
                ))}
              </select>
            </div>

            <div className="exercises-select-wrap">
              <label htmlFor="difficulty-filter">
                Difficulty
              </label>

              <select
                id="difficulty-filter"
                value={filterDiff}
                onChange={(event) =>
                  setFilterDiff(event.target.value)
                }
              >
                {DIFFICULTIES.map((difficulty) => (
                  <option
                    key={difficulty}
                    value={difficulty}
                  >
                    {difficulty}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <section className="exercises-results-bar">
          <div>
            <Target size={15} />

            <span>
              Showing{' '}
              <strong>
                {filteredExercises.length}
              </strong>{' '}
              of{' '}
              <strong>{exercises.length}</strong>{' '}
              exercises
            </span>
          </div>
        </section>

        {loading ? (
          <div className="exercises-loading">
            <div className="exercises-loader" />
            <p>Loading exercise library...</p>
          </div>
        ) : filteredExercises.length === 0 ? (
          <div className="exercises-empty">
            <div className="exercises-empty-icon">
              <Dumbbell size={28} />
            </div>

            <h3>No exercises found</h3>

            <p>
              Try a different search term or clear
              your filters.
            </p>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
              >
                Reset filters
              </button>
            )}
          </div>
        ) : (
          <section className="exercises-grid">
            {filteredExercises.map(
              (exercise, index) => (
                (() => {
                  const ExerciseIcon = getExerciseIcon(exercise);
                  const MuscleIcon = getMuscleIcon(
                    exercise.muscle_group
                  );
                  const EquipmentIcon = getEquipmentIcon(
                    exercise.equipment
                  );

                  return (
                    <motion.article
                      key={exercise.id}
                      className="exercise-library-card"
                      initial={{
                        opacity: 0,
                        y: 14,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      transition={{
                        delay: Math.min(
                          index * 0.035,
                          0.35
                        ),
                      }}
                      whileHover={{
                        y: -5,
                      }}
                    >
                      <div className="exercise-library-image">
                        <img
                          src={getExerciseImage(exercise)}
                          alt={`${exercise.name} exercise`}
                          loading="lazy"
                          onError={(event) => {
                            event.currentTarget.src =
                              FALLBACK_EXERCISE_IMAGE;
                          }}
                        />

                        <div className="exercise-library-image-overlay" />

                        <div className="exercise-library-image-icon">
                          <ExerciseIcon size={19} />
                        </div>

                        <span
                          className={`exercise-difficulty exercise-difficulty-${String(
                            exercise.difficulty ||
                              'Beginner'
                          ).toLowerCase()}`}
                        >
                          <CircleGauge size={12} />
                          {exercise.difficulty ||
                            'Beginner'}
                        </span>
                      </div>

                      <div className="exercise-library-content">
                        <div className="exercise-library-title-row">
                          <div className="exercise-library-icon">
                            <ExerciseIcon size={18} />
                          </div>

                          <h3>{exercise.name}</h3>
                        </div>

                        <div className="exercise-library-tags">
                          <span className="exercise-library-tag">
                            <MuscleIcon size={14} />
                            {exercise.muscle_group || 'Other'}
                          </span>

                          <span className="exercise-library-tag">
                            <EquipmentIcon size={14} />
                            {exercise.equipment || 'None'}
                          </span>
                        </div>
                      </div>
                    </motion.article>
                  );
                })()
              )
            )}
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default Exercises;
