/**
 * ============================================
 * STARFIELD LOADER - Leonic's World
 * ============================================
 *
 * Features:
 * - Canvas-basiertes Sternenfeld
 * - Komet-Animation um das Logo
 * - Graceful fallback nach 2.5s
 * - Respects prefers-reduced-motion
 * - Reagiert auf window.load (Bilder/Fonts)
 *
 * ============================================
 */

class StarfieldLoader {
  constructor() {
    this.overlay = document.getElementById('loader-overlay');
    this.canvas = document.getElementById('loader-starfield');
    this.skipBtn = document.querySelector('.loader-skip');
    this.progress = document.querySelector('.loader-progress');

    // Konfiguration
    this.config = {
      maxDuration: 2500,        // Graceful fallback nach 2.5s
      minDisplayTime: 800,      // Mindestanzeigezeit für gute UX
      fadeOutDuration: 400,     // Fade-out Zeit
      starCount: 100,           // Anzahl der Sterne
      starSpeed: 0.3            // Sternengeschwindigkeit
    };

    this.state = {
      isComplete: false,
      isSkipped: false,
      resourcesLoaded: false,
      startTime: Date.now()
    };

    this.stars = [];
    this.animationId = null;

    this.init();
  }

  /**
   * Initialisierung
   */
  init() {
    // Früher Exit wenn kein Loader vorhanden
    if (!this.overlay) return;

    // Check ob Animation übersprungen werden soll
    if (this.shouldSkip()) {
      this.skipImmediately();
      return;
    }

    // Body-Klasse setzen
    document.body.classList.add('loader-active');

    // Starfield initialisieren (nur wenn kein reduced-motion)
    if (!this.prefersReducedMotion()) {
      this.initStarfield();
    }

    // Event Listeners
    this.setupEventListeners();

    // Progress starten
    this.startProgress();

    // Fallback Timer
    this.setupFallbackTimer();

    // Auf Ressourcen warten
    this.waitForResources();
  }

  /**
   * Prüft ob Animation übersprungen werden soll
   */
  shouldSkip() {
    // Session-basierter Skip (für schnelle Navigationen)
    const skipData = sessionStorage.getItem('loaderShown');
    if (skipData) {
      return true;
    }

    // URL Parameter
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('skip') === 'true') {
      return true;
    }

