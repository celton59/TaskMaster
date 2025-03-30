import React from 'react';

export function CSSBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Fondo con degradado */}
      <div 
        className="absolute inset-0 bg-gradient-to-b from-black to-blue-950"
        style={{ opacity: 0.9 }}
      />
      
      {/* Efecto de cuadrícula */}
      <div 
        className="absolute inset-0"
        style={{ 
          backgroundImage: 'linear-gradient(rgba(0, 225, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 225, 255, 0.1) 1px, transparent 1px)',
          backgroundSize: '30px 30px',
          opacity: 0.3
        }}
      />
      
      {/* Círculos luminosos con animación */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${Math.random() * 300 + 100}px`,
              height: `${Math.random() * 300 + 100}px`,
              background: `radial-gradient(circle, rgba(0, 225, 255, 0.1) 0%, rgba(0, 0, 0, 0) 70%)`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              transform: 'translate(-50%, -50%)',
              animation: `pulse-${i} ${Math.random() * 8 + 5}s infinite alternate ease-in-out`,
              opacity: 0.7
            }}
          />
        ))}
      </div>
      
      {/* Partículas fijas */}
      <div className="absolute inset-0">
        {Array.from({ length: 50 }).map((_, i) => {
          const size = Math.random() * 3 + 1;
          const color = [
            'rgba(0, 225, 255, 0.7)',  // Azul neón
            'rgba(187, 0, 255, 0.7)',  // Púrpura neón
            'rgba(255, 0, 170, 0.7)',  // Rosa neón
            'rgba(0, 255, 157, 0.7)',  // Verde neón
            'rgba(255, 234, 0, 0.7)'   // Amarillo neón
          ][Math.floor(Math.random() * 5)];
          
          return (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                width: `${size}px`,
                height: `${size}px`,
                backgroundColor: color,
                boxShadow: `0 0 10px ${color}, 0 0 20px ${color}`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.5 + 0.3,
                animation: `twinkle-${i} ${Math.random() * 5 + 3}s infinite alternate ease-in-out`
              }}
            />
          );
        })}
      </div>
      
      {/* Líneas horizontales con efecto de movimiento */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="absolute h-px w-full"
            style={{
              backgroundColor: 'rgba(0, 225, 255, 0.2)',
              boxShadow: '0 0 8px rgba(0, 225, 255, 0.5)',
              top: `${20 + i * 15}%`,
              animation: `slide-horizontal ${5 + i * 2}s infinite linear`,
              transform: i % 2 === 0 ? 'translateX(-100%)' : 'translateX(100%)'
            }}
          />
        ))}
      </div>
      
      {/* Nota: Los estilos de animación están definidos en CSS global */}
    </div>
  );
}