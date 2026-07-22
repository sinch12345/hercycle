// ==========================================================
// PARALLAX SCROLLING — hero background elements move slower
// than scroll speed for a sense of depth
// ==========================================================

const parallaxEls = document.querySelectorAll('[data-speed]');

function updateParallax() {
  const y = window.scrollY;
  parallaxEls.forEach(el => {
    const speed = parseFloat(el.dataset.speed);
    el.style.transform = `translateY(${y * speed}px)`;
  });
}

window.addEventListener('scroll', updateParallax, { passive: true });