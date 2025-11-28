/**
 * Street Jewls - Main JavaScript
 * @version 1.0.0
 */

(function () {
  'use strict';

  /**
   * Configuration
   */
  const CONFIG = Object.freeze({
    contactEmail: 'TheStreetJewls@gmail.com',
    apiBaseUrl: '/api/v1',
    animationThreshold: 0.1,
    notificationDuration: 4000
  });

  /**
   * Initialize all modules on DOM ready
   */
  document.addEventListener('DOMContentLoaded', function () {
    Navigation.init();
    ScrollAnimations.init();
    FogReveal.init();
    Slideshow.init();
    ContactForm.init();
    SmoothScroll.init();
    ProductFilter.init();
  });

  /**
   * Navigation Module
   */
  const Navigation = {
    init: function () {
      this.toggle = document.querySelector('.nav-toggle');
      this.nav = document.querySelector('.main-nav');
      this.header = document.querySelector('.site-header');

      if (this.toggle && this.nav) {
        this.bindEvents();
      }

      this.highlightActiveLink();
    },

    bindEvents: function () {
      const self = this;

      this.toggle.addEventListener('click', function () {
        self.toggleMenu();
      });

      document.addEventListener('click', function (e) {
        if (!self.toggle.contains(e.target) && !self.nav.contains(e.target)) {
          self.closeMenu();
        }
      });

      // Close menu on escape key
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
          self.closeMenu();
        }
      });

      // Header scroll effect
      let ticking = false;
      window.addEventListener('scroll', function () {
        if (!ticking) {
          window.requestAnimationFrame(function () {
            self.handleScroll();
            ticking = false;
          });
          ticking = true;
        }
      }, { passive: true });
    },

    toggleMenu: function () {
      this.nav.classList.toggle('active');
      this.toggle.classList.toggle('active');

      const isExpanded = this.nav.classList.contains('active');
      this.toggle.setAttribute('aria-expanded', isExpanded);
    },

    closeMenu: function () {
      this.nav.classList.remove('active');
      this.toggle.classList.remove('active');
      this.toggle.setAttribute('aria-expanded', 'false');
    },

    handleScroll: function () {
      if (!this.header) {
        return;
      }

      if (window.scrollY > 50) {
        this.header.classList.add('scrolled');
      } else {
        this.header.classList.remove('scrolled');
      }
    },

    highlightActiveLink: function () {
      const currentPath = window.location.pathname;
      const navLinks = document.querySelectorAll('.nav-link');

      navLinks.forEach(function (link) {
        const href = link.getAttribute('href');
        const isActive = href === currentPath ||
          (href !== '/' && currentPath.includes(href));

        if (isActive) {
          link.classList.add('active');
          link.setAttribute('aria-current', 'page');
        }
      });
    }
  };

  /**
   * Scroll Animations Module
   */
  const ScrollAnimations = {
    init: function () {
      const elements = document.querySelectorAll('[data-animate]');

      if (!elements.length || !('IntersectionObserver' in window)) {
        // Fallback: show all elements immediately
        elements.forEach(function (el) {
          el.classList.add('animated');
        });
        return;
      }

      const observer = new IntersectionObserver(
        this.handleIntersection.bind(this),
        { threshold: CONFIG.animationThreshold }
      );

      elements.forEach(function (element) {
        observer.observe(element);
      });
    },

    handleIntersection: function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const element = entry.target;
          const delay = parseInt(element.dataset.delay, 10) || 0;

          setTimeout(function () {
            element.classList.add('animated');
          }, delay);

          observer.unobserve(element);
        }
      });
    }
  };

  /**
   * Fog Reveal Animation Module
   * Creates a fog/cloud-like text reveal effect
   */
  const FogReveal = {
    init: function () {
      this.elements = document.querySelectorAll('[data-animate="fog-reveal"]');
      this.fogTexts = document.querySelectorAll('.fog-text');
      this.divider = document.querySelector('.story__divider');

      if (!this.elements.length) {
        return;
      }

      // Prepare fog text elements
      this.prepareFogText();

      // Set up intersection observer
      if ('IntersectionObserver' in window) {
        this.setupObserver();
      } else {
        // Fallback: show everything immediately
        this.showAllImmediately();
      }
    },

    prepareFogText: function () {
      var self = this;

      this.fogTexts.forEach(function (textEl) {
        var text = textEl.textContent.trim();
        var wordsPerChunk = parseInt(textEl.dataset.words, 10) || 3;
        var isJapanese = textEl.lang === 'ja';

        // Split text into words
        var words;
        if (isJapanese) {
          // For Japanese, split by common particles and punctuation
          words = self.splitJapanese(text);
        } else {
          words = text.split(/\s+/);
        }

        // Group words into chunks
        var chunks = [];
        for (var i = 0; i < words.length; i += wordsPerChunk) {
          chunks.push(words.slice(i, i + wordsPerChunk).join(isJapanese ? '' : ' '));
        }

        // Clear and rebuild with spans
        textEl.textContent = '';
        chunks.forEach(function (chunk, index) {
          var span = document.createElement('span');
          span.className = 'fog-word';
          span.textContent = chunk;
          span.style.transitionDelay = (index * 120) + 'ms';
          textEl.appendChild(span);

          // Add space between chunks (except for Japanese)
          if (!isJapanese && index < chunks.length - 1) {
            textEl.appendChild(document.createTextNode(' '));
          }
        });
      });
    },

    splitJapanese: function (text) {
      // Split Japanese text by common break points
      // This is a simple approach - splits by punctuation and particles
      var segments = [];
      var current = '';

      for (var i = 0; i < text.length; i++) {
        var char = text[i];
        current += char;

        // Break on punctuation or every ~4-6 characters for natural grouping
        if (/[。、！？：；]/.test(char) || current.length >= 5) {
          segments.push(current);
          current = '';
        }
      }

      if (current) {
        segments.push(current);
      }

      return segments;
    },

    setupObserver: function () {
      const self = this;

      const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            const element = entry.target;
            const delay = parseInt(element.dataset.delay, 10) || 0;

            setTimeout(function () {
              self.revealElement(element);
            }, delay);

            observer.unobserve(element);
          }
        });
      }, {
        threshold: 0.2,
        rootMargin: '0px 0px -50px 0px'
      });

      this.elements.forEach(function (el) {
        observer.observe(el);
      });

      // Also observe the divider
      if (this.divider) {
        observer.observe(this.divider);
      }
    },

    revealElement: function (element) {
      // Add visibility class
      element.classList.add('fog-visible');

      // Reveal fog words with staggered timing
      var fogWords = element.querySelectorAll('.fog-word');
      fogWords.forEach(function (word, index) {
        setTimeout(function () {
          word.classList.add('fog-revealed');
        }, index * 150);
      });
    },

    showAllImmediately: function () {
      this.elements.forEach(function (el) {
        el.classList.add('fog-visible');
      });

      document.querySelectorAll('.fog-word').forEach(function (word) {
        word.classList.add('fog-revealed');
      });

      if (this.divider) {
        this.divider.classList.add('fog-visible');
      }
    }
  };

  /**
   * Slideshow Module
   * Auto-playing image carousel with touch support
   */
  const Slideshow = {
    instances: [],

    init: function () {
      var self = this;
      var slideshows = document.querySelectorAll('[data-slideshow]');

      slideshows.forEach(function (el) {
        var instance = self.createInstance(el);
        if (instance) {
          self.instances.push(instance);
        }
      });
    },

    createInstance: function (container) {
      var slides = container.querySelectorAll('.slideshow__slide:not(.slideshow__slide--placeholder)');

      // Skip if no real slides
      if (slides.length === 0) {
        return null;
      }

      var instance = {
        container: container,
        slides: slides,
        currentIndex: 0,
        autoplayTimer: null,
        autoplayDelay: 5000,
        isPlaying: true
      };

      this.setupControls(instance);
      this.setupDots(instance);
      this.setupCounter(instance);
      this.setupTouch(instance);
      this.startAutoplay(instance);
      this.setupPauseOnHover(instance);

      return instance;
    },

    setupControls: function (instance) {
      var self = this;
      var prevBtn = instance.container.querySelector('.slideshow__btn--prev');
      var nextBtn = instance.container.querySelector('.slideshow__btn--next');

      if (prevBtn) {
        prevBtn.addEventListener('click', function () {
          self.prev(instance);
        });
      }

      if (nextBtn) {
        nextBtn.addEventListener('click', function () {
          self.next(instance);
        });
      }

      // Keyboard navigation
      instance.container.setAttribute('tabindex', '0');
      instance.container.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowLeft') {
          self.prev(instance);
        } else if (e.key === 'ArrowRight') {
          self.next(instance);
        }
      });
    },

    setupDots: function (instance) {
      var self = this;
      var dotsContainer = instance.container.querySelector('.slideshow__dots');

      if (!dotsContainer || instance.slides.length <= 1) {
        return;
      }

      // Create dots
      for (var i = 0; i < instance.slides.length; i++) {
        (function (index) {
          var dot = document.createElement('button');
          dot.className = 'slideshow__dot' + (index === 0 ? ' slideshow__dot--active' : '');
          dot.setAttribute('aria-label', 'Go to slide ' + (index + 1));
          dot.addEventListener('click', function () {
            self.goTo(instance, index);
          });
          dotsContainer.appendChild(dot);
        })(i);
      }

      instance.dots = dotsContainer.querySelectorAll('.slideshow__dot');
    },

    setupCounter: function (instance) {
      var counter = instance.container.querySelector('.slideshow__counter');
      if (counter && instance.slides.length > 1) {
        instance.counter = counter;
        this.updateCounter(instance);
      }
    },

    setupTouch: function (instance) {
      var self = this;
      var startX = 0;
      var endX = 0;
      var threshold = 50;

      instance.container.addEventListener('touchstart', function (e) {
        startX = e.touches[0].clientX;
      }, { passive: true });

      instance.container.addEventListener('touchend', function (e) {
        endX = e.changedTouches[0].clientX;
        var diff = startX - endX;

        if (Math.abs(diff) > threshold) {
          if (diff > 0) {
            self.next(instance);
          } else {
            self.prev(instance);
          }
        }
      }, { passive: true });
    },

    setupPauseOnHover: function (instance) {
      var self = this;

      instance.container.addEventListener('mouseenter', function () {
        self.stopAutoplay(instance);
      });

      instance.container.addEventListener('mouseleave', function () {
        self.startAutoplay(instance);
      });
    },

    goTo: function (instance, index) {
      // Wrap around
      if (index < 0) {
        index = instance.slides.length - 1;
      } else if (index >= instance.slides.length) {
        index = 0;
      }

      // Update slides
      instance.slides.forEach(function (slide, i) {
        slide.classList.toggle('slideshow__slide--active', i === index);
      });

      // Update dots
      if (instance.dots) {
        instance.dots.forEach(function (dot, i) {
          dot.classList.toggle('slideshow__dot--active', i === index);
        });
      }

      instance.currentIndex = index;
      this.updateCounter(instance);

      // Reset autoplay timer
      if (instance.isPlaying) {
        this.startAutoplay(instance);
      }
    },

    next: function (instance) {
      this.goTo(instance, instance.currentIndex + 1);
    },

    prev: function (instance) {
      this.goTo(instance, instance.currentIndex - 1);
    },

    startAutoplay: function (instance) {
      var self = this;
      this.stopAutoplay(instance);

      instance.isPlaying = true;
      instance.autoplayTimer = window.setInterval(function () {
        self.next(instance);
      }, instance.autoplayDelay);
    },

    stopAutoplay: function (instance) {
      instance.isPlaying = false;
      if (instance.autoplayTimer) {
        window.clearInterval(instance.autoplayTimer);
        instance.autoplayTimer = null;
      }
    },

    updateCounter: function (instance) {
      if (instance.counter) {
        instance.counter.textContent = (instance.currentIndex + 1) + ' / ' + instance.slides.length;
      }
    }
  };

  /**
   * Contact Form Module
   */
  const ContactForm = {
    init: function () {
      this.form = document.querySelector('#contact-form');

      if (!this.form) {
        return;
      }

      this.submitBtn = this.form.querySelector('button[type="submit"]');
      this.originalBtnText = this.submitBtn ? this.submitBtn.textContent : 'Send';

      this.form.addEventListener('submit', this.handleSubmit.bind(this));
    },

    handleSubmit: async function (e) {
      e.preventDefault();

      const formData = new FormData(this.form);

      this.setLoading(true);

      try {
        const response = await fetch(CONFIG.apiBaseUrl + '/contact', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: formData.get('name'),
            email: formData.get('email'),
            subject: formData.get('subject') || 'Website Inquiry',
            message: formData.get('message'),
            to: CONFIG.contactEmail
          })
        });

        if (response.ok) {
          Notifications.show('Message sent successfully!', 'success');
          this.form.reset();
        } else {
          throw new Error('Server error');
        }
      } catch {
        // Fallback to mailto
        this.openMailto(formData);
      } finally {
        this.setLoading(false);
      }
    },

    setLoading: function (isLoading) {
      if (!this.submitBtn) {
        return;
      }

      this.submitBtn.disabled = isLoading;
      this.submitBtn.textContent = isLoading ? 'Sending...' : this.originalBtnText;
    },

    openMailto: function (formData) {
      const subject = encodeURIComponent(formData.get('subject') || 'Website Inquiry');
      const body = encodeURIComponent(
        'Name: ' + formData.get('name') + '\n' +
        'Email: ' + formData.get('email') + '\n\n' +
        formData.get('message')
      );

      window.location.href = 'mailto:' + CONFIG.contactEmail + '?subject=' + subject + '&body=' + body;
      Notifications.show('Opening your email client...', 'info');
    }
  };

  /**
   * Smooth Scroll Module
   */
  const SmoothScroll = {
    init: function () {
      const anchors = document.querySelectorAll('a[href^="#"]');

      anchors.forEach(function (anchor) {
        anchor.addEventListener('click', SmoothScroll.handleClick);
      });
    },

    handleClick: function (e) {
      const href = this.getAttribute('href');

      if (href === '#') {
        return;
      }

      const target = document.querySelector(href);

      if (target) {
        e.preventDefault();

        const header = document.querySelector('.site-header');
        const headerHeight = header ? header.offsetHeight : 0;
        const targetPosition = target.getBoundingClientRect().top + window.scrollY - headerHeight;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });

        // Update focus for accessibility
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      }
    }
  };

  /**
   * Product Filter Module
   */
  const ProductFilter = {
    init: function () {
      var self = this;

      this.filterBtns = document.querySelectorAll('.filter-btn');
      this.categoryLinks = document.querySelectorAll('[data-filter-link]');
      this.productsSection = document.getElementById('products');
      this.items = document.querySelectorAll('[data-category]');

      // Exit if no products to filter
      if (!this.items.length) {
        return;
      }

      // Bind filter button clicks
      this.filterBtns.forEach(function (btn) {
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          self.applyFilter(this.dataset.filter, true);
        });
      });

      // Bind category card clicks
      this.categoryLinks.forEach(function (link) {
        link.addEventListener('click', function (e) {
          e.preventDefault();
          e.stopPropagation();
          var filter = this.dataset.filterLink;
          self.applyFilter(filter, true);
          self.scrollToProducts();
        });
      });

      // Check URL hash on page load
      this.checkHash();

      // Listen for hash changes (e.g., browser back/forward)
      window.addEventListener('hashchange', function () {
        self.checkHash();
      });
    },

    checkHash: function () {
      var hash = window.location.hash.slice(1);
      if (hash && hash !== 'products') {
        this.applyFilter(hash, false);
        this.scrollToProducts();
      }
    },

    applyFilter: function (filter, updateHash) {
      // Update active button
      this.filterBtns.forEach(function (btn) {
        var isActive = btn.dataset.filter === filter;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      });

      // Filter items
      this.items.forEach(function (item) {
        var shouldShow = filter === 'all' || item.dataset.category === filter;
        item.style.display = shouldShow ? '' : 'none';
      });

      // Update URL hash
      if (updateHash) {
        if (filter === 'all') {
          window.history.pushState(null, '', window.location.pathname);
        } else {
          window.history.pushState(null, '', '#' + filter);
        }
      }
    },

    scrollToProducts: function () {
      if (!this.productsSection) {
        return;
      }

      var header = document.querySelector('.site-header');
      var headerHeight = header ? header.offsetHeight : 0;
      var targetPosition = this.productsSection.getBoundingClientRect().top + window.scrollY - headerHeight - 20;

      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  };

  /**
   * Notifications Module
   */
  const Notifications = {
    show: function (message, type) {
      type = type || 'info';

      // Remove existing notifications
      const existing = document.querySelectorAll('.notification');
      existing.forEach(function (el) {
        el.remove();
      });

      // Create notification
      const notification = document.createElement('div');
      notification.className = 'notification notification--' + type;
      notification.setAttribute('role', 'alert');
      notification.setAttribute('aria-live', 'polite');

      const colors = {
        success: 'var(--color-success)',
        error: 'var(--color-error)',
        warning: 'var(--color-warning)',
        info: 'var(--color-accent)'
      };

      notification.style.cssText = [
        'position: fixed',
        'bottom: 20px',
        'right: 20px',
        'padding: 16px 24px',
        'background: ' + (colors[type] || colors.info),
        'color: white',
        'border-radius: 8px',
        'font-family: var(--font-heading)',
        'font-size: 0.9rem',
        'z-index: 9999',
        'animation: fade-in-up 0.3s ease'
      ].join(';');

      notification.textContent = message;
      document.body.appendChild(notification);

      // Auto-remove
      setTimeout(function () {
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.3s ease';

        setTimeout(function () {
          if (notification.parentNode) {
            notification.remove();
          }
        }, 300);
      }, CONFIG.notificationDuration);
    }
  };

  /**
   * Utility Functions
   */
  const Utils = {
    formatPrice: function (price) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(price);
    },

    debounce: function (func, wait) {
      let timeout;
      return function executedFunction() {
        const context = this;
        const args = arguments;

        clearTimeout(timeout);
        timeout = setTimeout(function () {
          func.apply(context, args);
        }, wait);
      };
    }
  };

  /**
   * Expose public API
   */
  window.StreetJewls = Object.freeze({
    notify: Notifications.show,
    formatPrice: Utils.formatPrice,
    config: CONFIG
  });

})();
