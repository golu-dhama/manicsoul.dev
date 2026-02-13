// ====================================================
// DEVFOLIO X – MASTER JS ENGINE (PRODUCTION READY)
// ====================================================

(function() {
  "use strict";

  // ---------- UTILITIES ----------
  const throttle = (func, limit) => {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = setTimeout(() => inThrottle = false, limit);
      }
    };
  };

  const debounce = (func, delay) => {
    let debounceTimer;
    return function(...args) {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => func.apply(this, args), delay);
    };
  };

  // ---------- PAGE LOADER ----------
  const initLoader = () => {
    const loader = document.querySelector('.page-loader');
    if (!loader) return;

    let progress = 0;
    const progressBar = loader.querySelector('.loader-progress') || (() => {
      const bar = document.createElement('div');
      bar.className = 'loader-progress';
      loader.appendChild(bar);
      return bar;
    })();

    const interval = setInterval(() => {
      progress += Math.random() * 30;
      if (progress >= 100) { progress = 100; clearInterval(interval); }
      progressBar.style.width = progress + '%';
    }, 200);

    window.addEventListener('load', () => {
      clearInterval(interval);
      progressBar.style.width = '100%';
      setTimeout(() => {
        loader.style.opacity = '0';
        setTimeout(() => loader.style.display = 'none', 500);
      }, 300);
    });
  };

  // ---------- THEME MANAGER ----------
  // const initTheme = () => {
  //   const themeToggle = document.querySelector('.theme-toggle');
  //   if (!themeToggle) return;

  //   const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  //   const savedTheme = localStorage.getItem('devfolio-theme');

  //   if (savedTheme === 'light' || (!savedTheme && !prefersDark)) {
  //     document.body.classList.add('light-theme');
  //     themeToggle.textContent = 'Dark Mode';
  //   } else {
  //     document.body.classList.remove('light-theme');
  //     themeToggle.textContent = 'Light Mode';
  //   }

  //   themeToggle.addEventListener('click', () => {
  //     document.body.classList.toggle('light-theme');
  //     const isLight = document.body.classList.contains('light-theme');
  //     themeToggle.textContent = isLight ? 'Dark Mode' : 'Light Mode';
  //     localStorage.setItem('devfolio-theme', isLight ? 'light' : 'dark');
  //   });
  // };



