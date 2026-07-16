export function initPrivateGallery() {
  const selectablePhotos = Array.from(
    document.querySelectorAll(".private-photo")
  );

  if (!selectablePhotos.length) return;

  const selectionBar = document.querySelector(
    "#selectionBar"
  );
  const selectionCount = document.querySelector(
    "#selectionCount"
  );
  const clearSelection = document.querySelector(
    "#clearSelection"
  );
  const copySelection = document.querySelector(
    "#copySelection"
  );
  const sendSelection = document.querySelector(
    "#sendSelection"
  );

  const storageKey =
    `selectedPhotos-${window.location.pathname}`;

  let selectedPhotos = [];

  try {
    const storedSelection =
      localStorage.getItem(storageKey);

    const parsedSelection = JSON.parse(
      storedSelection || "[]"
    );

    if (Array.isArray(parsedSelection)) {
      selectedPhotos = parsedSelection;
    }
  } catch {
    selectedPhotos = [];
  }

  function saveSelection() {
    localStorage.setItem(
      storageKey,
      JSON.stringify(selectedPhotos)
    );
  }

  function getGalleryTitle() {
    return (
      document.querySelector("h1")
        ?.textContent
        ?.trim() ||
      "Private Gallery"
    );
  }

  function createSelectionList() {
    return selectedPhotos
      .map(
        (photo, index) =>
          `${index + 1}. ${photo}`
      )
      .join("\n");
  }

  function updateUI() {
    selectablePhotos.forEach((photo) => {
      const id = photo.dataset.photoId;
      const button = photo.querySelector(
        ".select-photo"
      );

      if (!button || !id) return;

      const selectedIndex =
        selectedPhotos.indexOf(id);

      const isSelected = selectedIndex >= 0;

      photo.classList.toggle(
        "is-selected",
        isSelected
      );

      button.textContent = isSelected
        ? String(selectedIndex + 1)
        : "";
    });

    if (!selectionBar || !selectionCount) return;

    const count = selectedPhotos.length;

    selectionCount.textContent =
      count === 1
        ? "1 photo selected"
        : `${count} photos selected`;

    selectionBar.classList.toggle(
      "is-visible",
      count > 0
    );
  }

  selectablePhotos.forEach((photo) => {
    const button = photo.querySelector(
      ".select-photo"
    );
    const id = photo.dataset.photoId;

    if (!button || !id) return;

    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();

      if (selectedPhotos.includes(id)) {
        selectedPhotos = selectedPhotos.filter(
          (item) => item !== id
        );
      } else {
        selectedPhotos.push(id);
      }

      saveSelection();
      updateUI();
    });
  });

  clearSelection?.addEventListener("click", () => {
    selectedPhotos = [];
    saveSelection();
    updateUI();
  });

  copySelection?.addEventListener(
    "click",
    async () => {
      const galleryTitle = getGalleryTitle();
      const list = createSelectionList();

      const text = `${galleryTitle}
Selected photographs: ${selectedPhotos.length}

${list}`;

      try {
        await navigator.clipboard.writeText(text);

        copySelection.textContent = "Copied";

        window.setTimeout(() => {
          copySelection.textContent =
            "Copy Selection";
        }, 1600);
      } catch {
        window.alert(text);
      }
    }
  );

  sendSelection?.addEventListener(
    "click",
    async () => {
      if (!selectedPhotos.length) {
        window.alert(
          "Seleziona almeno una fotografia."
        );
        return;
      }

      const galleryTitle = getGalleryTitle();
      const list = createSelectionList();

      const name = window.prompt(
        "Inserisci il tuo nome:"
      );

      if (!name?.trim()) return;

      const email = window.prompt(
        "Inserisci la tua email:"
      );

      if (!email?.trim()) return;

      const message = `Galleria: ${galleryTitle}

Nome: ${name.trim()}
Email: ${email.trim()}

Fotografie selezionate: ${selectedPhotos.length}

${list}`;

      sendSelection.disabled = true;
      sendSelection.textContent = "Sending";

      try {
        const response = await fetch(
          "https://formspree.io/f/xnjkbrbv",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json"
            },
            body: JSON.stringify({
              name: name.trim(),
              email: email.trim(),
              gallery: galleryTitle,
              selected_photos:
                selectedPhotos.join(", "),
              message
            })
          }
        );

        if (!response.ok) {
          throw new Error(
            `Form submission failed: ${response.status}`
          );
        }

        window.alert(
          "Selezione inviata correttamente. " +
          "Ti risponderò via email con le modalità di pagamento."
        );
      } catch {
        window.alert(
          "Errore durante l'invio. " +
          "Copia la selezione e inviala manualmente."
        );
      } finally {
        sendSelection.disabled = false;
        sendSelection.textContent =
          "Send Selection";
      }
    }
  );

  updateUI();
}