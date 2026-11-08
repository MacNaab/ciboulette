export type RecipeCategory = 
  | 'plats' 
  | 'entrees' 
  | 'desserts' 
  | 'vegetarien' 
  | 'rapide' 
  | 'aperitifs';

export type Difficulty = 'Facile' | 'Moyen' | 'Avancé';

export interface Ingredient {
  id: string;
  name: string;
  quantity: number | null;
  unit: string;
  note?: string;
}

export interface NutritionMacros {
  calories?: number; // kcal par portion
  proteins?: number; // g de protéines par portion
  carbs?: number; // g de glucides par portion
  fats?: number; // g de lipides par portion
}

export interface Recipe {
  id: string;
  title: string;
  category: RecipeCategory;
  description: string;
  prepTime: number; // in minutes
  cookTime: number; // in minutes
  servings: number; // base number of portions
  difficulty: Difficulty;
  calories?: number; // kept for compatibility
  macros?: NutritionMacros; // detailed macros per portion
  image: string; // URL or local path to photograph
  sourceUrl?: string; // external source URL (Instagram, TikTok, blog...)
  ingredients: Ingredient[];
  instructions: string[];
  chefTip?: string;
  userRating?: number; // 1 to 5 (user's personal rating, undefined if not yet rated)
  rating?: number; // legacy compatibility
  ratingsCount?: number; // legacy compatibility
  isFavorite: boolean;
  isCustom?: boolean;
  createdAt: string;
}

export interface ShoppingItem {
  id: string;
  name: string;
  quantity: number | null;
  unit: string;
  recipeId?: string;
  recipeTitle?: string;
  checked: boolean;
  addedAt: string;
  category?: string;
}

export type SortOption = 'rating' | 'prepTime' | 'title' | 'recent';
