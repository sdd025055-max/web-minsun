(() => {
  const nav = document.querySelector('.section-nav');
  if (!nav) return;

  const mobile = window.matchMedia('(max-width: 768px)');
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'menu-toggle';
  toggle.setAttribute('aria-controls', 'portfolio-menu');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-label', '메뉴 열기');
  toggle.innerHTML = '<span class="menu-toggle__label">MENU</span><span class="menu-toggle__icon" aria-hidden="true"></span>';
  nav.before(toggle);

  let isOpen = false;
  let scrollY = 0;
  let bodyStyle = '';
  let background = [];

  function setOpen(next, restoreFocus = true) {
    if (next === isOpen) return;
    isOpen = next;
    nav.classList.toggle('is-open', next);
    toggle.setAttribute('aria-expanded', String(next));
    toggle.setAttribute('aria-label', next ? '메뉴 닫기' : '메뉴 열기');
    toggle.querySelector('.menu-toggle__label').textContent = next ? 'CLOSE' : 'MENU';

    if (next) {
      scrollY = window.scrollY;
      bodyStyle = document.body.style.cssText;
      Object.assign(document.body.style, {
        position: 'fixed', top: `-${scrollY}px`, width: '100%', overflow: 'hidden'
      });
      background = [...document.body.children].filter(node =>
        node !== nav && node !== toggle && !node.inert && !['SCRIPT', 'STYLE'].includes(node.tagName)
      );
      background.forEach(node => { node.inert = true; });
      nav.prepend(toggle);
      nav.setAttribute('role', 'dialog');
      nav.setAttribute('aria-modal', 'true');
      nav.inert = false;
      nav.scrollTop = 0;
      nav.querySelector('a').focus({ preventScroll: true });
    } else {
      nav.before(toggle);
      background.forEach(node => { node.inert = false; });
      background = [];
      document.body.style.cssText = bodyStyle;
      window.scrollTo({ top: scrollY, behavior: 'instant' });
      nav.removeAttribute('role');
      nav.removeAttribute('aria-modal');
      nav.inert = mobile.matches;
      if (restoreFocus) toggle.focus({ preventScroll: true });
    }
  }

  toggle.addEventListener('click', () => setOpen(!isOpen));
  nav.addEventListener('click', event => {
    const link = event.target.closest('a');
    if (!link || !isOpen) return;
    setOpen(false);
    const hash = link.getAttribute('href');
    const target = hash?.startsWith('#') && hash.length > 1
      ? document.getElementById(hash.slice(1)) : null;
    if (target) {
      const previousTabindex = target.getAttribute('tabindex');
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
      target.addEventListener('blur', () => {
        if (previousTabindex === null) target.removeAttribute('tabindex');
        else target.setAttribute('tabindex', previousTabindex);
      }, { once: true });
    }
  });

  document.addEventListener('keydown', event => {
    if (!isOpen) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      setOpen(false);
    }
    if (event.key === 'Tab') {
      const controls = [toggle, ...nav.querySelectorAll('a[href]')];
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  function syncViewport() {
    if (!mobile.matches) setOpen(false, false);
    nav.inert = mobile.matches && !isOpen;
  }
  mobile.addEventListener('change', syncViewport);
  syncViewport();
})();
