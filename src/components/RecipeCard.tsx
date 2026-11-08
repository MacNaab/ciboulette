import React, { useState } from 'react';
import { Clock, Users, Heart, Star, ShoppingCart, Check, ChefHat, Edit3, Trash2, ExternalLink, ChevronDown } from 'lucide-react';
import { Recipe } from '../types/recipe';
import { useRecipes } from '../context/RecipeContext';
import { useLanguage } from '../context/LanguageContext';

interface RecipeCardProps {
  recipe: Recipe;
  onSelect: (recipe: Recipe) => void;
  onEdit?: (recipe: Recipe) => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onSelect, onEdit }) => {
  const { toggleFavorite, addIngredientsToShoppingList, deleteRecipe } = useRecipes();
  const { t, getCategoryText, getDifficultyText } = useLanguage();
  const [justAddedToShopping, setJustAddedToShopping] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  const totalTime = recipe.prepTime + recipe.cookTime;

  const handleShoppingClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    addIngredientsToShoppingList(recipe);
    setJustAddedToShopping(true);
    setTimeout(() => setJustAddedToShopping(false), 2000);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(recipe.id);
  };

  return (
    <article
      onClick={() => onSelect(recipe)}
      className="group flex flex-col bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/80 dark:border-stone-800/80 overflow-hidden hover:border-stone-300 dark:hover:border-stone-700 hover:shadow-md transition-all duration-200 cursor-pointer text-left"
    >
      {/* Visual Image Slot */}
      <div className="relative aspect-4/3 w-full bg-stone-100 dark:bg-stone-800 overflow-hidden">
        {recipe.image && !imgError ? (
          <img
            src={recipe.image}
            alt={recipe.title}
            onError={() => setImgError(true)}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-104"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-br from-amber-50 to-stone-200 dark:from-stone-800 dark:to-stone-900 text-stone-600 dark:text-stone-300">
            <div className="w-12 h-12 rounded-xl bg-amber-100/80 dark:bg-stone-700 flex items-center justify-center mb-2 shadow-xs">
              <ChefHat className="w-6 h-6 text-emerald-800 dark:text-emerald-400" />
            </div>
            <span className="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider text-center">
              {getCategoryText(recipe.category)}
            </span>
          </div>
        )}

        {/* Favorite Button */}
        <button
          type="button"
          onClick={handleFavoriteClick}
          className="absolute top-3 right-3 p-2 rounded-full bg-white/90 dark:bg-stone-900/90 backdrop-blur-xs text-stone-600 dark:text-stone-300 hover:text-rose-600 dark:hover:text-rose-400 shadow-xs transition-transform hover:scale-110 focus-visible:outline-none cursor-pointer"
          title={recipe.isFavorite ? t('card.removeFromFav') : t('card.addToFav')}
          aria-label={recipe.isFavorite ? t('card.removeFromFav') : t('card.addToFav')}
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              recipe.isFavorite ? 'fill-rose-500 text-rose-500' : ''
            }`}
          />
        </button>

        {/* Custom recipe tag in unobtrusive corner */}
        {recipe.isCustom && (
          <span className="absolute top-3 left-3 text-[11px] font-medium px-2 py-0.5 rounded-md bg-stone-900/80 text-white backdrop-blur-xs">
            {t('card.customBadge')}
          </span>
        )}

        {/* Source link badge if available */}
        {recipe.sourceUrl && (
          <a
            href={recipe.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="absolute bottom-3 right-3 px-2 py-1 rounded-md bg-stone-900/80 hover:bg-stone-950 text-white backdrop-blur-xs transition-colors cursor-pointer text-[10px] font-medium flex items-center gap-1 shadow-xs"
            title={t('detail.sourceLink')}
          >
            <span>Source</span>
            <ExternalLink className="w-2.5 h-2.5 text-stone-300" />
          </a>
        )}
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between gap-3">
        <div>
          {/* Metadata Line */}
          <div className="flex items-center flex-wrap gap-1.5 text-xs text-stone-500 dark:text-stone-400 mb-1.5">
            <span className="capitalize">{getCategoryText(recipe.category)}</span>
            <span aria-hidden="true">·</span>
            <span>{getDifficultyText(recipe.difficulty)}</span>
            {recipe.macros?.proteins !== undefined ? (
              <>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums text-emerald-700 dark:text-emerald-400 font-semibold">
                  {recipe.macros.proteins}g {t('detail.proteins').toLowerCase().slice(0, 4)}.
                </span>
              </>
            ) : (
              <>
                <span aria-hidden="true">·</span>
                <span>{recipe.ingredients.length} ingr.</span>
              </>
            )}
            {(recipe.macros?.calories || recipe.calories) && (
              <>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums">
                  {recipe.macros?.calories ?? recipe.calories} kcal
                </span>
              </>
            )}
          </div>

          {/* Recipe Title */}
          <h3 className="font-serif-display text-lg font-bold text-stone-900 dark:text-stone-100 group-hover:text-emerald-800 dark:group-hover:text-emerald-400 transition-colors line-clamp-1">
            {recipe.title}
          </h3>

          {/* Recipe Description with expand toggle when overflowing */}
          {recipe.description && (
            <div className="mt-1">
              <p
                className={`text-xs text-stone-600 dark:text-stone-300 leading-relaxed transition-all ${
                  isDescriptionExpanded ? 'line-clamp-none' : 'line-clamp-2'
                }`}
              >
                {recipe.description}
              </p>
              {recipe.description.length > 70 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsDescriptionExpanded(!isDescriptionExpanded);
                  }}
                  className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-medium text-emerald-800 dark:text-emerald-400 hover:text-emerald-950 dark:hover:text-emerald-300 hover:underline cursor-pointer focus:outline-none"
                  aria-expanded={isDescriptionExpanded}
                >
                  <span>{isDescriptionExpanded ? t('card.readLess') : t('card.readMore')}</span>
                  <ChevronDown
                    className={`w-3 h-3 transition-transform duration-200 ${
                      isDescriptionExpanded ? 'rotate-180' : ''
                    }`}
                  />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer Metrics & Actions */}
        <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs text-stone-600 dark:text-stone-400">
          {/* Prep time & portions */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1" title={t('detail.totalTime')}>
              <Clock className="w-3.5 h-3.5 text-stone-400" />
              <span className="font-mono tabular-nums">{totalTime} min</span>
            </div>
            <div className="flex items-center gap-1" title={t('detail.servings')}>
              <Users className="w-3.5 h-3.5 text-stone-400" />
              <span className="font-mono tabular-nums">{t('card.servings', { count: recipe.servings })}</span>
            </div>
          </div>

          {/* User's personal rating */}
          <div className="flex items-center gap-1.5">
            {recipe.userRating !== undefined ? (
              <div
                className="flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400"
                title={`${t('detail.rateThisRecipe')} ${recipe.userRating}/5`}
              >
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span className="font-mono tabular-nums">{recipe.userRating}/5</span>
              </div>
            ) : (
              <div
                className="flex items-center gap-1 text-[11px] text-stone-400 dark:text-stone-500"
                title={t('detail.notRated')}
              >
                <Star className="w-3.5 h-3.5 text-stone-300 dark:text-stone-600" />
                <span>{t('search.ratingAll').split(' ')[0]}</span>
              </div>
            )}
          </div>

          {/* Quick Actions (Courses, Modifier, Supprimer) */}
          <div className="flex items-center gap-1.5">
            {confirmDelete ? (
              <div
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1 bg-rose-50 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-800 rounded-lg px-2 py-0.5 animate-in fade-in zoom-in-95"
              >
                <span className="text-[11px] text-rose-700 dark:text-rose-300 font-medium mr-1">
                  {t('card.delete')} ?
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteRecipe(recipe.id);
                  }}
                  className="px-1.5 py-0.5 rounded bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold cursor-pointer"
                  title={t('card.confirmYes')}
                >
                  {t('card.confirmYes').split(',')[0]}
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setConfirmDelete(false);
                  }}
                  className="px-1.5 py-0.5 rounded bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300 text-[10px] cursor-pointer"
                  title={t('card.confirmNo')}
                >
                  {t('card.confirmNo')}
                </button>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleShoppingClick}
                  title={t('detail.addAllToCart')}
                  className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                    justAddedToShopping
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
                      : 'bg-stone-50 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-700 hover:text-emerald-700 dark:hover:text-emerald-400'
                  }`}
                >
                  {justAddedToShopping ? (
                    <Check className="w-3.5 h-3.5 text-emerald-700" />
                  ) : (
                    <ShoppingCart className="w-3.5 h-3.5" />
                  )}
                </button>

                {onEdit && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(recipe);
                    }}
                    title={t('card.edit')}
                    className="p-1.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-500 hover:text-emerald-700 dark:hover:text-emerald-400 hover:border-emerald-300 dark:hover:border-emerald-800 transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setConfirmDelete(true);
                  }}
                  title={t('card.delete')}
                  className="p-1.5 rounded-lg border border-transparent hover:border-rose-200 dark:hover:border-rose-900 bg-stone-50 dark:bg-stone-800 text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};
