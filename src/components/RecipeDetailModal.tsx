import React, { useState, useEffect } from 'react';
import {
  X,
  Heart,
  Star,
  Clock,
  Flame,
  ChefHat,
  ShoppingCart,
  Check,
  Plus,
  Minus,
  Trash2,
  Edit3,
  Timer,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { Recipe } from '../types/recipe';
import { useRecipes } from '../context/RecipeContext';
import { useLanguage } from '../context/LanguageContext';
import { StarRating } from './StarRating';

interface RecipeDetailModalProps {
  recipe: Recipe | null;
  onClose: () => void;
  onEdit?: (recipe: Recipe) => void;
}

export const RecipeDetailModal: React.FC<RecipeDetailModalProps> = ({
  recipe,
  onClose,
  onEdit,
}) => {
  const {
    toggleFavorite,
    rateRecipe,
    deleteRecipe,
    addIngredientsToShoppingList,
    shoppingList
  } = useRecipes();

  const { t, language, currentLanguageOption, getCategoryText, getDifficultyText } = useLanguage();

  // Dynamic servings multiplier
  const [servings, setServings] = useState<number>(recipe?.servings || 4);
  const [justAddedAll, setJustAddedAll] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [ratedToast, setRatedToast] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Embedded kitchen cooking timer
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [timerRunning, setTimerRunning] = useState<boolean>(false);

  useEffect(() => {
    if (recipe) {
      setServings(recipe.servings);
      setCompletedSteps([]);
      setTimerRunning(false);
      setTimerSeconds(recipe.cookTime > 0 ? recipe.cookTime * 60 : 15 * 60);
      setConfirmDelete(false);
      setImgError(false);
    }
  }, [recipe]);

  // Timer interval
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            setTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerRunning, timerSeconds]);

  if (!recipe) return null;

  const servingsMultiplier = servings / recipe.servings;

  const handleRate = (stars: number) => {
    const newRating = recipe.userRating === stars ? 0 : stars;
    rateRecipe(recipe.id, newRating);
    if (newRating > 0) {
      setRatedToast(`${t('detail.rateThisRecipe')} ${newRating} ★`);
    } else {
      setRatedToast(t('detail.notRated'));
    }
    setTimeout(() => setRatedToast(null), 3000);
  };

  const handleAddAllToShopping = () => {
    addIngredientsToShoppingList(recipe);
    setJustAddedAll(true);
    setTimeout(() => setJustAddedAll(false), 2500);
  };

  const handleAddSingleIngredient = (ingredientId: string) => {
    addIngredientsToShoppingList(recipe, [ingredientId]);
  };

  const toggleStep = (index: number) => {
    setCompletedSteps((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const handleDelete = () => {
    deleteRecipe(recipe.id);
    onClose();
  };

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isIngredientInCart = (ingName: string) => {
    return shoppingList.some(
      (item) => item.recipeId === recipe.id && item.name.toLowerCase() === ingName.toLowerCase()
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden my-6 max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Floating Top Controls */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
          {onEdit && (
            <button
              onClick={() => onEdit(recipe)}
              className="p-2 sm:px-3 sm:py-2 rounded-full bg-white/90 dark:bg-stone-900/90 text-stone-700 dark:text-stone-300 hover:text-emerald-700 dark:hover:text-emerald-400 shadow-md backdrop-blur-xs transition-transform hover:scale-105 cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
              title={t('card.edit')}
            >
              <Edit3 className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
              <span className="hidden sm:inline">{t('card.edit')}</span>
            </button>
          )}

          <button
            onClick={() => toggleFavorite(recipe.id)}
            className="p-2.5 rounded-full bg-white/90 dark:bg-stone-900/90 text-stone-700 dark:text-stone-300 hover:text-rose-500 shadow-md backdrop-blur-xs transition-transform hover:scale-110 cursor-pointer"
            title={recipe.isFavorite ? t('card.removeFromFav') : t('card.addToFav')}
          >
            <Heart
              className={`w-5 h-5 ${
                recipe.isFavorite ? 'fill-rose-500 text-rose-500' : ''
              }`}
            />
          </button>

          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-white/90 dark:bg-stone-900/90 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 shadow-md backdrop-blur-xs transition-transform hover:scale-105 cursor-pointer"
            title={t('form.cancel')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Modal Body */}
        <div className="overflow-y-auto flex-1">
          {/* Hero Visual Banner */}
          <div className="relative h-64 sm:h-80 w-full bg-stone-900">
            {recipe.image && !imgError ? (
              <img
                src={recipe.image}
                alt={recipe.title}
                onError={() => setImgError(true)}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-stone-800 to-stone-950 text-stone-200 p-6">
                <ChefHat className="w-16 h-16 text-emerald-400 mb-3" />
                <span className="font-serif-display text-2xl font-bold text-center">
                  {recipe.title}
                </span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

            {/* Overlay Info Header */}
            <div className="absolute bottom-6 left-6 right-6 text-white">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 text-xs font-medium text-stone-300">
                  <span className="capitalize">{getCategoryText(recipe.category)}</span>
                  <span aria-hidden="true">·</span>
                  <span>{getDifficultyText(recipe.difficulty)}</span>
                  {(recipe.macros?.calories || recipe.calories) && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">
                        {recipe.macros?.calories ?? recipe.calories} kcal / {t('card.servings', { count: 1 }).replace('1 ', '')}
                      </span>
                    </>
                  )}
                  {language !== 'fr' && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-600/90 text-white font-medium text-[11px] inline-flex items-center gap-1">
                        <span>{currentLanguageOption.flag}</span>
                        <span>{currentLanguageOption.name}</span>
                      </span>
                    </>
                  )}
                </div>

                {recipe.sourceUrl && (
                  <a
                    href={recipe.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg bg-white/20 hover:bg-white/30 text-white backdrop-blur-xs transition-colors cursor-pointer"
                    title={t('detail.sourceLink')}
                  >
                    <span>{t('detail.sourceLink')}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>

              <h1 className="font-serif-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white mb-2 max-w-2xl text-balance">
                {recipe.title}
              </h1>

              <div className="flex flex-wrap items-center gap-5 text-xs sm:text-sm text-stone-200">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  <span>{t('detail.prepTime')}: {recipe.prepTime} min</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <span>{t('detail.cookTime')}: {recipe.cookTime} min</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className={`w-4 h-4 ${recipe.userRating ? 'text-amber-400 fill-amber-400' : 'text-stone-400'}`} />
                  <span className="font-semibold font-mono tabular-nums">
                    {recipe.userRating ? `${recipe.userRating} / 5` : t('detail.notRated').split('(')[0].trim()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Rating Strip */}
          <div className="bg-stone-100/90 dark:bg-stone-800/60 px-6 py-3.5 border-b border-stone-200 dark:border-stone-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-stone-700 dark:text-stone-300">
                {t('detail.rateThisRecipe')}
              </span>
              <StarRating
                rating={recipe.userRating ?? 0}
                interactive={true}
                size="md"
                onRate={handleRate}
                userRated={recipe.userRating !== undefined}
              />
              {recipe.userRating ? (
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 font-mono tabular-nums">
                    {recipe.userRating} / 5
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRate(0)}
                    className="text-[11px] text-stone-500 hover:text-rose-600 dark:text-stone-400 dark:hover:text-rose-400 underline cursor-pointer transition-colors"
                  >
                    {t('card.delete')}
                  </button>
                </div>
              ) : (
                <span className="text-xs text-stone-400 dark:text-stone-500 italic">
                  {t('detail.notRated')}
                </span>
              )}
            </div>

            {ratedToast && (
              <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium animate-in fade-in duration-150">
                {ratedToast}
              </span>
            )}
          </div>

          {/* Main 2-Column Content Grid */}
          <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Ingredients & Shopping List (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Servings Scaler Module */}
              <div className="bg-stone-50 dark:bg-stone-800/50 p-4 rounded-2xl border border-stone-200/80 dark:border-stone-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-stone-500 dark:text-stone-400 block">
                    {t('detail.servings')}
                  </span>
                  <span className="font-serif-display text-xl font-bold text-stone-900 dark:text-stone-100">
                    {t('card.servings', { count: servings })}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl p-1 shadow-2xs">
                  <button
                    onClick={() => setServings((prev) => Math.max(1, prev - 1))}
                    className="p-1.5 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors cursor-pointer"
                    aria-label="Diminuer les portions"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-2 font-mono font-bold text-sm text-stone-900 dark:text-stone-100">
                    {servings}
                  </span>
                  <button
                    onClick={() => setServings((prev) => prev + 1)}
                    className="p-1.5 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors cursor-pointer"
                    aria-label="Augmenter les portions"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Macro-nutriments par personne */}
              {(recipe.macros || recipe.calories) && (
                <div className="bg-stone-50 dark:bg-stone-800/50 p-4 rounded-2xl border border-stone-200/80 dark:border-stone-800">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                      {t('detail.macrosTitle')}
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div className="bg-white dark:bg-stone-900 p-2.5 rounded-xl border border-stone-200/80 dark:border-stone-800 shadow-2xs">
                      <span className="text-[10px] text-stone-400 block mb-0.5">{t('detail.caloriesUnit')}</span>
                      <span className="font-mono text-sm font-bold text-amber-700 dark:text-amber-400 tabular-nums">
                        {recipe.macros?.calories ?? recipe.calories ?? '—'}
                      </span>
                    </div>

                    <div className="bg-white dark:bg-stone-900 p-2.5 rounded-xl border border-stone-200/80 dark:border-stone-800 shadow-2xs">
                      <span className="text-[10px] text-stone-400 block mb-0.5">{t('detail.proteins')}</span>
                      <span className="font-mono text-sm font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">
                        {recipe.macros?.proteins !== undefined ? `${recipe.macros.proteins}g` : '—'}
                      </span>
                    </div>

                    <div className="bg-white dark:bg-stone-900 p-2.5 rounded-xl border border-stone-200/80 dark:border-stone-800 shadow-2xs">
                      <span className="text-[10px] text-stone-400 block mb-0.5">{t('detail.carbs')}</span>
                      <span className="font-mono text-sm font-bold text-cyan-700 dark:text-cyan-400 tabular-nums">
                        {recipe.macros?.carbs !== undefined ? `${recipe.macros.carbs}g` : '—'}
                      </span>
                    </div>

                    <div className="bg-white dark:bg-stone-900 p-2.5 rounded-xl border border-stone-200/80 dark:border-stone-800 shadow-2xs">
                      <span className="text-[10px] text-stone-400 block mb-0.5">{t('detail.fats')}</span>
                      <span className="font-mono text-sm font-bold text-rose-700 dark:text-rose-400 tabular-nums">
                        {recipe.macros?.fats !== undefined ? `${recipe.macros.fats}g` : '—'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Ingredients List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif-display text-lg font-bold text-stone-900 dark:text-stone-100">
                    {t('detail.ingredients')} ({recipe.ingredients.length})
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddAllToShopping}
                    className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                      justAddedAll
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-emerald-800 text-white hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 border-emerald-800 shadow-2xs'
                    }`}
                  >
                    {justAddedAll ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>{t('shop.copiedSuccess').split('!')[0]}</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>{t('detail.addAllToCart')}</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="divide-y divide-stone-100 dark:divide-stone-800/80 border border-stone-200/80 dark:border-stone-800 rounded-2xl bg-white dark:bg-stone-900 overflow-hidden shadow-2xs">
                  {recipe.ingredients.map((ing) => {
                    const scaledQty = ing.quantity !== null
                      ? Math.round(ing.quantity * servingsMultiplier * 10) / 10
                      : null;
                    const inCart = isIngredientInCart(ing.name);

                    return (
                      <div
                        key={ing.id}
                        className="p-3 flex items-center justify-between gap-3 text-xs sm:text-sm hover:bg-stone-50/80 dark:hover:bg-stone-800/40 transition-colors"
                      >
                        <div className="flex-1">
                          <span className="font-medium text-stone-900 dark:text-stone-100">
                            {ing.name}
                          </span>
                          {ing.note && (
                            <span className="text-stone-400 text-xs ml-1.5">({ing.note})</span>
                          )}
                        </div>

                        <div className="flex items-center gap-2.5 shrink-0">
                          {scaledQty !== null && (
                            <span className="font-mono tabular-nums font-semibold text-stone-700 dark:text-stone-300">
                              {scaledQty} {ing.unit}
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={() => handleAddSingleIngredient(ing.id)}
                            title={t('detail.addAllToCart')}
                            className={`p-1.5 rounded-md border transition-all cursor-pointer ${
                              inCart
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800'
                                : 'bg-stone-50 dark:bg-stone-800 text-stone-500 hover:text-emerald-700 hover:border-emerald-300 border-stone-200 dark:border-stone-700'
                            }`}
                          >
                            {inCart ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            ) : (
                              <Plus className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Chef Tip Callout */}
              {recipe.chefTip && (
                <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-stone-800/50 border border-amber-200/60 dark:border-stone-700/60 text-xs text-stone-700 dark:text-stone-300">
                  <div className="flex items-center gap-1.5 font-semibold text-amber-900 dark:text-amber-400 mb-1">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>{t('detail.chefTip')}</span>
                  </div>
                  <p className="leading-relaxed">{recipe.chefTip}</p>
                </div>
              )}

              {/* Source Link Section */}
              {recipe.sourceUrl && (
                <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200/80 dark:border-stone-800 flex items-center justify-between gap-3 text-xs">
                  <div className="min-w-0 flex-1">
                    <span className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 block uppercase tracking-wider mb-0.5">
                      {t('detail.sourceLink')}
                    </span>
                    <p className="font-medium text-stone-800 dark:text-stone-200 truncate">
                      {recipe.sourceUrl}
                    </p>
                  </div>
                  <a
                    href={recipe.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-800 text-white hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 transition-colors shrink-0 shadow-2xs cursor-pointer"
                  >
                    <span>Ouvrir</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>

            {/* Right Column: Step-by-Step Instructions & Cooking Timer (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Kitchen Timer Bar */}
              <div className="p-4 rounded-2xl bg-stone-900 text-white flex items-center justify-between gap-4 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-stone-800 flex items-center justify-center text-emerald-400">
                    <Timer className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-medium text-stone-400 uppercase tracking-wider block">
                      {t('detail.cookTime')}
                    </span>
                    <span className="font-mono text-2xl font-bold tracking-tight text-white tabular-nums">
                      {formatTimer(timerSeconds)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setTimerRunning((prev) => !prev)}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {timerRunning ? (
                      <>
                        <Pause className="w-3.5 h-3.5" />
                        <span>Pause</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5" />
                        <span>Play</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setTimerRunning(false);
                      setTimerSeconds(recipe.cookTime > 0 ? recipe.cookTime * 60 : 15 * 60);
                    }}
                    className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors cursor-pointer"
                    title={t('search.resetAll')}
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Instructions Steps */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-serif-display text-lg font-bold text-stone-900 dark:text-stone-100">
                    {t('detail.instructions')}
                  </h3>
                  <span className="text-xs text-stone-500 dark:text-stone-400">
                    {completedSteps.length} / {recipe.instructions.length}
                  </span>
                </div>

                <div className="space-y-3">
                  {recipe.instructions.map((step, index) => {
                    const isDone = completedSteps.includes(index);
                    const stepNum = index + 1;

                    return (
                      <div
                        key={index}
                        onClick={() => toggleStep(index)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                          isDone
                            ? 'bg-stone-50/80 dark:bg-stone-800/40 border-stone-200 dark:border-stone-800 text-stone-400 dark:text-stone-500 line-through'
                            : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 hover:border-emerald-600/50 shadow-2xs'
                        }`}
                      >
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 font-mono text-xs font-bold transition-colors ${
                            isDone
                              ? 'bg-emerald-600 text-white'
                              : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300'
                          }`}
                        >
                          {isDone ? <Check className="w-3.5 h-3.5" /> : stepNum}
                        </div>

                        <div className="flex-1 text-xs sm:text-sm leading-relaxed text-stone-800 dark:text-stone-200">
                          {step}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recipe Management Actions (Edit & Delete) */}
              <div className="pt-4 border-t border-stone-200 dark:border-stone-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {onEdit && (
                    <button
                      onClick={() => onEdit(recipe)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                      <span>{t('card.edit')}</span>
                    </button>
                  )}
                  {recipe.isCustom && (
                    <span className="text-[11px] text-stone-400 dark:text-stone-500 hidden sm:inline">
                      ({t('card.customBadge')})
                    </span>
                  )}
                </div>

                {/* Delete Recipe Button */}
                <div className="flex items-center gap-2">
                  {confirmDelete ? (
                    <div className="flex items-center gap-2 bg-rose-50 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-800 px-3 py-1.5 rounded-xl animate-in fade-in zoom-in-95">
                      <span className="text-xs text-rose-700 dark:text-rose-300 font-medium">
                        {t('card.deleteConfirm')}
                      </span>
                      <button
                        onClick={handleDelete}
                        className="px-3 py-1 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-700 text-white transition-colors cursor-pointer shadow-2xs"
                      >
                        {t('card.confirmYes')}
                      </button>
                      <button
                        onClick={() => setConfirmDelete(false)}
                        className="px-2.5 py-1 text-xs font-medium rounded-lg bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-300 dark:hover:bg-stone-600 transition-colors cursor-pointer"
                      >
                        {t('card.confirmNo')}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDelete(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer border border-transparent hover:border-rose-200 dark:hover:border-rose-900"
                      title={t('card.delete')}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{t('card.delete')}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
