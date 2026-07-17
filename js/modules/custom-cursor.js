export function initCustomCursor() {
  const supportsFinePointer = window.matchMedia(
    "(hover: hover) and (pointer: fine)"
  );

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  if (!supportsFinePointer.matches || reduceMotion.matches) {
    return;
  }

  const cursor = document.querySelector(".custom-cursor");

  if (!cursor) return;

  const interactiveSelector = [
    "a",
    "button",
    ".lightbox-image",
    ".select-photo",
    "input",
    "textarea"
  ].join(", ");

  function moveCursor(event) {
    cursor.style.transform =
      `translate(${event.clientX}px, ${event.clientY}px) translate(-50%, -50%)`;

    cursor.classList.add("is-visible");
  }

  document.addEventListener("mousemove", moveCursor);

  document.addEventListener("mouseover", (event) => {
    const interactiveElement =
      event.target.closest(interactiveSelector);

    cursor.classList.toggle(
      "is-hovering",
      Boolean(interactiveElement)
    );
  });

  document.addEventListener("mousedown", () => {
    cursor.classList.add("is-clicking");
  });

  document.addEventListener("mouseup", () => {
    cursor.classList.remove("is-clicking");
  });

  document.addEventListener("mouseleave", () => {
    cursor.classList.remove("is-visible");
  });

  window.addEventListener("blur", () => {
    cursor.classList.remove("is-visible");
  });
}