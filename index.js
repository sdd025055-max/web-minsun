const text = document.getElementById("contents-title");
const portfolioReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const portfolioMouse = window.matchMedia("(hover: hover) and (pointer: fine)");

document.addEventListener("mousemove", (e) => {
  if (!text || portfolioReducedMotion.matches || !portfolioMouse.matches || window.innerWidth <= 900) return;

  const x =
    (e.clientX / window.innerWidth - 0.5) * 2;

  const y =
    (e.clientY / window.innerHeight - 0.5) * -2;

  text.style.transform =
    `rotateX(${y}deg) rotateY(${x}deg)`;

});



// popup 

document.addEventListener("DOMContentLoaded", () => {
  const track = document.querySelector(".popup-track");
  const popupViewport = document.querySelector(".popup-viewport");
  const originalCards = [...document.querySelectorAll(".popup-card")];
  const prev = document.querySelector(".prev-button");
  const next = document.querySelector(".next-button");

  if (!track || !originalCards.length || !prev || !next) return;

  const cloneCount = Math.min(2, originalCards.length);
  const createClone = (card) => {
    const clone = card.cloneNode(true);
    clone.classList.add("popup-card--clone");
    clone.setAttribute("aria-hidden", "true");
    return clone;
  };

  // 첫·마지막 두 장을 복제해 끝 구간에서도 다음 사진이 비지 않도록 합니다.
  const firstClones = originalCards.slice(0, cloneCount).map(createClone);
  const lastClones = originalCards.slice(-cloneCount).map(createClone);

  track.append(...firstClones);
  track.prepend(...lastClones);

  const slides = [...track.querySelectorAll(".popup-card")];

  originalCards.forEach((card) => {
    const imageArea = card.querySelector(".popup-image");
    imageArea?.setAttribute("role", "button");
    imageArea?.setAttribute("tabindex", "0");
    imageArea?.setAttribute("aria-label", `${card.dataset.title} 상세 보기`);
  });

  const number = document.getElementById("projectNumber");
  const title = document.getElementById("projectTitle");
  const desc1 = document.getElementById("projectDescription1");
  const desc2 = document.getElementById("projectDescription2");
  const modal = document.getElementById("popupModal");
  const modalNumber = document.getElementById("popupModalNumber");
  const modalTitle = document.getElementById("popupModalTitle");
  const modalDesc1 = document.getElementById("popupModalDescription1");
  const modalDesc2 = document.getElementById("popupModalDescription2");
  const modalImage = document.getElementById("popupModalImage");
  const modalCloseButton = modal?.querySelector(".popup-modal__close");

  let index = 0;
  let visualIndex = cloneCount;
  let isAnimating = false;
  let timer;
  let resizeFrame;

  function updateProject() {
    const card = originalCards[index];

    if (number) number.textContent = card.dataset.number;
    if (title) title.textContent = card.dataset.title;
    if (desc1) desc1.textContent = card.dataset.description1;
    if (desc2) desc2.textContent = card.dataset.description2;
  }

  function moveTrack(animate = true) {
    track.style.transition = animate && !portfolioReducedMotion.matches ? "transform 1.5s ease" : "none";
    const activeSlide = slides[visualIndex];
    const isMobilePopup = window.matchMedia("(max-width: 700px)").matches;
    const mobileCenterOffset = isMobilePopup
      ? (popupViewport.clientWidth - activeSlide.offsetWidth) / 2
      : 0;
    track.style.transform = `translateX(-${activeSlide.offsetLeft - mobileCenterOffset}px)`;

    const logicalIndex =
      (visualIndex - cloneCount + originalCards.length) % originalCards.length;
    const matchingOriginalIndex = cloneCount + logicalIndex;

    slides.forEach((card, slideIndex) => {
      card.classList.toggle(
        "active",
        slideIndex === visualIndex || slideIndex === matchingOriginalIndex
      );
    });
  }

  function moveSlide(direction) {
    if (isAnimating) return;

    isAnimating = true;
    visualIndex += direction;
    index = (index + direction + originalCards.length) % originalCards.length;

    moveTrack(true);
    updateProject();
    if (portfolioReducedMotion.matches) settleSlide();
  }

  function openProject(card) {
    if (!modal) return;

    const image = card.querySelector(".popup-image img");

    modalNumber.textContent = card.dataset.number;
    modalTitle.textContent = card.dataset.title;
    modalDesc1.textContent = card.dataset.description1;
    modalDesc2.textContent = card.dataset.description2;
    modalImage.src = image.src;
    modalImage.alt = image.alt;

    modal.hidden = false;
    document.body.style.overflow = "hidden";
    clearInterval(timer);
    modalCloseButton?.focus();
  }

  function closeProject() {
    if (!modal || modal.hidden) return;

    modal.hidden = true;
    document.body.style.overflow = "";
    autoStart();
  }

  function autoStart() {
    clearInterval(timer);
    if (portfolioReducedMotion.matches || (modal && !modal.hidden)) return;
    timer = setInterval(() => {
      moveSlide(1);
    }, 4000);
  }

  next.addEventListener("click", (event) => {
    event.preventDefault();
    moveSlide(1);
    autoStart();
  });

  prev.addEventListener("click", (event) => {
    event.preventDefault();
    moveSlide(-1);
    autoStart();
  });

  track.addEventListener("click", (event) => {
    const imageArea = event.target.closest(".popup-image");
    if (!imageArea) return;

    const card = imageArea.closest(".popup-card");
    if (card) openProject(card);
  });

  track.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;

    const imageArea = event.target.closest(".popup-image");
    if (!imageArea) return;

    event.preventDefault();
    const card = imageArea.closest(".popup-card");
    if (card) openProject(card);
  });

  modal?.addEventListener("click", (event) => {
    if (event.target.closest("[data-popup-close]")) closeProject();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeProject();
  });

  function settleSlide() {
    if (visualIndex === cloneCount + originalCards.length) {
      visualIndex = cloneCount;
      moveTrack(false);
    } else if (visualIndex === cloneCount - 1) {
      visualIndex = cloneCount + originalCards.length - 1;
      moveTrack(false);
    }

    isAnimating = false;
  }

  track.addEventListener("transitionend", (event) => {
    // 카드의 transform 전환 이벤트는 버블링되므로, 트랙 이동이 끝났을 때만 처리합니다.
    if (event.target !== track || event.propertyName !== "transform") return;
    settleSlide();
  });
  portfolioReducedMotion.addEventListener("change", () => {
    if (portfolioReducedMotion.matches) { settleSlide(); moveTrack(false); }
    autoStart();
  });

  window.addEventListener("resize", () => {
    window.cancelAnimationFrame(resizeFrame);
    resizeFrame = window.requestAnimationFrame(() => {
      // A resize can cancel the CSS transition before transitionend fires.
      // Clear the lock so the previous/next buttons remain usable.
      isAnimating = false;
      moveTrack(false);
    });
  });

  moveTrack(false);
  updateProject();
  autoStart();
});

