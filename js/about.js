/* ============================================
   PC GILMORE - About Page JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', function() {
    initValueCards();
    initTeamCards();
    initStatsAnimation();
});

/* ============================================
   Value Cards Staggered Animation
   ============================================ */
function initValueCards() {
    const valueCards = document.querySelectorAll('.value-card');

    valueCards.forEach((card, index) => {
        card.style.transitionDelay = `${index * 0.1}s`;
    });
}

/* ============================================
   Team Cards Staggered Animation
   ============================================ */
function initTeamCards() {
    const teamCards = document.querySelectorAll('.team-card');

    teamCards.forEach((card, index) => {
        card.style.transitionDelay = `${index * 0.1}s`;
    });
}

/* ============================================
   Stats Counter Animation
   ============================================ */
function initStatsAnimation() {
    const statNumbers = document.querySelectorAll('.stat-number');

    if (statNumbers.length === 0) return;

    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const statItem = entry.target;
                const targetText = statItem.textContent;

                // Extract number from text (handles formats like "10,000+")
                const targetNumber = parseInt(targetText.replace(/[^0-9]/g, ''));
                const suffix = targetText.includes('+') ? '+' : '';
                const hasComma = targetText.includes(',');

                animateNumber(statItem, targetNumber, suffix, hasComma);
                observer.unobserve(statItem);
            }
        });
    }, observerOptions);

    statNumbers.forEach(stat => observer.observe(stat));
}

/* ============================================
   Number Animation Helper
   ============================================ */
function animateNumber(element, target, suffix = '', formatWithComma = false) {
    const duration = 2000;
    const steps = 60;
    const stepDuration = duration / steps;
    const increment = target / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
        step++;
        current = Math.min(Math.round(increment * step), target);

        let displayValue = current.toString();
        if (formatWithComma && current >= 1000) {
            displayValue = current.toLocaleString();
        }

        element.textContent = displayValue + suffix;

        if (step >= steps) {
            clearInterval(timer);
            // Ensure final value is correct
            let finalValue = target.toString();
            if (formatWithComma && target >= 1000) {
                finalValue = target.toLocaleString();
            }
            element.textContent = finalValue + suffix;
        }
    }, stepDuration);
}

/* ============================================
   Stat Items Staggered Animation
   ============================================ */
const statItems = document.querySelectorAll('.stat-item');

statItems.forEach((item, index) => {
    item.style.transitionDelay = `${index * 0.15}s`;
});

/* ============================================
   Mission Vision Cards Hover Effect
   ============================================ */
const mvCards = document.querySelectorAll('.mv-card');

mvCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-10px)';
        this.style.boxShadow = '0 20px 50px rgba(139, 26, 26, 0.15)';
    });

    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = '0 10px 40px rgba(0, 0, 0, 0.05)';
    });
});