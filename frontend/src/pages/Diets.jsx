import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Utensils,
  Flame,
  Beef,
  Wheat,
  Droplet,
  Clock3,
  Sparkles,
} from 'lucide-react';
import API from '../api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import toast from 'react-hot-toast';
import './Diets.css';

const FILTERS = [
  { key: 'all', label: 'All Plans' },
  { key: 'fat_loss', label: 'Fat Loss' },
  { key: 'muscle_gain', label: 'Muscle Gain' },
  { key: 'maintenance', label: 'Maintenance' },
  { key: 'recomposition', label: 'Recomposition' },
  { key: 'performance', label: 'Performance' },
];

const normalizeGoal = (goal = '') =>
  String(goal).trim().toLowerCase().replace(/\s+/g, '_').replace(/\//g, '_');

const GOAL_LABELS = {
  weight_loss: 'Weight Loss',
  fat_loss: 'Fat Loss',
  weight_gain: 'Weight Gain / Muscle',
  muscle_gain: 'Muscle Gain',
  maintenance: 'Maintenance',
  recomposition: 'Recomposition',
  performance: 'Performance',
};

const DIET_IMAGE_MAP = [
  { match: ['lean fat loss', 'balanced weight loss', 'aggressive cut'], url: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=1000&q=82' },
  { match: ['lean muscle builder', 'mass gain pro', 'strength nutrition'], url: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=1000&q=82' },
  { match: ['balanced maintenance', 'active lifestyle', 'high protein balanced'], url: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1000&q=82' },
  { match: ['body recomposition'], url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1000&q=82' },
  { match: ['performance fuel', 'endurance fuel'], url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=1000&q=82' },
];

const GOAL_IMAGE_MAP = {
  fat_loss: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=1000&q=82',
  weight_loss: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=1000&q=82',
  muscle_gain: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=1000&q=82',
  weight_gain: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=1000&q=82',
  maintenance: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1000&q=82',
  recomposition: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1000&q=82',
  performance: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=1000&q=82',
};

const FALLBACK_DIET_IMAGE = 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1000&q=82';

const getDietImage = (diet) => {
  const name = String(diet?.name || '').toLowerCase();
  const matched = DIET_IMAGE_MAP.find((item) =>
    item.match.some((keyword) => name.includes(keyword))
  );
  if (matched) return matched.url;
  return GOAL_IMAGE_MAP[normalizeGoal(diet?.goal)] || FALLBACK_DIET_IMAGE;
};

function Diets({ setIsAuthenticated }) {
  const [diets, setDiets] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDiets = async () => {
      try {
        const response = await API.get('diets/');

        const data = Array.isArray(response.data)
          ? response.data
          : response.data?.results || [];

        setDiets(data);
      } catch (error) {
        console.error(error);
        toast.error('Failed to load diet plans');
      } finally {
        setLoading(false);
      }
    };

    fetchDiets();
  }, []);

  const filteredDiets = useMemo(() => {
    if (filter === 'all') {
      return diets;
    }

    return diets.filter((diet) => normalizeGoal(diet.goal) === filter);
  }, [diets, filter]);

  return (
    <div className="diets-page">
      <Navbar setIsAuthenticated={setIsAuthenticated} />

      <main className="diets-container">
        <section className="diets-header">
          <div>
            <p className="diets-eyebrow">
              Nutrition Plans
            </p>

            <h1 className="diets-title">
              Diet Plans
            </h1>

            <p className="diets-subtitle">
              Science-backed plans for weight loss,
              muscle gain and maintenance.
            </p>
          </div>

          <div className="diets-header-badge">
            <Sparkles size={16} />
            Smart Nutrition
          </div>
        </section>

        <section className="diets-hero">
          <img
            src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1400&q=80"
            alt="Healthy nutritious meals"
          />

          <div className="diets-hero-overlay" />

          <div className="diets-hero-content">
            <span>Fuel your performance</span>

            <strong>
              Better nutrition. Better progress.
            </strong>

            <p>
              Choose a plan that matches your current
              fitness goal and daily calorie target.
            </p>
          </div>
        </section>

        <section className="diets-toolbar">
          <div className="diets-filter-group">
            {FILTERS.map((item) => {
              const active = filter === item.key;

              return (
                <button
                  key={item.key}
                  type="button"
                  className={`diets-filter-btn ${
                    active
                      ? 'diets-filter-btn-active'
                      : ''
                  }`}
                  onClick={() => setFilter(item.key)}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="diets-result-count">
            <Utensils size={15} />

            <span>
              {filteredDiets.length}{' '}
              {filteredDiets.length === 1
                ? 'plan'
                : 'plans'}
            </span>
          </div>
        </section>

        {loading ? (
          <div className="diets-loading">
            <div className="diets-loader" />
            <p>Loading nutrition plans...</p>
          </div>
        ) : filteredDiets.length === 0 ? (
          <div className="diets-empty">
            <div className="diets-empty-icon">
              <Utensils size={27} />
            </div>

            <h3>No diet plans found</h3>

            <p>
              Try another goal filter or check back
              once new plans are available.
            </p>
          </div>
        ) : (
          <section className="diets-grid">
            {filteredDiets.map((diet, index) => (
              <motion.article
                key={diet.id}
                className="diet-card"
                initial={{
                  opacity: 0,
                  y: 18,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: Math.min(
                    index * 0.07,
                    0.35
                  ),
                }}
                whileHover={{
                  y: -4,
                }}
              >
                <div className="diet-card-image">
                  <img
                    src={getDietImage(diet)}
                    alt={`${diet.name} diet plan`}
                    loading="lazy"
                    onError={(event) => {
                      event.currentTarget.src = FALLBACK_DIET_IMAGE;
                    }}
                  />

                  <div className="diet-card-image-overlay" />

                  <span
                    className={`diet-goal diet-goal-${normalizeGoal(diet.goal)}`}
                  >
                    {GOAL_LABELS[normalizeGoal(diet.goal)] || diet.goal || 'Nutrition Plan'}
                  </span>

                  <div className="diet-card-icon">
                    <Utensils size={17} />
                  </div>

                  <div className="diet-card-image-title">
                    <span>Nutrition plan</span>
                    <strong>{diet.name}</strong>
                  </div>
                </div>

                <div className="diet-card-content">
                  <p className="diet-description">
                    {diet.description}
                  </p>
                </div>

                <div className="diet-macros">
                  <MacroItem
                    icon={Flame}
                    label="Calories"
                    value={diet.daily_calories}
                    tone="calories"
                  />

                  <MacroItem
                    icon={Beef}
                    label="Protein"
                    value={`${diet.protein_g}g`}
                    tone="protein"
                  />

                  <MacroItem
                    icon={Wheat}
                    label="Carbs"
                    value={`${diet.carbs_g}g`}
                    tone="carbs"
                  />

                  <MacroItem
                    icon={Droplet}
                    label="Fat"
                    value={`${diet.fat_g}g`}
                    tone="fat"
                  />
                </div>

                <div className="diet-card-footer">
                  <div>
                    <Clock3 size={14} />
                    <span>
                      {diet.duration_weeks} weeks
                    </span>
                  </div>

                  <span className="diet-plan-type">
                    {GOAL_LABELS[normalizeGoal(diet.goal)] || diet.goal || 'Custom'}
                  </span>
                </div>
              </motion.article>
            ))}
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}

function MacroItem({
  icon: Icon,
  label,
  value,
  tone,
}) {
  return (
    <div className={`diet-macro diet-macro-${tone}`}>
      <div className="diet-macro-icon">
        <Icon size={16} />
      </div>

      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

export default Diets;
