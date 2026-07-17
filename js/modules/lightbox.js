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

  if (!lightboxImg || !lightboxItems.length) {
    return;
  }

  const supportsFinePointer = window.matchMedia(
    "(hover: hover) and (pointer: fine)"
  );

  let currentIndex = 0;

  let controlsTimer = null;

  let touchStartX = 0;
  let touchStartY = 0;

  let lastFocusedElement = null;


  function clearMovementClasses() {
    lightbox.classList.remove(
      "is-moving-next",
      "is-moving-previous"
    );
  }


  function updateInformation(item) {
    const title =
      item.dataset.title?.trim() || "";

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
  }


  function showControls() {
    if (!supportsFinePointer.matches) {
      return;
    }

    lightbox.classList.remove(
      "controls-hidden"
    );

    window.clearTimeout(controlsTimer);

    controlsTimer = window.setTimeout(() => {
      if (
        lightbox.classList.contains("is-open")
      ) {
        lightbox.classList.add(
          "controls-hidden"
        );
      }
    }, 2200);
  }


  function renderItem(index, direction = null) {
    currentIndex = index;

    const item = lightboxItems[currentIndex];

    const source =
      item.dataset.full || item.src;

    clearMovementClasses();

    if (direction === "next") {
      lightbox.classList.add(
        "is-moving-next"
      );
    }

    if (direction === "previous") {
      lightbox.classList.add(
        "is-moving-previous"
      );
    }

    lightboxImg.classList.remove(
      "is-visible"
    );

    lightboxImg.classList.add(
      "is-changing"
    );

    const preloadedImage = new Image();

    preloadedImage.onload = () => {
      lightboxImg.src = source;
      lightboxImg.alt = item.alt || "";

      updateInformation(item);

      window.requestAnimationFrame(() => {
        lightboxImg.classList.remove(
          "is-changing"
        );

        window.requestAnimationFrame(() => {
          lightboxImg.classList.add(
            "is-visible"
          );

          clearMovementClasses();
        });
      });
    };

    preloadedImage.onerror = () => {
      lightboxImg.classList.remove(
        "is-changing"
      );

      clearMovementClasses();
    };

    preloadedImage.src = source;
  }


  function openLightbox(index) {
    lastFocusedElement =
      document.activeElement;

    lightbox.classList.remove(
      "controls-hidden"
    );

    lightbox.classList.add("is-open");

    lightbox.setAttribute(
      "aria-hidden",
      "false"
    );

    document.body.classList.add(
      "lightbox-open"
    );

    renderItem(index);

    showControls();

    closeButton?.focus({
      preventScroll: true
    });
  }


  function closeLightbox() {
    lightbox.classList.remove(
      "is-open",
      "controls-hidden",
      "is-moving-next",
      "is-moving-previous"
    );

    lightbox.setAttribute(
      "aria-hidden",
      "true"
    );

    lightboxImg.classList.remove(
      "is-visible",
      "is-changing"
    );

    document.body.classList.remove(
      "lightbox-open"
    );

    window.clearTimeout(controlsTimer);

    if (
      lastFocusedElement instanceof HTMLElement
    ) {
      lastFocusedElement.focus({
        preventScroll: true
      });
    }
  }


  function showNext() {
    const nextIndex =
      (currentIndex + 1) %
      lightboxItems.length;

    renderItem(nextIndex, "next");

    showControls();
  }


  function showPrevious() {
    const previousIndex =
      (
        currentIndex -
        1 +
        lightboxItems.length
      ) %
      lightboxItems.length;

    renderItem(
      previousIndex,
      "previous"
    );

    showControls();
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


  lightbox.addEventListener(
    "pointermove",
    showControls
  );


  lightbox.addEventListener(
    "click",
    (event) => {
      if (event.target !== lightbox) {
        return;
      }

      const middle =
        window.innerWidth / 2;

      if (event.clientX > middle) {
        showNext();
      } else {
        showPrevious();
      }
    }
  );


  lightbox.addEventListener(
    "touchstart",
    (event) => {
      const touch =
        event.changedTouches[0];

      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
    },
    {
      passive: true
    }
  );


  lightbox.addEventListener(
    "touchend",
    (event) => {
      const touch =
        event.changedTouches[0];

      const distanceX =
        touch.clientX - touchStartX;

      const distanceY =
        touch.clientY - touchStartY;

      const horizontalSwipe =
        Math.abs(distanceX) >
        Math.abs(distanceY);

      if (
        !horizontalSwipe ||
        Math.abs(distanceX) < 45
      ) {
        return;
      }

      if (distanceX < 0) {
        showNext();
      } else {
        showPrevious();
      }
    },
    {
      passive: true
    }
  );


  document.addEventListener(
    "keydown",
    (event) => {
      if (
        !lightbox.classList.contains(
          "is-open"
        )
      ) {
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
    }
  );


  window.addEventListener("blur", () => {
    lightbox.classList.remove(
      "controls-hidden"
    );
  });


  lightbox.setAttribute(
    "aria-hidden",
    "true"
  );
}