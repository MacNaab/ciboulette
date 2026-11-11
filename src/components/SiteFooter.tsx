import React from 'react';
import { useLanguage } from '../context/LanguageContext';

interface SiteFooterProps {
  /** open the new-recipe form (the close's primary, word for word with the nav) */
  onCreate: () => void;
  /** switch the app tab and land on its section */
  onNavigate: (tab: 'recipes' | 'favorites' | 'shopping' | 'backup') => void;
}

type Tab = 'recipes' | 'favorites' | 'shopping' | 'backup';

export const SiteFooter: React.FC<SiteFooterProps> = ({ onCreate, onNavigate }) => {
  const { t } = useLanguage();

  const link = (tab: Tab, href: string, label: string) => (
    <li key={tab}>
      <a href={href} onClick={(e) => { e.preventDefault(); onNavigate(tab); }}>
        {label}
      </a>
    </li>
  );

  return (
    <footer className="footer closing footer--statement" aria-labelledby="close-h">
      <div className="wrap">
        {/* the close: one line, the primary, and the name set across the wrap */}
        <div className="closing__cta close--word">
          <div className="section-head--split">
            <div>
              <h2 id="close-h">{t('footer.close')}</h2>
            </div>
            <button type="button" className="btn btn--primary" onClick={onCreate}>
              {t('nav.createRecipe')}
            </button>
          </div>
          <p className="close__word" aria-hidden="true">{t('app.name')}</p>
        </div>

        {/* the links: three columns, then the legal row */}
        <div className="closing__links">
          <div className="grid">
            <div className="footer__col span-4">
              <a className="footer__mark" href="#top">
                <span className="mark" data-mark="dots" aria-hidden="true"></span>
                {t('app.name')}
              </a>
              <p className="footer__lede">{t('app.tagline')}</p>
            </div>
            <div className="footer__col span-4">
              <h4>{t('footer.links')}</h4>
              <ul>
                {link('recipes', '#recettes', t('nav.recipes'))}
                {link('favorites', '#recettes', t('nav.favorites'))}
                {link('shopping', '#courses', t('nav.shoppingShort'))}
                {link('backup', '#sauvegarde', t('nav.backupShort'))}
              </ul>
            </div>
            <div className="footer__col span-4">
              <h4>{t('footer.offline')}</h4>
              <p>{t('footer.offlineDesc')}</p>
            </div>
          </div>
          <div className="footer__legal">
            <span>&copy; 2026 {t('app.name')}</span>
            <span>{t('app.privacy')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
