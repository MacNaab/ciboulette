import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { Recipe, RecipeCategory, ShoppingItem, SortOption } from '../types/recipe';
import { INITIAL_RECIPES } from '../data/defaultRecipes';
import { useLanguage } from './LanguageContext';
import { SupportedLanguage, SUPPORTED_LANGUAGES } from '../types/i18n';
import {
  resolveRecipeForLanguage,
  isRecipeTranslated,
  invalidateRecipeCache
} from '../services/recipeCacheService';
import { translateRecipe } from '../services/translationService';
import { TranslationProgressState } from '../components/TranslationProgressModal';

const STORAGE_KEYS = {
  RECIPES: 'ciboulette_recipes_v1',
  SHOPPING: 'ciboulette_shopping_v1',
  DARK_MODE: 'ciboulette_theme_v1'
};

interface RecipeContextType {
  recipes: Recipe[];
  displayedRecipes: Recipe[];
  shoppingList: ShoppingItem[];
  translatedShoppingList: ShoppingItem[];
  activeCategory: RecipeCategory | 'all';
  setActiveCategory: (cat: RecipeCategory | 'all') => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedIngredientFilter: string | null;
  setSelectedIngredientFilter: (ing: string | null) => void;
  onlyFavorites: boolean;
  setOnlyFavorites: (fav: boolean) => void;
  minRating: number;
  setMinRating: (r: number) => void;
  sortBy: SortOption;
  setSortBy: (sort: SortOption) => void;
  filteredRecipes: Recipe[];
  allAvailableIngredients: string[];
  toggleFavorite: (id: string) => void;
  rateRecipe: (id: string, stars: number) => void;
  addRecipe: (data: Omit<Recipe, 'id' | 'createdAt' | 'ratingsCount' | 'rating' | 'userRating'> & { userRating?: number }) => Recipe;
  updateRecipe: (recipe: Recipe) => void;
  deleteRecipe: (id: string) => void;
  addIngredientsToShoppingList: (recipe: Recipe, ingredientIds?: string[]) => number;
  addManualShoppingItem: (name: string, quantity?: number | null, unit?: string) => void;
  toggleShoppingItem: (id: string) => void;
  toggleShoppingItemsBatch: (ids: string[], targetChecked?: boolean) => void;
  removeShoppingItem: (id: string) => void;
  removeShoppingItemsBatch: (ids: string[]) => void;
  removeRecipeFromShoppingList: (recipeIdOrTitle: string) => void;
  clearCompletedShopping: () => void;
  clearAllShopping: () => void;
  exportData: () => void;
  importRecipes: (importedRecipes: Recipe[]) => { count: number; error?: string };
  resetToDefault: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  changeLanguageWithAutoTranslate: (targetLang: SupportedLanguage) => Promise<void>;
  translationProgress: TranslationProgressState | null;
}

const RecipeContext = createContext<RecipeContextType | undefined>(undefined);

