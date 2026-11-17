"use client";

import { useState, useCallback, useEffect } from "react";

/**
 * Hook para manejar localStorage con mejora progresiva y manejo seguro de fallos.
 * Cumple con la Sección 5 (API del navegador: localStorage) evitando errores de hidratación SSR.
 */
export function useLocalStorage<T>(
  key: string,
  valorInicial: T
): [T, (valor: T | ((val: T) => T)) => void] {
  // Inicializar siempre con valorInicial tanto en servidor como en el primer render de hidratación
  const [storedValue, setStoredValue] = useState<T>(valorInicial);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item !== null) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setStoredValue(JSON.parse(item) as T);
      }
    } catch (error) {
      console.warn(`[useLocalStorage] No se pudo leer "${key}":`, error);
    }
  }, [key]);

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        setStoredValue((prev) => {
          const valueToStore = value instanceof Function ? value(prev) : value;
          if (typeof window !== "undefined" && "localStorage" in window) {
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
          }
          return valueToStore;
        });
      } catch (error) {
        console.warn(`[useLocalStorage] Error al guardar en "${key}":`, error);
      }
    },
    [key]
  );

  return [storedValue, setValue];
}