    return false;
  }

  /**
   * Prüft ob reduced-motion bevorzugt wird
   */
  prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /**
   * Sofortiger Skip (ohne Animation)
   */
  skipImmediately() {
    if (this.overlay) {
      this.overlay.remove();
    }
    document.body.classList.remove('loader-active');
    this.revealContent();
  }

  /**
   * Starfield Canvas initialisieren
   */
  initStarfield() {
    if (!this.canvas) return;

    const ctx = this.canvas.getContext('2d');
    if (!ctx) return;

    // Canvas Größe
    this.resizeCanvas();

    // Sterne generieren
    this.generateStars();

    // Animation starten
    this.animateStarfield(ctx);

    // Resize Handler
    window.addEventListener('resize', () => this.resizeCanvas());
  }

  /**
   * Canvas Größe anpassen
   */
  resizeCanvas() {
    if (!this.canvas) return;

    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = window.innerWidth * dpr;
    this.canvas.height = window.innerHeight * dpr;

    const ctx = this.canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
    }
  }

  /**
   * Sterne generieren
   */
  generateStars() {
    this.stars = [];
    for (let i = 0; i < this.config.starCount; i++) {
      this.stars.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.6 + 0.2,
        twinkleSpeed: Math.random() * 0.02 + 0.01,
        twinkleOffset: Math.random() * Math.PI * 2
      });
    }
  }

  /**
   * Starfield Animation
   */
  animateStarfield(ctx) {
    if (this.state.isComplete) return;

    const time = Date.now() * 0.001;

    // Canvas leeren
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    // Sterne zeichnen
    this.stars.forEach(star => {
      // Twinkle-Effekt
      const twinkle = Math.sin(time * star.twinkleSpeed * 10 + star.twinkleOffset);
      const opacity = star.opacity * (0.7 + twinkle * 0.3);

      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(196, 120, 92, ${opacity})`;
      ctx.fill();

      // Glow für größere Sterne
      if (star.size > 1) {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size * 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(196, 120, 92, ${opacity * 0.2})`;
        ctx.fill();
      }
    });

    this.animationId = requestAnimationFrame(() => this.animateStarfield(ctx));
  }

  /**
   * Event Listeners einrichten
   */
  setupEventListeners() {
    // Skip Button
    if (this.skipBtn) {
      this.skipBtn.addEventListener('click', () => this.skip());
    }

    // Escape-Taste
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !this.state.isComplete) {
        this.skip();
      }
    });
  }

  /**
   * Progress-Anzeige starten
   */
  startProgress() {
    if (this.progress) {
      // Kleine Verzögerung für CSS-Transition
      requestAnimationFrame(() => {
        this.progress.classList.add('active');
      });
    }
  }

  /**
   * Fallback Timer (max. 2.5s)
   */
  setupFallbackTimer() {
    setTimeout(() => {
      if (!this.state.isComplete && !this.state.isSkipped) {
        this.complete();
      }
    }, this.config.maxDuration);
  }

  /**
   * Auf Ressourcen warten
   */
  waitForResources() {
    // Wenn Seite bereits geladen
    if (document.readyState === 'complete') {
      this.onResourcesLoaded();
      return;
    }

    // Auf window.load warten
    window.addEventListener('load', () => {
      this.onResourcesLoaded();
    });
  }

  /**
   * Callback wenn Ressourcen geladen
   */
  onResourcesLoaded() {
    this.state.resourcesLoaded = true;

    // Mindestanzeigezeit einhalten
    const elapsed = Date.now() - this.state.startTime;
    const remaining = Math.max(0, this.config.minDisplayTime - elapsed);

    setTimeout(() => {
      if (!this.state.isComplete && !this.state.isSkipped) {
        this.complete();
      }
    }, remaining);
  }

  /**
   * User-initiierter Skip
   */
  skip() {
    if (this.state.isComplete || this.state.isSkipped) return;
    this.state.isSkipped = true;

    // Session markieren (für schnelle Navigation)
    sessionStorage.setItem('loaderShown', 'true');

    this.complete();
  }

  /**
   * Loader abschließen
   */
  complete() {
    if (this.state.isComplete) return;
    this.state.isComplete = true;

    // Session markieren
    sessionStorage.setItem('loaderShown', 'true');

    // Animation stoppen
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }

    // Fade out
    this.overlay?.classList.add('fade-out');

    // Nach Fade-out entfernen
    setTimeout(() => {
      this.overlay?.classList.add('hidden');
      document.body.classList.remove('loader-active');
      this.revealContent();

      // Event dispatchen
      document.dispatchEvent(new CustomEvent('loaderComplete'));

      // Cleanup
      setTimeout(() => {
        this.overlay?.remove();
      }, 100);
    }, this.config.fadeOutDuration);
  }

  /**
   * Content einblenden
   */
  revealContent() {
    // Hero Section animieren
    const heroContent = document.querySelector('.hero-content');
    const animatedElements = document.querySelectorAll('.hero .animate-on-scroll');

    if (heroContent) {
      heroContent.classList.add('visible');
    }

    animatedElements.forEach((el, index) => {
      setTimeout(() => {
        el.classList.add('animate-in');
      }, index * 80);
    });
  }
}

// ============================================
// INITIALISIERUNG
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  // Nur initialisieren wenn Loader vorhanden
  if (document.getElementById('loader-overlay')) {
    window.starfieldLoader = new StarfieldLoader();
  }
});

// Export für externe Nutzung
window.StarfieldLoader = StarfieldLoader;
