document.addEventListener('DOMContentLoaded', () => {
    const App = {
        // Initialize all functionalities
        init() {
            this.initThemeToggle();
            this.initMobileNav();
            this.initScrollAnimations();
            this.initContactForm();
        },

        // --- THEME TOGGLE (DARK/LIGHT MODE) ---
        initThemeToggle() {
            const themeToggle = document.getElementById('theme-toggle');
            const body = document.body;
            const savedTheme = localStorage.getItem('theme') || 'dark';
            
            body.dataset.theme = savedTheme;
            themeToggle.querySelector('i').className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';

            themeToggle.addEventListener('click', () => {
                let newTheme = body.dataset.theme === 'dark' ? 'light' : 'dark';
                body.dataset.theme = newTheme;
                localStorage.setItem('theme', newTheme);
                themeToggle.querySelector('i').className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
            });
        },

        // --- ACCESSIBLE MOBILE NAVIGATION ---
        initMobileNav() {
            const hamburger = document.getElementById('hamburger');
            const nav = document.getElementById('nav-links');
            const focusableElements = 'a[href], button:not([disabled])';

            const toggleNav = () => {
                const isActive = nav.classList.toggle('active');
                hamburger.classList.toggle('active');
                hamburger.setAttribute('aria-expanded', isActive);

                if (isActive) {
                    document.body.style.overflow = 'hidden';
                    this.trapFocus(nav);
                } else {
                    document.body.style.overflow = '';
                }
            };

            hamburger.addEventListener('click', toggleNav);

            nav.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => {
                    if (nav.classList.contains('active')) {
                        toggleNav();
                    }
                });
            });

            // Close with Escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && nav.classList.contains('active')) {
                    toggleNav();
                }
            });
        },
        
        // --- FOCUS TRAPPING FOR ACCESSIBILITY ---
        trapFocus(element) {
            const focusableEls = element.querySelectorAll(focusableElements);
            const firstFocusableEl = focusableEls[0];
            const lastFocusableEl = focusableEls[focusableEls.length - 1];
            const KEYCODE_TAB = 9;

            element.addEventListener('keydown', (e) => {
                if (e.key !== 'Tab' && e.keyCode !== KEYCODE_TAB) {
                    return;
                }

                if (e.shiftKey) { // Shift + Tab
                    if (document.activeElement === firstFocusableEl) {
                        lastFocusableEl.focus();
                        e.preventDefault();
                    }
                } else { // Tab
                    if (document.activeElement === lastFocusableEl) {
                        firstFocusableEl.focus();
                        e.preventDefault();
                    }
                }
            });
        },

        // --- SCROLL REVEAL ANIMATION WITH STAGGER ---
        initScrollAnimations() {
            const revealObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        if (entry.target.dataset.staggerChildren) {
                            const children = entry.target.querySelectorAll('.reveal');
                            children.forEach((child, index) => {
                                child.style.transitionDelay = `${index * 100}ms`;
                            });
                        }
                        entry.target.classList.add('visible');
                        observer.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.1,
            });

            document.querySelectorAll('.reveal').forEach(el => {
                revealObserver.observe(el);
            });
        },
        
        // --- CONTACT FORM LOGIC ---
        initContactForm() {
            const contactForm = document.getElementById('contact-form');
            if (contactForm) {
                contactForm.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const formData = new FormData(contactForm);
                    const status = document.getElementById('form-status');
                    const submitButton = contactForm.querySelector('button');

                    if (formData.get('access_key') === 'YOUR_ACCESS_KEY_HERE') {
                        status.textContent = 'Please configure your form access key.';
                        status.style.color = '#ffc107'; // Warning color
                        return;
                    }

                    status.textContent = 'Sending...';
                    status.style.color = 'var(--color-text-secondary)';
                    submitButton.disabled = true;

                    try {
                        const response = await fetch('https://api.web3forms.com/submit', {
                            method: 'POST',
                            body: formData
                        });
                        const result = await response.json();
                        if (result.success) {
                            status.textContent = 'Message sent successfully!';
                            status.style.color = 'var(--color-accent)';
                            contactForm.reset();
                        } else {
                            throw new Error(result.message || 'An unknown error occurred.');
                        }
                    } catch (error) {
                        status.textContent = 'An error occurred. Please try again.';
                        status.style.color = '#dc3545'; // Error color
                    } finally {
                        submitButton.disabled = false;
                        setTimeout(() => {
                            status.textContent = '';
                        }, 5000);
                    }
                });
            }
        }
    };

    App.init();
});