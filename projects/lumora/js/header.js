document.addEventListener('DOMContentLoaded', () => {
  const overlay=document.querySelector('.smart-overlay-menu'),openButton=document.querySelector('.smart-header .btn-menu a'),closeButton=document.querySelector('.smart-overlay-menu .btn-menu-close a');
  const navLinks=[...document.querySelectorAll('.gnb-smart > li > a')],panels=[...document.querySelectorAll('.gnb2depth-smart')];
  if(!overlay||!openButton||!closeButton)return;
  const setOpen=isOpen=>{overlay.classList.toggle('is-open',isOpen);overlay.setAttribute('aria-hidden',String(!isOpen));openButton.setAttribute('aria-expanded',String(isOpen));document.body.classList.toggle('menu-open',isOpen);if(isOpen)closeButton.focus();else openButton.focus();};
  openButton.setAttribute('role','button');openButton.setAttribute('aria-controls','smart-navigation');openButton.setAttribute('aria-expanded','false');overlay.id='smart-navigation';overlay.setAttribute('aria-hidden','true');
  openButton.addEventListener('click',event=>{event.preventDefault();setOpen(true);});closeButton.addEventListener('click',event=>{event.preventDefault();setOpen(false);});
  navLinks.forEach((link,index)=>link.addEventListener('click',event=>{if(index===0){setOpen(false);return;}event.preventDefault();panels.forEach((panel,panelIndex)=>panel.classList.toggle('is-active',panelIndex===index-1));}));
  if(panels[0])panels[0].classList.add('is-active');document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!document.querySelector('dialog[open]')&&overlay.classList.contains('is-open'))setOpen(false);});
});
