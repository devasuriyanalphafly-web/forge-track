import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';

import {
  Target,
  Plus,
  CheckCircle2,
  Circle,
  Trash2,
  Sparkles,
  Flag,
  Trophy,
  ListChecks,
} from 'lucide-react';

import API from '../api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import BottomNav from '../components/BottomNav';

import { getApiErrorMessage } from '../utils/apiError';

import toast from 'react-hot-toast';

import './Goals.css';


function Goals({ setIsAuthenticated }) {
  const [goals, setGoals] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);


  // =====================================================
  // FETCH GOALS
  // =====================================================

  const fetchGoals = async () => {
    try {
      setLoading(true);

      const res = await API.get('goals/');

      const data = Array.isArray(res.data)
        ? res.data
        : res.data?.results || [];

      setGoals(data);

    } catch (error) {
      console.error(
        'Failed to load goals:',
        error
      );

      toast.error(
        getApiErrorMessage(
          error,
          'Failed to load goals.'
        )
      );

      setGoals([]);

    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchGoals();
  }, []);


  // =====================================================
  // ADD GOAL
  // =====================================================

  const handleAdd = async (event) => {
    event.preventDefault();

    const cleanedTitle = title.trim();
    const cleanedDescription = description.trim();

    if (!cleanedTitle) {
      toast.error(
        'Please enter a goal title.'
      );

      return;
    }

    try {
      setSaving(true);

      await API.post(
        'goals/',
        {
          title: cleanedTitle,
          description: cleanedDescription,
        }
      );

      toast.success(
        'Goal added!'
      );

      setTitle('');
      setDescription('');

      await fetchGoals();

    } catch (error) {
      console.error(
        'Failed to add goal:',
        error
      );

      toast.error(
        getApiErrorMessage(
          error,
          'Failed to add goal.'
        )
      );

    } finally {
      setSaving(false);
    }
  };


  // =====================================================
  // TOGGLE COMPLETE
  // =====================================================

  const toggleComplete = async (goal) => {
    try {
      setUpdatingId(goal.id);

      await API.patch(
        `goals/${goal.id}/`,
        {
          is_completed: !goal.is_completed,
        }
      );

      await fetchGoals();

    } catch (error) {
      console.error(
        'Failed to update goal:',
        error
      );

      toast.error(
        getApiErrorMessage(
          error,
          'Failed to update goal.'
        )
      );

    } finally {
      setUpdatingId(null);
    }
  };


  // =====================================================
  // DELETE GOAL
  // =====================================================

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      'Delete this goal?'
    );

    if (!confirmed) {
      return;
    }

    try {
      setUpdatingId(id);

      await API.delete(
        `goals/${id}/`
      );

      toast.success(
        'Goal deleted.'
      );

      await fetchGoals();

    } catch (error) {
      console.error(
        'Failed to delete goal:',
        error
      );

      toast.error(
        getApiErrorMessage(
          error,
          'Failed to delete goal.'
        )
      );

    } finally {
      setUpdatingId(null);
    }
  };


  // =====================================================
  // GOAL ANALYTICS
  // =====================================================

  const analytics = useMemo(() => {
    const total = goals.length;

    const completed = goals.filter(
      (goal) => goal.is_completed
    ).length;

    const active =
      total - completed;

    const completionPercent =
      total > 0
        ? Math.round(
            (completed / total) * 100
          )
        : 0;

    return {
      total,
      completed,
      active,
      completionPercent,
    };
  }, [goals]);


  return (
    <div className="goals-page">

      <Navbar
        setIsAuthenticated={
          setIsAuthenticated
        }
      />


      <main className="goals-container">

        {/* =========================
            HEADER
        ========================= */}

        <section className="goals-header">

          <div>
            <p className="goals-eyebrow">
              Ambitions
            </p>

            <h1 className="goals-title">
              Your Goals
            </h1>

            <p className="goals-subtitle">
              Set clear targets, stay accountable, and turn
              progress into something you can actually see.
            </p>
          </div>


          <div className="goals-header-badge">
            <Sparkles size={16} />
            Goal System
          </div>

        </section>


        {/* =========================
            HERO
        ========================= */}

        <section className="goals-hero">

          <img
            src="https://freerangeamerican.us/wp-content/uploads/2021/05/47495876431_22315cc797_b-e1620680646958.jpg"
            alt="Athlete training toward a goal"
          />

          <div className="goals-hero-overlay" />


          <div className="goals-hero-content">

            <span>
              SET THE TARGET
            </span>

            <strong>
              Clear goals create focused training.
            </strong>

            <p>
              Define what you want, track your completion,
              and keep your attention on the next milestone.
            </p>

          </div>

        </section>


        {/* =========================
            SUMMARY CARDS
        ========================= */}

        <section className="goals-summary-grid">

          <SummaryCard
            icon={Target}
            label="Total Goals"
            value={analytics.total}
            tone="purple"
          />

          <SummaryCard
            icon={Flag}
            label="Active"
            value={analytics.active}
            tone="orange"
          />

          <SummaryCard
            icon={Trophy}
            label="Completed"
            value={analytics.completed}
            tone="green"
          />

          <SummaryCard
            icon={ListChecks}
            label="Completion"
            value={`${analytics.completionPercent}%`}
            tone="blue"
          />

        </section>


        {/* =========================
            PROGRESS
        ========================= */}

        <section className="goals-progress-card">

          <div className="goals-progress-top">

            <div>
              <span>
                Overall Progress
              </span>

              <strong>
                {analytics.completed} of {analytics.total} goals completed
              </strong>
            </div>


            <strong className="goals-progress-percent">
              {analytics.completionPercent}%
            </strong>

          </div>


          <div className="goals-progress-track">

            <div
              className="goals-progress-fill"
              style={{
                width: `${analytics.completionPercent}%`,
              }}
            />

          </div>

        </section>


        {/* =========================
            WORKSPACE
        ========================= */}

        <section className="goals-workspace">


          {/* ADD GOAL */}

          <article className="goals-form-card">

            <div className="goals-panel-heading">

              <div className="goals-panel-icon">
                <Plus size={18} />
              </div>


              <div>
                <h2>
                  Add New Goal
                </h2>

                <p>
                  Make the goal specific enough to know when
                  you've achieved it.
                </p>
              </div>

            </div>


            <form
              className="goals-form"
              onSubmit={handleAdd}
            >

              <div className="goals-field">

                <label htmlFor="goal-title">
                  Goal title
                </label>

                <input
                  id="goal-title"
                  value={title}

                  onChange={(event) =>
                    setTitle(
                      event.target.value
                    )
                  }

                  placeholder="Bench 100kg, lose 5kg, run 5k..."
                />

              </div>


              <div className="goals-field">

                <label htmlFor="goal-description">
                  Description
                  <span>
                    optional
                  </span>
                </label>

                <textarea
                  id="goal-description"
                  value={description}

                  onChange={(event) =>
                    setDescription(
                      event.target.value
                    )
                  }

                  placeholder="Add context, deadline, or why this goal matters..."
                  rows={4}
                />

              </div>


              <button
                type="submit"
                className="goals-primary-btn"
                disabled={saving}
              >

                <Plus size={16} />

                {saving
                  ? 'Adding...'
                  : 'Add Goal'
                }

              </button>

            </form>

          </article>


          {/* GOALS LIST */}

          <article className="goals-list-card">

            <div className="goals-list-header">

              <div className="goals-panel-heading">

                <div className="goals-panel-icon">
                  <Target size={18} />
                </div>


                <div>
                  <h2>
                    Your Goals
                  </h2>

                  <p>
                    Mark goals complete as you hit each target.
                  </p>
                </div>

              </div>


              <span className="goals-count">
                {goals.length}
              </span>

            </div>


            {loading ? (

              <div className="goals-loading">

                <div className="goals-loader" />

                <p>
                  Loading your goals...
                </p>

              </div>

            ) : goals.length === 0 ? (

              <div className="goals-empty">

                <Target size={29} />

                <h3>
                  No goals yet
                </h3>

                <p>
                  Add your first target and give your training
                  something concrete to chase.
                </p>

              </div>

            ) : (

              <div className="goals-list">

                {goals.map(
                  (goal, index) => (

                    <motion.article
                      key={goal.id}

                      className={
                        goal.is_completed
                          ? 'goal-item completed'
                          : 'goal-item'
                      }

                      initial={{
                        opacity: 0,
                        y: 10,
                      }}

                      animate={{
                        opacity: 1,
                        y: 0,
                      }}

                      transition={{
                        delay: Math.min(
                          index * 0.045,
                          0.3
                        ),
                      }}
                    >


                      {/* COMPLETE BUTTON */}

                      <button
                        type="button"
                        className="goal-check-btn"

                        onClick={() =>
                          toggleComplete(goal)
                        }

                        disabled={
                          updatingId === goal.id
                        }

                        aria-label={
                          goal.is_completed
                            ? 'Mark goal incomplete'
                            : 'Mark goal complete'
                        }
                      >

                        {goal.is_completed
                          ? (
                            <CheckCircle2
                              size={22}
                            />
                          )
                          : (
                            <Circle
                              size={22}
                            />
                          )
                        }

                      </button>


                      {/* GOAL CONTENT */}

                      <div className="goal-item-content">

                        <div className="goal-item-top">

                          <h3>
                            {goal.title}
                          </h3>


                          {goal.is_completed && (

                            <span className="goal-complete-badge">
                              Completed
                            </span>

                          )}

                        </div>


                        {goal.description && (

                          <p>
                            {goal.description}
                          </p>

                        )}

                      </div>


                      {/* DELETE */}

                      <button
                        type="button"
                        className="goal-delete-btn"

                        onClick={() =>
                          handleDelete(
                            goal.id
                          )
                        }

                        disabled={
                          updatingId === goal.id
                        }

                        aria-label={
                          `Delete ${goal.title}`
                        }
                      >

                        <Trash2 size={16} />

                      </button>

                    </motion.article>

                  )
                )}

              </div>

            )}

          </article>

        </section>

      </main>


      <Footer />

      <BottomNav />

    </div>
  );
}


/* =========================================================
   SUMMARY CARD
========================================================= */

function SummaryCard({
  icon: Icon,
  label,
  value,
  tone,
}) {
  return (
    <motion.article
      className={
        `goals-summary-card goals-summary-${tone}`
      }

      initial={{
        opacity: 0,
        y: 12,
      }}

      animate={{
        opacity: 1,
        y: 0,
      }}
    >

      <div className="goals-summary-icon">
        <Icon size={18} />
      </div>

      <span>
        {label}
      </span>

      <strong>
        {value}
      </strong>

    </motion.article>
  );
}


export default Goals;