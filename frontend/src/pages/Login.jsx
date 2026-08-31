import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

import {
  Dumbbell,
  Mail,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  Sun,
  Moon,
  Check,
} from 'lucide-react';

import API from '../api';
import { getApiErrorMessage } from '../utils/apiError';
import { useTheme } from '../context/ThemeContext';

import toast from 'react-hot-toast';

import './Login.css';


function Login({ setIsAuthenticated }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const {
    theme,
    toggleTheme,
  } = useTheme();


  // =====================================================
  // LOAD REMEMBERED EMAIL
  // =====================================================

  useEffect(() => {
    const savedEmail =
      localStorage.getItem('remember_email');

    if (savedEmail) {
      setEmail(savedEmail);
      setRemember(true);
    }
  }, []);


  // =====================================================
  // LOGIN
  // =====================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    const cleanedEmail =
      email.trim().toLowerCase();


    if (!cleanedEmail) {
      toast.error(
        'Enter your email address.'
      );

      return;
    }


    if (!password) {
      toast.error(
        'Enter your password.'
      );

      return;
    }


    try {
      setLoading(true);


      const response = await API.post(
        'auth/login/',
        {
          email: cleanedEmail,
          password,
        }
      );


      const accessToken =
        response.data?.access;

      const refreshToken =
        response.data?.refresh;


      // Protect against malformed API responses
      if (
        !accessToken ||
        !refreshToken
      ) {
        throw new Error(
          'Authentication tokens were not returned.'
        );
      }


      localStorage.setItem(
        'access_token',
        accessToken
      );

      localStorage.setItem(
        'refresh_token',
        refreshToken
      );


      if (remember) {
        localStorage.setItem(
          'remember_email',
          cleanedEmail
        );
      } else {
        localStorage.removeItem(
          'remember_email'
        );
      }


      setIsAuthenticated(true);


      toast.success(
        'Welcome back!'
      );


      navigate(
        '/',
        {
          replace: true,
        }
      );

    } catch (error) {

        console.error(
          'Login failed:',
          error
        );

        if (error?.response?.status === 401) {

          toast.error(
            'Incorrect email or password.'
          );

        } else {

          toast.error(
            getApiErrorMessage(
              error,
              'Login failed. Please try again.'
            )
          );

        }

      } finally {

        setLoading(false);

      }
    };


  return (
    <main className="login-page">

      <div className="login-orb login-orb-one" />
      <div className="login-orb login-orb-two" />
      <div className="login-grid-pattern" />


      {/* =========================
          THEME TOGGLE
      ========================= */}

      <button
        type="button"
        className="login-theme-toggle"
        onClick={toggleTheme}
        aria-label="Toggle color theme"
      >
        {theme === 'dark'
          ? (
            <Sun size={17} />
          )
          : (
            <Moon size={17} />
          )
        }

        <span>
          {theme === 'dark'
            ? 'Light'
            : 'Dark'
          }
        </span>
      </button>


      <motion.section
        className="login-shell"

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


        {/* =========================
            BRAND PANEL
        ========================= */}

        <aside className="login-brand-panel">

          <div className="login-brand">

            <span className="login-brand-icon">
              <Dumbbell
                size={22}
                strokeWidth={2.5}
              />
            </span>


            <div>
              <strong>
                Forge<span>Track</span>
              </strong>

              <small>
                PERFORMANCE OS
              </small>
            </div>

          </div>


          <div className="login-brand-copy">

            <p className="login-kicker">
              RETURN TO THE WORK
            </p>

            <h2>
              Progress doesn't restart when you sign back in.
            </h2>

            <p>
              Pick up where you left off with your workouts,
              goals, nutrition and performance data.
            </p>

          </div>


          <div className="login-benefits">

            <div>
              <Check size={14} />

              <span>
                Your training history stays with you
              </span>
            </div>


            <div>
              <Check size={14} />

              <span>
                Your goals remain visible and measurable
              </span>
            </div>


            <div>
              <Check size={14} />

              <span>
                Your progress stays connected
              </span>
            </div>

          </div>

        </aside>


        {/* =========================
            LOGIN FORM PANEL
        ========================= */}

        <section className="login-form-panel">


          <div className="login-mobile-brand">

            <span>
              <Dumbbell size={19} />
            </span>

            <strong>
              ForgeTrack
            </strong>

          </div>


          <header className="login-heading">

            <p>
              WELCOME BACK
            </p>

            <h1>
              Sign in to ForgeTrack
            </h1>

            <span>
              Continue building your performance history.
            </span>

          </header>


          <form
            className="login-form"
            onSubmit={handleSubmit}
          >


            {/* EMAIL */}

            <div className="login-field">

              <label htmlFor="login-email">
                Email address
              </label>


              <div className="login-input-wrap">

                <Mail size={16} />


                <input
                  id="login-email"
                  type="email"

                  value={email}

                  onChange={(event) =>
                    setEmail(
                      event.target.value
                    )
                  }

                  required
                  autoComplete="email"

                  placeholder="you@example.com"
                />

              </div>

            </div>


            {/* PASSWORD */}

            <div className="login-field">

              <label htmlFor="login-password">
                Password
              </label>


              <div className="login-input-wrap login-password-wrap">

                <Lock size={16} />


                <input
                  id="login-password"

                  type={
                    showPassword
                      ? 'text'
                      : 'password'
                  }

                  value={password}

                  onChange={(event) =>
                    setPassword(
                      event.target.value
                    )
                  }

                  required
                  autoComplete="current-password"

                  placeholder="Enter your password"
                />


                <button
                  type="button"
                  className="login-password-toggle"

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
                  {showPassword
                    ? (
                      <EyeOff size={17} />
                    )
                    : (
                      <Eye size={17} />
                    )
                  }
                </button>

              </div>

            </div>


            {/* LOGIN OPTIONS */}

            <div className="login-options">

              <label className="login-remember">

                <input
                  type="checkbox"

                  checked={remember}

                  onChange={(event) =>
                    setRemember(
                      event.target.checked
                    )
                  }
                />


                <span className="login-checkbox">
                  {remember && (
                    <Check size={11} />
                  )}
                </span>


                <span>
                  Remember email
                </span>

              </label>


              <Link
                to="/forgot-password"
                className="login-forgot"
              >
                Forgot password?
              </Link>

            </div>


            {/* SUBMIT */}

            <button
              type="submit"
              className="login-submit"

              disabled={loading}
            >

              <span>
                {loading
                  ? 'Signing in...'
                  : 'Sign In'
                }
              </span>


              {!loading && (
                <ArrowRight size={17} />
              )}

            </button>

          </form>


          <div className="login-security-note">

            <Lock size={12} />

            <span>
              Your session is protected by authenticated
              access tokens.
            </span>

          </div>


          <p className="login-register">

            Don't have an account?{' '}

            <Link to="/register">
              Create one
            </Link>

          </p>

        </section>

      </motion.section>

    </main>
  );
}


export default Login;