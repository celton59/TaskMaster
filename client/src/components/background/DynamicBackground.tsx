import { useState, useEffect } from 'react';
import { SimpleDivBackground } from './SimpleDivBackground';

export function DynamicBackground() {
  // Empezamos con el fondo visible (true)
  const [isVisible, setIsVisible] = useState(true);

  // Efecto para alternar entre mostrar y ocultar el fondo cada 2 segundos
  // Esto es para asegurarnos de que el usuario pueda ver intermitentemente el fondo
  useEffect(() => {
    // Solo para probar - se puede eliminar luego
    const intervalId = setInterval(() => {
      setIsVisible(prev => !prev);
    }, 5000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <>
      {/* Fondo básico con divs - debería funcionar en cualquier navegador */}
      {isVisible && <SimpleDivBackground />}
    </>
  );
}