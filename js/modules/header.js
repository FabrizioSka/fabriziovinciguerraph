export function initHeader() {
  const header = document.querySelector(".site-header");
  const menuToggle = document.querySelector(".menu-toggle");
  const navigation = document.querySelector(".main-nav");
  const navigationLinks = navigation?.querySelectorAll("a") || [];

  if (!header) return;

  function updateHeaderOnScroll() {
    header.classList.toggle(
      "is-scrolled",
      window.scrollY > 40
    );
  }

  function openMenu() {
    if (!menuToggle || !navigation) return;

    menuToggle.classList.add("is-active");
    navigation.classList.add("is-open");
    header.classList.add("is-menu-open");
    document.body.classList.add("menu-open");

    menuToggle.setAttribute("aria-expanded", "true");
    menuToggle.setAttribute(
      "aria-label",
      "Close navigation menu"
    );
  }

  function closeMenu() {
    if (!menuToggle || !navigation) return;

    menuToggle.classList.remove("is-active");
    navigation.classList.remove("is-open");
    header.classList.remove("is-menu-open");
    document.body.classList.remove("menu-open");

    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute(
      "aria-label",
      "Open navigation menu"
    );
  }

  function toggleMenu() {
    const isOpen =
      navigation?.classList.contains("is-open");

    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  }

  updateHeaderOnScroll();

  window.addEventListener(
    "scroll",
    updateHeaderOnScroll,
    { passive: true }
  );

  menuToggle?.addEventListener(
    "click",
    toggleMenu
  );

  navigationLinks.forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 768) {
      closeMenu();
    }
  });
}