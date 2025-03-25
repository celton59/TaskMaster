/**
 * Punto de entrada principal para el sistema de agentes
 * Exporta todas las clases y funciones necesarias
 */

// Exportar el orquestador
export { orchestrator } from './orchestrator/AgentOrchestrator';

// Exportar los tipos comunes
export * from './types/common';

// Exportar los agentes especializados
export { TaskAgent } from './specialized/TaskAgent';
// A medida que se vayan creando más agentes, exportarlos aquí
// export { CategoryAgent } from './specialized/CategoryAgent';
// etc.

// Exportar las herramientas
export { taskTools } from './tools/TaskTools';
// A medida que se vayan creando más herramientas, exportarlas aquí
// export { categoryTools } from './tools/CategoryTools';
// etc.

// Exportar funciones utilitarias
export * from './utils/priority';