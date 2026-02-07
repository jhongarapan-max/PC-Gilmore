/* ============================================
   PC GILMORE - Contact Page JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', function() {
    initContactForm();
    initFAQ();
    initFormValidation();
    initFormPersistence();
    handleProductInquiry();
    initCustomQuantityToggle();
});

/* ============================================
   Product Selection Toggle
   ============================================ */
function toggleProductFields(selectElement) {
    const productValue = selectElement.value;
    const computersQuantityGroup = document.getElementById('computersQuantityGroup');
    const numComputersSelect = document.getElementById('numComputers');
    const customQuantityGroup = document.getElementById('customQuantityGroup');
    const customQuantityInput = document.getElementById('customQuantity');

    if (productValue === 'Computers') {
        computersQuantityGroup.style.display = 'block';
        numComputersSelect.required = true;
    } else {
        computersQuantityGroup.style.display = 'none';
        numComputersSelect.required = false;
        numComputersSelect.value = '';
        customQuantityGroup.style.display = 'none';
        customQuantityInput.required = false;
        customQuantityInput.value = '';
    }
}

function toggleCustomQuantity(selectElement) {
    const customQuantityGroup = document.getElementById('customQuantityGroup');
    const customQuantityInput = document.getElementById('customQuantity');

    if (selectElement.value === 'more') {
        customQuantityGroup.style.display = 'block';
        customQuantityInput.required = true;
    } else {
        customQuantityGroup.style.display = 'none';
        customQuantityInput.required = false;
        customQuantityInput.value = '';
    }
}

function initCustomQuantityToggle() {
    // Make toggle functions available globally
    window.toggleCustomQuantity = toggleCustomQuantity;
    window.toggleProductFields = toggleProductFields;
}

/* ============================================
   Handle Product Inquiry from SessionStorage
   ============================================ */
function handleProductInquiry() {
    // Get products from sessionStorage
    let inquiryProducts = [];
    try {
        const stored = sessionStorage.getItem('inquiryProducts');
        if (stored) {
            inquiryProducts = JSON.parse(stored);
        }
    } catch (e) {
        console.error('Error reading inquiry products:', e);
    }

    // Also check URL parameter for backward compatibility
    const urlParams = new URLSearchParams(window.location.search);
    const urlProduct = urlParams.get('product');
    if (urlProduct && !inquiryProducts.includes(decodeURIComponent(urlProduct))) {
        inquiryProducts.push(decodeURIComponent(urlProduct));
        sessionStorage.setItem('inquiryProducts', JSON.stringify(inquiryProducts));
    }

    if (inquiryProducts.length > 0) {
        // Show inquiry banner
        const banner = document.getElementById('productInquiryBanner');
        const productList = document.getElementById('inquiryProductList');

        if (banner && productList) {
            banner.style.display = 'block';

            // Update "Inquiring about" text based on count
            const inquiryText = banner.querySelector('.product-inquiry-text strong');
            if (inquiryText) {
                inquiryText.textContent = inquiryProducts.length === 1 ?
                    'Inquiring about:' :
                    `Inquiring about (${inquiryProducts.length} products):`;
            }

            // Display all products in the list with remove buttons
            productList.innerHTML = inquiryProducts.map((product, index) =>
                `<li>
                    <span class="product-name">${product}</span>
                    <button type="button" class="btn-remove-product" onclick="removeInquiryProduct(${index})" title="Remove product">
                        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </li>`
            ).join('');

            // Pre-fill the order details with all products ONLY if empty
            const orderDetailsTextarea = document.getElementById('orderDetails');
            if (orderDetailsTextarea && !orderDetailsTextarea.value.trim()) {
                const productsText = inquiryProducts.length === 1 ?
                    `Product: ${inquiryProducts[0]}` :
                    `Products:\n${inquiryProducts.map((p, i) => `${i + 1}. ${p}`).join('\n')}`;
                
                orderDetailsTextarea.value = `Hi, I would like to inquire about the following ${inquiryProducts.length === 1 ? 'product' : 'products'}:\n\n${productsText}\n\nPlease provide me with more information regarding:\n- Availability\n- Pricing\n- Warranty details\n\nThank you!`;

                // Trigger the auto-resize
                orderDetailsTextarea.style.height = 'auto';
                orderDetailsTextarea.style.height = Math.min(orderDetailsTextarea.scrollHeight, 300) + 'px';

                // Update character counter if it exists
                const counter = orderDetailsTextarea.parentNode.querySelector('.char-counter');
                if (counter) {
                    counter.textContent = `${orderDetailsTextarea.value.length} / 1000`;
                }
            }

            // Scroll to the form
            const formWrapper = document.querySelector('.contact-form-wrapper');
            if (formWrapper) {
                setTimeout(() => {
                    const navbarHeight = document.querySelector('.navbar').offsetHeight;
                    const targetPosition = formWrapper.offsetTop - navbarHeight - 20;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }, 300);
            }
        }
    } else {
        // Hide inquiry banner when no products
        const banner = document.getElementById('productInquiryBanner');
        if (banner) banner.style.display = 'none';
    }
}

