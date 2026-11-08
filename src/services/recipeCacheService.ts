import { SupportedLanguage } from '../types/i18n';
import { Recipe, Ingredient } from '../types/recipe';
import { DEFAULT_RECIPES_TRANSLATIONS, PreTranslatedContent } from '../data/defaultRecipesTranslated';

const STORAGE_CACHE_KEY = 'ciboulette_recipe_translations_v2';

export interface CachedRecipeTranslation {
  title: string;
  description: string;
  chefTip?: string;
  ingredients: { id: string; name: string; unit: string }[];
  instructions: string[];
  updatedAt: number;
}

type TranslationsStore = Record<string, Partial<Record<SupportedLanguage, CachedRecipeTranslation>>>;

function getStore(): TranslationsStore {
  try {
    const raw = localStorage.getItem(STORAGE_CACHE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading translation cache:', err);
  }
  return {};
}

function saveStore(store: TranslationsStore) {
  try {
    localStorage.setItem(STORAGE_CACHE_KEY, JSON.stringify(store));
  } catch (err) {
    console.error('Error saving translation cache:', err);
  }
}

/**
 * Check if a recipe is already translated into targetLang
 */
export function isRecipeTranslated(recipe: Recipe, targetLang: SupportedLanguage): boolean {
  if (targetLang === 'fr' && !recipe.isCustom) {
    return true;
  }
  // Check static pre-translated defaults
  if (DEFAULT_RECIPES_TRANSLATIONS[recipe.id]?.[targetLang]) {
    return true;
  }
  // Check local cache
  const store = getStore();
  return Boolean(store[recipe.id]?.[targetLang]);
}

/**
 * Retrieve cached translation if present
 */
export function getCachedRecipeTranslation(
  recipeId: string,
  targetLang: SupportedLanguage
): CachedRecipeTranslation | PreTranslatedContent | null {
  // 1. Static pre-translated catalogue
  if (DEFAULT_RECIPES_TRANSLATIONS[recipeId]?.[targetLang]) {
    return DEFAULT_RECIPES_TRANSLATIONS[recipeId]![targetLang]!;
  }

  // 2. Local memory cache
  const store = getStore();
  const cached = store[recipeId]?.[targetLang];
  if (cached) {
    return cached;
  }

  return null;
}

/**
 * Save translation into persistent local storage cache
 */
export function saveCachedRecipeTranslation(
  recipeId: string,
  targetLang: SupportedLanguage,
  content: {
    title: string;
    description: string;
    chefTip?: string;
    ingredients: { id: string; name: string; unit: string }[];
    instructions: string[];
  }
) {
  const store = getStore();
  if (!store[recipeId]) {
    store[recipeId] = {};
  }
  store[recipeId]![targetLang] = {
    ...content,
    updatedAt: Date.now()
  };
  saveStore(store);
}

/**
 * Resolves a Recipe into the desired language using static catalogue or local cache.
 * Preserves numbers, quantities, ratings, favorites and metadata.
 */
export function resolveRecipeForLanguage(recipe: Recipe, targetLang: SupportedLanguage): Recipe {
  if (targetLang === 'fr' && !recipe.isCustom) {
    return recipe;
  }

  const cached = getCachedRecipeTranslation(recipe.id, targetLang);
  if (!cached) {
    return recipe;
  }

  // Map ingredients keeping quantities and IDs intact
  const translatedIngredients: Ingredient[] = recipe.ingredients.map((ing, idx) => {
    const matched = cached.ingredients.find(c => c.id === ing.id) || cached.ingredients[idx];
    return {
      ...ing,
      name: matched?.name || ing.name,
      unit: matched?.unit || ing.unit
    };
  });

  return {
    ...recipe,
    title: cached.title || recipe.title,
    description: cached.description || recipe.description,
    chefTip: cached.chefTip !== undefined ? cached.chefTip : recipe.chefTip,
    ingredients: translatedIngredients,
    instructions: cached.instructions && cached.instructions.length > 0 ? cached.instructions : recipe.instructions
  };
}

/**
 * Remove cache for a recipe when updated or deleted
 */
export function invalidateRecipeCache(recipeId: string) {
  const store = getStore();
  if (store[recipeId]) {
    delete store[recipeId];
    saveStore(store);
  }
}
