"use client";

import { useEffect } from "react";

export default function RevealInit() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    function observe() {
      document.querySelectorAll<HTMLElement>(".reveal:not(.visible)").forEach((el) =>
        observer.observe(el)
      );
    }

    observe();
    // Re-observe after short delay for elements added after initial render
    const t = setTimeout(observe, 100);
    return () => {
      clearTimeout(t);
      observer.disconnect();
    };
  }, []);

  return null;
}
