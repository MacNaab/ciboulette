import React from 'react';
import { Search, X, Sparkles, RotateCcw } from 'lucide-react';
import { useRecipes } from '../context/RecipeContext';
import { useLanguage } from '../context/LanguageContext';

export const SearchBar: React.FC = () => {
  const {
    searchQuery,
    setSearchQuery,
    selectedIngredientFilter,
    setSelectedIngredientFilter,
    allAvailableIngredients,
    filteredRecipes
  } = useRecipes();

  const { t } = useLanguage();

  const handleClear = () => {
    setSearchQuery('');
    setSelectedIngredientFilter(null);
  };

  const hasActiveFilters = searchQuery.trim() !== '' || selectedIngredientFilter !== null;

  return (
    <div className="space-y-3">
      {/* Main search bar */}
      <div className="relative flex items-center">
        <div className="absolute left-3.5 text-stone-400 dark:text-stone-500 pointer-events-none">
          <Search className="w-5 h-5" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('search.placeholder')}
          className="w-full pl-11 pr-10 py-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700/30 focus:border-emerald-700 transition-all shadow-xs"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-3 p-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 rounded-md transition-colors cursor-pointer"
            title={t('search.clear')}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Ingredient Quick Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
        <span className="text-stone-400 dark:text-stone-500 flex items-center gap-1 font-medium whitespace-nowrap shrink-0">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>{t('search.suggestedIngredients')}</span>
        </span>

        {allAvailableIngredients.map((ingredient) => {
          const isSelected = selectedIngredientFilter === ingredient;
          return (
            <button
              key={ingredient}
              type="button"
              onClick={() => {
                setSelectedIngredientFilter(isSelected ? null : ingredient);
              }}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap shrink-0 border cursor-pointer ${
                isSelected
                  ? 'bg-emerald-800 text-white border-emerald-800 shadow-xs'
                  : 'bg-stone-100/80 dark:bg-stone-800/80 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-200 dark:hover:bg-stone-700'
              }`}
            >
              {ingredient}
            </button>
          );
        })}

        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleClear}
            className="px-2.5 py-1.5 rounded-lg text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 flex items-center gap-1 text-xs whitespace-nowrap shrink-0 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>{t('search.resetAll')}</span>
          </button>
        )}
      </div>

      {/* Filter status counter */}
      <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 px-0.5">
        <div className="flex items-center gap-1.5">
          <span>
            {filteredRecipes.length} {filteredRecipes.length > 1 ? t('nav.recipes').toLowerCase() : t('nav.recipes').toLowerCase().replace(/s$/, '')}
          </span>
          {hasActiveFilters && (
            <>
              <span aria-hidden="true">·</span>
              <span className="text-emerald-700 dark:text-emerald-400 font-medium">
                {t('search.activeFilter')} {selectedIngredientFilter || searchQuery}
              </span>
            </>
          )}
        </div>
        <span className="text-stone-400 text-[11px] hidden sm:inline">
          {t('app.privacy')}
        </span>
      </div>
    </div>
  );
};
