// hooks/useShuffledOnce.ts
import { useEffect, useState } from "react";

export const useShuffledOnce = <T>(key: string, data: T[] = []): T[] => {
  const [shuffled, setShuffled] = useState<T[]>([]);

  useEffect(() => {
    if (!data || data.length === 0) return;

    // Check existing shuffle in localStorage
    const saved = localStorage.getItem(`shuffled_${key}`);
    if (saved) {
      setShuffled(JSON.parse(saved));
      return;
    }

    // Create new shuffle (only on reload)
    const newShuffle = [...data].sort(() => Math.random() - 0.5);
    setShuffled(newShuffle);
    localStorage.setItem(`shuffled_${key}`, JSON.stringify(newShuffle));
  }, [key, data]);

  // Reset shuffle on page reload (only once per full reload)
  useEffect(() => {
    const resetOnUnload = () => {
      localStorage.removeItem(`shuffled_${key}`);
    };
    window.addEventListener("beforeunload", resetOnUnload);
    return () => window.removeEventListener("beforeunload", resetOnUnload);
  }, [key]);

  return shuffled;
};
