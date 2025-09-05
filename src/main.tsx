import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Import test utilities for development
if (import.meta.env.DEV) {
  import('./utils/testBoundaries');
}

createRoot(document.getElementById("root")!).render(<App />);
