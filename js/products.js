/* ============================================
   PC GILMORE - Products Page JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', function() {
    initProductFilter();
    initProductCards();
    initFooterCategoryLinks();
    initProductModal();
});

/* ============================================
   Product Filter Functionality
   ============================================ */
function initProductFilter() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const productCards = document.querySelectorAll('.product-card');

    if (filterButtons.length === 0 || productCards.length === 0) return;

    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            const category = this.dataset.category;
            filterProducts(category);
        });
    });
}

/* ============================================
   Filter Products Function
   ============================================ */
function filterProducts(category) {
    const productCards = document.querySelectorAll('.product-card');
    let visibleCount = 0;

    productCards.forEach((card, index) => {
        const cardCategory = card.dataset.category;

        if (category === 'all' || cardCategory === category) {
            card.classList.remove('hidden');
            card.style.animationDelay = `${visibleCount * 0.1}s`;

            // Re-trigger animation
            card.classList.remove('animated');
            setTimeout(() => {
                card.classList.add('animated');
            }, 10);

            visibleCount++;
        } else {
            card.classList.add('hidden');
        }
    });

    // Show no products message if none visible
    showNoProductsMessage(visibleCount === 0);
}

/* ============================================
   Show/Hide No Products Message
   ============================================ */
function showNoProductsMessage(show) {
    const productsGrid = document.querySelector('.products-grid');
    let noProductsMsg = document.querySelector('.no-products');

    if (show) {
        if (!noProductsMsg) {
            noProductsMsg = document.createElement('div');
            noProductsMsg.className = 'no-products';
            noProductsMsg.innerHTML = `
                <svg viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <h3>No products found</h3>
                <p>Try selecting a different category.</p>
            `;
            productsGrid.appendChild(noProductsMsg);
        }
        noProductsMsg.style.display = 'block';
    } else if (noProductsMsg) {
        noProductsMsg.style.display = 'none';
    }
}

/* ============================================
   Product Cards Staggered Animation
   ============================================ */
function initProductCards() {
    const productCards = document.querySelectorAll('.product-card');

    productCards.forEach((card, index) => {
        card.style.transitionDelay = `${index * 0.05}s`;
    });
}

/* ============================================
   Footer Category Links
   ============================================ */
function initFooterCategoryLinks() {
    const footerCategoryLinks = document.querySelectorAll('.footer-section a[data-category]');

    footerCategoryLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const category = this.dataset.category;

            // Scroll to products section
            const productsSection = document.querySelector('.products-section');
            if (productsSection) {
                const navbarHeight = document.querySelector('.navbar').offsetHeight;
                const filterHeight = document.querySelector('.category-filter').offsetHeight;
                const targetPosition = productsSection.offsetTop - navbarHeight - filterHeight + 10;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }

            // Trigger filter after scroll
            setTimeout(() => {
                const filterBtn = document.querySelector(`.filter-btn[data-category="${category}"]`);
                if (filterBtn) {
                    filterBtn.click();
                }
            }, 500);
        });
    });
}

/* ============================================
   Product Card Hover Effects
   ============================================ */
const productCards = document.querySelectorAll('.product-card');

productCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
        const img = this.querySelector('.product-image img');
        if (img) {
            img.style.transform = 'scale(1.08)';
        }
    });

    card.addEventListener('mouseleave', function() {
        const img = this.querySelector('.product-image img');
        if (img) {
            img.style.transform = 'scale(1)';
        }
    });
});

/* ============================================
   Product Modal Functionality
   ============================================ */
function initProductModal() {
    const productCards = document.querySelectorAll('.product-card');

    productCards.forEach(card => {
        card.addEventListener('click', function(e) {
            // Don't open modal if clicking on the inquire button
            if (e.target.closest('.btn')) {
                return;
            }

            openProductModal(this);
        });
    });

    // Close modal when clicking outside
    const modal = document.getElementById('productModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeProductModal();
            }
        });
    }

    // Close modal on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeProductModal();
        }
    });
}

function openProductModal(card) {
    const modal = document.getElementById('productModal');
    if (!modal) return;

    // Get product data from the card
    const image = card.querySelector('.product-image img');
    const badge = card.querySelector('.product-badge');
    const category = card.querySelector('.product-category');
    const name = card.querySelector('h4');
    const description = card.querySelector('.product-info p');
    const price = card.querySelector('.product-price');

    // Populate modal with product data
    const modalImage = document.getElementById('modalProductImage');
    const modalBadge = document.getElementById('modalProductBadge');
    const modalCategory = document.getElementById('modalProductCategory');
    const modalName = document.getElementById('modalProductName');
    const modalDescription = document.getElementById('modalProductDescription');
    const modalPrice = document.getElementById('modalProductPrice');
    const modalInquireBtn = document.getElementById('modalInquireBtn');

    if (image) {
        modalImage.src = image.src;
        modalImage.alt = image.alt;
    }

    if (badge) {
        modalBadge.textContent = badge.textContent;
        modalBadge.classList.add('show');
    } else {
        modalBadge.classList.remove('show');
    }

    if (category) modalCategory.textContent = category.textContent;
    if (name) modalName.textContent = name.textContent;
    if (description) modalDescription.textContent = description.textContent;
    if (price) modalPrice.textContent = price.textContent;

    // Update inquire button to add product to inquiry list
    if (modalInquireBtn && name) {
        modalInquireBtn.onclick = function(e) {
            e.preventDefault();
            addProductToInquiry(name.textContent);
            window.location.href = 'contact.html';
        };
    }

    // Generate specs based on category
    const specs = generateSpecs(category ? category.textContent : '', name ? name.textContent : '');
    const modalSpecs = document.getElementById('modalProductSpecs');
    if (modalSpecs) {
        modalSpecs.innerHTML = specs.map(spec => `<li>${spec}</li>`).join('');
    }

    // Show modal
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeProductModal() {
    const modal = document.getElementById('productModal');
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = '';
    }
}

