/**
 * Street Jewls - Main JavaScript
 * Professional JDM E-commerce Platform
 */

(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    contactEmail: 'TheStreetJewls@gmail.com',
    apiBaseUrl: '/api/v1',
  };

  // DOM Ready
  document.addEventListener('DOMContentLoaded', function() {
    initNavigation();
    initScrollAnimations();
    initContactForm();
    initSmoothScroll();
    initProductCards();
  });

  // ==========================================================================
  // Navigation
  // ==========================================================================
  function initNavigation() {
    const navToggle = document.querySelector('.nav-toggle');
    const mainNav = document.querySelector('.main-nav');
    const header = document.querySelector('.site-header');
    
    // Mobile menu toggle
    if (navToggle && mainNav) {
      navToggle.addEventListener('click', function() {
        mainNav.classList.toggle('active');
        navToggle.classList.toggle('active');
      });
      
      // Close menu on outside click
      document.addEventListener('click', function(e) {
        if (!navToggle.contains(e.target) && !mainNav.contains(e.target)) {
          mainNav.classList.remove('active');
          navToggle.classList.remove('active');
        }
      });
    }
    
    // Header scroll effect
    let lastScroll = 0;
    window.addEventListener('scroll', function() {
      const currentScroll = window.scrollY;
      
      if (header) {
        if (currentScroll > 50) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }
      }
      
      lastScroll = currentScroll;
    }, { passive: true });
    
    // Active link highlighting
    highlightActiveLink();
  }

  function highlightActiveLink() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(function(link) {
      const href = link.getAttribute('href');
      if (href === currentPath || (currentPath.includes(href) && href !== '/')) {
        link.classList.add('active');
      }
    });
  }

  // ==========================================================================
  // Scroll Animations
  // ==========================================================================
  function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('[data-animate]');
    
    if (!animatedElements.length) return;
    
    const observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          const element = entry.target;
          const delay = element.dataset.delay || 0;
          
          setTimeout(function() {
            element.classList.add('animated');
          }, delay);
          
          observer.unobserve(element);
        }
      });
    }, {
      threshold: 0.1
    });
    
    animatedElements.forEach(function(element) {
      observer.observe(element);
    });
  }

  // ==========================================================================
  // Contact Form - Email submission
  // ==========================================================================
  function initContactForm() {
    const contactForm = document.querySelector('#contact-form');
    
    if (!contactForm) return;
    
    contactForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const formData = new FormData(this);
      const submitBtn = this.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      
      // Disable button and show loading
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';
      
      try {
        // Option 1: Use backend API endpoint
        const response = await fetch(CONFIG.apiBaseUrl + '/contact', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: formData.get('name'),
            email: formData.get('email'),
            subject: formData.get('subject'),
            message: formData.get('message'),
            to: CONFIG.contactEmail
          }),
        });
        
        if (response.ok) {
          showNotification('Message sent successfully! We\'ll get back to you soon.', 'success');
          contactForm.reset();
        } else {
          throw new Error('Failed to send');
        }
      } catch (error) {
        // Fallback: Open email client
        const subject = encodeURIComponent(formData.get('subject') || 'Website Inquiry');
        const body = encodeURIComponent(
          'Name: ' + formData.get('name') + '\n' +
          'Email: ' + formData.get('email') + '\n\n' +
          formData.get('message')
        );
        
        window.location.href = 'mailto:' + CONFIG.contactEmail + '?subject=' + subject + '&body=' + body;
        showNotification('Opening your email client...', 'info');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    });
  }

  // ==========================================================================
  // Smooth Scroll
  // ==========================================================================
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
      anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        
        e.preventDefault();
        const target = document.querySelector(href);
        
        if (target) {
          const headerHeight = document.querySelector('.site-header')?.offsetHeight || 0;
          const targetPos = target.getBoundingClientRect().top + window.scrollY - headerHeight;
          
          window.scrollTo({
            top: targetPos,
            behavior: 'smooth'
          });
        }
      });
    });
  }

  // ==========================================================================
  // Product Cards
  // ==========================================================================
  function initProductCards() {
    const productCards = document.querySelectorAll('.product-card');
    
    productCards.forEach(function(card) {
      card.addEventListener('mouseenter', function() {
        this.classList.add('hover');
      });
      
      card.addEventListener('mouseleave', function() {
        this.classList.remove('hover');
      });
    });
    
    // Filter buttons
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(function(btn) {
      btn.addEventListener('click', function() {
        const filter = this.dataset.filter;
        
        filterBtns.forEach(function(b) { b.classList.remove('active'); });
        this.classList.add('active');
        
        document.querySelectorAll('[data-category]').forEach(function(item) {
          if (filter === 'all' || item.dataset.category === filter) {
            item.style.display = 'block';
          } else {
            item.style.display = 'none';
          }
        });
      });
    });
  }

  // ==========================================================================
  // Notifications
  // ==========================================================================
  function showNotification(message, type) {
    type = type || 'info';
    
    // Remove existing notifications
    document.querySelectorAll('.notification').forEach(function(n) { n.remove(); });
    
    const notification = document.createElement('div');
    notification.className = 'notification notification--' + type;
    notification.style.cssText = 'position: fixed; bottom: 20px; right: 20px; padding: 16px 24px; background: ' + 
      (type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : '#3B82F6') + 
      '; color: white; border-radius: 8px; font-family: var(--font-heading); font-size: 0.9rem; z-index: 9999; animation: fadeInUp 0.3s ease;';
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(function() {
      notification.style.opacity = '0';
      setTimeout(function() { notification.remove(); }, 300);
    }, 4000);
  }

  // ==========================================================================
  // Utility Functions
  // ==========================================================================
  function formatPrice(price) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  }

  // Expose functions globally
  window.StreetJewls = {
    showNotification: showNotification,
    formatPrice: formatPrice,
    config: CONFIG
  };

})();
