export function initHeader() {
  const header = document.querySelector(".site-header");

  if (!header) return;

  function updateHeader() {
    header.classList.toggle(
      "is-scrolled",
      window.scrollY > 40
    );
  }

  updateHeader();

  window.addEventListener("scroll", updateHeader, {
    passive: true
  });
}