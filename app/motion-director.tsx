"use client";

import { useEffect } from "react";

const itemSelector = [
  ".countryCard",
  ".timeline article",
  ".peopleList article",
  ".evidenceFacts article",
  ".dualRows article",
  ".archiveCard",
  ".productStories > a",
  ".countryChapters article",
  ".commerceProducts > a",
  ".museumCategoryName",
  ".journalFeed a",
  ".storeGrid article",
  ".collectionRecordGrid > a",
  ".archiveIndexGrid > a",
].join(",");

const imageSelector = [
  ".originImage",
  ".phillipPortrait",
  ".countryPhoto",
  ".thenPanel",
  ".nowPanel",
  ".archiveImage",
  ".productImage",
  ".deerTalkFeature",
  ".storeHeroProduct",
  ".journalHero > a",
  ".exhibitVisual",
].join(",");

export default function MotionDirector() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduced.matches) return;

    const root = document.documentElement;
    root.classList.add("motion-ready");

    const sections = Array.from(document.querySelectorAll<HTMLElement>("main > section, main > header, main > footer"));
    const headings = Array.from(document.querySelectorAll<HTMLElement>("main h1, main h2"));
    const items = Array.from(document.querySelectorAll<HTMLElement>(itemSelector));
    const images = Array.from(document.querySelectorAll<HTMLElement>(imageSelector));

    sections.forEach((element) => element.setAttribute("data-motion-section", ""));
    headings.forEach((element) => element.setAttribute("data-motion-heading", ""));
    images.forEach((element) => element.setAttribute("data-motion-image", ""));
    items.forEach((element, index) => {
      element.setAttribute("data-motion-item", "");
      element.style.setProperty("--motion-delay", `${(index % 6) * 75}ms`);
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in-view");
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0.08 });

    [...sections, ...headings, ...items, ...images].forEach((element) => observer.observe(element));

    const hero = document.querySelector<HTMLElement>(".legacyHero");
    const heroTitle = document.querySelector<HTMLElement>(".heroTitle");
    let ticking = false;
    const updateScroll = () => {
      const max = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      root.style.setProperty("--site-progress", `${Math.min(window.scrollY / max, 1)}`);
      root.style.setProperty("--hero-drift", `${Math.min(window.scrollY * 0.16, 120)}px`);
      root.style.setProperty("--hero-title-drift", `${Math.min(window.scrollY * 0.03, 22)}px`);
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(updateScroll);
      }
    };
    const onPointerMove = (event: PointerEvent) => {
      if (!hero || !heroTitle || event.pointerType === "touch") return;
      const rect = hero.getBoundingClientRect();
      if (event.clientY < rect.top || event.clientY > rect.bottom) return;
      const x = (event.clientX / window.innerWidth - 0.5) * 2;
      const y = ((event.clientY - rect.top) / Math.max(rect.height, 1) - 0.5) * 2;
      heroTitle.style.setProperty("--pointer-x", `${x * 18}px`);
      heroTitle.style.setProperty("--pointer-y", `${y * 12}px`);
      hero.style.setProperty("--atmosphere-x", `${72 + x * 4}%`);
      hero.style.setProperty("--atmosphere-y", `${38 + y * 4}%`);
    };
    const resetPointer = () => {
      heroTitle?.style.setProperty("--pointer-x", "0px");
      heroTitle?.style.setProperty("--pointer-y", "0px");
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    hero?.addEventListener("pointermove", onPointerMove);
    hero?.addEventListener("pointerleave", resetPointer);
    updateScroll();

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      hero?.removeEventListener("pointermove", onPointerMove);
      hero?.removeEventListener("pointerleave", resetPointer);
      root.classList.remove("motion-ready");
      root.style.removeProperty("--site-progress");
      root.style.removeProperty("--hero-drift");
      root.style.removeProperty("--hero-title-drift");
    };
  }, []);

  return <div className="motionHud" aria-hidden="true"><span className="motionHudLabel">MT E.L.K. · LIVING ARCHIVE</span><span className="motionHudTrack"><i /></span></div>;
}
