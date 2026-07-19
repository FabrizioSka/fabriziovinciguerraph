export function initPreloader() {
  const preloader = document.querySelector(".preloader");

  if (!preloader) return;

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  const sessionKey = "fv-preloader-shown";

  let alreadyShown = false;

  try {
    alreadyShown =
      sessionStorage.getItem(sessionKey) === "true";
  } catch {
    alreadyShown = false;
  }

  if (alreadyShown || reduceMotion.matches) {
    preloader.remove();
    return;
  }

  preloader.classList.add("is-active");
  document.body.classList.add("preloader-open");

  function closePreloader() {
    preloader.classList.add("is-leaving");
    document.body.classList.remove("preloader-open");

    try {
      sessionStorage.setItem(sessionKey, "true");
    } catch {
      // Il sito continua comunque a funzionare.
    }

    window.setTimeout(() => {
      preloader.remove();
    }, 450);
  }

  function scheduleClose() {
    window.setTimeout(closePreloader, 250);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", scheduleClose, {
      once: true
    });
  } else {
    scheduleClose();
  }
}