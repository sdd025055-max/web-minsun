document.addEventListener('DOMContentLoaded', () => {
    // 1. 히어로 배너 슬라이드
    const heroSlider = new Swiper('.hero-slider', {
        loop: true,
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
        autoplay: {
            delay: 4000,
            disableOnInteraction: false,
        },
        speed: 1000
    });

    // 2. Section 1 (Timeless Pieces) 카드리스트 슬라이드
    const cardList = new Swiper('.cardlist-wrap', {
        breakpoints: {
            0: {
                slidesPerView: 1.2,
                spaceBetween: 12,
            },
            340: {
                slidesPerView: 2.2,
                spaceBetween: 12,
            },
            768: {
                slidesPerView: 3.2,
                spaceBetween: 14,
            },
            1024: {
                slidesPerView: 4,
                spaceBetween: 16,
            }
        },
        autoplay: {
            delay: 3000
        }
    });

    // 3. Section 2 (공간에 담긴 LUMORA) 리뷰 스토리 슬라이드
    const reviewStory = new Swiper('.review-story-wrap', {
        breakpoints: {
            0: {
                slidesPerView: 1.2,
                spaceBetween: 12,
            },
            340: {
                slidesPerView: 2.2,
                spaceBetween: 12,
            },
            768: {
                slidesPerView: 3.2,
                spaceBetween: 14,
            },
            1024: {
                slidesPerView: 4,
                spaceBetween: 16,
            }
        }
    });
});
