/* ============================================
   PC GILMORE - Landing Page JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', function() {
    initHeroAnimations();
    initScrollIndicator();
    initParallaxEffect();
    initCounterAnimation();
    initServicesSlideshow();
    initFeaturedProducts();
    initHomeArticles();
});

/* ============================================
   Featured Products (Homepage) - Google Sheets
   ============================================ */
function initFeaturedProducts() {
    const grid = document.getElementById('featuredProductsGrid');
    if (!grid) return;

    loadFeaturedProducts(grid);
}

/* ============================================
   Homepage Articles (from Google Sheets)
   ============================================ */
const ARTICLES_GOOGLE_SHEET_PUBLISH_KEY = '2PACX-1vRYYlyhEfnpRhDAuXL8xQ0LOPPR4wT-p4GfE1jKfU0U1Y_OmCYo8qjCRAOiG6BddvgSY1jVTv_APdm2';
const ARTICLES_SHEET_GID = '0';
const HOME_ARTICLES_LIMIT = 3;

function initHomeArticles() {
    const grid = document.getElementById('homeArticlesGrid');
    if (!grid) return;

    loadHomeArticles(grid);
}

async function loadHomeArticles(grid) {
    try {
        const url = `https://docs.google.com/spreadsheets/d/e/${ARTICLES_GOOGLE_SHEET_PUBLISH_KEY}/pub?gid=${ARTICLES_SHEET_GID}&single=true&output=csv`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch articles');

        const csvText = await response.text();
        const articles = parseArticlesCSV(csvText)
            .map(normalizeArticle)
            .filter(a => a.slug && a.title)
            .sort((a, b) => (b.dateSort || 0) - (a.dateSort || 0))
            .slice(0, HOME_ARTICLES_LIMIT);

        if (articles.length === 0) throw new Error('No articles');
        grid.innerHTML = articles.map(createHomeArticleCard).join('');
        grid.querySelectorAll('.animate-on-scroll').forEach(el => el.classList.add('animated'));
    } catch (e) {
        console.error('[Homepage Articles] load failed:', e);
        const fallback = getHomeSampleArticles();
        grid.innerHTML = fallback.map(createHomeArticleCard).join('');
        grid.querySelectorAll('.animate-on-scroll').forEach(el => el.classList.add('animated'));
    }
}

function parseArticlesCSV(csvText) {
    const rows = parseCSVRows(csvText);
    if (rows.length < 2) return [];
    const headers = rows[0].map(h => h.toLowerCase().replace(/\s+/g, '_'));
    const items = [];
    for (let i = 1; i < rows.length; i++) {
        const values = rows[i];
        const item = {};
        headers.forEach((header, idx) => {
            item[header] = values[idx] || '';
        });
        if (item.slug || item.title) items.push(item);
    }
    return items;
}

function normalizeArticle(raw) {
    const slug = (raw.slug || raw.SLUG || '').trim();
    const title = (raw.title || raw.TITLE || '').trim();
    const dateRaw = (raw.date || raw.DATE || '').trim();
    const summary = (raw.summary || raw.SUMMARY || '').trim();
    const cover_image = (raw.cover_image || raw.coverimage || raw.cover || raw.image || '').trim();
    const dateInfo = parseArticleDate(dateRaw);
    return {
        slug,
        title,
        dateDisplay: dateInfo.display,
        dateSort: dateInfo.sort,
        summary,
        cover_image
    };
}

function parseArticleDate(dateRaw) {
    if (!dateRaw) return { display: '', sort: 0 };
    const t = Date.parse(dateRaw);
    if (!Number.isFinite(t)) return { display: dateRaw, sort: 0 };
    const d = new Date(t);
    const display = d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    return { display, sort: t };
}

