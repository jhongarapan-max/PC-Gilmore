/* ============================================
   PC GILMORE - Products Page JavaScript
   With Google Sheets Integration
   ============================================ */

// Google Sheets Configuration
// Use the publish key from your "Publish to web" URL
const GOOGLE_SHEET_PUBLISH_KEY = '2PACX-1vTHibla5KZj1UUjt3lhnNS0yHu2EPZFB4zes-Ku187LNPUOf7HUhUXMLuvIKOs_VNDpCXKwhffayvpsl';
const SHEET_NAME = 'Products';

// Products data storage
let productsData = [];
let currentProductImages = [];
let currentImageIndex = 0;

document.addEventListener('DOMContentLoaded', function() {
    loadProductsFromGoogleSheets();
    initProductModal();
});

/* ============================================
   Google Sheets Data Loader
   ============================================ */
async function loadProductsFromGoogleSheets() {
    const productsGrid = document.querySelector('.products-grid');

    // Show loading state
    if (productsGrid) {
        productsGrid.innerHTML = `
            <div class="loading-products">
                <div class="loading-spinner"></div>
                <p>Loading products...</p>
            </div>
        `;
    }

    try {
        // Fetch data from Google Sheets using CSV export
        const url = `https://docs.google.com/spreadsheets/d/e/2PACX-1vTHibla5KZj1UUjt3lhnNS0yHu2EPZFB4zes-Ku187LNPUOf7HUhUXMLuvIKOs_VNDpCXKwhffayvps/pub?gid=0&single=true&output=csv`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error('Failed to fetch');
        }

        const csvText = await response.text();

        // Parse the CSV response
        productsData = parseCSVData(csvText);

        // Debug: Check if we have products with Google Drive images
        const driveImages = productsData.filter(p =>
            (p.image && p.image.includes('drive.google.com')) ||
            (p.images && p.images.includes('drive.google.com'))
        );
        if (driveImages.length > 0) {
            console.log(`[Products Loader] Found ${driveImages.length} products with Google Drive images`);
            driveImages.forEach(p => {
                console.log(`  - ${p.name}: image="${p.image}", images="${p.images}"`);
            });
        }

        // Render products
        renderProducts(productsData);

        // Initialize filter after products are loaded
        initProductFilter();
        initProductCards();
        initFooterCategoryLinks();

    } catch (error) {
        console.error('Error loading products from Google Sheets:', error);

        // Fall back to sample data if Google Sheets fails
        productsData = getSampleProducts();
        renderProducts(productsData);
        initProductFilter();
        initProductCards();
        initFooterCategoryLinks();
    }
}

/* ============================================
   Parse CSV Data from Google Sheets
   (Handles multi-line quoted fields)
   ============================================ */
function parseCSVData(csvText) {
    // Parse CSV properly handling quoted multi-line fields
    const rows = parseCSVRows(csvText);

    if (rows.length < 2) return [];

    // First row is headers
    const headers = rows[0].map(h => h.toLowerCase().replace(/\s+/g, '_'));

    // Parse each data row
    const products = [];
    for (let i = 1; i < rows.length; i++) {
        const values = rows[i];
        const product = {};

        headers.forEach((header, index) => {
            product[header] = values[index] || '';
        });

        // Only add if product has a name
        if (product.name && product.name.trim() !== '') {
            products.push(product);
        }
    }

    return products;
}

/* ============================================
   Parse CSV into rows (handles multi-line quoted fields)
   ============================================ */
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
                    // Escaped quote
                    currentField += '"';
                    i++;
                } else {
                    // End of quoted field
                    inQuotes = false;
                }
            } else {
                // Include everything in quotes, including newlines
                currentField += char;
            }
        } else {
            if (char === '"') {
                // Start of quoted field
                inQuotes = true;
            } else if (char === ',') {
                // End of field
                currentRow.push(currentField.trim());
                currentField = '';
            } else if (char === '\n' || (char === '\r' && nextChar === '\n')) {
                // End of row
                currentRow.push(currentField.trim());
                if (currentRow.some(field => field !== '')) {
                    rows.push(currentRow);
                }
                currentRow = [];
                currentField = '';
                if (char === '\r') i++; // Skip \n in \r\n
            } else if (char !== '\r') {
                currentField += char;
            }
        }
    }

    // Don't forget the last field and row
    if (currentField || currentRow.length > 0) {
        currentRow.push(currentField.trim());
        if (currentRow.some(field => field !== '')) {
            rows.push(currentRow);
        }
    }

    return rows;
}

