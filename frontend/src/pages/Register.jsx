import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Dumbbell,
  User,
  Mail,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  Sun,
  Moon,
  Check,
  ShieldCheck,
  ArrowLeft,
} from 'lucide-react';

import API from '../api';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';
import './Register.css';


function getPasswordStrength(password) {
  let score = 0;

  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  return score;
}


const strengthText = [
  '',
  'Weak',
  'Fair',
  'Good',
  'Strong',
];


function getErrorMessage(
  error,
  fallback = 'Something went wrong.'
) {
  if (!error?.response) {
    return 'Unable to connect to the server.';
  }

  const data = error.response.data;

  if (typeof data?.detail === 'string') {
    return data.detail;
  }

  if (
    data &&
    typeof data === 'object'
  ) {
    for (const value of Object.values(data)) {
      if (
        Array.isArray(value) &&
        value.length > 0
      ) {
        return String(value[0]);
      }

      if (typeof value === 'string') {
        return value;
      }
    }
  }

  return fallback;
}


function Register() {

  // =====================================================
  // REGISTRATION FORM
  // =====================================================

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
  });


  // =====================================================
  // OTP
  // =====================================================

  const [step, setStep] = useState('register');

  const [otp, setOtp] = useState('');

  const [verificationEmail, setVerificationEmail] =
    useState('');


  // =====================================================
  // UI STATE
  // =====================================================

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [verifying, setVerifying] =
    useState(false);

  const [resending, setResending] =
    useState(false);


  const navigate = useNavigate();

  const {
    theme,
    toggleTheme,
  } = useTheme();


  // =====================================================
  // PASSWORD STRENGTH
  // =====================================================

  const strength =
    getPasswordStrength(
      formData.password
    );


  const passwordChecks = [

    {
      label: '8+ characters',
      valid:
        formData.password.length >= 8,
    },

    {
      label: 'Uppercase',
      valid:
        /[A-Z]/.test(
          formData.password
        ),
    },

    {
      label: 'Number',
      valid:
        /[0-9]/.test(
          formData.password
        ),
    },

    {
      label: 'Symbol',
      valid:
        /[^A-Za-z0-9]/.test(
          formData.password
        ),
    },
  ];


  // =====================================================
  // FORM CHANGE
  // =====================================================

  const handleChange = (event) => {

    const {
      name,
      value,
    } = event.target;

    setFormData(
      (current) => ({
        ...current,
        [name]: value,
      })
    );
  };


  // =====================================================
  // STEP 1 - SEND REGISTRATION OTP
  // =====================================================

  const handleSubmit = async (event) => {

    event.preventDefault();


    if (
      formData.password.length < 8
    ) {

      toast.error(
        'Password must be at least 8 characters'
      );

      return;
    }


    const email =
      formData.email
        .trim()
        .toLowerCase();


    const payload = {

      ...formData,

      username:
        formData.username.trim(),

      email,

      first_name:
        formData.first_name.trim(),

      last_name:
        formData.last_name.trim(),
    };


    try {

      setLoading(true);


      await API.post(
        'auth/register/',
        payload
      );


      setVerificationEmail(
        email
      );

      setOtp('');

      setStep('otp');


      toast.success(
        'Verification code sent to your email.'
      );


    } catch (error) {

      console.error(
        'Registration OTP error:',
        error
      );


      toast.error(
        getErrorMessage(
          error,
          'Could not send verification code.'
        )
      );


    } finally {

      setLoading(false);
    }
  };


  // =====================================================
  // STEP 2 - VERIFY OTP
  // =====================================================

  const handleVerifyOTP = async (
    event
  ) => {

    event.preventDefault();


    const cleanOTP =
      otp.replace(/\D/g, '');


    if (cleanOTP.length !== 6) {

      toast.error(
        'Enter the 6-digit verification code.'
      );

      return;
    }


    try {

      setVerifying(true);


      await API.post(
        'auth/register/verify/',
        {
          email:
            verificationEmail,

          otp:
            cleanOTP,
        }
      );


      toast.success(
        'Email verified! Your account is ready.'
      );


      setTimeout(() => {

        navigate(
          '/login',
          {
            replace: true,
          }
        );

      }, 1000);


    } catch (error) {

      console.error(
        'OTP verification error:',
        error
      );


      toast.error(
        getErrorMessage(
          error,
          'OTP verification failed.'
        )
      );


    } finally {

      setVerifying(false);
    }
  };


  // =====================================================
  // RESEND OTP
  // =====================================================

  const handleResendOTP = async () => {

    if (resending) {
      return;
    }


    const payload = {

      ...formData,

      username:
        formData.username.trim(),

      email:
        formData.email
          .trim()
          .toLowerCase(),

      first_name:
        formData.first_name.trim(),

      last_name:
        formData.last_name.trim(),
    };


    try {

      setResending(true);


      await API.post(
        'auth/register/',
        payload
      );


      setOtp('');


      toast.success(
        'A new verification code was sent.'
      );


    } catch (error) {

      console.error(
        'Resend OTP error:',
        error
      );


      toast.error(
        getErrorMessage(
          error,
          'Could not resend verification code.'
        )
      );


    } finally {

      setResending(false);
    }
  };


  // =====================================================
  // BACK TO REGISTRATION
  // =====================================================

  const handleBack = () => {

    setOtp('');

    setStep('register');
  };


  // =====================================================
  // OTP INPUT
  // =====================================================

  const handleOTPChange = (event) => {

    const value =
      event.target.value
        .replace(/\D/g, '')
        .slice(0, 6);

    setOtp(value);
  };


  // =====================================================
  // RENDER
  // =====================================================

  return (

    <main className="register-page">

      <div
        className="
          register-orb
          register-orb-one
        "
      />

      <div
        className="
          register-orb
          register-orb-two
        "
      />

      <div
        className="
          register-grid-pattern
        "
      />


      {/* ===============================================
          THEME
      =============================================== */}

      <button
        type="button"
        className="register-theme-toggle"
        onClick={toggleTheme}
        aria-label="Toggle color theme"
      >

        {
          theme === 'dark'
            ? <Sun size={17} />
            : <Moon size={17} />
        }

        <span>

          {
            theme === 'dark'
              ? 'Light'
              : 'Dark'
          }

        </span>

      </button>


      {/* ===============================================
          REGISTER SHELL
      =============================================== */}

      <motion.section

        className="register-shell"

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


        {/* =============================================
            LEFT BRAND PANEL
        ============================================= */}

        <aside
          className="register-brand-panel"
        >

          <div
            className="register-brand"
          >

            <span
              className="register-brand-icon"
            >
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


          <div
            className="register-brand-copy"
          >

            <p
              className="register-kicker"
            >
              BUILD. TRACK. EVOLVE.
            </p>


            <h2>

              {
                step === 'register'
                  ? (
                    'Your progress deserves more than guesswork.'
                  )
                  : (
                    'One final step before you begin.'
                  )
              }

            </h2>


            <p>

              {
                step === 'register'
                  ? (
                    <>
                      Create your ForgeTrack
                      account and turn every
                      workout, weigh-in and
                      nutrition decision into
                      measurable progress.
                    </>
                  )
                  : (
                    <>
                      We sent a secure
                      verification code to your
                      email. Verify your address
                      to activate your
                      ForgeTrack account.
                    </>
                  )
              }

            </p>

          </div>


          <div
            className="register-benefits"
          >

            <div>
              <Check size={14} />
              <span>
                Track training performance
              </span>
            </div>

            <div>
              <Check size={14} />
              <span>
                Monitor weight and goals
              </span>
            </div>

            <div>
              <Check size={14} />
              <span>
                Build consistent habits
              </span>
            </div>

          </div>

        </aside>


        {/* =============================================
            RIGHT PANEL
        ============================================= */}

        <section
          className="register-form-panel"
        >

          <div
            className="register-mobile-brand"
          >

            <span>
              <Dumbbell size={19} />
            </span>

            <strong>
              ForgeTrack
            </strong>

          </div>


          {/* ===========================================
              REGISTRATION STEP
          =========================================== */}

          {
            step === 'register' && (
              <>

                <header
                  className="register-heading"
                >

                  <p>
                    GET STARTED
                  </p>

                  <h1>
                    Create your account
                  </h1>

                  <span>
                    Start tracking your
                    performance in a few seconds.
                  </span>

                </header>


                <form
                  className="register-form"
                  onSubmit={handleSubmit}
                >

                  {/* NAME */}

                  <div
                    className="register-name-grid"
                  >

                    <div
                      className="register-field"
                    >

                      <label
                        htmlFor="
                          register-first-name
                        "
                      >
                        First name
                      </label>

                      <input
                        id="register-first-name"
                        name="first_name"
                        value={
                          formData.first_name
                        }
                        onChange={
                          handleChange
                        }
                        autoComplete="
                          given-name
                        "
                        placeholder="
                          First name
                        "
                      />

                    </div>


                    <div
                      className="register-field"
                    >

                      <label
                        htmlFor="
                          register-last-name
                        "
                      >
                        Last name
                      </label>

                      <input
                        id="register-last-name"
                        name="last_name"
                        value={
                          formData.last_name
                        }
                        onChange={
                          handleChange
                        }
                        autoComplete="
                          family-name
                        "
                        placeholder="
                          Last name
                        "
                      />

                    </div>

                  </div>


                  {/* USERNAME */}

                  <div
                    className="register-field"
                  >

                    <label
                      htmlFor="
                        register-username
                      "
                    >
                      Username
                    </label>


                    <div
                      className="
                        register-input-wrap
                      "
                    >

                      <User size={16} />

                      <input
                        id="
                          register-username
                        "
                        name="username"
                        value={
                          formData.username
                        }
                        onChange={
                          handleChange
                        }
                        required
                        autoComplete="
                          username
                        "
                        placeholder="
                          Choose a username
                        "
                      />

                    </div>

                  </div>


                  {/* EMAIL */}

                  <div
                    className="register-field"
                  >

                    <label
                      htmlFor="
                        register-email
                      "
                    >
                      Email address
                    </label>


                    <div
                      className="
                        register-input-wrap
                      "
                    >

                      <Mail size={16} />

                      <input
                        id="register-email"
                        name="email"
                        type="email"
                        value={
                          formData.email
                        }
                        onChange={
                          handleChange
                        }
                        required
                        autoComplete="email"
                        placeholder="
                          you@example.com
                        "
                      />

                    </div>

                  </div>


                  {/* PASSWORD */}

                  <div
                    className="register-field"
                  >

                    <label
                      htmlFor="
                        register-password
                      "
                    >
                      Password
                    </label>


                    <div
                      className="
                        register-input-wrap
                        register-password-wrap
                      "
                    >

                      <Lock size={16} />


                      <input
                        id="
                          register-password
                        "
                        name="password"
                        type={
                          showPassword
                            ? 'text'
                            : 'password'
                        }
                        value={
                          formData.password
                        }
                        onChange={
                          handleChange
                        }
                        required
                        minLength={8}
                        autoComplete="
                          new-password
                        "
                        placeholder="
                          Create a strong password
                        "
                      />


                      <button
                        type="button"
                        className="
                          register-password-toggle
                        "
                        onClick={() =>
                          setShowPassword(
                            (current) =>
                              !current
                          )
                        }
                        aria-label={
                          showPassword
                            ? 'Hide password'
                            : 'Show password'
                        }
                      >

                        {
                          showPassword
                            ? (
                              <EyeOff
                                size={17}
                              />
                            )
                            : (
                              <Eye
                                size={17}
                              />
                            )
                        }

                      </button>

                    </div>


                    {
                      formData.password && (
                        <div
                          className="
                            register-strength
                          "
                        >

                          <div
                            className={`
                              register-strength-bars
                              strength-${strength}
                            `}
                          >

                            {
                              [1, 2, 3, 4]
                                .map(
                                  (level) => (
                                    <span
                                      key={
                                        level
                                      }
                                      className={
                                        strength >=
                                        level
                                          ? 'filled'
                                          : ''
                                      }
                                    />
                                  )
                                )
                            }

                          </div>


                          <div
                            className="
                              register-strength-row
                            "
                          >

                            <span>
                              Password strength
                            </span>

                            <strong>
                              {
                                strengthText[
                                  strength
                                ]
                              }
                            </strong>

                          </div>


                          <div
                            className="
                              register-password-checks
                            "
                          >

                            {
                              passwordChecks.map(
                                (check) => (
                                  <span
                                    key={
                                      check.label
                                    }
                                    className={
                                      check.valid
                                        ? 'valid'
                                        : ''
                                    }
                                  >

                                    <Check
                                      size={11}
                                    />

                                    {
                                      check.label
                                    }

                                  </span>
                                )
                              )
                            }

                          </div>

                        </div>
                      )
                    }

                  </div>


                  {/* SUBMIT */}

                  <button
                    type="submit"
                    className="
                      register-submit
                    "
                    disabled={loading}
                  >

                    <span>

                      {
                        loading
                          ? (
                            'Sending verification code...'
                          )
                          : (
                            'Continue'
                          )
                      }

                    </span>

                    {
                      !loading && (
                        <ArrowRight
                          size={17}
                        />
                      )
                    }

                  </button>

                </form>


                <p
                  className="register-login"
                >

                  Already have an account?{' '}

                  <Link to="/login">
                    Sign in
                  </Link>

                </p>

              </>
            )
          }


          {/* ===========================================
              OTP VERIFICATION STEP
          =========================================== */}

          {
            step === 'otp' && (
              <motion.div

                className="register-otp-section"

                initial={{
                  opacity: 0,
                  x: 20,
                }}

                animate={{
                  opacity: 1,
                  x: 0,
                }}

                transition={{
                  duration: 0.3,
                }}
              >

                <button
                  type="button"
                  className="
                    register-otp-back
                  "
                  onClick={
                    handleBack
                  }
                >

                  <ArrowLeft
                    size={16}
                  />

                  Edit details

                </button>


                <div
                  className="
                    register-otp-icon
                  "
                >

                  <ShieldCheck
                    size={30}
                  />

                </div>


                <header
                  className="
                    register-heading
                    register-otp-heading
                  "
                >

                  <p>
                    EMAIL VERIFICATION
                  </p>

                  <h1>
                    Check your email
                  </h1>

                  <span>
                    Enter the 6-digit code
                    sent to
                  </span>

                  <strong
                    className="
                      register-otp-email
                    "
                  >
                    {
                      verificationEmail
                    }
                  </strong>

                </header>


                <form
                  className="
                    register-form
                    register-otp-form
                  "
                  onSubmit={
                    handleVerifyOTP
                  }
                >

                  <div
                    className="
                      register-field
                    "
                  >

                    <label
                      htmlFor="
                        registration-otp
                      "
                    >
                      Verification code
                    </label>


                    <input
                      id="
                        registration-otp
                      "
                      className="
                        register-otp-input
                      "
                      type="text"
                      inputMode="numeric"
                      autoComplete="
                        one-time-code
                      "
                      value={otp}
                      onChange={
                        handleOTPChange
                      }
                      maxLength={6}
                      placeholder="000000"
                      required
                      autoFocus
                    />

                  </div>


                  <button
                    type="submit"
                    className="
                      register-submit
                    "
                    disabled={
                      verifying ||
                      otp.length !== 6
                    }
                  >

                    <span>

                      {
                        verifying
                          ? (
                            'Verifying...'
                          )
                          : (
                            'Verify & Create Account'
                          )
                      }

                    </span>


                    {
                      !verifying && (
                        <ShieldCheck
                          size={17}
                        />
                      )
                    }

                  </button>

                </form>


                <div
                  className="
                    register-otp-resend
                  "
                >

                  <span>
                    Didn't receive the code?
                  </span>

                  <button
                    type="button"
                    onClick={
                      handleResendOTP
                    }
                    disabled={
                      resending
                    }
                  >

                    {
                      resending
                        ? (
                          'Sending...'
                        )
                        : (
                          'Resend code'
                        )
                    }

                  </button>

                </div>


                <p
                  className="
                    register-otp-expiry
                  "
                >
                  The verification code
                  expires in 10 minutes.
                </p>

              </motion.div>
            )
          }


          <p
            className="register-terms"
          >
            By creating an account,
            you agree to use ForgeTrack
            responsibly and keep your
            account credentials secure.
          </p>

        </section>

      </motion.section>

    </main>
  );
}


export default Register;