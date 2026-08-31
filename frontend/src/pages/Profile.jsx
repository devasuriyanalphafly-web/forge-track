import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import './Profile.css'
import {
  User,
  Ruler,
  Weight,
  Target,
  Save,
  Calculator,
  Activity,
  ShieldAlert,
  Sparkles,
  Gauge,
  Trash2,
} from 'lucide-react';
import API from '../api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import BottomNav from '../components/BottomNav';
import toast from 'react-hot-toast';
import './Profile.css';

function Profile({ setIsAuthenticated }) {
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    height: '',
    weight: '',
    fitness_goal: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    API.get('auth/profile/')
      .then((res) => {
        setForm({
          first_name: res.data.first_name || '',
          last_name: res.data.last_name || '',
          height: res.data.height || '',
          weight: res.data.weight || '',
          fitness_goal: res.data.fitness_goal || '',
        });
      })
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSave = async (event) => {
    event.preventDefault();

    const height = form.height ? Number(form.height) : null;
    const weight = form.weight ? Number(form.weight) : null;

    if (height !== null && (height <= 0 || height > 300)) {
      toast.error('Please enter a valid height');
      return;
    }

    if (weight !== null && (weight <= 0 || weight > 500)) {
      toast.error('Please enter a valid weight');
      return;
    }

    try {
      setSaving(true);

      await API.patch('auth/profile/', {
        ...form,
        height,
        weight,
      });

      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.detail ||
          'Failed to update profile'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    const firstConfirm = window.confirm(
      'Are you sure you want to delete your account? This cannot be undone.'
    );

    if (!firstConfirm) return;

    const finalConfirm = window.confirm(
      'Last chance! All your workouts and data will be lost forever.'
    );

    if (!finalConfirm) return;

    try {
      setDeleting(true);

      await API.delete('auth/profile/');

      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setIsAuthenticated(false);
      toast.success('Account deleted successfully');
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.detail ||
          'Failed to delete account'
      );
    } finally {
      setDeleting(false);
    }
  };

  const bmi = useMemo(() => {
    const height = Number(form.height);
    const weight = Number(form.weight);

    if (!height || !weight || height <= 0 || weight <= 0) {
      return null;
    }

    const heightM = height / 100;
    return Number((weight / (heightM * heightM)).toFixed(1));
  }, [form.height, form.weight]);

  const bmiInfo = useMemo(() => {
    if (!bmi) {
      return {
        text: 'Add measurements',
        tone: 'neutral',
      };
    }

    if (bmi < 18.5) {
      return {
        text: 'Underweight',
        tone: 'blue',
      };
    }

    if (bmi < 25) {
      return {
        text: 'Normal',
        tone: 'green',
      };
    }

    if (bmi < 30) {
      return {
        text: 'Overweight',
        tone: 'orange',
      };
    }

    return {
      text: 'Obese',
      tone: 'red',
    };
  }, [bmi]);

  const bmiMarker = useMemo(() => {
    if (!bmi) return 0;

    const min = 12;
    const max = 40;
    const clamped = Math.min(Math.max(bmi, min), max);

    return ((clamped - min) / (max - min)) * 100;
  }, [bmi]);

  const displayName =
    [form.first_name, form.last_name]
      .filter(Boolean)
      .join(' ') || 'ForgeTrack Athlete';

  const initials =
    [form.first_name, form.last_name]
      .filter(Boolean)
      .map((part) => part.trim().charAt(0).toUpperCase())
      .join('')
      .slice(0, 2) || 'FT';

  if (loading) {
    return (
      <div className="profile-page">
        <Navbar setIsAuthenticated={setIsAuthenticated} />

        <main className="profile-loading">
          <div className="profile-loader" />
          <p>Loading your profile...</p>
        </main>

        <BottomNav />
      </div>
    );
  }

  return (
    <div className="profile-page">
      <Navbar setIsAuthenticated={setIsAuthenticated} />

      <main className="profile-container">
        <section className="profile-header">
          <div>
            <p className="profile-eyebrow">Account</p>
            <h1 className="profile-title">Your Profile</h1>
            <p className="profile-subtitle">
              Keep your personal metrics and fitness direction
              accurate across ForgeTrack.
            </p>
          </div>

          <div className="profile-header-badge">
            <Sparkles size={15} />
            Athlete Profile
          </div>
        </section>

        <section className="profile-hero">
          <img
            src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1400&q=80"
            alt="Fitness training"
          />

          <div className="profile-hero-overlay" />

          <div className="profile-identity">
            <div className="profile-avatar">
              {initials}
            </div>

            <div>
              <span>FORGETRACK MEMBER</span>
              <h2>{displayName}</h2>
              <p>
                {form.fitness_goal ||
                  'Set your fitness goal below to personalize your profile.'}
              </p>
            </div>
          </div>
        </section>

        <section className="profile-metrics">
          <MetricCard
            icon={Ruler}
            label="Height"
            value={form.height ? `${form.height} cm` : '—'}
            tone="purple"
          />

          <MetricCard
            icon={Weight}
            label="Weight"
            value={form.weight ? `${form.weight} kg` : '—'}
            tone="blue"
          />

          <MetricCard
            icon={Gauge}
            label="BMI"
            value={bmi || '—'}
            tone="green"
          />

          <MetricCard
            icon={Target}
            label="Focus"
            value={form.fitness_goal || 'Not set'}
            tone="orange"
            compact
          />
        </section>

        <motion.section
          className="profile-bmi-card"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="profile-section-heading">
            <div className="profile-section-icon">
              <Calculator size={18} />
            </div>

            <div>
              <h2>Body Mass Index</h2>
              <p>
                A quick height-to-weight screening metric.
              </p>
            </div>
          </div>

          {bmi ? (
            <div className="profile-bmi-content">
              <div className="profile-bmi-score">
                <strong>{bmi}</strong>
                <span className={`bmi-status ${bmiInfo.tone}`}>
                  {bmiInfo.text}
                </span>
              </div>

              <div className="profile-bmi-scale-wrap">
                <div className="profile-bmi-scale">
                  <span className="bmi-under" />
                  <span className="bmi-normal" />
                  <span className="bmi-over" />
                  <span className="bmi-obese" />

                  <i
                    className="profile-bmi-marker"
                    style={{ left: `${bmiMarker}%` }}
                  />
                </div>

                <div className="profile-bmi-labels">
                  <span>Under</span>
                  <span>Normal</span>
                  <span>Over</span>
                  <span>Obese</span>
                </div>

                <p className="profile-bmi-note">
                  BMI is a general screening measure, not a direct
                  measurement of body fat or athletic performance.
                </p>
              </div>
            </div>
          ) : (
            <div className="profile-bmi-empty">
              <Activity size={23} />
              <div>
                <strong>BMI isn't available yet</strong>
                <p>
                  Enter both your height and weight to calculate it.
                </p>
              </div>
            </div>
          )}
        </motion.section>

        <motion.section
          className="profile-details-card"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
        >
          <div className="profile-section-heading profile-form-heading">
            <div className="profile-section-icon profile-user-icon">
              <User size={18} />
            </div>

            <div>
              <h2>Personal Details</h2>
              <p>
                Update the information used by your ForgeTrack account.
              </p>
            </div>
          </div>

          <form
            className="profile-form"
            onSubmit={handleSave}
          >
            <div className="profile-form-grid">
              <ProfileField
                label="First name"
                name="first_name"
                value={form.first_name}
                onChange={handleChange}
                autoComplete="given-name"
                placeholder="First name"
              />

              <ProfileField
                label="Last name"
                name="last_name"
                value={form.last_name}
                onChange={handleChange}
                autoComplete="family-name"
                placeholder="Last name"
              />

              <ProfileField
                label="Height"
                unit="cm"
                icon={Ruler}
                name="height"
                type="number"
                min="1"
                max="300"
                step="0.1"
                value={form.height}
                onChange={handleChange}
                placeholder="175"
              />

              <ProfileField
                label="Weight"
                unit="kg"
                icon={Weight}
                name="weight"
                type="number"
                min="1"
                max="500"
                step="0.1"
                value={form.weight}
                onChange={handleChange}
                placeholder="75"
              />
            </div>

            <ProfileField
              label="Fitness goal"
              icon={Target}
              name="fitness_goal"
              value={form.fitness_goal}
              onChange={handleChange}
              placeholder="Build muscle, lose fat, improve strength..."
            />

            <button
              type="submit"
              className="profile-save-btn"
              disabled={saving}
            >
              <Save size={16} />
              {saving ? 'Saving changes...' : 'Save Changes'}
            </button>
          </form>

          <section className="profile-danger-zone">
            <div className="profile-danger-heading">
              <div className="profile-danger-icon">
                <ShieldAlert size={18} />
              </div>

              <div>
                <h3>Danger Zone</h3>
                <p>
                  Deleting your account permanently removes your
                  profile and associated data.
                </p>
              </div>
            </div>

            <button
              type="button"
              className="profile-delete-btn"
              onClick={handleDeleteAccount}
              disabled={deleting}
            >
              <Trash2 size={15} />
              {deleting ? 'Deleting...' : 'Delete My Account'}
            </button>
          </section>
        </motion.section>
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  tone,
  compact = false,
}) {
  return (
    <article className={`profile-metric profile-metric-${tone}`}>
      <div className="profile-metric-icon">
        <Icon size={17} />
      </div>

      <span>{label}</span>

      <strong className={compact ? 'compact' : ''}>
        {value}
      </strong>
    </article>
  );
}

function ProfileField({
  label,
  unit,
  icon: Icon,
  ...inputProps
}) {
  return (
    <div className="profile-field">
      <label htmlFor={`profile-${inputProps.name}`}>
        {Icon && <Icon size={13} />}
        {label}
        {unit && <span>{unit}</span>}
      </label>

      <input
        id={`profile-${inputProps.name}`}
        {...inputProps}
      />
    </div>
  );
}

export default Profile;