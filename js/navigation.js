/**
 * Navigation System
 * Handles navbar behavior, mobile menu, and page transitions
 */

class Navigation {
  constructor() {
    this.navbar = document.querySelector('.navbar');
    this.hamburger = document.getElementById('hamburger');
    this.mobileMenu = document.getElementById('mobile-menu');
    this.mobileOverlay = document.getElementById('mobile-overlay');
    this.navLinks = document.querySelectorAll('.nav-link');
    this.backToTop = document.getElementById('back-to-top');

    this.isMenuOpen = false;
    this.lastScrollY = 0;
    this.scrollThreshold = 50;

    this.init();
  }

  init() {
    this.setupNavbarScroll();
    this.setupMobileMenu();
    this.setupActiveLinks();
    this.setupSmoothScroll();
    this.setupBackToTop();
  }

  // Navbar scroll behavior
  setupNavbarScroll() {
    const handleScroll = utils.throttle(() => {
      const currentScrollY = window.pageYOffset;

      // Add/remove scrolled class
      if (currentScrollY > this.scrollThreshold) {
        this.navbar?.classList.add('scrolled');
      } else {
        this.navbar?.classList.remove('scrolled');
      }

      // Hide/show navbar on scroll (optional - uncomment if desired)
      // if (currentScrollY > this.lastScrollY && currentScrollY > 200) {
      //   this.navbar?.classList.add('hidden');
      // } else {
      //   this.navbar?.classList.remove('hidden');
      // }

      this.lastScrollY = currentScrollY;
    }, 100);

    window.addEventListener('scroll', handleScroll, { passive: true });
  }

  // Mobile menu toggle
  setupMobileMenu() {
    if (!this.hamburger || !this.mobileMenu) return;

    // Toggle menu on hamburger click
    this.hamburger.addEventListener('click', () => this.toggleMenu());

    // Close menu on overlay click
    this.mobileOverlay?.addEventListener('click', () => this.closeMenu());

    // Close menu on link click
    this.mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => this.closeMenu());
    });

    // Close menu on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isMenuOpen) {
        this.closeMenu();
      }
    });

    // Close menu on window resize (if becomes desktop)
    window.addEventListener('resize', utils.debounce(() => {
      if (window.innerWidth >= 1024 && this.isMenuOpen) {
        this.closeMenu();
      }
    }, 100));
  }

  toggleMenu() {
    if (this.isMenuOpen) {
      this.closeMenu();
    } else {
      this.openMenu();
    }
  }

  openMenu() {
    this.isMenuOpen = true;
    this.hamburger?.classList.add('active');
    this.mobileMenu?.classList.add('active');
    this.mobileOverlay?.classList.add('active');
    document.body.classList.add('menu-open');

    // Focus trap (for accessibility)
    this.mobileMenu?.querySelector('a')?.focus();
  }

  closeMenu() {
    this.isMenuOpen = false;
    this.hamburger?.classList.remove('active');
    this.mobileMenu?.classList.remove('active');
    this.mobileOverlay?.classList.remove('active');
    document.body.classList.remove('menu-open');
  }

  // Active link highlighting
  setupActiveLinks() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    this.navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href === currentPage || (currentPage === '' && href === 'index.html')) {
        link.classList.add('active');
      }
    });

    // Also update mobile menu links
    this.mobileMenu?.querySelectorAll('a').forEach(link => {
      const href = link.getAttribute('href');
      if (href === currentPage || (currentPage === '' && href === 'index.html')) {
        link.classList.add('active');
      }
    });
  }

  // Smooth scroll for anchor links
  setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        const href = anchor.getAttribute('href');

        // Ignore if just "#"
        if (href === '#') return;

        e.preventDefault();
        const target = document.querySelector(href);

        if (target) {
          const navbarHeight = this.navbar?.offsetHeight || 70;
          utils.scrollToElement(href, navbarHeight);

          // Update URL hash without scrolling
          history.pushState(null, null, href);
        }
      });
    });
  }

  // Back to top button
  setupBackToTop() {
    if (!this.backToTop) return;

    // Show/hide button based on scroll
    const handleScroll = utils.throttle(() => {
      if (window.pageYOffset > 300) {
        this.backToTop.classList.add('visible');
      } else {
        this.backToTop.classList.remove('visible');
      }
    }, 100);

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Scroll to top on click
    this.backToTop.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
}

// Page Transitions (optional enhancement)
class PageTransitions {
  constructor() {
    this.isTransitioning = false;
    this.init();
  }

  init() {
    // Add click listeners to internal links
    document.querySelectorAll('a').forEach(link => {
      const href = link.getAttribute('href');

      // Only handle internal navigation links
      if (this.isInternalLink(href)) {
        link.addEventListener('click', (e) => this.handleClick(e, href));
      }
    });

    // Handle browser back/forward
    window.addEventListener('popstate', () => {
      window.location.reload();
    });
  }

  isInternalLink(href) {
    if (!href) return false;
    if (href.startsWith('#')) return false;
    if (href.startsWith('http')) return false;
    if (href.startsWith('mailto:')) return false;
    if (href.startsWith('tel:')) return false;
    return href.endsWith('.html') || href === '/';
  }

  handleClick(e, href) {
    // Skip if modifier key pressed
    if (e.metaKey || e.ctrlKey || e.shiftKey) return;

    // Skip if already transitioning
    if (this.isTransitioning) return;

    e.preventDefault();
    this.navigateTo(href);
  }

  async navigateTo(href) {
    this.isTransitioning = true;

    // Fade out current page
    document.body.classList.add('page-transitioning');

    await utils.wait(300);

    // Navigate to new page
    window.location.href = href;
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.navigation = new Navigation();

  // Optional: Enable page transitions
  // new PageTransitions();
});

// Export classes
window.Navigation = Navigation;
window.PageTransitions = PageTransitions;
