import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

// Pantalla simple para iniciar sesión en modo desarrollo
export default function DevLoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  
  const autoLogin = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch("/api/auto-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error en el inicio de sesión automático");
      }
      
      const userData = await response.json();
      console.log("Auto-login successful:", userData);
      setUserId(userData.id);
      
    } catch (err) {
      console.error("Auto-login error:", err);
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Iniciar sesión automáticamente al cargar la página
  useEffect(() => {
    autoLogin();
  }, []);
  
  // Si el inicio de sesión fue exitoso, redirigir al dashboard
  if (userId) {
    window.location.href = "/";
    return null;
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0D1321] text-white p-4">
      <div className="w-full max-w-md p-8 bg-[#132237] rounded-lg shadow-lg border border-[#00E1FF]/20">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Acceso de <span className="text-[#00E1FF]">Desarrollo</span>
        </h1>
        
        {error && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-500/50 rounded-md text-red-200">
            <p className="font-medium">Error:</p>
            <p>{error}</p>
          </div>
        )}
        
        <div className="flex flex-col items-center justify-center space-y-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="w-12 h-12 text-[#00E1FF] animate-spin mb-4" />
              <p className="text-[#CFF4FC]/80">Iniciando sesión automáticamente...</p>
            </div>
          ) : (
            <>
              <p className="text-center text-[#CFF4FC]/80 mb-4">
                {error 
                  ? "No se pudo iniciar sesión automáticamente. Inténtalo de nuevo."
                  : "Acceso rápido para desarrolladores"}
              </p>
              
              <Button
                onClick={autoLogin}
                className="w-full bg-[#00E1FF]/90 hover:bg-[#00E1FF] text-[#0D1321] hover:text-[#0D1321] font-medium shadow-[0_0_15px_rgba(0,225,255,0.5)] hover:shadow-[0_0_20px_rgba(0,225,255,0.7)] transition-all duration-300"
              >
                Iniciar sesión como desarrollador
              </Button>
              
              <Button
                variant="outline"
                className="w-full mt-2 border-[#00E1FF]/50 hover:border-[#00E1FF] text-[#00E1FF] hover:bg-[#00E1FF]/10 transition-all duration-300"
                onClick={() => window.location.href = "/auth"}
              >
                Ir a inicio de sesión normal
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}