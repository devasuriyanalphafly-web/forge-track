import { useNavigate, useLocation } from 'react-router-dom';
import './BottomNav.css';
import {
  LayoutDashboard,
  Dumbbell,
  Scale,
  Utensils,
  BookOpen,
  User,
} from 'lucide-react';

import './BottomNav.css';

function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const items = [
    { path: '/', icon: LayoutDashboard, label: 'Home' },
    { path: '/exercises', icon: Dumbbell, label: 'Exercises' },
    { path: '/weight', icon: Scale, label: 'Weight' },
    { path: '/diets', icon: Utensils, label: 'Diets' },
    { path: '/recipes', icon: BookOpen, label: 'Recipes' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }

    return (
      location.pathname === path ||
      location.pathname.startsWith(`${path}/`)
    );
  };

  return (
    <nav className="bottom-nav" aria-label="Primary navigation">
      <div className="bottom-nav-inner">
        {items.map((item) => {
          const active = isActive(item.path);
          const Icon = item.icon;

          return (
            <button
              key={item.path}
              type="button"
              className={`bottom-nav-item ${
                active ? 'active' : ''
              }`}
              onClick={() => navigate(item.path)}
              aria-label={item.label}
              aria-current={active ? 'page' : undefined}
            >
              <span className="bottom-nav-icon">
                <Icon
                  size={20}
                  strokeWidth={active ? 2.5 : 2}
                />
              </span>

              <span className="bottom-nav-label">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export default BottomNav;