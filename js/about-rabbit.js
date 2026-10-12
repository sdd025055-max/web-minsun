(() => {
  'use strict';
  const windowElement = document.querySelector('.about-rabbit-window');
  const section = windowElement?.parentElement;
  const intro = section?.querySelector('.Section3.intro');
  const profile = section?.querySelector('.Section3.profile');
  const title = section?.querySelector('.Section3.title');
  if (!windowElement || !intro || !profile || !title) return;

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let resizeFrame = 0;
  let observer;

  function positionRabbit() {
    const parent = section.getBoundingClientRect();
    const copy = intro.getBoundingClientRect();
    // Layout offsets ignore the profile rows' existing entrance animation.
    const details = profile.getBoundingClientRect();
    const mobile = matchMedia('(max-width: 650px)').matches;
    const titleRange = document.createRange();
    titleRange.selectNodeContents(title);
    const heading = titleRange.getBoundingClientRect();
    const top = mobile ? copy.bottom + 5 : heading.bottom + 8;
    const bottom = mobile
      ? profile.lastElementChild.getBoundingClientRect().top - 12
      : details.top - 16;
    const height = Math.max(0, bottom - top);
    const preferredSize = mobile ? Math.min(300, innerWidth * .68) : innerWidth <= 1100
      ? Math.min(400, Math.max(300, innerWidth * .32))
      : Math.min(560, Math.max(430, innerWidth * .30));
    const size = Math.min(preferredSize, height / .84);
    const profileTextRight = mobile ? Math.max(...[...profile.querySelectorAll('dd')].slice(0, -1).map(element => {
      const range = document.createRange();
      range.selectNodeContents(element);
      const entranceOffset = parseFloat(getComputedStyle(element.parentElement).translate) || 0;
      return range.getBoundingClientRect().right - entranceOffset;
    })) : 0;
    const availableWidth = mobile
      ? Math.max(0, parent.right - profileTextRight - 12)
      : Math.max(0, parent.right - copy.right - 24);
    const width = Math.min(availableWidth, size * .78);
    windowElement.style.setProperty('--about-rabbit-top', `${top - parent.top}px`);
    windowElement.style.setProperty('--about-rabbit-height', `${height}px`);
    windowElement.style.setProperty('--about-rabbit-size', `${size}px`);
    windowElement.style.setProperty('--about-rabbit-window-width', `${width}px`);
  }

  function reveal() {
    windowElement.classList.add('is-revealed');
  }

  positionRabbit();
  if (!('IntersectionObserver' in window)) {
    reveal();
  } else {
    // Observe the actual empty area; the full About section is several screens tall.
    observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (reducedMotion.matches || (entry.isIntersecting && entry.intersectionRatio >= .25)) reveal();
        else if (!entry.isIntersecting) windowElement.classList.remove('is-revealed');
      });
    }, { threshold: [0, .25] });
    observer.observe(windowElement);
    if (reducedMotion.matches) reveal();
  }

  function schedulePosition() {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(positionRabbit);
  }
  addEventListener('resize', schedulePosition, { passive: true });
  addEventListener('load', schedulePosition, { once: true });
  document.fonts?.ready.then(schedulePosition);
  if ('ResizeObserver' in window) {
    const sizes = new ResizeObserver(schedulePosition);
    [section, intro, profile].forEach(element => sizes.observe(element));
  }
  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches) reveal();
  });
})();
