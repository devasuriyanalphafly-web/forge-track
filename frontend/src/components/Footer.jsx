import { useNavigate } from 'react-router-dom';
import {
  Dumbbell,
  Heart,
  ArrowUpRight,
} from 'lucide-react';

import './Footer.css';

function Footer() {
  const navigate = useNavigate();
  const year = new Date().getFullYear();

  const links = [
    { label: 'Dashboard', path: '/' },
    { label: 'Exercises', path: '/exercises' },
    { label: 'Weight', path: '/weight' },
    { label: 'Diets', path: '/diets' },
    { label: 'Recipes', path: '/recipes' },
  ];

  return (
    <footer className="footer">
      <div className="footer-glow footer-glow-one" />
      <div className="footer-glow footer-glow-two" />

      <div className="footer-container">
        <div className="footer-top">
          {/* Brand Section */}
          <div className="footer-brand-block">
            <button
              type="button"
              className="footer-brand"
              onClick={() => navigate('/')}
              aria-label="Go to ForgeTrack dashboard"
            >
              <span className="footer-logo">
                <Dumbbell
                  size={20}
                  strokeWidth={2.5}
                />
              </span>

              <span className="footer-brand-text">
                <strong>
                  Forge<span>Track</span>
                </strong>

                <small>PERFORMANCE OS</small>
              </span>
            </button>

            <p className="footer-description">
              Track workouts, measure progress,
              improve nutrition, and build a stronger
              version of yourself with purpose and
              consistency.
            </p>

            <div className="footer-status">
              <span className="footer-status-dot" />

              <span>
                Built for consistent training and
                measurable progress
              </span>
            </div>
          </div>

          {/* Navigation */}
          <div className="footer-navigation">
            <div className="footer-nav-column">
              <span className="footer-column-title">
                Explore
              </span>

              <div className="footer-links">
                {links.map((item) => (
                  <button
                    key={item.path}
                    type="button"
                    onClick={() =>
                      navigate(item.path)
                    }
                  >
                    <span>{item.label}</span>

                    <ArrowUpRight size={13} />
                  </button>
                ))}
              </div>
            </div>

            {/* Mindset */}
            <div className="footer-manifesto">
              <span className="footer-column-title">
                ForgeTrack Mindset
              </span>

              <blockquote>
                Train with intent. Track what matters.
                Improve what you can measure.
              </blockquote>

              <div className="footer-made-for">
                <Heart
                  size={14}
                  fill="currentColor"
                />

                <span>
                  Built for serious lifters
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-divider" />

        {/* Bottom */}
        <div className="footer-bottom">
          <p>
            © {year} ForgeTrack. All rights reserved.
          </p>

          <div className="footer-bottom-meta">
            <span>Train smarter</span>

            <span className="footer-dot" />

            <span>Stay consistent</span>

            <span className="footer-dot" />

            <span>Progress relentlessly</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;