function createHomeArticleCard(article) {
    const cover = article.cover_image ?
        `<span class="article-card-cover"><img src="${escapeHtml(article.cover_image)}" alt="${escapeHtml(article.title)}"></span>` :
        '<span class="article-card-cover"></span>';
    return `
        <div class="article-card animate-on-scroll">
            ${cover}
            <div class="article-card-body">
                <div class="article-card-meta">${escapeHtml(article.dateDisplay || '—')}</div>
                <h3 class="article-card-title">
                    <a href="article.html?slug=${encodeURIComponent(article.slug)}">${escapeHtml(article.title)}</a>
                </h3>
                <p class="article-card-summary">${escapeHtml(article.summary || '')}</p>
            </div>
            <div class="article-card-footer">
                <a class="article-readmore" href="article.html?slug=${encodeURIComponent(article.slug)}">Read more →</a>
            </div>
        </div>
    `;
}

function getHomeSampleArticles() {
    return [
        { slug: 'how-to-choose-ram', title: 'How to Choose the Right RAM for Your PC', dateDisplay: 'Sample', dateSort: 0, summary: 'A quick guide to capacity, speed, and compatibility when upgrading memory.', cover_image: '' },
        { slug: 'ssd-vs-hdd', title: 'SSD vs HDD: Which Storage Should You Buy?', dateDisplay: 'Sample', dateSort: 0, summary: 'Understand the difference in speed, price, and best use-cases.', cover_image: '' },
        { slug: 'pc-building-tips', title: 'PC Building Tips for Beginners', dateDisplay: 'Sample', dateSort: 0, summary: 'Essential steps and common mistakes to avoid when building your first PC.', cover_image: '' }
    ];
}

// Same Google Sheets CSV URL as products.html (Products sheet)
const PRODUCTS_SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTHibla5KZj1UUjt3lhnNS0yHu2EPZFB4zes-Ku187LNPUOf7HUhUXMLuvIKOs_VNDpCXKwhffayvps/pub?gid=0&single=true&output=csv';
const FEATURED_PRODUCTS_LIMIT = 8; /* show at least 5 products in carousel */

function fetchWithTimeout(url, ms) {
    return Promise.race([
        fetch(url),
        new Promise(function (_, reject) {
            setTimeout(function () { reject(new Error('Timeout')); }, ms);
        })
    ]);
}

async function loadFeaturedProducts(grid) {
    try {
        const response = await fetchWithTimeout(PRODUCTS_SHEET_CSV_URL, 8000);
        if (!response.ok) throw new Error('Failed to fetch products');

        const csvText = await response.text();
        const products = parseCSVData(csvText)
            .map(normalizeProduct)
            .filter(p => p.name);

        // Prefer products with Hot/Popular badge, then fill with first products from sheet (same as products.html)
        const withBadge = products.filter(p => isHotOrPopularBadge(p.badge));
        const featured = withBadge.length >= FEATURED_PRODUCTS_LIMIT
            ? withBadge.slice(0, FEATURED_PRODUCTS_LIMIT)
            : [...withBadge, ...products.filter(p => !isHotOrPopularBadge(p.badge))]
                .slice(0, FEATURED_PRODUCTS_LIMIT);

        if (featured.length === 0) throw new Error('No products in sheet');

        grid.innerHTML = featured.map(createHomepageProductCard).join('');
        grid.querySelectorAll('.animate-on-scroll').forEach(el => el.classList.add('animated'));
        initFeaturedProductsCarousel();
    } catch (e) {
        console.error('[Homepage Featured Products] load failed:', e);
        const fallback = getHomepageSampleProducts();
        grid.innerHTML = fallback
            .slice(0, FEATURED_PRODUCTS_LIMIT)
            .map(createHomepageProductCard)
            .join('');
        grid.querySelectorAll('.animate-on-scroll').forEach(el => el.classList.add('animated'));
        initFeaturedProductsCarousel();
    }
}

/* Featured products carousel: infinite loop + prev/next + autoplay */
const FEATURED_CAROUSEL_AUTOPLAY_MS = 3500;

