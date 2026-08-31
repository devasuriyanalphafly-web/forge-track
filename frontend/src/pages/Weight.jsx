import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Scale,
  Plus,
  TrendingDown,
  TrendingUp,
  Calendar,
  Target,
  Activity,
  Sparkles,
  NotebookPen,
  Pencil,
  Check,
  X,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import API from '../api';
import Navbar from '../components/Navbar';
import BottomNav from '../components/BottomNav';
import toast from 'react-hot-toast';
import { getApiErrorMessage } from '../utils/apiError';
import './Weight.css';

function Weight({ setIsAuthenticated }) {
  const [logs, setLogs] = useState([]);
  const [progress, setProgress] = useState(null);
  const [weight, setWeight] = useState('');
  const [date, setDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingWeight, setSavingWeight] = useState(false);
  const [savingGoal, setSavingGoal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editWeight, setEditWeight] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editNote, setEditNote] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  const fetchData = async () => {
    try {
      const [logsRes, progressRes] = await Promise.all([
        API.get('weight/'),
        API.get('weight/progress/'),
      ]);

      const logsData = Array.isArray(logsRes.data)
        ? logsRes.data
        : logsRes.data?.results || [];

      setLogs(logsData);
      setProgress(progressRes.data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load weight data');
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdd = async (event) => {
    event.preventDefault();

    const parsedWeight = Number(weight);

    if (!weight || !Number.isFinite(parsedWeight) || parsedWeight <= 0) {
      toast.error('Enter a valid weight');
      return;
    }

    try {
      setSavingWeight(true);

      await API.post('weight/', {
        weight: parsedWeight,
        date,
        note: note.trim(),
      });

      toast.success('Weight logged!');
      setWeight('');
      setNote('');

      await fetchData();
    } catch (error) {
      toast.error(
        error.response?.data?.detail ||
          'Failed to log weight (maybe already logged for this date)'
      );
    } finally {
      setSavingWeight(false);
    }
  };

  const handleGoal = async (event) => {
  event.preventDefault();

  const form = event.currentTarget;

  const formData = new FormData(form);

  const target = Number(
    formData.get('target')
  );

  if (
    !Number.isFinite(target) ||
    target < 20 ||
    target > 500
  ) {
    toast.error(
      'Target weight must be between 20 and 500 kg.'
    );
    return;
  }

  try {
    setSavingGoal(true);

    await API.post('weight-goal/', {
      target_weight: target,

      start_weight:
        progress?.current_weight ?? null,
    });

    toast.success('Goal saved!');

    // Safe because we stored the form
    // before the await.
    form.reset();

    await fetchData();

  } catch (error) {
    console.error(
      'Weight goal error:',
      error.response?.data || error
    );

    toast.error(
      getApiErrorMessage(
        error,
        'Failed to save weight goal.'
      )
    );

  } finally {
    setSavingGoal(false);
  }
};


  const handleStartEdit = (log) => {
    setEditingId(log.id);
    setEditWeight(String(log.weight));
    setEditDate(log.date);
    setEditNote(log.note || '');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditWeight('');
    setEditDate('');
    setEditNote('');
  };

  const handleSaveEdit = async (id) => {
    const parsedWeight = Number(editWeight);

    if (!Number.isFinite(parsedWeight) || parsedWeight <= 0) {
      toast.error('Enter a valid weight');
      return;
    }

    if (!editDate) {
      toast.error('Select a date');
      return;
    }

    try {
      setSavingEdit(true);
      await API.patch(`weight/${id}/`, {
        weight: parsedWeight,
        date: editDate,
        note: editNote.trim(),
      });
      toast.success('Weight entry updated!');
      handleCancelEdit();
      await fetchData();
    } catch (error) {
      console.error(error);
      toast.error(
        getApiErrorMessage(error, 'Failed to update weight entry.')
      );
    } finally {
      setSavingEdit(false);
    }
  };

  const chartData = useMemo(
    () =>
      [...logs]
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .map((log) => ({
          date: log.date?.slice(5) || '',
          weight: Number(log.weight),
        })),
    [logs]
  );

  const sortedLogs = useMemo(
    () =>
      [...logs].sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      ),
    [logs]
  );

  const change = Number(progress?.change_kg || 0);
  const ChangeIcon =
    change < 0 ? TrendingDown : change > 0 ? TrendingUp : Activity;

  const progressPercent = Math.max(
    0,
    Math.min(100, Number(progress?.goal?.progress_percent || 0))
  );

  return (
    <div className="weight-page">
      <Navbar setIsAuthenticated={setIsAuthenticated} />

      <main className="weight-container">
        <section className="weight-header">
          <div>
            <p className="weight-eyebrow">Body Progress</p>
            <h1 className="weight-title">Weight Tracker</h1>
            <p className="weight-subtitle">
              Log your weight, follow the trend, and measure your
              progress toward a clear target.
            </p>
          </div>

          <div className="weight-header-badge">
            <Sparkles size={16} />
            Progress Tracking
          </div>
        </section>

        <section className="weight-hero">
          <img
            src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1400&q=80"
            alt="Strength training"
          />
          <div className="weight-hero-overlay" />

          <div className="weight-hero-content">
            <span>TRACK THE TREND</span>
            <strong>
              Progress becomes clearer when you measure it.
            </strong>
            <p>
              One measurement is just a number. Consistent logs reveal
              the direction you are actually moving.
            </p>
          </div>
        </section>

        {loading ? (
          <div className="weight-loading">
            <div className="weight-loader" />
            <p>Loading weight progress...</p>
          </div>
        ) : (
          <>
            {progress?.current_weight && (
              <section className="weight-summary-grid">
                <motion.article
                  className="weight-summary-card weight-summary-current"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="weight-summary-icon">
                    <Scale size={19} />
                  </div>
                  <span>Current Weight</span>
                  <strong>{progress.current_weight} kg</strong>
                  <small>Latest measurement</small>
                </motion.article>

                <motion.article
                  className="weight-summary-card weight-summary-start"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.06 }}
                >
                  <div className="weight-summary-icon">
                    <Calendar size={19} />
                  </div>
                  <span>Starting Weight</span>
                  <strong>{progress.start_weight} kg</strong>
                  <small>Your baseline</small>
                </motion.article>

                <motion.article
                  className={`weight-summary-card ${
                    change < 0
                      ? 'weight-summary-loss'
                      : change > 0
                        ? 'weight-summary-gain'
                        : 'weight-summary-neutral'
                  }`}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.12 }}
                >
                  <div className="weight-summary-icon">
                    <ChangeIcon size={19} />
                  </div>
                  <span>Total Change</span>
                  <strong>
                    {change > 0 ? '+' : ''}
                    {change} kg
                  </strong>
                  <small>Since your first log</small>
                </motion.article>
              </section>
            )}

            <section className="weight-workspace">
              <article className="weight-panel weight-goal-panel">
                <div className="weight-panel-heading">
                  <div className="weight-panel-icon">
                    <Target size={18} />
                  </div>
                  <div>
                    <h2>Weight Goal</h2>
                    <p>Set your target and track the distance.</p>
                  </div>
                </div>

                {progress?.goal ? (
                  <div className="weight-goal-progress">
                    <div className="weight-goal-numbers">
                      <div>
                        <span>Target</span>
                        <strong>
                          {progress.goal.target_weight} kg
                        </strong>
                      </div>

                      <strong className="weight-goal-percent">
                        {progressPercent}%
                      </strong>
                    </div>

                    <div className="weight-progress-track">
                      <div
                        className="weight-progress-fill"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>

                    <p className="weight-goal-remaining">
                      <strong>{progress.goal.remaining_kg} kg</strong>{' '}
                      remaining to{' '}
                      {progress.goal.direction === 'loss'
                        ? 'lose'
                        : 'gain'}
                    </p>
                  </div>
                ) : (
                  <div className="weight-no-goal">
                    <Target size={22} />
                    <div>
                      <strong>No target set</strong>
                      <p>
                        Add a goal to turn your weight logs into a
                        measurable journey.
                      </p>
                    </div>
                  </div>
                )}

                <form
                  className="weight-goal-form"
                  onSubmit={handleGoal}
                >
                  <div className="weight-field">
                    <label htmlFor="target-weight">
                      Target weight
                    </label>
                    <div className="weight-input-unit">
                      <input
                        id="target-weight"
                        name="target"
                        type="number"
                        min="20"
                        max="500"
                        step="0.1"
                        placeholder="70.0"
                      />
                      <span>kg</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="weight-primary-btn"
                    disabled={savingGoal}
                  >
                    <Target size={15} />
                    {savingGoal ? 'Saving...' : 'Set Goal'}
                  </button>
                </form>
              </article>

              <article className="weight-panel weight-log-panel">
                <div className="weight-panel-heading">
                  <div className="weight-panel-icon">
                    <Plus size={18} />
                  </div>
                  <div>
                    <h2>Log Weight</h2>
                    <p>Add today's measurement to your history.</p>
                  </div>
                </div>

                <form
                  className="weight-log-form"
                  onSubmit={handleAdd}
                >
                  <div className="weight-field">
                    <label htmlFor="weight-value">
                      Weight
                    </label>
                    <div className="weight-input-unit">
                      <input
                        id="weight-value"
                        type="number"
                        min="1"
                        step="0.1"
                        value={weight}
                        onChange={(event) =>
                          setWeight(event.target.value)
                        }
                        placeholder="72.5"
                      />
                      <span>kg</span>
                    </div>
                  </div>

                  <div className="weight-field">
                    <label htmlFor="weight-date">Date</label>
                    <input
                      id="weight-date"
                      type="date"
                      value={date}
                      onChange={(event) =>
                        setDate(event.target.value)
                      }
                    />
                  </div>

                  <div className="weight-field weight-note-field">
                    <label htmlFor="weight-note">
                      Note <span>optional</span>
                    </label>
                    <input
                      id="weight-note"
                      value={note}
                      onChange={(event) =>
                        setNote(event.target.value)
                      }
                      placeholder="Morning weigh-in..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="weight-primary-btn"
                    disabled={savingWeight}
                  >
                    <Plus size={15} />
                    {savingWeight ? 'Saving...' : 'Save Entry'}
                  </button>
                </form>
              </article>
            </section>

            <section className="weight-panel weight-chart-panel">
              <div className="weight-panel-heading">
                <div className="weight-panel-icon">
                  <TrendingUp size={18} />
                </div>
                <div>
                  <h2>Weight Progress</h2>
                  <p>
                    Follow the overall direction instead of reacting
                    to a single weigh-in.
                  </p>
                </div>
              </div>

              {chartData.length > 1 ? (
                <div className="weight-chart">
                  <ResponsiveContainer width="100%" height={290}>
                    <LineChart
                      data={chartData}
                      margin={{
                        top: 10,
                        right: 10,
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
                        domain={['dataMin - 1', 'dataMax + 1']}
                      />
                      <Tooltip
                        contentStyle={{
                          background: 'var(--card-solid)',
                          border: '1px solid var(--border)',
                          borderRadius: 12,
                        }}
                        formatter={(value) => [
                          `${value} kg`,
                          'Weight',
                        ]}
                      />
                      <Line
                        type="monotone"
                        dataKey="weight"
                        stroke="#7c3aed"
                        strokeWidth={3}
                        dot={{
                          r: 4,
                          fill: '#7c3aed',
                          strokeWidth: 0,
                        }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="weight-empty-chart">
                  <TrendingUp size={28} />
                  <strong>More data needed</strong>
                  <p>
                    Log at least two weight entries to unlock your
                    progress chart.
                  </p>
                </div>
              )}
            </section>

            <section className="weight-panel weight-history-panel">
              <div className="weight-history-header">
                <div className="weight-panel-heading">
                  <div className="weight-panel-icon">
                    <NotebookPen size={18} />
                  </div>
                  <div>
                    <h2>Weight History</h2>
                    <p>Your recorded measurements.</p>
                  </div>
                </div>

                <span className="weight-history-count">
                  {logs.length} {logs.length === 1 ? 'entry' : 'entries'}
                </span>
              </div>

              {sortedLogs.length === 0 ? (
                <div className="weight-empty-history">
                  <Scale size={24} />
                  <p>No weight logs yet.</p>
                </div>
              ) : (
                <div className="weight-history-list">
                  {sortedLogs.map((log, index) => {
                    const isEditing = editingId === log.id;

                    return (
                      <motion.div
                        key={log.id}
                        className={`weight-history-item ${
                          isEditing ? 'weight-history-editing' : ''
                        }`}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          delay: Math.min(index * 0.025, 0.25),
                        }}
                      >
                        {isEditing ? (
                          <div className="weight-edit-form">
                            <div className="weight-edit-grid">
                              <div className="weight-field">
                                <label htmlFor={`edit-weight-${log.id}`}>Weight</label>
                                <div className="weight-input-unit">
                                  <input
                                    id={`edit-weight-${log.id}`}
                                    type="number"
                                    min="1"
                                    step="0.1"
                                    value={editWeight}
                                    onChange={(event) =>
                                      setEditWeight(event.target.value)
                                    }
                                  />
                                  <span>kg</span>
                                </div>
                              </div>

                              <div className="weight-field">
                                <label htmlFor={`edit-date-${log.id}`}>Date</label>
                                <input
                                  id={`edit-date-${log.id}`}
                                  type="date"
                                  value={editDate}
                                  onChange={(event) =>
                                    setEditDate(event.target.value)
                                  }
                                />
                              </div>

                              <div className="weight-field weight-edit-note">
                                <label htmlFor={`edit-note-${log.id}`}>Note</label>
                                <input
                                  id={`edit-note-${log.id}`}
                                  value={editNote}
                                  onChange={(event) =>
                                    setEditNote(event.target.value)
                                  }
                                  placeholder="Morning weigh-in..."
                                />
                              </div>
                            </div>

                            <div className="weight-edit-actions">
                              <button
                                type="button"
                                className="weight-edit-save"
                                onClick={() => handleSaveEdit(log.id)}
                                disabled={savingEdit}
                              >
                                <Check size={15} />
                                {savingEdit ? 'Saving...' : 'Save'}
                              </button>

                              <button
                                type="button"
                                className="weight-edit-cancel"
                                onClick={handleCancelEdit}
                                disabled={savingEdit}
                              >
                                <X size={15} />
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="weight-history-main">
                              <div className="weight-history-scale">
                                <Scale size={16} />
                              </div>

                              <div>
                                <strong>{log.weight} kg</strong>
                                <p>{log.note || 'No note added'}</p>
                              </div>
                            </div>

                            <div className="weight-history-actions">
                              <time>{log.date}</time>
                              <button
                                type="button"
                                className="weight-history-edit-btn"
                                onClick={() => handleStartEdit(log)}
                              >
                                <Pencil size={15} />
                                <span>Edit</span>
                              </button>
                            </div>
                          </>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </section>
          </>
        )}
      </main>

      <BottomNav />
    </div>
  );
}

export default Weight;
