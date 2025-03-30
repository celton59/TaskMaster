import { useEffect, useRef } from 'react';

interface MatrixSymbol {
  x: number;
  y: number;
  value: string;
  speed: number;
  opacity: number;
}

// Caracteres para usar en el efecto matrix (principalmente caracteres japoneses y símbolos de programación)
const matrixChars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン[]{}!@#$%^&*()_+=<>~?';

export function MatrixBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Ajusta el tamaño del canvas para que coincida con el viewport
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resize();
    window.addEventListener('resize', resize);
    
    // Columnas y símbolos
    const fontSize = 14;
    const columns = Math.ceil(canvas.width / fontSize);
    
    const symbols: MatrixSymbol[] = [];
    
    // Inicializa los símbolos
    for (let i = 0; i < columns; i++) {
      symbols.push({
        x: i * fontSize,
        y: Math.random() * canvas.height,
        value: matrixChars[Math.floor(Math.random() * matrixChars.length)],
        speed: 1 + Math.random() * 3,
        opacity: Math.random() * 0.5 + 0.1
      });
    }
    
    // Función para animar el efecto matrix
    const animate = () => {
      // Aplica un degradado transparente para crear el efecto de desvanecimiento
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Dibuja los símbolos
      symbols.forEach(symbol => {
        // Cambia aleatoriamente el símbolo
        if (Math.random() > 0.95) {
          symbol.value = matrixChars[Math.floor(Math.random() * matrixChars.length)];
        }
        
        // Aleatoriamente selecciona un color entre azul neón claro, verde neón o morado neón
        const colors = ['rgba(0, 225, 255, ' + symbol.opacity + ')', 
                        'rgba(0, 255, 157, ' + symbol.opacity + ')', 
                        'rgba(187, 0, 255, ' + symbol.opacity + ')'];
        
        ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
        ctx.font = fontSize + 'px monospace';
        ctx.fillText(symbol.value, symbol.x, symbol.y);
        
        // Mueve el símbolo hacia abajo
        symbol.y += symbol.speed;
        
        // Reinicia desde arriba cuando llega al fondo
        if (symbol.y > canvas.height) {
          symbol.y = 0;
          symbol.opacity = Math.random() * 0.5 + 0.1;
          symbol.speed = 1 + Math.random() * 3;
        }
      });
      
      requestAnimationFrame(animate);
    };
    
    const animationId = requestAnimationFrame(animate);
    
    // Limpia al desmontar
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, []);
  
  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 -z-20 bg-black opacity-20 pointer-events-none" 
    />
  );
}