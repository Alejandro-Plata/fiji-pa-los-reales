import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './estilos/tokens.css';
import './estilos/base.css';
import { App } from './app/App';
import { registrarServiceWorker } from './app/pwa';

const raiz = document.getElementById('raiz');
if (!raiz) throw new Error('Falta el elemento #raiz');

createRoot(raiz).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

registrarServiceWorker();
