import { initReveal } from "./modules/reveal.js";
import { initHeader } from "./modules/header.js";
import { initLightbox } from "./modules/lightbox.js";
import { initImageProtection } from "./modules/image-protection.js";
import { initPrivateGallery } from "./modules/private-gallery.js";
import { initPageTransitions } from "./modules/page-transitions.js";
import { initCustomCursor } from "./modules/custom-cursor.js";
import { initPreloader } from "./modules/preloader.js";
import { initHero } from "./modules/hero.js";

function initSite() {
  initPreloader();
  initReveal();
  initHeader();
  initLightbox();
  initImageProtection();
  initPrivateGallery();
  initPageTransitions();
  initCustomCursor();
  initHero();
  
}

if (document.readyState === "loading") {
  document.addEventListener(
    "DOMContentLoaded",
    initSite,
    { once: true }
  );
} else {
  initSite();
}