function initFeaturedProductsCarousel() {
    const carousel = document.querySelector('.featured-products-carousel');
    const viewport = document.querySelector('.featured-products-viewport');
    const track = document.getElementById('featuredProductsGrid');
    const prevBtn = document.querySelector('.featured-products-prev');
    const nextBtn = document.querySelector('.featured-products-next');
    if (!carousel || !viewport || !track || !prevBtn || !nextBtn) return;

    const cards = track.querySelectorAll('.product-card');
    if (cards.length === 0) {
        prevBtn.disabled = true;
        nextBtn.disabled = true;
        return;
    }

    /* Clone all cards and append for seamless infinite loop */
    cards.forEach(function (card) {
        track.appendChild(card.cloneNode(true));
    });

    const gap = 18;
    function getScrollStep() {
        const first = track.querySelector('.product-card');
        var w = first ? first.offsetWidth : 0;
        return (w > 0 ? w + gap : 218);
    }

    /* Width of one full set of cards (before clone); after clone track is 2x this */
    var segmentWidth = Math.round(track.scrollWidth / 2);

    var isResettingScroll = false;
    function applyInfiniteScroll() {
        if (isResettingScroll) return;
        var left = viewport.scrollLeft;
        /* When we've scrolled into the cloned segment, jump back so we're in the first segment */
        if (left >= segmentWidth) {
            isResettingScroll = true;
            viewport.scrollLeft = left - segmentWidth;
            isResettingScroll = false;
        } else if (left < 0) {
            isResettingScroll = true;
            viewport.scrollLeft = left + segmentWidth;
            isResettingScroll = false;
        }
    }

    function updateNavState() {
        var left = viewport.scrollLeft;
        prevBtn.disabled = left <= 2;
        nextBtn.disabled = false; /* infinite: next always allowed */
    }

    /* Smooth scroll animation (ease-in-out over duration) */
    var scrollAnimationId = null;
    function smoothScrollTo(targetLeft, durationMs) {
        if (scrollAnimationId) cancelAnimationFrame(scrollAnimationId);
        var startLeft = viewport.scrollLeft;
        var distance = targetLeft - startLeft;
        var startTime = null;
        durationMs = durationMs || 500;

        function easeInOutCubic(t) {
            return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        }

        function step(timestamp) {
            if (!startTime) startTime = timestamp;
            var elapsed = timestamp - startTime;
            var progress = Math.min(elapsed / durationMs, 1);
            var eased = easeInOutCubic(progress);
            viewport.scrollLeft = startLeft + distance * eased;
            if (progress < 1) {
                scrollAnimationId = requestAnimationFrame(step);
            } else {
                scrollAnimationId = null;
                applyInfiniteScroll();
                updateNavState();
            }
        }
        scrollAnimationId = requestAnimationFrame(step);
    }

    function goNext() {
        var step = getScrollStep();
        if (step <= 0) step = 218;
        var target = viewport.scrollLeft + step;
        smoothScrollTo(target, 550);
    }

    function goPrev() {
        var left = viewport.scrollLeft;
        if (left <= 2) {
            smoothScrollTo(segmentWidth - viewport.clientWidth, 550);
        } else {
            var step = getScrollStep();
            smoothScrollTo(viewport.scrollLeft - step, 550);
        }
    }

    var autoplayTimer = null;
    var isHovering = false;
    var lastAutoplayTime = 0;

    function runAutoplayTick() {
        if (isHovering) return;
        goNext();
    }

    function startAutoplay() {
        if (isHovering) return;
        stopAutoplay();
        lastAutoplayTime = Date.now();
        autoplayTimer = window.setInterval(function () {
            runAutoplayTick();
        }, FEATURED_CAROUSEL_AUTOPLAY_MS);
    }

    function stopAutoplay() {
        if (autoplayTimer) {
            window.clearInterval(autoplayTimer);
            autoplayTimer = null;
        }
    }

    viewport.addEventListener('scroll', throttle(function () {
        applyInfiniteScroll();
        updateNavState();
    }, 50));

    prevBtn.addEventListener('click', function () {
        if (prevBtn.disabled) return;
        goPrev();
        startAutoplay();
    });
    nextBtn.addEventListener('click', function () {
        goNext();
        startAutoplay();
    });
    if ('onscrollend' in viewport) {
        viewport.addEventListener('scrollend', function () {
            applyInfiniteScroll();
            updateNavState();
        });
    }

    carousel.addEventListener('mouseenter', function () {
        isHovering = true;
        stopAutoplay();
    });
    carousel.addEventListener('mouseleave', function () {
        isHovering = false;
        startAutoplay();
    });

    prevBtn.disabled = true;
    nextBtn.disabled = false;
    updateNavState();

    /* Recompute segment width after layout; then start autoplay and fire first tick soon */
    function readyAndStart() {
        segmentWidth = Math.round(track.scrollWidth / 2);
        updateNavState();
        startAutoplay();
    }

    readyAndStart();
    setTimeout(readyAndStart, 400);
    /* First auto-advance after 1.5s so user sees the carousel move */
    setTimeout(function () {
        if (!isHovering && viewport.scrollWidth > viewport.clientWidth) {
            runAutoplayTick();
        }
    }, 1500);
}

