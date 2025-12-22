import { useEffect } from "react";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useClickOutside(ref: any, handler: () => void) {
  useEffect(() => {
    const listener = (e: MouseEvent) => {
      if (!ref.current || ref.current.contains(e.target)) return;
      handler();
    };
    document.addEventListener("mousedown", listener);
    return () => document.removeEventListener("mousedown", listener);
  }, [ref, handler]);
}
