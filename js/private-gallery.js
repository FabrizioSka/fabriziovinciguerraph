(() => {

const galleryPassword = "danza2026";
const galleryLock = document.querySelector("#galleryLock");
const privatePage = document.querySelector("#privatePage");
const passwordInput = document.querySelector("#galleryPassword");
const unlockButton = document.querySelector("#unlockGallery");
const galleryError = document.querySelector("#galleryError");

const accessKey = "galleryAccess-" + window.location.pathname;

function unlockGallery() {
  if (!galleryLock || !privatePage) return;

  galleryLock.style.display = "none";
  privatePage.classList.remove("is-locked");
  localStorage.setItem(accessKey, "true");
}

if (localStorage.getItem(accessKey) === "true") {
  unlockGallery();
}

unlockButton?.addEventListener("click", () => {
  if (passwordInput.value === galleryPassword) {
    unlockGallery();
  } else {
    galleryError.textContent = "Wrong password. Please try again.";
  }
});

passwordInput?.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    unlockButton.click();
  }
});

  const selectablePhotos = Array.from(document.querySelectorAll(".private-photo"));
  const selectionBar = document.querySelector("#selectionBar");
  const selectionCount = document.querySelector("#selectionCount");
  const clearSelection = document.querySelector("#clearSelection");
  const copySelection = document.querySelector("#copySelection");
  const sendSelection = document.querySelector("#sendSelection");

  if (!selectablePhotos.length) return;

  const storageKey = "selectedPhotos-" + window.location.pathname;
  let selectedPhotos = JSON.parse(localStorage.getItem(storageKey) || "[]");

  function saveSelection() {
    localStorage.setItem(storageKey, JSON.stringify(selectedPhotos));
  }

  function updateUI() {
    selectablePhotos.forEach((photo) => {
      const id = photo.dataset.photoId;
      const button = photo.querySelector(".select-photo");
      const index = selectedPhotos.indexOf(id);

      if (!button) return;

      if (index >= 0) {
        photo.classList.add("is-selected");
        button.textContent = String(index + 1);
      } else {
        photo.classList.remove("is-selected");
        button.textContent = "";
      }
    });

    if (selectionBar && selectionCount) {
      const count = selectedPhotos.length;
      selectionCount.textContent =
        count === 1 ? "1 photo selected" : `${count} photos selected`;

      selectionBar.classList.toggle("is-visible", count > 0);
    }
  }

  selectablePhotos.forEach((photo) => {
    const button = photo.querySelector(".select-photo");
    const id = photo.dataset.photoId;

    if (!button || !id) return;

    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();

      if (selectedPhotos.includes(id)) {
        selectedPhotos = selectedPhotos.filter((item) => item !== id);
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

  copySelection?.addEventListener("click", async () => {
    const galleryTitle =
      document.querySelector("h1")?.textContent.trim() || "Private Gallery";

    const list = selectedPhotos
      .map((photo, index) => `${index + 1}. ${photo}`)
      .join("\n");

    const text = `${galleryTitle}
Selected photographs: ${selectedPhotos.length}

${list}`;

    try {
      await navigator.clipboard.writeText(text);
      copySelection.textContent = "Copied";
      setTimeout(() => {
        copySelection.textContent = "Copy Selection";
      }, 1600);
    } catch {
      alert(text);
    }
  });

    sendSelection?.addEventListener("click", () => {
    const galleryTitle =
    document.querySelector("h1")?.textContent.trim() || "Private Gallery";

    const list = selectedPhotos
    .map((photo, index) => `${index + 1}. ${photo}`)
    .join("%0D%0A");

    const subject = encodeURIComponent(`Photo Selection - ${galleryTitle}`);

    const body = `Hello Fabrizio,%0D%0A%0D%0AHere is my photo selection from ${galleryTitle}:%0D%0A%0D%0A${list}%0D%0A%0D%0AThank you.`;

    window.location.href = `mailto:vinciguerra.fabrizio@gmail.com?subject=${subject}&body=${body}`;
});
  updateUI();
})();