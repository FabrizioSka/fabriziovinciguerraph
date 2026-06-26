const selectablePhotos = document.querySelectorAll(".private-photo");
const selectionBar = document.querySelector("#selectionBar");
const selectionCount = document.querySelector("#selectionCount");
const clearSelection = document.querySelector("#clearSelection");
const copySelection = document.querySelector("#copySelection");

let selectedPhotos = [];

function updateSelectionBar() {
  const count = selectedPhotos.length;

  if (!selectionBar || !selectionCount) return;

  selectionCount.textContent =
    count === 1 ? "1 photo selected" : `${count} photos selected`;

  if (count > 0) {
    selectionBar.classList.add("is-visible");
  } else {
    selectionBar.classList.remove("is-visible");
  }
}

selectablePhotos.forEach((photo) => {
  const button = photo.querySelector(".select-photo");
  if (!button) return;

  button.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();

    const id = photo.dataset.photoId;

    if (!id) return;

    if (selectedPhotos.includes(id)) {
      selectedPhotos = selectedPhotos.filter((item) => item !== id);
      photo.classList.remove("is-selected");
    } else {
      selectedPhotos.push(id);
      photo.classList.add("is-selected");
    }

    updateSelectionBar();
  });
});

clearSelection?.addEventListener("click", () => {
  selectedPhotos = [];

  selectablePhotos.forEach((photo) => {
    photo.classList.remove("is-selected");
  });

  updateSelectionBar();
});

copySelection?.addEventListener("click", async () => {
  const text = selectedPhotos.join("\n");

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

updateSelectionBar();