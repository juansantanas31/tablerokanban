"use client";

import { useState, useCallback } from "react";

/**
 * Hook para manejar localStorage con mejora progresiva y manejo seguro de fallos.
 * Cumple con la Sección 5 (API del navegador: localStorage).
 */
export function useLocalStorage<T>(
  key: string,
  valorInicial: T
): [T, (valor: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return valorInicial;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : valorInicial;
    } catch (error) {
      console.warn(`[useLocalStorage] No se pudo leer "${key}":`, error);
      return valorInicial;
    }
  });

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
