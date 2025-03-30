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
  color = 'var(--neon-accent)'
}) => {
  const robotColor = color;
  const glowColor = color.includes('purple') ? 'rgba(187,0,255,0.6)' : 
                    color.includes('green') ? 'rgba(0,255,157,0.6)' : 
                    color.includes('yellow') ? 'rgba(255,234,0,0.6)' : 
                    'rgba(0,225,255,0.6)';
  
  const cigaretteGlow = 'rgba(255, 100, 50, 0.7)';
  const smokeColor = 'rgba(200, 200, 200, 0.8)';
  
  return (
    <div className={`walking-robot-container ${className}`}>
      <style dangerouslySetInnerHTML={{ __html: `
        .walking-robot-container {
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          filter: drop-shadow(0 0 8px ${glowColor});
        }

        .robot-part {
          fill: ${robotColor};
          stroke: rgba(0, 0, 0, 0.5);
          stroke-width: 1.5;
          filter: drop-shadow(0 0 3px ${glowColor});
        }

        .robot-detail {
          fill: none;
          stroke: ${robotColor};
          stroke-width: 1;
          opacity: 0.9;
        }

        .robot-glow {
          fill: ${robotColor};
          opacity: 0.2;
          filter: blur(5px);
        }

        .robot-eye {
          fill: white;
          filter: drop-shadow(0 0 2px white);
          animation: eyePulse 2s infinite alternate;
        }

        @keyframes eyePulse {
          0% { opacity: 0.7; }
          100% { opacity: 1; }
        }

        .robot-joint {
          fill: rgba(50, 50, 60, 0.9);
          stroke: ${robotColor};
          stroke-width: 1;
        }

        /* Cigarette and smoke effects */
        .cigarette {
          stroke: white;
          stroke-linecap: round;
          filter: drop-shadow(0 0 2px ${cigaretteGlow});
        }

        .cigarette-tip {
          fill: #ff6a00;
          filter: drop-shadow(0 0 3px #ff6a00);
          animation: glowPulse 1.2s ease-in-out infinite alternate;
        }

        @keyframes glowPulse {
          0%   { fill: #ff4500; filter: drop-shadow(0 0 2px #ff4500); }
          100% { fill: #ff8700; filter: drop-shadow(0 0 4px #ff8700); }
        }

        .smoke {
          fill: ${smokeColor};
          opacity: 0;
          filter: blur(1px);
          animation: smokeAnimation 3s ease-out infinite;
        }

        .smoke-1 { animation-delay: 0s; }
        .smoke-2 { animation-delay: 1s; }
        .smoke-3 { animation-delay: 2s; }

        @keyframes smokeAnimation {
          0% {
            transform: translate(0, 0) scale(0.5);
            opacity: 0.8;
          }
          50% {
            opacity: 0.6;
          }
          100% {
            transform: translate(0, -25px) scale(1.5);
            opacity: 0;
          }
        }

        /* Walking animation components */
        .robot {
          animation: bodyBob 0.6s ease-in-out infinite alternate;
        }

        @keyframes bodyBob {
          0%   { transform: translateY(0); }
          100% { transform: translateY(-3px); }
        }

        #farLeg {
          transform-origin: top center;
          animation: walkFarLeg 1.2s linear infinite;
        }

        @keyframes walkFarLeg {
          0%   { transform: rotate(-20deg); }
          30%  { transform: rotate(20deg); }
          60%  { transform: rotate(10deg); }
          100% { transform: rotate(-20deg); }
        }

        #nearLeg {
          transform-origin: top center;
          animation: walkNearLeg 1.2s linear infinite;
        }

        @keyframes walkNearLeg {
          0%   { transform: rotate(20deg); }
          30%  { transform: rotate(-25deg); }
          60%  { transform: rotate(-10deg); }
          100% { transform: rotate(20deg); }
        }

        #smokingArm {
          transform-origin: 40% 27%;
          animation: armMove 3s ease-in-out infinite;
        }

        @keyframes armMove {
          0%   { transform: rotate(0deg); }
          25%  { transform: rotate(-3deg); }
          50%  { transform: rotate(0deg); }
          75%  { transform: rotate(3deg); }
          100% { transform: rotate(0deg); }
        }

        #swingArm {
          transform-origin: top center;
          animation: armSwing 1.2s linear infinite;
        }

        @keyframes armSwing {
          0%   { transform: rotate(20deg); } 
          50%  { transform: rotate(-20deg); }
          100% { transform: rotate(20deg); }
        }

        .effect-layer {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          opacity: 0.1;
          background: radial-gradient(circle at center, ${glowColor} 0%, transparent 70%);
          mix-blend-mode: screen;
          animation: effectPulse 3s infinite alternate;
        }

        @keyframes effectPulse {
          0%   { opacity: 0.05; }
          100% { opacity: 0.12; }
        }
      `}} />

      <svg width={width} height={height} viewBox="0 0 200 350">
        <defs>
          <filter id="glowFilter" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Robot - profile view */}
        <g className="robot">
          {/* Head with glow effect */}
          <ellipse className="robot-glow" cx="95" cy="80" rx="28" ry="30" />
          
          {/* Body parts */}
          <g>
            {/* Body */}
            <rect className="robot-part" x="75" y="100" width="40" height="70" rx="10" />
            
            {/* Head */}
            <rect className="robot-part" x="75" y="60" width="40" height="40" rx="15" />
            
            {/* Neck */}
            <rect className="robot-part" x="85" y="95" width="20" height="10" rx="4" />
            
            {/* Eye */}
            <circle className="robot-eye" cx="105" cy="75" r="7" />
            
            {/* Panel and details */}
            <rect className="robot-detail" x="85" y="115" width="20" height="15" rx="2" stroke={robotColor} />
            <line className="robot-detail" x1="85" y1="140" x2="105" y2="140" stroke={robotColor} />
            <line className="robot-detail" x1="85" y1="150" x2="105" y2="150" stroke={robotColor} />
          </g>
          
          {/* Swinging arm (behind) */}
          <g id="swingArm">
            <path className="robot-part" d="M85,110 Q75,125 80,150" strokeWidth="10" strokeLinecap="round" fill="none" />
            <circle className="robot-joint" cx="85" cy="110" r="4" />
          </g>
          
          {/* Legs */}
          <g id="farLeg" opacity="0.85">
            <path className="robot-part" d="M80,170 Q75,200 85,230" strokeWidth="10" strokeLinecap="round" fill="none" />
            <rect className="robot-part" x="80" y="225" width="12" height="8" rx="2" />
          </g>
          
          <g id="nearLeg">
            <path className="robot-part" d="M105,170 Q115,200 100,230" strokeWidth="12" strokeLinecap="round" fill="none" />
            <rect className="robot-part" x="95" y="225" width="15" height="10" rx="3" />
          </g>
          
          {/* Smoking arm (front) */}
          <g id="smokingArm">
            <path className="robot-part" d="M105,110 Q130,120 130,140" strokeWidth="10" strokeLinecap="round" fill="none" />
            <circle className="robot-joint" cx="105" cy="110" r="4" />
            
            {/* Cigarette */}
            <line 
              className="cigarette" 
              x1="127" y1="140" 
              x2="142" y2="135" 
              stroke="white" 
              strokeWidth="2" 
            />
            
            {/* Cigarette glow */}
            <circle className="cigarette-tip" cx="127" cy="140" r="2.5" />
            
            {/* Smoke */}
            <circle className="smoke smoke-1" cx="145" cy="134" r="3" />
            <circle className="smoke smoke-2" cx="145" cy="134" r="4" />
            <circle className="smoke smoke-3" cx="145" cy="134" r="2" />
          </g>
        </g>
        
        <div className="effect-layer"></div>
      </svg>
    </div>
  );
};

export default DancingRobot;