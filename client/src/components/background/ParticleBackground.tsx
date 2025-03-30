import { useCallback, useEffect, useState } from 'react';
import Particles from 'react-tsparticles';
import { loadSlim } from 'tsparticles-slim';
import type { Engine } from 'tsparticles-engine';

export function ParticleBackground() {
  const [loaded, setLoaded] = useState(false);

  // Inicializa el motor de partículas
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
    setLoaded(true);
  }, []);

  // Configuración retrasada para asegurar buena carga inicial
  useEffect(() => {
    // Iniciar con opacidad más baja y aumentarla gradualmente
    if (loaded) {
      const container = document.querySelector('#tsparticles') as HTMLElement;
      if (container) {
        container.style.opacity = '0';
        
        setTimeout(() => {
          container.style.opacity = '1';
          container.style.transition = 'opacity 1.5s ease-in-out';
        }, 300);
      }
    }
  }, [loaded]);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={{
          fullScreen: false,
          fpsLimit: 60,
          particles: {
            number: {
              value: 70,
              density: {
                enable: true,
                value_area: 800
              }
            },
            color: {
              value: ["#00e1ff", "#bb00ff", "#ff00aa", "#00ff9d", "#ffea00"]
            },
            shape: {
              type: "circle"
            },
            opacity: {
              value: 0.5,
              random: true,
              anim: {
                enable: true,
                speed: 0.5,
                opacity_min: 0.1,
                sync: false
              }
            },
            size: {
              value: 3,
              random: true,
              anim: {
                enable: true,
                speed: 2,
                size_min: 0.1,
                sync: false
              }
            },
            line_linked: {
              enable: true,
              distance: 150,
              color: "#00e1ff",
              opacity: 0.2,
              width: 1
            },
            move: {
              enable: true,
              speed: 1,
              direction: "none",
              random: true,
              straight: false,
              out_mode: "out",
              bounce: false,
              attract: {
                enable: true,
                rotateX: 600,
                rotateY: 1200
              }
            }
          },
          interactivity: {
            detect_on: "canvas",
            events: {
              onhover: {
                enable: true,
                mode: ["grab", "bubble"]
              },
              onclick: {
                enable: true,
                mode: "push"
              },
              resize: true
            },
            modes: {
              grab: {
                distance: 180,
                line_linked: {
                  opacity: 0.35
                }
              },
              bubble: {
                distance: 200,
                size: 6,
                duration: 2,
                opacity: 0.4,
                speed: 3
              },
              repulse: {
                distance: 100,
                duration: 0.4
              },
              push: {
                particles_nb: 4
              },
              remove: {
                particles_nb: 2
              }
            }
          },
          retina_detect: true,
          background: {
            color: "transparent",
            image: "",
            position: "50% 50%",
            repeat: "no-repeat",
            size: "cover"
          }
        }}
        className="h-full w-full"
      />
    </div>
  );
}