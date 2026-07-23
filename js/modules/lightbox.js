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

  let activeItems = lightboxItems;
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


  function getItemGroup(item) {
    return (
      item.dataset.lightboxGroup ||
      "default"
    );
  }


  function getGroupItems(item) {
    const selectedGroup =
      getItemGroup(item);

    return lightboxItems.filter(
      (lightboxItem) =>
        getItemGroup(lightboxItem) ===
        selectedGroup
    );
  }


  function updateInformation(item) {
    const title =
      item.dataset.title?.trim() || "";

    const location =
      item.dataset.location?.trim() || "";

    const year =
      item.dataset.year?.trim() || "";

    const metadata = [
      location,
      year
    ]
      .filter(Boolean)
      .join(" · ");

    const caption = [
      title,
      metadata
    ]
      .filter(Boolean)
      .join(" — ");

    if (lightboxCaption) {
      lightboxCaption.textContent =
        caption;

      lightboxCaption.hidden =
        !caption;
    }

    if (lightboxCounter) {
      lightboxCounter.textContent =
        `${currentIndex + 1} / ${activeItems.length}`;

      /*
       * Mantiene il comportamento visivo attuale:
       * se esiste una didascalia, il contatore non viene
       * sovrapposto nella stessa riga.
       */
      lightboxCounter.hidden =
        Boolean(caption);
    }
  }


  function updateNavigationControls() {
    const hasMultipleItems =
      activeItems.length > 1;

    if (previousButton) {
      previousButton.hidden =
        !hasMultipleItems;

      previousButton.disabled =
        !hasMultipleItems;
    }

    if (nextButton) {
      nextButton.hidden =
        !hasMultipleItems;

      nextButton.disabled =
        !hasMultipleItems;
    }
  }


  function showControls() {
    if (!supportsFinePointer.matches) {
      return;
    }

    lightbox.classList.remove(
      "controls-hidden"
    );

    window.clearTimeout(
      controlsTimer
    );

    controlsTimer =
      window.setTimeout(() => {
        if (
          lightbox.classList.contains(
            "is-open"
          )
        ) {
          lightbox.classList.add(
            "controls-hidden"
          );
        }
      }, 2200);
  }


  function renderItem(
    index,
    direction = null
  ) {
    if (!activeItems.length) {
      return;
    }

    currentIndex = index;

    const item =
      activeItems[currentIndex];

    const source =
      item.dataset.full ||
      item.getAttribute("src");

    if (!source) {
      return;
    }

    const alternativeText =
      item.dataset.alt ||
      item.getAttribute("alt") ||
      "";

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

    const preloadedImage =
      new Image();

    preloadedImage.onload = () => {
      lightboxImg.src = source;
      lightboxImg.alt =
        alternativeText;

      updateInformation(item);

      window.requestAnimationFrame(
        () => {
          lightboxImg.classList.remove(
            "is-changing"
          );

          window.requestAnimationFrame(
            () => {
              lightboxImg.classList.add(
                "is-visible"
              );

              clearMovementClasses();
            }
          );
        }
      );
    };

    preloadedImage.onerror = () => {
      lightboxImg.classList.remove(
        "is-changing"
      );

      clearMovementClasses();
    };

    preloadedImage.src = source;
  }


  function openLightbox(item) {
    lastFocusedElement =
      document.activeElement;

    activeItems =
      getGroupItems(item);

    currentIndex =
      activeItems.indexOf(item);

    if (currentIndex < 0) {
      currentIndex = 0;
    }

    updateNavigationControls();

    lightbox.classList.remove(
      "controls-hidden"
    );

    lightbox.classList.add(
      "is-open"
    );

    lightbox.setAttribute(
      "aria-hidden",
      "false"
    );

    document.body.classList.add(
      "lightbox-open"
    );

    renderItem(currentIndex);

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

    lightboxImg.removeAttribute("src");
    lightboxImg.alt = "";

    document.body.classList.remove(
      "lightbox-open"
    );

    window.clearTimeout(
      controlsTimer
    );

    activeItems = lightboxItems;
    currentIndex = 0;

    if (
      lastFocusedElement instanceof
      HTMLElement
    ) {
      lastFocusedElement.focus({
        preventScroll: true
      });
    }
  }


  function showNext() {
    if (activeItems.length <= 1) {
      return;
    }

    const nextIndex =
      (currentIndex + 1) %
      activeItems.length;

    renderItem(
      nextIndex,
      "next"
    );

    showControls();
  }


  function showPrevious() {
    if (activeItems.length <= 1) {
      return;
    }

    const previousIndex =
      (
        currentIndex -
        1 +
        activeItems.length
      ) %
      activeItems.length;

    renderItem(
      previousIndex,
      "previous"
    );

    showControls();
  }


  function trapFocus(event) {
    if (
      event.key !== "Tab" ||
      !lightbox.classList.contains(
        "is-open"
      )
    ) {
      return;
    }

    const focusableElements = [
      closeButton,
      previousButton,
      nextButton
    ].filter(
      (element) =>
        element &&
        !element.hidden &&
        !element.disabled
    );

    if (!focusableElements.length) {
      return;
    }

    const firstElement =
      focusableElements[0];

    const lastElement =
      focusableElements[
        focusableElements.length - 1
      ];

    if (
      event.shiftKey &&
      document.activeElement ===
        firstElement
    ) {
      event.preventDefault();
      lastElement.focus();
      return;
    }

    if (
      !event.shiftKey &&
      document.activeElement ===
        lastElement
    ) {
      event.preventDefault();
      firstElement.focus();
    }
  }


  lightboxItems.forEach((item) => {
    /*
     * Le immagini archiviate per una mini-serie
     * non devono diventare elementi cliccabili.
     */
    if (
      item.closest(
        "[data-lightbox-storage]"
      )
    ) {
      return;
    }

    item.addEventListener(
      "click",
      () => {
        openLightbox(item);
      }
    );

    item.addEventListener(
      "keydown",
      (event) => {
        if (
          event.key !== "Enter" &&
          event.key !== " "
        ) {
          return;
        }

        event.preventDefault();
        openLightbox(item);
      }
    );
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
      if (
        event.target !== lightbox ||
        activeItems.length <= 1
      ) {
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

      touchStartX =
        touch.clientX;

      touchStartY =
        touch.clientY;
    },
    {
      passive: true
    }
  );


  lightbox.addEventListener(
    "touchend",
    (event) => {
      if (activeItems.length <= 1) {
        return;
      }

      const touch =
        event.changedTouches[0];

      const distanceX =
        touch.clientX -
        touchStartX;

      const distanceY =
        touch.clientY -
        touchStartY;

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

      trapFocus(event);

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


  window.addEventListener(
    "blur",
    () => {
      lightbox.classList.remove(
        "controls-hidden"
      );
    }
  );


  lightbox.setAttribute(
    "aria-hidden",
    "true"
  );
}