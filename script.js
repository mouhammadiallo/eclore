// ===== DOM READY =====
document.addEventListener('DOMContentLoaded', () => {
    initHeader();
    initMobileMenu();
    initScrollReveal();
    initTiltEffect();
    initServiceModals();
    initFAQ();
    initCounters();
});

// ===== HEADER =====
function initHeader() {
    const header = document.getElementById('header');
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

// ===== MOBILE MENU =====
function initMobileMenu() {
    const burger = document.getElementById('burger');
    const mobileNav = document.getElementById('mobileNav');
    const mobileLinks = mobileNav.querySelectorAll('a');

    burger.addEventListener('click', () => {
        burger.classList.toggle('active');
        mobileNav.classList.toggle('active');
        document.body.style.overflow = mobileNav.classList.contains('active') ? 'hidden' : '';
    });

    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            burger.classList.remove('active');
            mobileNav.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
}

// ===== SCROLL REVEAL =====
function initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px'
    });

    reveals.forEach(el => observer.observe(el));
}

// ===== 3D TILT EFFECT =====
function initTiltEffect() {
    const cards = document.querySelectorAll('[data-tilt]');

    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -6;
            const rotateY = ((x - centerX) / centerX) * 6;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
        });
    });
}

// ===== SERVICE MODALS =====
function initServiceModals() {
    const serviceCards = document.querySelectorAll('.service-card[data-service]');

    serviceCards.forEach(card => {
        card.addEventListener('click', () => {
            const service = card.getAttribute('data-service');
            openModal(service);
        });
    });

    // Close on overlay click
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                const id = overlay.id.replace('modal-', '');
                closeModal(id);
            }
        });
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal-overlay.active').forEach(overlay => {
                const id = overlay.id.replace('modal-', '');
                closeModal(id);
            });
        }
    });
}

function openModal(service) {
    const modal = document.getElementById(`modal-${service}`);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(service) {
    const modal = document.getElementById(`modal-${service}`);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Streaming order shortcut
function openStreamingOrder(platform) {
    openModal('streaming-service');
    // Pre-select platform in the form
    setTimeout(() => {
        const select = document.querySelector('#modal-streaming-service .form-select[required]');
        if (select) {
            const options = select.options;
            for (let i = 0; i < options.length; i++) {
                if (options[i].text === platform) {
                    select.selectedIndex = i;
                    break;
                }
            }
        }
    }, 100);
}

// ===== DYNAMIC FORM FIELDS =====

// Activation: show company name if "Professionnel"
function toggleDynamicField(service) {
    if (service === 'activation') {
        const type = document.getElementById('activation-type').value;
        const proField = document.getElementById('activation-pro-field');
        if (type === 'professionnel') {
            proField.classList.add('visible');
        } else {
            proField.classList.remove('visible');
        }
    }
}

// Installation: toggle antivirus/office fields
function toggleInstallField(field) {
    const checkbox = document.getElementById(`install-${field}`);
    const fieldEl = document.getElementById(`install-${field}-field`);
    if (checkbox.checked) {
        fieldEl.classList.add('visible');
    } else {
        fieldEl.classList.remove('visible');
    }
}

// Studio: show website type if "web" selected
function toggleStudioField() {
    const type = document.getElementById('studio-type').value;
    const webField = document.getElementById('studio-web-field');
    if (type === 'web') {
        webField.classList.add('visible');
    } else {
        webField.classList.remove('visible');
    }
}

// ===== FORM SUBMIT =====
function handleSubmit(event, serviceName) {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);
    const inputs = form.querySelectorAll('input, select, textarea');

    // Build WhatsApp message
    let message = `🟢 *Nouvelle commande — ${serviceName}*\n\n`;

    inputs.forEach(input => {
        const label = input.closest('.form-group')?.querySelector('.form-label');
        const labelText = label ? label.textContent : '';

        if (input.type === 'checkbox') {
            if (input.checked) {
                const checkLabel = input.closest('.form-checkbox');
                if (checkLabel) {
                    message += `✅ ${checkLabel.textContent.trim()}\n`;
                }
            }
        } else if (input.value && input.value.trim()) {
            message += `*${labelText}* : ${input.value}\n`;
        }
    });

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/221779411495?text=${encodedMessage}`;

    window.open(whatsappUrl, '_blank');

    // Close the modal
    const overlay = form.closest('.modal-overlay');
    if (overlay) {
        const id = overlay.id.replace('modal-', '');
        closeModal(id);
    }

    // Reset form
    form.reset();
    // Hide dynamic fields
    document.querySelectorAll('.dynamic-field').forEach(f => f.classList.remove('visible'));
}

// ===== FAQ ACCORDION =====
function initFAQ() {
    const questions = document.querySelectorAll('.faq-question');

    questions.forEach(question => {
        question.addEventListener('click', () => {
            const item = question.parentElement;
            const answer = item.querySelector('.faq-answer');
            const isActive = item.classList.contains('active');

            // Close all
            document.querySelectorAll('.faq-item').forEach(i => {
                i.classList.remove('active');
                i.querySelector('.faq-answer').style.maxHeight = null;
            });

            // Open clicked if it was closed
            if (!isActive) {
                item.classList.add('active');
                answer.style.maxHeight = answer.scrollHeight + 'px';
            }
        });
    });
}

// ===== ANIMATED COUNTERS =====
function initCounters() {
    const counters = document.querySelectorAll('[data-count]');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => observer.observe(counter));
}

function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-count'));
    const suffix = el.getAttribute('data-suffix') || '';
    const duration = 2000;
    const start = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - start;
        const progress = Math.min(elapsed / duration, 1);

        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(eased * target);

        el.textContent = current + (progress >= 1 ? suffix : '');

        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            el.textContent = target + suffix;
        }
    }

    requestAnimationFrame(update);
}
