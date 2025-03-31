import { useEffect, useRef } from "react";
import gsap from "gsap";

export function RobotAnimation() {
  const robotRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!robotRef.current) return;

    // --- Definir Orígenes de Transformación ---
    gsap.set("#robot", { transformOrigin: "center bottom" }); 
    gsap.set("#cabeza", { transformOrigin: "50% 100%" });
    gsap.set("#torso", { transformOrigin: "center 80%" });
    gsap.set("#brazo_derecho, #brazo_izquierdo", { transformOrigin: "50% 0%" });
    gsap.set("#antebrazo_der, #antebrazo_izq", { transformOrigin: "50% 0%" });
    gsap.set("#pierna_derecha, #pierna_izquierda", { transformOrigin: "50% 0%" });
    gsap.set("#pierna_inf_der, #pierna_inf_izq", { transformOrigin: "50% 0%" });
    gsap.set(["#humo1", "#humo2", "#humo3"], { opacity: 0, scale: 0 });
    gsap.set("#ojo", { transformOrigin: "center center" });
    gsap.set("#antena_luz", { transformOrigin: "center center" });

    // --- Timeline principal ---
    const tl = gsap.timeline({
      repeat: -1,
      defaults: { ease: "power1.inOut" }
    });

    // --- Efectos especiales ---
    
    // Parpadeo del ojo
    gsap.to("#ojo", {
      scaleY: 0.2,
      duration: 0.1,
      repeat: -1,
      repeatDelay: 3.5,
      yoyo: true,
      ease: "power4.out"
    });
    
    // Luz de antena
    gsap.to("#antena_luz", {
      opacity: 0.6,
      scale: 1.3,
      duration: 0.8,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });

    const stepDuration = 0.75;

    // Paso 1: Pierna Derecha Adelante
    tl.to("#robot", { 
        y: "+=3", 
        x: "+=2",
        duration: stepDuration / 2, 
        yoyo: true, 
        repeat: 1
      }, 0)
      .to("#torso", { 
        rotation: -5,
        duration: stepDuration
      }, 0)
      .to("#cabeza", {
        rotation: 3,
        duration: stepDuration / 2,
        yoyo: true,
        repeat: 1
      }, 0)
      .to("#pierna_derecha", { rotation: 22, duration: stepDuration }, 0)
      .to("#pierna_inf_der", { rotation: 8, duration: stepDuration }, 0)
      .to("#pierna_izquierda", { rotation: -22, duration: stepDuration }, 0)
      .to("#pierna_inf_izq", { rotation: 30, duration: stepDuration }, 0)
      .to("#brazo_derecho", { rotation: -28, duration: stepDuration }, 0)
      .to("#antebrazo_der", { rotation: 15, duration: stepDuration }, 0)
      .to("#brazo_izquierdo", { rotation: 28, duration: stepDuration }, 0)
      .to("#antebrazo_izq", { rotation: 8, duration: stepDuration }, 0);

    // Paso 2: Pierna Izquierda Adelante
    tl.to("#robot", { 
        y: "+=3", 
        x: "-=2",
        duration: stepDuration / 2, 
        yoyo: true, 
        repeat: 1
      }, stepDuration)
      .to("#torso", { 
        rotation: 5,
        duration: stepDuration
      }, stepDuration)
      .to("#cabeza", {
        rotation: -3,
        duration: stepDuration / 2,
        yoyo: true,
        repeat: 1
      }, stepDuration)
      .to("#pierna_derecha", { rotation: -22, duration: stepDuration }, stepDuration)
      .to("#pierna_inf_der", { rotation: 30, duration: stepDuration }, stepDuration)
      .to("#pierna_izquierda", { rotation: 22, duration: stepDuration }, stepDuration)
      .to("#pierna_inf_izq", { rotation: 8, duration: stepDuration }, stepDuration)
      .to("#brazo_derecho", { rotation: 28, duration: stepDuration }, stepDuration)
      .to("#antebrazo_der", { rotation: 8, duration: stepDuration }, stepDuration)
      .to("#brazo_izquierdo", { rotation: -28, duration: stepDuration }, stepDuration)
      .to("#antebrazo_izq", { rotation: 15, duration: stepDuration }, stepDuration);

    // --- Animación de Fumar ---
    const smokeStartTime = stepDuration * 3;

    tl.addLabel("startSmoking", smokeStartTime)
      .to("#brazo_derecho", {
        rotation: -80,
        duration: stepDuration * 0.6
      }, "startSmoking")
      .to("#antebrazo_der", {
        rotation: 95,
        duration: stepDuration * 0.6
      }, "startSmoking")
      .to("#cabeza", {
        rotation: -10,
        duration: stepDuration * 0.5
      }, "startSmoking+=0.1")
      
      // Humo
      .to("#humo1", {
        opacity: 0.9,
        scale: 1.2,
        duration: stepDuration * 0.15
      }, "startSmoking+=0.6")
      .to("#humo1", {
        y: "-=25",
        x: "+=15", 
        scale: 2.8,
        opacity: 0,
        duration: stepDuration * 1
      }, "startSmoking+=0.7")
      
      // Resetear 
      .set("#humo1", {
        opacity: 0,
        scale: 0,
        x: 0,
        y: 0
      }, "startSmoking+=1.8")
      
      // Bajar el brazo
      .to("#brazo_derecho", {
        rotation: 15,
        duration: stepDuration * 0.5
      }, "startSmoking+=1.5")
      .to("#antebrazo_der", {
        rotation: 8,
        duration: stepDuration * 0.5
      }, "startSmoking+=1.5")
      .to("#cabeza", {
        rotation: 0,
        duration: stepDuration * 0.5
      }, "startSmoking+=1.5");

    return () => {
      // Limpieza
      tl.kill();
      gsap.killTweensOf("#robot, #cabeza, #brazo_derecho, #brazo_izquierdo, #antebrazo_der, #antebrazo_izq, #pierna_derecha, #pierna_izquierda, #pierna_inf_der, #pierna_inf_izq, #torso, #ojo, #antena_luz, #humo1");
    };
  }, []);

  return (
    <div className="robot-container">
      <svg ref={robotRef} viewBox="0 0 120 180" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <defs>
          <linearGradient id="metalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2cc8e0" />
            <stop offset="50%" stopColor="#20aed4" />
            <stop offset="100%" stopColor="#178ca8" />
          </linearGradient>
        </defs>
        
        <g id="robot" transform="translate(60, 90)">
          {/* Antena */}
          <line x1="0" y1="-67" x2="0" y2="-75" stroke="#0c5970" strokeWidth="1.5" />
          <circle id="antena_luz" cx="0" cy="-75" r="2" fill="#14ecff" />
          
          {/* Torso */}
          <g id="torso">
            <rect x="-15" y="-45" width="30" height="60" rx="4" ry="4" className="robot-part robot-body" />
            <circle cx="0" cy="-30" r="2" fill="#14ecff" opacity="0.7" />
          </g>
          
          {/* Cabeza */}
          <g id="cabeza" transform="translate(0, -55)">
            <rect x="-10" y="-10" width="20" height="20" rx="3" ry="3" className="robot-part robot-joints" />
            <g id="ojo">
              <circle cx="5" cy="0" r="3.5" fill="#0a3a48" />
              <circle cx="5" cy="0" r="2.5" fill="#14ecff" />
            </g>
            <rect x="-7" y="3" width="8" height="2" rx="1" ry="1" fill="#0c5970" />
          </g>

          {/* Brazo derecho */}
          <g id="brazo_derecho" transform="translate(25, -40)">
            <rect id="brazo_sup_der" x="-4" y="0" width="8" height="35" rx="2" ry="2" className="robot-part robot-limbs" />
            <g id="antebrazo_der" transform="translate(0, 35)">
              <rect x="-3" y="0" width="6" height="30" rx="2" ry="2" className="robot-part robot-joints" />
              <g id="mano_der" transform="translate(0, 30)">
                <rect x="-4" y="0" width="8" height="8" rx="1" ry="1" className="robot-part robot-limbs" />
                <rect id="cigarrillo" x="4" y="2" width="2" height="10" fill="white" stroke="#444" strokeWidth="0.5" />
                <circle id="cigarrillo_punta" cx="5" cy="12" r="1.2" fill="#ff3e00" />
              </g>
            </g>
          </g>

          {/* Brazo izquierdo */}
          <g id="brazo_izquierdo" transform="translate(-25, -40)">
            <rect id="brazo_sup_izq" x="-4" y="0" width="8" height="35" rx="2" ry="2" className="robot-part robot-limbs" />
            <g id="antebrazo_izq" transform="translate(0, 35)">
              <rect x="-3" y="0" width="6" height="30" rx="2" ry="2" className="robot-part robot-joints" />
              <g id="mano_izq" transform="translate(0, 30)">
                <rect x="-4" y="0" width="8" height="8" rx="1" ry="1" className="robot-part robot-limbs" />
              </g>
            </g>
          </g>

          {/* Pierna derecha */}
          <g id="pierna_derecha" transform="translate(10, 15)">
            <rect id="muslo_der" x="-5" y="0" width="10" height="40" rx="2" ry="2" className="robot-part robot-limbs" />
            <g id="pierna_inf_der" transform="translate(0, 40)">
              <rect x="-4" y="0" width="8" height="35" rx="2" ry="2" className="robot-part robot-joints" />
              <g transform="translate(0, 35)">
                <rect x="-7" y="0" width="14" height="8" rx="2" ry="2" className="robot-part robot-limbs" />
              </g>
            </g>
          </g>

          {/* Pierna izquierda */}
          <g id="pierna_izquierda" transform="translate(-10, 15)">
            <rect id="muslo_izq" x="-5" y="0" width="10" height="40" rx="2" ry="2" className="robot-part robot-limbs" />
            <g id="pierna_inf_izq" transform="translate(0, 40)">
              <rect x="-4" y="0" width="8" height="35" rx="2" ry="2" className="robot-part robot-joints" />
              <g transform="translate(0, 35)">
                <rect x="-7" y="0" width="14" height="8" rx="2" ry="2" className="robot-part robot-limbs" />
              </g>
            </g>
          </g>

          {/* Nubes de humo */}
          <g transform="translate(20, -88)">
            <circle id="humo1" cx="0" cy="0" r="5" fill="rgba(220, 220, 220, 0.8)" opacity="0" />
            <circle id="humo2" cx="-2" cy="-3" r="4" fill="rgba(210, 210, 210, 0.7)" opacity="0" />
            <circle id="humo3" cx="2" cy="-5" r="3" fill="rgba(200, 200, 200, 0.6)" opacity="0" />
          </g>
        </g>
      </svg>

      <style>
        {`
          .robot-container {
            width: 300px;
            height: 400px;
            overflow: visible;
            display: flex;
            justify-content: center;
            align-items: center;
          }
          
          .robot-part {
            stroke: #222;
            stroke-width: 1.5;
          }
          
          .robot-body { 
            fill: url(#metalGradient); 
            filter: drop-shadow(0 0 7px #20aed4);
          }
          
          .robot-limbs { 
            fill: #117c99;
          }
          
          .robot-joints { 
            fill: #0c5970; 
          }
        `}
      </style>
    </div>
  );
}