export const RecipeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { language, setLanguage } = useLanguage();

  // Version counter to force re-computation when translations cache updates
  const [translationVersion, setTranslationVersion] = useState<number>(0);
  const [translationProgress, setTranslationProgress] = useState<TranslationProgressState | null>(null);

  // 1. Canonical recipes state (stored in local storage)
  const [recipes, setRecipes] = useState<Recipe[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.RECIPES);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((r: any) => ({
            ...r,
            userRating: r.userRating !== undefined ? r.userRating : (r.rating ? Math.round(r.rating) : undefined)
          }));
        }
      }
    } catch (e) {
      console.error('Erreur chargement recettes locales:', e);
    }
    return INITIAL_RECIPES;
  });

  // 2. Shopping list state
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SHOPPING);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Erreur chargement liste de courses:', e);
    }
    return [];
  });

  // 3. Dark mode state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.DARK_MODE);
      if (stored !== null) {
        return stored === 'dark';
      }
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  // Synchronize dark mode class on <html>
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem(STORAGE_KEYS.DARK_MODE, 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem(STORAGE_KEYS.DARK_MODE, 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(prev => !prev);

  // Sync recipes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.RECIPES, JSON.stringify(recipes));
    } catch (e) {
      console.error('Erreur sauvegarde recettes:', e);
    }
  }, [recipes]);

  // Sync shopping list to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SHOPPING, JSON.stringify(shoppingList));
    } catch (e) {
      console.error('Erreur sauvegarde liste courses:', e);
    }
  }, [shoppingList]);

  // 4. Dynamically displayed recipes according to active language (instant from pre-translations / cache)
  const displayedRecipes = useMemo(() => {
    return recipes.map(recipe => resolveRecipeForLanguage(recipe, language));
  }, [recipes, language, translationVersion]);

  // 5. Translated Shopping List reflecting active language ingredients
  const translatedShoppingList = useMemo(() => {
    return shoppingList.map(item => {
      if (!item.recipeId) return item;
      const parentDisp = displayedRecipes.find(r => r.id === item.recipeId);
      const parentOrig = recipes.find(r => r.id === item.recipeId);
      if (!parentDisp || !parentOrig) return item;

      // Find original ingredient index to pick corresponding translated ingredient
      const origIdx = parentOrig.ingredients.findIndex(
        ing => ing.name.toLowerCase() === item.name.toLowerCase()
      );
      if (origIdx !== -1 && parentDisp.ingredients[origIdx]) {
        return {
          ...item,
          name: parentDisp.ingredients[origIdx].name,
          unit: parentDisp.ingredients[origIdx].unit,
          recipeTitle: parentDisp.title
        };
      }
      return {
        ...item,
        recipeTitle: parentDisp.title
      };
    });
  }, [shoppingList, displayedRecipes, recipes]);

  // 6. Seamless language change with automatic translation and local memory caching
  const changeLanguageWithAutoTranslate = useCallback(async (targetLang: SupportedLanguage) => {
    if (targetLang === language) return;

    // Find custom recipes that are not yet translated for targetLang
    const uncachedRecipes = recipes.filter(r => !isRecipeTranslated(r, targetLang));

    // Case 1: All recipes are already translated (defaults or already in localStorage cache)
    // Instant switch (0ms, 0 API calls)!
    if (uncachedRecipes.length === 0) {
      setLanguage(targetLang);
      setTranslationVersion(v => v + 1);
      return;
    }

    // Case 2: Some custom/imported recipes need translation
    const targetOption = SUPPORTED_LANGUAGES.find(l => l.code === targetLang) || {
      name: targetLang.toUpperCase(),
      flag: '🌐'
    };

    setTranslationProgress({
      isOpen: true,
      targetLangName: targetOption.name,
      targetLangFlag: targetOption.flag,
      current: 0,
      total: uncachedRecipes.length,
      currentRecipeName: uncachedRecipes[0]?.title || '',
      percent: 5,
      isComplete: false
    });

    try {
      for (let i = 0; i < uncachedRecipes.length; i++) {
        const recipe = uncachedRecipes[i];
        setTranslationProgress(prev => prev ? ({
          ...prev,
          current: i + 1,
          currentRecipeName: recipe.title,
          percent: Math.round(((i + 0.5) / uncachedRecipes.length) * 100)
        }) : null);

        // Translate and save to local persistent cache
        await translateRecipe(recipe, targetLang);

        setTranslationProgress(prev => prev ? ({
          ...prev,
          percent: Math.round(((i + 1) / uncachedRecipes.length) * 100)
        }) : null);
      }

      setTranslationProgress(prev => prev ? ({
        ...prev,
        isComplete: true,
        percent: 100
      }) : null);

      // Brief pause to display completion feedback
      await new Promise(resolve => setTimeout(resolve, 350));
    } catch (err) {
      console.warn('Batch translation warning:', err);
    } finally {
      setLanguage(targetLang);
      setTranslationVersion(v => v + 1);
      setTranslationProgress(null);
    }
  }, [language, recipes, setLanguage]);

  // Filters & Search
  const [activeCategory, setActiveCategory] = useState<RecipeCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedIngredientFilter, setSelectedIngredientFilter] = useState<string | null>(null);
  const [onlyFavorites, setOnlyFavorites] = useState<boolean>(false);
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<SortOption>('rating');

  // Extract list of all common ingredients in current language for rapid filtering tags
  const allAvailableIngredients = useMemo(() => {
    const ingredientCounts = new Map<string, number>();
    displayedRecipes.forEach(r => {
      r.ingredients.forEach(i => {
        const clean = i.name.trim();
        if (clean.length >= 3) {
          ingredientCounts.set(clean, (ingredientCounts.get(clean) || 0) + 1);
        }
      });
    });

    return Array.from(ingredientCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name]) => name);
  }, [displayedRecipes]);

  // Computed filtered & sorted recipes based on displayedRecipes
  const filteredRecipes = useMemo(() => {
    return displayedRecipes
      .filter(recipe => {
        // Category filter
        if (activeCategory !== 'all' && recipe.category !== activeCategory) {
          return false;
        }

        // Favorites filter
        if (onlyFavorites && !recipe.isFavorite) {
          return false;
        }

        // Min rating filter: strictly based on the user's personal rating
        if (minRating > 0) {
          if (!recipe.userRating || recipe.userRating < minRating) {
            return false;
          }
        }

        // Ingredient specific filter tag
        if (selectedIngredientFilter) {
          const matchIng = recipe.ingredients.some(ing =>
            ing.name.toLowerCase().includes(selectedIngredientFilter.toLowerCase())
          );
          if (!matchIng) return false;
        }

        // General search query (matches title, description, or ingredients in active language)
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase().trim();
          const matchTitle = recipe.title.toLowerCase().includes(query);
          const matchDesc = recipe.description.toLowerCase().includes(query);
          const matchIngredients = recipe.ingredients.some(ing =>
            ing.name.toLowerCase().includes(query)
          );
          if (!matchTitle && !matchDesc && !matchIngredients) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'rating') {
          const ratingA = a.userRating ?? 0;
          const ratingB = b.userRating ?? 0;
          return ratingB - ratingA;
        }
        if (sortBy === 'prepTime') {
          return (a.prepTime + a.cookTime) - (b.prepTime + b.cookTime);
        }
        if (sortBy === 'title') {
          return a.title.localeCompare(b.title, language);
        }
        if (sortBy === 'recent') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        return 0;
      });
  }, [displayedRecipes, activeCategory, onlyFavorites, minRating, selectedIngredientFilter, searchQuery, sortBy, language]);

  // Actions
  const toggleFavorite = (id: string) => {
    setRecipes(prev =>
      prev.map(r => (r.id === id ? { ...r, isFavorite: !r.isFavorite } : r))
    );
  };

  const rateRecipe = (id: string, stars: number) => {
    setRecipes(prev =>
      prev.map(r => {
        if (r.id !== id) return r;
        return {
          ...r,
          userRating: stars > 0 ? stars : undefined
        };
      })
    );
  };

  const addRecipe = (data: Omit<Recipe, 'id' | 'createdAt' | 'ratingsCount' | 'rating' | 'userRating'> & { userRating?: number }): Recipe => {
    const newRecipe: Recipe = {
      ...data,
      id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      createdAt: new Date().toISOString(),
      userRating: data.userRating,
      isCustom: true
    };
    setRecipes(prev => [newRecipe, ...prev]);
    return newRecipe;
  };

  const updateRecipe = (updated: Recipe) => {
    invalidateRecipeCache(updated.id);
    setRecipes(prev => prev.map(r => (r.id === updated.id ? updated : r)));
    setTranslationVersion(v => v + 1);
  };

  const deleteRecipe = (id: string) => {
    invalidateRecipeCache(id);
    setRecipes(prev => prev.filter(r => r.id !== id));
    // Also remove items of this recipe from shopping list
    setShoppingList(prev => prev.filter(item => item.recipeId !== id));
    setTranslationVersion(v => v + 1);
  };

  const addIngredientsToShoppingList = (recipe: Recipe, ingredientIds?: string[]): number => {
    const toAdd = ingredientIds
      ? recipe.ingredients.filter(i => ingredientIds.includes(i.id))
      : recipe.ingredients;

    if (toAdd.length === 0) return 0;

    const newItems: ShoppingItem[] = toAdd.map(ing => ({
      id: `shop_${recipe.id}_${ing.id}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      name: ing.name,
      quantity: ing.quantity,
      unit: ing.unit,
      recipeId: recipe.id,
      recipeTitle: recipe.title,
      checked: false,
      addedAt: new Date().toISOString()
    }));

    setShoppingList(prev => [...newItems, ...prev]);
    return newItems.length;
  };

  const addManualShoppingItem = (name: string, quantity: number | null = null, unit: string = '') => {
    if (!name.trim()) return;
    const newItem: ShoppingItem = {
      id: `manual_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      name: name.trim(),
      quantity,
      unit,
      checked: false,
      addedAt: new Date().toISOString()
    };
    setShoppingList(prev => [newItem, ...prev]);
  };

  const toggleShoppingItem = (id: string) => {
    setShoppingList(prev =>
      prev.map(item => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  const toggleShoppingItemsBatch = (ids: string[], targetChecked?: boolean) => {
    const idSet = new Set(ids);
    setShoppingList(prev =>
      prev.map(item => {
        if (idSet.has(item.id)) {
          return {
            ...item,
            checked: targetChecked !== undefined ? targetChecked : !item.checked
          };
        }
        return item;
      })
    );
  };

  const removeShoppingItem = (id: string) => {
    setShoppingList(prev => prev.filter(item => item.id !== id));
  };

  const removeShoppingItemsBatch = (ids: string[]) => {
    const idSet = new Set(ids);
    setShoppingList(prev => prev.filter(item => !idSet.has(item.id)));
  };

  const removeRecipeFromShoppingList = (recipeIdentifier: string) => {
    setShoppingList(prev =>
      prev.filter(item => {
        if (
          recipeIdentifier === '__manual__' ||
          recipeIdentifier === 'Articles divers' ||
          recipeIdentifier === 'Articles manuels' ||
          recipeIdentifier === 'Manual items' ||
          recipeIdentifier === 'Artículos manuales'
        ) {
          return Boolean(item.recipeId || item.recipeTitle);
        }
        if (item.recipeId && item.recipeId === recipeIdentifier) return false;
        if (item.recipeTitle && item.recipeTitle === recipeIdentifier) return false;
        return true;
      })
    );
  };

  const clearCompletedShopping = () => {
    setShoppingList(prev => prev.filter(item => !item.checked));
  };

  const clearAllShopping = () => {
    setShoppingList([]);
  };

  // Export all local data to clean JSON
  const exportData = () => {
    const dataToExport = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      appName: 'Ciboulette - Carnet de Cuisine',
      recipes,
      shoppingList
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ciboulette-recettes-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Import recipes from JSON
  const importRecipes = (importedRecipes: Recipe[]): { count: number; error?: string } => {
    if (!Array.isArray(importedRecipes) || importedRecipes.length === 0) {
      return { count: 0, error: 'Le fichier ne contient aucune recette valide.' };
    }

    const validated: Recipe[] = [];
    importedRecipes.forEach((raw, idx) => {
      if (raw && typeof raw.title === 'string' && Array.isArray(raw.ingredients)) {
        validated.push({
          ...raw,
          id: raw.id || `custom_${Date.now()}_${idx}`,
          createdAt: raw.createdAt || new Date().toISOString(),
          isCustom: true,
          userRating: raw.userRating !== undefined ? raw.userRating : (raw.rating ? Math.round(raw.rating) : undefined)
        });
      }
    });

    if (validated.length === 0) {
      return { count: 0, error: 'Aucune recette au format valide trouvée dans le fichier.' };
    }

    setRecipes(prev => {
      const existingIds = new Set(prev.map(r => r.id));
      const newItems = validated.filter(r => !existingIds.has(r.id));
      const updatedExisting = prev.map(r => {
        const found = validated.find(v => v.id === r.id);
        return found || r;
      });
      return [...newItems, ...updatedExisting];
    });

    return { count: validated.length };
  };

  // Reset to default sample recipes
  const resetToDefault = () => {
    setRecipes(INITIAL_RECIPES);
    try {
      localStorage.removeItem(STORAGE_KEYS.RECIPES);
    } catch (e) {
      console.error('Erreur reset recettes:', e);
    }
  };

  return (
    <RecipeContext.Provider
      value={{
        recipes,
        displayedRecipes,
        shoppingList,
        translatedShoppingList,
        activeCategory,
        setActiveCategory,
        searchQuery,
        setSearchQuery,
        selectedIngredientFilter,
        setSelectedIngredientFilter,
        onlyFavorites,
        setOnlyFavorites,
        minRating,
        setMinRating,
        sortBy,
        setSortBy,
        filteredRecipes,
        allAvailableIngredients,
        toggleFavorite,
        rateRecipe,
        addRecipe,
        updateRecipe,
        deleteRecipe,
        addIngredientsToShoppingList,
        addManualShoppingItem,
        toggleShoppingItem,
        toggleShoppingItemsBatch,
        removeShoppingItem,
        removeShoppingItemsBatch,
        removeRecipeFromShoppingList,
        clearCompletedShopping,
        clearAllShopping,
        exportData,
        importRecipes,
        resetToDefault,
        isDarkMode,
        toggleDarkMode,
        changeLanguageWithAutoTranslate,
        translationProgress
      }}
    >
      {children}
    </RecipeContext.Provider>
  );
};

export const useRecipes = (): RecipeContextType => {
  const context = useContext(RecipeContext);
  if (!context) {
    throw new Error('useRecipes must be used within a RecipeProvider');
  }
  return context;
};
