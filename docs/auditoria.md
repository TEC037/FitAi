# Auditoría Punto Fuerte — Matriz de Brechas (Ola 0)

> Estado: Olas 0 y 1 completadas + auditoría en navegador (playwright). Fecha: 2026-09-09.
> Objetivo: inventariar el estado actual del repo y documentar las brechas entre la UI portada (src/ui, dark, "Punto Fuerte") y el motor real de datos/entrenamiento (AppContext + Supabase + motor de rutinas), priorizando el alcance aprobado: **Olas 0-2**.

---

## 8. Auditoría en navegador de la solución Ola 1 (2026-09-09)

> Procedimiento (skill Playwright): login con usuario real migrado (`l3onardo9208@gmail.com`), modo demo,
> guardado de rutina + recuperación tras cierre de sesión, y validación de coherencia de datos.

### 8.1 Resultados verificados

| # | Verificación | Resultado |
|---|---|---|
| A1 | Gate de auth con Supabase habilitado | ✅ Redirige a AuthScreen; login con usuario migrado muestra su perfil ("José") sin badge demo |
| A2 | Recuperación de rutinas del usuario migrado | ⚠️ La DB migrada **no contiene rutinas** (`routines query → []`): historial, sesiones, PRs, peso y chat también vacíos. Confirmado el riesgo previo de migración |
| A3 | Crash en RutinasScreen con rutinas vacías | 🔴→✅ **Bug P0 corregido**: `featuredRoutine` indefinido rompía el árbol (`Cannot read properties of undefined (reading 'imageUrl')`). Ahora hay empty-state honesto ("Tu plan aún no tiene rutinas" + "Crear mi primera rutina") |
| A4 | Fallback fake en HoyScreen | 🔴→✅ **Bug P0 corregido**: la sesión hardcodeada "Torso Potencia…" se eliminó; ahora banner honesto "Aún no tienes una sesión programada" y grid semanal derivado de datos reales (0/7 cuando no hay actividad) |
| A5 | Guardado de rutina y recuperación | ✅ Rutina creada vía modal aparece destacada+lista y **persiste tras logout/login** (localStorage `puntofuerte_custom_routines`) |
| A6 | Persistencia real de rutinas custom | ⚠️ **Gap**: las rutinas custom viven solo en localStorage (global del navegador); no llegan a Supabase (Ola 4) y **se filtran entre usuarios/demo del mismo navegador** |
| A7 | Coherencia del modo demo | 🔴→✅ **Bug P0 corregido**: con Supabase habilitado, `loginDemoUser` autenticaba la cuenta demo real y el store la trataba como cuenta REAL → Progreso en 0. Se añadió el flag `isDemoUser` (persistido `fitai_demo_v2`) y un dataset demo **generado con fechas reales** (`buildDemoSessions`, PRNG determinista) |
| A8 | Racha en Progreso | 🔴→✅ "Racha: 18 días" hardcodeado eliminado → deriva de `profile.currentStreakDays` (demo: 5, real: 0) |
| A9 | Calendario / volumen / tonelaje del mes | ✅ Dinámicos del mes actual (demo: "Septiembre: 7 días activos", 51.3 t, Semana 2; real: 0/0/0) |
| A10 | Media Entrenar/GIF + atribución | ✅ GIF dataset con atribución "© Gym visual" en cards y VideoModal (fallback en `onError`) |
| A11 | `persistRoutines` con lista vacía | ⚠️ Riesgo documentado: borra todas las rutinas del user si la lista se serializa vacía (DELETE /routines visto; benigno en el flujo auditado) |
| A12 | Recarga de sesión demo | ✅ `isDemoUser` persiste; la demo sobrevive a recargas sin volverse "real" |

### 8.2 Cambios introducidos por esta auditoría

- `src/context/AppContext.tsx`: nuevo `isDemoUser` (estado persistido `fitai_demo_v2`), seteado en `loginDemoUser`
  (rama Supabase fallback + rama local), `resetToDemoData`, y detectado en `applyHydration` vía `email === DEMO_EMAIL`;
  reseteado en `loginWithEmail`/`registerWithEmail`/`logout`.
- `src/ui/data/store.tsx`: `real = isAuthenticated && !isDemoUser`; `isAuthenticated` (gate) = `app.isAuthenticated`;
  `buildDemoSessions()` + `buildDemoWeightHistory()` (fechas reales, PRNG determinista) alimentan perfil,
  calorías de hoy, `weeklyVolumes`, `monthCalendarDays`, `history`, `weekSchedule` de la demo; se eliminaron
  `demoWeekSchedule`, `DEMO_PROFILE`, `DEMO_HISTORY` y las constantes huérfanas (`WEEKLY_VOLUMES`, `CALENDAR_OCTOBER_DAYS`).
