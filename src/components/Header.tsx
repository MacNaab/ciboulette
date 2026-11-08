import React, { useState, useRef, useEffect } from 'react';
import { ChefHat, ShoppingCart, Plus, Moon, Sun, Heart, FolderDown, Globe, Check, ChevronDown } from 'lucide-react';
import { useRecipes } from '../context/RecipeContext';
import { useLanguage } from '../context/LanguageContext';
import { SupportedLanguage } from '../types/i18n';

interface HeaderProps {
  currentTab: 'recipes' | 'favorites' | 'shopping' | 'backup';
  setCurrentTab: (tab: 'recipes' | 'favorites' | 'shopping' | 'backup') => void;
  onOpenNewRecipeModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  onOpenNewRecipeModal,
}) => {
  const { shoppingList, recipes, isDarkMode, toggleDarkMode, changeLanguageWithAutoTranslate } = useRecipes();
  const { language, availableLanguages, currentLanguageOption, t } = useLanguage();
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const langDropdownRef = useRef<HTMLDivElement>(null);

  const uncheckedShoppingCount = shoppingList.filter(item => !item.checked).length;
  const favoritesCount = recipes.filter(r => r.isFavorite).length;

  // Close language dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target as Node)) {
        setIsLangDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectLanguage = (code: SupportedLanguage) => {
    setIsLangDropdownOpen(false);
    changeLanguageWithAutoTranslate(code);
  };

  return (
    <header className="sticky top-0 z-30 bg-stone-50/90 dark:bg-stone-900/90 backdrop-blur-md border-b border-stone-200/80 dark:border-stone-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4 sm:gap-6">
        
        {/* Zone 1: Wordmark */}
        <button
          onClick={() => setCurrentTab('recipes')}
          className="flex items-center gap-2.5 text-left group focus-visible:outline-none shrink-0"
        >
          <div className="w-9 h-9 rounded-lg bg-emerald-800 text-stone-100 flex items-center justify-center shadow-xs transition-transform group-hover:scale-105">
            <ChefHat className="w-5 h-5 text-emerald-100" />
          </div>
          <div className="flex flex-col">
            <span className="font-serif-display text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100 whitespace-nowrap">
              {t('app.name')}
            </span>
          </div>
        </button>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-7 text-sm font-medium">
          <button
            onClick={() => setCurrentTab('recipes')}
            className={`whitespace-nowrap pb-1 transition-colors relative ${
              currentTab === 'recipes'
                ? 'text-emerald-800 dark:text-emerald-400 font-semibold'
                : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100'
            }`}
          >
            {t('nav.recipes')}
            {currentTab === 'recipes' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-800 dark:bg-emerald-400 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setCurrentTab('favorites')}
            className={`whitespace-nowrap pb-1 transition-colors relative flex items-center gap-1.5 ${
              currentTab === 'favorites'
                ? 'text-emerald-800 dark:text-emerald-400 font-semibold'
                : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>{t('nav.favorites')} ({favoritesCount})</span>
            {currentTab === 'favorites' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-800 dark:bg-emerald-400 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setCurrentTab('shopping')}
            className={`whitespace-nowrap pb-1 transition-colors relative flex items-center gap-1.5 ${
              currentTab === 'shopping'
                ? 'text-emerald-800 dark:text-emerald-400 font-semibold'
                : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>{t('nav.shopping')}</span>
            {uncheckedShoppingCount > 0 && (
              <span className="font-mono text-xs px-1.5 py-0.2 bg-emerald-800 text-stone-100 dark:bg-emerald-700 rounded-full">
                {uncheckedShoppingCount}
              </span>
            )}
            {currentTab === 'shopping' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-800 dark:bg-emerald-400 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setCurrentTab('backup')}
            className={`whitespace-nowrap pb-1 transition-colors relative flex items-center gap-1.5 ${
              currentTab === 'backup'
                ? 'text-emerald-800 dark:text-emerald-400 font-semibold'
                : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100'
            }`}
          >
            <FolderDown className="w-4 h-4" />
            <span>{t('nav.backup')}</span>
            {currentTab === 'backup' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-800 dark:bg-emerald-400 rounded-full" />
            )}
          </button>
        </nav>

        {/* Zone 3: Actions (Language switcher + Theme switch + New Recipe button) */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          
          {/* Multilingual Selector */}
          <div className="relative" ref={langDropdownRef}>
            <button
              type="button"
              onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg text-stone-700 dark:text-stone-200 bg-stone-100/80 dark:bg-stone-800/80 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors border border-stone-200/80 dark:border-stone-700 shadow-2xs cursor-pointer focus-visible:outline-none"
              title={t('nav.language')}
              aria-label={t('nav.language')}
              aria-expanded={isLangDropdownOpen}
            >
              <span className="text-sm leading-none" role="img" aria-hidden="true">
                {currentLanguageOption.flag}
              </span>
              <span className="font-semibold uppercase tracking-wider text-[11px]">
                {currentLanguageOption.code}
              </span>
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>

            {isLangDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-36 bg-white dark:bg-stone-900 rounded-xl shadow-lg border border-stone-200 dark:border-stone-800 py-1.5 z-50 animate-in fade-in zoom-in-95">
                <div className="px-3 py-1 text-[10px] font-semibold text-stone-400 uppercase tracking-wider">
                  {t('nav.language')}
                </div>
                {availableLanguages.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => handleSelectLanguage(lang.code)}
                    className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between transition-colors cursor-pointer ${
                      language === lang.code
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-semibold'
                        : 'text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-sm">{lang.flag}</span>
                      <span>{lang.nativeName}</span>
                    </span>
                    {language === lang.code && <Check className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Dark Mode toggle */}
          <button
            onClick={toggleDarkMode}
            title={isDarkMode ? t('nav.themeLight') : t('nav.themeDark')}
            className="p-2 text-stone-600 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-800 rounded-lg transition-colors focus-visible:outline-none cursor-pointer"
            aria-label={isDarkMode ? t('nav.themeLight') : t('nav.themeDark')}
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* New Recipe button */}
          <button
            onClick={onOpenNewRecipeModal}
            className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 rounded-lg shadow-xs transition-colors whitespace-nowrap focus-visible:outline-none cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">{t('nav.createRecipe')}</span>
            <span className="sm:hidden">{t('card.edit') === 'Modifier' ? 'Créer' : t('card.edit') === 'Edit' ? 'New' : 'Crear'}</span>
          </button>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="flex md:hidden items-center justify-around px-2 py-2 border-t border-stone-200/70 dark:border-stone-800 text-xs font-medium text-stone-600 dark:text-stone-300 bg-stone-100/60 dark:bg-stone-950/60">
        <button
          onClick={() => setCurrentTab('recipes')}
          className={`py-1 px-2.5 rounded-md transition-colors ${
            currentTab === 'recipes' ? 'bg-stone-200 dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-semibold' : ''
          }`}
        >
          {t('nav.recipes')}
        </button>
        <button
          onClick={() => setCurrentTab('favorites')}
          className={`py-1 px-2.5 rounded-md transition-colors flex items-center gap-1 ${
            currentTab === 'favorites' ? 'bg-stone-200 dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-semibold' : ''
          }`}
        >
          <Heart className="w-3.5 h-3.5" />
          <span>{t('nav.favorites')} ({favoritesCount})</span>
        </button>
        <button
          onClick={() => setCurrentTab('shopping')}
          className={`py-1 px-2.5 rounded-md transition-colors flex items-center gap-1 ${
            currentTab === 'shopping' ? 'bg-stone-200 dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-semibold' : ''
          }`}
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          <span>{t('nav.shopping')} {uncheckedShoppingCount > 0 && `(${uncheckedShoppingCount})`}</span>
        </button>
        <button
          onClick={() => setCurrentTab('backup')}
          className={`py-1 px-2.5 rounded-md transition-colors ${
            currentTab === 'backup' ? 'bg-stone-200 dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-semibold' : ''
          }`}
        >
          {t('nav.backup')}
        </button>
      </div>
    </header>
  );
};
