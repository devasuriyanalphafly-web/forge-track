import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

import { ThemeProvider } from './context/ThemeContext';

import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';

import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Stats from './pages/Stats';
import Exercises from './pages/Exercises';
import Goals from './pages/Goals';
import Weight from './pages/Weight';
import Diets from './pages/Diets';
import Recipes from './pages/Recipes';


function ProtectedRoute({
  isAuthenticated,
  children,
}) {
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  return children;
}


function App() {
  const [isAuthenticated, setIsAuthenticated] =
    useState(() => {
      return Boolean(
        localStorage.getItem('access_token')
      );
    });


  useEffect(() => {
    const handleAuthExpired = () => {
      localStorage.removeItem(
        'access_token'
      );

      localStorage.removeItem(
        'refresh_token'
      );

      setIsAuthenticated(false);
    };


    window.addEventListener(
      'auth-expired',
      handleAuthExpired
    );


    return () => {
      window.removeEventListener(
        'auth-expired',
        handleAuthExpired
      );
    };
  }, []);


  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>

          {/* =========================
              PUBLIC ROUTES
          ========================= */}

          <Route
            path="/login"
            element={
              isAuthenticated
                ? (
                  <Navigate
                    to="/"
                    replace
                  />
                )
                : (
                  <Login
                    setIsAuthenticated={
                      setIsAuthenticated
                    }
                  />
                )
            }
          />


          <Route
            path="/register"
            element={
              isAuthenticated
                ? (
                  <Navigate
                    to="/"
                    replace
                  />
                )
                : (
                  <Register />
                )
            }
          />


          <Route
            path="/forgot-password"
            element={
              isAuthenticated
                ? (
                  <Navigate
                    to="/"
                    replace
                  />
                )
                : (
                  <ForgotPassword />
                )
            }
          />


          {/* =========================
              PROTECTED ROUTES
          ========================= */}

          <Route
            path="/"
            element={
              <ProtectedRoute
                isAuthenticated={
                  isAuthenticated
                }
              >
                <Dashboard
                  setIsAuthenticated={
                    setIsAuthenticated
                  }
                />
              </ProtectedRoute>
            }
          />


          <Route
            path="/profile"
            element={
              <ProtectedRoute
                isAuthenticated={
                  isAuthenticated
                }
              >
                <Profile
                  setIsAuthenticated={
                    setIsAuthenticated
                  }
                />
              </ProtectedRoute>
            }
          />


          <Route
            path="/stats"
            element={
              <ProtectedRoute
                isAuthenticated={
                  isAuthenticated
                }
              >
                <Stats
                  setIsAuthenticated={
                    setIsAuthenticated
                  }
                />
              </ProtectedRoute>
            }
          />


          <Route
            path="/exercises"
            element={
              <ProtectedRoute
                isAuthenticated={
                  isAuthenticated
                }
              >
                <Exercises
                  setIsAuthenticated={
                    setIsAuthenticated
                  }
                />
              </ProtectedRoute>
            }
          />


          <Route
            path="/goals"
            element={
              <ProtectedRoute
                isAuthenticated={
                  isAuthenticated
                }
              >
                <Goals
                  setIsAuthenticated={
                    setIsAuthenticated
                  }
                />
              </ProtectedRoute>
            }
          />


          <Route
            path="/weight"
            element={
              <ProtectedRoute
                isAuthenticated={
                  isAuthenticated
                }
              >
                <Weight
                  setIsAuthenticated={
                    setIsAuthenticated
                  }
                />
              </ProtectedRoute>
            }
          />


          <Route
            path="/diets"
            element={
              <ProtectedRoute
                isAuthenticated={
                  isAuthenticated
                }
              >
                <Diets
                  setIsAuthenticated={
                    setIsAuthenticated
                  }
                />
              </ProtectedRoute>
            }
          />


          <Route
            path="/recipes"
            element={
              <ProtectedRoute
                isAuthenticated={
                  isAuthenticated
                }
              >
                <Recipes
                  setIsAuthenticated={
                    setIsAuthenticated
                  }
                />
              </ProtectedRoute>
            }
          />


          {/* =========================
              UNKNOWN ROUTES
          ========================= */}

          <Route
            path="*"
            element={
              <Navigate
                to={
                  isAuthenticated
                    ? '/'
                    : '/login'
                }
                replace
              />
            }
          />

        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}


export default App;