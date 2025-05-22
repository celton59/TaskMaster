import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  FileText, 
  FolderOpen, 
  Search, 
  Plus, 
  ChevronRight, 
  ChevronDown, 
  Trash2, 
  Edit, 
  Download, 
  Book, 
  Loader2,
  FilePlus
} from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

// Esquema para validación del formulario de documentos
const documentFormSchema = z.object({
  title: z.string().min(3, "El título debe tener al menos 3 caracteres"),
  category: z.string().min(1, "Selecciona una categoría"),
  content: z.string().min(10, "El contenido debe tener al menos 10 caracteres"),
  tags: z.string().optional(),
});

type DocumentFormValues = z.infer<typeof documentFormSchema>;

// Tipos de datos
interface Document {
  id: number;
  title: string;
  category: string;
  createdAt: string;
  updatedAt: string;
  content: string;
  tags: string[];
}

interface Category {
  id: string;
  name: string;
  color: string;
  count: number;
}

// Datos de ejemplo para demostración
const mockCategories: Category[] = [
  { id: "policies", name: "Políticas", color: "blue", count: 5 },
  { id: "procedures", name: "Procedimientos", color: "green", count: 8 },
  { id: "guides", name: "Guías", color: "purple", count: 4 },
  { id: "templates", name: "Plantillas", color: "yellow", count: 6 },
  { id: "legal", name: "Legal", color: "red", count: 3 },
];

const mockDocuments: Document[] = [
  {
    id: 1,
    title: "Manual de bienvenida",
    category: "policies",
    createdAt: "2025-02-15T12:00:00Z",
    updatedAt: "2025-05-01T09:30:00Z",
    content: "Este manual contiene toda la información necesaria para nuevos empleados...",
    tags: ["onboarding", "recursos humanos"]
  },
  {
    id: 2,
    title: "Política de vacaciones",
    category: "policies",
    createdAt: "2025-01-20T14:30:00Z",
    updatedAt: "2025-04-10T11:45:00Z",
    content: "Esta política describe los procedimientos para solicitar y aprobar vacaciones...",
    tags: ["recursos humanos", "vacaciones"]
  },
  {
    id: 3,
    title: "Procedimiento de compras",
    category: "procedures",
    createdAt: "2025-03-05T10:15:00Z",
    updatedAt: "2025-05-12T16:20:00Z",
    content: "Este documento detalla el proceso a seguir para realizar compras corporativas...",
    tags: ["finanzas", "compras"]
  },
  {
    id: 4,
    title: "Guía de estilo de marca",
    category: "guides",
    createdAt: "2025-02-28T09:45:00Z",
    updatedAt: "2025-04-25T13:10:00Z",
    content: "Esta guía contiene todos los elementos visuales de nuestra marca...",
    tags: ["marketing", "branding"]
  },
  {
    id: 5,
    title: "Plantilla de propuesta comercial",
    category: "templates",
    createdAt: "2025-01-10T15:20:00Z",
    updatedAt: "2025-03-22T10:30:00Z",
    content: "Utiliza esta plantilla para crear propuestas comerciales profesionales...",
    tags: ["ventas", "propuestas"]
  },
  {
    id: 6,
    title: "Términos y condiciones",
    category: "legal",
    createdAt: "2025-03-15T11:30:00Z",
    updatedAt: "2025-05-05T14:45:00Z",
    content: "Documento legal que establece los términos y condiciones de nuestros servicios...",
    tags: ["legal", "contratos"]
  }
];

// Componente de categoría
function CategoryCard({ category }: { category: Category }) {
  const colorClasses: Record<string, string> = {
    blue: "border-neon-accent/30 bg-neon-accent/10 text-neon-accent shadow-[0_0_15px_rgba(0,225,255,0.1)]",
    green: "border-neon-green/30 bg-neon-green/10 text-neon-green shadow-[0_0_15px_rgba(0,255,157,0.1)]",
    purple: "border-neon-purple/30 bg-neon-purple/10 text-neon-purple shadow-[0_0_15px_rgba(187,0,255,0.1)]",
    yellow: "border-neon-yellow/30 bg-neon-yellow/10 text-neon-yellow shadow-[0_0_15px_rgba(255,234,0,0.1)]",
    red: "border-red-500/30 bg-red-500/10 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.1)]",
  };
  
  const colorKey = category.color as keyof typeof colorClasses;
  const iconClass = `h-10 w-10 ${colorClasses[colorKey].split(" ")[2]}`;
  
  return (
    <Card className={`hover:scale-105 transition-transform cursor-pointer border ${colorClasses[colorKey]}`}>
      <CardContent className="p-6 flex items-center space-x-4">
        <div className={`rounded-full p-2 border ${colorClasses[colorKey].split(" ")[0]} bg-neon-darker`}>
          <FolderOpen className={iconClass} />
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-lg">{category.name}</h3>
          <p className="text-sm text-neon-text/70">{category.count} documentos</p>
        </div>
      </CardContent>
    </Card>
  );
}