const initTheme = () => {
  const themeToggle = document.querySelector('.theme-toggle');
  if (!themeToggle) return;

  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const savedTheme = localStorage.getItem('devfolio-theme');

  if (savedTheme === 'light' || (!savedTheme && !prefersDark)) {
    document.body.classList.add('light-theme');
    themeToggle.textContent = 'Dark Mode';
  } else {
    document.body.classList.remove('light-theme');
    themeToggle.textContent = 'Light Mode';
  }

  themeToggle.addEventListener('click', async () => {
    document.body.classList.toggle('light-theme');
    const isLight = document.body.classList.contains('light-theme');
    themeToggle.textContent = isLight ? 'Dark Mode' : 'Light Mode';
    localStorage.setItem('devfolio-theme', isLight ? 'light' : 'dark');

    // ✅ Re‑initialize cosmic background with new theme
    await initCosmicBg();
  });
};





  // ---------- SMOOTH SCROLL ----------
  const initSmoothScroll = () => {
    document.querySelectorAll('.nav-list a[href^="#"], .footer-links a[href^="#"], .back-to-top').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;

        const target = document.querySelector(targetId);
        if (target) {
          const headerHeight = document.querySelector('.main-header')?.offsetHeight || 80;
          const targetPosition = target.getBoundingClientRect().top + window.scrollY - headerHeight - 20;
          window.scrollTo({ top: targetPosition, behavior: 'smooth' });
        }

        document.querySelector('.main-nav')?.classList.remove('show');
        document.body.classList.remove('menu-open');
      });
    });
  };

  // ---------- INTERSECTION OBSERVER ----------
  const initScrollObservers = () => {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('in-view');
      });
    }, { threshold: 0.1, rootMargin: '0px 0px 0px 0px' });

    document.querySelectorAll('section').forEach(section => revealObserver.observe(section));

    const navLinks = document.querySelectorAll('.nav-list a');
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${id}`) link.classList.add('active');
          });
        }
      });
    }, { threshold: 0.3, rootMargin: '-20% 0px -70% 0px' });

    document.querySelectorAll('section[id]').forEach(section => sectionObserver.observe(section));
  };

  // ---------- MOBILE MENU ----------
  const initMobileMenu = () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.main-nav');
    if (!menuToggle || !navMenu) return;

    menuToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      navMenu.classList.toggle('show');
      document.body.classList.toggle('menu-open');
    });

    document.addEventListener('click', (e) => {
      if (!navMenu.contains(e.target) && !menuToggle.contains(e.target) && navMenu.classList.contains('show')) {
        navMenu.classList.remove('show');
        document.body.classList.remove('menu-open');
      }
    });

    let touchStartX = 0;
    navMenu.addEventListener('touchstart', (e) => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
    navMenu.addEventListener('touchend', (e) => {
      if (touchStartX - e.changedTouches[0].screenX > 50) {
        navMenu.classList.remove('show');
        document.body.classList.remove('menu-open');
      }
    }, { passive: true });

    window.addEventListener('resize', debounce(() => {
      if (window.innerWidth > 768) {
        navMenu.classList.remove('show');
        document.body.classList.remove('menu-open');
      }
    }, 100));
  };

  // ---------- MAGNETIC BUTTONS ----------
  const initMagneticButtons = () => {
    const magnets = document.querySelectorAll('.primary-btn, .secondary-btn, .hire-btn');
    magnets.forEach(btn => {
      btn.addEventListener('mousemove', function(e) {
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        this.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
      });
      btn.addEventListener('mouseleave', function() {
        this.style.transform = 'translate(0, 0)';
      });
    });
  };

  // ---------- CARD LIGHT FOLLOW ----------
  const initCardLight = () => {
  const cards = document.querySelectorAll('.project-card, .blog-card');

  cards.forEach(card => {
    const handleMouseMove = throttle((e) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--x', e.clientX - rect.left + 'px');
      card.style.setProperty('--y', e.clientY - rect.top + 'px');
    }, 16);

    card.addEventListener('mousemove', handleMouseMove);

    card.addEventListener('mouseleave', () => {
      card.style.setProperty('--x', '50%');
      card.style.setProperty('--y', '50%');
    });
  });
};


  // ---------- BUTTON RIPPLE ----------
  const initRipple = () => {
    document.querySelectorAll('button:not(.no-ripple)').forEach(btn => {
      btn.addEventListener('click', function(e) {
        const ripple = document.createElement('span');
        ripple.classList.add('ripple');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = e.clientX - rect.left - size / 2 + 'px';
        ripple.style.top = e.clientY - rect.top - size / 2 + 'px';
        this.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
      });
    });
  };

  // ---------- TYPING EFFECT ----------
  const initTypingEffect = () => {
    const el = document.querySelector('.typing-text');
    if (!el) return;
    const fullText = el.textContent.trim();
    el.textContent = "";
    let index = 0;
    const typeNext = () => {
      if (index < fullText.length) {
        el.textContent += fullText[index];
        index++;
        setTimeout(typeNext, 60);
      } else {
        el.classList.add('typing-complete');
      }
    };
    setTimeout(typeNext, 400);
  };

  // ---------- SMOOTH TEXT SCRAMBLE ----------
  const initSmoothScramble = () => {
    const element = document.querySelector('.gradient');
    if (!element) return;
    const originalText = element.innerText;
    const chars = '!<>-_\\/[]{}—=+*^?#__ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let frame, iteration = 0;
    let isHovering = false;
    const scramble = () => {
      if (!isHovering) return;
      element.innerText = originalText.split('').map((char, index) => index < iteration ? originalText[index] : chars[Math.floor(Math.random() * chars.length)]).join('');
      iteration += 0.25;
      if (iteration < originalText.length) {
        frame = requestAnimationFrame(scramble);
      } else {
        element.innerText = originalText;
        iteration = 0;
        isHovering = false;
      }
    };
    element.addEventListener('mouseenter', () => {
      if (isHovering) return;
      isHovering = true;
      iteration = 0;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(scramble);
    });
    element.addEventListener('mouseleave', () => {
      isHovering = false;
      cancelAnimationFrame(frame);
      element.innerText = originalText;
    });
  };

  // ---------- PROJECT FILTER ----------
  const initProjectFilter = () => {
    const filterBtns = document.querySelectorAll('.projects-filter button');
    const projects = document.querySelectorAll('.project-card');
    if (!filterBtns.length || !projects.length) return;

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.textContent.trim().toLowerCase();
        projects.forEach(card => {
          const categories = card.dataset.category?.toLowerCase() || 'all';
          if (filter === 'all' || categories.includes(filter)) {
            card.style.display = 'block';
            setTimeout(() => card.style.opacity = '1', 10);
          } else {
            card.style.opacity = '0';
            setTimeout(() => card.style.display = 'none', 300);
          }
        });
      });
    });
    document.querySelector('.projects-filter button:first-child')?.click();
  };

  // ---------- FORM VALIDATION ----------
  const initFormValidation = () => {
    const form = document.querySelector('.contact-form');
    if (!form) return;

    const inputs = form.querySelectorAll('input[required], textarea[required]');
    inputs.forEach(input => {
      if (!input.parentElement.classList.contains('form-group')) {
        const wrapper = document.createElement('div');
        wrapper.className = 'form-group';
        input.parentNode.insertBefore(wrapper, input);
        wrapper.appendChild(input);
        const errorSpan = document.createElement('span');
        errorSpan.className = 'error-message';
        wrapper.appendChild(errorSpan);
      }

      input.addEventListener('input', function() {
        const group = this.parentElement;
        if (this.value.trim() === '') {
          group.classList.add('error');
          group.querySelector('.error-message').textContent = 'This field is required';
        } else {
          group.classList.remove('error');
        }
      });
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let isValid = true;
      inputs.forEach(input => {
        if (input.value.trim() === '') {
          const group = input.parentElement;
          group.classList.add('error');
          group.querySelector('.error-message').textContent = 'This field is required';
          isValid = false;
        }
      });
      if (isValid) {
        const btn = form.querySelector('button[type="submit"]');
        btn.classList.add('loading');
        btn.textContent = 'Sending...';
        setTimeout(() => {
          btn.classList.remove('loading');
          btn.textContent = 'Send Message';
          alert('✨ Message sent successfully!');
          form.reset();
        }, 1200);
      }
    });
  };

  // ---------- BACK TO TOP ----------
  const initBackToTop = () => {
    let btn = document.querySelector('.back-to-top');
    if (!btn) {
      btn = document.createElement('button');
      btn.className = 'back-to-top';
      btn.innerHTML = '↑';
      btn.setAttribute('aria-label', 'Back to top');
      document.body.appendChild(btn);
    }
    window.addEventListener('scroll', throttle(() => {
      btn.classList.toggle('visible', window.scrollY > 500);
    }, 100));
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  };

  // ---------- LAZY IMAGES ----------
  const initLazyImages = () => {
    const images = document.querySelectorAll('img[data-src]');
    const imgObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.classList.add('loaded');
          img.removeAttribute('data-src');
          observer.unobserve(img);
        }
      });
    }, { rootMargin: '100px' });
    images.forEach(img => imgObserver.observe(img));
  };

  // ---------- GSAP ANIMATIONS ----------
  const initGSAP = () => {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      console.warn('GSAP or ScrollTrigger not loaded – GSAP animations disabled');
      return;
    }
    gsap.registerPlugin(ScrollTrigger);

    gsap.to('.hero-image', {
      y: 50,
      ease: 'none',
      scrollTrigger: { trigger: '.hero-section', start: 'top top', end: 'bottom top', scrub: true }
    });

    gsap.from('.project-card', {
      scrollTrigger: { trigger: '.projects-grid', start: 'top 80%' },
      y: 60, opacity: 0, duration: 0.8, stagger: 0.15
    });

    gsap.from('.skill-category', {
      scrollTrigger: { trigger: '.skills-container', start: 'top 80%' },
      scale: 0.9, opacity: 0, duration: 0.6, stagger: 0.1
    });
  };


  // ---------- SCROLL PROGRESS ----------
  const initScrollProgress = () => {
    const progressBar = document.querySelector('.scroll-progress');
    if (!progressBar) return;
    window.addEventListener('scroll', throttle(() => {
      const winScroll = document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      progressBar.style.width = (winScroll / height) * 100 + '%';
    }, 10));
  };

  // ---------- CONSOLE SIGNATURE ----------
  const consoleSignature = () => {
    console.log('%c⚡ DevFolio X — Next‑gen portfolio engine', 'color:#6C63FF; font-size:20px; font-weight:bold;');
    console.log('%c🚀 All systems online — typing effect restored', 'color:#B8B5FF; font-size:16px;');
  };

  // ---------- HIRE BUTTON ----------
  const initHireButton = () => {
    const hireBtn = document.getElementById('hireBtn');
    if (hireBtn) {
      hireBtn.addEventListener("click", () => {
  const contact = document.getElementById("contact");
  const headerOffset = 120; // same as body padding / header height
  const elementPosition = contact.getBoundingClientRect().top;
  const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

  window.scrollTo({
    top: offsetPosition,
    behavior: "smooth"
  });
});

    }
  };

  // ---------- MASTER INIT ----------
  const init = () => {
    initLoader();
    initTheme();
    initSmoothScroll();
    initScrollObservers();
    initMobileMenu();
    initMagneticButtons();
    initCardLight();
    initRipple();
    initTypingEffect();
    initSmoothScramble();
    initProjectFilter();
    initFormValidation();
    initBackToTop();
    initLazyImages();
    initGSAP();
    initScrollProgress();
    initHireButton();
    consoleSignature();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();