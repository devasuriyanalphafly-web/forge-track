import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import './Dashboard.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import BottomNav from '../components/BottomNav';
import {
  Dumbbell,
  Plus,
  Trash2,
  Edit3,
  Activity,
  TrendingUp,
  Target,
  Calendar,
  Zap,
  Flame,
  Trophy,
  Quote,
  Info,
  BarChart3,
  ChevronDown,
  Download,
  Sparkles,
  ArrowUpRight,
  X,
  Check,
  Search,
  Layers3,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import API from '../api';

const QUOTES = [
  'The only bad workout is the one that didn’t happen.',
  'Sweat is just fat crying.',
  'Your body can stand almost anything. It’s your mind you have to convince.',
  'Discipline is choosing between what you want now and what you want most.',
  'The pain you feel today will be the strength you feel tomorrow.',
  'Don’t limit your challenges. Challenge your limits.',
  'Consistency beats intensity.',
];

const CHART_COLORS = [
  '#7c3aed',
  '#a78bfa',
  '#ec4899',
  '#f59e0b',
  '#10b981',
  '#3b82f6',
  '#14b8a6',
];

const getLocalDate = () => {
  const date = new Date();
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60000)
    .toISOString()
    .split('T')[0];
};

const toNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const EXERCISE_IMAGES = {
  chest: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=900&q=80',
  back: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=900&q=80',
  legs: 'https://images.unsplash.com/photo-1434682881908-b43d0467b798?w=900&q=80',
  shoulders: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=900&q=80',
  biceps: 'https://images.unsplash.com/photo-1581009137042-c552e485697a?w=900&q=80',
  triceps: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=900&q=80',
  core: 'https://images.unsplash.com/photo-1566241142559-40e1dab266c6?w=900&q=80',
  'full body': 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=900&q=80',
  other: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=900&q=80',
};

const getExerciseImage = (exercise) => {
  if (exercise?.image_url) return exercise.image_url;
  const group = String(exercise?.muscle_group || 'other').trim().toLowerCase();
  return EXERCISE_IMAGES[group] || EXERCISE_IMAGES.other;
};

