const revealElements = document.querySelectorAll('.reveal');

const revealOnScroll = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
    }
  });
}, {
  threshold: 0.18
});

revealElements.forEach((element) => {
  revealOnScroll.observe(element);
});

const header = document.querySelector('.site-header');

window.addEventListener('scroll', () => {
  if (window.scrollY > 40) {
    header.classList.add('is-scrolled');
  } else {
    header.classList.remove('is-scrolled');
  }
});

const hero = document.querySelector("#hero");

window.addEventListener("scroll", () => {

    const offset = window.scrollY;

    hero.style.backgroundPositionY = `${offset * 0.35}px`;

});