function normalizeProduct(raw) {
    const name = (raw.name || '').trim();
    const category = (raw.category || '').trim();
    const price = (raw.price || '').trim();
    const description = (raw.description || raw.full_description || raw.desc || '').trim();
    const badge = (raw.badge || '').trim();

    let image = (raw.image || '').trim();
    let images = (raw.images || '').trim();

    // If main image empty, use first from images list
    if (!image && images) {
        const list = images.split(',').map(s => s.trim()).filter(Boolean);
        if (list.length) image = list[0];
    }

    return {
        name,
        category,
        price,
        description,
        badge,
        image: convertGoogleDriveUrl(image),
        images: images ?
            images.split(',').map(s => convertGoogleDriveUrl(s.trim())).filter(Boolean) :
            (image ? [convertGoogleDriveUrl(image)] : [])
    };
}

function createHomepageProductCard(product) {
    const safeName = escapeHtml(product.name);
    const safeCategory = escapeHtml(product.category || '');
    const safePrice = escapeHtml(product.price || '');
    const safeDesc = escapeHtml(product.description || '');

    const shortDescription = safeDesc.length > 110 ? `${safeDesc.slice(0, 110)}...` : safeDesc;
    const imgSrc = product.image || `https://placehold.co/600x400/8B1A1A/F5F0E8?text=${encodeURIComponent(product.name)}`;

    const showBadge = isHotOrPopularBadge(product.badge);
    return `
        <div class="product-card animate-on-scroll">
            ${showBadge ? `<div class="product-badge">${escapeHtml(product.badge)}</div>` : ''}
            <div class="product-image">
                <img
                    src="${imgSrc}"
                    alt="${safeName}"
                    loading="lazy"
                    data-original-image="${imgSrc}"
                    onerror="homepageHandleImageError(this)"
                >
            </div>
            <div class="product-info">
                <span class="product-category">${safeCategory}</span>
                <h4>${safeName}</h4>
                <p>${shortDescription}</p>
                ${safePrice ? `<div class="product-price">${safePrice}</div>` : ''}
                <a href="products.html" class="btn btn-primary">View Product</a>
            </div>
        </div>
    `;
}

function getHomepageSampleProducts() {
    return [
        {
            name: 'Intel Core i9-14900K',
            category: 'processors',
            price: '₱34,999',
            description: '24-Core, 32-Thread Desktop Processor',
            badge: 'Popular',
            image: 'assets/image/products/intel-i9-14900k.png',
            images: ['assets/image/products/intel-i9-14900k.png']
        },
        {
            name: 'NVIDIA RTX 4090',
            category: 'graphics',
            price: '₱109,999',
            description: '24GB GDDR6X, Ultimate Gaming GPU',
            badge: 'Hot',
            image: 'assets/image/products/nvidia-rtx-4090.png',
            images: ['assets/image/products/nvidia-rtx-4090.png']
        },
        {
            name: 'Samsung 990 Pro 2TB',
            category: 'storage',
            price: '₱12,999',
            description: 'NVMe M.2 SSD, 7450MB/s Read',
            badge: 'Popular',
            image: 'assets/image/products/samsung-990-pro.png',
            images: ['assets/image/products/samsung-990-pro.png']
        },
        {
            name: 'AMD Ryzen 9 7950X',
            category: 'processors',
            price: '₱32,999',
            description: '16-Core, 32-Thread Desktop Processor',
            badge: '',
            image: 'assets/image/products/amd-ryzen-9-7950x.png',
            images: ['assets/image/products/amd-ryzen-9-7950x.png']
        },
        {
            name: 'G.Skill Trident Z5 RGB 32GB',
            category: 'memory',
            price: '₱9,999',
            description: 'DDR5-6000 CL30, RGB Lighting',
            badge: '',
            image: 'assets/image/products/gskill-trident.png',
            images: ['assets/image/products/gskill-trident.png']
        }
    ];
}

