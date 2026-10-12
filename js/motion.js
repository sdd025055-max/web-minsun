/* Progressive enhancement: content stays visible if JS or IntersectionObserver is unavailable. */
(() => {
  'use strict';
  if (!('IntersectionObserver' in window)) return;

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const pending = new Set();
  const running = new Map();
  const repeatable = new Set();
  const $all = (selector) => [...document.querySelectorAll(selector)];
  const finish = (element) => {
    element.classList.remove('is-motion-pending', 'is-motion-running');
    pending.delete(element);
    clearTimeout(running.get(element));
    running.delete(element);
  };
  const reveal = (element) => {
    if (!pending.has(element)) return;
    if (!repeatable.has(element)) observer.unobserve(element);
    element.classList.remove('is-motion-pending');
    element.classList.add('is-motion-running');
    pending.delete(element);
    // Also finish when an animation is cancelled or styles are unavailable.
    running.set(element, setTimeout(() => finish(element), 1500));
  };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(({ target, isIntersecting }) => {
      if (isIntersecting) reveal(target);
      else if (repeatable.has(target) && !reduced.matches && !target.contains(document.activeElement)) {
        finish(target);
        target.classList.add('is-motion-pending');
        pending.add(target);
      }
    });
  }, { threshold: 0, rootMargin: '0px 0px -32px 0px' });

  function prepare(element, className) {
    element.classList.add(className);
    if (className !== 'motion-image') repeatable.add(element);
    if (reduced.matches) return;
    if (repeatable.has(element)) observer.observe(element);
    // Deep links and the initial viewport must remain immediately readable.
    if (element.getBoundingClientRect().top < innerHeight) return;
    element.classList.add('is-motion-pending');
    pending.add(element);
    observer.observe(element);
    element.addEventListener('animationend', (event) => {
      if (event.target === element || event.target.classList.contains('motion-title__text')) finish(element);
    });
  }

  $all('#about-title, #contents-title, .popup-designs__intro h2, #poster-designs-title, #banner-designs-title, #detail-designs-title, #web-designs-title, #lumora-project-title, .experience > h2, .contact > h2').forEach((title) => {
    const text = document.createElement('span');
    text.className = 'motion-title__text';
    text.append(...title.childNodes);
    title.append(text);
    prepare(title, 'motion-title');
  });

  const imageGroups = [
    ['.Section2.image > img, .poster1, .poster3, .poster5, .detail-card:nth-child(1) .detail-card__image, .lumora-intro__visual', ''],
    ['.poster2, .poster4, .detail-card:nth-child(3) .detail-card__image, .lumora-concept__image, .lumora-screen:nth-of-type(even) .lumora-screen__visual', 'motion-image--right'],
    ['.popup-viewport, .banner-carousel__viewport, .detail-card:nth-child(2) .detail-card__image, .lumora-screen__visual:not(.motion-image), .lumora-device__frame', 'motion-image--down']
  ];
  imageGroups.forEach(([selector, direction]) => $all(selector).forEach((element) => {
    if (direction) element.classList.add(direction);
    prepare(element, 'motion-image');
  }));
  $all('.Section2.text, .Section3.intro > p, .skill-item:not(.skill-item--empty), .popup-designs__description, .poster-project__copy, .banner-designs__description, .detail-designs__description, .detail-card__copy, .web-designs__description, .web-designs__project, .experience__grid > article, .contact__text').forEach((element, index) => {
    element.style.setProperty('--motion-delay', `${(index % 3) * 70 + 70}ms`);
    prepare(element, 'motion-copy');
  });

  $all('.Section3.profile > div').forEach((element, index) => {
    element.style.setProperty('--motion-delay', `${index * 90}ms`);
    prepare(element, 'motion-profile');
  });

  // Focusing a button or following an in-page link must never target hidden content.
  document.addEventListener('focusin', (event) => {
    for (const element of pending) {
      if (element.contains(event.target) || event.target.contains(element)) {
        if (!repeatable.has(element)) observer.unobserve(element);
        finish(element);
      }
    }
  });

  const yarns = $all('.Section3.pink-c, .skills-heading-s');
  const rabbits = $all('.motion-rabbit');
  const marquees = $all('.motion-marquee');
  const active = new Set();
  let frame = 0;
  let pointerX = 0;
  let pointerY = 0;
  yarns.forEach((element) => element.classList.add('motion-yarn'));
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  function updateMotion() {
    frame = 0;
    if (reduced.matches || document.hidden) return;
    const strength = innerWidth <= 600 ? .3 : innerWidth <= 900 ? .6 : 1;
    // Batch geometry reads before style writes; only visible decorations are measured.
    const measurements = [...active].map((element) => ({element, rect: element.getBoundingClientRect()}));
    measurements.forEach(({ element, rect }) => {
      if (element.classList.contains('motion-yarn')) {
        const progress = clamp((innerHeight / 2 - rect.top - rect.height / 2) / (innerHeight / 2 + rect.height / 2), -1, 1);
        const sign = element.classList.contains('pink-c') ? 1 : -1;
        element.style.setProperty('--yarn-x', `${pointerX * strength}px`);
        element.style.setProperty('--yarn-y', `${(progress * 22 + pointerY) * strength}px`);
        element.style.setProperty('--yarn-angle', `${progress * 8 * sign * strength}deg`);
        element.style.setProperty('--yarn-scale', 1 + progress * .012 * strength);
      } else if (element.classList.contains('motion-rabbit')) {
        const progress = clamp((innerHeight * .95 - rect.top) / (innerHeight * .35), 0, 1);
        element.style.setProperty('--peek-progress', progress.toFixed(3));
        element.classList.toggle('is-peeking', progress > .9);
      }
    });
  }
  function requestTick() {
    if (!frame && active.size && !reduced.matches && !document.hidden) frame = requestAnimationFrame(updateMotion);
  }
  const decorationObserver = new IntersectionObserver((entries) => {
    entries.forEach(({ target, isIntersecting }) => {
      if (isIntersecting) active.add(target); else active.delete(target);
      target.classList.toggle('is-in-view', isIntersecting && !reduced.matches && !document.hidden);
      if (!isIntersecting) target.classList.remove('is-peeking');
    });
    requestTick();
  });
  [...yarns, ...rabbits, ...marquees].forEach((element) => decorationObserver.observe(element));
  addEventListener('scroll', requestTick, { passive: true });
  addEventListener('resize', () => {
    if (innerWidth <= 900 || !finePointer.matches) pointerX = pointerY = 0;
    requestTick();
  }, { passive: true });
  addEventListener('pointermove', (event) => {
    if (reduced.matches || !finePointer.matches || event.pointerType !== 'mouse' || innerWidth <= 900) return;
    pointerX = (event.clientX / innerWidth - .5) * 6;
    pointerY = (event.clientY / innerHeight - .5) * 6;
    requestTick();
  }, { passive: true });
  document.addEventListener('pointerleave', () => { pointerX = pointerY = 0; requestTick(); });
  document.addEventListener('visibilitychange', () => {
    marquees.forEach((element) => element.classList.toggle('is-in-view', !document.hidden && !reduced.matches && active.has(element)));
    if (document.hidden) rabbits.forEach((element) => element.classList.remove('is-peeking'));
    requestTick();
  });
  reduced.addEventListener('change', () => {
    if (reduced.matches) {
      observer.disconnect();
      [...pending, ...running.keys()].forEach(finish);
      cancelAnimationFrame(frame);
      frame = 0;
      yarns.forEach((element) => ['--yarn-x', '--yarn-y', '--yarn-angle', '--yarn-scale'].forEach((property) => element.style.removeProperty(property)));
      rabbits.forEach((element) => element.classList.remove('is-peeking'));
    } else {
      repeatable.forEach((element) => observer.observe(element));
    }
    marquees.forEach((element) => element.classList.toggle('is-in-view', !reduced.matches && active.has(element)));
    requestTick();
  });
  document.documentElement.classList.add('motion-ready');
})();
