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
        
        @keyframes mouthChange {
          0%, 100% { d: path('M 35,48 Q 50,55 65,48'); } /* Feliz */
          33% { d: path('M 35,50 Q 50,50 65,50'); } /* Neutral */
          66% { d: path('M 35,52 Q 50,45 65,52'); } /* Triste */
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
          
          {/* Boca animada */}
          <path 
            className="robot-mouth" 
            d="M 35,48 Q 50,55 65,48" 
          />
        </g>
      </svg>
    </div>
  );
};

export default SimpleRobotHead;