import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerServiceWorker } from './services/pwa';
import { initCookingTimer } from './services/cookingTimer';

// Resume a pending cooking timer before the first render (fires late if the tab was frozen).
initCookingTimer();
registerServiceWorker();

createRoot(document.getElementById('root')!).render(<App />);
