/**
 * Scroll Animations
 * Uses Intersection Observer for performant scroll-triggered animations
 */

class ScrollAnimations {
  constructor() {
    this.animatedElements = document.querySelectorAll('.animate-on-scroll');
    this.staggerContainers = document.querySelectorAll('.stagger-children');
    this.countElements = document.querySelectorAll('[data-count]');

    this.observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px'
    };

    this.init();
  }

  init() {
    // Skip animations if user prefers reduced motion
    if (utils.prefersReducedMotion()) {
      this.showAllImmediately();
      return;
    }

    this.setupIntersectionObserver();
    this.setupCountAnimations();
  }

  setupIntersectionObserver() {
    // Observer for individual elements
    const elementObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
          elementObserver.unobserve(entry.target);
        }
      });
    }, this.observerOptions);

    // Observer for stagger containers
    const staggerObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
          staggerObserver.unobserve(entry.target);
        }
      });
    }, this.observerOptions);

    // Observe elements
    this.animatedElements.forEach(el => elementObserver.observe(el));
    this.staggerContainers.forEach(el => staggerObserver.observe(el));
  }

  setupCountAnimations() {
    if (this.countElements.length === 0) return;

    const countObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.animateCount(entry.target);
          countObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    this.countElements.forEach(el => countObserver.observe(el));
  }

  animateCount(element) {
    const target = parseInt(element.dataset.count, 10);
    const duration = parseInt(element.dataset.duration, 10) || 2000;
    const suffix = element.dataset.suffix || '';
    const prefix = element.dataset.prefix || '';

    const startTime = performance.now();
    const startValue = 0;

    const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);

    const updateCount = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutQuart(progress);
      const currentValue = Math.floor(startValue + (target - startValue) * easedProgress);

      element.textContent = `${prefix}${currentValue}${suffix}`;

      if (progress < 1) {
        requestAnimationFrame(updateCount);
      } else {
        element.textContent = `${prefix}${target}${suffix}`;
      }
    };

    requestAnimationFrame(updateCount);
  }

  showAllImmediately() {
    // For users who prefer reduced motion, show everything immediately
    this.animatedElements.forEach(el => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });

    this.staggerContainers.forEach(container => {
      container.querySelectorAll(':scope > *').forEach(child => {
        child.style.opacity = '1';
        child.style.transform = 'none';
      });
    });

    this.countElements.forEach(el => {
      const target = el.dataset.count;
      const suffix = el.dataset.suffix || '';
      const prefix = el.dataset.prefix || '';
      el.textContent = `${prefix}${target}${suffix}`;
    });
  }
}

/**
 * Parallax Effect
 * Subtle parallax scrolling for background elements
 */
class ParallaxEffect {
  constructor() {
    this.elements = document.querySelectorAll('[data-parallax]');

    if (this.elements.length > 0 && !utils.prefersReducedMotion()) {
      this.init();
    }
  }

  init() {
    window.addEventListener('scroll', utils.throttle(() => {
      this.update();
    }, 16), { passive: true });
  }

  update() {
    const scrollY = window.pageYOffset;

    this.elements.forEach(el => {
      const speed = parseFloat(el.dataset.parallax) || 0.5;
      const yPos = -(scrollY * speed);
      el.style.transform = `translate3d(0, ${yPos}px, 0)`;
    });
  }
}

/**
 * Typewriter Effect
 * Animated text typing effect
 */
class TypewriterEffect {
  constructor(element, options = {}) {
    this.element = element;
    this.text = element.dataset.typewriter || element.textContent;
    this.speed = options.speed || 50;
    this.delay = options.delay || 0;
    this.loop = options.loop || false;
    this.cursor = options.cursor || true;

    this.currentIndex = 0;
    this.isDeleting = false;
  }

  start() {
    // Clear element and prepare
    this.element.textContent = '';

    if (this.cursor) {
      this.element.classList.add('typewriter-cursor');
    }

    setTimeout(() => this.type(), this.delay);
  }

