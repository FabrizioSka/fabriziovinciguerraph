export function initPageTransitions() {
  const transitionLayer = document.querySelector(".page-transition");

  if (!transitionLayer) return;

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  function revealPage() {
    document.body.classList.remove("is-leaving");

    window.requestAnimationFrame(() => {
      document.body.classList.add("page-is-ready");
    });
  }

  function isEligibleLink(link, event) {
    if (!link) return false;

    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return false;
    }

    if (
      link.hasAttribute("download") ||
      link.target === "_blank"
    ) {
      return false;
    }

    const rawHref = link.getAttribute("href");

    if (
      !rawHref ||
      rawHref.startsWith("#") ||
      rawHref.startsWith("mailto:") ||
      rawHref.startsWith("tel:")
    ) {
      return false;
    }

    const destination = new URL(
      link.href,
      window.location.href
    );

    if (destination.origin !== window.location.origin) {
      return false;
    }

    const currentUrl = new URL(window.location.href);

    const samePage =
      destination.pathname === currentUrl.pathname &&
      destination.search === currentUrl.search;

    if (samePage && destination.hash) {
      return false;
    }

    return destination.href !== currentUrl.href;
  }

  document.addEventListener("click", (event) => {
    const link = event.target.closest("a");

    if (!isEligibleLink(link, event)) return;

event.preventDefault();

    const destination = link.href;
    const transitionDuration = reduceMotion.matches ? 350 : 520;

    document.body.classList.remove("page-is-ready");
    document.body.classList.add("is-leaving");

    window.setTimeout(() => {
    window.location.href = destination;
},  transitionDuration);

  });

  window.addEventListener("pageshow", () => {
    revealPage();
  });

  revealPage();
}