import { useEffect } from "react";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Network, Users, UserCircle, Shield, BriefcaseBusiness, PieChart, BarChart4, Settings2, Server, Code, Trophy } from "lucide-react";
import { motion } from "framer-motion";

export default function OrganigramaPage() {
  const { isDarkMode } = useTheme();

  useEffect(() => {
    // Cambiar el título de la página
    document.title = "Organigrama | Aitorin";
  }, []);

  // Contenido del organigrama desde el documento de documentación
  const organigramaContent = `
# Organigrama Corporativo

## Dirección General
- **CEO:** Ana Martínez González
  - *Responsable de la dirección estratégica y toma de decisiones a nivel ejecutivo*

## Departamentos Principales

### Tecnología
- **CTO:** Carlos Rodríguez Sánchez
  - **Director de Desarrollo:** Miguel Ángel López
    - Equipo Frontend (6 desarrolladores)
    - Equipo Backend (8 desarrolladores)
    - Equipo QA (4 testers)
  - **Director de Infraestructura:** Laura Fernández
    - Equipo DevOps (3 ingenieros)
    - Soporte técnico (5 especialistas)

### Marketing y Ventas
- **CMO:** Isabel Torres Ramírez
  - **Director de Marketing Digital:** Javier Méndez
    - Equipo de Contenido (4 especialistas)
    - Equipo de Redes Sociales (3 community managers)
  - **Director Comercial:** Roberto Álvarez
    - Equipo de Ventas Nacionales (8 ejecutivos)
    - Equipo de Ventas Internacionales (5 ejecutivos)

### Finanzas y Administración
- **CFO:** Sergio Navarro García
  - **Controller:** Patricia Díaz
    - Equipo de Contabilidad (4 contables)
  - **Director de RRHH:** Marta Gutiérrez
    - Equipo de Selección (2 técnicos)
    - Equipo de Desarrollo de Talento (3 técnicos)

### Operaciones
- **COO:** Eduardo Martín Blanco
  - **Director de Logística:** Carmen Vega
    - Equipo de Almacén (12 operarios)
    - Equipo de Distribución (8 coordinadores)
  - **Director de Atención al Cliente:** Francisco Moreno
    - Equipo de Soporte (15 agentes)

## Comités Transversales
- Comité de Innovación
- Comité de Sostenibilidad
- Comité de Transformación Digital
`;

  // Estructura del organigrama para la visualización interactiva
  const areas = [
    {
      title: "Dirección General",
      leader: "Ana Martínez González",
      role: "CEO",
      icon: <Shield size={28} />,
      color: "blue"
    },
    {
      title: "Tecnología",
      leader: "Carlos Rodríguez Sánchez",
      role: "CTO",
      icon: <Code size={28} />,
      color: "cyan",
      teams: [
        { name: "Desarrollo", leader: "Miguel Ángel López", members: 18 },
        { name: "Infraestructura", leader: "Laura Fernández", members: 8 }
      ]
    },
    {
      title: "Marketing y Ventas",
      leader: "Isabel Torres Ramírez",
      role: "CMO",
      icon: <Trophy size={28} />,
      color: "green",
      teams: [
        { name: "Marketing Digital", leader: "Javier Méndez", members: 7 },
        { name: "Comercial", leader: "Roberto Álvarez", members: 13 }
      ]
    },
    {
      title: "Finanzas y Administración",
      leader: "Sergio Navarro García",
      role: "CFO",
      icon: <PieChart size={28} />,
      color: "purple",
      teams: [
        { name: "Contabilidad", leader: "Patricia Díaz", members: 4 },
        { name: "RRHH", leader: "Marta Gutiérrez", members: 5 }
      ]
    },
    {
      title: "Operaciones",
      leader: "Eduardo Martín Blanco",
      role: "COO",
      icon: <Settings2 size={28} />,
      color: "amber",
      teams: [
        { name: "Logística", leader: "Carmen Vega", members: 20 },
        { name: "Atención al Cliente", leader: "Francisco Moreno", members: 15 }
      ]
    }
  ];

  // Colores para temas claro y oscuro
  const getColorClasses = (color: string) => {
    const colorMap: Record<string, { dark: string, light: string, border: string, icon: string }> = {
      blue: {
        dark: "bg-neon-dark border-neon-accent text-neon-accent",
        light: "bg-blue-50 border-blue-200 text-blue-700",
        border: isDarkMode ? "border-neon-accent/30" : "border-blue-200",
        icon: isDarkMode ? "text-neon-accent" : "text-blue-600"
      },
      cyan: {
        dark: "bg-neon-dark border-cyan-400 text-cyan-400",
        light: "bg-cyan-50 border-cyan-200 text-cyan-700",
        border: isDarkMode ? "border-cyan-400/30" : "border-cyan-200",
        icon: isDarkMode ? "text-cyan-400" : "text-cyan-600"
      },
      green: {
        dark: "bg-neon-dark border-neon-green text-neon-green",
        light: "bg-emerald-50 border-emerald-200 text-emerald-700",
        border: isDarkMode ? "border-neon-green/30" : "border-emerald-200",
        icon: isDarkMode ? "text-neon-green" : "text-emerald-600"
      },
      purple: {
        dark: "bg-neon-dark border-neon-purple text-neon-purple",
        light: "bg-purple-50 border-purple-200 text-purple-700",
        border: isDarkMode ? "border-neon-purple/30" : "border-purple-200",
        icon: isDarkMode ? "text-neon-purple" : "text-purple-600"
      },
      amber: {
        dark: "bg-neon-dark border-neon-yellow text-neon-yellow",
        light: "bg-amber-50 border-amber-200 text-amber-700",
        border: isDarkMode ? "border-neon-yellow/30" : "border-amber-200",
        icon: isDarkMode ? "text-neon-yellow" : "text-amber-600"
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
          Organigrama Corporativo
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
          "border-2",
          isDarkMode 
            ? "bg-neon-dark border-neon-accent/40 shadow-[0_0_15px_rgba(0,225,255,0.1)]" 
            : "bg-white border-blue-200"
        )}>
          <CardHeader className={cn(
            "flex flex-row items-center justify-between space-y-0 pb-2",
            isDarkMode ? "text-neon-accent" : "text-blue-700"
          )}>
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <Shield size={26} className={isDarkMode ? "text-neon-accent" : "text-blue-600"} />
              Dirección General
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={cn(
              "flex flex-col items-center p-6 rounded-lg border-2 max-w-md mx-auto",
              isDarkMode 
                ? "bg-neon-darker border-neon-accent/30" 
                : "bg-blue-50 border-blue-200"
            )}>
              <div className={cn(
                "w-24 h-24 rounded-full flex items-center justify-center mb-3 border-2",
                isDarkMode 
                  ? "border-neon-accent/50 bg-neon-dark" 
                  : "border-blue-300 bg-blue-100"
              )}>
                <UserCircle size={60} className={isDarkMode ? "text-neon-accent" : "text-blue-600"} />
              </div>
              <h3 className={cn(
                "text-xl font-bold",
                isDarkMode ? "text-neon-accent" : "text-blue-700"
              )}>Ana Martínez González</h3>
              <p className={cn(
                "text-lg font-medium mb-2",
                isDarkMode ? "text-neon-text" : "text-gray-700"
              )}>CEO</p>
              <p className={cn(
                "text-sm text-center",
                isDarkMode ? "text-neon-text/70" : "text-gray-600"
              )}>Responsable de la dirección estratégica y toma de decisiones a nivel ejecutivo</p>
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

      {/* Departamentos principales */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
      >
        {areas.slice(1).map((area, index) => {
          const colorClasses = getColorClasses(area.color);
          
          return (
            <motion.div
              key={area.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * (index + 1) }}
            >
              <Card className={cn(
                "border-2 h-full",
                isDarkMode 
                  ? `bg-neon-dark ${colorClasses.border} shadow-[0_0_15px_rgba(0,225,255,0.1)]` 
                  : "bg-white border-gray-200"
              )}>
                <CardHeader className={cn(
                  "flex flex-row items-center justify-between space-y-0 pb-2",
                  isDarkMode ? colorClasses.icon : "text-gray-800"
                )}>
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <div className={cn(colorClasses.icon)}>
                      {area.icon}
                    </div>
                    {area.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={cn(
                    "p-4 rounded-lg border mb-4",
                    isDarkMode 
                      ? "border-gray-700 bg-neon-darker" 
                      : "border-gray-200 bg-gray-50"
                  )}>
                    <div className="flex items-center mb-2">
                      <UserCircle size={20} className={colorClasses.icon} />
                      <span className={cn(
                        "ml-2 font-medium",
                        isDarkMode ? "text-neon-text" : "text-gray-800"
                      )}>{area.leader}</span>
                    </div>
                    <div className={cn(
                      "text-sm ml-7",
                      isDarkMode ? "text-neon-text/70" : "text-gray-600"
                    )}>{area.role}</div>
                  </div>

                  {area.teams && area.teams.map((team, teamIndex) => (
                    <div 
                      key={team.name}
                      className={cn(
                        "p-3 rounded-lg border mt-3",
                        isDarkMode 
                          ? "border-gray-800 bg-neon-darker" 
                          : "border-gray-200 bg-gray-50"
                      )}
                    >
                      <div className="font-medium mb-1">
                        {team.name}
                      </div>
                      <div className="text-sm flex justify-between">
                        <span className={isDarkMode ? "text-neon-text/70" : "text-gray-600"}>
                          {team.leader}
                        </span>
                        <span className="flex items-center">
                          <Users size={14} className="mr-1" />
                          {team.members}
                        </span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Comités transversales */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
      >
        <h2 className={cn(
          "text-xl font-bold mb-4",
          isDarkMode ? "text-neon-accent" : "text-blue-700"
        )}>Comités Transversales</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { name: "Comité de Innovación", icon: <BriefcaseBusiness size={20} /> },
            { name: "Comité de Sostenibilidad", icon: <BarChart4 size={20} /> },
            { name: "Comité de Transformación Digital", icon: <Server size={20} /> }
          ].map((comite, index) => (
            <Card 
              key={comite.name}
              className={cn(
                "border",
                isDarkMode 
                  ? "bg-neon-dark border-neon-medium/40" 
                  : "bg-white border-gray-200"
              )}
            >
              <CardContent className="pt-4 px-4 flex items-center">
                <div className={cn(
                  "h-10 w-10 rounded-full flex items-center justify-center mr-3",
                  isDarkMode 
                    ? "bg-neon-medium/20 text-neon-text" 
                    : "bg-blue-100 text-blue-600"
                )}>
                  {comite.icon}
                </div>
                <div className={isDarkMode ? "text-neon-text" : "text-gray-800"}>
                  {comite.name}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>
    </div>
  );
}