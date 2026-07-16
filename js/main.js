import { initReveal } from "./modules/reveal.js";
import { initHeader } from "./modules/header.js";
import { initLightbox } from "./modules/lightbox.js";
import { initImageProtection } from "./modules/image-protection.js";
import { initPrivateGallery } from "./modules/private-gallery.js";

function initSite() {
  initReveal();
  initHeader();
  initLightbox();
  initImageProtection();
  initPrivateGallery();
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