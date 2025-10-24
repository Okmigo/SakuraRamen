// Sakura Ramen - Main JavaScript File
// Handles all interactive functionality, animations, and user experience

// Global variables
let currentFilter = 'all';

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializeAnimations();
    initializeMenuFiltering();
    initializeSearch();
    initializeContactForm();
    initializeScrollAnimations();
    initializeTextAnimations();
    initializeChatbot();
});

// Navigation functionality
function initializeNavigation() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', function() {
            const isOpen = !mobileMenu.classList.contains('hidden');
            mobileMenu.classList.toggle('hidden');
            
            // Prevent body scroll when mobile menu is open
            if (isOpen) {
                document.body.classList.remove('mobile-menu-open');
            } else {
                document.body.classList.add('mobile-menu-open');
            }
        });
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!mobileMenuBtn.contains(e.target) && !mobileMenu.contains(e.target)) {
                mobileMenu.classList.add('hidden');
                document.body.classList.remove('mobile-menu-open');
            }
        });
    }
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Animation initialization
function initializeAnimations() {
    // Initialize Splitting.js for text animations
    if (typeof Splitting !== 'undefined') {
        Splitting();
    }
    
    // Animate elements on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Add a small delay to prevent overlapping
                setTimeout(() => {
                    entry.target.classList.add('visible');
                    
                    // Stagger animation for grid items
                    if (entry.target.classList.contains('stagger-item')) {
                        const siblings = entry.target.parentElement.querySelectorAll('.stagger-item');
                        const index = Array.from(siblings).indexOf(entry.target);
                        
                        entry.target.style.transitionDelay = `${index * 150}ms`;
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }
                }, 100);
            }
        });
    }, observerOptions);
    
    // Observe all fade-in elements
    document.querySelectorAll('.animate-fade-in, .stagger-item').forEach(el => {
        observer.observe(el);
    });
}

// Text animations
function initializeTextAnimations() {
    // Animate hero title
    const heroTitle = document.querySelector('[data-splitting]');
    if (heroTitle && typeof anime !== 'undefined') {
        const chars = heroTitle.querySelectorAll('.char');
        if (chars.length > 0) {
            anime({
                targets: chars,
                opacity: [0, 1],
                translateY: [50, 0],
                delay: anime.stagger(50),
                duration: 800,
                easing: 'easeOutExpo'
            });
        }
    }
}

function initializeChatbot() {
    const widget = document.querySelector('.chatbot-widget');
    if (!widget) return;

    const toggleButton = widget.querySelector('.chatbot-toggle');
    const closeButton = widget.querySelector('.chatbot-close');
    const chatWindow = widget.querySelector('.chatbot-window');
    const messageInput = widget.querySelector('.chatbot-input');

    if (!toggleButton || !chatWindow) return;

    const openChat = () => {
        chatWindow.hidden = false;
        widget.classList.add('chatbot-open');
        toggleButton.setAttribute('aria-expanded', 'true');
        if (messageInput && !messageInput.disabled) {
            messageInput.focus({ preventScroll: true });
        }
    };

    const closeChat = () => {
        chatWindow.hidden = true;
        widget.classList.remove('chatbot-open');
        toggleButton.setAttribute('aria-expanded', 'false');
        toggleButton.focus({ preventScroll: true });
    };

    toggleButton.addEventListener('click', () => {
        if (chatWindow.hidden) {
            openChat();
        } else {
            closeChat();
        }
    });

    if (closeButton) {
        closeButton.addEventListener('click', closeChat);
    }

    document.addEventListener('click', event => {
        if (!widget.contains(event.target) && !chatWindow.hidden) {
            closeChat();
        }
    });

    widget.addEventListener('keydown', event => {
        if (event.key === 'Escape' && !chatWindow.hidden) {
            event.stopPropagation();
            closeChat();
        }
    });
}

// Menu filtering functionality
function initializeMenuFiltering() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const menuItems = document.querySelectorAll('.menu-item');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Filter menu items
            filterMenuItems(category);
            currentFilter = category;
        });
    });
}

function filterMenuItems(category) {
    const menuItems = document.querySelectorAll('.menu-item');
    const menuCategories = document.querySelectorAll('.menu-category');
    
    if (category === 'all') {
        // Show all menu items and categories
        menuItems.forEach(item => {
            item.classList.remove('hidden');
            if (typeof anime !== 'undefined') {
                anime({
                    targets: item,
                    opacity: [0, 1],
                    scale: [0.8, 1],
                    duration: 400,
                    easing: 'easeOutExpo'
                });
            }
        });
        
        menuCategories.forEach(category => {
            category.style.display = 'block';
        });
    } else {
        // Show only items matching the category
        menuItems.forEach(item => {
            const itemCategory = item.closest('.menu-category')?.getAttribute('data-category');
            if (itemCategory === category) {
                item.classList.remove('hidden');
                if (typeof anime !== 'undefined') {
                    anime({
                        targets: item,
                        opacity: [0, 1],
                        scale: [0.8, 1],
                        duration: 400,
                        easing: 'easeOutExpo'
                    });
                }
            } else {
                item.classList.add('hidden');
            }
        });
        
        // Show/hide categories
        menuCategories.forEach(cat => {
            const catType = cat.getAttribute('data-category');
            if (catType === category) {
                cat.style.display = 'block';
            } else {
                cat.style.display = 'none';
            }
        });
    }
}

