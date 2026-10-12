'use strict';

(() => {
  const form = document.querySelector('.auth-panel form');
  const message = document.querySelector('#auth-message');
  const notify = (text, field, success = false) => {
    message.textContent = text;
    message.classList.toggle('is-success', success);
    if (field) { field.setAttribute('aria-invalid', 'true'); field.focus(); }
  };
  form.addEventListener('input', event => event.target.removeAttribute('aria-invalid'));
  form.addEventListener('submit', event => {
    event.preventDefault();
    const fields = [...form.querySelectorAll('input[required]:not([type="checkbox"])')];
    fields.forEach(field => field.removeAttribute('aria-invalid'));
    const empty = fields.find(field => !field.value.trim());
    const signup = form.id === 'signup-form';
    if (empty) return notify(signup ? '필수 항목을 모두 입력해주세요.' : '아이디와 비밀번호를 입력해주세요.', empty);
    if (signup) {
      const confirmation = form.elements.namedItem('password-confirm');
      if (form.elements.password.value !== confirmation.value) return notify('비밀번호가 일치하지 않습니다.', confirmation);
      const unchecked = [...form.querySelectorAll('input[type="checkbox"][required]')].find(field => !field.checked);
      if (unchecked) return notify('필수 약관에 모두 동의해주세요.', unchecked);
      notify('회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.', null, true);
    } else {
      // 계정 정보와 비밀번호는 저장하지 않고 데모 로그인 상태만 유지합니다.
      try {
        localStorage.removeItem('lumola-demo-session');
        sessionStorage.removeItem('lumola-demo-session');
        const storage = form.elements.remember.checked ? localStorage : sessionStorage;
        storage.setItem('lumola-demo-session', 'true');
      } catch { /* 저장소가 제한되어도 로그인 체험은 진행합니다. */ }
      notify('로그인되었습니다. 메인 페이지로 이동합니다.', null, true);
    }
    form.querySelector('[type="submit"]').disabled = true;
    window.setTimeout(() => location.assign(signup ? './login.html' : './index.html'), 1200);
  });
  document.querySelectorAll('[data-auth-help]').forEach(button => {
    button.addEventListener('click', () => notify(
      ['identity', 'password'].includes(button.dataset.authHelp)
        ? '포트폴리오 데모에서는 계정 찾기를 제공하지 않습니다. 임의의 아이디와 비밀번호로 로그인 체험이 가능합니다.'
        : '간편 로그인은 준비 중입니다. 아이디와 비밀번호를 입력해 로그인 체험을 이용해주세요.'
    ));
  });
})();
