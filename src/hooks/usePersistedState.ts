import { useState, useEffect, Dispatch, SetStateAction } from 'react';

interface UsePersistedStateOptions<T> {
  /** Custom serialization (default: JSON.stringify). 'currentScreen' guarda texto plano. */
  serialize?: (value: T) => string;
  /** Custom parsing al restaurar (default: JSON.parse). */
  parse?: (raw: string) => T;
}

function resolveDefault<T>(value: T | (() => T)): T {
  return typeof value === 'function' ? (value as () => T)() : value;
}

function defaultParse<T>(raw: string): T {
  return JSON.parse(raw) as T;
}

/**
 * useState con persistencia en localStorage: hidrata desde la clave al montar y
 * escribe en cada cambio. Fallback silencioso al valor por defecto ante cualquier
 * error (storage ausente, JSON corrupto o cuota superada).
 *
 * Nota: serialize/parse deben ser estables (módulo/useCallback) para no re-ejecutar
 * el efecto de persistencia en cada render.
 */
export function usePersistedState<T>(
  key: string,
  defaultValue: T | (() => T),
  options: UsePersistedStateOptions<T> = {}
): [T, Dispatch<SetStateAction<T>>] {
  const { serialize = JSON.stringify, parse = defaultParse } = options;

  const [value, setValue] = useState<T>(() => {
    try {
      const saved = localStorage.getItem(key);
      if (saved === null) return resolveDefault(defaultValue);
      return parse(saved);
    } catch {
      return resolveDefault(defaultValue);
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, serialize(value));
    } catch {
      // Persistencia opcional: si falla, la app sigue funcionando en memoria.
    }
  }, [key, value, serialize, parse]);

  return [value, setValue];
}