/* ============================================
   Remove Product from Inquiry List
   ============================================ */
function removeInquiryProduct(index) {
    try {
        // Get current products
        const stored = sessionStorage.getItem('inquiryProducts');
        if (!stored) return;
        
        let inquiryProducts = JSON.parse(stored);
        
        // Remove the product at the specified index
        if (index >= 0 && index < inquiryProducts.length) {
            const removedProduct = inquiryProducts[index];
            inquiryProducts.splice(index, 1);
            
            // Update sessionStorage
            sessionStorage.setItem('inquiryProducts', JSON.stringify(inquiryProducts));
            
            // Update the order details textarea to remove the product
            const orderDetailsTextarea = document.getElementById('orderDetails');
            if (orderDetailsTextarea) {
                let currentText = orderDetailsTextarea.value;
                // Remove the product from the text
                currentText = currentText.replace(`Product: ${removedProduct}\n`, '');
                currentText = currentText.replace(new RegExp(`\\d+\\.\\s*${escapeRegExp(removedProduct)}\\n?`, 'g'), '');
                orderDetailsTextarea.value = currentText;
            }
            
            // Refresh the display
            handleProductInquiry();
        }
    } catch (e) {
        console.error('Error removing inquiry product:', e);
    }
}

// Helper function to escape special regex characters
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Make removeInquiryProduct available globally
window.removeInquiryProduct = removeInquiryProduct;

/* ============================================
   Contact Form Persistence
   ============================================ */
function initFormPersistence() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    const STORAGE_KEY = 'contactFormData';

    // Restore saved values
    try {
        const stored = sessionStorage.getItem(STORAGE_KEY);
        if (stored) {
            const data = JSON.parse(stored);

            if (data.fullName) form.fullName.value = data.fullName;
            if (data.contactNumber) form.contactNumber.value = data.contactNumber;
            if (data.email) form.email.value = data.email;
            if (data.address) form.address.value = data.address;
            if (data.product) {
                const productSelect = document.getElementById('product');
                if (productSelect) {
                    productSelect.value = data.product;
                    toggleProductFields(productSelect);
                }
            }
            if (data.numComputers) {
                const numComputersSelect = document.getElementById('numComputers');
                if (numComputersSelect) {
                    numComputersSelect.value = data.numComputers;
                    if (data.numComputers === 'more') {
                        toggleCustomQuantity({ value: 'more' });
                    }
                }
            }
            if (data.customQuantity) {
                const customInput = document.getElementById('customQuantity');
                if (customInput) customInput.value = data.customQuantity;
            }
            if (data.orderDetails) {
                const orderDetailsTextarea = document.getElementById('orderDetails');
                if (orderDetailsTextarea) {
                    orderDetailsTextarea.value = data.orderDetails;
                }
            }
        }
    } catch (e) {
        console.error('Error restoring contact form data:', e);
    }

    function saveFormData() {
        const payload = {
            fullName: form.fullName.value,
            contactNumber: form.contactNumber.value,
            email: form.email.value,
            address: form.address.value,
            product: (document.getElementById('product') || {}).value || '',
            numComputers: (document.getElementById('numComputers') || {}).value || '',
            customQuantity: (document.getElementById('customQuantity') || {}).value || '',
            orderDetails: (document.getElementById('orderDetails') || {}).value || ''
        };
        try {
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
        } catch (e) {
            console.error('Error saving contact form data:', e);
        }
    }

    // Save on input/change
    const fieldsToWatch = ['fullName', 'contactNumber', 'email', 'address', 'product', 'numComputers', 'customQuantity', 'orderDetails'];
    fieldsToWatch.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        const eventName = el.tagName === 'SELECT' ? 'change' : 'input';
        el.addEventListener(eventName, saveFormData);
    });
}

