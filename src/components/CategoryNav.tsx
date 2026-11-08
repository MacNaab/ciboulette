import React from 'react';
import { RecipeCategory, SortOption } from '../types/recipe';
import { useRecipes } from '../context/RecipeContext';
import { useLanguage } from '../context/LanguageContext';
import { SlidersHorizontal, Star } from 'lucide-react';

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
      {/* Categories segmented scrollable bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 min-w-0 flex-1 max-w-full">
        {categoryKeys.map((catKey) => {
          const isActive = activeCategory === catKey && !onlyFavorites;
          return (
            <button
              key={catKey}
              onClick={() => {
                setActiveCategory(catKey);
                if (onlyFavorites) setOnlyFavorites(false);
              }}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 shadow-xs'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-200/70 dark:hover:bg-stone-700/70'
              }`}
            >
              {getCategoryText(catKey)}
            </button>
          );
        })}
      </div>

      {/* Secondary Controls: Sorting & Minimum Rating */}
      <div className="flex items-center flex-wrap sm:flex-nowrap gap-2 self-start lg:self-auto shrink-0 text-xs w-full sm:w-auto max-w-full">
        {/* Min Rating Filter */}
        <div className="flex items-center gap-1.5 bg-stone-100 dark:bg-stone-800 px-2.5 py-1.5 rounded-xl border border-stone-200/60 dark:border-stone-700/60 min-w-0 max-w-full flex-1 sm:flex-initial shadow-2xs">
          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
          <select
            value={minRating}
            onChange={(e) => setMinRating(Number(e.target.value))}
            className="bg-transparent text-stone-700 dark:text-stone-300 font-medium focus:outline-none cursor-pointer truncate text-xs w-full sm:w-auto"
            aria-label={t('search.ratingFilter')}
          >
            <option value={0}>{t('search.ratingAll')}</option>
            <option value={3}>⭐ {t('search.ratingStars', { stars: 3 })}</option>
            <option value={4}>⭐ {t('search.ratingStars', { stars: 4 })}</option>
            <option value={5}>⭐ 5★ Coup de cœur</option>
          </select>
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-1.5 bg-stone-100 dark:bg-stone-800 px-2.5 py-1.5 rounded-xl border border-stone-200/60 dark:border-stone-700/60 min-w-0 max-w-full flex-1 sm:flex-initial shadow-2xs">
          <SlidersHorizontal className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400 shrink-0" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="bg-transparent text-stone-700 dark:text-stone-300 font-medium focus:outline-none cursor-pointer truncate text-xs w-full sm:w-auto"
            aria-label={t('sort.label')}
          >
            <option value="rating">{t('sort.rating')}</option>
            <option value="prepTime">{t('sort.prepTime')}</option>
            <option value="title">{t('sort.title')}</option>
            <option value="recent">{t('sort.recent')}</option>
          </select>
        </div>
      </div>
    </div>
  );
};
