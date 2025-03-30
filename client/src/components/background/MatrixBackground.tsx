import { useEffect, useRef } from 'react';

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
    
    // Caracteres para usar en el efecto matrix (principalmente caracteres japoneses y símbolos de programación)
    const matrixChars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン[]{}!@#$%^&*()_+=<>~?';
    
    // Columnas y símbolos
    const fontSize = 16;
    const columns = Math.ceil(canvas.width / fontSize);
    
    // Posición Y de cada columna
    const drops: number[] = [];
    for (let i = 0; i < columns; i++) {
      drops[i] = Math.random() * -50; // Empiezan fuera de la pantalla para una entrada gradual
    }
    
    // Colores neón
    const neonColors = [
      'rgba(0, 225, 255, 0.7)', // Azul neón
      'rgba(0, 255, 157, 0.7)', // Verde neón
      'rgba(187, 0, 255, 0.7)'  // Morado neón
    ];
    
    // Color para cada columna
    const columnColors: string[] = [];
    for (let i = 0; i < columns; i++) {
      columnColors[i] = neonColors[Math.floor(Math.random() * neonColors.length)];
    }
    
    // Función para animar el efecto matrix
    const animate = () => {
      // Aplica un degradado transparente para crear el efecto de desvanecimiento
      ctx.fillStyle = 'rgba(0, 0, 0, 0.06)'; // Más transparente = rastro más largo
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Dibuja los símbolos
      for (let i = 0; i < drops.length; i++) {
        // Selecciona un carácter aleatorio
        const text = matrixChars[Math.floor(Math.random() * matrixChars.length)];
        
        // Selecciona el color para esta columna
        ctx.fillStyle = columnColors[i];
        ctx.font = fontSize + 'px monospace';
        ctx.shadowBlur = 10;
        ctx.shadowColor = columnColors[i];
        
        // Dibuja el caracter
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        
        // Mueve el caracter hacia abajo
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0; // Reinicia desde arriba
          // Cambia ocasionalmente el color de la columna
          if (Math.random() > 0.9) {
            columnColors[i] = neonColors[Math.floor(Math.random() * neonColors.length)];
          }
        }
        
        drops[i]++;
      }
      
      ctx.shadowBlur = 0; // Resetea el efecto de sombra para el próximo frame
      
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
      className="fixed inset-0 -z-20 bg-black opacity-30 pointer-events-none" 
    />
  );
}