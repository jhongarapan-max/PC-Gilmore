/* ============================================
   PC GILMORE - Landing Page JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', function() {
    initHeroAnimations();
    initScrollIndicator();
    initParallaxEffect();
    initCounterAnimation();
    initServicesSlideshow();
});

/* ============================================
   Services Overview Carousel (center large, sides small)
   ============================================ */
function initServicesSlideshow() {
    const container = document.querySelector('.services-carousel');
    if (!container) return;

    const track = container.querySelector('.services-carousel-track');
    if (!track) return;

    const slides = Array.from(track.querySelectorAll('.services-slide'));
    if (slides.length === 0) return;

    const dotsEl = container.querySelector('.services-carousel-dots');
    const prevBtn = container.querySelector('.services-carousel-nav-btn--prev');
    const nextBtn = container.querySelector('.services-carousel-nav-btn--next');

    const intervalMs = Number(container.getAttribute('data-interval')) || 3500;

    let currentIndex = slides.findIndex(slide => slide.classList.contains('is-active'));
    if (currentIndex < 0) currentIndex = 0;

    let timerId = null;
    let touchStartX = 0;
    let touchEndX = 0;

    function updateClasses() {
        const lastIndex = slides.length - 1;
        const prevIndex = (currentIndex - 1 + slides.length) % slides.length;
        const nextIndex = (currentIndex + 1) % slides.length;

        slides.forEach((slide, index) => {
            slide.classList.remove('is-active', 'is-prev', 'is-next');
            if (index === currentIndex) {
                slide.classList.add('is-active');
            } else if (index === prevIndex) {
                slide.classList.add('is-prev');
            } else if (index === nextIndex) {
                slide.classList.add('is-next');
            }
        });

        if (dotsEl) {
            const dots = Array.from(dotsEl.querySelectorAll('.services-carousel-dot'));
            dots.forEach((dot, index) => {
                dot.classList.toggle('is-active', index === currentIndex);
            });
        }
    }

    function goTo(index) {
        const targetIndex = (index + slides.length) % slides.length;
        if (targetIndex === currentIndex) return;
        currentIndex = targetIndex;
        updateClasses();
    }

    function startAuto() {
        stopAuto();
        timerId = window.setInterval(() => {
            goTo(currentIndex + 1);
        }, intervalMs);
    }

    function stopAuto() {
        if (timerId) {
            window.clearInterval(timerId);
            timerId = null;
        }
    }

    // Build dots
    if (dotsEl) {
        dotsEl.innerHTML = '';
        slides.forEach((_, i) => {
            const dot = document.createElement('button');
            dot.type = 'button';
            dot.className = 'services-carousel-dot';
            dot.setAttribute('aria-label', `Go to image ${i + 1}`);
            dot.addEventListener('click', () => {
                goTo(i);
                startAuto();
            });
            dotsEl.appendChild(dot);
        });
    }

    // Wire navigation buttons
    if (prevBtn) {
        prevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            goTo(currentIndex - 1);
            startAuto();
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            goTo(currentIndex + 1);
            startAuto();
        });
    }

    // Swipe functionality for mobile
    track.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    track.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });

    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Swipe left - next
                goTo(currentIndex + 1);
            } else {
                // Swipe right - previous
                goTo(currentIndex - 1);
            }
            startAuto();
        }
    }

    // Click to enlarge functionality
    slides.forEach((slide, index) => {
        const img = slide.querySelector('img');
        if (img) {
            img.addEventListener('click', () => {
                openLightbox(index);
            });
        }
    });

    // Pause autoplay on hover/focus for accessibility
    container.addEventListener('mouseenter', stopAuto);
    container.addEventListener('mouseleave', startAuto);
    container.addEventListener('focusin', stopAuto);
    container.addEventListener('focusout', startAuto);

    // Initial state
    updateClasses();
    startAuto();

    // Lightbox functionality
    function openLightbox(index) {
        const lightbox = document.getElementById('imageLightbox');
        const lightboxImage = document.getElementById('lightboxImage');
        if (!lightbox || !lightboxImage) return;

        currentIndex = index;
        updateLightboxImage();
        lightbox.classList.add('show');
        document.body.style.overflow = 'hidden';
        stopAuto();
    }

    function closeLightbox() {
        const lightbox = document.getElementById('imageLightbox');
        if (!lightbox) return;

        lightbox.classList.remove('show');
        document.body.style.overflow = '';
        startAuto();
    }

    function updateLightboxImage() {
        const lightboxImage = document.getElementById('lightboxImage');
        const activeSlide = slides[currentIndex];
        if (!lightboxImage || !activeSlide) return;

        const img = activeSlide.querySelector('img');
        if (img) {
            lightboxImage.src = img.src;
            lightboxImage.alt = img.alt || 'Full size image';
        }
    }

    function lightboxGoTo(index) {
        const targetIndex = (index + slides.length) % slides.length;
        currentIndex = targetIndex;
        updateClasses();
        updateLightboxImage();
    }

    // Lightbox controls
    const lightboxClose = document.querySelector('.image-lightbox-close');
    const lightboxPrev = document.querySelector('.image-lightbox-nav--prev');
    const lightboxNext = document.querySelector('.image-lightbox-nav--next');

    if (lightboxClose) {
        lightboxClose.addEventListener('click', closeLightbox);
    }

    if (lightboxPrev) {
        lightboxPrev.addEventListener('click', () => {
            lightboxGoTo(currentIndex - 1);
        });
    }

    if (lightboxNext) {
        lightboxNext.addEventListener('click', () => {
            lightboxGoTo(currentIndex + 1);
        });
    }

    // Close lightbox on background click
    const lightbox = document.getElementById('imageLightbox');
    if (lightbox) {
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });
    }

    // Close lightbox on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const lightbox = document.getElementById('imageLightbox');
            if (lightbox && lightbox.classList.contains('show')) {
                closeLightbox();
            }
        }
    });

    // Expose openLightbox for external use
    window.openServicesLightbox = (index) => openLightbox(index);
}