// Componente para mostrar la tarjeta de un documento
function DocumentCard({ document }: { document: Document }) {
  const { toast } = useToast();
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Obtener el color según la categoría
  const getCategoryColor = (categoryId: string) => {
    const category = mockCategories.find(cat => cat.id === categoryId);
    return category ? category.color : "blue";
  };
  
  const colorClass: Record<string, string> = {
    blue: "border-neon-accent/30 text-neon-accent",
    green: "border-neon-green/30 text-neon-green",
    purple: "border-neon-purple/30 text-neon-purple",
    yellow: "border-neon-yellow/30 text-neon-yellow",
    red: "border-red-500/30 text-red-500",
  };
  
  const color = getCategoryColor(document.category) as "blue" | "green" | "purple" | "yellow" | "red";
  
  // Formatear fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  return (
    <Card className="bg-neon-darker border-neon-medium/30 hover:shadow-[0_0_15px_rgba(0,225,255,0.1)] transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-neon-text">{document.title}</CardTitle>
            <CardDescription>
              Actualizado: {formatDate(document.updatedAt)}
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-neon-text">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-more-vertical"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-neon-dark border-neon-accent/30">
              <DropdownMenuItem className="text-neon-text hover:text-neon-accent focus:text-neon-accent cursor-pointer">
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem className="text-neon-text hover:text-neon-accent focus:text-neon-accent cursor-pointer">
                <Download className="mr-2 h-4 w-4" />
                Descargar
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-neon-accent/20" />
              <DropdownMenuItem className="text-red-500 hover:text-red-400 focus:text-red-400 cursor-pointer" onClick={() => {
                toast({
                  title: "Documento eliminado",
                  description: `Se ha eliminado "${document.title}"`,
                  variant: "destructive",
                });
              }}>
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex flex-wrap gap-1 mt-1">
          {document.tags.map((tag, index) => (
            <span 
              key={index} 
              className={`text-xs px-2 py-0.5 rounded-full ${colorClass[color]} border bg-neon-medium/10`}
            >
              {tag}
            </span>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <div className={`text-neon-text/80 text-sm ${!isExpanded ? "line-clamp-2" : ""}`}>
            {document.content}
          </div>
          {!isExpanded && document.content.length > 150 && (
            <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-neon-darker to-transparent"></div>
          )}
        </div>
        {document.content.length > 150 && (
          <Button 
            variant="link" 
            onClick={() => setIsExpanded(!isExpanded)} 
            className="mt-1 p-0 h-auto text-neon-accent hover:text-neon-accent/80"
          >
            {isExpanded ? "Ver menos" : "Ver más"}
          </Button>
        )}
      </CardContent>
      <CardFooter className="pt-0 pb-3 text-xs text-neon-text/60 flex justify-between">
        <span>
          {mockCategories.find(cat => cat.id === document.category)?.name}
        </span>
        <span>
          Creado: {formatDate(document.createdAt)}
        </span>
      </CardFooter>
    </Card>
  );
}

// Componente de la página principal de documentación
export default function DocumentationPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showNewDocumentDialog, setShowNewDocumentDialog] = useState(false);
  const [currentTab, setCurrentTab] = useState("all");
  const { isDarkMode } = useTheme();
  
  // Simulación de consulta a la API
  const { data: categories = mockCategories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['/api/documentation/categories'],
    queryFn: async () => {
      // Simulamos una llamada a la API
      return new Promise<Category[]>((resolve) => {
        setTimeout(() => resolve(mockCategories), 500);
      });
    }
  });
  
  // Simulación de carga de documentos
  const { data: documents = mockDocuments, isLoading: isLoadingDocuments } = useQuery({
    queryKey: ['/api/documentation/documents', selectedCategory],
    queryFn: async () => {
      // Simulamos una llamada a la API
      return new Promise<Document[]>((resolve) => {
        setTimeout(() => {
          const filtered = selectedCategory 
            ? mockDocuments.filter(doc => doc.category === selectedCategory)
            : mockDocuments;
          resolve(filtered);
        }, 500);
      });
    }
  });
  
  // Formulario para crear nuevo documento
  const form = useForm<DocumentFormValues>({
    resolver: zodResolver(documentFormSchema),
    defaultValues: {
      title: "",
      category: "",
      content: "",
      tags: "",
    },
  });
  
  // Filtrar documentos según la búsqueda
  const filteredDocuments = documents.filter(doc => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      doc.title.toLowerCase().includes(query) ||
      doc.content.toLowerCase().includes(query) ||
      doc.tags.some(tag => tag.toLowerCase().includes(query))
    );
  });
  
  // Manejar envío del formulario
  const onSubmit = (values: DocumentFormValues) => {
    // Simulamos la creación de un documento
    console.log("Nuevo documento:", values);
    
    toast({
      title: "Documento creado",
      description: `Se ha creado el documento "${values.title}"`,
    });
    
    form.reset();
    setShowNewDocumentDialog(false);
  };
  
  return (
    <div className="container py-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neon-text flex items-center font-mono">
            <Book className="mr-2 text-neon-accent h-6 w-6" />
            Documentación
          </h1>
          <p className="text-neon-text/70 mt-1">
            Base de conocimientos y documentos de la empresa
          </p>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className={cn(
              "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4",
              isDarkMode ? "text-neon-text/50" : "text-gray-400"
            )} />
            <Input 
              placeholder="Buscar documentos..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                "pl-9",
                isDarkMode
                  ? "border-neon-accent/30 bg-neon-medium/10 text-neon-text focus:border-neon-accent"
                  : "border-gray-300 bg-white text-gray-900 focus:border-blue-500"
              )}
            />
          </div>
          
          <Dialog open={showNewDocumentDialog} onOpenChange={setShowNewDocumentDialog}>
            <DialogTrigger asChild>
              <Button 
                className={cn(
                  isDarkMode 
                    ? "bg-neon-accent hover:bg-neon-accent/90 text-neon-dark shadow-[0_0_15px_rgba(0,225,255,0.3)]"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                )}
              >
                <Plus className="mr-1 h-4 w-4" />
                Nuevo
              </Button>
            </DialogTrigger>
            <DialogContent className={cn(
                isDarkMode 
                  ? "bg-neon-darker border-neon-accent/30 text-neon-text"
                  : "bg-white border-gray-200 text-gray-900"
              )}>
              <DialogHeader>
                <DialogTitle className={cn(
                  isDarkMode 
                    ? "text-neon-accent [text-shadow:0_0_10px_rgba(0,225,255,0.3)] font-mono"
                    : "text-blue-600 font-medium"
                )}>Crear nuevo documento</DialogTitle>
                <DialogDescription className={isDarkMode ? "" : "text-gray-600"}>
                  Añade un nuevo documento a la base de conocimientos.
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={isDarkMode ? "text-neon-text" : "text-gray-700"}>Título</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Introduce el título del documento" 
                            className={cn(
                              isDarkMode 
                                ? "border-neon-accent/30 bg-neon-medium/10 text-neon-text focus:border-neon-accent" 
                                : "border-gray-300 bg-white text-gray-900 focus:border-blue-500"
                            )}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-neon-text">Categoría</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="border-neon-accent/30 bg-neon-medium/10 text-neon-text focus:border-neon-accent">
                              <SelectValue placeholder="Selecciona una categoría" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-neon-darker border-neon-accent/30 text-neon-text">
                            {categories.map((category) => (
                              <SelectItem 
                                key={category.id} 
                                value={category.id}
                                className="focus:bg-neon-medium/30 focus:text-neon-accent"
                              >
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-neon-text">Contenido</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Escribe el contenido del documento..." 
                            className="min-h-[200px] border-neon-accent/30 bg-neon-medium/10 text-neon-text focus:border-neon-accent" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="tags"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-neon-text">Etiquetas</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Etiquetas separadas por comas" 
                            className="border-neon-accent/30 bg-neon-medium/10 text-neon-text focus:border-neon-accent" 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription className="text-neon-text/60">
                          Ejemplo: recursos humanos, política, marketing
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter className="pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowNewDocumentDialog(false)}
                      className="border-neon-accent/30 text-neon-text"
                    >
                      Cancelar
                    </Button>
                    <Button 
                      type="submit" 
                      className="bg-neon-accent hover:bg-neon-accent/90 text-neon-dark shadow-[0_0_15px_rgba(0,225,255,0.3)]"
                    >
                      Guardar documento
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {/* Sección de categorías */}
      <h2 className="text-xl font-medium text-neon-text mb-4 flex items-center">
        <FolderOpen className="mr-2 h-5 w-5 text-neon-accent/70" />
        Categorías
      </h2>
      
      {isLoadingCategories ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="bg-neon-darker/50 border-neon-accent/20 animate-pulse">
              <CardContent className="h-24 p-6"></CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {categories.map((category) => (
            <div 
              key={category.id} 
              onClick={() => {
                setSelectedCategory(category.id);
                setCurrentTab("filtered");
              }}
            >
              <CategoryCard category={category} />
            </div>
          ))}
        </div>
      )}
      
      {/* Tabs y documentos */}
      <div className="mt-8">
        <Tabs 
          defaultValue="all" 
          value={currentTab} 
          onValueChange={setCurrentTab}
          className="w-full"
        >
          <div className="flex justify-between items-center mb-4">
            <TabsList className="bg-neon-medium/10 border border-neon-accent/30 p-1 rounded-lg">
              <TabsTrigger 
                value="all" 
                onClick={() => setSelectedCategory(null)}
                className="data-[state=active]:bg-neon-darker data-[state=active]:text-neon-accent data-[state=active]:shadow-[0_0_10px_rgba(0,225,255,0.2)]"
              >
                Todos los documentos
              </TabsTrigger>
              <TabsTrigger 
                value="filtered" 
                disabled={!selectedCategory}
                className="data-[state=active]:bg-neon-darker data-[state=active]:text-neon-accent data-[state=active]:shadow-[0_0_10px_rgba(0,225,255,0.2)]"
              >
                {selectedCategory ? categories.find(c => c.id === selectedCategory)?.name : "Filtrados"}
              </TabsTrigger>
              <TabsTrigger 
                value="recent" 
                onClick={() => setSelectedCategory(null)}
                className="data-[state=active]:bg-neon-darker data-[state=active]:text-neon-accent data-[state=active]:shadow-[0_0_10px_rgba(0,225,255,0.2)]"
              >
                Recientes
              </TabsTrigger>
            </TabsList>
            
            {selectedCategory && (
              <Button 
                variant="ghost" 
                onClick={() => {
                  setSelectedCategory(null);
                  setCurrentTab("all");
                }}
                className="text-neon-text hover:text-neon-accent"
              >
                Limpiar filtro
              </Button>
            )}
          </div>
          
          <TabsContent value="all" className="mt-0">
            {isLoadingDocuments ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Card key={i} className="bg-neon-darker/50 border-neon-accent/20 animate-pulse">
                    <CardHeader className="h-20"></CardHeader>
                    <CardContent className="h-24"></CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredDocuments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredDocuments.map((doc) => (
                  <DocumentCard key={doc.id} document={doc} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-neon-text/30 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-neon-text">No se encontraron documentos</h3>
                <p className="text-neon-text/70">
                  {searchQuery 
                    ? "Intenta cambiar tu búsqueda o quitar los filtros" 
                    : "Comienza añadiendo documentos a la base de conocimientos"}
                </p>
                <Button 
                  className="mt-4 bg-neon-accent hover:bg-neon-accent/90 text-neon-dark shadow-[0_0_15px_rgba(0,225,255,0.3)]"
                  onClick={() => setShowNewDocumentDialog(true)}
                >
                  <FilePlus className="mr-2 h-4 w-4" />
                  Crear documento
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="filtered" className="mt-0">
            {isLoadingDocuments ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Card key={i} className="bg-neon-darker/50 border-neon-accent/20 animate-pulse">
                    <CardHeader className="h-20"></CardHeader>
                    <CardContent className="h-24"></CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredDocuments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredDocuments.map((doc) => (
                  <DocumentCard key={doc.id} document={doc} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-neon-text/30 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-neon-text">No se encontraron documentos</h3>
                <p className="text-neon-text/70">
                  {searchQuery 
                    ? "Intenta cambiar tu búsqueda o quitar los filtros" 
                    : `No hay documentos en la categoría ${selectedCategory ? categories.find(c => c.id === selectedCategory)?.name : ""}`}
                </p>
                <Button 
                  className="mt-4 bg-neon-accent hover:bg-neon-accent/90 text-neon-dark shadow-[0_0_15px_rgba(0,225,255,0.3)]"
                  onClick={() => setShowNewDocumentDialog(true)}
                >
                  <FilePlus className="mr-2 h-4 w-4" />
                  Crear documento
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="recent" className="mt-0">
            {isLoadingDocuments ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Card key={i} className="bg-neon-darker/50 border-neon-accent/20 animate-pulse">
                    <CardHeader className="h-20"></CardHeader>
                    <CardContent className="h-24"></CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mockDocuments
                  .slice()
                  .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                  .slice(0, 4)
                  .map((doc) => (
                    <DocumentCard key={doc.id} document={doc} />
                  ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}