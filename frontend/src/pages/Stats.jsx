import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import './Stats.css';
import {
  BarChart3,
  TrendingUp,
  Flame,
  Calendar,
  Activity,
  Zap,
  Sparkles,
  Target,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import API from '../api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import toast from 'react-hot-toast';
import './Stats.css';

const getLocalDate = (date) => {
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60000)
    .toISOString()
    .split('T')[0];
};

function Stats({ setIsAuthenticated }) {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await API.get('workouts/');

        const data = Array.isArray(response.data)
          ? response.data
          : response.data?.results || [];

        setWorkouts(data);
      } catch (error) {
        console.error(error);
        toast.error('Failed to load stats');
        setWorkouts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const analytics = useMemo(() => {
    const totalWorkouts = workouts.length;

    const totalVolume = workouts.reduce((sum, workout) => {
      return (
        sum +
        (workout.exercises || []).reduce(
          (exerciseSum, workoutExercise) => {
            return (
              exerciseSum +
              (workoutExercise.sets || []).reduce(
                (setSum, set) =>
                  setSum +
                  Number(set.reps || 0) *
                    Number(set.weight || 0),
                0
              )
            );
          },
          0
        )
      );
    }, 0);

    const avgVolume =
      totalWorkouts > 0
        ? Math.round(totalVolume / totalWorkouts)
        : 0;

    const workoutDates = new Set(
      workouts.map((workout) => workout.date)
    );

    let streak = 0;

    for (let i = 0; i < 30; i += 1) {
      const date = new Date();
      date.setDate(date.getDate() - i);

      const localDate = getLocalDate(date);

      if (workoutDates.has(localDate)) {
        streak += 1;
      } else if (i === 0) {
        continue;
      } else {
        break;
      }
    }

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
                  Number(set.reps || 0) *
                    Number(set.weight || 0),
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

    const workoutsByMonth = {};

    workouts.forEach((workout) => {
      const month = workout.date?.slice(0, 7);

      if (!month) return;

      workoutsByMonth[month] =
        (workoutsByMonth[month] || 0) + 1;
    });

    const monthlyData = Object.entries(workoutsByMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([month, count]) => ({
        month,
        count,
      }));

    const bestVolume =
      volumeByDate.length > 0
        ? Math.max(
            ...volumeByDate.map((item) => item.volume)
          )
        : 0;

    return {
      totalWorkouts,
      totalVolume,
      avgVolume,
      streak,
      volumeByDate,
      monthlyData,
      bestVolume,
    };
  }, [workouts]);

  const statCards = [
    {
      label: 'Total Workouts',
      value: analytics.totalWorkouts,
      icon: Calendar,
      tone: 'purple',
      helper: 'Sessions completed',
    },
    {
      label: 'Total Volume',
      value: `${Math.round(
        analytics.totalVolume
      ).toLocaleString()} kg`,
      icon: TrendingUp,
      tone: 'green',
      helper: 'Weight moved',
    },
    {
      label: 'Avg Volume',
      value: `${analytics.avgVolume.toLocaleString()} kg`,
      icon: Zap,
      tone: 'orange',
      helper: 'Per workout',
    },
    {
      label: 'Current Streak',
      value: `${analytics.streak} day${
        analytics.streak !== 1 ? 's' : ''
      }`,
      icon: Flame,
      tone: 'red',
      helper: 'Consistency',
    },
  ];

  return (
    <div className="stats-page">
      <Navbar setIsAuthenticated={setIsAuthenticated} />

      <main className="stats-container">
        <section className="stats-header">
          <div>
            <p className="stats-eyebrow">
              Analytics
            </p>

            <h1 className="stats-title">
              Your Stats
            </h1>

            <p className="stats-subtitle">
              Deep insights into your training performance,
              volume and consistency.
            </p>
          </div>

          <div className="stats-header-badge">
            <Sparkles size={16} />
            Performance Analytics
          </div>
        </section>

        <section className="stats-hero">
          <img
            src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1400&q=80"
            alt="Athlete reviewing training performance"
          />

          <div className="stats-hero-overlay" />

          <div className="stats-hero-content">
            <span>MEASURE WHAT MATTERS</span>

            <strong>
              Your training tells a story. Read the data.
            </strong>

            <p>
              Track volume, frequency and consistency to
              understand how your training is progressing.
            </p>
          </div>
        </section>

        {loading ? (
          <div className="stats-loading">
            <div className="stats-loader" />
            <p>Loading performance analytics...</p>
          </div>
        ) : (
          <>
            <section className="stats-cards">
              {statCards.map((card, index) => {
                const Icon = card.icon;

                return (
                  <motion.article
                    key={card.label}
                    className={`stats-card stats-card-${card.tone}`}
                    initial={{
                      opacity: 0,
                      y: 16,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      delay: index * 0.07,
                    }}
                    whileHover={{
                      y: -4,
                    }}
                  >
                    <div className="stats-card-top">
                      <div className="stats-card-icon">
                        <Icon size={20} />
                      </div>

                      <span className="stats-card-accent" />
                    </div>

                    <span className="stats-card-label">
                      {card.label}
                    </span>

                    <strong className="stats-card-value">
                      {card.value}
                    </strong>

                    <span className="stats-card-helper">
                      {card.helper}
                    </span>
                  </motion.article>
                );
              })}
            </section>

            <section className="stats-highlight-row">
              <div className="stats-highlight-card">
                <Target size={17} />

                <div>
                  <span>Best Recent Volume</span>
                  <strong>
                    {analytics.bestVolume.toLocaleString()} kg
                  </strong>
                </div>
              </div>

              <div className="stats-highlight-card">
                <Activity size={17} />

                <div>
                  <span>Months Tracked</span>
                  <strong>
                    {analytics.monthlyData.length}
                  </strong>
                </div>
              </div>
            </section>

            <section className="stats-charts">
              <article className="stats-chart-card">
                <div className="stats-chart-header">
                  <div>
                    <div className="stats-chart-title">
                      <BarChart3 size={18} />
                      <h3>Volume Over Time</h3>
                    </div>

                    <p>
                      Training volume across your latest
                      workout sessions.
                    </p>
                  </div>
                </div>

                {analytics.volumeByDate.length > 0 ? (
                  <ResponsiveContainer
                    width="100%"
                    height={260}
                  >
                    <BarChart
                      data={analytics.volumeByDate}
                      margin={{
                        top: 8,
                        right: 6,
                        left: -12,
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
                      />

                      <Tooltip
                        cursor={{
                          fill:
                            'rgba(124, 58, 237, 0.05)',
                        }}
                        contentStyle={{
                          background:
                            'var(--card-solid)',
                          border:
                            '1px solid var(--border)',
                          borderRadius: 12,
                        }}
                        formatter={(value) => [
                          `${value} kg`,
                          'Volume',
                        ]}
                      />

                      <Bar
                        dataKey="volume"
                        fill="#7c3aed"
                        radius={[7, 7, 2, 2]}
                        maxBarSize={36}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="stats-empty-chart">
                    <BarChart3 size={28} />
                    <p>
                      Not enough workout data yet.
                    </p>
                  </div>
                )}
              </article>

              <article className="stats-chart-card">
                <div className="stats-chart-header">
                  <div>
                    <div className="stats-chart-title">
                      <Activity size={18} />
                      <h3>Workouts per Month</h3>
                    </div>

                    <p>
                      How consistently you have been training.
                    </p>
                  </div>
                </div>

                {analytics.monthlyData.length > 0 ? (
                  <ResponsiveContainer
                    width="100%"
                    height={260}
                  >
                    <LineChart
                      data={analytics.monthlyData}
                      margin={{
                        top: 8,
                        right: 8,
                        left: -12,
                        bottom: 0,
                      }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="var(--border)"
                        vertical={false}
                      />

                      <XAxis
                        dataKey="month"
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
                        allowDecimals={false}
                      />

                      <Tooltip
                        contentStyle={{
                          background:
                            'var(--card-solid)',
                          border:
                            '1px solid var(--border)',
                          borderRadius: 12,
                        }}
                        formatter={(value) => [
                          value,
                          'Workouts',
                        ]}
                      />

                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke="#a78bfa"
                        strokeWidth={3}
                        dot={{
                          r: 4,
                          fill: '#a78bfa',
                        }}
                        activeDot={{
                          r: 6,
                        }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="stats-empty-chart">
                    <Activity size={28} />
                    <p>
                      Not enough monthly data yet.
                    </p>
                  </div>
                )}
              </article>
            </section>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default Stats;