/* ============================================
   Sample Products (Fallback)
   ============================================ */
function getSampleProducts() {
    return [{
            name: 'Intel Core i9-14900K',
            category: 'processors',
            price: '₱34,999',
            description: '24-Core, 32-Thread Desktop Processor',
            badge: 'Popular',
            image: 'assets/image/products/intel-i9-14900k.png',
            images: 'assets/image/products/intel-i9-14900k.png,assets/image/products/amd-rx-7900xtx.png'
        },
        {
            name: 'AMD Ryzen 9 7950X',
            category: 'processors',
            price: '₱32,999',
            description: '16-Core, 32-Thread Desktop Processor',
            badge: '',
            image: 'assets/image/products/amd-ryzen-9-7950x.png',
            images: 'assets/image/products/amd-ryzen-9-7950x.png'
        },
        {
            name: 'NVIDIA RTX 4090',
            category: 'graphics',
            price: '₱109,999',
            description: '24GB GDDR6X, Ultimate Gaming GPU',
            badge: 'New',
            image: 'assets/image/products/nvidia-rtx-4090.png',
            images: 'assets/image/products/nvidia-rtx-4090.png'
        },
        {
            name: 'AMD RX 7900 XTX',
            category: 'graphics',
            price: '₱64,999',
            description: '24GB GDDR6, High-Performance GPU',
            badge: '',
            image: 'assets/image/products/amd-rx-7900xtx.png',
            images: 'assets/image/products/amd-rx-7900xtx.png'
        },
        {
            name: 'ASUS ROG Maximus Z790',
            category: 'motherboards',
            price: '₱35,999',
            description: 'Intel Z790 Chipset, DDR5 Support',
            badge: 'Premium',
            image: 'assets/image/products/asus-rog-maximus.png',
            images: 'assets/image/products/asus-rog-maximus.png'
        },
        {
            name: 'G.Skill Trident Z5 RGB 32GB',
            category: 'memory',
            price: '₱9,999',
            description: 'DDR5-6000 CL30, RGB Lighting',
            badge: '',
            image: 'assets/image/products/gskill-trident.png',
            images: 'assets/image/products/gskill-trident.png'
        },
        {
            name: 'Samsung 990 Pro 2TB',
            category: 'storage',
            price: '₱12,999',
            description: 'NVMe M.2 SSD, 7450MB/s Read',
            badge: 'Best Seller',
            image: 'assets/image/products/samsung-990-pro.png',
            images: 'assets/image/products/samsung-990-pro.png'
        },
        {
            name: 'Logitech G Pro X Superlight',
            category: 'peripherals',
            price: '₱7,999',
            description: 'Wireless Gaming Mouse, 63g',
            badge: '',
            image: 'assets/image/products/logitech-gpro.png',
            images: 'assets/image/products/logitech-gpro.png'
        }
    ];
}

/* ============================================
   Render Products to Grid
   ============================================ */

function renderProducts(products) {
    const productsGrid = document.querySelector('.products-grid');
    if (!productsGrid) return;

    // Remove all children
    productsGrid.innerHTML = '';

    if (products.length === 0) {
        const noProductsDiv = document.createElement('div');
        noProductsDiv.className = 'no-products';
        noProductsDiv.innerHTML = `
            <svg viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <h3>No products available</h3>
            <p>Please check back later.</p>
        `;
        productsGrid.appendChild(noProductsDiv);
        return;
    }

    products.forEach(product => {
        productsGrid.appendChild(createProductCardSafe(product));
    });

    // Show all products by default after rendering
    setTimeout(() => {
        filterProducts('all');
    }, 50);
}