  type() {
    if (this.currentIndex < this.text.length) {
      this.element.textContent += this.text.charAt(this.currentIndex);
      this.currentIndex++;
      setTimeout(() => this.type(), this.speed);
    } else if (this.loop) {
      setTimeout(() => this.delete(), 2000);
    } else {
      this.element.classList.remove('typewriter-cursor');
    }
  }

  delete() {
    if (this.currentIndex > 0) {
      this.element.textContent = this.text.substring(0, this.currentIndex - 1);
      this.currentIndex--;
      setTimeout(() => this.delete(), this.speed / 2);
    } else {
      setTimeout(() => this.type(), 500);
    }
  }
}

/**
 * Magnetic Button Effect
 * Subtle magnetic hover effect for buttons
 */
class MagneticButton {
  constructor(element) {
    this.element = element;
    this.boundingRect = null;
    this.strength = 0.3;

    if (!utils.isTouchDevice()) {
      this.init();
    }
  }

  init() {
    this.element.addEventListener('mouseenter', () => this.onMouseEnter());
    this.element.addEventListener('mousemove', (e) => this.onMouseMove(e));
    this.element.addEventListener('mouseleave', () => this.onMouseLeave());
  }

  onMouseEnter() {
    this.boundingRect = this.element.getBoundingClientRect();
  }

  onMouseMove(e) {
    if (!this.boundingRect) return;

    const centerX = this.boundingRect.left + this.boundingRect.width / 2;
    const centerY = this.boundingRect.top + this.boundingRect.height / 2;

    const deltaX = (e.clientX - centerX) * this.strength;
    const deltaY = (e.clientY - centerY) * this.strength;

    this.element.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
  }

  onMouseLeave() {
    this.element.style.transform = 'translate(0, 0)';
    this.boundingRect = null;
  }
}

/**
 * Tilt Effect
 * 3D tilt effect on hover for cards
 */
class TiltEffect {
  constructor(element, options = {}) {
    this.element = element;
    this.maxTilt = options.maxTilt || 10;
    this.perspective = options.perspective || 1000;
    this.scale = options.scale || 1.02;

    if (!utils.isTouchDevice() && !utils.prefersReducedMotion()) {
      this.init();
    }
  }

  init() {
    this.element.style.transformStyle = 'preserve-3d';
    this.element.style.transition = 'transform 0.1s ease';

    this.element.addEventListener('mouseenter', () => this.onMouseEnter());
    this.element.addEventListener('mousemove', (e) => this.onMouseMove(e));
    this.element.addEventListener('mouseleave', () => this.onMouseLeave());
  }

  onMouseEnter() {
    this.element.style.transition = 'transform 0.1s ease';
  }

  onMouseMove(e) {
    const rect = this.element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;

    const rotateX = (mouseY / (rect.height / 2)) * -this.maxTilt;
    const rotateY = (mouseX / (rect.width / 2)) * this.maxTilt;

    this.element.style.transform = `
      perspective(${this.perspective}px)
      rotateX(${rotateX}deg)
      rotateY(${rotateY}deg)
      scale3d(${this.scale}, ${this.scale}, ${this.scale})
    `;
  }

  onMouseLeave() {
    this.element.style.transition = 'transform 0.5s ease';
    this.element.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
  }
}

// Initialize animations when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Initialize scroll animations
  window.scrollAnimations = new ScrollAnimations();

  // Initialize parallax
  window.parallaxEffect = new ParallaxEffect();

  // Initialize typewriter effects
  document.querySelectorAll('[data-typewriter]').forEach(el => {
    const typewriter = new TypewriterEffect(el);
    typewriter.start();
  });

  // Initialize tilt effects on cards
  document.querySelectorAll('.tilt-effect').forEach(el => {
    new TiltEffect(el);
  });

  // Initialize magnetic buttons
  document.querySelectorAll('.magnetic-btn').forEach(el => {
    new MagneticButton(el);
  });
});

// Export classes
window.ScrollAnimations = ScrollAnimations;
window.ParallaxEffect = ParallaxEffect;
window.TypewriterEffect = TypewriterEffect;
window.MagneticButton = MagneticButton;
window.TiltEffect = TiltEffect;
