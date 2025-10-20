import { useState } from 'react';

/**
 * Hook simples para substituir useKV do @github/spark
 * Usa apenas useState local
 */
export function useKV<T>(key: string, defaultValue: T): [T, (value: T) => void] {
  const [value, setValue] = useState<T>(defaultValue);
  return [value, setValue];
}
