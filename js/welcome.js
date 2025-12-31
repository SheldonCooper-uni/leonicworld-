/**
 * Welcome Animation
 * Handles the intro animation sequence when the page loads
 */

class WelcomeAnimation {
  constructor() {
    this.overlay = document.getElementById('welcome-overlay');
    this.preText = document.querySelector('.welcome-pre');
    this.title = document.querySelector('.welcome-title');
    this.skipBtn = document.querySelector('.skip-btn');
    this.progress = document.querySelector('.welcome-progress');

    this.totalDuration = 3500; // 3.5 seconds
    this.hasSkipped = false;
    this.animationComplete = false;

    this.init();
  }

  init() {
    // Check if we should skip the animation
    if (this.shouldSkipAnimation()) {
      this.skipImmediately();
      return;
    }

    // Prevent scrolling during animation
    document.body.classList.add('welcome-active');

    // Start animation sequence
    this.startAnimation();

    // Setup skip button
    this.setupSkipButton();
  }

  shouldSkipAnimation() {
    // Check localStorage for skip preference (24 hour expiry)
    const skipData = utils.storage.get('welcomeSkipped');
    if (skipData) {
      const now = Date.now();
      const expires = skipData.expires || 0;
      if (now < expires) {
        return true;
      }
    }

    // Check for reduced motion preference
    if (utils.prefersReducedMotion()) {
      return true;
    }

    // Check URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('skip') === 'true') {
      return true;
    }

    return false;
  }

  skipImmediately() {
    if (this.overlay) {
      this.overlay.remove();
    }
    document.body.classList.remove('welcome-active');
    this.revealMainContent();
  }

  async startAnimation() {
    // Start progress bar if exists
    if (this.progress) {
      this.progress.classList.add('animate');
    }

    // Timeline:
    // 0s - 0.8s: "Welcome to" fades in
    // 0.5s - 1.3s: "Leonic's World" appears
    // 1.5s: Optional glitch effect
    // 2.8s - 3.5s: Fade out overlay

    try {
      // Step 1: Fade in pre-text (0s)
      await utils.wait(100);
      if (this.hasSkipped) return;
      this.preText?.classList.add('animate');

      // Step 2: Fade in title (0.5s)
      await utils.wait(400);
      if (this.hasSkipped) return;
      this.title?.classList.add('animate');

      // Step 3: Show skip button (1s)
      await utils.wait(500);
      if (this.hasSkipped) return;
      this.skipBtn?.classList.add('visible');

      // Step 4: Glitch effect (1.5s)
      await utils.wait(500);
      if (this.hasSkipped) return;
      this.triggerGlitch();

      // Step 5: Wait for text to be read (until 2.8s)
      await utils.wait(1300);
      if (this.hasSkipped) return;

      // Step 6: Fade out (2.8s - 3.5s)
      this.fadeOut();

    } catch (error) {
      console.error('Welcome animation error:', error);
      this.fadeOut();
    }
  }

  triggerGlitch() {
    if (this.title && !utils.prefersReducedMotion()) {
      this.title.classList.add('glitch');
      setTimeout(() => {
        this.title.classList.remove('glitch');
      }, 150);
    }
  }

  fadeOut() {
    if (this.hasSkipped || this.animationComplete) return;
    this.animationComplete = true;

    this.overlay?.classList.add('fade-out');

    setTimeout(() => {
      this.overlay?.remove();
      document.body.classList.remove('welcome-active');
      this.revealMainContent();
    }, 700);
  }

  skip() {
    if (this.hasSkipped || this.animationComplete) return;
    this.hasSkipped = true;

    // Save skip preference (expires in 24 hours)
    utils.storage.set('welcomeSkipped', {
      expires: Date.now() + (24 * 60 * 60 * 1000)
    });

    this.fadeOut();
  }

  setupSkipButton() {
    if (this.skipBtn) {
      this.skipBtn.addEventListener('click', () => this.skip());

      // Also allow skipping with Escape key or any click/tap
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          this.skip();
        }
      }, { once: true });
    }
  }

  revealMainContent() {
    // Trigger hero section animation
    const heroContent = document.querySelector('.hero-content');
    const heroElements = document.querySelectorAll('.hero .animate-on-scroll');

    setTimeout(() => {
      heroContent?.classList.add('visible');
      heroElements.forEach((el, index) => {
        setTimeout(() => {
          el.classList.add('animate-in');
        }, index * 100);
      });
    }, 100);

    // Dispatch custom event
    document.dispatchEvent(new CustomEvent('welcomeComplete'));
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Only initialize if welcome overlay exists
  if (document.getElementById('welcome-overlay')) {
    new WelcomeAnimation();
  }
});

// Export for use elsewhere
window.WelcomeAnimation = WelcomeAnimation;
