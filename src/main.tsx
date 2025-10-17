import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Pre-load SAFDZ data immediately on app start
import '@/services/safdzDataService';

createRoot(document.getElementById("root")!).render(<App />);