function Dashboard({ setIsAuthenticated }) {
  const navigate = useNavigate();

  const [exercises, setExercises] = useState([]);
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [userName, setUserName] = useState('');
  const [exerciseSearch, setExerciseSearch] = useState('');
  const [muscleFilter, setMuscleFilter] = useState('all');

  const [workoutName, setWorkoutName] = useState('');
  const [workoutDate, setWorkoutDate] = useState(getLocalDate());
  const [selectedExercise, setSelectedExercise] = useState('');
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');
  const [setsList, setSetsList] = useState([]);

  const quote = QUOTES[new Date().getDate() % QUOTES.length];

  const fetchData = async () => {
    try {
      setLoading(true);

      const [exRes, woRes, profileRes] = await Promise.all([
        API.get('exercises/'),
        API.get('workouts/'),
        API.get('auth/profile/'),
      ]);

      const exercisesData = Array.isArray(exRes.data)
        ? exRes.data
        : exRes.data?.results || [];

      const workoutsData = Array.isArray(woRes.data)
        ? woRes.data
        : woRes.data?.results || [];

      setExercises(exercisesData);
      setWorkouts(workoutsData);
      setUserName(
        profileRes.data?.first_name ||
          profileRes.data?.username ||
          'Athlete'
      );
    } catch (err) {
      console.error(err);
      toast.error('Failed to load dashboard data');
      setExercises([]);
      setWorkouts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetForm = () => {
    setWorkoutName('');
    setWorkoutDate(getLocalDate());
    setSelectedExercise('');
    setReps('');
    setWeight('');
    setSetsList([]);
    setEditingId(null);
    setShowForm(false);
  };

  const openNewWorkout = () => {

    // If logger is already open, scroll to it
    if (showForm && !editingId) {

      document
        .getElementById('workout-form')
        ?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });

      return;
    }


    // Clear old form data
    resetForm();

    // Open workout logger
    setShowForm(true);


    // Wait for React to render the form,
    // then scroll exactly to it
    setTimeout(() => {

      document
        .getElementById('workout-form')
        ?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });

    }, 150);
  };

  const addSet = () => {
    const repsValue = toNumber(reps);
    const weightValue = toNumber(weight);
    const exerciseId = Number(selectedExercise);

    if (!exerciseId || repsValue <= 0 || weightValue < 0) {
      toast.error('Enter an exercise, valid reps and weight');
      return;
    }

    const exercise = exercises.find((item) => item.id === exerciseId);

    setSetsList((current) => [
      ...current,
      {
        exercise_id: exerciseId,
        exercise_name: exercise?.name || 'Exercise',
        reps: repsValue,
        weight: weightValue,
      },
    ]);

    setReps('');
    setWeight('');
  };

  const removeSet = (index) => {
    setSetsList((current) => current.filter((_, i) => i !== index));
  };

  const handleCreateOrUpdate = async () => {

    if (!workoutName.trim()) {
      toast.error('Give your workout a name');
      return;
    }

    if (!workoutDate) {
      toast.error('Choose a workout date');
      return;
    }

    if (setsList.length === 0) {
      toast.error('Add at least one set');
      return;
    }


    // =====================================================
    // BUILD EXERCISE PAYLOAD
    // =====================================================

    const exerciseMap = {};


    setsList.forEach((item) => {

      if (!exerciseMap[item.exercise_id]) {

        exerciseMap[item.exercise_id] = {

          exercise: item.exercise_id,

          order:
            Object.keys(exerciseMap).length + 1,

          sets: [],
        };
      }


      exerciseMap[item.exercise_id].sets.push({

        set_number:
          exerciseMap[item.exercise_id]
            .sets.length + 1,

        reps:
          Number(item.reps),

        weight:
          Number(item.weight),
      });
    });


    // =====================================================
    // FINAL PAYLOAD
    // =====================================================

    const payload = {

      name:
        workoutName.trim(),

      date:
        workoutDate,

      exercises:
        Object.values(exerciseMap),
    };


    console.log(
      'Workout payload:',
      payload
    );


    // =====================================================
    // SAVE WORKOUT
    // =====================================================

    try {

      setSaving(true);


      // ---------------------------------------------------
      // EDIT EXISTING WORKOUT
      // ---------------------------------------------------

      if (editingId) {

        await API.put(
          `workouts/${editingId}/`,
          payload
        );


        toast.success(
          'Workout updated'
        );

      } else {

        // -------------------------------------------------
        // CREATE NEW WORKOUT
        // -------------------------------------------------

        await API.post(
          'workouts/',
          payload
        );


        toast.success(
          'Workout saved'
        );
      }


      resetForm();

      await fetchData();


    } catch (error) {

      console.error(
        'Workout save error:',
        error.response?.data || error
      );


      const data =
        error.response?.data;


      console.log(
        'Backend validation error:',
        data
      );


      // ---------------------------------------------------
      // NESTED EXERCISE ERROR
      // ---------------------------------------------------

      if (
        Array.isArray(data?.exercises) &&
        data.exercises.length > 0
      ) {

        console.error(
          'Exercises error:',
          data.exercises
        );
      }


      toast.error(
        data?.detail ||
        data?.name?.[0] ||
        data?.date?.[0] ||
        'Could not save workout.'
      );


    } finally {

      setSaving(false);

    }
  };
  const handleEdit = (workout) => {
    setEditingId(workout.id);

    setWorkoutName(
      workout.name || ''
    );

    setWorkoutDate(
      workout.date || getLocalDate()
    );

    const flat = [];

    workout.exercises?.forEach(
      (workoutExercise) => {

        workoutExercise.sets?.forEach(
          (set) => {

            flat.push({
              exercise_id:
                Number(
                  workoutExercise.exercise
                ),

              exercise_name:
                workoutExercise.exercise_name ||
                'Exercise',

              reps:
                Number(set.reps),

              weight:
                Number(set.weight),
            });
          }
        );
      }
    );

    setSetsList(flat);

    setSelectedExercise('');
    setReps('');
    setWeight('');

    setShowForm(true);

    window.requestAnimationFrame(() => {

      document
        .getElementById('workout-form')
        ?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });

    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this workout permanently?')) return;

    try {
      await API.delete(`workouts/${id}/`);
      toast.success('Workout deleted');
      await fetchData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete workout');
    }
  };

  const exportCSV = () => {
    if (workouts.length === 0) {
      toast.error('No workouts to export');
      return;
    }

    const escapeCSV = (value) => {
      const text = String(value ?? '');
      return `"${text.replace(/"/g, '""')}"`;
    };

    const rows = [
      [
        'Date',
        'Workout Name',
        'Exercise',
        'Set',
        'Reps',
        'Weight (kg)',
      ],
    ];

    workouts.forEach((workout) => {
      workout.exercises?.forEach((workoutExercise) => {
        workoutExercise.sets?.forEach((set) => {
          rows.push([
            workout.date,
            workout.name,
            workoutExercise.exercise?.name,
            set.set_number,
            set.reps,
            set.weight,
          ]);
        });
      });
    });

    const csv = rows
      .map((row) => row.map(escapeCSV).join(','))
      .join('\n');

    const blob = new Blob([csv], {
      type: 'text/csv;charset=utf-8;',
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');

    anchor.href = url;
    anchor.download = `forgetrack-${getLocalDate()}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);

    toast.success('Workout data exported');
  };

  const analytics = useMemo(() => {
    const totalWorkouts = workouts.length;

    const totalVolume = workouts.reduce((sum, workout) => {
      return (
        sum +
        (workout.exercises || []).reduce((exerciseSum, workoutExercise) => {
          return (
            exerciseSum +
            (workoutExercise.sets || []).reduce(
              (setSum, set) =>
                setSum + toNumber(set.reps) * toNumber(set.weight),
              0
            )
          );
        }, 0)
      );
    }, 0);

    const avgVolume =
      totalWorkouts > 0
        ? Math.round(totalVolume / totalWorkouts)
        : 0;

    const uniqueDates = [
      ...new Set(workouts.map((workout) => workout.date)),
    ];

    const dateSet = new Set(uniqueDates);
    let streak = 0;
    const cursor = new Date();

    for (let i = 0; i < 30; i += 1) {
      const current = new Date(cursor);
      current.setDate(cursor.getDate() - i);

      const localDate = new Date(
        current.getTime() -
          current.getTimezoneOffset() * 60000
      )
        .toISOString()
        .split('T')[0];

      if (dateSet.has(localDate)) {
        streak += 1;
      } else if (i === 0) {
        continue;
      } else {
        break;
      }
    }

    const prs = {};

    workouts.forEach((workout) => {
      workout.exercises?.forEach((workoutExercise) => {
        const name =
          workoutExercise.exercise_name;
        if (!name) return;

        workoutExercise.sets?.forEach((set) => {
          const setWeight = toNumber(set.weight);

          if (!prs[name] || setWeight > prs[name]) {
            prs[name] = setWeight;
          }
        });
      });
    });

    const prList = Object.entries(prs)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);

    const muscleCount = {};

    workouts.forEach((workout) => {
      workout.exercises?.forEach((workoutExercise) => {
        const muscle =
          workoutExercise.muscle_group || 'Other';

        muscleCount[muscle] =
          (muscleCount[muscle] || 0) + 1;
      });
    });

    const muscleData = Object.entries(muscleCount)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    const volumeByDate = workouts
      .slice()
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(-10)
      .map((workout) => {
        const volume = (workout.exercises || []).reduce(
          (sum, workoutExercise) => {
            return (
              sum +
              (workoutExercise.sets || []).reduce(
                (setSum, set) =>
                  setSum +
                  toNumber(set.reps) * toNumber(set.weight),
                0
              )
            );
          },
          0
        );

        return {
          date: workout.date?.slice(5) || '',
          volume: Math.round(volume),
        };
      });

    return {
      totalWorkouts,
      totalVolume,
      avgVolume,
      streak,
      prList,
      muscleData,
      volumeByDate,
    };
  }, [workouts]);

  const muscleGroups = useMemo(() => [
    'all',
    ...new Set(
      exercises
        .map((exercise) => String(exercise.muscle_group || '').trim())
        .filter(Boolean)
    ),
  ], [exercises]);

  const filteredExercises = useMemo(() => {
    const query = exerciseSearch.trim().toLowerCase();
    return exercises.filter((exercise) => {
      const matchesMuscle =
        muscleFilter === 'all' ||
        String(exercise.muscle_group || '').toLowerCase() ===
          muscleFilter.toLowerCase();
      const haystack = `${exercise.name || ''} ${exercise.muscle_group || ''} ${exercise.equipment || ''}`.toLowerCase();
      return matchesMuscle && (!query || haystack.includes(query));
    });
  }, [exercises, exerciseSearch, muscleFilter]);

  const stats = [
    {
      label: 'Total Workouts',
      value: analytics.totalWorkouts,
      icon: Calendar,
      accent: 'violet',
      helper: 'Sessions completed',
    },
    {
      label: 'Total Volume',
      value: `${Math.round(
        analytics.totalVolume
      ).toLocaleString()} kg`,
      icon: TrendingUp,
      accent: 'green',
      helper: 'Weight moved',
    },
    {
      label: 'Avg / Workout',
      value: `${analytics.avgVolume.toLocaleString()} kg`,
      icon: Zap,
      accent: 'amber',
      helper: 'Average volume',
    },
    {
      label: 'Current Streak',
      value: `${analytics.streak} day${
        analytics.streak !== 1 ? 's' : ''
      }`,
      icon: Flame,
      accent: 'rose',
      helper: 'Consistency matters',
    },
  ];

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="dashboard-loading__orb" />
        <div className="dashboard-loading__content">
          <div className="skeleton skeleton--title" />
          <div className="skeleton skeleton--wide" />
          <div className="dashboard-loading__grid">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="skeleton skeleton--card"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <Navbar
        setIsAuthenticated={setIsAuthenticated}
        onExport={exportCSV}
      />

      <main className="dashboard-container">
        <section className="dashboard-hero">
          <div className="dashboard-hero__content">
            <div className="dashboard-eyebrow">
              <span className="dashboard-eyebrow__dot" />
              Your Training Hub
            </div>

            <h1 className="dashboard-title">
              Welcome back
              {userName ? (
                <>
                  <br />
                  <span>{userName}</span>
                </>
              ) : null}
            </h1>

            <p className="dashboard-subtitle">
              Track your performance. Analyze your progress.
              Build your strongest self.
            </p>

            <div className="dashboard-actions">
              <button
                type="button"
                className="premium-button premium-button--primary"
                onClick={openNewWorkout}
              >
                <Plus size={18} />
                {showForm && !editingId
                  ? 'Close Logger'
                  : 'Log Workout'}
              </button>

              <button
                type="button"
                className="premium-button premium-button--secondary"
                onClick={exportCSV}
                disabled={workouts.length === 0}
              >
                <Download size={17} />
                Export
              </button>
            </div>
          </div>

          <div className="dashboard-hero__visual">
            <img
              src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1400&q=80"
              alt="Athlete training in a gym"
            />

            <div className="dashboard-hero__overlay" />

            <div className="dashboard-hero__badge">
              <Sparkles size={15} />
              Performance Mode
            </div>

            <div className="dashboard-hero__metric">
              <span>Volume</span>
              <strong>
                {Math.round(
                  analytics.totalVolume
                ).toLocaleString()}
                <small> kg</small>
              </strong>
              <div>
                <ArrowUpRight size={14} />
                Keep building
              </div>
            </div>
          </div>
        </section>

        <motion.section
          className="dashboard-quote glass"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="dashboard-quote__icon">
            <Quote size={20} />
          </div>
          <div>
            <span className="dashboard-section-kicker">
              Daily mindset
            </span>
            <p>{quote}</p>
          </div>
        </motion.section>

        <section className="dashboard-section">
          <div className="dashboard-section-heading">
            <div>
              <span className="dashboard-section-kicker">
                Performance overview
              </span>
              <h2>Your numbers</h2>
            </div>
            <Activity size={20} />
          </div>

          <div className="dashboard-stats">
            {stats.map((card, index) => {
              const Icon = card.icon;

              return (
                <motion.article
                  key={card.label}
                  className={`stat-card glass stat-card--${card.accent}`}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: index * 0.07,
                    duration: 0.4,
                  }}
                  whileHover={{ y: -5 }}
                >
                  <div className="stat-card__top">
                    <div className="stat-card__icon">
                      <Icon size={20} />
                    </div>
                    <span className="stat-card__trend">
                      <ArrowUpRight size={13} />
                    </span>
                  </div>

                  <span className="stat-card__label">
                    {card.label}
                  </span>

                  <strong className="stat-card__value">
                    {card.value}
                  </strong>

                  <span className="stat-card__helper">
                    {card.helper}
                  </span>
                </motion.article>
              );
            })}
          </div>
        </section>

        <section className="dashboard-section">
          <div className="dashboard-section-heading">
            <div>
              <span className="dashboard-section-kicker">
                Analytics
              </span>
              <h2>Performance insights</h2>
            </div>
          </div>

          <div className="dashboard-chart-grid">
            <article className="analytics-card glass">
              <div className="analytics-card__heading">
                <div>
                  <span className="analytics-card__icon">
                    <BarChart3 size={17} />
                  </span>
                  <h3>Volume Progress</h3>
                  <p>
                    Total weight lifted across your latest
                    sessions.
                  </p>
                </div>
              </div>

              {analytics.volumeByDate.length > 0 ? (
                <div className="chart-wrap">
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart
                      data={analytics.volumeByDate}
                      margin={{
                        top: 10,
                        right: 4,
                        left: -18,
                        bottom: 0,
                      }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="var(--border)"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="date"
                        stroke="var(--text-muted)"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="var(--text-muted)"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        width={50}
                      />
                      <Tooltip
                        cursor={{
                          fill: 'rgba(124, 58, 237, 0.05)',
                        }}
                        contentStyle={{
                          background: 'var(--card-solid)',
                          border: '1px solid var(--border)',
                          borderRadius: 14,
                          boxShadow:
                            'var(--shadow-lg)',
                        }}
                        formatter={(value) => [
                          `${value} kg`,
                          'Volume',
                        ]}
                      />
                      <Bar
                        dataKey="volume"
                        fill="#7c3aed"
                        radius={[8, 8, 2, 2]}
                        maxBarSize={34}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <EmptyChart
                  icon={BarChart3}
                  text="Log your first workout to unlock volume analytics."
                />
              )}
            </article>

            <article className="analytics-card glass">
              <div className="analytics-card__heading">
                <div>
                  <span className="analytics-card__icon">
                    <Target size={17} />
                  </span>
                  <h3>Muscle Focus</h3>
                  <p>
                    Your training distribution by muscle group.
                  </p>
                </div>
              </div>

              {analytics.muscleData.length > 0 ? (
                <div className="chart-wrap chart-wrap--pie">
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={analytics.muscleData}
                        cx="50%"
                        cy="48%"
                        innerRadius={58}
                        outerRadius={88}
                        paddingAngle={4}
                        dataKey="value"
                        stroke="none"
                      >
                        {analytics.muscleData.map(
                          (_, index) => (
                            <Cell
                              key={index}
                              fill={
                                CHART_COLORS[
                                  index %
                                    CHART_COLORS.length
                                ]
                              }
                            />
                          )
                        )}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: 'var(--card-solid)',
                          border: '1px solid var(--border)',
                          borderRadius: 14,
                        }}
                        formatter={(value, name) => [
                          `${value} exercises`,
                          name,
                        ]}
                      />
                      <Legend
                        verticalAlign="bottom"
                        iconType="circle"
                        wrapperStyle={{
                          fontSize: 11,
                          color: 'var(--text-muted)',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <EmptyChart
                  icon={Target}
                  text="Your muscle distribution will appear here."
                />
              )}
            </article>
          </div>
        </section>

        <section className="dashboard-section">
          <div className="dashboard-section-heading">
            <div>
              <span className="dashboard-section-kicker">
                Achievements
              </span>
              <h2>Personal records</h2>
            </div>
            <Trophy size={20} />
          </div>

          <div className="records-card glass">
            {analytics.prList.length > 0 ? (
              <div className="records-grid">
                {analytics.prList.map(
                  ([name, recordWeight], index) => (
                    <motion.div
                      key={name}
                      className="record-item"
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        delay: index * 0.05,
                      }}
                    >
                      <div className="record-item__rank">
                        {String(index + 1).padStart(2, '0')}
                      </div>
                      <div className="record-item__body">
                        <span>{name}</span>
                        <strong>
                          {recordWeight} kg
                        </strong>
                      </div>
                      <Trophy size={17} />
                    </motion.div>
                  )
                )}
              </div>
            ) : (
              <EmptyState
                icon={Trophy}
                title="Your first PR is waiting."
                text="Log a few workouts and your strongest lifts will appear here."
              />
            )}
          </div>
        </section>

        <AnimatePresence>
          {showForm && (
            <motion.section
              id="workout-form"
              className="workout-form glass"
              initial={{
                opacity: 0,
                height: 0,
                y: -10,
              }}
              animate={{
                opacity: 1,
                height: 'auto',
                y: 0,
              }}
              exit={{
                opacity: 0,
                height: 0,
                y: -10,
              }}
            >
              <div className="workout-form__header">
                <div>
                  <span className="dashboard-section-kicker">
                    {editingId
                      ? 'Modify session'
                      : 'New session'}
                  </span>
                  <h2>
                    {editingId
                      ? 'Edit workout'
                      : 'Build your workout'}
                  </h2>
                </div>

                <button
                  type="button"
                  className="icon-button"
                  onClick={resetForm}
                  aria-label="Close workout form"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="form-grid form-grid--two">
                <Field label="Workout name">
                  <input
                    value={workoutName}
                    onChange={(event) =>
                      setWorkoutName(event.target.value)
                    }
                    placeholder="Push Day, Legs, Upper..."
                  />
                </Field>

                <Field label="Date">
                  <input
                    type="date"
                    value={workoutDate}
                    onChange={(event) =>
                      setWorkoutDate(event.target.value)
                    }
                  />
                </Field>
              </div>

              <div className="form-grid form-grid--workout">
                <Field label="Exercise">
                  <div className="select-wrap">
                    <select
                      value={selectedExercise}
                      onChange={(event) =>
                        setSelectedExercise(event.target.value)
                      }
                    >
                      <option value="">
                        Select exercise
                      </option>
                      {exercises.map((exercise) => (
                        <option
                          key={exercise.id}
                          value={exercise.id}
                        >
                          {exercise.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={16} />
                  </div>
                </Field>

                <Field label="Reps">
                  <input
                    type="number"
                    min="1"
                    value={reps}
                    onChange={(event) =>
                      setReps(event.target.value)
                    }
                    placeholder="10"
                  />
                </Field>

                <Field label="Weight (kg)">
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={weight}
                    onChange={(event) =>
                      setWeight(event.target.value)
                    }
                    placeholder="60"
                  />
                </Field>

                <button
                  type="button"
                  className="premium-button premium-button--primary premium-button--add"
                  onClick={addSet}
                >
                  <Plus size={17} />
                  Add set
                </button>
              </div>

              {setsList.length > 0 && (
                <div className="set-list">
                  <div className="set-list__header">
                    <span>Session sets</span>
                    <strong>
                      {setsList.length}{' '}
                      {setsList.length === 1 ? 'set' : 'sets'}
                    </strong>
                  </div>

                  {setsList.map((set, index) => (
                    <div
                      className="set-row"
                      key={`${set.exercise_id}-${index}`}
                    >
                      <div className="set-row__number">
                        {String(index + 1).padStart(2, '0')}
                      </div>
                      <div className="set-row__body">
                        <strong>{set.exercise_name}</strong>
                        <span>
                          {set.reps} reps × {set.weight} kg
                        </span>
                      </div>
                      <button
                        type="button"
                        className="set-row__remove"
                        onClick={() => removeSet(index)}
                        aria-label={`Remove ${set.exercise_name}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="workout-form__footer">
                <button
                  type="button"
                  className="premium-button premium-button--success"
                  onClick={handleCreateOrUpdate}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <span className="button-spinner" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check size={17} />
                      {editingId
                        ? 'Update workout'
                        : 'Save workout'}
                    </>
                  )}
                </button>

                <button
                  type="button"
                  className="premium-button premium-button--secondary"
                  onClick={resetForm}
                  disabled={saving}
                >
                  Cancel
                </button>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        <section className="dashboard-section">
          <div className="dashboard-section-heading">
            <div>
              <span className="dashboard-section-kicker">
                Training history
              </span>
              <h2>Your workouts</h2>
            </div>
          </div>

          {workouts.length === 0 ? (
            <div className="empty-panel glass">
              <EmptyState
                icon={Activity}
                title="Nothing logged yet."
                text="Start your first session and ForgeTrack will build your performance history."
                action={
                  <button
                    type="button"
                    className="premium-button premium-button--primary"
                    onClick={openNewWorkout}
                  >
                    <Plus size={17} />
                    Log your first workout
                  </button>
                }
              />
            </div>
          ) : (
            <div className="workout-list">
              {workouts.map((workout, index) => (
                <motion.article
                  key={workout.id}
                  className="workout-card glass"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: Math.min(index * 0.04, 0.25),
                  }}
                >
                  <div className="workout-card__header">
                    <div className="workout-card__identity">
                      <div className="workout-card__date">
                        <Calendar size={16} />
                        {workout.date}
                      </div>
                      <h3>{workout.name}</h3>
                    </div>

                    <div className="workout-card__actions">
                      <button
                        type="button"
                        className="small-action small-action--edit"
                        onClick={() => handleEdit(workout)}
                      >
                        <Edit3 size={14} />
                        Edit
                      </button>

                      <button
                        type="button"
                        className="small-action small-action--delete"
                        onClick={() =>
                          handleDelete(workout.id)
                        }
                        aria-label={`Delete ${workout.name}`}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  <div className="workout-card__exercises">
                    {workout.exercises?.map(
                      (workoutExercise) => (
                        <div
                          className="workout-exercise"
                          key={workoutExercise.id}
                        >
                          <div className="workout-exercise__title">
                            <span />
                            <strong>
                              {workoutExercise.exercise_name || 'Exercise'}
                            </strong>
                          </div>

                          <div className="workout-exercise__sets">
                            {workoutExercise.sets?.map(
                              (set) => (
                                <span key={set.id}>
                                  Set {set.set_number}
                                  <b>
                                    {set.reps} × {set.weight} kg
                                  </b>
                                </span>
                              )
                            )}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </section>

        <section className="dashboard-section dashboard-section--last">
          <div className="dashboard-section-heading exercise-library-heading">
            <div>
              <span className="dashboard-section-kicker">Exercise database</span>
              <h2>Exercise library</h2>
              <p>Browse movements by muscle group and equipment.</p>
            </div>
            <div className="exercise-library-count">
              <Layers3 size={17} />
              <strong>{filteredExercises.length}</strong>
              <span>exercises</span>
            </div>
          </div>

          {exercises.length > 0 ? (
            <>
              <div className="exercise-library-toolbar glass">
                <div className="exercise-library-search">
                  <Search size={17} />
                  <input
                    value={exerciseSearch}
                    onChange={(event) => setExerciseSearch(event.target.value)}
                    placeholder="Search exercises, muscles or equipment..."
                    aria-label="Search exercise library"
                  />
                </div>
                <div className="exercise-library-filters">
                  {muscleGroups.map((group) => (
                    <button
                      type="button"
                      key={group}
                      className={muscleFilter === group ? 'active' : ''}
                      onClick={() => setMuscleFilter(group)}
                    >
                      {group === 'all' ? 'All' : group}
                    </button>
                  ))}
                </div>
              </div>

              {filteredExercises.length > 0 ? (
                <div className="exercise-grid exercise-grid--visual">
                  {filteredExercises.map((exercise, index) => (
                    <motion.article
                      key={exercise.id}
                      className="exercise-card exercise-card--visual glass"
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(index * 0.025, 0.2) }}
                      whileHover={{ y: -5 }}
                    >
                      <div className="exercise-card__image">
                        <img
                          src={getExerciseImage(exercise)}
                          alt={`${exercise.name} exercise`}
                          loading="lazy"
                          onError={(event) => {
                            event.currentTarget.src = EXERCISE_IMAGES.other;
                          }}
                        />
                        <div className="exercise-card__image-overlay" />
                        <span className={`difficulty-badge difficulty-badge--${String(exercise.difficulty || 'Beginner').toLowerCase()}`}>
                          {exercise.difficulty || 'Beginner'}
                        </span>
                        <span className="exercise-card__muscle-icon">
                          <Dumbbell size={18} />
                        </span>
                      </div>

                      <div className="exercise-card__content">
                        <div className="exercise-card__title-row">
                          <div>
                            <span className="exercise-card__eyebrow">
                              {exercise.muscle_group || 'Full body'}
                            </span>
                            <h3>{exercise.name}</h3>
                          </div>
                          <ArrowUpRight size={17} />
                        </div>

                        <div className="exercise-card__meta exercise-card__meta--chips">
                          <span><Target size={13} />{exercise.muscle_group || 'Other'}</span>
                          <span><Dumbbell size={13} />{exercise.equipment || 'Bodyweight'}</span>
                        </div>
                      </div>
                    </motion.article>
                  ))}
                </div>
              ) : (
                <div className="empty-panel glass">
                  <EmptyState
                    icon={Search}
                    title="No matching exercises."
                    text="Try another search or muscle group."
                  />
                </div>
              )}
            </>
          ) : (
            <div className="empty-panel glass">
              <EmptyState
                icon={Dumbbell}
                title="Exercise library is empty."
                text="Once exercises are available from the API, they'll appear here."
              />
            </div>
          )}
        </section>
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="form-field">
      <span>{label}</span>
      {children}
    </label>
  );
}

function EmptyChart({ icon: Icon, text }) {
  return (
    <div className="chart-empty">
      <Icon size={28} />
      <p>{text}</p>
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  text,
  action,
}) {
  return (
    <div className="empty-state">
      <div className="empty-state__icon">
        <Icon size={25} />
      </div>
      <h3>{title}</h3>
      <p>{text}</p>
      {action}
    </div>
  );
}

export default Dashboard;