import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Lock,
  KeyRound,
  ArrowLeft,
  ArrowRight,
  Dumbbell,
  Sun,
  Moon,
  Eye,
  EyeOff,
  ShieldCheck,
  Check,
} from 'lucide-react';
import API from '../api';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';
import './ForgotPassword.css';

function getPasswordStrength(password) {
  let score = 0;

  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  return score;
}

const strengthText = ['', 'Weak', 'Fair', 'Good', 'Strong'];

function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const strength = getPasswordStrength(newPassword);

  const passwordChecks = [
    {
      label: '8+ characters',
      valid: newPassword.length >= 8,
    },
    {
      label: 'Uppercase',
      valid: /[A-Z]/.test(newPassword),
    },
    {
      label: 'Number',
      valid: /[0-9]/.test(newPassword),
    },
    {
      label: 'Symbol',
      valid: /[^A-Za-z0-9]/.test(newPassword),
    },
  ];

  const handleRequestOTP = async (event) => {
  event.preventDefault();

  const cleanedEmail =
    email.trim().toLowerCase();

  if (!cleanedEmail) {
    toast.error('Enter your email address.');
    return;
  }

  try {
    setLoading(true);

    await API.post(
      'auth/request-otp/',
      {
        email: cleanedEmail,
      }
    );

    // Keep the normalized email for step 2
    setEmail(cleanedEmail);

    toast.success(
      'OTP sent! Check your email.'
    );

    setStep(2);

  } catch (error) {

    console.error(
      'OTP request failed:',
      error
    );

    toast.error(
      getApiErrorMessage(
        error,
        'Failed to send OTP.'
      )
    );

  } finally {
    setLoading(false);
  }
};

  const handleResetPassword = async (event) => {
  event.preventDefault();

  const cleanedOtp =
    otp.trim();

  if (
    cleanedOtp.length !== 6 ||
    !/^\d{6}$/.test(cleanedOtp)
  ) {
    toast.error(
      'Enter a valid 6-digit OTP.'
    );

    return;
  }

  if (newPassword.length < 8) {
    toast.error(
      'Password must be at least 8 characters.'
    );

    return;
  }

  try {
    setLoading(true);

    await API.post(
      'auth/verify-otp/',
      {
        email: email.trim().toLowerCase(),
        otp: cleanedOtp,
        new_password: newPassword,
      }
    );

    toast.success(
      'Password reset successful!'
    );

    setTimeout(() => {
      navigate(
        '/login',
        {
          replace: true,
        }
      );
    }, 1200);

  } catch (error) {

    console.error(
      'Password reset failed:',
      error
    );

    toast.error(
      getApiErrorMessage(
        error,
        'Password reset failed.'
      )
    );

  } finally {
    setLoading(false);
  }
};

  const handleOtpChange = (event) => {
    const value = event.target.value
      .replace(/\D/g, '')
      .slice(0, 6);

    setOtp(value);
  };

  return (
    <main className="forgot-page">
      <div className="forgot-orb forgot-orb-one" />
      <div className="forgot-orb forgot-orb-two" />
      <div className="forgot-grid-pattern" />

      <button
        type="button"
        className="forgot-theme-toggle"
        onClick={toggleTheme}
        aria-label="Toggle color theme"
      >
        {theme === 'dark' ? (
          <Sun size={17} />
        ) : (
          <Moon size={17} />
        )}

        <span>
          {theme === 'dark' ? 'Light' : 'Dark'}
        </span>
      </button>

      <motion.section
        className="forgot-shell"
        initial={{
          opacity: 0,
          y: 24,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.45,
          ease: 'easeOut',
        }}
      >
        <aside className="forgot-brand-panel">
          <div className="forgot-brand">
            <span className="forgot-brand-icon">
              <Dumbbell
                size={22}
                strokeWidth={2.5}
              />
            </span>

            <div>
              <strong>
                Forge<span>Track</span>
              </strong>

              <small>PERFORMANCE OS</small>
            </div>
          </div>

          <div className="forgot-brand-copy">
            <p className="forgot-kicker">
              SECURE ACCOUNT RECOVERY
            </p>

            <h2>
              Lose the password, not your progress.
            </h2>

            <p>
              Recover access securely with a one-time code
              and get straight back to your training data.
            </p>
          </div>

          <div className="forgot-security-list">
            <div>
              <ShieldCheck size={15} />
              <span>OTP-based verification</span>
            </div>

            <div>
              <Check size={14} />
              <span>Secure password replacement</span>
            </div>

            <div>
              <Check size={14} />
              <span>Your existing account data stays intact</span>
            </div>
          </div>
        </aside>

        <section className="forgot-form-panel">
          <div className="forgot-form-top">
            <Link
              to="/login"
              className="forgot-back"
            >
              <ArrowLeft size={15} />
              Back to login
            </Link>

            <div className="forgot-step">
              <span className={step >= 1 ? 'active' : ''}>
                1
              </span>

              <i />

              <span className={step >= 2 ? 'active' : ''}>
                2
              </span>
            </div>
          </div>

          <div className="forgot-mobile-brand">
            <span>
              <Dumbbell size={19} />
            </span>

            <strong>ForgeTrack</strong>
          </div>

          <header className="forgot-heading">
            <p>
              {step === 1
                ? 'ACCOUNT RECOVERY'
                : 'VERIFY & RESET'}
            </p>

            <h1>
              {step === 1
                ? 'Forgot your password?'
                : 'Create a new password'}
            </h1>

            <span>
              {step === 1
                ? 'Enter your email and we’ll send a one-time code.'
                : `Enter the OTP sent for ${email}.`}
            </span>
          </header>

          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.form
                key="request"
                className="forgot-form"
                onSubmit={handleRequestOTP}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
              >
                <div className="forgot-field">
                  <label htmlFor="forgot-email">
                    Email address
                  </label>

                  <div className="forgot-input-wrap">
                    <Mail size={16} />

                    <input
                      id="forgot-email"
                      type="email"
                      value={email}
                      onChange={(event) =>
                        setEmail(event.target.value)
                      }
                      required
                      autoComplete="email"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="forgot-submit"
                  disabled={loading}
                >
                  <span>
                    {loading
                      ? 'Sending OTP...'
                      : 'Send OTP'}
                  </span>

                  {!loading && (
                    <ArrowRight size={17} />
                  )}
                </button>
              </motion.form>
            ) : (
              <motion.form
                key="reset"
                className="forgot-form"
                onSubmit={handleResetPassword}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
              >
                <div className="forgot-field">
                  <label htmlFor="forgot-otp">
                    OTP code
                  </label>

                  <div className="forgot-input-wrap">
                    <KeyRound size={16} />

                    <input
                      id="forgot-otp"
                      value={otp}
                      onChange={handleOtpChange}
                      required
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      placeholder="6-digit OTP"
                      className="forgot-otp-input"
                    />
                  </div>

                  <div className="forgot-otp-meta">
                    <span>
                      {otp.length}/6 digits
                    </span>

                    <button
                      type="button"
                      onClick={() => setStep(1)}
                    >
                      Change email
                    </button>
                  </div>
                </div>

                <div className="forgot-field">
                  <label htmlFor="forgot-new-password">
                    New password
                  </label>

                  <div className="forgot-input-wrap forgot-password-wrap">
                    <Lock size={16} />

                    <input
                      id="forgot-new-password"
                      type={
                        showPassword
                          ? 'text'
                          : 'password'
                      }
                      value={newPassword}
                      onChange={(event) =>
                        setNewPassword(
                          event.target.value
                        )
                      }
                      required
                      minLength={8}
                      autoComplete="new-password"
                      placeholder="Create a strong password"
                    />

                    <button
                      type="button"
                      className="forgot-password-toggle"
                      onClick={() =>
                        setShowPassword(
                          (current) => !current
                        )
                      }
                      aria-label={
                        showPassword
                          ? 'Hide password'
                          : 'Show password'
                      }
                    >
                      {showPassword ? (
                        <EyeOff size={17} />
                      ) : (
                        <Eye size={17} />
                      )}
                    </button>
                  </div>

                  {newPassword && (
                    <div className="forgot-strength">
                      <div
                        className={`forgot-strength-bars strength-${strength}`}
                      >
                        {[1, 2, 3, 4].map(
                          (level) => (
                            <span
                              key={level}
                              className={
                                strength >= level
                                  ? 'filled'
                                  : ''
                              }
                            />
                          )
                        )}
                      </div>

                      <div className="forgot-strength-row">
                        <span>Password strength</span>
                        <strong>
                          {strengthText[strength]}
                        </strong>
                      </div>

                      <div className="forgot-password-checks">
                        {passwordChecks.map(
                          (check) => (
                            <span
                              key={check.label}
                              className={
                                check.valid
                                  ? 'valid'
                                  : ''
                              }
                            >
                              <Check size={11} />
                              {check.label}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="forgot-submit forgot-reset-submit"
                  disabled={loading}
                >
                  <span>
                    {loading
                      ? 'Resetting password...'
                      : 'Reset Password'}
                  </span>

                  {!loading && (
                    <ArrowRight size={17} />
                  )}
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="forgot-security-note">
            <ShieldCheck size={13} />

            <span>
              Your password is only changed after OTP
              verification succeeds.
            </span>
          </div>
        </section>
      </motion.section>
    </main>
  );
}

export default ForgotPassword;