/* ============================================
   PC GILMORE - Landing Page JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', function() {
    initHeroAnimations();
    initScrollIndicator();
    initParallaxEffect();
    initCounterAnimation();
});

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