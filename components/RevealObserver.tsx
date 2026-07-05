"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

function revealVisibleInViewport() {
  document.querySelectorAll(".reveal:not(.is-visible)").forEach((el) => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      el.classList.add("is-visible");
    }
  });
}

function revealAll() {
  document.querySelectorAll(".reveal:not(.is-visible)").forEach((el) => {
    el.classList.add("is-visible");
  });
}

export default function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    let observer: IntersectionObserver | null = null;
    const timers: number[] = [];

    const setup = () => {
      const revealEls = document.querySelectorAll(".reveal:not(.is-visible)");
      if (!revealEls.length) return;

      revealVisibleInViewport();

      if (!("IntersectionObserver" in window)) {
        revealAll();
        return;
      }

      observer?.disconnect();
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              observer?.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.05, rootMargin: "0px 0px -10% 0px" },
      );

      document.querySelectorAll(".reveal:not(.is-visible)").forEach((el) => {
        observer?.observe(el);
      });
    };

    document.documentElement.classList.add("reveal-ready");

    const run = () => {
      revealVisibleInViewport();
      setup();
    };

    const frame = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(run);
    });

    timers.push(window.setTimeout(run, 0));
    timers.push(window.setTimeout(run, 150));
    timers.push(
      window.setTimeout(() => {
        revealAll();
      }, 800),
    );

    return () => {
      window.cancelAnimationFrame(frame);
      observer?.disconnect();
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [pathname]);

  return null;
}
