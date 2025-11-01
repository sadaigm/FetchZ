import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { CollectionProvider } from './context/CollectionProvider';
import { ThemeProvider } from './context/ThemeProvider';
import { initDB } from './services/database';

// Initialize the database during application startup
initDB().catch((error) => {
  console.error('Failed to initialize the database:', error);
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <CollectionProvider>
        <App />
      </CollectionProvider>
    </ThemeProvider>
  </StrictMode>,
)
