import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Clock,
  Flame,
  Search,
  Heart,
  Leaf,
  X,
  ChefHat,
  Utensils,
  Sparkles,
  Beef,
} from 'lucide-react';

import API from '../api';
import Navbar from '../components/Navbar';
import BottomNav from '../components/BottomNav';
import toast from 'react-hot-toast';
import './Recipes.css';

const categories = [
  'all',
  'breakfast',
  'lunch',
  'dinner',
  'snack',
  'smoothie',
];

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=900&q=80';

function Recipes({ setIsAuthenticated }) {
  const [recipes, setRecipes] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [showFavorites, setShowFavorites] = useState(false);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [favoriteLoading, setFavoriteLoading] = useState(null);

  const fetchRecipes = async () => {
    try {
      setLoading(true);

      const res = await API.get('recipes/');
      const data = Array.isArray(res.data)
        ? res.data
        : res.data?.results || [];

      setRecipes(data);

      if (selected) {
        const refreshed = data.find(
          (recipe) => recipe.id === selected.id
        );

        if (refreshed) {
          setSelected(refreshed);
        }
      }
    } catch (error) {
      console.error('Failed to load recipes:', error);
      toast.error(
        error?.response?.data?.detail || 'Failed to load recipes'
      );
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  useEffect(() => {
    if (!selected) return undefined;

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setSelected(null);
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [selected]);

  const filtered = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return recipes.filter((recipe) => {
      const recipeName = recipe.name?.toLowerCase() || '';
      const recipeDescription =
        recipe.description?.toLowerCase() || '';
      const recipeIngredients =
        recipe.ingredients?.toLowerCase() || '';
      const recipeCategory =
        recipe.category?.trim().toLowerCase() || '';

      const matchSearch =
        !normalizedSearch ||
        recipeName.includes(normalizedSearch) ||
        recipeDescription.includes(normalizedSearch) ||
        recipeIngredients.includes(normalizedSearch);

      const matchCategory =
        category === 'all' || recipeCategory === category;

      const matchFavorite =
        !showFavorites || Boolean(recipe.is_favorited);

      return matchSearch && matchCategory && matchFavorite;
    });
  }, [recipes, search, category, showFavorites]);

  const favoriteCount = useMemo(
    () =>
      recipes.filter((recipe) => Boolean(recipe.is_favorited))
        .length,
    [recipes]
  );

  const toggleFavorite = async (event, recipe) => {
    event.stopPropagation();

    try {
      setFavoriteLoading(recipe.id);

      const res = await API.post(
        `recipes/${recipe.id}/favorite/`
      );

      toast.success(
        res.data?.detail || 'Favorites updated'
      );

      await fetchRecipes();
    } catch (error) {
      console.error('Failed to update favorite:', error);
      toast.error(
        error?.response?.data?.detail ||
          'Please login to favorite recipes'
      );
    } finally {
      setFavoriteLoading(null);
    }
  };

  const resetFilters = () => {
    setSearch('');
    setCategory('all');
    setShowFavorites(false);
  };

  const handleImageError = (event) => {
    if (event.currentTarget.src === FALLBACK_IMAGE) {
      return;
    }

    event.currentTarget.src = FALLBACK_IMAGE;
  };

  return (
    <div className="recipes-page">
      <Navbar setIsAuthenticated={setIsAuthenticated} />

      <main className="recipes-container">
        <section className="recipes-header">
          <div>
            <p className="recipes-eyebrow">
              Nutrition Kitchen
            </p>

            <h1 className="recipes-title">
              Healthy Recipes
            </h1>

            <p className="recipes-subtitle">
              Performance-focused meals designed to make
              eating well easier, tastier and more
              consistent.
            </p>
          </div>

          <div className="recipes-header-badge">
            <ChefHat size={16} />
            {recipes.length} recipes
          </div>
        </section>

        <section className="recipes-hero">
          <img
            src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1400&q=80"
            alt="Healthy balanced meal"
          />

          <div className="recipes-hero-overlay" />

          <div className="recipes-hero-content">
            <span>
              <Sparkles size={13} />
              FUEL WITH PURPOSE
            </span>

            <h2>
              Better training starts in the kitchen.
            </h2>

            <p>
              Discover balanced recipes for energy,
              recovery and sustainable performance.
            </p>
          </div>
        </section>

        <section className="recipes-toolbar">
          <div className="recipes-search">
            <Search size={17} />

            <input
              type="search"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search recipes or ingredients..."
              aria-label="Search recipes"
            />
          </div>

          <div className="recipes-filter-row">
            <div className="recipes-categories">
              {categories.map((item) => (
                <button
                  type="button"
                  key={item}
                  className={
                    category === item
                      ? 'recipes-filter active'
                      : 'recipes-filter'
                  }
                  onClick={() => setCategory(item)}
                >
                  {item.charAt(0).toUpperCase() +
                    item.slice(1)}
                </button>
              ))}
            </div>

            <button
              type="button"
              className={
                showFavorites
                  ? 'recipes-favorite-filter active'
                  : 'recipes-favorite-filter'
              }
              onClick={() =>
                setShowFavorites(
                  (current) => !current
                )
              }
            >
              <Heart
                size={15}
                fill={
                  showFavorites
                    ? 'currentColor'
                    : 'none'
                }
              />

              Favorites

              {favoriteCount > 0 && (
                <span>{favoriteCount}</span>
              )}
            </button>
          </div>
        </section>

        <div className="recipes-results-bar">
          <p>
            Showing <strong>{filtered.length}</strong>{' '}
            of {recipes.length} recipes
          </p>

          {(search ||
            category !== 'all' ||
            showFavorites) && (
            <button
              type="button"
              onClick={resetFilters}
            >
              Clear filters
            </button>
          )}
        </div>

        {loading ? (
          <div className="recipes-loading">
            <div className="recipes-loader" />
            <p>Preparing your recipe library...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="recipes-empty">
            <BookOpen size={31} />

            <h3>No recipes found</h3>

            <p>
              Try another search, category, or clear your
              current filters.
            </p>

            <button
              type="button"
              className="recipes-reset-btn"
              onClick={resetFilters}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <section className="recipes-grid">
            {filtered.map((recipe, index) => (
              <motion.article
                key={recipe.id}
                className="recipe-card"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: Math.min(
                    index * 0.045,
                    0.35
                  ),
                }}
                onClick={() => setSelected(recipe)}
              >
                <div className="recipe-card-image">
                  <img
                    src={
                      recipe.image_url ||
                      FALLBACK_IMAGE
                    }
                    alt={recipe.name}
                    loading="lazy"
                    onError={handleImageError}
                  />

                  <div className="recipe-card-image-overlay" />

                  <span className="recipe-category">
                    {recipe.category || 'Recipe'}
                  </span>

                  <button
                    type="button"
                    className={
                      recipe.is_favorited
                        ? 'recipe-heart active'
                        : 'recipe-heart'
                    }
                    onClick={(event) =>
                      toggleFavorite(event, recipe)
                    }
                    disabled={
                      favoriteLoading === recipe.id
                    }
                    aria-label={
                      recipe.is_favorited
                        ? 'Remove from favorites'
                        : 'Add to favorites'
                    }
                  >
                    <Heart
                      size={17}
                      fill={
                        recipe.is_favorited
                          ? 'currentColor'
                          : 'none'
                      }
                    />
                  </button>
                </div>

                <div className="recipe-card-body">
                  <div className="recipe-card-icon">
                    <Utensils size={20} />
                  </div>

                  <h3>{recipe.name}</h3>

                  <p className="recipe-description">
                    {recipe.description ||
                      'A balanced recipe built to support your nutrition goals.'}
                  </p>

                  <div className="recipe-meta">
                    <span>
                      <Flame size={14} />
                      <strong>
                        {recipe.calories || 0}
                      </strong>{' '}
                      kcal
                    </span>

                    <span>
                      <Clock size={14} />
                      <strong>
                        {recipe.prep_time_min || 0}
                      </strong>{' '}
                      min
                    </span>
                  </div>

                  <div className="recipe-card-footer">
                    {recipe.is_vegan ? (
                      <span className="recipe-diet-tag vegetarian">
                        <Leaf size={12} />
                        Vegan
                      </span>
                    ) : recipe.is_vegetarian ? (
                      <span className="recipe-diet-tag vegetarian">
                        <Leaf size={12} />
                        Vegetarian
                      </span>
                    ) : (
                      <span className="recipe-diet-tag protein">
                        <Beef size={12} />
                        Protein meal
                      </span>
                    )}

                    <span className="recipe-view">
                      View recipe
                      <BookOpen size={13} />
                    </span>
                  </div>
                </div>
              </motion.article>
            ))}
          </section>
        )}
      </main>

      <AnimatePresence>
        {selected && (
          <motion.div
            className="recipe-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
          >
            <motion.div
              className="recipe-modal"
              initial={{
                opacity: 0,
                scale: 0.96,
                y: 15,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.97,
                y: 10,
              }}
              transition={{ duration: 0.2 }}
              onClick={(event) =>
                event.stopPropagation()
              }
            >
              <button
                type="button"
                className="recipe-modal-close"
                onClick={() =>
                  setSelected(null)
                }
                aria-label="Close recipe"
              >
                <X size={18} />
              </button>

              <div className="recipe-modal-image">
                <img
                  src={
                    selected.image_url ||
                    FALLBACK_IMAGE
                  }
                  alt={selected.name}
                  onError={handleImageError}
                />
              </div>

              <div className="recipe-modal-heading">
                <span className="recipe-category">
                  {selected.category || 'Recipe'}
                </span>

                <h2>{selected.name}</h2>

                <p>
                  {selected.description ||
                    'A balanced meal for your performance-focused nutrition plan.'}
                </p>
              </div>

              <div className="recipe-modal-stats">
                <div>
                  <Flame size={17} />
                  <span>Calories</span>
                  <strong>
                    {selected.calories || 0} kcal
                  </strong>
                </div>

                <div>
                  <Beef size={17} />
                  <span>Protein</span>
                  <strong>
                    {selected.protein_g || 0}g
                  </strong>
                </div>

                <div>
                  <Clock size={17} />
                  <span>Prep time</span>
                  <strong>
                    {selected.prep_time_min || 0}{' '}
                    min
                  </strong>
                </div>
              </div>

              <div className="recipe-modal-section">
                <div className="recipe-modal-section-title">
                  <span>01</span>
                  <h3>Ingredients</h3>
                </div>

                {selected.ingredients ? (
                  <ul className="recipe-ingredients">
                    {selected.ingredients
                      .split(/\n|,/)
                      .map((ingredient) =>
                        ingredient.trim()
                      )
                      .filter(Boolean)
                      .map(
                        (
                          ingredient,
                          index
                        ) => (
                          <li
                            key={`${ingredient}-${index}`}
                          >
                            {ingredient}
                          </li>
                        )
                      )}
                  </ul>
                ) : (
                  <p className="recipe-modal-muted">
                    No ingredients provided.
                  </p>
                )}
              </div>

              <div className="recipe-modal-section">
                <div className="recipe-modal-section-title">
                  <span>02</span>
                  <h3>Instructions</h3>
                </div>

                <p className="recipe-instructions">
                  {selected.instructions ||
                    'No preparation instructions provided.'}
                </p>
              </div>

              <button
                type="button"
                className="recipe-modal-done"
                onClick={() =>
                  setSelected(null)
                }
              >
                Done
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
}

export default Recipes;
