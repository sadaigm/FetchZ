import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { CollectionProvider } from './context/CollectionProvider';
import { initDB } from './services/sharedDB';

// Initialize the database during application startup
initDB().catch((error) => {
  console.error('Failed to initialize the database:', error);
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CollectionProvider>
      <App />
    </CollectionProvider>
  </StrictMode>,
)
