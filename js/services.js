/* ============================================
   PC GILMORE - Services Page JavaScript
   ============================================ */

// Service data for modal
const servicesData = [{
        id: 'pc-building',
        title: 'Custom PC Building',
        description: 'Let us build your dream PC tailored to your specific requirements. Whether it\'s for gaming, content creation, or professional work, we\'ll help you choose the right components and assemble them with care.',
        features: ['Free consultation', 'Component recommendations', 'Professional assembly', 'Cable management', 'System testing & optimization'],
        price: '',
        icon: `<svg viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none">
            <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
            <polyline points="2 17 12 22 22 17"></polyline>
            <polyline points="2 12 12 17 22 12"></polyline>
        </svg>`
    },
    {
        id: 'pc-repair',
        title: 'PC Repair',
        description: 'Is your desktop computer giving you trouble? Our expert technicians can diagnose and fix a wide range of hardware and software issues to get your PC running smoothly again.',
        features: ['Hardware diagnostics', 'Component replacement', 'Virus & malware removal', 'OS reinstallation', 'Data recovery'],
        price: '',
        icon: `<svg viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
        </svg>`
    },
    {
        id: 'laptop-repair',
        title: 'Laptop Repair',
        description: 'From screen replacements to keyboard repairs, we handle all types of laptop issues. Our technicians are experienced with various brands and models.',
        features: ['Screen replacement', 'Keyboard replacement', 'Battery replacement', 'Charging port repair', 'Motherboard repair'],
        price: '',
        icon: `<svg viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none">
            <rect x="2" y="4" width="20" height="12" rx="2"></rect>
            <path d="M1 20h22"></path>
            <line x1="6" y1="20" x2="6" y2="16"></line>
            <line x1="18" y1="20" x2="18" y2="16"></line>
        </svg>`
    },
    {
        id: 'maintenance',
        title: 'Maintenance Services',
        description: 'Keep your computer running at peak performance with our comprehensive maintenance services. Regular maintenance extends the life of your system and prevents costly repairs.',
        features: ['Deep cleaning', 'Thermal paste replacement', 'System optimization', 'Software updates', 'Performance tuning'],
        price: '',
        icon: `<svg viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
        </svg>`
    },
    {
        id: 'upgrades',
        title: 'Hardware Upgrades',
        description: 'Boost your computer\'s performance with strategic hardware upgrades. We\'ll help you identify bottlenecks and recommend the best upgrades for your budget.',
        features: ['RAM upgrades', 'SSD installation', 'GPU upgrades', 'CPU upgrades', 'Cooling solutions'],
        price: '',
        icon: `<svg viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none">
            <line x1="12" y1="19" x2="12" y2="5"></line>
            <polyline points="5 12 12 5 19 12"></polyline>
        </svg>`
    }
];

// Slider variables
let currentSlide = 0;
let slidesPerView = 3;

// Image Slideshow variables
let currentImageSlide = 0;
let imageSlideshowInterval;
const SLIDESHOW_INTERVAL = 4000; // 4 seconds

document.addEventListener('DOMContentLoaded', function() {
    initSlider();
    initProcessSteps();
    initGuaranteeItems();
    initImageSlideshow();
});

/* ============================================
   Services Slider
   ============================================ */
function initSlider() {
    updateSlidesPerView();
    window.addEventListener('resize', updateSlidesPerView);
    updateSlider();
}

function updateSlidesPerView() {
    const width = window.innerWidth;
    if (width <= 768) {
        slidesPerView = 1;
    } else if (width <= 992) {
        slidesPerView = 2;
    } else {
        slidesPerView = 2; // Show 2 cards due to side image
    }
    updateSlider();
}

function slideServices(direction) {
    const totalSlides = servicesData.length;
    const maxSlide = totalSlides - slidesPerView;

    currentSlide += direction;

    // Loop back to start/end
    if (currentSlide > maxSlide) currentSlide = 0;
    if (currentSlide < 0) currentSlide = maxSlide;

    updateSlider();
}

function goToSlide(index) {
    const maxSlide = servicesData.length - slidesPerView;
    currentSlide = Math.min(index, maxSlide);
    updateSlider();
}