// Search functionality
function initializeSearch() {
    const searchInput = document.getElementById('menu-search');
    if (!searchInput) return;
    
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        searchMenuItems(searchTerm);
    });
}

function searchMenuItems(searchTerm) {
    const menuItems = document.querySelectorAll('.menu-item');
    
    menuItems.forEach(item => {
        const itemName = item.getAttribute('data-name')?.toLowerCase() || '';
        const itemText = item.textContent.toLowerCase();
        
        if (itemName.includes(searchTerm) || itemText.includes(searchTerm)) {
            item.classList.remove('hidden');
        } else {
            item.classList.add('hidden');
        }
    });
    
    // Show/hide categories based on visible items
    const menuCategories = document.querySelectorAll('.menu-category');
    menuCategories.forEach(category => {
        const visibleItems = category.querySelectorAll('.menu-item:not(.hidden)');
        if (visibleItems.length > 0) {
            category.style.display = 'block';
        } else {
            category.style.display = 'none';
        }
    });
}

// Scroll animations
function initializeScrollAnimations() {
    // Parallax effect for hero sections
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const parallaxElements = document.querySelectorAll('.hero-bg, .hero-about');

        parallaxElements.forEach(element => {
            const speed = 0.5;
            const offset = scrolled * speed;
            element.style.setProperty('--parallax-offset', `${offset}px`);
        });
    });
    
    // Navbar background on scroll
    const navbar = document.querySelector('.glass-nav');
    if (navbar) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 100) {
                navbar.style.background = 'rgba(254, 254, 254, 0.95)';
                navbar.style.boxShadow = '0 2px 20px rgba(44, 44, 44, 0.1)';
            } else {
                navbar.style.background = 'rgba(254, 254, 254, 0.9)';
                navbar.style.boxShadow = 'none';
            }
        });
    }
}

// Contact form functionality
function initializeContactForm() {
    const contactForm = document.getElementById('contact-form');
    const successModal = document.getElementById('success-modal');
    const closeSuccessModal = document.getElementById('close-success-modal');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleContactFormSubmission();
        });
    }
    
    if (closeSuccessModal) {
        closeSuccessModal.addEventListener('click', function() {
            hideSuccessModal();
        });
    }
    
    if (successModal) {
        successModal.addEventListener('click', function(e) {
            if (e.target === successModal) {
                hideSuccessModal();
            }
        });
    }
}

function handleContactFormSubmission() {
    // Simulate form submission
    setTimeout(() => {
        showSuccessModal();
        document.getElementById('contact-form').reset();
    }, 500);
}

function showSuccessModal() {
    const successModal = document.getElementById('success-modal');
    if (successModal) {
        successModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        
        if (typeof anime !== 'undefined') {
            anime({
                targets: successModal.querySelector('.bg-white'),
                scale: [0.8, 1],
                opacity: [0, 1],
                duration: 300,
                easing: 'easeOutExpo'
            });
        }
    }
}

function hideSuccessModal() {
    const successModal = document.getElementById('success-modal');
    if (successModal) {
        successModal.classList.add('hidden');
        document.body.style.overflow = 'auto';
    }
}

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Performance optimization
function optimizeImages() {
    const images = document.querySelectorAll('img[data-src]');

    if (images.length === 0) {
        return;
    }

    const loadImage = (img) => {
        if (!img.dataset || !img.dataset.src) {
            return;
        }

        img.src = img.dataset.src;
        img.classList.remove('lazy');
        img.removeAttribute('data-src');
    };

    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    loadImage(img);
                    imageObserver.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    } else {
        images.forEach(loadImage);
    }
}

// Initialize image optimization
document.addEventListener('DOMContentLoaded', optimizeImages);

// Error handling
window.addEventListener('error', function(e) {
    console.error('JavaScript error:', e.error);
});

// Accessibility improvements
document.addEventListener('keydown', function(e) {
    // Close modals with Escape key
    if (e.key === 'Escape') {
        const openModals = document.querySelectorAll('.fixed:not(.hidden)');
        openModals.forEach(modal => {
            if (modal.id === 'success-modal') {
                modal.classList.add('hidden');
                document.body.style.overflow = 'auto';
            }
        });
    }
});

// Smooth page transitions
function initializePageTransitions() {
    const links = document.querySelectorAll('a[href$=".html"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Skip if it's an external link or has target="_blank"
            if (this.target === '_blank' || href.startsWith('http')) {
                return;
            }
            
            e.preventDefault();
            
            // Add fade out effect
            document.body.style.opacity = '0.8';
            document.body.style.transition = 'opacity 0.2s ease';
            
            setTimeout(() => {
                window.location.href = href;
            }, 200);
        });
    });
}

// Initialize page transitions
document.addEventListener('DOMContentLoaded', initializePageTransitions);

// Preload critical images
function preloadImages() {
    const criticalImages = [
        'resources/hero-restaurant.jpg',
        'resources/ramen-tonkotsu.jpg',
        'resources/starters-platter.jpg',
        'resources/fried-rice.jpg'
    ];
    
    criticalImages.forEach(src => {
        const img = new Image();
        img.src = src;
    });
}

// Initialize preloading
document.addEventListener('DOMContentLoaded', preloadImages);

// Export functions for global access
window.SakuraRamen = {
    showCartModal,
    hideCartModal,
    showSuccessModal,
    hideSuccessModal,
    filterMenuItems,
    searchMenuItems
};