/* ============================================
   Contact Form Handling with Facebook Messenger
   ============================================ */
function initContactForm() {
    const contactForm = document.getElementById('contactForm');

    if (!contactForm) return;

    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        if (!validateForm(contactForm)) {
            return;
        }

        const submitBtn = contactForm.querySelector('.btn-submit');
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;

        // Prepare form data
        const fullName = document.getElementById('fullName').value;
        const contactNumber = document.getElementById('contactNumber').value;
        const email = document.getElementById('email').value;
        const address = document.getElementById('address').value;
        const product = document.getElementById('product').value;
        const numComputers = document.getElementById('numComputers').value || '';
        const customQuantity = document.getElementById('customQuantity').value || '';
        const orderDetails = document.getElementById('orderDetails').value;

        // Build the message
        let message = `Hello, I would like to request a quotation.\n\n`;
        message += `**Customer Information:**\n`;
        message += `Name: ${fullName}\n`;
        message += `Contact Number: ${contactNumber}\n`;
        message += `Email: ${email}\n`;
        message += `Address: ${address}\n\n`;
        message += `**Product Details:**\n`;
        message += `Product: ${product}\n`;
        
        if (product === 'Computers' && numComputers) {
            if (numComputers === 'more' && customQuantity) {
                message += `Quantity: ${customQuantity} computers\n\n`;
            } else {
                message += `Quantity: ${numComputers} computer(s)\n\n`;
            }
        } else {
            message += `\n`;
        }
        
        message += `**Order Details:**\n${orderDetails}`;

        // Encode the message for URL
        const encodedMessage = encodeURIComponent(message);

        // Facebook Messenger URL with message parameter
        const messengerUrl = `https://m.me/pcgilmoreph?text=${encodedMessage}`;

        try {
            // Clear inquiry products and form data after successful submission
            sessionStorage.removeItem('inquiryProducts');
            sessionStorage.removeItem('contactFormData');
            
            // Open Facebook Messenger in a new tab with the message pre-filled
            window.open(messengerUrl, '_blank');
            
            // Show success modal
            showModal();
            
            // Reset the form
            contactForm.reset();
            
            // Reset product-related fields visibility
            const computersQuantityGroup = document.getElementById('computersQuantityGroup');
            const customQuantityGroup = document.getElementById('customQuantityGroup');
            if (computersQuantityGroup) {
                computersQuantityGroup.style.display = 'none';
            }
            if (customQuantityGroup) {
                customQuantityGroup.style.display = 'none';
            }
            
            // Hide inquiry banner
            const banner = document.getElementById('productInquiryBanner');
            if (banner) banner.style.display = 'none';
        } catch (error) {
            console.error('Error opening messenger:', error);
            alert('Unable to open Facebook Messenger. Please try again or visit our Facebook page directly.');
        } finally {
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
        }
    });
}

/* ============================================
   Form Validation
   ============================================ */
function initFormValidation() {
    const inputs = document.querySelectorAll('.contact-form input, .contact-form select, .contact-form textarea');

    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });

        input.addEventListener('input', function() {
            if (this.classList.contains('error')) {
                validateField(this);
            }
        });
    });
}

function validateForm(form) {
    const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
    let isValid = true;

    // Check if product is selected and if it's Computers, validate numComputers
    const productSelect = document.getElementById('product');
    const numComputersSelect = document.getElementById('numComputers');
    
    if (productSelect && productSelect.value === 'Computers') {
        if (!numComputersSelect || !numComputersSelect.value) {
            isValid = false;
            if (numComputersSelect) {
                numComputersSelect.classList.add('error');
            }
        }
    }

    inputs.forEach(input => {
        // Skip validation for hidden fields
        if (input.offsetParent === null) {
            return;
        }

        // Skip numComputers if product is not Computers
        if (input.id === 'numComputers' && productSelect && productSelect.value !== 'Computers') {
            return;
        }

        if (!validateField(input)) {
            isValid = false;
        }
    });

    return isValid;
}

