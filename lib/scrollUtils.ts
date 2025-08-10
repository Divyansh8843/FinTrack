// Utility functions for smooth scrolling
import type Lenis from "lenis";

declare global {
  interface Window {
    __LENIS__?: Lenis;
  }
}

/**
 * Smooth scroll to top of the page
 */
export const scrollToTop = () => {
  // Use Lenis if available, fallback to native smooth scroll
  if (typeof window !== "undefined") {
    // Try to find Lenis instance
    const lenisInstance = window.__LENIS__;

    if (lenisInstance) {
      lenisInstance.scrollTo(0, {
        duration: 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      });
    } else {
      // Fallback to native smooth scroll
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }
};

/**
 * Smooth scroll to a specific element
 */
export const scrollToElement = (elementId: string, offset: number = 0) => {
  if (typeof window !== "undefined") {
    const element = document.getElementById(elementId);
    if (element) {
      const lenisInstance = window.__LENIS__;

      if (lenisInstance) {
        const rect = element.getBoundingClientRect();
        const scrollTop = window.pageYOffset + rect.top - offset;

        lenisInstance.scrollTo(scrollTop, {
          duration: 1.2,
          easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        });
      } else {
        element.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }
  }
};

/**
 * Smooth scroll to a specific position
 */
export const scrollToPosition = (position: number) => {
  if (typeof window !== "undefined") {
    const lenisInstance = window.__LENIS__;

    if (lenisInstance) {
      lenisInstance.scrollTo(position, {
        duration: 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      });
    } else {
      window.scrollTo({
        top: position,
        behavior: "smooth",
      });
    }
  }
};
