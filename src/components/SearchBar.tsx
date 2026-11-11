import React, { useId } from 'react';
import { Search, X, Sparkles, RotateCcw } from 'lucide-react';
import { useRecipes } from '../context/RecipeContext';
import { useLanguage } from '../context/LanguageContext';

interface SearchBarProps {
  /** input = the field alone (hero window); filters = chips + status; full = all of it (section head) */
  variant?: 'input' | 'filters' | 'full';
  /** Enter in the field (hero): switch to the recipes tab, which scrolls to its section */
  onSubmit?: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ variant = 'full', onSubmit }) => {
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
  const searchId = useId();

  const inputBlock = (
    <div className="flex flex-col gap-1.5">
      {/* a label you can see names the field (field-label) */}
      <label htmlFor={searchId} className="t-label muted">
        {t('search.label')}
      </label>
      <div className="app-search">
        <Search className="app-search__icon" aria-hidden="true" />
        <input
          id={searchId}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('search.placeholder')}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              if (onSubmit) onSubmit();
              else {
                // smooth in JS like the nav (App.handleTabChange): CSS scroll-behavior would move the Tab key's focus scroll too
                const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
                document.getElementById('recettes')?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
              }
            }
          }}
        />
        {searchQuery && (
          <button
            type="button"
            className="app-search__clear"
            onClick={() => setSearchQuery('')}
            aria-label={t('search.clear')}
            title={t('search.clear')}
          >
            <X aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );

  const filtersBlock = (
    <>
      {/* Ingredient quick-filter chips: they wrap, never scroll sideways (row-lines) */}
      <div className="flex flex-wrap items-center gap-2 pb-1 text-xs">
        <span className="flex items-center gap-1 font-medium whitespace-nowrap shrink-0 text-stone-600 dark:text-stone-400">
          <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{t('search.suggestedIngredients')}</span>
        </span>

        {allAvailableIngredients.map((ingredient) => {
          const isSelected = selectedIngredientFilter === ingredient;
          return (
            <button
              key={ingredient}
              type="button"
              aria-pressed={isSelected}
              onClick={() => setSelectedIngredientFilter(isSelected ? null : ingredient)}
              className={`pill whitespace-nowrap shrink-0 ${isSelected ? 'is-on' : ''}`}
            >
              {ingredient}
            </button>
          );
        })}

        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleClear}
            className="pill is-ghost whitespace-nowrap shrink-0"
          >
            <RotateCcw className="w-3 h-3" aria-hidden="true" />
            <span>{t('search.resetAll')}</span>
          </button>
        )}
      </div>

      {/* Filter status counter */}
      <div className="flex items-center gap-1.5 text-xs text-stone-600 dark:text-stone-400 px-0.5">
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
    </>
  );

  if (variant === 'input') return inputBlock;
  if (variant === 'filters') return <div className="space-y-3">{filtersBlock}</div>;

  return (
    <div className="space-y-3">
      {inputBlock}
      {filtersBlock}
    </div>
  );
};
