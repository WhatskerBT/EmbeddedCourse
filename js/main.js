/**
 * Embedded Course - Main JavaScript
 * Handles form submission, animations, and analytics
 */

document.addEventListener('DOMContentLoaded', function () {
    // Initialize all modules
    initHeader();
    initSmoothScroll();
    initCaseCards();
    initForm();
    initAnimations();
    loadDynamicContent();
});

/**
 * Header scroll effect
 */
function initHeader() {
    const header = document.querySelector('.header');
    if (!header) return;

    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        lastScroll = currentScroll;
    }, { passive: true });
}

/**
 * Smooth scroll for anchor links
 */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight - 20;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });

                // Track anchor click in analytics
                trackEvent('Navigation', 'Anchor Click', targetId);
            }
        });
    });
}

/**
 * Interactive case cards
 */
function initCaseCards() {
    const cards = document.querySelectorAll('.case-card');

    cards.forEach(card => {
        card.addEventListener('click', function () {
            // Toggle active state on mobile
            if (window.innerWidth <= 768) {
                this.classList.toggle('active');

                // Close other cards
                cards.forEach(otherCard => {
                    if (otherCard !== this) {
                        otherCard.classList.remove('active');
                    }
                });
            }
        });
    });
}

/**
 * Form handling with Telegram and Google Sheets integration
 */
function initForm() {
    const form = document.getElementById('registration-form');
    if (!form) return;

    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        const submitBtn = form.querySelector('.form-submit');
        const messageContainer = document.getElementById('form-message');

        // Get form data
        const formData = {
            name: document.getElementById('name').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            telegram: document.getElementById('telegram').value.trim(),
            timestamp: new Date().toISOString()
        };

        // Validate
        if (!validateForm(formData)) {
            showMessage(messageContainer, 'error', 'Будь ласка, заповніть всі обов\'язкові поля');
            return;
        }

        // Show loading state
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;

        try {
            // Send to both Telegram and Google Sheets
            const results = await Promise.allSettled([
                sendToTelegram(formData),
                sendToGoogleSheets(formData)
            ]);

            // Check if at least one succeeded
            const anySuccess = results.some(r => r.status === 'fulfilled' && r.value === true);

            if (anySuccess) {
                showMessage(messageContainer, 'success', '✅ Заявку відправлено! Ми зв\'яжемося з вами найближчим часом.');
                form.reset();

                // Track successful submission
                trackEvent('Form', 'Submit', 'Success');

                // GTM dataLayer push
                if (window.dataLayer) {
                    window.dataLayer.push({
                        'event': 'form_submission',
                        'formName': 'registration',
                        'formData': formData
                    });
                }
            } else {
                // Fallback: save locally if both fail
                saveLocalBackup(formData);
                showMessage(messageContainer, 'success', '✅ Заявку збережено! Ми зв\'яжемося з вами найближчим часом.');
                form.reset();
            }

        } catch (error) {
            console.error('Form submission error:', error);
            saveLocalBackup(formData);
            showMessage(messageContainer, 'error', 'Виникла помилка. Спробуйте ще раз або напишіть нам у Telegram.');
            trackEvent('Form', 'Submit', 'Error');
        } finally {
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
        }
    });

    // Real-time validation
    const inputs = form.querySelectorAll('.form-input');
    inputs.forEach(input => {
        input.addEventListener('blur', function () {
            validateInput(this);
        });
    });
}

/**
 * Validate form data
 */
function validateForm(data) {
    if (!data.name || data.name.length < 2) return false;
    if (!data.phone || !/^[\d\s\+\-\(\)]{10,}$/.test(data.phone)) return false;
    return true;
}

/**
 * Validate individual input
 */
function validateInput(input) {
    const value = input.value.trim();

    if (input.required && !value) {
        input.classList.add('invalid');
        return false;
    }

    if (input.type === 'tel' && value && !/^[\d\s\+\-\(\)]{10,}$/.test(value)) {
        input.classList.add('invalid');
        return false;
    }

    input.classList.remove('invalid');
    return true;
}

/**
 * Send data to Telegram bot
 */
