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
      } catch (error) {
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
      this.filterBtns = document.querySelectorAll('.filter-btn');
      this.categoryLinks = document.querySelectorAll('[data-filter-link]');
      this.productsSection = document.getElementById('products');

      if (!this.filterBtns.length) {
        return;
      }

      var self = this;

      // Bind filter button clicks
      this.filterBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
          self.applyFilter(this.dataset.filter, true);
        });
      });

      // Bind category card clicks
      this.categoryLinks.forEach(function (link) {
        link.addEventListener('click', function (e) {
          e.preventDefault();
          var filter = this.dataset.filterLink;
          self.applyFilter(filter, true);
          self.scrollToProducts();
        });
      });

      // Check URL hash on page load
      this.checkHash();

      // Listen for hash changes
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
      var items = document.querySelectorAll('[data-category]');

      // Update active button
      this.filterBtns.forEach(function (btn) {
        var isActive = btn.dataset.filter === filter;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      });

      // Filter items
      items.forEach(function (item) {
        var shouldShow = filter === 'all' || item.dataset.category === filter;
        item.style.display = shouldShow ? '' : 'none';
      });

      // Update URL hash
      if (updateHash) {
        if (filter === 'all') {
          history.pushState(null, '', window.location.pathname);
        } else {
          history.pushState(null, '', '#' + filter);
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
