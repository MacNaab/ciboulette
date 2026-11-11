import React, { useState, useEffect } from 'react';
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
import { TimerToast } from './components/TimerToast';
import { SiteFooter } from './components/SiteFooter';
import { Recipe } from './types/recipe';
import { Plus, CookingPot } from 'lucide-react';
import { initKit, refreshKit } from './kit';

type Tab = 'recipes' | 'favorites' | 'shopping' | 'backup';

const SECTION_ID: Record<Tab, string> = {
  recipes: 'recettes',
  favorites: 'recettes',
  shopping: 'courses',
  backup: 'sauvegarde',
};

function AppContent() {
  const { filteredRecipes, displayedRecipes, setOnlyFavorites, translationProgress } = useRecipes();
  const { t } = useLanguage();

  // Navigation tab: 'recipes' | 'favorites' | 'shopping' | 'backup'
  const [currentTab, setCurrentTab] = useState<Tab>('recipes');

  // Modals state
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  const selectedRecipe = displayedRecipes.find((r) => r.id === selectedRecipeId) || null;
  const [isNewRecipeModalOpen, setIsNewRecipeModalOpen] = useState(false);
  const [recipeToEdit, setRecipeToEdit] = useState<Recipe | null>(null);

  // The design kit's scripts (public/assets) load once React has committed, then re-measure
  // whenever the page's shape changes (a tab swaps its section in and out of the DOM).
  useEffect(() => {
    initKit();
  }, []);
  useEffect(() => {
    refreshKit();
  }, [currentTab]);

  const handleOpenNewRecipe = () => {
    setRecipeToEdit(null);
    setIsNewRecipeModalOpen(true);
  };

  const handleEditRecipe = (recipe: Recipe) => {
    setRecipeToEdit(recipe);
    setIsNewRecipeModalOpen(true);
  };

  const handleTabChange = (tab: Tab) => {
    setCurrentTab(tab);
    if (tab === 'favorites') {
      setOnlyFavorites(true);
    } else if (tab === 'recipes') {
      setOnlyFavorites(false);
    }
    // land on the tab's section once React has committed it (sections are one screen each);
    // smooth in JS on purpose: CSS scroll-behavior would also smooth the Tab key's focus
    // scroll (which must land at once), and JS smooth ignores the reduced-motion CSS guard
    window.setTimeout(() => {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      document.getElementById(SECTION_ID[tab])?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    }, 0);
  };

  // Every section stays on the page (the nav and the footer link to them by anchor);
  // the tabs move focus and filters, they do not swap the sections in and out.
  const featured = displayedRecipes.slice(0, 3);
  // one screen holds three cards; more than one row asks for the two-screen section
  const recipesScreenCount = filteredRecipes.length > 3 ? 2 : 1;
  return (
    <>
      <Header
        currentTab={currentTab}
        setCurrentTab={handleTabChange}
        onOpenNewRecipeModal={handleOpenNewRecipe}
      />

      <main id="top">
        {/* Hero: one screen, the product window rising out of its lit frame */}
        <section className="hero hero--centred" data-enter aria-labelledby="hero-h">
          <div className="wrap">
            <div className="hero-text">
              <div className="hero__c">
                <a
                  className="pill"
                  href={SECTION_ID[currentTab === 'favorites' ? 'favorites' : 'recipes']}
                  onClick={(e) => {
                    e.preventDefault();
                    handleTabChange(currentTab === 'favorites' ? 'favorites' : 'recipes');
                  }}
                >
                  <span>
                    {currentTab === 'favorites' ? t('hero.badge.favorites') : t('hero.badge.recipes')}
                  </span>
                </a>
                <h1 id="hero-h">
                  {currentTab === 'favorites' ? t('hero.h1.favorites') : t('hero.h1.recipes')}
                </h1>
                <p className="hero__lead">{t('hero.desc')}</p>
                <p className="hero__fact">{t('hero.fact')}</p>
                <div className="btn-row">
                  <button type="button" className="btn btn--primary" onClick={handleOpenNewRecipe}>
                    {t('nav.createRecipe')}
                  </button>
                  <a
                    className="btn btn--secondary"
                    href="#recettes"
                    onClick={(e) => {
                      e.preventDefault();
                      handleTabChange('recipes');
                    }}
                  >
                    {t('hero.cta.browse')}
                  </a>
                </div>
              </div>

              <div className="hero__window">
                <div className="ly-piece ui ui-panel app-win">
                  <div className="app-win__bar">
                    <span className="ui-dots" aria-hidden="true"><i></i><i></i><i></i></span>
                    <b>{t('app.name')}</b>
                    <span className="ui-spacer"></span>
                    <span className="app-chip"><i aria-hidden="true"></i>{t('hero.window.offline')}</span>
                  </div>
                  <div className="app-win__body">
                    <SearchBar variant="input" onSubmit={() => handleTabChange('recipes')} />
                    <div className="app-win__tiles">
                      {featured.map((recipe) => (
                        <button
                          key={recipe.id}
                          type="button"
                          className="app-tile"
                          onClick={() => setSelectedRecipeId(recipe.id)}
                        >
                          <b>{recipe.title}</b>
                          <span>
                            {recipe.prepTime + recipe.cookTime} min · {t('nav.recipes')}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Recettes / Favoris: on the page at every width, growing with its content,
            iris opening on scroll */}
        <section
          id="recettes"
          className="section ground-surface sec-tall"
          style={{ '--h': recipesScreenCount } as React.CSSProperties}
          data-screen="free"
          data-moment="iris-opens"
          data-moment-opts={'{"from": "base"}'}
          aria-labelledby="recettes-h"
        >
          <div className="wrap">
            <div className="section-head section-head--split">
              <div>
                <h2 id="recettes-h">
                  {currentTab === 'favorites' ? t('section.favorites') : t('section.recipes')}
                </h2>
              </div>
              <SearchBar variant="input" />
            </div>

            <CategoryNav />

            {/* the chips and the count under the nav, at the container's full width:
                they read as the list's own controls, and the head keeps its one line */}
            <div className="pt-4">
              <SearchBar variant="filters" />
            </div>

            <div className="sec-pane">
              {filteredRecipes.length === 0 ? (
                <div className="empty-state">
                  <CookingPot aria-hidden="true" style={{ width: 40, height: 40 }} />
                  <h3>{t('search.noResultsTitle')}</h3>
                  <p>{t('search.noResultsDesc')}</p>
                  <button type="button" className="btn btn--primary btn--sm" onClick={handleOpenNewRecipe}>
                    <Plus aria-hidden="true" />
                    {t('nav.createRecipe')}
                  </button>
                </div>
              ) : (
                <div className="grid recipe-grid">
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
          </div>
        </section>

        {/* Courses: one screen on the inverse ground, the list grows with its content */}
        <section
          id="courses"
          className="section ground-inverse sec-tall"
          style={{ '--h': 1 } as React.CSSProperties}
          data-screen="free"
          aria-labelledby="courses-h"
        >
          <div className="wrap">
            <ShoppingListView onGoToRecipes={() => handleTabChange('recipes')} />
          </div>
        </section>

        {/* Sauvegarde & Import: one screen on the page ground */}
        <section
          id="sauvegarde"
          className="section sec-tall"
          style={{ '--h': 1 } as React.CSSProperties}
          data-screen="free"
          aria-labelledby="sauvegarde-h"
        >
          <div className="wrap">
            <BackupImportModal />
          </div>
        </section>
      </main>

      <SiteFooter onCreate={handleOpenNewRecipe} onNavigate={handleTabChange} />

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

      {/* Cooking timer finished (in-app alert) */}
      <TimerToast />
    </>
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
