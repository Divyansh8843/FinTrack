"use client";

import { useEffect, useRef, createContext, useContext } from "react";
import Lenis from "lenis";

interface LenisProviderProps {
  children: React.ReactNode;
}

// Create context for Lenis instance
const LenisContext = createContext<Lenis | null>(null);

export default function LenisProvider({ children }: LenisProviderProps) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Initialize Lenis for smooth scrolling
    lenisRef.current = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    // Expose Lenis instance globally for utility functions
    if (typeof window !== "undefined") {
      (window as any).__LENIS__ = lenisRef.current;
    }

    // RAF loop for Lenis
    function raf(time: number) {
      lenisRef.current?.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Cleanup function
    return () => {
      if (lenisRef.current) {
        lenisRef.current.destroy();
      }
      // Remove global reference
      if (typeof window !== "undefined") {
        delete (window as any).__LENIS__;
      }
    };
  }, []);

  return (
    <LenisContext.Provider value={lenisRef.current}>
      {children}
    </LenisContext.Provider>
  );
}

// Export the Lenis context and hook
export { LenisContext };
export const useLenis = () => useContext(LenisContext);
