import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";
import { useEffect, useState } from "react";

interface ProtectedRouteProps {
  path: string;
  component: React.ComponentType<any>;
}

export function ProtectedRoute({ path, component: Component }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const [shouldRedirect, setShouldRedirect] = useState(false);
  
  // Solo redirigir después de que termine de cargar y confirmar que no hay usuario
  useEffect(() => {
    if (!isLoading && !user) {
      setShouldRedirect(true);
    }
  }, [isLoading, user]);

  return (
    <Route path={path}>
      {(params) => {
        // Si está cargando, mostrar spinner
        if (isLoading) {
          return (
            <div className="flex items-center justify-center min-h-screen">
              <Loader2 className="h-8 w-8 animate-spin text-[#00E1FF]" />
            </div>
          );
        }
        
        // Si debería redirigir, mostrar redirección
        if (shouldRedirect) {
          return <Redirect to="/auth" />;
        }
        
        // Si hay usuario, mostrar componente
        if (user) {
          return <Component {...params} />;
        }
        
        // Estado indeterminado - mostrar spinner mientras decide
        return (
          <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="h-8 w-8 animate-spin text-[#00E1FF]" />
          </div>
        );
      }}
    </Route>
  );
}