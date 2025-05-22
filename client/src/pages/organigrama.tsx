import { useEffect } from "react";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Network, Users, Briefcase, Camera, Clapperboard, Edit3, FileCheck, Video } from "lucide-react";
import { motion } from "framer-motion";

export default function OrganigramaPage() {
  const { isDarkMode } = useTheme();

  useEffect(() => {
    // Cambiar el título de la página
    document.title = "Jerarquía | Aitorin Petant SL";
  }, []);

  // Funciones y descripciones
  const funciones = {
    CEO: "Estrategia, visión global, resultados financieros",
    COO: [
      "Materializar los proyectos, defiene la estrategia y coordina unidades de negocio.",
      "Traducir ideas en flujos de trabajo, coordina contenidos y desarrollo de software.",
      "Documentar los procesos, optimizar recursos y asegurar la calidad.",
      "Formación y mentoría"
    ],
    supervisorIznoval: [
      "Planificación y asignación de tareas.",
      "Seguimiento de flujo de trabajo.",
      "Coordinación interfuncional.",
      "Reporte y mejora continua."
    ],
    supervisorAisoft: [],
    equipoProduccion: [
      "Crear y generar vídeo, desarrollar el guión.",
      "Establecer la línea visual.",
      "Edición, montaje de vídeo, añadir transiciones y música.",
      "Diseño de miniaturas y redacción de descripciones"
    ],
    gestionContenido: [
      "Control de calidad intermedio.",
      "Revisar que se ha cumplido con los criterios.",
      "Documentar errores o desviaciones y solicitar reproceso cuando sea necesario."
    ],
    checkoutProgramacion: [
      "Revisión final.",
      "Programación de la publicación.",
      "QA post-subida: confirmar que el vídeo aparece correctamente, con acentos, subtítulos y enlaces.",
      "Reporte de publicación."
    ]
  };

  // Imágenes de cada perro (representación en SVG)
  const avatarImages = {
    Aitor: (
      <div className="h-full w-full bg-amber-200 rounded-full overflow-hidden flex items-center justify-center">
        <svg viewBox="0 0 100 100" className="h-full w-full">
          <circle cx="50" cy="35" r="22" fill="#8B4513" /> {/* Cabeza */}
          <ellipse cx="50" cy="50" rx="40" ry="30" fill="#CD853F" /> {/* Cara */}
          <circle cx="40" cy="32" r="4" fill="black" /> {/* Ojo izquierdo */}
          <circle cx="60" cy="32" r="4" fill="black" /> {/* Ojo derecho */}
          <ellipse cx="50" cy="42" rx="8" ry="6" fill="#5D3A1A" /> {/* Nariz */}
          <path d="M36 54 Q50 62 64 54" stroke="#5D3A1A" strokeWidth="3" fill="none" /> {/* Sonrisa */}
          <path d="M20 22 Q30 5 40 15" stroke="#8B4513" strokeWidth="4" fill="none" /> {/* Oreja izquierda */}
          <path d="M80 22 Q70 5 60 15" stroke="#8B4513" strokeWidth="4" fill="none" /> {/* Oreja derecha */}
        </svg>
      </div>
    ),
    Supervisor1: (
      <div className="h-full w-full bg-green-200 rounded-full overflow-hidden flex items-center justify-center">
        <svg viewBox="0 0 100 100" className="h-full w-full">
          <circle cx="50" cy="35" r="24" fill="#6B8E23" /> {/* Cabeza */}
          <ellipse cx="50" cy="50" rx="38" ry="28" fill="#9ACD32" /> {/* Cara */}
          <circle cx="40" cy="32" r="4" fill="black" /> {/* Ojo izquierdo */}
          <circle cx="60" cy="32" r="4" fill="black" /> {/* Ojo derecho */}
          <ellipse cx="50" cy="42" rx="7" ry="5" fill="#3A5F0B" /> {/* Nariz */}
          <path d="M38 52 Q50 58 62 52" stroke="#3A5F0B" strokeWidth="3" fill="none" /> {/* Sonrisa */}
          <path d="M25 18 Q35 5 42 18" stroke="#6B8E23" strokeWidth="4" fill="none" /> {/* Oreja izquierda */}
          <path d="M75 18 Q65 5 58 18" stroke="#6B8E23" strokeWidth="4" fill="none" /> {/* Oreja derecha */}
        </svg>
      </div>
    ),
    Supervisor2: (
      <div className="h-full w-full bg-gray-200 rounded-full overflow-hidden flex items-center justify-center">
        <svg viewBox="0 0 100 100" className="h-full w-full">
          <circle cx="50" cy="35" r="24" fill="#2F4F4F" /> {/* Cabeza */}
          <ellipse cx="50" cy="50" rx="38" ry="28" fill="#708090" /> {/* Cara */}
          <circle cx="40" cy="32" r="4" fill="black" /> {/* Ojo izquierdo */}
          <circle cx="60" cy="32" r="4" fill="black" /> {/* Ojo derecho */}
          <ellipse cx="50" cy="42" rx="7" ry="5" fill="#2F4F4F" /> {/* Nariz */}
          <path d="M38 52 Q50 58 62 52" stroke="#2F4F4F" strokeWidth="3" fill="none" /> {/* Sonrisa */}
          <path d="M25 18 Q35 5 42 18" stroke="#2F4F4F" strokeWidth="4" fill="none" /> {/* Oreja izquierda */}
          <path d="M75 18 Q65 5 58 18" stroke="#2F4F4F" strokeWidth="4" fill="none" /> {/* Oreja derecha */}
        </svg>
      </div>
    ),
    Coo: (
      <div className="h-full w-full bg-blue-200 rounded-full overflow-hidden flex items-center justify-center">
        <svg viewBox="0 0 100 100" className="h-full w-full">
          <ellipse cx="50" cy="38" rx="28" ry="26" fill="#87CEEB" /> {/* Cabeza */}
          <ellipse cx="50" cy="48" rx="30" ry="20" fill="#ADD8E6" /> {/* Cara */}
          <circle cx="40" cy="34" r="4" fill="black" /> {/* Ojo izquierdo */}
          <circle cx="60" cy="34" r="4" fill="black" /> {/* Ojo derecho */}
          <ellipse cx="50" cy="44" rx="7" ry="5" fill="#4682B4" /> {/* Nariz */}
          <path d="M40 55 Q50 60 60 55" stroke="#4682B4" strokeWidth="2" fill="none" /> {/* Sonrisa */}
          <path d="M20 30 Q30 15 40 25" stroke="#87CEEB" strokeWidth="4" fill="none" /> {/* Oreja izquierda */}
          <path d="M80 30 Q70 15 60 25" stroke="#87CEEB" strokeWidth="4" fill="none" /> {/* Oreja derecha */}
          <circle cx="32" cy="42" r="5" fill="white" /> {/* Reflejo gafas izquierda */}
          <circle cx="68" cy="42" r="5" fill="white" /> {/* Reflejo gafas derecha */}
          <path d="M30 40 Q50 46 70 40" stroke="black" strokeWidth="2" fill="none" /> {/* Gafas */}
        </svg>
      </div>
    ),
    Produccion: (
      <div className="h-full w-full bg-pink-200 rounded-full overflow-hidden flex items-center justify-center">
        <svg viewBox="0 0 100 100" className="h-full w-full">
          <rect x="28" y="20" width="44" height="60" rx="10" fill="#FFB6C1" /> {/* Cuerpo grupo */}
          <circle cx="38" cy="40" r="10" fill="#FF69B4" /> {/* Cara 1 */}
          <circle cx="62" cy="40" r="10" fill="#FF69B4" /> {/* Cara 2 */}
          <circle cx="38" cy="60" r="10" fill="#FF69B4" /> {/* Cara 3 */}
          <circle cx="62" cy="60" r="10" fill="#FF69B4" /> {/* Cara 4 */}
          <circle cx="38" cy="38" r="2" fill="black" /> {/* Ojo 1 */}
          <circle cx="62" cy="38" r="2" fill="black" /> {/* Ojo 2 */}
          <circle cx="38" cy="58" r="2" fill="black" /> {/* Ojo 3 */}
          <circle cx="62" cy="58" r="2" fill="black" /> {/* Ojo 4 */}
          <path d="M34 42 Q38 44 42 42" stroke="black" strokeWidth="1" fill="none" /> {/* Sonrisa 1 */}
          <path d="M58 42 Q62 44 66 42" stroke="black" strokeWidth="1" fill="none" /> {/* Sonrisa 2 */}
          <path d="M34 62 Q38 64 42 62" stroke="black" strokeWidth="1" fill="none" /> {/* Sonrisa 3 */}
          <path d="M58 62 Q62 64 66 62" stroke="black" strokeWidth="1" fill="none" /> {/* Sonrisa 4 */}
        </svg>
      </div>
    ),
    GestionContenido: (
      <div className="h-full w-full bg-green-100 rounded-full overflow-hidden flex items-center justify-center">
        <svg viewBox="0 0 100 100" className="h-full w-full">
          <circle cx="50" cy="40" r="24" fill="#8FBC8F" /> {/* Cabeza */}
          <ellipse cx="50" cy="50" rx="30" ry="25" fill="#90EE90" /> {/* Cara */}
          <circle cx="40" cy="35" r="4" fill="black" /> {/* Ojo izquierdo */}
          <circle cx="60" cy="35" r="4" fill="black" /> {/* Ojo derecho */}
          <ellipse cx="50" cy="45" rx="7" ry="5" fill="#006400" /> {/* Nariz */}
          <path d="M40 55 Q50 60 60 55" stroke="#006400" strokeWidth="2" fill="none" /> {/* Sonrisa */}
          <path d="M25 25 Q35 10 45 25" stroke="#8FBC8F" strokeWidth="4" fill="none" /> {/* Oreja izquierda */}
          <path d="M75 25 Q65 10 55 25" stroke="#8FBC8F" strokeWidth="4" fill="none" /> {/* Oreja derecha */}
        </svg>
      </div>
    ),
    CheckoutProgramacion: (
      <div className="h-full w-full bg-purple-100 rounded-full overflow-hidden flex items-center justify-center">
        <svg viewBox="0 0 100 100" className="h-full w-full">
          <circle cx="50" cy="40" r="24" fill="#9370DB" /> {/* Cabeza */}
          <ellipse cx="50" cy="50" rx="30" ry="25" fill="#B19CD9" /> {/* Cara */}
          <circle cx="40" cy="35" r="4" fill="black" /> {/* Ojo izquierdo */}
          <circle cx="60" cy="35" r="4" fill="black" /> {/* Ojo derecho */}
          <ellipse cx="50" cy="45" rx="7" ry="5" fill="#4B0082" /> {/* Nariz */}
          <path d="M40 55 Q50 60 60 55" stroke="#4B0082" strokeWidth="2" fill="none" /> {/* Sonrisa */}
          <path d="M28 25 Q40 15 45 25" stroke="#9370DB" strokeWidth="4" fill="none" /> {/* Oreja izquierda */}
          <path d="M72 25 Q60 15 55 25" stroke="#9370DB" strokeWidth="4" fill="none" /> {/* Oreja derecha */}
        </svg>
      </div>
    )
  };

  // Colores para temas claro y oscuro
  const getColorClasses = (color: string) => {
    const colorMap: Record<string, { dark: string, light: string, border: string, icon: string }> = {
      blue: {
        dark: "bg-neon-dark border-neon-accent text-neon-accent",
        light: "bg-blue-50 border-blue-200 text-blue-700",
        border: isDarkMode ? "border-neon-accent/30" : "border-blue-200",
        icon: isDarkMode ? "text-neon-accent" : "text-blue-600"
      },
      amber: {
        dark: "bg-neon-dark border-amber-400 text-amber-400",
        light: "bg-amber-50 border-amber-200 text-amber-700",
        border: isDarkMode ? "border-amber-400/30" : "border-amber-200",
        icon: isDarkMode ? "text-amber-400" : "text-amber-600"
      },
      green: {
        dark: "bg-neon-dark border-neon-green text-neon-green",
        light: "bg-emerald-50 border-emerald-200 text-emerald-700",
        border: isDarkMode ? "border-neon-green/30" : "border-emerald-200",
        icon: isDarkMode ? "text-neon-green" : "text-emerald-600"
      },
      gray: {
        dark: "bg-neon-dark border-gray-400 text-gray-300",
        light: "bg-gray-50 border-gray-200 text-gray-700",
        border: isDarkMode ? "border-gray-500/30" : "border-gray-200",
        icon: isDarkMode ? "text-gray-300" : "text-gray-600"
      }
    };
    
    return colorMap[color] || colorMap.blue;
  };

  return (
    <div className={cn(
      "container mx-auto px-4 py-6",
      isDarkMode ? "bg-neon-darker text-neon-text" : "bg-gray-50 text-gray-900"
    )}>
      <h1 className={cn(
        "text-3xl font-bold mb-6",
        isDarkMode ? "text-neon-accent" : "text-blue-700"
      )}>
        <div className="flex items-center gap-2">
          <Network size={28} className={isDarkMode ? "text-neon-accent" : "text-blue-600"} />
          JERARQUÍA DE AITORIN PETANT SL
        </div>
      </h1>

      {/* Sección de CEO */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <Card className={cn(
          "border-2 max-w-3xl mx-auto",
          isDarkMode 
            ? "bg-neon-dark border-neon-accent/40 shadow-[0_0_15px_rgba(0,225,255,0.1)]" 
            : "bg-white border-blue-200"
        )}>
          <CardContent className="py-4">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="w-32 h-32 min-w-[128px] md:w-24 md:h-24">
                {avatarImages.Aitor}
              </div>
              <div className="flex flex-col flex-1">
                <div className={cn(
                  "text-xl font-bold mb-1",
                  isDarkMode ? "text-neon-accent" : "text-blue-700"
                )}>Aitor</div>
                <div className="text-lg font-semibold mb-3">CEO / Director</div>
                <div className={cn(
                  "text-sm",
                  isDarkMode ? "text-neon-text/80" : "text-gray-600"
                )}>
                  {funciones.CEO}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Línea de conexión */}
      <div className="flex justify-center mb-8">
        <div className={cn(
          "w-1 h-16",
          isDarkMode ? "bg-neon-accent/50" : "bg-blue-300"
        )}></div>
      </div>

      {/* COO */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-8"
      >
        <Card className={cn(
          "border-2 max-w-3xl mx-auto",
          isDarkMode 
            ? "bg-neon-dark border-blue-400/40 shadow-[0_0_15px_rgba(0,225,255,0.1)]" 
            : "bg-white border-blue-200"
        )}>
          <CardContent className="py-4">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="w-32 h-32 min-w-[128px] md:w-24 md:h-24">
                {avatarImages.Coo}
              </div>
              <div className="flex flex-col flex-1">
                <div className={cn(
                  "text-xl font-bold mb-1",
                  isDarkMode ? "text-blue-400" : "text-blue-700"
                )}>COO</div>
                <div className="text-lg font-semibold mb-3">Director de operaciones</div>
                <div className={cn(
                  "text-sm",
                  isDarkMode ? "text-neon-text/80" : "text-gray-600"
                )}>
                  <ul className="list-disc pl-5 space-y-1">
                    {funciones.COO.map((funcion, idx) => (
                      <li key={idx}>{funcion}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Línea de conexión */}
      <div className="flex justify-center mb-8">
        <div className={cn(
          "w-1 h-16",
          isDarkMode ? "bg-neon-accent/50" : "bg-blue-300"
        )}></div>
      </div>

      {/* Supervisores */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 max-w-4xl mx-auto"
      >
        {/* Supervisor de Iznoval */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className={cn(
            "border-2 h-full",
            isDarkMode 
              ? "bg-neon-dark border-green-400/40 shadow-[0_0_15px_rgba(0,225,255,0.1)]" 
              : "bg-white border-green-200"
          )}>
            <CardContent className="py-4">
              <div className="flex flex-col items-center md:items-start gap-4">
                <div className="w-24 h-24 mb-2">
                  {avatarImages.Supervisor1}
                </div>
                <div className="text-center md:text-left">
                  <div className={cn(
                    "text-lg font-bold",
                    isDarkMode ? "text-green-400" : "text-green-700"
                  )}>Supervisor de Iznoval</div>
                  
                  <div className={cn(
                    "text-sm mt-3",
                    isDarkMode ? "text-neon-text/80" : "text-gray-600"
                  )}>
                    <ul className="list-disc pl-5 space-y-1 text-left">
                      {funciones.supervisorIznoval.map((funcion, idx) => (
                        <li key={idx}>{funcion}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Supervisor de Aisoft */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className={cn(
            "border-2 h-full",
            isDarkMode 
              ? "bg-neon-dark border-gray-400/40 shadow-[0_0_15px_rgba(0,225,255,0.1)]" 
              : "bg-white border-gray-200"
          )}>
            <CardContent className="py-4">
              <div className="flex flex-col items-center md:items-start gap-4">
                <div className="w-24 h-24 mb-2">
                  {avatarImages.Supervisor2}
                </div>
                <div className="text-center md:text-left">
                  <div className={cn(
                    "text-lg font-bold",
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  )}>Supervisor de Aisoft</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Líneas de conexión desde supervisor 1 */}
      <div className="grid grid-cols-3 gap-4 mb-8 max-w-4xl mx-auto">
        <div className="flex justify-center">
          <div className={cn(
            "w-1 h-16",
            isDarkMode ? "bg-green-400/50" : "bg-green-300"
          )}></div>
        </div>
        <div className="flex justify-center">
          <div className={cn(
            "w-1 h-16",
            isDarkMode ? "bg-green-400/50" : "bg-green-300"
          )}></div>
        </div>
        <div className="flex justify-center">
          <div className={cn(
            "w-1 h-16",
            isDarkMode ? "bg-green-400/50" : "bg-green-300"
          )}></div>
        </div>
      </div>

      {/* Equipos de Iznoval */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-6xl mx-auto"
      >
        {/* Equipo de Producción */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card className={cn(
            "border-2 h-full",
            isDarkMode 
              ? "bg-neon-dark border-pink-400/40 shadow-[0_0_15px_rgba(0,225,255,0.1)]" 
              : "bg-white border-pink-200"
          )}>
            <CardHeader className="pb-2">
              <CardTitle className={cn(
                "text-base font-bold flex items-center gap-2",
                isDarkMode ? "text-pink-400" : "text-pink-600"
              )}>
                <Camera size={18} />
                Equipo de producción
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3">
                <div className="w-16 h-16 mx-auto mb-2">
                  {avatarImages.Produccion}
                </div>
                <div className={cn(
                  "text-xs",
                  isDarkMode ? "text-neon-text/80" : "text-gray-600"
                )}>
                  <ul className="list-disc pl-4 space-y-1">
                    {funciones.equipoProduccion.map((funcion, idx) => (
                      <li key={idx}>{funcion}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Gestión y Revisión de Contenido */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Card className={cn(
            "border-2 h-full",
            isDarkMode 
              ? "bg-neon-dark border-green-400/40 shadow-[0_0_15px_rgba(0,225,255,0.1)]" 
              : "bg-white border-green-200"
          )}>
            <CardHeader className="pb-2">
              <CardTitle className={cn(
                "text-base font-bold flex items-center gap-2",
                isDarkMode ? "text-green-400" : "text-green-600"
              )}>
                <Edit3 size={18} />
                Gestión y Revisión de contenido
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3">
                <div className="w-16 h-16 mx-auto mb-2">
                  {avatarImages.GestionContenido}
                </div>
                <div className={cn(
                  "text-xs",
                  isDarkMode ? "text-neon-text/80" : "text-gray-600"
                )}>
                  <ul className="list-disc pl-4 space-y-1">
                    {funciones.gestionContenido.map((funcion, idx) => (
                      <li key={idx}>{funcion}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Control del Check Out */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <Card className={cn(
            "border-2 h-full",
            isDarkMode 
              ? "bg-neon-dark border-purple-400/40 shadow-[0_0_15px_rgba(0,225,255,0.1)]" 
              : "bg-white border-purple-200"
          )}>
            <CardHeader className="pb-2">
              <CardTitle className={cn(
                "text-base font-bold flex items-center gap-2 flex-wrap",
                isDarkMode ? "text-purple-400" : "text-purple-600"
              )}>
                <FileCheck size={18} />
                Control del check out y programación
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3">
                <div className="w-16 h-16 mx-auto mb-2">
                  {avatarImages.CheckoutProgramacion}
                </div>
                <div className={cn(
                  "text-xs",
                  isDarkMode ? "text-neon-text/80" : "text-gray-600"
                )}>
                  <ul className="list-disc pl-4 space-y-1">
                    {funciones.checkoutProgramacion.map((funcion, idx) => (
                      <li key={idx}>{funcion}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}