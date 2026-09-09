# ADRs — Punto Fuerte

Decisiones de Arquitectura Registradas (Architecture Decision Records). Estado: **Aceptado** salvo nota.

## ADR-001 — La UI `src/ui` es el producto definitivo (dark theme "Punto Fuerte")

- **Estado**: Aceptado (Ola 0)
- **Contexto**: El repo tiene una app de producción (landing + motor real) y una UI portada (src/ui, tema oscuro). Se pidió que la UI portada luzca como el ejemplo y sea re-brandada a "Punto Fuerte".
- **Decisión**: La UI `src/ui/` es el objetivo; el motor real (`AppContext`/Supabase) se adapta a ella. `App.tsx` será el shell de la UI y montará los providers sobre ella.
- **Consecuencias**: Cambios al motor se hacen en `AppContext`/servicios, nunca degradando la UI. La app de producción antigua permanece hasta que la UI la sustituya en el mismo árbol de rutas.

## ADR-002 — Adapter `UiDataProvider` como único acceso a datos en la UI

- **Estado**: Aceptado (Ola 1)
- **Contexto**: 7 pantallas/modales consumen `mockData` directamente; tipos de presentación difieren de los reales.
- **Decisión**: Ningún componente de la UI importa `mockData` ni `useApp()`; todos usan `useUiData()` de `src/ui/data/store.tsx`. El adapter decide demo/real y mapea formas.
- **Consecuencias**: Fuente de verdad única y testeable; migración progresiva por componente; prohibido (lint social + review) nuevos imports de mockData en componentes.

## ADR-003 — Demostración y datos reales se separan por `isSupabaseEnabled` y autenticación

- **Estado**: Aceptado (Ola 1)
- **Contexto**: Sin keys de Supabase el motor opera en demo; con keys, requiere login.
- **Decisión**:  
  - `!isSupabaseEnabled` → modo demo (seeds de mockData, banner "Modo demo").  
  - `isSupabaseEnabled && !isAuthenticated` → gate `AuthScreen` (login/registro/recuperación + acceso demo).  
  - `isSupabaseEnabled && isAuthenticated` → datos reales mapeados.
- **Consecuencias**: El usuario nunca confunde demo con real. Demo conserva compatibilidad con legacy `fitai_user_v2`.

## ADR-004 — Media de ejercicios: solo dataset Gym Visual, sin recortar, con atribución

- **Estado**: Aceptado (Ola 2)
- **Contexto**: `VideoModal` y thumbnails usan imágenes de googleusercontent con `object-cover` (recorte) sin atribución. El dataset (MIT + media © Gym Visual) no se usa.
- **Decisión**: Todo media de ejercicio proviene del dataset vía `ExerciseImage`: GIF `object-contain` (sin recorte), atribución visible, fallback `onError`. Se elimina el uso de URLs ajenas en el reproductor.
- **Consecuencias**: Cumplimiento de licencia; consistencia de media; ~1.77 MB de JSON cargado lazy solo en Biblioteca.

## ADR-005 — Biblioteca dentro del tab Rutinas (toggle), no un quinto tab

- **Estado**: Aceptado (Ola 2)
- **Contexto**: BottomNav tiene 4 tabs; añadir un quinto tab degradaría la UX y el layout elegido.
- **Decisión**: `RutinasScreen` incorpora un toggle `[Rutinas | Biblioteca]`; la biblioteca es una sección interna.
- **Consecuencias**: BottomNav intacto; navegación interna simple; "añadir ejercicio a rutina" fluye dentro del mismo contexto.

## ADR-006 — `todayCalories` = historial del día + acumulador local; NUTRICIÓN no se modela aún

- **Estado**: Aceptado (Ola 1)
- **Contexto**: No existe módulo de nutrición; la UI muestra "calorías quemadas hoy".
- **Decisión**: Sumar calorías de sesiones reales de hoy + acumulador `puntofuerte_extra_calories` (QuickMeal + cierre de entrenamiento).
- **Consecuencias**: Value honesto en modo real; demo usa seed. Ola 4+ puede ampliar a nutrición real.

## ADR-007 — Las migraciones SQL no se aplican en Olas 0-2

- **Estado**: Aceptado (Ola 0)
- **Contexto**: Scripts de roles/club/RLS están listos para ejecutar.
- **Decisión**: Solo documentación. La aplicación de migraciones queda para Ola 5 en un entorno controlado.
- **Consecuencias**: Riesgo cero de cambios de esquema no deseados durante el refactor de UI.