function isHotOrPopularBadge(badge) {
    const b = String(badge || '').trim().toLowerCase();
    return b === 'hot' || b === 'popular';
}

function homepageHandleImageError(imgElement) {
    const originalSrc = imgElement.getAttribute('data-original-image') || imgElement.src;
    const productName = imgElement.alt || 'Product';

    let fileId = null;
    const patterns = [
        /drive\.google\.com\/.*[\/?]id=([a-zA-Z0-9_-]+)/,
        /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/,
        /drive\.google\.com\/thumbnail\?id=([a-zA-Z0-9_-]+)/
    ];

    for (const pattern of patterns) {
        const match = originalSrc.match(pattern);
        if (match && match[1]) {
            fileId = match[1];
            break;
        }
    }

    if (fileId) {
        const tried = parseInt(imgElement.getAttribute('data-tried-formats') || '0', 10);
        const alternatives = [
            `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000-h1000`,
            `https://drive.google.com/uc?export=view&id=${fileId}`,
            `https://drive.google.com/uc?export=download&id=${fileId}`
        ];
        if (tried < alternatives.length) {
            imgElement.setAttribute('data-tried-formats', String(tried + 1));
            imgElement.src = alternatives[tried];
            return;
        }
    }

    imgElement.src = `https://placehold.co/600x400/8B1A1A/F5F0E8?text=${encodeURIComponent(productName)}`;
}

function convertGoogleDriveUrl(url) {
    if (!url || typeof url !== 'string') return url || '';
    url = url.trim();
    if (!url) return '';

    let fileId = null;

    const m1 = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (m1 && m1[1]) fileId = m1[1];

    if (!fileId) {
        const m2 = url.match(/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/);
        if (m2 && m2[1]) fileId = m2[1];
    }

    if (!fileId) {
        const m3 = url.match(/drive\.google\.com\/uc\?.*id=([a-zA-Z0-9_-]+)/);
        if (m3 && m3[1]) fileId = m3[1];
    }

    if (fileId) return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000-h1000`;
    return url;
}

function parseCSVData(csvText) {
    const rows = parseCSVRows(csvText);
    if (rows.length < 2) return [];
    const headers = rows[0].map(h => h.toLowerCase().replace(/\s+/g, '_'));
    const items = [];

    for (let i = 1; i < rows.length; i++) {
        const values = rows[i];
        const item = {};
        headers.forEach((header, idx) => {
            item[header] = values[idx] || '';
        });
        if (item.name && item.name.trim() !== '') items.push(item);
    }
    return items;
}

function parseCSVRows(csvText) {
    const rows = [];
    let currentRow = [];
    let currentField = '';
    let inQuotes = false;

    for (let i = 0; i < csvText.length; i++) {
        const char = csvText[i];
        const nextChar = csvText[i + 1];

        if (inQuotes) {
            if (char === '"') {
                if (nextChar === '"') {
                    currentField += '"';
                    i++;
                } else {
                    inQuotes = false;
                }
            } else {
                currentField += char;
            }
        } else {
            if (char === '"') {
                inQuotes = true;
            } else if (char === ',') {
                currentRow.push(currentField.trim());
                currentField = '';
            } else if (char === '\n' || (char === '\r' && nextChar === '\n')) {
                currentRow.push(currentField.trim());
                if (currentRow.some(f => f !== '')) rows.push(currentRow);
                currentRow = [];
                currentField = '';
                if (char === '\r') i++;
            } else if (char !== '\r') {
                currentField += char;
            }
        }
    }

    if (currentField || currentRow.length > 0) {
        currentRow.push(currentField.trim());
        if (currentRow.some(f => f !== '')) rows.push(currentRow);
    }

    return rows;
}

function escapeHtml(str) {
    return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// Make image error handler globally available for inline onerror
window.homepageHandleImageError = homepageHandleImageError;

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