// Safe DOM creation for product cards
function createProductCardSafe(product) {
    // ...existing code for image conversion and data extraction...
    let mainImage = product.image || '';
    if (!mainImage && product.images) {
        const imagesList = product.images.split(',').map(img => img.trim()).filter(img => img);
        if (imagesList.length > 0) {
            mainImage = imagesList[0];
        }
    }
    const originalMainImage = mainImage;
    mainImage = convertGoogleDriveUrl(mainImage);
    const imagesArray = product.images ?
        product.images.split(',').map(img => convertGoogleDriveUrl(img.trim())).filter(img => img) :
        (mainImage ? [mainImage] : []);
    if (imagesArray.length === 0 && mainImage) {
        imagesArray.push(mainImage);
    }
    const categorySlug = product.category.toLowerCase().replace(/\s+/g, '-');
    const shopeeLink = product.shopee_link || product.shopee || product.shopee_link || '';
    const specs = product.specs || product.specifications || product.spec || '';
    const fullDescription = product.full_description || product.description || product.desc || '';
    const shortDescription = product.description.length > 100 ?
        product.description.substring(0, 100) + '...' :
        product.description;

    // Card root
    const card = document.createElement('div');
    card.className = 'product-card animate-on-scroll';
    card.dataset.category = categorySlug;
    card.setAttribute('data-images', JSON.stringify(imagesArray));
    card.setAttribute('data-shopee', shopeeLink);
    card.setAttribute('data-description', encodeURIComponent(fullDescription));
    card.setAttribute('data-specs', encodeURIComponent(specs));

    // Badge
    if (product.badge) {
        const badgeDiv = document.createElement('div');
        badgeDiv.className = 'product-badge';
        badgeDiv.textContent = product.badge;
        card.appendChild(badgeDiv);
    }

    // Image
    const imageDiv = document.createElement('div');
    imageDiv.className = 'product-image';
    const img = document.createElement('img');
    img.src = mainImage || 'https://placehold.co/400x300/8B1A1A/F5F0E8?text=' + encodeURIComponent(product.name);
    img.alt = product.name;
    img.loading = 'lazy';
    img.setAttribute('data-original-image', mainImage);
    img.onerror = function() { handleGoogleDriveImageError(this); };
    imageDiv.appendChild(img);
    card.appendChild(imageDiv);

    // Info
    const infoDiv = document.createElement('div');
    infoDiv.className = 'product-info';
    const catSpan = document.createElement('span');
    catSpan.className = 'product-category';
    catSpan.textContent = product.category;
    infoDiv.appendChild(catSpan);
    const h4 = document.createElement('h4');
    h4.textContent = product.name;
    infoDiv.appendChild(h4);
    const p = document.createElement('p');
    p.textContent = shortDescription;
    infoDiv.appendChild(p);
    const priceDiv = document.createElement('div');
    priceDiv.className = 'product-price';
    priceDiv.textContent = product.price;
    infoDiv.appendChild(priceDiv);
    const a = document.createElement('a');
    a.href = 'contact.html';
    a.className = 'btn btn-primary';
    a.textContent = 'Inquire Now';
    infoDiv.appendChild(a);
    card.appendChild(infoDiv);

    return card;
}

/* ============================================
   Handle Google Drive Image Loading Errors
   Tries alternative URL formats if the first one fails
   ============================================ */
function handleGoogleDriveImageError(imgElement) {
    const originalSrc = imgElement.getAttribute('data-original-image') || imgElement.src;
    const productName = imgElement.alt || 'Product';

    console.warn(`[Google Drive] Image failed to load: ${originalSrc}`);

    // Extract file ID from the URL
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
        // Try alternative URL formats
        const alternativeUrls = [
            `https://drive.google.com/uc?export=view&id=${fileId}`,
            `https://drive.google.com/uc?export=download&id=${fileId}`,
            `https://drive.google.com/thumbnail?id=${fileId}&sz=w800-h600`
        ];

        // Check if we've already tried formats (stored in data attribute)
        const triedFormats = parseInt(imgElement.getAttribute('data-tried-formats') || '0');

        if (triedFormats < alternativeUrls.length) {
            const nextUrl = alternativeUrls[triedFormats];
            console.log(`[Google Drive] Trying alternative format ${triedFormats + 1}: ${nextUrl}`);
            imgElement.setAttribute('data-tried-formats', (triedFormats + 1).toString());
            imgElement.src = nextUrl;
            return; // Don't show placeholder yet, try the alternative
        }
    }

    // If all formats failed, show placeholder
    console.error(`[Google Drive] All URL formats failed for: ${productName}`);
    imgElement.src = `https://placehold.co/400x300/8B1A1A/F5F0E8?text=${encodeURIComponent(productName)}`;
}