// Banner Designs: draggable carousel with a seamless automatic loop.
document.addEventListener("DOMContentLoaded", () => {
  const viewport = document.querySelector(".banner-carousel__viewport");
  const cards = [...document.querySelectorAll(".banner-card")];
  const indicators = [...document.querySelectorAll(".banner-carousel__pagination span")];

  if (!viewport || !cards.length) return;

  const track = viewport.querySelector(".banner-carousel__track");
  if (!track) return;
  const duplicateCard = (card) => {
    const duplicate = card.cloneNode(true);
    duplicate.classList.add("banner-card--duplicate");
    duplicate.setAttribute("aria-hidden", "true");
    return duplicate;
  };
  track.prepend(...cards.map(duplicateCard));
  track.append(...cards.map(duplicateCard));
  const visualCards = [...track.querySelectorAll(".banner-card")];

  let activeIndex = 0;
  let visualIndex = cards.length;
  let startX = 0;
  let startScrollLeft = 0;
  let isDragging = false;
  let isAnimating = false;
  let animationFrame;
  let ready = false;

  const getSlideLeft = (card) => {
    const cardRect = card.getBoundingClientRect();
    const viewportRect = viewport.getBoundingClientRect();
    return viewport.scrollLeft + cardRect.left - viewportRect.left - viewport.clientLeft
      - (viewport.clientWidth - cardRect.width) / 2;
  };

  const clamp = (value) => Math.min(
    Math.max(value, getSlideLeft(visualCards[0])),
    getSlideLeft(visualCards[visualCards.length - 1])
  );

  const stopAnimation = () => {
    if (animationFrame) window.cancelAnimationFrame(animationFrame);
    isAnimating = false;
    viewport.classList.remove("is-settling");
  };

  const updateIndicators = () => {
    indicators.forEach((indicator, index) => {
      indicator.classList.toggle("is-active", index === activeIndex);
    });
  };

  const normalizePosition = () => {
    const normalizedIndex = cards.length + (visualIndex % cards.length);
    if (normalizedIndex === visualIndex) return;
    // Identical neighbours surround both positions, so the reset is invisible.
    const offset = viewport.scrollLeft - getSlideLeft(visualCards[visualIndex]);
    visualIndex = normalizedIndex;
    viewport.scrollTo({ left: getSlideLeft(visualCards[visualIndex]) + offset, behavior: "instant" });
  };

  const alignSlide = () => {
    stopAnimation();
    viewport.classList.add("is-settling");
    visualIndex = cards.length + activeIndex;
    viewport.scrollTo({ left: getSlideLeft(visualCards[visualIndex]), behavior: "instant" });
    viewport.classList.remove("is-settling");
  };

  const easeInOut = (progress) => {
    const bezier = (t, point1, point2) => {
      const inverse = 1 - t;
      return 3 * inverse * inverse * t * point1 + 3 * inverse * t * t * point2 + t * t * t;
    };
    const slope = (t, point1, point2) => {
      const inverse = 1 - t;
      return 3 * inverse * inverse * point1 + 6 * inverse * t * (point2 - point1) + 3 * t * t * (1 - point2);
    };

    // Resolve the x coordinate of CSS `ease-in-out` (cubic-bezier(.42, 0, .58, 1)).
    let t = progress;
    for (let iteration = 0; iteration < 5; iteration += 1) {
      t -= (bezier(t, 0.42, 0.58) - progress) / slope(t, 0.42, 0.58);
    }
    return bezier(t, 0, 1);
  };

  const animateToPosition = (target, onComplete) => {
    const start = viewport.scrollLeft;
    const startTime = performance.now();
    const duration = 700;

    stopAnimation();
    if (portfolioReducedMotion.matches) {
      viewport.scrollLeft = target;
      onComplete?.();
      return;
    }
    isAnimating = true;
    viewport.classList.add("is-settling");
    const animate = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      // CSS ease-in-out over exactly 0.7s.
      const eased = easeInOut(progress);
      viewport.scrollLeft = start + (target - start) * eased;
      if (progress < 1) {
        animationFrame = window.requestAnimationFrame(animate);
      } else {
        isAnimating = false;
        onComplete?.();
        viewport.classList.remove("is-settling");
      }
    };
    animationFrame = window.requestAnimationFrame(animate);
  };

  const animateToSlide = (index) => {
    visualIndex = Math.min(Math.max(index, 0), visualCards.length - 1);
    activeIndex = visualIndex % cards.length;
    updateIndicators();
    animateToPosition(getSlideLeft(visualCards[visualIndex]), normalizePosition);
  };

  const advanceSlide = () => {
    if (!ready || isDragging || isAnimating || document.hidden) return;
    animateToSlide(visualIndex + 1);
  };

  const closestIndex = () => visualCards.reduce((closest, card, index) => (
    Math.abs(getSlideLeft(card) - viewport.scrollLeft) < Math.abs(getSlideLeft(visualCards[closest]) - viewport.scrollLeft)
      ? index
      : closest
  ), 0);

  viewport.addEventListener("pointerdown", (event) => {
    if (!ready) return;
    if (event.button !== 0 && event.pointerType === "mouse") return;
    stopAnimation();
    visualIndex = closestIndex();
    viewport.classList.add("is-dragging");
    normalizePosition();
    activeIndex = visualIndex % cards.length;
    updateIndicators();
    startX = event.clientX;
    startScrollLeft = viewport.scrollLeft;
    isDragging = true;
    viewport.classList.add("is-dragging");
    viewport.setPointerCapture(event.pointerId);
  });

  viewport.addEventListener("pointermove", (event) => {
    if (!isDragging) return;
    event.preventDefault();
    viewport.scrollLeft = clamp(startScrollLeft - (event.clientX - startX));
  });

  const finishDrag = (event) => {
    if (!isDragging) return;

    isDragging = false;
    viewport.classList.remove("is-dragging");
    if (viewport.hasPointerCapture(event.pointerId)) viewport.releasePointerCapture(event.pointerId);

    const distance = event.clientX - startX;
    const threshold = Math.min(visualCards[visualIndex].clientWidth * 0.15, 120);
    let targetIndex = closestIndex();

    // A deliberate drag always moves just one banner in that direction.
    if (Math.abs(distance) > threshold) {
      targetIndex = visualIndex + (distance < 0 ? 1 : -1);
    }

    animateToSlide(targetIndex);
  };

  viewport.addEventListener("pointerup", finishDrag);
  viewport.addEventListener("pointercancel", finishDrag);
  viewport.addEventListener("dragstart", (event) => event.preventDefault());
  let bannerTimer;
  const syncBannerMotion = () => {
    window.clearInterval(bannerTimer);
    if (!ready) return;
    if (portfolioReducedMotion.matches) {
      alignSlide();
    } else {
      bannerTimer = window.setInterval(advanceSlide, 4000);
    }
  };
  portfolioReducedMotion.addEventListener("change", syncBannerMotion);
  // Position immediately, then remeasure once the actual image dimensions are ready.
  alignSlide();
  const imagesReady = [...track.querySelectorAll("img")].map((image) => {
    if (image.decode) return image.decode().catch(() => {});
    if (image.complete) return Promise.resolve();
    return new Promise((resolve) => {
      image.addEventListener("load", resolve, { once: true });
      image.addEventListener("error", resolve, { once: true });
    });
  });
  Promise.all(imagesReady).then(() => {
    ready = true;
    alignSlide();
    syncBannerMotion();
  });
  if ("ResizeObserver" in window) {
    const sizes = new ResizeObserver(() => {
      if (!isDragging) alignSlide();
    });
    sizes.observe(viewport);
    sizes.observe(cards[0]);
  } else {
    window.addEventListener("resize", () => { if (!isDragging) alignSlide(); });
  }
  window.addEventListener("pageshow", () => {
    if (ready) { alignSlide(); syncBannerMotion(); }
  });
  viewport.addEventListener("scrollend", () => {
    if (!ready || isDragging || isAnimating) return;
    visualIndex = closestIndex();
    activeIndex = visualIndex % cards.length;
    viewport.classList.add("is-settling");
    normalizePosition();
    viewport.classList.remove("is-settling");
    updateIndicators();
  });
});

