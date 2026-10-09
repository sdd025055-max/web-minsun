/* =========================================================
   PROJECT DESIGN SYSTEM + FIGMA PREVIEW
   Shared by GEULGIL and LUMORA. Content stays visible without JS.
========================================================= */

/* Figma 링크는 여기에만 입력하세요. (예: "https://www.figma.com/design/...")
   비어 있으면 버튼은 '준비 중' 상태로 표시되고 이동하지 않습니다. */
const projectLinks = {
  geulgil: {
    figma: ""
  },
  lumora: {
    figma: ""
  }
};

(() => {
  'use strict';

  const toHttpUrl = (value) => {
    try {
      const url = new URL(String(value || '').trim());
      return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : '';
    } catch {
      return '';
    }
  };

  function setupFigmaButtons() {
    document.querySelectorAll('[data-figma-project]').forEach((button) => {
      const key = button.dataset.figmaProject;
      const href = toHttpUrl(projectLinks[key]?.figma);
      const status = document.getElementById(button.getAttribute('aria-describedby'));

      if (href) {
        button.href = href;
        button.target = '_blank';
        button.rel = 'noopener noreferrer';
        button.removeAttribute('role');
        button.removeAttribute('aria-disabled');
        button.removeAttribute('tabindex');
        if (status) status.textContent = '새 탭에서 Figma 시안이 열립니다.';
        return;
      }

      // No link yet: keep the button focusable so its status can be read, but never navigate.
      button.addEventListener('click', (event) => event.preventDefault());
    });
  }

  function setupReveal() {
    const sections = [...document.querySelectorAll('.project-design-system')];
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    if (!sections.length || !('IntersectionObserver' in window) || reduced.matches) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(({ target, isIntersecting }) => {
        if (!isIntersecting) return;
        target.classList.add('ds-is-visible');
        observer.unobserve(target);
      });
    }, { threshold: 0, rootMargin: '0px 0px -8% 0px' });

    sections.forEach((section) => {
      section.querySelectorAll('[data-ds-reveal]').forEach((element) => {
        // Elements already on screen (deep links, restored scroll) stay visible immediately.
        if (element.getBoundingClientRect().top < innerHeight) element.classList.add('ds-is-visible');
        else observer.observe(element);
      });
      section.classList.add('ds-motion-ready');
      section.addEventListener('focusin', (event) => {
        const target = event.target.closest('[data-ds-reveal]');
        if (target) target.classList.add('ds-is-visible');
      });
    });

    const showAll = () => {
      if (!reduced.matches) return;
      sections.forEach((section) => section.classList.remove('ds-motion-ready'));
      observer.disconnect();
    };
    if (reduced.addEventListener) reduced.addEventListener('change', showAll);
    else reduced.addListener(showAll);
  }

  const init = () => {
    setupFigmaButtons();
    setupReveal();
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
