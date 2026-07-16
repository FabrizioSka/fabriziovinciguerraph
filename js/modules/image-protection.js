export function initImageProtection() {
  document.querySelectorAll("img").forEach((image) => {
    image.setAttribute("draggable", "false");
  });

  document.addEventListener("contextmenu", (event) => {
    if (event.target instanceof HTMLImageElement) {
      event.preventDefault();
    }
  });

  document.addEventListener("dragstart", (event) => {
    if (event.target instanceof HTMLImageElement) {
      event.preventDefault();
    }
  });
}