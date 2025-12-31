/**
 * Main JavaScript
 * Entry point that initializes all components
 */

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('Leonic\'s World - Initializing...');

  // Initialize core components
  initializeComponents();

  // Initialize page-specific components
  initializePageComponents();

  // Setup global event listeners
  setupGlobalListeners();

  console.log('Leonic\'s World - Ready!');
});

/**
 * Initialize core components
 */
function initializeComponents() {
  // Components are auto-initialized in their respective files
  // This function can be used for additional initialization

  // Initialize tooltips
  initializeTooltips();

  // Initialize lazy loading for images
  initializeLazyLoading();

  // Initialize form handling
  initializeForms();
}

/**
 * Initialize page-specific components
 */
function initializePageComponents() {
  const page = getCurrentPage();

  switch(page) {
    case 'index':
    case '':
      initializeHomePage();
      break;
    case 'portfolio':
      initializePortfolioPage();
      break;
    case 'contact':
      initializeContactPage();
      break;
    case 'blog-post':
      initializeBlogPostPage();
      break;
  }
}

/**
 * Get current page name
 */
function getCurrentPage() {
  const path = window.location.pathname;
  const filename = path.split('/').pop().replace('.html', '');
  return filename || 'index';
}

/**
 * Home page initialization
 */
function initializeHomePage() {
  // Hero section animations are handled by welcome.js
  // Stats counter animation is handled by animations.js

  // Add parallax to hero background
  const heroBackground = document.querySelector('.hero-background');
  if (heroBackground) {
    heroBackground.dataset.parallax = '0.3';
  }
}

/**
 * Portfolio page initialization
 */
function initializePortfolioPage() {
  const filterButtons = document.querySelectorAll('.filter-btn[data-filter]');
  const portfolioItems = document.querySelectorAll('.portfolio-item');

  if (filterButtons.length === 0 || portfolioItems.length === 0) return;

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;

      // Update active button
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Filter items
      portfolioItems.forEach(item => {
        const category = item.dataset.category;

        if (filter === 'all' || category === filter) {
          item.style.display = '';
          setTimeout(() => item.classList.add('animate-in'), 50);
        } else {
          item.classList.remove('animate-in');
          item.style.display = 'none';
        }
      });
    });
  });

  // Initialize modals
  initializeModals();
}

/**
 * Contact page initialization
 */
function initializeContactPage() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', handleContactFormSubmit);
}

/**
 * Blog post page initialization
 */
function initializeBlogPostPage() {
  // Handled by blog.js SinglePostLoader
  // Add reading progress bar
  initializeReadingProgress();
}

/**
 * Initialize tooltips
 */
function initializeTooltips() {
  const tooltipElements = document.querySelectorAll('[data-tooltip]');

  tooltipElements.forEach(el => {
    el.addEventListener('mouseenter', showTooltip);
    el.addEventListener('mouseleave', hideTooltip);
  });
}

function showTooltip(e) {
  const text = e.target.dataset.tooltip;
  if (!text) return;

  const tooltip = document.createElement('div');
  tooltip.className = 'tooltip';
  tooltip.textContent = text;
  tooltip.id = 'active-tooltip';

  document.body.appendChild(tooltip);

  const rect = e.target.getBoundingClientRect();
  tooltip.style.left = `${rect.left + rect.width / 2 - tooltip.offsetWidth / 2}px`;
  tooltip.style.top = `${rect.top - tooltip.offsetHeight - 8}px`;

  setTimeout(() => tooltip.classList.add('visible'), 10);
}

function hideTooltip() {
  const tooltip = document.getElementById('active-tooltip');
  if (tooltip) {
    tooltip.classList.remove('visible');
    setTimeout(() => tooltip.remove(), 200);
  }
}

/**
 * Initialize lazy loading
 */
function initializeLazyLoading() {
  // Native lazy loading is used via loading="lazy" attribute
  // This is for fallback and progressive enhancement

  if ('loading' in HTMLImageElement.prototype) {
    // Native lazy loading supported
    return;
  }

  // Fallback for older browsers
  const lazyImages = document.querySelectorAll('img[loading="lazy"]');

  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src || img.src;
        imageObserver.unobserve(img);
      }
    });
  });

  lazyImages.forEach(img => imageObserver.observe(img));
}

