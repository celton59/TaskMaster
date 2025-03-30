import { useEffect, useRef } from 'react';

export function ParticleBackground() {
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
    
    // Partículas
    const particles: {
      x: number;
      y: number;
      size: number;
      color: string;
      speedX: number;
      speedY: number;
    }[] = [];
    
    // Colores neón
    const neonColors = [
      '#00e1ff', // Azul neón
      '#bb00ff', // Púrpura neón
      '#ff00aa', // Rosa neón
      '#00ff9d', // Verde neón
      '#ffea00'  // Amarillo neón
    ];
    
    // Inicializar partículas
    for (let i = 0; i < 100; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 1,
        color: neonColors[Math.floor(Math.random() * neonColors.length)],
        speedX: Math.random() * 1 - 0.5,
        speedY: Math.random() * 1 - 0.5
      });
    }
    
    // Variables para tracking del cursor
    let mouseX = 0;
    let mouseY = 0;
    let mouseRadius = 150;
    
    // Listener para detectar movimiento del cursor
    window.addEventListener('mousemove', (event) => {
      mouseX = event.x;
      mouseY = event.y;
    });
    
    // Función para animar las partículas
    const animate = () => {
      // Limpia el canvas con transparencia para crear efecto de "trail"
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Actualiza y dibuja cada partícula
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        
        // Mover partículas
        p.x += p.speedX;
        p.y += p.speedY;
        
        // Efecto de "atracción" hacia el cursor
        const dx = mouseX - p.x;
        const dy = mouseY - p.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < mouseRadius) {
          const forceDirectionX = dx / distance;
          const forceDirectionY = dy / distance;
          const force = (mouseRadius - distance) / mouseRadius;
          
          p.speedX += forceDirectionX * force * 0.3;
          p.speedY += forceDirectionY * force * 0.3;
        }
        
        // Limitar velocidad
        p.speedX = Math.min(1.5, Math.max(-1.5, p.speedX));
        p.speedY = Math.min(1.5, Math.max(-1.5, p.speedY));
        
        // Rebote en los bordes
        if (p.x < 0 || p.x > canvas.width) {
          p.speedX *= -1;
        }
        
        if (p.y < 0 || p.y > canvas.height) {
          p.speedY *= -1;
        }
        
        // Dibujar partícula
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
        
        // Conectar partículas cercanas
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 100) {
            ctx.beginPath();
            ctx.strokeStyle = p.color;
            ctx.globalAlpha = 1 - distance / 100;
            ctx.lineWidth = 0.5;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
            ctx.globalAlpha = 1;
          }
        }
      }
      
      requestAnimationFrame(animate);
    };
    
    animate();
    
    // Limpiar
    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', () => {});
    };
  }, []);
  
  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 -z-10 bg-transparent pointer-events-none"
      style={{ opacity: 0.6 }}
    />
  );
}