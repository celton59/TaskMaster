import { createContext, ReactNode, useContext, useState, useEffect } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { User } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Tipos para el contexto de autenticación
type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<User, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<User, Error, RegisterData>;
};

// Tipos para operaciones de autenticación
type LoginData = {
  username: string;
  password: string;
};

type RegisterData = {
  username: string;
  password: string;
  email?: string;
  name?: string;
};

// Crear contexto de autenticación
export const AuthContext = createContext<AuthContextType | null>(null);

// Proveedor de autenticación
export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  
  // Consulta para obtener el usuario actual
  const {
    data: user,
    error,
    isLoading: isQueryLoading,
    refetch
  } = useQuery<User | null, Error>({
    queryKey: ["/api/user"],
    queryFn: async () => {
      console.log("Fetching user data...");
      try {
        const response = await fetch("/api/user", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });
        
        console.log("User API response status:", response.status);
        
        if (response.status === 401) {
          console.log("User not authenticated");
          return null;
        }
        
        if (!response.ok) {
          throw new Error("Error al obtener los datos del usuario");
        }
        
        const userData = await response.json();
        console.log("User data received:", userData);
        return userData;
      } catch (error) {
        console.error("Error fetching user", error);
        return null;
      }
    },
    refetchOnWindowFocus: true, // Recargar al volver a enfocar la ventana
    staleTime: 1000 * 60 * 5, // Datos considerados frescos por 5 minutos
    refetchInterval: 1000 * 60 * 30, // Refrescar automáticamente cada 30 minutos
  });

  // Cargar usuario al inicio
  useEffect(() => {
    const fetchUser = async () => {
      try {
        await refetch();
      } finally {
        setIsInitialLoading(false);
      }
    };
    
    fetchUser();
  }, [refetch]);

  const isLoading = isInitialLoading || isQueryLoading;

  // Mutación para iniciar sesión
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      console.log("Iniciando sesión con:", credentials.username);
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
        credentials: "include",
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error en login:", errorData);
        throw new Error(errorData.message || "Error al iniciar sesión");
      }
      
      return await response.json();
    },
    onSuccess: (data: User) => {
      console.log("Login exitoso, datos recibidos:", data);
      
      // Refrescar los datos del usuario
      queryClient.setQueryData(["/api/user"], data);
      
      // Refetch para asegurar que tenemos los datos más recientes
      queryClient.refetchQueries({ queryKey: ['/api/user'] });
      
      // Invalidar todas las consultas para forzar recarga de datos
      queryClient.invalidateQueries();
      
      toast({
        title: "Inicio de sesión exitoso",
        description: "Bienvenido al sistema de gestión de tareas",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error al iniciar sesión",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutación para registrarse
  const registerMutation = useMutation({
    mutationFn: async (userData: RegisterData) => {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
        credentials: "include",
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al registrarse");
      }
      
      return await response.json();
    },
    onSuccess: (data: User) => {
      queryClient.setQueryData(["/api/user"], data);
      toast({
        title: "Registro exitoso",
        description: "Tu cuenta ha sido creada correctamente",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error al registrarse",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutación para cerrar sesión
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al cerrar sesión");
      }
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
      // Invalidar todas las consultas que dependen de la autenticación
      queryClient.invalidateQueries();
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error al cerrar sesión",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user || null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook para usar el contexto de autenticación
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
}