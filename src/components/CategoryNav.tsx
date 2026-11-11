import React from 'react';
import { RecipeCategory, SortOption } from '../types/recipe';
import { useRecipes } from '../context/RecipeContext';
import { useLanguage } from '../context/LanguageContext';

export const CategoryNav: React.FC = () => {
  const {
    activeCategory,
    setActiveCategory,
    sortBy,
    setSortBy,
    minRating,
    setMinRating,
    onlyFavorites,
    setOnlyFavorites
  } = useRecipes();

  const { t, getCategoryText } = useLanguage();

  const categoryKeys: (RecipeCategory | 'all')[] = [
    'all',
    'plats',
    'entrees',
    'desserts',
    'vegetarien',
    'rapide',
    'aperitifs'
  ];

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 py-1 w-full max-w-full">
      {/* Categories: one row of dealt pills; they wrap rather than scroll (row-lines) */}
      <div className="flex flex-wrap items-center gap-1.5 py-1 min-w-0 flex-1 max-w-full">
        {categoryKeys.map((catKey) => {
          const isActive = activeCategory === catKey && !onlyFavorites;
          return (
            <button
              key={catKey}
              type="button"
              aria-pressed={isActive}
              onClick={() => {
                setActiveCategory(catKey);
                if (onlyFavorites) setOnlyFavorites(false);
              }}
              className={`pill whitespace-nowrap shrink-0 ${isActive ? 'is-on' : ''}`}
            >
              {getCategoryText(catKey)}
            </button>
          );
        })}
      </div>

      {/* Secondary controls: sort & minimum rating, each under a label you can see (field-label) */}
      <div className="flex items-end flex-wrap sm:flex-nowrap gap-2 self-start lg:self-auto shrink-0 w-full sm:w-auto max-w-full">
        <label className="flex flex-col gap-1 min-w-0 flex-1 sm:flex-initial">
          <span className="t-label muted">{t('search.ratingFilter')}</span>
          <select
            value={minRating}
            onChange={(e) => setMinRating(Number(e.target.value))}
            className="app-select min-w-0 max-w-full"
          >
            <option value={0}>{t('search.ratingAll')}</option>
            <option value={3}>{t('search.ratingStars', { stars: 3 })}</option>
            <option value={4}>{t('search.ratingStars', { stars: 4 })}</option>
            <option value={5}>{t('search.ratingStars', { stars: 5 })}</option>
          </select>
        </label>

        <label className="flex flex-col gap-1 min-w-0 flex-1 sm:flex-initial">
          <span className="t-label muted">{t('sort.label')}</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="app-select min-w-0 max-w-full"
          >
            <option value="rating">{t('sort.rating')}</option>
            <option value="prepTime">{t('sort.prepTime')}</option>
            <option value="title">{t('sort.title')}</option>
            <option value="recent">{t('sort.recent')}</option>
          </select>
        </label>
      </div>
    </div>
  );
};