function updateSlider() {
    const track = document.querySelector('.services-track');
    const dots = document.querySelectorAll('.dot');

    if (!track) return;

    // Calculate slide position
    track.style.transform = `translateX(-${currentSlide * (100 / slidesPerView + 2)}%)`;

    // Update dots (map currentSlide to 3 dots)
    const maxSlide = servicesData.length - slidesPerView;
    let activeDot = 0;
    if (currentSlide === 0) activeDot = 0;
    else if (currentSlide >= maxSlide) activeDot = 2;
    else activeDot = 1;

    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === activeDot);
    });
}

/* ============================================
   Service Modal
   ============================================ */
function openServiceModal(index) {
    const service = servicesData[index];
    const modal = document.getElementById('serviceModal');

    if (!modal || !service) return;

    // Populate modal content
    document.getElementById('modalServiceIcon').innerHTML = service.icon;
    document.getElementById('modalServiceTitle').textContent = service.title;
    document.getElementById('modalServiceDesc').textContent = service.description;
    document.getElementById('modalServicePrice').innerHTML = `<span class="price-label">Starting at</span> ${service.price}`;

    // Populate features
    const featuresList = document.getElementById('modalServiceFeatures');
    featuresList.innerHTML = service.features.map(f => `<li>${f}</li>`).join('');

    // Show modal
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeServiceModal() {
    const modal = document.getElementById('serviceModal');
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = '';
    }
}

// Close modal on background click
document.addEventListener('click', function(e) {
    const modal = document.getElementById('serviceModal');
    if (e.target === modal) {
        closeServiceModal();
    }
});

// Close modal on escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeServiceModal();
    }
});

/* ============================================
   Process Steps Staggered Animation
   ============================================ */
function initProcessSteps() {
    const processSteps = document.querySelectorAll('.process-step');

    processSteps.forEach((step, index) => {
        step.style.transitionDelay = `${index * 0.1}s`;
    });
}

/* ============================================
   Guarantee Items Staggered Animation
   ============================================ */
function initGuaranteeItems() {
    const guaranteeItems = document.querySelectorAll('.guarantee-item');

    guaranteeItems.forEach((item, index) => {
        item.style.transitionDelay = `${index * 0.1}s`;
    });
}

/* ============================================
   Process Step Animation
   ============================================ */
const processSteps = document.querySelectorAll('.process-step');

processSteps.forEach(step => {
    step.addEventListener('mouseenter', function() {
        const stepNumber = this.querySelector('.step-number');
        if (stepNumber) {
            stepNumber.style.transform = 'scale(1.1)';
            stepNumber.style.transition = 'transform 0.3s ease';
        }
    });

    step.addEventListener('mouseleave', function() {
        const stepNumber = this.querySelector('.step-number');
        if (stepNumber) {
            stepNumber.style.transform = 'scale(1)';
        }
    });
});

/* ============================================
   Image Slideshow (Auto-play)
   ============================================ */
function initImageSlideshow() {
    const slides = document.querySelectorAll('.slideshow-img');

    if (slides.length === 0) return;

    // Ensure first slide is active
    slides[0].classList.add('active');

    // Start automatic slideshow immediately
    startSlideshow();

    // Pause on hover (optional)
    const wrapper = document.querySelector('.services-image-wrapper');
    if (wrapper) {
        wrapper.addEventListener('mouseenter', pauseSlideshow);
        wrapper.addEventListener('mouseleave', () => {
            pauseSlideshow();
            startSlideshow();
        });
    }
}

function startSlideshow() {
    // Clear any existing interval first
    if (imageSlideshowInterval) {
        clearInterval(imageSlideshowInterval);
    }

    imageSlideshowInterval = setInterval(() => {
        nextImageSlide();
    }, SLIDESHOW_INTERVAL);
}

function pauseSlideshow() {
    if (imageSlideshowInterval) {
        clearInterval(imageSlideshowInterval);
        imageSlideshowInterval = null;
    }
}

function nextImageSlide() {
    const slides = document.querySelectorAll('.slideshow-img');
    if (slides.length === 0) return;

    currentImageSlide = (currentImageSlide + 1) % slides.length;
    updateImageSlideshow();
}

function updateImageSlideshow() {
    const slides = document.querySelectorAll('.slideshow-img');

    slides.forEach((slide, index) => {
        if (index === currentImageSlide) {
            slide.classList.add('active');
        } else {
            slide.classList.remove('active');
        }
    });
}

// Make functions globally available
window.slideServices = slideServices;
window.goToSlide = goToSlide;
window.openServiceModal = openServiceModal;
window.closeServiceModal = closeServiceModal;