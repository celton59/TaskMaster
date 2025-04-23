import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route, RouteComponentProps } from "wouter";

interface ProtectedRouteProps {
  path: string;
  component: React.ComponentType<any>;
}

// Variable para habilitar o deshabilitar el bypass de autenticación
// Establecido como true para permitir desarrollo sin autenticación
const DEVELOPMENT_BYPASS_AUTH = true;

export function ProtectedRoute({ path, component: Component }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  // Si estamos en modo desarrollo y el bypass está activado, renderizar el componente directamente
  if (DEVELOPMENT_BYPASS_AUTH) {
    return (
      <Route path={path}>
        {(params) => <Component {...params} />}
      </Route>
    );
  }

  if (isLoading) {
    return (
      <Route path={path}>
        {(params) => (
          <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
      </Route>
    );
  }

  if (!user) {
    return (
      <Route path={path}>
        {() => <Redirect to="/auth" />}
      </Route>
    );
  }

  return (
    <Route path={path}>
      {(params) => <Component {...params} />}
    </Route>
  );
}