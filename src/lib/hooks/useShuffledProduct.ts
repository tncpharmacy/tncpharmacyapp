import { useEffect, useRef, useState } from "react";

export function useShuffledProduct<T>(items: T[], storageKey: string): T[] {
  const [shuffled, setShuffled] = useState<T[]>([]);
  const hasShuffledRef = useRef(false);

  useEffect(() => {
    if (!items || items.length === 0) return;

    // Prevent multiple shuffles in one render cycle
    if (hasShuffledRef.current) return;
    hasShuffledRef.current = true;

    // 🌀 Always reshuffle on page reload (new random)
    const shuffledItems = [...items].sort(() => Math.random() - 0.5);
    setShuffled(shuffledItems);

    // 🧠 Save for session stability (optional)
    sessionStorage.setItem(storageKey, JSON.stringify(shuffledItems));
  }, [items, storageKey]);

  return shuffled.length > 0 ? shuffled : items;
}