/**
 * Initialize forms
 */
function initializeForms() {
  // Add floating label effect
  const formGroups = document.querySelectorAll('.form-group');

  formGroups.forEach(group => {
    const input = group.querySelector('input, textarea, select');
    const label = group.querySelector('label');

    if (input && label) {
      // Check initial value
      if (input.value) {
        label.classList.add('active');
      }

      input.addEventListener('focus', () => label.classList.add('active'));
      input.addEventListener('blur', () => {
        if (!input.value) {
          label.classList.remove('active');
        }
      });
    }
  });
}

/**
 * Handle contact form submission
 */
async function handleContactFormSubmit(e) {
  e.preventDefault();

  const form = e.target;
  const submitBtn = form.querySelector('button[type="submit"]');
  const statusEl = document.getElementById('form-status');

  // Disable button during submission
  submitBtn.disabled = true;
  submitBtn.textContent = 'Senden...';

  // Gather form data
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());

  try {
    // Here you would typically send to your backend or email service
    // For now, we'll simulate a successful submission

    // Simulate API call
    await utils.wait(1500);

    // Show success message
    if (statusEl) {
      statusEl.className = 'form-status success';
      statusEl.textContent = 'Nachricht erfolgreich gesendet! Ich melde mich bald bei dir.';
    }

    // Reset form
    form.reset();

    // Log for demo purposes
    console.log('Form submitted:', data);

  } catch (error) {
    console.error('Form submission error:', error);

    if (statusEl) {
      statusEl.className = 'form-status error';
      statusEl.textContent = 'Fehler beim Senden. Bitte versuche es erneut.';
    }
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Nachricht senden';
  }
}

/**
 * Initialize modals
 */
function initializeModals() {
  const modalTriggers = document.querySelectorAll('[data-modal]');
  const modals = document.querySelectorAll('.modal');

  modalTriggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
      const modalId = trigger.dataset.modal;
      const modal = document.getElementById(`modal-${modalId}`);
      if (modal) {
        openModal(modal);
      }
    });
  });

  modals.forEach(modal => {
    // Close on overlay click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal(modal);
      }
    });

    // Close button
    const closeBtn = modal.querySelector('.modal-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => closeModal(modal));
    }
  });

  // Close on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const activeModal = document.querySelector('.modal.active');
      if (activeModal) {
        closeModal(activeModal);
      }
    }
  });
}

function openModal(modal) {
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal(modal) {
  modal.classList.remove('active');
  document.body.style.overflow = '';
}

/**
 * Initialize reading progress bar
 */
function initializeReadingProgress() {
  const progressBar = document.getElementById('reading-progress');
  if (!progressBar) return;

  window.addEventListener('scroll', utils.throttle(() => {
    const percentage = utils.getScrollPercentage();
    progressBar.style.width = `${percentage}%`;
  }, 16), { passive: true });
}

/**
 * Setup global event listeners
 */
function setupGlobalListeners() {
  // Handle external links
  document.querySelectorAll('a[href^="http"]').forEach(link => {
    if (!link.getAttribute('target')) {
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
    }
  });

  // Handle image errors
  document.querySelectorAll('img').forEach(img => {
    img.addEventListener('error', function() {
      // Replace with placeholder or hide
      if (this.dataset.fallback) {
        this.src = this.dataset.fallback;
      } else {
        this.style.display = 'none';
      }
    });
  });

  // Log page views (for analytics integration)
  logPageView();
}

/**
 * Log page view (placeholder for analytics)
 */
function logPageView() {
  const page = getCurrentPage();
  console.log(`Page view: ${page}`);

  // Here you could integrate with analytics
  // e.g., gtag('event', 'page_view', { page_path: window.location.pathname });
}

// Export for global access
window.app = {
  getCurrentPage,
  openModal,
  closeModal
};
