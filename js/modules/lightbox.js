export function initLightbox() {
  const lightbox = document.querySelector("#lightbox");

  if (!lightbox) return;

  const lightboxImg = lightbox.querySelector("img");
  const lightboxCaption = lightbox.querySelector(
    ".lightbox-caption"
  );
  const lightboxCounter = lightbox.querySelector(
    "#lightboxCounter"
  );
  const closeButton = lightbox.querySelector(
    ".lightbox-close"
  );
  const previousButton = lightbox.querySelector(
    ".lightbox-prev"
  );
  const nextButton = lightbox.querySelector(
    ".lightbox-next"
  );

  const lightboxItems = Array.from(
    document.querySelectorAll(".lightbox-image")
  );

  if (!lightboxImg || !lightboxItems.length) return;

  let currentIndex = 0;

  function renderItem(index) {
    currentIndex = index;

    const item = lightboxItems[currentIndex];

    lightboxImg.style.opacity = "0";

    window.setTimeout(() => {
      lightboxImg.src = item.dataset.full || item.src;
      lightboxImg.alt = item.alt || "";

     const title = item.dataset.title?.trim() || "";

if (lightboxCaption) {
  lightboxCaption.textContent = title;
  lightboxCaption.hidden = !title;
}

if (lightboxCounter) {
  lightboxCounter.textContent = title
    ? ""
    : `${currentIndex + 1} / ${lightboxItems.length}`;
  lightboxCounter.hidden = Boolean(title);
}

      lightboxImg.onload = () => {
        lightboxImg.style.opacity = "1";
      };
    }, 180);
  }

  function openLightbox(index) {
    renderItem(index);

    lightbox.classList.add("is-open");
    document.body.classList.add("lightbox-open");
  }

  function closeLightbox() {
    lightbox.classList.remove("is-open");
    document.body.classList.remove("lightbox-open");
  }

  function showNext() {
    const nextIndex =
      (currentIndex + 1) % lightboxItems.length;

    renderItem(nextIndex);
  }

  function showPrevious() {
    const previousIndex =
      (
        currentIndex -
        1 +
        lightboxItems.length
      ) % lightboxItems.length;

    renderItem(previousIndex);
  }

  lightboxItems.forEach((item, index) => {
    item.addEventListener("click", () => {
      openLightbox(index);
    });
  });

  closeButton?.addEventListener(
    "click",
    closeLightbox
  );

  nextButton?.addEventListener(
    "click",
    showNext
  );

  previousButton?.addEventListener(
    "click",
    showPrevious
  );

  lightbox.addEventListener("click", (event) => {
    if (event.target !== lightbox) return;

    const middle = window.innerWidth / 2;

    if (event.clientX > middle) {
      showNext();
    } else {
      showPrevious();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (!lightbox.classList.contains("is-open")) {
      return;
    }

    if (event.key === "Escape") {
      closeLightbox();
    }

    if (event.key === "ArrowRight") {
      showNext();
    }

    if (event.key === "ArrowLeft") {
      showPrevious();
    }
  });
}