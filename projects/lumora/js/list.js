'use strict';

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.product-card a').forEach((card) => {
    card.addEventListener('click', () => card.classList.add('is-selected'));
  });
});
