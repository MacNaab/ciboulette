import React, { useState, useMemo } from 'react';
import {
  ShoppingCart,
  Plus,
  Trash2,
  Check,
  Copy,
  ChefHat,
  Layers,
  UtensilsCrossed,
  ChevronDown,
  ChevronUp,
  Sparkles,
  X
} from 'lucide-react';
import { useRecipes } from '../context/RecipeContext';
import { useLanguage } from '../context/LanguageContext';
import { aggregateShoppingList, ConsolidatedIngredient } from '../utils/shoppingAggregator';

interface ShoppingListViewProps {
  onGoToRecipes: () => void;
}

export const ShoppingListView: React.FC<ShoppingListViewProps> = ({ onGoToRecipes }) => {
  const {
    shoppingList,
    toggleShoppingItem,
    toggleShoppingItemsBatch,
    removeShoppingItem,
    removeShoppingItemsBatch,
    removeRecipeFromShoppingList,
    clearCompletedShopping,
    clearAllShopping,
    addManualShoppingItem
  } = useRecipes();

  const { t } = useLanguage();

  // View mode: 'combined' (ingrédients regroupés & quantités additionnées) or 'byRecipe' (détaillé par plat)
  const [viewMode, setViewMode] = useState<'combined' | 'byRecipe'>('combined');
  
  // Expanded detail items in combined view
  const [expandedKeys, setExpandedKeys] = useState<Record<string, boolean>>({});

  const [newItemName, setNewItemName] = useState('');
  const [newItemQty, setNewItemQty] = useState('');
  const [newItemUnit, setNewItemUnit] = useState('');
  const [copiedToast, setCopiedToast] = useState(false);
  const [confirmClearAll, setConfirmClearAll] = useState(false);
  const [confirmDeleteDish, setConfirmDeleteDish] = useState<string | null>(null);
  const [dishRemovedNotice, setDishRemovedNotice] = useState<string | null>(null);

  // Grouped by recipe
  const groupedByRecipe = useMemo(() => {
    return shoppingList.reduce<Record<string, typeof shoppingList>>((acc, item) => {
      const key = item.recipeTitle || 'Articles divers';
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});
  }, [shoppingList]);

  // Distinct recipes/dishes currently present in the cart
  const distinctDishesInCart = useMemo(() => {
    const dishesMap = new Map<
      string,
      {
        id?: string;
        title: string;
        itemsCount: number;
        checkedCount: number;
        isManual: boolean;
      }
    >();

    shoppingList.forEach((item) => {
      const isManual = !item.recipeId && !item.recipeTitle;
      const key = isManual ? '__manual__' : (item.recipeId || item.recipeTitle || 'Inconnu');
      const title = isManual ? 'Articles manuels' : (item.recipeTitle || 'Plat sans titre');

      if (!dishesMap.has(key)) {
        dishesMap.set(key, {
          id: item.recipeId,
          title,
          itemsCount: 0,
          checkedCount: 0,
          isManual
        });
      }

      const dish = dishesMap.get(key)!;
      dish.itemsCount += 1;
      if (item.checked) dish.checkedCount += 1;
    });

    return Array.from(dishesMap.entries()).map(([key, val]) => ({
      key,
      ...val
    }));
  }, [shoppingList]);

  const handleRemoveDish = (dishKeyOrTitle: string, displayTitle: string) => {
    removeRecipeFromShoppingList(dishKeyOrTitle);
    setConfirmDeleteDish(null);
    setDishRemovedNotice(t('shop.removeDishSuccess', { title: displayTitle }));
    setTimeout(() => setDishRemovedNotice(null), 4000);
  };

  // Aggregated combined ingredients with sum of quantities
  const consolidatedList = useMemo(() => {
    return aggregateShoppingList(shoppingList);
  }, [shoppingList]);

  const pendingCount = shoppingList.filter((item) => !item.checked).length;
  const completedCount = shoppingList.filter((item) => item.checked).length;

  const toggleExpand = (key: string) => {
    setExpandedKeys(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleAddManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    const qty = newItemQty ? parseFloat(newItemQty) : null;
    addManualShoppingItem(newItemName, isNaN(qty as number) ? null : qty, newItemUnit);
    setNewItemName('');
    setNewItemQty('');
    setNewItemUnit('');
  };

  const handleToggleCombined = (cons: ConsolidatedIngredient) => {
    const targetState = !cons.allChecked;
    const ids = cons.items.map(i => i.id);
    toggleShoppingItemsBatch(ids, targetState);
  };

  const handleRemoveCombined = (cons: ConsolidatedIngredient) => {
    const ids = cons.items.map(i => i.id);
    removeShoppingItemsBatch(ids);
  };

  const handleCopyList = () => {
    if (shoppingList.length === 0) return;

    let text = '';
    if (viewMode === 'combined') {
      text = `🛒 ${t('shop.title').toUpperCase()} (Ciboulette)\n\n`;
      consolidatedList.forEach(item => {
        const check = item.allChecked ? '✓ ' : '• ';
        const qty = item.totalQuantityDisplay ? `${item.totalQuantityDisplay} : ` : '';
        const recipesSummary = item.sourceRecipes.length > 1
          ? ` (${item.sourceRecipes.map(r => r.title).join(', ')})`
          : item.sourceRecipes[0]?.title
          ? ` (${item.sourceRecipes[0].title})`
          : '';
        text += `${check}${item.name} ${qty ? `(${qty.trim()})` : ''}${recipesSummary}\n`;
      });
    } else {
      text = `🛒 ${t('shop.title').toUpperCase()} (Ciboulette)\n\n`;
      Object.entries(groupedByRecipe).forEach(([groupName, items]) => {
        text += `📌 ${groupName} :\n`;
        items.forEach((item) => {
          const check = item.checked ? '✓ ' : '• ';
          const qty = item.quantity ? `${item.quantity} ${item.unit} ` : '';
          text += `  ${check}${qty}${item.name}\n`;
        });
        text += '\n';
      });
    }

    navigator.clipboard.writeText(text);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200 dark:border-stone-800">
        <div>
          <h1 className="font-serif-display text-2xl sm:text-3xl font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2.5">
            <ShoppingCart className="w-7 h-7 text-emerald-800 dark:text-emerald-400" />
            <span>{t('shop.title')}</span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
            {pendingCount} {t('detail.ingredients').toLowerCase()}
            {completedCount > 0 && ` · ${t('shop.checkedProgress', { checked: completedCount, total: shoppingList.length })}`}
          </p>
        </div>

        {/* Global actions */}
        {shoppingList.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleCopyList}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors cursor-pointer"
            >
              {copiedToast ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 dark:text-emerald-400">{t('shop.copiedSuccess')}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>{t('shop.copyList')}</span>
                </>
              )}
            </button>

            {completedCount > 0 && (
              <button
                onClick={clearCompletedShopping}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{t('shop.clearCompleted')} ({completedCount})</span>
              </button>
            )}

            {confirmClearAll ? (
              <div className="flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/80 border border-rose-300 dark:border-rose-800 px-2.5 py-1 rounded-lg">
                <span className="text-xs text-rose-700 dark:text-rose-300 font-medium">
                  {t('shop.clearAll')} ?
                </span>
                <button
                  type="button"
                  onClick={clearAllShopping}
                  className="px-2 py-0.5 text-xs font-bold rounded bg-rose-600 hover:bg-rose-700 text-white cursor-pointer"
                >
                  {t('card.confirmYes').split(',')[0]}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmClearAll(false)}
                  className="px-2 py-0.5 text-xs rounded bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300 cursor-pointer"
                >
                  {t('card.confirmNo')}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmClearAll(true)}
                className="p-1.5 text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
                title={t('shop.clearAll')}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Dish Removal Notice Banner */}
      {dishRemovedNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/80 text-xs sm:text-sm text-emerald-800 dark:text-emerald-300 flex items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{dishRemovedNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setDishRemovedNotice(null)}
            className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* DISHES IN CART BAR */}
      {distinctDishesInCart.length > 0 && (
        <div className="bg-white dark:bg-stone-900 rounded-2xl p-4 border border-stone-200/80 dark:border-stone-800 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
              <UtensilsCrossed className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
              <span>{t('shop.dishesInCart')}</span>
            </span>
            <span className="text-[11px] text-stone-400">
              {t('shop.detailHelp')}
            </span>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            {distinctDishesInCart.map((dish) => {
              const isConfirming = confirmDeleteDish === dish.key;

              return (
                <div
                  key={dish.key}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs transition-all ${
                    isConfirming
                      ? 'bg-rose-50 border-rose-300 dark:bg-rose-950/60 dark:border-rose-900 ring-2 ring-rose-400/20'
                      : 'bg-stone-50 dark:bg-stone-800/60 border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200'
                  }`}
                >
                  <span className="font-medium">{dish.title}</span>
                  <span className="font-mono text-[11px] text-stone-400 dark:text-stone-500">
                    ({dish.itemsCount} {t('detail.ingredients').toLowerCase().slice(0, 4)}.)
                  </span>

                  {isConfirming ? (
                    <div className="flex items-center gap-1 ml-1 animate-in fade-in">
                      <span className="text-[11px] text-rose-600 font-semibold">{t('shop.removeDishConfirm')}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveDish(dish.id || dish.key, dish.title)}
                        className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-rose-600 hover:bg-rose-700 text-white cursor-pointer transition-colors shadow-2xs"
                      >
                        {t('card.confirmYes').split(',')[0]}
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteDish(null)}
                        className="px-1.5 py-0.5 text-[10px] rounded bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300 cursor-pointer transition-colors"
                      >
                        {t('card.confirmNo')}
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteDish(dish.key)}
                      className="text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer p-0.5 rounded"
                      title={`${t('shop.removeDish')} « ${dish.title} »`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick Add Manual Item Form */}
      <form
        onSubmit={handleAddManual}
        className="bg-white dark:bg-stone-900 rounded-2xl p-4 border border-stone-200/80 dark:border-stone-800 shadow-2xs flex flex-wrap items-center gap-2.5"
      >
        <div className="flex-1 min-w-[160px]">
          <input
            type="text"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            placeholder={t('shop.manualPlaceholder')}
            className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-700/30"
          />
        </div>

        <div className="w-20">
          <input
            type="text"
            value={newItemQty}
            onChange={(e) => setNewItemQty(e.target.value)}
            placeholder={t('form.ingQtyPlaceholder')}
            className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-700/30 font-mono"
          />
        </div>

        <div className="w-24">
          <input
            type="text"
            value={newItemUnit}
            onChange={(e) => setNewItemUnit(e.target.value)}
            placeholder={t('form.ingUnitPlaceholder')}
            className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-700/30"
          />
        </div>

        <button
          type="submit"
          disabled={!newItemName.trim()}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-emerald-800 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{t('shop.manualAdd')}</span>
        </button>
      </form>

      {/* Mode Switcher Tabs */}
      {shoppingList.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-stone-100/60 dark:bg-stone-900/60 p-1.5 rounded-2xl border border-stone-200/80 dark:border-stone-800">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setViewMode('combined')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                viewMode === 'combined'
                  ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
              <span>{t('shop.modeCombined')}</span>
              <span className="font-mono text-[11px] px-1.5 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                {consolidatedList.length}
              </span>
            </button>

            <button
              onClick={() => setViewMode('byRecipe')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                viewMode === 'byRecipe'
                  ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-xs'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-stone-500" />
              <span>{t('shop.modeByRecipe')}</span>
              <span className="font-mono text-[11px] px-1.5 py-0.2 rounded-full bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300">
                {shoppingList.length}
              </span>
            </button>
          </div>

          <span className="text-[11px] text-stone-400 dark:text-stone-500 px-2 hidden sm:inline">
            {viewMode === 'combined'
              ? t('shop.modeCombinedDesc')
              : t('shop.modeByRecipeDesc')}
          </span>
        </div>
      )}

      {/* Main List Rendering */}
      {shoppingList.length === 0 ? (
        <div className="bg-white dark:bg-stone-900 rounded-3xl p-12 text-center border border-stone-200/80 dark:border-stone-800 space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-400">
            <ShoppingCart className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="font-serif-display text-xl font-bold text-stone-900 dark:text-stone-100 mb-1">
              {t('shop.emptyTitle')}
            </h3>
            <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400">
              {t('shop.emptyDesc')}
            </p>
          </div>
          <button
            onClick={onGoToRecipes}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white transition-colors cursor-pointer"
          >
            <ChefHat className="w-4 h-4" />
            <span>{t('shop.goToRecipes')}</span>
          </button>
        </div>
      ) : viewMode === 'combined' ? (
        /* MODE 1: COMBINED & SUMMED INGREDIENTS */
        <div className="space-y-3">
          {consolidatedList.map((cons) => {
            const isExpanded = expandedKeys[cons.key];
            const hasMultipleSources = cons.sourceRecipes.length > 1;

            return (
              <div
                key={cons.key}
                className={`bg-white dark:bg-stone-900 rounded-2xl border transition-all overflow-hidden ${
                  cons.allChecked
                    ? 'border-stone-200/60 dark:border-stone-800/60 bg-stone-50/40 dark:bg-stone-950/20'
                    : 'border-stone-200/80 dark:border-stone-800 shadow-2xs hover:border-emerald-600/40'
                }`}
              >
                <div
                  onClick={() => handleToggleCombined(cons)}
                  className="px-5 py-3.5 flex items-center justify-between gap-3 text-xs sm:text-sm cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleCombined(cons);
                      }}
                      className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all cursor-pointer shrink-0 ${
                        cons.allChecked
                          ? 'bg-emerald-700 border-emerald-700 text-white'
                          : cons.items.some(i => i.checked)
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700'
                          : 'border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800'
                      }`}
                    >
                      {cons.allChecked && <Check className="w-3.5 h-3.5" />}
                      {!cons.allChecked && cons.items.some(i => i.checked) && (
                        <div className="w-2 h-2 rounded-xs bg-emerald-600" />
                      )}
                    </button>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`truncate font-medium ${cons.allChecked ? 'line-through text-stone-400 dark:text-stone-500' : 'text-stone-900 dark:text-stone-100 font-semibold'}`}>
                          {cons.name}
                        </span>

                        {hasMultipleSources && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800 shrink-0">
                            {cons.sourceRecipes.length} plats
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 text-[11px] text-stone-400 dark:text-stone-500 truncate mt-0.5">
                        <UtensilsCrossed className="w-3 h-3 shrink-0" />
                        <span className="truncate">
                          {cons.sourceRecipes.map(r => r.title).join(' · ')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {cons.totalQuantityDisplay && (
                      <span className="font-mono tabular-nums font-bold text-sm sm:text-base text-emerald-800 dark:text-emerald-400">
                        {cons.totalQuantityDisplay}
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpand(cons.key);
                      }}
                      className="p-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-md transition-colors cursor-pointer"
                      title={isExpanded ? 'Masquer le détail' : 'Afficher le détail par plat'}
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveCombined(cons);
                      }}
                      className="p-1 text-stone-300 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                      title={t('card.delete')}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Expanded breakdown per recipe with quick dish deletion */}
                {isExpanded && (
                  <div className="px-6 sm:px-12 py-3 bg-stone-50 dark:bg-stone-950/40 border-t border-stone-100 dark:border-stone-800/80 space-y-2 text-xs text-stone-600 dark:text-stone-300">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
                        {t('shop.detailBreakdown')}
                      </span>
                      <span className="text-[11px] text-stone-400 hidden sm:inline">
                        {t('shop.detailHelp')}
                      </span>
                    </div>
                    {cons.sourceRecipes.map((src, idx) => (
                      <div key={idx} className="flex items-center justify-between py-1 border-b border-stone-100/60 dark:border-stone-800/40 last:border-0">
                        <span className="font-medium text-stone-800 dark:text-stone-200">{src.title}</span>
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-semibold tabular-nums text-emerald-800 dark:text-emerald-400">
                            {src.quantity !== null ? `${src.quantity} ${src.unit}` : '—'}
                          </span>
                          {src.title !== 'Article manuel' && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveDish(src.title, src.title);
                              }}
                              className="text-[11px] text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1 cursor-pointer transition-colors"
                              title={`${t('shop.removeDish')} « ${src.title} »`}
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>{t('shop.removeDish')}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* MODE 2: GROUPED BY RECIPE */
        <div className="space-y-6">
          {Object.entries(groupedByRecipe).map(([recipeTitle, items]) => {
            const recipeId = items[0]?.recipeId;
            const dishIdentifier = recipeId || (recipeTitle === 'Articles divers' ? '__manual__' : recipeTitle);
            const isConfirming = confirmDeleteDish === recipeTitle;

            return (
              <div
                key={recipeTitle}
                className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/80 dark:border-stone-800 overflow-hidden shadow-2xs"
              >
                <div className="px-5 py-3.5 bg-stone-50/80 dark:bg-stone-800/40 border-b border-stone-100 dark:border-stone-800 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <UtensilsCrossed className="w-4 h-4 text-emerald-800 dark:text-emerald-400" />
                    <span className="font-serif-display text-sm font-bold text-stone-800 dark:text-stone-200">
                      {recipeTitle}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-stone-400 font-mono tabular-nums">
                      {items.filter((i) => i.checked).length} / {items.length}
                    </span>
                    {isConfirming ? (
                      <div className="flex items-center gap-1.5 animate-in fade-in">
                        <span className="text-[11px] text-rose-600 font-medium">{t('shop.removeDishConfirm')}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveDish(dishIdentifier, recipeTitle)}
                          className="px-2 py-0.5 text-[10px] font-bold rounded bg-rose-600 hover:bg-rose-700 text-white cursor-pointer transition-colors shadow-2xs"
                        >
                          {t('card.confirmYes').split(',')[0]}
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteDish(null)}
                          className="px-2 py-0.5 text-[10px] rounded bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300 cursor-pointer transition-colors"
                        >
                          {t('card.confirmNo')}
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteDish(recipeTitle)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer border border-transparent hover:border-rose-200 dark:hover:border-rose-900"
                        title={`${t('shop.removeDish')} « ${recipeTitle} »`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>{t('shop.removeDish')}</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="divide-y divide-stone-100 dark:divide-stone-800/60">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => toggleShoppingItem(item.id)}
                      className={`px-5 py-3 flex items-center justify-between gap-3 text-xs sm:text-sm cursor-pointer transition-colors ${
                        item.checked
                          ? 'bg-stone-50/40 dark:bg-stone-950/20 text-stone-400 dark:text-stone-500'
                          : 'hover:bg-stone-50/60 dark:hover:bg-stone-800/30 text-stone-800 dark:text-stone-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleShoppingItem(item.id);
                          }}
                          className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all cursor-pointer ${
                            item.checked
                              ? 'bg-emerald-700 border-emerald-700 text-white'
                              : 'border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800'
                          }`}
                        >
                          {item.checked && <Check className="w-3.5 h-3.5" />}
                        </button>

                        <span className={item.checked ? 'line-through' : 'font-medium'}>
                          {item.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        {item.quantity !== null && (
                          <span className="font-mono tabular-nums text-stone-500 dark:text-stone-400 text-xs">
                            {item.quantity} {item.unit}
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeShoppingItem(item.id);
                          }}
                          className="p-1 text-stone-300 hover:text-rose-600 transition-colors cursor-pointer"
                          title={t('card.delete')}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
