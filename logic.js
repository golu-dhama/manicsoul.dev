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

  // ---------- THEME MANAGER ----------
  const initTheme = () => {
    const themeToggle = document.querySelector('.theme-toggle');
    const storageKey = 'devfolio-theme';
    let savedTheme;
    try {
      savedTheme = localStorage.getItem(storageKey);
    } catch {
      // The toggle still works when browser storage is disabled.
    }

    const setTheme = (isLight) => {
      document.body.classList.toggle('light-theme', isLight);
      themeToggle.textContent = isLight ? 'Dark Mode' : 'Light Mode';
    };
    const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
    setTheme(savedTheme ? savedTheme === 'light' : prefersLight);

    themeToggle.addEventListener('click', () => {
      const isLight = !document.body.classList.contains('light-theme');
      setTheme(isLight);
      try {
        localStorage.setItem(storageKey, isLight ? 'light' : 'dark');
      } catch {
        // The selection remains active for this page.
      }
    });
  };

  // ---------- ACTIVE SECTION ----------
  const initScrollObservers = () => {
    if (!('IntersectionObserver' in window)) return;

    const navLinks = document.querySelectorAll('.nav-list a');
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        navLinks.forEach(link => {
          const isActive = link.hash === `#${entry.target.id}`;
          link.classList.toggle('active', isActive);
          if (isActive) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-20% 0px -65% 0px' });

    document.querySelectorAll('section[id]').forEach(section => sectionObserver.observe(section));
  };

  // ---------- SIDEBAR MENU ----------
  const initSidebar = () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const sidebar = document.getElementById('site-sidebar');

    menuToggle.addEventListener('click', () => {
      sidebar.showModal();
      menuToggle.setAttribute('aria-expanded', 'true');
    });
    sidebar.addEventListener('close', () => {
      menuToggle.setAttribute('aria-expanded', 'false');
    });

    sidebar.querySelectorAll('.nav-list a').forEach(link => {
      link.addEventListener('click', () => {
        sidebar.close();
        document.getElementById(link.hash.slice(1))?.focus({ preventScroll: true });
      });
    });

    sidebar.addEventListener('click', event => {
      if (event.target !== sidebar) return;
      const bounds = sidebar.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX >= bounds.right ||
          event.clientY < bounds.top || event.clientY >= bounds.bottom) {
        sidebar.close();
      }
    });
  };

  // ---------- MAGNETIC BUTTONS ----------
  const initMagneticButtons = () => {
    const magnets = document.querySelectorAll('.primary-btn, .secondary-btn');
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
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
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

  // ---------- PROJECT SEARCH ----------
  const initProjectSearch = () => {
    const search = document.getElementById('project-search');
    const count = document.getElementById('project-count');
    const projects = [...document.querySelectorAll('#project-results .project-card')].map(card => ({
      card,
      title: card.querySelector('h3').textContent.toLowerCase(),
      repository: new URL(card.querySelector('a').href).pathname.split('/').pop().toLowerCase()
    }));

    const filterProjects = () => {
      const query = search.value.trim().toLowerCase();
      let matches = 0;
      projects.forEach(({ card, title, repository }) => {
        card.hidden = !title.includes(query) && !repository.includes(query);
        if (!card.hidden) matches++;
      });
      count.textContent = matches === 0 ? 'No matching projects' :
        `${matches} project${matches === 1 ? '' : 's'}`;
    };

    search.closest('.projects-search').hidden = false;
    search.addEventListener('input', filterProjects);
    filterProjects();
  };

  // ---------- CONTACT ----------
  const initContact = () => {
    const form = document.querySelector('.contact-form');
    const recipient = document.querySelector('.contact-email a').href;
    const name = form.elements.namedItem('name');
    const message = form.elements.namedItem('message');

    [name, message].forEach(field => {
      field.addEventListener('input', () => field.setCustomValidity(''));
    });
    form.addEventListener('submit', event => {
      event.preventDefault();
      name.setCustomValidity(name.value.trim() ? '' : 'Enter your name.');
      message.setCustomValidity(message.value.trim() ? '' : 'Enter a message.');
      if (!form.reportValidity()) return;

      const email = form.elements.namedItem('email').value;
      const subject = encodeURIComponent(`Portfolio inquiry from ${name.value.trim()}`);
      const body = encodeURIComponent(`${message.value.trim()}\r\n\r\nFrom: ${name.value.trim()} <${email}>`);
      window.location.href = `${recipient}?subject=${subject}&body=${body}`;
    });
    form.hidden = false;
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

  // ---------- GSAP ANIMATIONS ----------
  const initGSAP = () => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
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

  // ---------- MASTER INIT ----------
  const init = () => {
    initTheme();
    initScrollObservers();
    initSidebar();
    initMagneticButtons();
    initCardLight();
    initRipple();
    initTypingEffect();
    initSmoothScramble();
    initProjectSearch();
    initContact();
    initBackToTop();
    initGSAP();
    initScrollProgress();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();