import React from 'react';

interface DancingRobotProps {
  width?: number;
  height?: number;
  className?: string;
  color?: string;
}

export const DancingRobot: React.FC<DancingRobotProps> = ({ 
  width = 120, 
  height = 180,
  className = '',
  color
}) => {
  return (
    <div className={`dancing-robot-container ${className}`}>
      <style dangerouslySetInnerHTML={{ __html: `
        .dancing-robot-container {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .robot-part {
          fill: ${color || 'var(--neon-accent)'};
          stroke: rgba(0, 0, 0, 0.7);
          stroke-width: 2;
        }
        
        #head {
          transform-origin: center bottom;
          animation: headNod 1.5s ease-in-out infinite alternate;
        }
        
        @keyframes headNod {
          0%   { transform: rotate(15deg); }
          50%  { transform: rotate(0deg); }
          100% { transform: rotate(-15deg); }
        }
        
        #leftArm {
          transform-origin: top right;
          animation: leftArmSwing 1s ease-in-out infinite alternate;
        }
        
        @keyframes leftArmSwing {
          0%   { transform: rotate(30deg); }
          100% { transform: rotate(-20deg); }
        }
        
        #rightArm {
          transform-origin: top left;
          animation: rightArmSwing 1s ease-in-out infinite alternate;
        }
        
        @keyframes rightArmSwing {
          0%   { transform: rotate(-30deg); }
          100% { transform: rotate(20deg); }
        }
        
        #leftLeg {
          transform-origin: top center;
          animation: leftLegSwing 1s ease-in-out infinite alternate;
        }
        
        @keyframes leftLegSwing {
          0%   { transform: rotate(10deg); }
          100% { transform: rotate(-10deg); }
        }
        
        #rightLeg {
          transform-origin: top center;
          animation: rightLegSwing 1s ease-in-out infinite alternate;
        }
        
        @keyframes rightLegSwing {
          0%   { transform: rotate(-10deg); }
          100% { transform: rotate(10deg); }
        }
      `}} />

      <svg width={width} height={height} viewBox="0 0 200 300">
        {/* Cuerpo del robot */}
        <rect id="body" className="robot-part" x="60" y="100" width="80" height="100" rx="10" ry="10" />
        
        {/* Cabeza del robot */}
        <rect id="head" className="robot-part" x="70" y="40" width="60" height="60" rx="10" ry="10" />
        
        {/* Ojos */}
        <circle cx="85" cy="70" r="5" fill="#000" />
        <circle cx="115" cy="70" r="5" fill="#000" />
        
        {/* Brazo izquierdo */}
        <rect id="leftArm" className="robot-part" x="40" y="110" width="15" height="60" rx="5" ry="5" />
        
        {/* Brazo derecho */}
        <rect id="rightArm" className="robot-part" x="145" y="110" width="15" height="60" rx="5" ry="5" />
        
        {/* Pierna izquierda */}
        <rect id="leftLeg" className="robot-part" x="75" y="200" width="20" height="60" rx="5" ry="5" />
        
        {/* Pierna derecha */}
        <rect id="rightLeg" className="robot-part" x="105" y="200" width="20" height="60" rx="5" ry="5" />
      </svg>
    </div>
  );
};

export default DancingRobot;