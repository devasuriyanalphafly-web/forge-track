import {
  useEffect,
  useState,
} from 'react';

import {
  useLocation,
  useNavigate,
} from 'react-router-dom';

import {
  Dumbbell,
  LayoutDashboard,
  BarChart3,
  Target,
  User,
  LogOut,
  Moon,
  Sun,
  Download,
  Scale,
  Utensils,
  BookOpen,
} from 'lucide-react';

import { useTheme } from '../context/ThemeContext';

import './Navbar.css';


function Navbar({
  setIsAuthenticated,
  onExport,
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const [scrolled, setScrolled] =
    useState(false);

  const {
    theme,
    toggleTheme,
  } = useTheme();


  /* =========================
      NAVBAR SCROLL EFFECT
  ========================= */

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(
        window.scrollY > 20
      );
    };

    // Check initial position
    handleScroll();

    window.addEventListener(
      'scroll',
      handleScroll
    );

    return () => {
      window.removeEventListener(
        'scroll',
        handleScroll
      );
    };
  }, []);


  const links = [
    {
      path: '/',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },

    {
      path: '/stats',
      label: 'Stats',
      icon: BarChart3,
    },

    {
      path: '/exercises',
      label: 'Exercises',
      icon: Dumbbell,
    },

    {
      path: '/weight',
      label: 'Weight',
      icon: Scale,
    },

    {
      path: '/diets',
      label: 'Diets',
      icon: Utensils,
    },

    {
      path: '/recipes',
      label: 'Recipes',
      icon: BookOpen,
    },

    {
      path: '/goals',
      label: 'Goals',
      icon: Target,
    },

    {
      path: '/profile',
      label: 'Profile',
      icon: User,
    },
  ];


  const isActive = (path) => {
    if (path === '/') {
      return (
        location.pathname === '/'
      );
    }

    return (
      location.pathname === path ||
      location.pathname.startsWith(
        `${path}/`
      )
    );
  };


  const handleLogout = () => {
    localStorage.removeItem(
      'access_token'
    );

    localStorage.removeItem(
      'refresh_token'
    );

    setIsAuthenticated(false);

    navigate(
      '/login',
      {
        replace: true,
      }
    );
  };


  return (
    <header
      className={
        `navbar ${
          scrolled
            ? 'navbar-scrolled'
            : 'navbar-transparent'
        }`
      }
    >

      <div className="navbar-inner">


        {/* =========================
            BRAND
        ========================= */}

        <button
          type="button"
          className="navbar-brand"
          onClick={() => navigate('/')}
          aria-label="Go to ForgeTrack dashboard"
        >

          <span className="navbar-logo">
            <Dumbbell
              size={27}
              strokeWidth={2.4}
            />
          </span>


          <span className="navbar-brand-text">

            <span className="navbar-brand-name">
              Forge
              <span>
                Track
              </span>
            </span>


            <span className="navbar-brand-subtitle">
              PERFORMANCE OS
            </span>

          </span>

        </button>


        {/* =========================
            DESKTOP NAVIGATION
        ========================= */}

        <nav
          className="navbar-links desktop-nav"
          aria-label="Main navigation"
        >

          {links.map((link) => {
            const Icon = link.icon;

            const active =
              isActive(link.path);


            return (
              <button
                key={link.path}
                type="button"

                className={
                  `navbar-link ${
                    active
                      ? 'navbar-link-active'
                      : ''
                  }`
                }

                onClick={() =>
                  navigate(link.path)
                }

                aria-current={
                  active
                    ? 'page'
                    : undefined
                }
              >

                <Icon
                  size={17}
                  strokeWidth={
                    active
                      ? 2.4
                      : 2
                  }
                />

                <span>
                  {link.label}
                </span>

              </button>
            );
          })}

        </nav>


        {/* =========================
            ACTIONS
        ========================= */}

        <div className="navbar-actions">


          {/* Export */}

          {onExport && (
            <button
              type="button"
              className="navbar-action navbar-export"

              onClick={
                onExport
              }

              title="Export workout data"
            >

              <Download
                size={17}
              />

              <span>
                Export
              </span>

            </button>
          )}


          {/* Theme */}

          <button
            type="button"
            className="navbar-action navbar-theme"

            onClick={
              toggleTheme
            }

            title={
              theme === 'dark'
                ? 'Switch to light mode'
                : 'Switch to dark mode'
            }

            aria-label="Toggle theme"
          >

            {theme === 'dark'
              ? (
                <Sun
                  size={18}
                />
              )
              : (
                <Moon
                  size={18}
                />
              )
            }

          </button>


          {/* Profile */}

          <button
            type="button"
            className="navbar-profile"

            onClick={() =>
              navigate('/profile')
            }

            title="Profile"
            aria-label="Open profile"
          >

            <span className="navbar-avatar">
              <User
                size={17}
              />
            </span>

          </button>


          {/* Logout */}

          <button
            type="button"
            className="navbar-logout"

            onClick={
              handleLogout
            }

            title="Logout"
            aria-label="Logout"
          >

            <LogOut
              size={17}
            />

            <span>
              Logout
            </span>

          </button>

        </div>

      </div>

    </header>
  );
}


export default Navbar;