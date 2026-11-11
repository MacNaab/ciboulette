import React, { useState } from 'react';
import { Clock, Users, Heart, Star, ShoppingCart, Check, ChefHat, Edit3, Trash2, ExternalLink } from 'lucide-react';
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
      className="card recipe-card cursor-pointer text-left"
    >
      {/* Photograph (or the category placeholder) */}
      <div className="recipe-card__media">
        {recipe.image && !imgError ? (
          <img
            src={recipe.image}
            alt={recipe.title}
            onError={() => setImgError(true)}
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="recipe-card__placeholder">
            <ChefHat aria-hidden="true" style={{ width: 32, height: 32 }} />
            <span className="text-xs font-medium uppercase tracking-wider text-center">
              {getCategoryText(recipe.category)}
            </span>
          </div>
        )}

        {/* Favorite */}
        <button
          type="button"
          onClick={handleFavoriteClick}
          className="icon-btn icon-btn--float absolute top-3 right-3"
          title={recipe.isFavorite ? t('card.removeFromFav') : t('card.addToFav')}
          aria-label={recipe.isFavorite ? t('card.removeFromFav') : t('card.addToFav')}
        >
          <Heart className={recipe.isFavorite ? 'text-rose-700 fill-current' : ''} />
        </button>

        {/* Custom recipe badge */}
        {recipe.isCustom && (
          <span className="absolute top-3 left-3 text-[11px] font-medium px-2 py-0.5 rounded-md bg-stone-900/85 text-white backdrop-blur-xs">
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
            className="absolute bottom-3 right-3 px-2 py-1 rounded-md bg-stone-900/85 hover:bg-stone-950 text-white backdrop-blur-xs transition-colors cursor-pointer text-[10px] font-medium flex items-center gap-1"
            title={t('detail.sourceLink')}
          >
            <span>Source</span>
            <ExternalLink aria-hidden="true" style={{ width: 10, height: 10 }} />
          </a>
        )}
      </div>

      {/* Metadata */}
      <div className="flex items-center flex-wrap gap-1.5 text-xs text-stone-600 dark:text-stone-400 mb-1.5">
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

      {/* Title (a direct .card child: the kit's card title style; it wraps, never clamped) */}
      <h3 className="mb-1 transition-colors group-hover:text-emerald-700 dark:group-hover:text-emerald-400">
        {recipe.title}
      </h3>

      {/* Facts & actions (pinned to the card's foot) */}
      <div className="recipe-card__foot">
        {confirmDelete ? (
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-2 w-full"
          >
            <span className="text-xs font-medium text-rose-700 dark:text-rose-300">
              {t('card.delete')} ?
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                deleteRecipe(recipe.id);
              }}
              className="btn btn--primary btn--sm"
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
              className="btn btn--secondary btn--sm"
              title={t('card.confirmNo')}
            >
              {t('card.confirmNo')}
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 text-xs text-stone-600 dark:text-stone-400 min-w-0">
              <div className="flex items-center gap-1" title={t('detail.totalTime')}>
                <Clock aria-hidden="true" className="w-3.5 h-3.5 text-stone-400" />
                <span className="font-mono tabular-nums">{totalTime} min</span>
              </div>
              <div className="flex items-center gap-1" title={t('detail.servings')}>
                <Users aria-hidden="true" className="w-3.5 h-3.5 text-stone-400" />
                <span className="font-mono tabular-nums">{t('card.servings', { count: recipe.servings })}</span>
              </div>
              {recipe.userRating !== undefined ? (
                <div
                  className="flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400"
                  title={`${t('detail.rateThisRecipe')} ${recipe.userRating}/5`}
                >
                  <Star aria-hidden="true" className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span className="font-mono tabular-nums">{recipe.userRating}/5</span>
                </div>
              ) : (
                <div
                  className="flex items-center gap-1 text-[11px] text-stone-400 dark:text-stone-500"
                  title={t('detail.notRated')}
                >
                  <Star aria-hidden="true" className="w-3.5 h-3.5 text-stone-300 dark:text-stone-600" />
                  <span>{t('search.ratingAll').split(' ')[0]}</span>
                </div>
              )}
            </div>

            <div className="recipe-card__actions">
              <button
                type="button"
                onClick={handleShoppingClick}
                title={t('detail.addAllToCart')}
                aria-label={t('detail.addAllToCart')}
                className={`icon-btn${justAddedToShopping ? ' is-added' : ''}`}
              >
                {justAddedToShopping ? <Check /> : <ShoppingCart />}
              </button>

              {onEdit && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(recipe);
                  }}
                  title={t('card.edit')}
                  aria-label={t('card.edit')}
                  className="icon-btn"
                >
                  <Edit3 />
                </button>
              )}

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setConfirmDelete(true);
                }}
                title={t('card.delete')}
                aria-label={t('card.delete')}
                className="icon-btn"
              >
                <Trash2 />
              </button>
            </div>
          </>
        )}
      </div>
    </article>
  );
};
