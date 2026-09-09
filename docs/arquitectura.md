# Arquitectura Punto Fuerte (Ola 0)

> Versión 1 — Olas 0-2. Documento vivo: se actualiza con cada ola.

## 1. Principios

1. **La UI portada (src/ui) es el producto definitivo.** El motor real (AppContext + Supabase) se adapta a ella, no al revés.
2. **Un solo punto de entrada de datos para la UI.** Ningún componente conoce `mockData` ni `AppContext`: todos consumen el adapter `useUiData()`.
3. **Demo ≠ Real, visible y separable.** Sin Supabase → modo demo con seeds; con Supabase → datos reales por usuario autenticado. Indicador "modo demo" siempre visible.
4. **Kaizen:** cada cambio pequeño + verificación (`tsc -b`, lint, test, build, smoke visual). Sin commits intermedios salvo petición.
5. **Media con licencia.** GIFs solo del dataset de Gym Visual, con `object-contain`, atribución y fallback.

## 2. Mapa de componentes

```
main.tsx
└── App.tsx                  (UI portada: tabs, modales, estado de pantalla)
    ├── AppProvider           (real: motor de datos/auth — src/context)
    │   └── isSupabaseEnabled (desde supabaseClient)
    ├── UiDataProvider        (adapter demo/real → useUiData) — src/ui/data/store.tsx
    │   ├── Header
    │   ├── HoyScreen
    │   ├── EntrenarScreen
    │   ├── RutinasScreen ─── BibliotecaScreen (toggle interno)
    │   ├── ProgresoScreen
    │   └── modales (11)
    └── AuthScreen            (gate cuando supabase activo y no autenticado)
```

## 3. Capa adapter (`src/ui/data/store.tsx`)

Es la frontera entre presentación y lógica. Decide el origen de datos según:

| Condición | Origen |
|---|---|
| `!isSupabaseEnabled` | **Demo**: seeds de mockData (name/weight desde legacy `fitai_user_v2`) |
| `isSupabaseEnabled && !isAuthenticated` | **Auth gate**: mostrar login/registro |
| `isSupabaseEnabled && isAuthenticated` | **Real**: mapeo de `AppContext` → shapes de UI |

### Mappers (demo | real)
- `dailyRoutinesToUiRoutines(DailyRoutine[])` → `Routine[]` (tarjetas RutinasScreen).
- `exerciseToUiExercise(Exercise)` → `Exercise` ui (sets por `sets`/`reps`/`suggestedWeightKg`; `gifUrl`/`image`/`attribution` del dataset).
- `recordsToUiRecords(PersonalRecord[])` → `PersonalRecord[]` ui (`recordValue` "105 kg" → `weight`/`unit`).
- `workoutSessionsToHistory(WorkoutSessionLog[])` → tarjetas Historial (título, fecha, duración, calorías, volumen, tag, icono).
- `historyToWeeklyVolume(WorkoutSessionLog[])` → `WeeklyVolume[]` de las últimas 4 semanas.
- `historyToMonthCalendar(WorkoutSessionLog[])` → días del mes actual con activos marcados.

### Estado local del adapter (fuera del motor real)
- `extraCalories` (acumulador de `QuickMealModal` + cierre de entrenamiento) en localStorage `puntofuerte_extra_calories`.
- `customRoutines` (rutinas creadas por `CreateRoutineModal`) en memoria/localStorage `puntofuerte_custom_routines` (persistencia real en Ola 4+).

## 4. Auth

- `isSupabaseEnabled` = `Boolean(VITE_SUPABASE_URL) && Boolean(VITE_SUPABASE_ANON_KEY)`.
- Demo: `DEMO_EMAIL='demo@fitai.app'`, `DEMO_PASSWORD='fitai-demo-2026'`.
- Flujo: AuthScreen → `loginDemoUser()` | `loginWithEmail()` | `registerWithEmail()` → AppContext hidrata → UI muestra datos. `logout()` vuelve al gate.
- Sin env de Supabase → no hay gate; se muestra modo demo directamente.

## 5. Persistencia

- `usePersistedState` (AppContext) con keys `fitai_*` (debounce 300ms). La UI no persiste por su cuenta salvo extra/custom routines (claves `puntofuerte_*`).
- Nunca mezclar: demo escribe/lee solo si no hay supabase; con supabase los datos vienen del motor (localStorage es caché del engine, no fuente de verdad).

## 6. Media de ejercicios (Ola 2)

- Dataset: `exercisesDatabase.json` (~1.77 MB, 1.324 ejercicios) en `public/` y CDN jsdelivr.
- **Lazy-load**: solo al abrir Biblioteca (skeleton + `loadExerciseDatabase()`).
- Componente `ExerciseImage`: GIF `object-contain` en contenedor `aspect-square`/`aspect-video`, atribución (campo `attribution` del dataset), fallback `onError` a imagen estática y de último a placeholder con icono.
- Se usa en `VideoModal`, thumbnails de Rutinas/Entrenar y cards de Biblioteca.

## 7. Screens de la UI (contratos)

| Screen | Fuente principal (adapter) | Pasos de inserción |
|---|---|---|
| Header | perfil (nombre, avatar) | 1 |
| HoyScreen | perfil + todayCalories + próxima rutina + última actividad | 1 |
| EntrenarScreen | ejercicios de la rutina activa + GIFs + sets | 1 (datos), 2 (GIFs) |
| RutinasScreen | lista de rutinas (tarjetas) | 1 |
| BibliotecaScreen (nueva) | dataset lazy | 2 |
| ProgresoScreen | PRs, weight, weeklyVolumes, calendario mensual | 1 (datos), 3+ (gráficos ricos) |

## 8. Verificación por iteración

```
npx.cmd tsc -b
npm.cmd run lint
npm.cmd test
npm.cmd run build
dev server + smoke visual (Render, modales, GIF, auth)
```

## 9. Fuera de alcance en Olas 0-2 (pero documentado)
- Migraciones SQL multi-tenant (listas, no aplicadas) → Ola 5.
- Chat coach real en la UI (Chat real en AppContext) → Ola 4.
- Rutinas custom persistidas en Supabase → Ola 4.
- Worker de media propio → Ola 3.