# Directrices del Proyecto - ACME Learning Center

## Arquitectura y Patrones
- El proyecto utiliza **Domain-Driven Design (DDD)** con una arquitectura en capas y basada en componentes.
- Paradigma: Programación Orientada a Objetos (OOP) y Patrones de Diseño.
- Patrones obligatorios: Request/Response, Resource, Assembler, Api, Endpoint y Store (usando Angular Signals).
- Jamás hardcodear URLs o PATHs; usar siempre variables de entorno (`environment`).

## Estructura de Carpetas (Bounded Contexts)
Cada sub-dominio (ej. `learning`, `iam`, `shared`) debe tener estrictamente este primer nivel de carpetas:
1. `/domain`: Modelos y entidades.
2. `/application`: Stores y lógica de estado.
3. `/infrastructure`: APIs, Endpoints, Requests, Responses y Assemblers.
4. `/presentation`: Interfaz de usuario, subdividido en:
  - `/views`: Solo componentes asociados directamente a rutas de navegación.
  - `/components`: Componentes reutilizables que van dentro de las vistas (no enrutados directamente).

## Estado Actual: MOCK DATA (Prioridad Frontend)
- **IMPORTANTE:** Actualmente estamos enfocados netamente en el diseño y maquetación del Frontend.
- El backend está en proceso de actualización. Por lo tanto, **toda la data mostrada en la UI debe ser Mock Data** (datos incrustados de prueba).
- Si necesitas crear un componente visual, inyéctale data estática temporalmente o utiliza el `Store` devolviendo Signals con arrays hardcodeados en lugar de hacer la petición HTTP real, hasta nuevo aviso.

# Respuesta
- Cuando te hable en inglés respondeme en español