/* ============================================
   Throttle Helper Function
   ============================================ */
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/* ============================================
   Hero Section Animations
   ============================================ */
function initHeroAnimations() {
    const heroContent = document.querySelector('.hero-content');

    if (heroContent) {
        // Add loaded class after a short delay for entrance animation
        setTimeout(() => {
            heroContent.classList.add('loaded');
        }, 100);
    }
}

/* ============================================
   Scroll Indicator Click Handler
   ============================================ */
function initScrollIndicator() {
    const heroScroll = document.querySelector('.hero-scroll');

    if (heroScroll) {
        heroScroll.addEventListener('click', function() {
            const featuresSection = document.querySelector('#features');

            if (featuresSection) {
                const navbar = document.querySelector('.navbar');
                const navbarHeight = navbar ? navbar.offsetHeight : 0;
                const targetPosition = featuresSection.offsetTop - navbarHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    }
}

/* ============================================
   Parallax Effect for Hero
   ============================================ */
function initParallaxEffect() {
    const heroBg = document.querySelector('.hero-bg');

    if (heroBg && window.innerWidth > 768) {
        const handleScroll = throttle(function() {
            const scrolled = window.pageYOffset;
            const hero = document.querySelector('.hero');
            const heroHeight = hero ? hero.offsetHeight : 0;

            if (scrolled < heroHeight) {
                heroBg.style.transform = `translateY(${scrolled * 0.4}px)`;
            }
        }, 16);

        window.addEventListener('scroll', handleScroll);
    }
}

/* ============================================
   Counter Animation for Stats (if added)
   ============================================ */
function initCounterAnimation() {
    const counters = document.querySelectorAll('.counter');

    if (counters.length === 0) return;

    const observerOptions = {
        threshold: 0.5
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = parseInt(counter.dataset.target);
                const duration = 2000;
                const step = target / (duration / 16);
                let current = 0;

                const updateCounter = () => {
                    current += step;
                    if (current < target) {
                        counter.textContent = Math.floor(current);
                        requestAnimationFrame(updateCounter);
                    } else {
                        counter.textContent = target;
                    }
                };

                updateCounter();
                observer.unobserve(counter);
            }
        });
    }, observerOptions);

    counters.forEach(counter => observer.observe(counter));
}

/* ============================================
   Product Card Hover Effects
   ============================================ */
const productCards = document.querySelectorAll('.product-card');

productCards.forEach(card => {
    const productImage = card.querySelector('.product-image svg');

    if (productImage) {
        card.addEventListener('mouseenter', function() {
            productImage.style.transform = 'scale(1.1)';
            productImage.style.transition = 'transform 0.3s ease';
        });

        card.addEventListener('mouseleave', function() {
            productImage.style.transform = 'scale(1)';
        });
    }
});

/* ============================================
   Feature Cards Staggered Animation
   ============================================ */
const featureCards = document.querySelectorAll('.feature-card');

featureCards.forEach((card, index) => {
    card.style.transitionDelay = `${index * 0.1}s`;
});

/* ============================================
   Typing Effect for Hero (Optional)
   ============================================ */
function initTypingEffect(element, text, speed = 50) {
    let i = 0;
    element.textContent = '';

    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }

    type();
}

// Uncomment below to enable typing effect on hero title
// const heroTitle = document.querySelector('.hero-title');
// if (heroTitle) {
//     const originalText = heroTitle.textContent;
//     initTypingEffect(heroTitle, originalText, 80);
// }