import React, { useState, useRef, useEffect } from 'react';
import { Plus, Moon, Sun, Globe, Check } from 'lucide-react';
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
  const { language, availableLanguages, t } = useLanguage();
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

  // The kit's phone sheet closes itself on any a[href] click, so every word is an anchor
  // that only carries the tab change (App scrolls to the section).
  const tabLink = (tab: 'recipes' | 'favorites' | 'shopping' | 'backup', href: string) => ({
    href,
    'aria-current': currentTab === tab ? ('page' as const) : undefined,
    onClick: (e: React.MouseEvent) => {
      e.preventDefault();
      setCurrentTab(tab);
    },
  });

  return (
    <header className="nav nav--centre">
      <div className="wrap nav__bar">
        <a className="skip-link" href="#top">{t('a11y.skip')}</a>

        <a className="nav__logo" href="#top">
          <span className="mark" data-mark="dots" aria-hidden="true"></span>
          {t('app.name')}
        </a>

        <nav className="nav__links" aria-label={t('nav.aria')}>
          <a className="nav__link" {...tabLink('recipes', '#recettes')}>
            {t('nav.recipes')}
          </a>
          <a className="nav__link" {...tabLink('favorites', '#recettes')}>
            <span className="nav__word">
              {t('nav.favorites')}
              {favoritesCount > 0 && <span className="nav__count">{favoritesCount}</span>}
            </span>
          </a>
          <a className="nav__link" {...tabLink('shopping', '#courses')}>
            <span className="nav__word">
              {t('nav.shoppingShort')}
              {uncheckedShoppingCount > 0 && <span className="nav__count">{uncheckedShoppingCount}</span>}
            </span>
          </a>
          <a className="nav__link" {...tabLink('backup', '#sauvegarde')}>
            {t('nav.backupShort')}
          </a>
        </nav>

        <div className="nav__actions">
          <div className="nav__utils">
            <div className="lang" ref={langDropdownRef}>
              <button
                type="button"
                className="icon-btn"
                onClick={() => setIsLangDropdownOpen(v => !v)}
                aria-haspopup="true"
                aria-expanded={isLangDropdownOpen}
                aria-label={t('nav.language')}
                title={t('nav.language')}
              >
                <Globe />
              </button>
              {isLangDropdownOpen && (
                <div className="lang-menu" role="menu">
                  {availableLanguages.map((option) => (
                    <button
                      key={option.code}
                      type="button"
                      role="menuitem"
                      aria-current={language === option.code ? 'true' : undefined}
                      onClick={() => handleSelectLanguage(option.code)}
                    >
                      <span>{option.name}</span>
                      {language === option.code && <Check aria-hidden="true" style={{ width: 16, height: 16 }} />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              className="icon-btn"
              onClick={toggleDarkMode}
              aria-label={isDarkMode ? t('nav.themeLight') : t('nav.themeDark')}
              title={isDarkMode ? t('nav.themeLight') : t('nav.themeDark')}
            >
              {isDarkMode ? <Sun /> : <Moon />}
            </button>
          </div>

          <button
            type="button"
            className="btn btn--primary"
            onClick={onOpenNewRecipeModal}
            aria-label={t('nav.createRecipe')}
            title={t('nav.createRecipe')}
          >
            <Plus aria-hidden="true" />
            <span className="btn-label">{t('nav.createRecipe')}</span>
          </button>
        </div>

        {/* the kit's system.js owns this button (bars/cross, aria-expanded, Escape) */}
        <button type="button" className="nav__toggle" aria-expanded="false" aria-label={t('nav.menu')}></button>
      </div>
    </header>
  );
};