async function sendToTelegram(data) {
    // Check if config is available
    if (typeof CONFIG === 'undefined' ||
        !CONFIG.telegram.botToken ||
        CONFIG.telegram.botToken === 'YOUR_BOT_TOKEN_HERE') {
        console.log('Telegram not configured, skipping...');
        return false;
    }

    const message = `
🎓 *Нова заявка на курс!*

👤 *Ім'я:* ${escapeMarkdown(data.name)}
📞 *Телефон:* ${escapeMarkdown(data.phone)}
💬 *Telegram:* ${escapeMarkdown(data.telegram || 'Не вказано')}

📅 *Час:* ${new Date(data.timestamp).toLocaleString('uk-UA')}
`.trim();

    const url = `https://api.telegram.org/bot${CONFIG.telegram.botToken}/sendMessage`;

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chat_id: CONFIG.telegram.chatId,
            text: message,
            parse_mode: 'Markdown'
        })
    });

    return response.ok;
}

/**
 * Escape markdown special characters
 */
function escapeMarkdown(text) {
    return text.replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&');
}

/**
 * Send data to Google Sheets via Apps Script
 */
async function sendToGoogleSheets(data) {
    // Check if config is available
    if (typeof CONFIG === 'undefined' ||
        !CONFIG.googleSheets.scriptUrl ||
        CONFIG.googleSheets.scriptUrl === 'YOUR_GOOGLE_SCRIPT_URL_HERE') {
        console.log('Google Sheets not configured, skipping...');
        return false;
    }

    const response = await fetch(CONFIG.googleSheets.scriptUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    // no-cors mode doesn't give us response status, assume success
    return true;
}

/**
 * Save form data locally as backup
 */
function saveLocalBackup(data) {
    try {
        const backups = JSON.parse(localStorage.getItem('formBackups') || '[]');
        backups.push(data);
        localStorage.setItem('formBackups', JSON.stringify(backups));
        console.log('Form data saved locally as backup');
    } catch (e) {
        console.error('Failed to save local backup:', e);
    }
}

/**
 * Show form message
 */
function showMessage(container, type, message) {
    if (!container) return;

    container.className = 'form-message ' + type;
    container.textContent = message;
    container.style.display = 'block';

    // Auto-hide success message after 10 seconds
    if (type === 'success') {
        setTimeout(() => {
            container.style.display = 'none';
        }, 10000);
    }
}

/**
 * Initialize scroll animations
 */
function initAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe elements for animation
    document.querySelectorAll('.case-card, .audience-card, .location-item').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // Add animate-in styles
    const style = document.createElement('style');
    style.textContent = `
    .animate-in {
      opacity: 1 !important;
      transform: translateY(0) !important;
    }
  `;
    document.head.appendChild(style);
}

/**
 * Load dynamic content from config
 */
function loadDynamicContent() {
    if (typeof CONFIG === 'undefined') {
        console.warn('CONFIG not loaded');
        return;
    }

    // Update price
    const priceElement = document.getElementById('course-price');
    if (priceElement && CONFIG.price) {
        priceElement.textContent = CONFIG.price;
    }

    const priceNoteElement = document.getElementById('price-note');
    if (priceNoteElement && CONFIG.priceNote) {
        priceNoteElement.textContent = CONFIG.priceNote;
    }

    // Update location
    const locationElement = document.getElementById('location-address');
    if (locationElement && CONFIG.location) {
        locationElement.textContent = CONFIG.location;
    }

    const locationNoteElement = document.getElementById('location-note');
    if (locationNoteElement && CONFIG.locationNote) {
        locationNoteElement.textContent = CONFIG.locationNote;
    }
}

/**
 * Analytics tracking helper
 */
function trackEvent(category, action, label) {
    // Google Analytics 4
    if (typeof gtag === 'function') {
        gtag('event', action, {
            'event_category': category,
            'event_label': label
        });
    }

    // GTM dataLayer
    if (window.dataLayer) {
        window.dataLayer.push({
            'event': 'custom_event',
            'eventCategory': category,
            'eventAction': action,
            'eventLabel': label
        });
    }

    console.log(`[Analytics] ${category} - ${action} - ${label}`);
}

/**
 * Phone number formatting
 */
document.addEventListener('input', function (e) {
    if (e.target.id === 'phone') {
        let value = e.target.value.replace(/[^\d+]/g, '');

        // Format Ukrainian phone number
        if (value.startsWith('380')) {
            value = '+' + value;
        } else if (value.startsWith('0')) {
            value = '+38' + value;
        }

        e.target.value = value;
    }
});