function generateSpecs(category, productName) {
    const baseSpecs = [
        'Genuine product guaranteed',
        'Manufacturer warranty included',
        'Available for immediate purchase'
    ];

    const categoryLower = category.toLowerCase();

    if (categoryLower.includes('processor')) {
        return [
            'Latest generation architecture',
            'Unlocked for overclocking',
            'Integrated cooling solution compatible',
            ...baseSpecs
        ];
    } else if (categoryLower.includes('graphics') || categoryLower.includes('gpu')) {
        return [
            'Real-time ray tracing support',
            'High-speed GDDR memory',
            'Multiple display outputs',
            ...baseSpecs
        ];
    } else if (categoryLower.includes('motherboard')) {
        return [
            'Latest chipset technology',
            'DDR5 memory support',
            'PCIe 5.0 ready',
            'Premium audio codec',
            ...baseSpecs
        ];
    } else if (categoryLower.includes('memory') || categoryLower.includes('ram')) {
        return [
            'XMP/EXPO profile support',
            'Low latency timings',
            'Heat spreader included',
            ...baseSpecs
        ];
    } else if (categoryLower.includes('storage') || categoryLower.includes('ssd')) {
        return [
            'High-speed read/write',
            'NVMe technology',
            'Endurance rated',
            ...baseSpecs
        ];
    } else if (categoryLower.includes('peripheral')) {
        return [
            'Premium build quality',
            'Ergonomic design',
            'Customizable features',
            ...baseSpecs
        ];
    }

    return baseSpecs;
}

/* ============================================
   Search Functionality (for future implementation)
   ============================================ */
function searchProducts(query) {
    const productCards = document.querySelectorAll('.product-card');
    const searchQuery = query.toLowerCase().trim();

    productCards.forEach(card => {
        const title = card.querySelector('h4').textContent.toLowerCase();
        const description = card.querySelector('.product-info p').textContent.toLowerCase();
        const category = card.querySelector('.product-category').textContent.toLowerCase();

        if (title.includes(searchQuery) ||
            description.includes(searchQuery) ||
            category.includes(searchQuery)) {
            card.classList.remove('hidden');
        } else {
            card.classList.add('hidden');
        }
    });
}

/* ============================================
   Price Range Filter (for future implementation)
   ============================================ */
function filterByPrice(minPrice, maxPrice) {
    const productCards = document.querySelectorAll('.product-card');

    productCards.forEach(card => {
        const priceText = card.querySelector('.product-price').textContent;
        const price = parseInt(priceText.replace(/[^0-9]/g, ''));

        if (price >= minPrice && price <= maxPrice) {
            card.classList.remove('hidden');
        } else {
            card.classList.add('hidden');
        }
    });
}

/* ============================================
   Sort Products (for future implementation)
   ============================================ */
function sortProducts(sortBy) {
    const productsGrid = document.querySelector('.products-grid');
    const productCards = Array.from(document.querySelectorAll('.product-card'));

    productCards.sort((a, b) => {
        if (sortBy === 'price-low') {
            const priceA = parseInt(a.querySelector('.product-price').textContent.replace(/[^0-9]/g, ''));
            const priceB = parseInt(b.querySelector('.product-price').textContent.replace(/[^0-9]/g, ''));
            return priceA - priceB;
        } else if (sortBy === 'price-high') {
            const priceA = parseInt(a.querySelector('.product-price').textContent.replace(/[^0-9]/g, ''));
            const priceB = parseInt(b.querySelector('.product-price').textContent.replace(/[^0-9]/g, ''));
            return priceB - priceA;
        } else if (sortBy === 'name') {
            const nameA = a.querySelector('h4').textContent;
            const nameB = b.querySelector('h4').textContent;
            return nameA.localeCompare(nameB);
        }
        return 0;
    });

    productCards.forEach(card => productsGrid.appendChild(card));
}

/* ============================================
   Product Inquiry List Management
   ============================================ */
function addProductToInquiry(productName) {
    // Get existing products from sessionStorage
    let inquiryProducts = [];
    try {
        const stored = sessionStorage.getItem('inquiryProducts');
        if (stored) {
            inquiryProducts = JSON.parse(stored);
        }
    } catch (e) {
        console.error('Error reading inquiry products:', e);
    }

    // Add product if not already in list
    if (!inquiryProducts.includes(productName)) {
        inquiryProducts.push(productName);
        sessionStorage.setItem('inquiryProducts', JSON.stringify(inquiryProducts));
    }
}

function getInquiryProducts() {
    try {
        const stored = sessionStorage.getItem('inquiryProducts');
        return stored ? JSON.parse(stored) : [];
    } catch (e) {
        console.error('Error reading inquiry products:', e);
        return [];
    }
}

function clearInquiryProducts() {
    sessionStorage.removeItem('inquiryProducts');
}

// Make functions globally available
window.addProductToInquiry = addProductToInquiry;
window.getInquiryProducts = getInquiryProducts;
window.clearInquiryProducts = clearInquiryProducts;