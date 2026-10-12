'use strict';
(() => {
  const catalog = window.LumoraCatalog;
  const price = product => Math.round(product.price * (1 - (product.discount || 0) / 100));
  const won = value => Number(value).toLocaleString('ko-KR') + '원';
  const params = new URLSearchParams(location.search);
  const route = (file, query = {}) => {
    const search = new URLSearchParams(query);
    if (params.get('embed') === '1') search.set('embed','1');
    return './' + file + (search.size ? '?' + search.toString() : '');
  };
  let dialog = document.querySelector('#info-dialog');
  if (!dialog) {
    dialog = document.createElement('dialog');
    dialog.id = 'info-dialog'; dialog.setAttribute('aria-labelledby','dialog-title');
    dialog.innerHTML = '<div class="dialog-head"><h2 id="dialog-title"></h2><button class="close-dialog" type="button" aria-label="닫기">×</button></div><div id="dialog-content"></div>';
    document.body.append(dialog);
  }
  const show = (title, content) => {
    dialog.querySelector('#dialog-title').textContent = title;
    const body = dialog.querySelector('#dialog-content'); body.replaceChildren();
    if (typeof content === 'string') { const p = document.createElement('p'); p.textContent = content; body.append(p); }
    else body.append(content);
    if (!dialog.open) dialog.showModal();
  };
  dialog.querySelector('.close-dialog').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if(event.target === dialog) { const box = dialog.getBoundingClientRect(); if(event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close(); } });
  const cartKey = 'minsun-lumora-demo-cart-v1';
  let memoryCart = [];
  const readCart = () => {
    try { const saved = JSON.parse(localStorage.getItem(cartKey) || '[]'); return Array.isArray(saved) ? saved.filter(item => catalog.some(p => p.id === item.id) && Number.isInteger(item.quantity) && item.quantity > 0 && item.quantity <= 99 && ['기본','SS','Q','K'].includes(item.size)) : []; }
    catch { return memoryCart; }
  };
  const optionCost = size => ({Q:100000,K:180000}[size] || 0);
  const saveCart = cart => { memoryCart = cart; try { localStorage.setItem(cartKey,JSON.stringify(cart)); return true; } catch { return false; } };
  function viewCart() {
    const cart = readCart();
    const box = document.createElement('div'); box.className = 'demo-cart';
    if (!cart.length) { box.innerHTML = '<p>장바구니가 비어 있습니다.</p>'; const link = document.createElement('a'); link.href = route('list.html'); link.className = 'demo-primary'; link.textContent = '컬렉션 둘러보기'; box.append(link); }
    let total = 0;
    cart.forEach((item,index) => {
      const product = catalog.find(p => p.id === item.id); const unit = price(product) + optionCost(item.size); total += unit * item.quantity;
      const row = document.createElement('div'); row.className = 'demo-cart-row';
      const img = document.createElement('img'); img.src = './img/' + product.image; img.alt = product.name;
      const info = document.createElement('div'); const link = document.createElement('a'); link.href = route('product.html',{pid:product.id}); link.textContent = product.name;
      const detail = document.createElement('p'); detail.textContent = item.size + ' · ' + item.quantity + '개 · ' + won(unit * item.quantity);
      const remove = document.createElement('button'); remove.type = 'button'; remove.textContent = '삭제'; remove.setAttribute('aria-label',product.name + ' 장바구니에서 삭제');
      remove.addEventListener('click',() => { cart.splice(index,1); saveCart(cart); viewCart(); });
      info.append(link,detail); row.append(img,info,remove); box.append(row);
    });
    if(cart.length) { const totalEl = document.createElement('p'); totalEl.className = 'demo-cart-total'; totalEl.textContent = '합계 ' + won(total); box.append(totalEl); }
    const note = document.createElement('p'); note.className = 'demo-note'; note.textContent = '포트폴리오 체험용 장바구니입니다. 주문·결제는 진행되지 않습니다.'; box.append(note); show('장바구니',box);
  }
  const addCart = (id,size,quantity) => {
    const cart = readCart(); const current = cart.find(item => item.id === id && item.size === size);
    if(current) current.quantity = Math.min(99,current.quantity + quantity); else cart.push({id,size,quantity});
    const persistent = saveCart(cart);
    const box = document.createElement('div'); const p = document.createElement('p'); p.textContent = persistent ? '선택한 상품을 장바구니에 담았습니다.' : '상품을 담았습니다. 현재 브라우저에서는 이 페이지를 닫으면 장바구니가 초기화됩니다.';
    const button = document.createElement('button'); button.type = 'button'; button.className = 'demo-primary'; button.textContent = '장바구니 보기'; button.addEventListener('click',viewCart); box.append(p,button); show('담기 완료',box);
  };
  const search = () => {
    const form = document.createElement('form'); form.className = 'demo-search';
    const label = document.createElement('label'); label.htmlFor = 'global-product-search'; label.textContent = '찾고 싶은 가구를 입력해 주세요';
    const input = document.createElement('input'); input.id = 'global-product-search'; input.type = 'search'; input.name = 'q'; input.placeholder = '예: 침대, 오크, 소파';
    const button = document.createElement('button'); button.type = 'submit'; button.className = 'demo-primary'; button.textContent = '상품 검색';
    form.append(label,input,button); form.addEventListener('submit',event => { event.preventDefault(); location.href = route('list.html',{q:input.value.trim()}); }); show('상품 검색',form); input.focus();
  };
  const category = text => /침대|침실|Bedroom|Bed/.test(text) ? '침대' : /소파|거실|Sofa|Living/.test(text) ? '소파' : /의자|체어|Chair|벤치/.test(text) ? '의자' : /수납|책장|Shelf/.test(text) ? '수납' : /테이블|책상|다이닝|주방|서재|Table|Dining|Office/.test(text) ? '테이블' : '';
  document.querySelectorAll('.gnb a,.gnb2depth-smart a,.gnb-smart a').forEach(link => {
    const title = link.textContent.trim();
    if(title === 'HOME') link.href = route('index.html');
    else if(title === 'LOOKBOOK' || title === 'MAGAZINE') link.href = route('index.html') + '#stories';
    else if(title === 'ABOUT') link.href = route('index.html') + '#brand';
    else link.href = route('list.html',category(title) ? {category:category(title)} : {});
  });
  document.querySelectorAll('.user-menu a,.smart-actions a').forEach(link => {
    const label = link.textContent.trim() || link.querySelector('img')?.alt || '';
    link.href = '#'; link.dataset.action = /장바구니/.test(label) ? 'cart' : /검색/.test(label) ? 'search' : 'account';
  });
  document.querySelectorAll('.logo a').forEach(link => link.href = route('index.html'));
  document.querySelectorAll('.cardlist a').forEach(link => { const value = category(link.textContent); link.href = route('list.html',value ? {category:value} : {}); });
  document.querySelectorAll('.review-story a').forEach(link => link.href = route('product.html',{pid:1}) + '#product-reviews');
  document.querySelectorAll('.con3 a').forEach(link => link.href = route('list.html'));
  document.querySelectorAll('.f-nav a,.sns-icons a,.banner-line a').forEach(link => { link.dataset.action = 'notice'; });
  const footer = document.querySelector('footer'); if(footer) footer.id = 'brand';
  const stories = document.querySelector('.con2'); if(stories) stories.id = 'stories';
  document.addEventListener('click',event => {
    const trigger = event.target.closest('[data-action]'); if(!trigger) return;
    const action = trigger.dataset.action;
    if(action === 'cart') { event.preventDefault(); viewCart(); }
    if(action === 'search') { event.preventDefault(); search(); }
    if(action === 'account') { event.preventDefault(); show('LUMORA 멤버십','포트폴리오 체험 사이트입니다. 회원가입이나 개인정보 입력 없이 상품과 장바구니를 둘러볼 수 있습니다.'); }
    if(action === 'notice') { event.preventDefault(); show(trigger.textContent.trim() || 'LUMORA 안내','백민선의 가구 브랜드 웹사이트 포트폴리오입니다. 상품 탐색, 옵션 선택과 장바구니를 체험할 수 있으며 실제 판매 및 주문은 제공하지 않습니다.'); }
  });
  const skip = document.createElement('a'); skip.className = 'demo-skip'; skip.href = '#main-content'; skip.textContent = '본문 바로가기'; document.body.prepend(skip);
  const main = document.querySelector('main'); if(main && !main.id) main.id = 'main-content'; else if(main) skip.href = '#' + main.id;
  document.querySelectorAll('img').forEach(img => { if(!img.closest('.hero-slider,.list-hero,.product-gallery,.logo')) img.loading = 'lazy'; });
  window.Lumora = {catalog,price,won,route,show,addCart,viewCart,optionCost};
})();