// Detail Page Designs: open the selected long-form detail in a scrollable modal.
document.addEventListener("DOMContentLoaded", () => {
  const triggers = [...document.querySelectorAll("[data-detail-target]")];
  const pages = [...document.querySelectorAll(".detail-page")];
  const modal = document.getElementById("detailModal");
  const scrollArea = modal?.querySelector(".detail-modal__scroll");

  if (!triggers.length || !pages.length || !modal || !scrollArea) return;

  let activeTrigger = null;

  const closeModal = () => {
    if (modal.hidden) return;

    modal.hidden = true;
    document.body.classList.remove("is-detail-modal-open");
    triggers.forEach((trigger) => trigger.setAttribute("aria-expanded", "false"));
    activeTrigger?.focus();
  };

  triggers.forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const page = document.getElementById(trigger.dataset.detailTarget);
      if (!page) return;

      pages.forEach((item) => {
        item.hidden = item !== page;
      });
      triggers.forEach((item) => {
        item.setAttribute("aria-expanded", String(item === trigger));
      });

      activeTrigger = trigger;
      modal.hidden = false;
      document.body.classList.add("is-detail-modal-open");
      scrollArea.scrollTop = 0;
      modal.querySelector(".detail-modal__close")?.focus();
    });
  });

  modal.addEventListener("click", (event) => {
    if (event.target.closest("[data-detail-close]")) closeModal();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modal.hidden) closeModal();
  });
});