function validateField(field) {
    // Skip validation for hidden fields
    if (field.offsetParent === null) {
        return true;
    }

    const value = field.value.trim();
    let isValid = true;

    // Check required
    if (field.hasAttribute('required') && !value) {
        isValid = false;
    }

    // Check email format
    if (field.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            isValid = false;
        }
    }

    // Check phone format (optional)
    if (field.type === 'tel' && value) {
        const phoneRegex = /^[\d\s\+\-\(\)]+$/;
        if (!phoneRegex.test(value) || value.replace(/\D/g, '').length < 7) {
            isValid = false;
        }
    }

    // Update UI
    if (isValid) {
        field.classList.remove('error');
    } else {
        field.classList.add('error');
    }

    return isValid;
}

/* ============================================
   FAQ Accordion
   ============================================ */
function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach((item, index) => {
        const question = item.querySelector('.faq-question');

        // Set transition delay for staggered animation
        item.style.transitionDelay = `${index * 0.1}s`;

        question.addEventListener('click', function() {
            const isActive = item.classList.contains('active');

            // Close all other FAQ items
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                }
            });

            // Toggle current item
            item.classList.toggle('active');
        });
    });
}

/* ============================================
   Modal Functions
   ============================================ */
function showModal() {
    const modal = document.getElementById('successModal');
    if (modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal() {
    const modal = document.getElementById('successModal');
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = '';
    }
}

// Make closeModal available globally
window.closeModal = closeModal;

// Close modal on background click
document.addEventListener('click', function(e) {
    const modal = document.getElementById('successModal');
    if (e.target === modal) {
        closeModal();
    }
});

// Close modal on escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeModal();
    }
});

/* ============================================
   Contact Info Animation
   ============================================ */
const contactInfoItems = document.querySelectorAll('.contact-info-item');

contactInfoItems.forEach((item, index) => {
    item.style.opacity = '0';
    item.style.transform = 'translateX(-20px)';
    item.style.transition = `all 0.4s ease ${index * 0.1 + 0.3}s`;
});

// Trigger animation when contact info card is visible
const contactInfoCard = document.querySelector('.contact-info-card');

if (contactInfoCard) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                contactInfoItems.forEach(item => {
                    item.style.opacity = '1';
                    item.style.transform = 'translateX(0)';
                });
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    observer.observe(contactInfoCard);
}

/* ============================================
   Input Focus Effects
   ============================================ */
const formInputs = document.querySelectorAll('.form-group input, .form-group select, .form-group textarea');

formInputs.forEach(input => {
    const label = input.previousElementSibling;

    input.addEventListener('focus', function() {
        if (label) {
            label.style.color = 'var(--primary-color)';
        }
    });

    input.addEventListener('blur', function() {
        if (label) {
            label.style.color = '';
        }
    });
});

/* ============================================
   Phone Number Formatting
   ============================================ */
const phoneInput = document.getElementById('contactNumber');

if (phoneInput) {
    phoneInput.addEventListener('input', function(e) {
        // Allow only numbers, spaces, +, -, (, )
        let value = e.target.value.replace(/[^\d\s\+\-\(\)]/g, '');
        e.target.value = value;
    });
}

/* ============================================
   Character Counter for Textarea (Optional)
   ============================================ */
const orderDetailsTextarea = document.getElementById('orderDetails');

if (orderDetailsTextarea) {
    const maxLength = 1000;

    // Create character counter element
    const counter = document.createElement('div');
    counter.className = 'char-counter';
    counter.style.cssText = 'text-align: right; font-size: 0.85rem; color: #999; margin-top: 5px;';
    counter.textContent = `0 / ${maxLength}`;

    orderDetailsTextarea.parentNode.appendChild(counter);
    orderDetailsTextarea.setAttribute('maxlength', maxLength);

    orderDetailsTextarea.addEventListener('input', function() {
        const currentLength = this.value.length;
        counter.textContent = `${currentLength} / ${maxLength}`;

        if (currentLength > maxLength * 0.9) {
            counter.style.color = 'var(--primary-color)';
        } else {
            counter.style.color = '#999';
        }
    });
}

/* ============================================
   Auto-resize Textarea
   ============================================ */
if (orderDetailsTextarea) {
    orderDetailsTextarea.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 300) + 'px';
    });
}

const addressTextarea = document.getElementById('address');
if (addressTextarea) {
    addressTextarea.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 150) + 'px';
    });
}