/* ============================================
   Convert Google Drive Sharing Link to Direct Image URL
   ============================================ */
function convertGoogleDriveUrl(url) {
    if (!url || typeof url !== 'string') return url || '';

    // Trim whitespace
    url = url.trim();

    // Return empty string if URL is empty
    if (url === '') return '';

    // Check if it's a Google Drive sharing link
    // Format: https://drive.google.com/file/d/FILE_ID/view?usp=sharing
    // Also handles: https://drive.google.com/open?id=FILE_ID
    // NOTE: The file must be shared publicly (Anyone with the link can view) for this to work
    let fileId = null;

    // Pattern 1: /file/d/FILE_ID/ (most common format)
    // Matches: https://drive.google.com/file/d/1ZDXm4J4uTNA4QZIgb1C--z6IIXbtMj05/view?usp=sharing
    // Updated regex to capture file ID more reliably (handles dashes, underscores, alphanumeric)
    const pattern1 = /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/;
    const match1 = url.match(pattern1);
    if (match1 && match1[1]) {
        fileId = match1[1];
    }

    // Pattern 2: /open?id=FILE_ID
    if (!fileId) {
        const pattern2 = /drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/;
        const match2 = url.match(pattern2);
        if (match2 && match2[1]) {
            fileId = match2[1];
        }
    }

    // Pattern 3: /uc?id=FILE_ID (already a direct link, but extract ID)
    if (!fileId) {
        const pattern3 = /drive\.google\.com\/uc\?.*id=([a-zA-Z0-9_-]+)/;
        const match3 = url.match(pattern3);
        if (match3 && match3[1]) {
            fileId = match3[1];
        }
    }

    if (fileId) {
        // Convert to direct image URL
        // Use thumbnail endpoint which is more reliable for images
        // This format works better than uc?export=view for publicly shared files
        const directUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000-h1000`;

        console.log(`[Google Drive] Converting URL`);
        console.log(`  Original: ${url.substring(0, 80)}${url.length > 80 ? '...' : ''}`);
        console.log(`  File ID: ${fileId}`);
        console.log(`  Direct URL: ${directUrl}`);

        return directUrl;
    }

    // If not a Google Drive link, return as is
    return url;
}

/* ============================================
   Create Product Card HTML
   ============================================ */
function createProductCard(product) {
    // Debug: Log product data to see what we're getting
    if (product.image && product.image.includes('drive.google.com')) {
        console.log(`[Product Card] Product: ${product.name}`);
        console.log(`[Product Card] Original image URL: ${product.image}`);
    }

    // Get main image - check both 'image' and 'images' columns
    let mainImage = product.image || '';

    // If main image is empty, try to get first image from images column
    if (!mainImage && product.images) {
        const imagesList = product.images.split(',').map(img => img.trim()).filter(img => img);
        if (imagesList.length > 0) {
            mainImage = imagesList[0];
        }
    }

    // Convert main image if it's a Google Drive link
    const originalMainImage = mainImage;
    mainImage = convertGoogleDriveUrl(mainImage);

    if (originalMainImage !== mainImage && originalMainImage.includes('drive.google.com')) {
        console.log(`[Product Card] Converted image for ${product.name}: ${originalMainImage.substring(0, 50)}... -> ${mainImage}`);
    }

    // Convert all images in the images array
    const imagesArray = product.images ?
        product.images.split(',').map(img => convertGoogleDriveUrl(img.trim())).filter(img => img) :
        (mainImage ? [mainImage] : []);

    // If images array is empty but we have a main image, use it
    if (imagesArray.length === 0 && mainImage) {
        imagesArray.push(mainImage);
    }

    const imagesJson = JSON.stringify(imagesArray);
    const categorySlug = product.category.toLowerCase().replace(/\s+/g, '-');
    const shopeeLink = product.shopee_link || product.shopee || product.shopee_link || '';
    const specs = product.specs || product.specifications || product.spec || '';
    const fullDescription = product.full_description || product.description || product.desc || '';

    // Short description for card (first 100 chars)
    const shortDescription = product.description.length > 100 ?
        product.description.substring(0, 100) + '...' :
        product.description;

    return `
        <div class="product-card animate-on-scroll" 
             data-category="${categorySlug}" 
             data-images='${imagesJson}' 
             data-shopee="${shopeeLink}"
             data-description="${encodeURIComponent(fullDescription)}"
             data-specs="${encodeURIComponent(specs)}">
            ${product.badge ? `<div class="product-badge">${product.badge}</div>` : ''}
            <div class="product-image">
                <img src="${mainImage || 'https://placehold.co/400x300/8B1A1A/F5F0E8?text=' + encodeURIComponent(product.name)}" 
                     alt="${product.name}" 
                     loading="lazy"
                     data-original-image="${mainImage}"
                     onerror="handleGoogleDriveImageError(this)"
                     onload="console.log('Image loaded successfully:', this.src)">
            </div>
            <div class="product-info">
                <span class="product-category">${product.category}</span>
                <h4>${product.name}</h4>
                <p>${shortDescription}</p>
                <div class="product-price">${product.price}</div>
                <a href="contact.html" class="btn btn-primary">Inquire Now</a>
            </div>
        </div>
    `;
}

/* ============================================
   Product Filter Functionality
   ============================================ */
function initProductFilter() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const productCards = document.querySelectorAll('.product-card');

    if (filterButtons.length === 0) return;

    filterButtons.forEach(button => {
        button.addEventListener('click', function () {
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            const category = this.dataset.category;
            filterProducts(category);
        });
    });
    
    // Initialize filter navigation visibility
    updateFilterNavVisibility();
    
    // Update nav visibility on scroll
    const filterWrapper = document.querySelector('.filter-wrapper');
    if (filterWrapper) {
        filterWrapper.addEventListener('scroll', updateFilterNavVisibility);
    }
}

/* ============================================
   Filter Navigation Functions
   ============================================ */
function scrollFilterLeft() {
    const filterWrapper = document.querySelector('.filter-wrapper');
    if (filterWrapper) {
        filterWrapper.scrollBy({ left: -200, behavior: 'smooth' });
    }
}

function scrollFilterRight() {
    const filterWrapper = document.querySelector('.filter-wrapper');
    if (filterWrapper) {
        filterWrapper.scrollBy({ left: 200, behavior: 'smooth' });
    }
}

function updateFilterNavVisibility() {
    const filterWrapper = document.querySelector('.filter-wrapper');
    const prevBtn = document.querySelector('.filter-prev');
    const nextBtn = document.querySelector('.filter-next');
    
    if (!filterWrapper || !prevBtn || !nextBtn) return;
    
    const scrollLeft = filterWrapper.scrollLeft;
    const scrollWidth = filterWrapper.scrollWidth;
    const clientWidth = filterWrapper.clientWidth;
    
    // Show/hide prev button based on scroll position
    if (scrollLeft <= 5) {
        prevBtn.style.opacity = '0.3';
        prevBtn.style.pointerEvents = 'none';
    } else {
        prevBtn.style.opacity = '1';
        prevBtn.style.pointerEvents = 'auto';
    }
    
    // Show/hide next button based on scroll position
    if (scrollLeft + clientWidth >= scrollWidth - 5) {
        nextBtn.style.opacity = '0.3';
        nextBtn.style.pointerEvents = 'none';
    } else {
        nextBtn.style.opacity = '1';
        nextBtn.style.pointerEvents = 'auto';
    }
}

// Make functions globally available
window.scrollFilterLeft = scrollFilterLeft;
window.scrollFilterRight = scrollFilterRight;

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
    const categoryLinks = document.querySelectorAll('[data-filter-category]');

    categoryLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const category = this.dataset.filterCategory;

            // Scroll to products section
            const productsSection = document.querySelector('.products-section');
            if (productsSection) {
                productsSection.scrollIntoView({ behavior: 'smooth' });
            }

            // Trigger filter
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
   Product Modal
   ============================================ */
function initProductModal() {
    // Event delegation for dynamically created product cards
    document.addEventListener('click', function (e) {
        const card = e.target.closest('.product-card');
        const isInquireBtn = e.target.closest('.btn-primary');

        if (card && !isInquireBtn) {
            e.preventDefault();
            openProductModal(card);
        }
    });

    // Close modal when clicking close button
    const closeBtn = document.querySelector('.modal-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeProductModal);
    }

    // Close modal when clicking outside
    const modal = document.getElementById('productModal');
    if (modal) {
        modal.addEventListener('click', function (e) {
            if (e.target === modal) {
                closeProductModal();
            }
        });
    }

    // Close modal with Escape key and navigate gallery with arrow keys
    document.addEventListener('keydown', function (e) {
        const modal = document.getElementById('productModal');
        if (modal && modal.classList.contains('show')) {
            if (e.key === 'Escape') {
                closeProductModal();
            } else if (e.key === 'ArrowLeft') {
                prevModalImage();
            } else if (e.key === 'ArrowRight') {
                nextModalImage();
            }
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

    // Get multiple images from data attribute or use main image
    const dataImages = card.getAttribute('data-images');
    const mainImageSrc = image ? image.src : '';

    if (dataImages) {
        try {
            currentProductImages = JSON.parse(dataImages).map(img => convertGoogleDriveUrl(img));
        } catch (e) {
            console.error('Error parsing product images:', e);
            currentProductImages = [convertGoogleDriveUrl(mainImageSrc)];
        }
    } else {
        currentProductImages = [convertGoogleDriveUrl(mainImageSrc)];
    }
    currentImageIndex = 0;

    // Populate modal with product data
    const modalImage = document.getElementById('modalProductImage');
    const modalBadge = document.getElementById('modalProductBadge');
    const modalCategory = document.getElementById('modalProductCategory');
    const modalName = document.getElementById('modalProductName');
    const modalDescription = document.getElementById('modalProductDescription');
    const modalPrice = document.getElementById('modalProductPrice');
    const modalInquireBtn = document.getElementById('modalInquireBtn');
    const modalThumbnails = document.getElementById('modalThumbnails');

    if (image && currentProductImages[0]) {
        modalImage.src = currentProductImages[0];
        modalImage.alt = image.alt;
        modalImage.setAttribute('data-original-image', currentProductImages[0]);
        modalImage.setAttribute('onerror', 'handleGoogleDriveImageError(this)');
    }

    // Populate thumbnails
    if (modalThumbnails) {
        modalThumbnails.innerHTML = currentProductImages.map((imgSrc, index) => `
            <div class="modal-thumbnail ${index === 0 ? 'active' : ''}" onclick="goToModalImage(${index})">
                <img src="${imgSrc}" alt="Product view ${index + 1}">
            </div>
        `).join('');
    }

    // Update gallery navigation visibility
    updateGalleryNavigation();

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
        modalInquireBtn.onclick = function (e) {
            e.preventDefault();
            addProductToInquiry(name.textContent);
            window.location.href = 'contact.html';
        };
    }

    // Handle Shopee button
    const modalShopeeBtn = document.getElementById('modalShopeeBtn');
    const shopeeLink = card.getAttribute('data-shopee');
    
    if (modalShopeeBtn) {
        if (shopeeLink && shopeeLink.trim() !== '') {
            modalShopeeBtn.href = shopeeLink;
            modalShopeeBtn.style.display = 'inline-flex';
        } else {
            modalShopeeBtn.style.display = 'none';
        }
    }

    // Get full description from data attribute (preserve line breaks)
    const fullDescription = card.getAttribute('data-description');
    if (fullDescription && modalDescription) {
        // Decode and convert newlines to <br> tags for HTML display
        const decodedDescription = decodeURIComponent(fullDescription);
        modalDescription.innerHTML = decodedDescription
            .replace(/\n/g, '<br>')
            .replace(/•/g, '<br>•');
    }

    // Get specs from data attribute or generate defaults
    const specsData = card.getAttribute('data-specs');
    const modalSpecs = document.getElementById('modalProductSpecs');
    
    if (modalSpecs) {
        const decodedSpecs = specsData ? decodeURIComponent(specsData).trim() : '';
        const specsContainer = modalSpecs.closest('.modal-specs');
        
        if (decodedSpecs !== '') {
            // Parse specs from spreadsheet (separated by | or • or newlines)
            const specsArray = decodedSpecs
                .split(/[|•\n]/)
                .map(s => s.trim())
                .filter(s => s.length > 0);
            modalSpecs.innerHTML = specsArray.map(spec => `<li>${spec}</li>`).join('');
            // Show specs section
            if (specsContainer) {
                specsContainer.style.display = 'block';
            }
        } else {
            // No specs in spreadsheet - hide the specs section
            if (specsContainer) {
                specsContainer.style.display = 'none';
            }
        }
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
    // Reset gallery state
    currentImageIndex = 0;
    currentProductImages = [];
}

/* ============================================
   Gallery Navigation Functions
   ============================================ */

function goToModalImage(index) {
    if (index < 0 || index >= currentProductImages.length) return;

    currentImageIndex = index;
    updateModalImage();
}

function prevModalImage() {
    if (currentProductImages.length <= 1) return;

    currentImageIndex = (currentImageIndex - 1 + currentProductImages.length) % currentProductImages.length;
    updateModalImage();
}

function nextModalImage() {
    if (currentProductImages.length <= 1) return;

    currentImageIndex = (currentImageIndex + 1) % currentProductImages.length;
    updateModalImage();
}

function updateModalImage() {
    const modalImage = document.getElementById('modalProductImage');
    const thumbnails = document.querySelectorAll('.modal-thumbnail');

    if (modalImage && currentProductImages[currentImageIndex]) {
        // Add fade effect
        modalImage.style.opacity = '0';
        setTimeout(() => {
            const imageUrl = currentProductImages[currentImageIndex];
            modalImage.src = imageUrl;
            modalImage.setAttribute('data-original-image', imageUrl);
            modalImage.setAttribute('onerror', 'handleGoogleDriveImageError(this)');
            modalImage.style.opacity = '1';
        }, 150);
    }

    // Update thumbnail active state
    thumbnails.forEach((thumb, index) => {
        if (index === currentImageIndex) {
            thumb.classList.add('active');
        } else {
            thumb.classList.remove('active');
        }
    });
}

function updateGalleryNavigation() {
    const prevBtn = document.querySelector('.gallery-prev');
    const nextBtn = document.querySelector('.gallery-next');

    if (currentProductImages.length <= 1) {
        if (prevBtn) prevBtn.style.display = 'none';
        if (nextBtn) nextBtn.style.display = 'none';
    } else {
        if (prevBtn) prevBtn.style.display = 'flex';
        if (nextBtn) nextBtn.style.display = 'flex';
    }
}

/* ============================================
   Add Product to Inquiry
   ============================================ */
function addProductToInquiry(productName) {
    // Get existing products from session storage
    let inquiryProducts = JSON.parse(sessionStorage.getItem('inquiryProducts') || '[]');

    // Add new product if not already in list
    if (!inquiryProducts.includes(productName)) {
        inquiryProducts.push(productName);
        sessionStorage.setItem('inquiryProducts', JSON.stringify(inquiryProducts));
    }
}

// Make functions globally available
window.goToModalImage = goToModalImage;
window.prevModalImage = prevModalImage;
window.nextModalImage = nextModalImage;
window.addProductToInquiry = addProductToInquiry;
window.handleGoogleDriveImageError = handleGoogleDriveImageError;