- `src/ui/components/ProgresoScreen.tsx`: racha hardcodeada → `profile.currentStreakDays`.
- `src/config/constants.ts`: `STORAGE_KEYS.DEMO`.
- Regresión: `tsc -b` ✅, eslint 0 errores (warnings preexistentes documentados) ✅, 199 tests ✅, build ✅.

### 8.4 Iteración kaizen (2026-09-09) — hallazgos H1..H6

> Guía: `gym-rutinas-deep-research.md`. Orden de ejecución (H1→H6). Estados: ✅ verificado, 🟡 código listo pendiente de aplicar en Supabase, 🔴 pendiente.

| # | Hallazgo | Estado |
|---|---|---|
| H1 | `persistRoutines` podía BORRAR todo el plan si la lista se serializaba vacía | ✅ `allowClear` explícito; lista vacía = no-op cuando no se pasa la opción |
| H2 | Rutinas custom en localStorage global → se filtraban entre demo/usuarios | ✅ Claves por scope: `puntofuerte_custom_routines:<scope>` (`demo` / `user:<id>` / `guest`) con fallback a la clave legada |
| H3 | Rutinas custom solo en localStorage; no llegaban a Supabase | ✅ Tabla `custom_routines` (RLS, índice, unique `(user_id, client_id)`) + `hydrateCustomRoutines`/`persistCustomRoutines` + sync en store. **Verificado en navegador**: crear → recargar → restaurar borrando el localStorage del scope (viene de la DB) |
| H4 | Usuario migrado sin datos iniciales (historial, sesiones, peso, chat) | 🔴 Requiere migración/seed en Supabase (función en `0003_*)` o asistida |
| H5 | Chat "Notas Coach" era mock (notas hardcodeadas de "Carlos"/"Coach Marcos") | ✅ `CoachNotesModal` convertido en **chat real del Coach IA**: lista `chatMessages`, input + send, indicador escribiendo…, autoscroll, aviso médico, persistencia (localStorage + Supabase vía `persistChat`), y responde por `sendCoachMessage` (serverless con fallback motor local). **Verificado en navegador** previa/recarga con usuario real |
| H6 | Biblioteca de ejercicios (Ola 2) | 🔴 Lazy + dataset Gym Visual + añadir-a-rutina |

Nuevo hallazgo en la verificación de H3: el botón "Opciones de rutina" (`more_vert` en `RutinasScreen.tsx:324`)
**no tiene `onClick`** → sin forma de editar/eliminar una rutina custom una vez creada. Se tratará junto a H4.

### 8.3 Pendientes para Olas posteriores

- Ola 2: biblioteca de ejercicios (lazy) con añadir-a-rutina (H6).
- Ola 4: H4 (seed datos migrado), editar/eliminar rutinas custom (`more_vert` inerte).

---

---

## 1. Resumen ejecutivo

| Capa | Estado | Observación |
|---|---|---|
| UI portada (18 archivos `src/ui/`) | ✅ Portada y verificada | Tema oscuro, branding Punto Fuerte, 4 tabs, lint limpio, 199 tests OK |
| Motor de datos real (`AppContext`, Supabase, persistencia) | 🔴 Presente pero **no montado** en la UI | `AppProvider` solo envuelve la app de producción (`landing`), no la UI nueva |
| Datos que muestra la UI | 🟡 100 % mock / hardcodeados en `mockData.ts` | 7 pantallas/modales leen de `mockData` directamente |
| Autenticación | 🟡 Existe backend (Supabase + demo) pero **sin UI de acceso** | La app de producción tiene login; la UI nueva no |
| Media de ejercicios (GIFs) | 🔴 Deficit | La UI usa URLs hardcodeadas de googleusercontent; el dataset (GIFs con licencia) **no se usa** en la UI |
| Biblioteca de ejercicios | 🔴 No existe en la UI | El servicio `exerciseDatabaseService` + `public/exercisesDatabase.json` (1.324 ejercicios) no están conectados |
| Motor de rutinas / IA | 🟡 Implementado (rutina semanal + notas coach) pero **no integrado** | `routineGenerator` / `llmService` / `functions/api/coach.ts` operan sobre la app de producción |
| SQL de rolamiento multi-tenant | 🟡 Documentado, **NO aplicado** | Migraciones master.club_role/*listas para aplicar; fuera del alcance de Olas 0-2 |
| Tests | ✅ 199 tests, 23 files | Solo 2-3 errores lint preexistentes en archivos no tocados (ver §6) |
| Build / typecheck | ✅ Vite build OK, `tsc -b` OK | Dev server renderiza solo con 404 de favicon (inexistente) |

---

## 2. Arquitectura actual (mapa de archivos)

- **Entrada**: `index.html` → `src/main.tsx` → `src/App.tsx` + `src/index.css`.
  - `App.tsx` (app de producción/landing): monta `AppProvider`, pantalla de registro, dashboard. **No usa la UI portada**.
- **UI portada** (`src/ui/`): la app visual que es el objetivo final. Contiene:
  - `data/mockData.ts` — seeds demo (perfil, rutinas, records, ejercicios, calendario).
  - `types.ts` — tipos de presentación (Routine, PersonalRecord, WeeklyVolume, Exercise, etc.).
  - `components/` — Header, BottomNav, HoyScreen, EntrenarScreen, RutinasScreen, ProgresoScreen.
  - `components/modals/` — 11 modales (Weight, QuickMeal, CoachNotes, History, CreateRoutine, FinishWorkout, ExportPdf, Video, Notifications, Profile, NewPr).
- **Motor de datos real** (`src/context/`):
  - `AppContext.tsx` — estado raíz persistido (`usePersistedState`): perfil, rutinas, historial, records, peso, chat, workout activo con snapshot; auth (demo + Supabase login/register/logout); acciones (`loginDemoUser`, `startWorkout`, `logActiveSet`, `finishWorkout`, `updateUserProfile`, `addExerciseToRoutine`, etc.).
  - `useApp.ts` — hook `useApp()` que expone el contexto.
- **Backend**: `src/lib/supabaseClient.ts` (cliente lazy + `isSupabaseEnabled`), `src/lib/supabaseService.ts`, `functions/api/coach.ts` (endpoint serverless con fallback a motor de reglas).
- **Servicios**: `exerciseDatabaseService.ts` (carga lazy del dataset + traducciones), `routineGenerator` / `llmService` / `personality` / `trainingStreak` / `routineImport` / `routineShare`.
- **Tipos reales**: `src/types/index.ts` (`UserProfile`, `DailyRoutine`, `Exercise`, `DatasetExercise`, `PersonalRecord`, `WorkoutSessionLog`…).

### Flujo de datos hoy (producción)
`AppContext` (persistido en localStorage `fitai_*`) → pantalla personalizada por perfil → rutinas de la semana → workout activa (snapshot en localStorage) → historial + records. Chat coach: `sendCoachMessage` → `/api/coach`.

### Flujo de datos de la UI portada (hoy)
`mockData` hardcodeado → render directo. **Ningún camino entre la UI y el motor real.**

---

## 3. Matriz de brechas (alcanzables en Olas 0-2)

| # | Área | Estado actual | Evidencia | Impacto | Prioridad | Dependencias | Criterio de aceptación |
|---|---|---|---|---|---|---|---|
| B1 | Datos en pantallas | Hoy/Header/Progreso/Entrenar/Rutinas/Profile/ExportPdf leen `mockData` o props con defaults mock | `HoyScreen.tsx:2`, `Header.tsx:2`, `ProgresoScreen.tsx:3-7`, `EntrenarScreen.tsx:3`, `RutinasScreen.tsx`, `ProfileModal.tsx:2`, `ExportPdfModal.tsx:2` | Toda la UI muestra datos falsos estáticos | **Alta** | `AppContext` montado en la UI | Pantallas consumen `useUiData()` (adapter) con demo/real automático; ningún import directo de `mockData` en componentes |
| B2 | Auth sin UI | La UI nueva no tiene login/registro/recuperar | `App.tsx` (UI) solo maneja tabs/modales | Sin acceso, el usuario no puede entrar a su cuenta ni registrarse | **Alta** | B1 (store) | Pantalla Auth con login/registro/recuperación/logout y botón demo; acciones reales de `AppContext` |
| B3 | Separación demo vs real | No hay indicador de modo; la UI asume datos de ejemplo | `mockData.ts` lee legacy `fitai_user_v2` | Confusión: el usuario cree que sus datos demo son reales | **Alta** | B1 | Banner/aviso "Modo demo" visible cuando `!isSupabaseEnabled`; datos demo separados de persistencia real |
| B4 | GIFs/sin recortar | `VideoModal` usa imagen estática de googleusercontent con `object-cover` (recorta); no hay GIF real | `VideoModal.tsx:37-60`, `RutinasScreen`, thumbnails de rutinas | Media recortado/incorrecto, sin atribución (licencia) | **Alta** | Ola 2 (datos dataset) | Ver GIF del dataset en modal, thumbnails y cards con `object-contain`, atribución y fallback en `onError` |
| B5 | Biblioteca de ejercicios | No existe en la UI; dataset (1.324 ejercicios) accesible vía servicio lazy | `src/services/exerciseDatabaseService.ts` + `public/exercisesDatabase.json` (~1.77 MB) | Sin explorar/añadir ejercicios | **Media** | B4 (ExerciseImage) | Pantalla Biblioteca con lazy-load, búsqueda/filtros/favoritos y "añadir a rutina" |
| B6 | Historial de entrenamientos real | `HistoryModal` y "Actividad Reciente" usan historial fabricado | `HistoryModal.tsx:11-52`, `HoyScreen.tsx:281-337` | El historial no refleja lo entrenado | **Media** | B1 | HistoryModal y actividad reciente leen historial real (con fallback demo) |
| B7 | Peso persistido | `WeightModal` actualiza estado local de `App.tsx`; no toca el perfil real | `App.tsx:27,155-160` | El peso no persiste ni entra en `weightHistory` | **Media** | B1 | Guardar peso → `updateUserProfile({weight})` real (append a weightHistory) |
| B8 | Calories de hoy | `QuickMealModal` + fin de entrenamiento acumulan en estado local de `App` | `App.tsx:28,74-82,93-95` | No persisten entre recargas | **Baja** | B1 | `todayCalories` = suma historial de hoy + acumulador local persistido |
| B9 | Progreso/volúmenes semanales | `ProgresoScreen` usa `WEEKLY_VOLUMES` y calendario fijo "octubre" | `ProgresoScreen.tsx:3-29` | Gráficos no reflejan la actividad real | **Baja** (decorativo; Ola 3+ para datos ricos) | B1 | WeeklyVolumes y calendario derivados del historial real en modo real (demo conserva seeds) |
| B10 | Nueva rutina personalizada | `CreateRoutineModal` solo agrega a estado local de `App` | `App.tsx:89-91` | Rutina no persiste en el plan real | **Baja** (requiere modelo de rutinas custom en Supabase) | B1 | Ola 2: la rutina creada se agrega al store; persistencia real documentada para Ola 4+ |

---

## 4. Brechas detectadas fuera de Olas 0-2 (documentadas, NO ejecutadas)

| # | Área | Hallazgo | Recomendación |
|---|---|---|---|
| D1 | SQL multi-tenant/roles | Migraciones listas (roles, club, RLS) pero **no aplicadas** | Ola 5: aplicarlas + documentar flujo completo |
| D2 | Persistencia de rutinas custom | AppContext solo persiste rutinas generadas/importadas; no existe acción `createRoutine` | Ola 4: modelar `custom_routines` + sync |
| D3 | Optimización de media | GIFs se sirven desde CDN jsdelivr (1.77 MB JSON + media por ejercicio) | Ola 2/3: worker de CDN propio + precarga por rutina |
| D4 | Calendario "octubre" hardcodeado | `CALENDAR_OCTOBER_DAYS` es fijo | Reemplazar por calendario del mes actual derivado de historial (B9) |
| D5 | Coach en la UI | CoachNotes es estático; el chat real (`chatMessages`/`sendCoachMessage`) no está conectado | Ola 4: conectar loop de chat coach en la UI |
| D6 | Logout en UI | No hay botón de logout en la UI portada (solo existe acción en AppContext) | Ola 1 K1.2 (en alcance) |
| D7 | Racha de días | La UI muestra "18 días" hardcode; existe `trainingStreak` util | Ola 1/3: calcular racha real desde historial |

---

## 5. Inventario de pruebas actual

- **Suites**: `AppContext.test.tsx`, `supabaseService.test.ts`, `routineGenerator.test.ts`, `app.test.tsx` (regresión), test utils. Total **23 archivos / 199 tests**.
- **Comandos**: `npm.cmd test` (vitest), `npx.cmd tsc -b`, `npm.cmd run lint`, `npm.cmd run build`.
- **Brechas de testing**: no hay tests para `src/ui/*` ni para el nuevo adapter (`store.tsx`). Verificar pantallas por build + smoke visual.

---

## 6. Errores lint preexistentes (NO tocados, se documentan para Ola 3+)

| Archivo | Línea | Error |
|---|---|---|
| `src/hooks/usePersistedState.ts` | 38 | "Cannot access refs during render" |
| `src/lib/supabaseService.test.ts` | — | 16 × `no-explicit-any` |
| `src/utils/routineGenerator.test.ts` | 18 | `no-explicit-any` |

Estos archivos no se modifican en Olas 0-2 para no contaminar el diff con ruido de lint.

---

## 7. Notas de licencia (crítica para Ola 2)

- Dataset: **MIT** para código/estructura/instrucciones. **Media (imágenes/GIFs) © Gym visual** — permiso 180×180 con **atribución obligatoria**.
- La UI **debe** mostrar la atribución provista por el dataset (campo `attribution`) junto a cada GIF/imagen, y no romperla en el fallback.
- Fuente: `https://github.com/hasaneyldrm/exercises-dataset`, CDN usado: `https://cdn.jsdelivr.net/gh/hasaneyldrm/exercises-dataset@main/`.