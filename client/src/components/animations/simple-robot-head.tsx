import React from 'react';

interface RobotHeadProps {
  width?: number;
  height?: number;
  className?: string;
  color?: string;
}

export const SimpleRobotHead: React.FC<RobotHeadProps> = ({ 
  width = 60, 
  height = 60,
  className = '',
  color = 'var(--neon-accent)'
}) => {
  const robotColor = color;
  const glowColor = color.includes('purple') ? 'rgba(187,0,255,0.6)' : 
                    color.includes('green') ? 'rgba(0,255,157,0.6)' : 
                    color.includes('yellow') ? 'rgba(255,234,0,0.6)' : 
                    'rgba(0,225,255,0.6)';
  
  return (
    <div className={`robot-head-container ${className}`}>
      <style dangerouslySetInnerHTML={{ __html: `
        .robot-head-container {
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          filter: drop-shadow(0 0 8px ${glowColor});
        }
        
        .robot-part {
          fill: rgba(10, 10, 20, 0.95);
          stroke: ${robotColor};
          stroke-width: 2;
          filter: drop-shadow(0 0 5px ${glowColor});
        }

        .robot-eye {
          fill: white;
          filter: drop-shadow(0 0 3px white);
          animation: eyeGlow 2s infinite alternate;
        }
        
        .robot-antenna {
          fill: none;
          stroke: ${robotColor};
          stroke-width: 2;
          filter: drop-shadow(0 0 3px ${glowColor});
        }
        
        .robot-antenna-tip {
          fill: ${robotColor};
          filter: drop-shadow(0 0 4px ${glowColor});
          animation: antenna-pulse 1.5s ease-in-out infinite alternate;
        }
        
        @keyframes antenna-pulse {
          0%   { filter: drop-shadow(0 0 2px ${glowColor}); opacity: 0.7; }
          100% { filter: drop-shadow(0 0 6px ${glowColor}); opacity: 1; }
        }

        @keyframes eyeGlow {
          0%   { opacity: 0.7; }
          100% { opacity: 1; }
        }

        .robot-mouth {
          fill: none;
          stroke: ${robotColor};
          stroke-width: 2;
          stroke-linecap: round;
          opacity: 1;
          animation: mouthChange 8s infinite ease-in-out;
        }
        
        .robot-teeth {
          fill: white;
          stroke: ${robotColor};
          stroke-width: 0.5;
          animation: teethMovement 8s infinite ease-in-out;
        }
        
        .gold-tooth {
          animation: goldSparkle 3s infinite ease-in-out;
          stroke-width: 0.7;
        }
        
        .tooth-shine {
          animation: shineEffect 4s infinite ease-in-out;
          stroke: none;
        }
        
        @keyframes goldSparkle {
          0%, 100% { fill: #FFD700; filter: brightness(1); }
          50% { fill: #FFC400; filter: brightness(1.3) drop-shadow(0 0 2px gold); }
        }
        
        @keyframes shineEffect {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.3); }
        }
        
        @keyframes mouthChange {
          0%, 100% { d: path('M 35,48 Q 50,56 65,48'); } /* Sonrisa amplia */
          50% { d: path('M 35,50 Q 50,54 65,50'); } /* Sonrisa ligera */
        }
        
        @keyframes teethMovement {
          0%, 100% { opacity: 1; transform: translateY(0); } /* Dientes normales */
          50% { opacity: 0.9; transform: translateY(0) scaleY(0.9); } /* Dientes ligeramente más pequeños */
        }
        
        #head {
          transform-box: fill-box;
          transform-origin: center bottom;
          animation: headBob 4s ease-in-out infinite;
        }
        
        @keyframes headBob {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(-1px) rotate(1deg); }
          75% { transform: translateY(1px) rotate(-1deg); }
        }
      `}} />

      <svg width={width} height={height} viewBox="0 0 100 80">        
        {/* Cabeza principal */}
        <g id="head">
          {/* Base de la cabeza */}
          <rect className="robot-part" x="25" y="15" width="50" height="50" rx="10" ry="10" />
          
          {/* Antena */}
          <line className="robot-antenna" x1="50" y1="15" x2="50" y2="5" />
          <circle className="robot-antenna-tip" cx="50" cy="5" r="2" />
          
          {/* Ojos simples */}
          <circle className="robot-eye" cx="40" cy="35" r="5" />
          <circle className="robot-eye" cx="60" cy="35" r="5" />
          
          {/* Boca animada con dientes */}
          <path 
            className="robot-mouth" 
            d="M 35,48 Q 50,55 65,48" 
          />
          
          {/* Dientes mejorados */}
          <g className="robot-teeth">
            {/* Diente con brillo especial */}
            <rect x="40" y="48" width="3" height="4" />
            <rect x="45" y="48" width="3" height="4" />
            <rect x="50" y="48" width="3" height="5" /> {/* Diente central más grande */}
            <rect x="55" y="48" width="3" height="4" />
            
            {/* Diente con brillo tipo "oro" */}
            <rect x="60" y="48" width="3" height="4" fill="#FFD700" className="gold-tooth" />
            
            {/* Brillos en los dientes */}
            <circle cx="41.5" cy="49" r="0.8" fill="white" className="tooth-shine" />
            <circle cx="51.5" cy="49" r="1" fill="white" className="tooth-shine" />
          </g>
        </g>
      </svg>
    </div>
  );
};

export default SimpleRobotHead;