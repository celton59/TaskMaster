import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Inicializar el tema en función de la preferencia guardada o usar el tema del sistema
const initTheme = () => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark' || savedTheme === 'light') {
    document.documentElement.classList.add(`${savedTheme}-theme`);
  } else {
    // Si no hay tema guardado, usar preferencias del sistema
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.classList.add(prefersDark ? 'dark-theme' : 'light-theme');
    localStorage.setItem('theme', prefersDark ? 'dark' : 'light');
  }
};

// Inicializar el tema antes de renderizar la aplicación
initTheme();

createRoot(document.getElementById("root")!).render(<App />);
