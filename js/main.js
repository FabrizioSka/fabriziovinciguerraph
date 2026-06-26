const revealElements = document.querySelectorAll(".reveal");

const revealOnScroll = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("is-visible");
    }
  });
}, {
  threshold: 0.18
});

revealElements.forEach((element) => {
  revealOnScroll.observe(element);
});


const header = document.querySelector(".site-header");

window.addEventListener("scroll", () => {
  if (!header) return;

  if (window.scrollY > 40) {
    header.classList.add("is-scrolled");
  } else {
    header.classList.remove("is-scrolled");
  }
});


const lightbox = document.querySelector("#lightbox");
const lightboxImg = lightbox?.querySelector("img");
const lightboxCaption = lightbox?.querySelector(".lightbox-caption");
const closeBtn = lightbox?.querySelector(".lightbox-close");
const prevBtn = lightbox?.querySelector(".lightbox-prev");
const nextBtn = lightbox?.querySelector(".lightbox-next");

let lightboxItems = Array.from(document.querySelectorAll(".lightbox-image"));
let currentIndex = 0;

function openLightbox(index) {
  if (!lightbox || !lightboxImg || !lightboxItems.length) return;

  currentIndex = index;
  const item = lightboxItems[currentIndex];

  lightboxImg.src = item.dataset.full;
  lightboxImg.alt = item.alt;
  lightboxCaption.textContent = item.dataset.title || "";

  lightbox.classList.add("is-open");
  document.body.classList.add("lightbox-open");
}

function closeLightbox() {
  if (!lightbox) return;

  lightbox.classList.remove("is-open");
  document.body.classList.remove("lightbox-open");
}

function showNext() {
  currentIndex = (currentIndex + 1) % lightboxItems.length;
  openLightbox(currentIndex);
}

function showPrev() {
  currentIndex = (currentIndex - 1 + lightboxItems.length) % lightboxItems.length;
  openLightbox(currentIndex);
}

lightboxItems.forEach((item, index) => {
  item.addEventListener("click", () => openLightbox(index));
});

closeBtn?.addEventListener("click", closeLightbox);
nextBtn?.addEventListener("click", showNext);
prevBtn?.addEventListener("click", showPrev);

lightbox?.addEventListener("click", (event) => {
  if (event.target === lightbox) closeLightbox();
});

document.addEventListener("keydown", (event) => {
  if (!lightbox?.classList.contains("is-open")) return;

  if (event.key === "Escape") closeLightbox();
  if (event.key === "ArrowRight") showNext();
  if (event.key === "ArrowLeft") showPrev();
});


document.addEventListener("contextmenu", (event) => {
  event.preventDefault();
});

document.querySelectorAll("img").forEach((img) => {
  img.setAttribute("draggable", "false");
});

