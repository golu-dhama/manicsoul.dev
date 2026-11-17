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

  // ---------- MOBILE MENU ----------
  const initMobileMenu = () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.getElementById('main-nav');
    const menuClose = navMenu.querySelector('.menu-close');
    const mobileLayout = window.matchMedia('(max-width: 900px)');

    const setMenu = (isOpen) => {
      navMenu.classList.toggle('show', isOpen);
      document.body.classList.toggle('menu-open', isOpen);
      menuToggle.setAttribute('aria-expanded', String(isOpen));
    };

    const closeMenu = () => {
      setMenu(false);
      menuToggle.focus({ preventScroll: true });
    };

    menuToggle.addEventListener('click', () => {
      if (navMenu.classList.contains('show')) {
        closeMenu();
      } else {
        setMenu(true);
        menuClose.focus({ preventScroll: true });
      }
    });
    menuClose.addEventListener('click', closeMenu);
    navMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        if (!navMenu.classList.contains('show')) return;
        setMenu(false);
        document.getElementById(link.hash.slice(1))?.focus({ preventScroll: true });
      });
    });

    document.addEventListener('click', event => {
      if (!navMenu.classList.contains('show') || navMenu.contains(event.target) || menuToggle.contains(event.target)) return;
      if (navMenu.contains(document.activeElement)) closeMenu();
      else setMenu(false);
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && navMenu.classList.contains('show')) {
        closeMenu();
      }
    });
    mobileLayout.addEventListener('change', () => setMenu(false));
  };

  // ---------- CARD LIGHT FOLLOW ----------
  const initCardLight = () => {
  const cards = document.querySelectorAll('.blog-card');

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

  // ---------- PROJECT DISCLOSURE ----------
  const initProjectDisclosure = () => {
    const disclosure = document.querySelector('.projects-disclosure');
    const summary = disclosure.querySelector('summary');

    summary.addEventListener('click', () => {
      if (!disclosure.open || getComputedStyle(summary).position !== 'sticky') return;
      if (disclosure.getBoundingClientRect().top >= summary.getBoundingClientRect().top) return;

      requestAnimationFrame(() => {
        if (disclosure.open) return;
        summary.focus({ preventScroll: true });
        summary.scrollIntoView({ block: 'start', behavior: 'instant' });
      });
    });

    if (!('IntersectionObserver' in window)) return;
    const cueObserver = new IntersectionObserver(([entry]) => {
      summary.classList.toggle('show-expand-cue', !disclosure.open && entry.intersectionRatio >= 0.55);
    }, { threshold: 0.55 });
    cueObserver.observe(summary);

    disclosure.addEventListener('toggle', () => {
      if (disclosure.open) summary.classList.remove('show-expand-cue');
    });
  };

  // ---------- PROJECT SEARCH ----------
  const initProjectSearch = () => {
    const search = document.getElementById('project-search');
    const count = document.getElementById('project-count');
    const clear = document.querySelector('.projects-search-clear');
    const projects = [...document.querySelectorAll('#project-results .project-card')].map(card => ({
      card,
      title: card.querySelector('h3').textContent.toLowerCase(),
      repository: new URL(card.querySelector('.project-link-code').href).pathname.split('/').pop().toLowerCase()
    }));

    const filterProjects = () => {
      const query = search.value.trim().toLowerCase();
      clear.hidden = search.value === '';
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
    clear.addEventListener('click', () => {
      search.value = '';
      search.focus();
      filterProjects();
    });
    filterProjects();
  };

  // ---------- CONTACT ----------
  const initEmailCopy = () => {
    const copy = document.querySelector('.contact-copy');
    const status = document.getElementById('contact-status');
    const address = document.querySelector('.contact-address').textContent.trim();
    if (!navigator.clipboard?.writeText) return;

    copy.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(address);
        status.textContent = 'Email address copied.';
      } catch {
        status.textContent = 'Select and copy the email address above.';
      }
    });

    copy.hidden = false;
  };

  // ---------- MASTER INIT ----------
  const init = () => {
    initTheme();
    initScrollObservers();
    initMobileMenu();
    initCardLight();
    initTypingEffect();
    initProjectDisclosure();
    initProjectSearch();
    initEmailCopy();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();