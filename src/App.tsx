import React, { useState } from 'react';
import { RecipeProvider, useRecipes } from './context/RecipeContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { CategoryNav } from './components/CategoryNav';
import { RecipeCard } from './components/RecipeCard';
import { RecipeDetailModal } from './components/RecipeDetailModal';
import { RecipeFormModal } from './components/RecipeFormModal';
import { ShoppingListView } from './components/ShoppingListView';
import { BackupImportModal } from './components/BackupImportModal';
import { TranslationProgressModal } from './components/TranslationProgressModal';
import { Recipe } from './types/recipe';
import { Plus, CookingPot } from 'lucide-react';

function AppContent() {
  const { filteredRecipes, displayedRecipes, setOnlyFavorites, translationProgress } = useRecipes();
  const { t } = useLanguage();

  // Navigation tab: 'recipes' | 'favorites' | 'shopping' | 'backup'
  const [currentTab, setCurrentTab] = useState<'recipes' | 'favorites' | 'shopping' | 'backup'>('recipes');

  // Modals state
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  const selectedRecipe = displayedRecipes.find((r) => r.id === selectedRecipeId) || null;
  const [isNewRecipeModalOpen, setIsNewRecipeModalOpen] = useState(false);
  const [recipeToEdit, setRecipeToEdit] = useState<Recipe | null>(null);

  const handleOpenNewRecipe = () => {
    setRecipeToEdit(null);
    setIsNewRecipeModalOpen(true);
  };

  const handleEditRecipe = (recipe: Recipe) => {
    setRecipeToEdit(recipe);
    setIsNewRecipeModalOpen(true);
  };

  const handleTabChange = (tab: 'recipes' | 'favorites' | 'shopping' | 'backup') => {
    setCurrentTab(tab);
    if (tab === 'favorites') {
      setOnlyFavorites(true);
    } else if (tab === 'recipes') {
      setOnlyFavorites(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex flex-col transition-colors selection:bg-emerald-800 selection:text-white">
      {/* Top Bar Contract Navigation */}
      <Header
        currentTab={currentTab}
        setCurrentTab={handleTabChange}
        onOpenNewRecipeModal={handleOpenNewRecipe}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Tab 1 & Tab 2: Recettes & Favoris View */}
        {(currentTab === 'recipes' || currentTab === 'favorites') && (
          <div className="space-y-6">
            
            {/* Editorial Headline & Search Module */}
            <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 border border-stone-200/80 dark:border-stone-800 shadow-2xs space-y-6">
              <div className="max-w-2xl">
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 mb-1.5 block">
                  {currentTab === 'favorites' ? t('hero.badge.favorites') : t('hero.badge.recipes')}
                </span>
                <h1 className="font-serif-display text-2xl sm:text-4xl font-bold tracking-tight text-stone-900 dark:text-stone-100 text-balance">
                  {currentTab === 'favorites'
                    ? t('hero.title.favorites')
                    : t('hero.title.recipes')}
                </h1>
                <p className="mt-2 text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                  {t('hero.desc')}
                </p>
              </div>

              {/* Intuitive Ingredient Search Bar */}
              <SearchBar />

              {/* Categories & Sorting Bar */}
              <CategoryNav />
            </div>

            {/* Recipes Grid */}
            {filteredRecipes.length === 0 ? (
              <div className="p-12 text-center bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 space-y-4">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-400">
                  <CookingPot className="w-8 h-8" />
                </div>
                <div className="max-w-md mx-auto">
                  <h3 className="font-serif-display text-xl font-bold text-stone-900 dark:text-stone-100 mb-1">
                    {t('search.noResultsTitle')}
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400">
                    {t('search.noResultsDesc')}
                  </p>
                </div>
                <button
                  onClick={() => setIsNewRecipeModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-800 text-white hover:bg-emerald-700 transition-colors shadow-2xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t('nav.createRecipe')}</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRecipes.map((recipe) => (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    onSelect={(r) => setSelectedRecipeId(r.id)}
                    onEdit={handleEditRecipe}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Shopping List View */}
        {currentTab === 'shopping' && (
          <ShoppingListView onGoToRecipes={() => handleTabChange('recipes')} />
        )}

        {/* Tab 4: Backup & Import View */}
        {currentTab === 'backup' && <BackupImportModal />}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-stone-200 dark:border-stone-800 py-6 bg-white/50 dark:bg-stone-900/50 text-xs text-stone-500 dark:text-stone-400 text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-serif-display font-bold text-stone-900 dark:text-stone-100">{t('app.name')}</span>
            <span aria-hidden="true">·</span>
            <span>{t('app.tagline')}</span>
          </div>
          <span>{t('app.privacy')}</span>
        </div>
      </footer>

      {/* Recipe Detail Modal */}
      <RecipeDetailModal
        recipe={selectedRecipe}
        onClose={() => setSelectedRecipeId(null)}
        onEdit={handleEditRecipe}
      />

      {/* New or Edit Recipe Form Modal */}
      <RecipeFormModal
        isOpen={isNewRecipeModalOpen}
        initialRecipe={recipeToEdit}
        onClose={() => {
          setIsNewRecipeModalOpen(false);
          setRecipeToEdit(null);
        }}
        onSuccess={(savedRecipe) => {
          setSelectedRecipeId(savedRecipe.id);
          setIsNewRecipeModalOpen(false);
          setRecipeToEdit(null);
        }}
      />

      {/* Translation Progress Modal */}
      <TranslationProgressModal progress={translationProgress} />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <RecipeProvider>
        <AppContent />
      </RecipeProvider>
    </LanguageProvider>
  );
}
