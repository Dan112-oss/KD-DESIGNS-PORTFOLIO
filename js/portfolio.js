/* ==========================================================
   PORTFOLIO.JS
   Purpose: Project data, card rendering, and category filtering
   for the Portfolio section. Kept isolated from nav.js / main.js
   so it can be edited independently.

   ==========================================================
   >>> REPLACE ME <<<
   Everything in PORTFOLIO_PROJECTS below is SAMPLE data, used
   only to build and test the layout. Replace each entry with a
   real project before launch:
     - name        -> your real project title
     - category    -> 'graphic-design' or 'web-design'
     - subcategory -> see SUBCATEGORY slugs used in index.html
                      (flyers, branding, logos, social-media,
                      event-design, brochures, landing-pages,
                      business-websites, ecommerce, dashboard-ui,
                      mobile-ui)
     - description -> one short, honest sentence about the project
     - image       -> local path, e.g. assets/images/projects/project-01.jpg
                      (add the actual image file yourself — none
                      are generated here)
     - url         -> placeholder '#' for now; point this at the
                      real case-study page once it exists
     - size        -> controls grid proportions:
                      'large' | 'wide' | 'tall' | 'standard'
   ========================================================== */

const PORTFOLIO_PROJECTS = [
  {
    id: 'sample-01',
    name: 'SAMPLE — Replace with real project name',
    category: 'graphic-design',
    subcategory: 'branding',
    description: 'SAMPLE — replace with a short, honest description of this branding project.',
    image: 'assets/images/projects/project-01.jpg', // REPLACE
    url: '#', // REPLACE with real case-study URL
    size: 'large'
  },
  {
    id: 'sample-02',
    name: 'SAMPLE — Replace with real project name',
    category: 'web-design',
    subcategory: 'business-websites',
    description: 'SAMPLE — replace with a short, honest description of this website project.',
    image: 'assets/images/projects/project-02.jpg', // REPLACE
    url: '#', // REPLACE with real case-study URL
    size: 'standard'
  },
  {
    id: 'sample-03',
    name: 'Business flyer',
    category: 'graphic-design',
    subcategory: 'flyers',
    description: 'Designed a vibrant, professional promotional flyer for Famous Cyndi Hair Beauty, featuring a curated product showcase grid, clear call-to-action elements, and brand contact details.',
    image: 'assets/images/projects/project-03.jpg', // REPLACE
    url: '#', // REPLACE with real case-study URL
    size: 'wide'
  },
  {
    id: 'sample-04',
    name: 'Logo Design',
    category: 'graphic-design',
    subcategory: 'logos',
    description: 'Designed a sophisticated, embossed logo mockup for Isaac Interiors featuring a custom monogram logo and the brand tagline Transforming your space..',
    image: 'assets/images/projects/project-04.jpg', // REPLACE
    url: '#', // REPLACE with real case-study URL
    size: 'standard'
  },
  {
    id: 'sample-05',
    name: 'SAMPLE — Replace with real project name',
    category: 'graphic-design',
    subcategory: 'social-media',
    description: 'SAMPLE — replace with a short, honest description of this social campaign.',
    image: 'assets/images/projects/project-05.jpg', // REPLACE
    url: '#', // REPLACE with real case-study URL
    size: 'wide'
  },
  {
    id: 'sample-06',
    name: 'SAMPLE — Replace with real project name',
    category: 'web-design',
    subcategory: 'dashboard-ui',
    description: 'SAMPLE — replace with a short, honest description of this dashboard project.',
    image: 'assets/images/projects/project-06.jpg', // REPLACE
    url: '#', // REPLACE with real case-study URL
    size: 'standard'
  }
];

const PORTFOLIO_CATEGORY_LABELS = {
  'flyers': 'Flyers',
  'branding': 'Branding',
  'logos': 'Logos',
  'social-media': 'Social Media Design',
  'event-design': 'Event Design',
  'brochures': 'Brochures',
  'landing-pages': 'Landing Page',
  'business-websites': 'Business Website',
  'ecommerce': 'E-commerce',
  'dashboard-ui': 'Dashboard UI',
  'mobile-ui': 'Mobile UI'
};

window.KD = window.KD || {};

KD.initPortfolio = function initPortfolio() {
  const grid = document.getElementById('portfolioGrid');
  const status = document.getElementById('portfolioStatus');
  const primaryFilters = document.getElementById('primaryFilters');
  const subFilterGroups = {
    'graphic-design': document.getElementById('graphicSubFilters'),
    'web-design': document.getElementById('webSubFilters')
  };

  if (!grid || !primaryFilters) {
    return;
  }

  const state = {
    primary: 'all',
    sub: null
  };

  function createCard(project) {
    const card = document.createElement('article');
    card.className = 'project-card project-card--' + project.size;
    card.dataset.category = project.category;
    card.dataset.subcategory = project.subcategory;

    const categoryLabel = PORTFOLIO_CATEGORY_LABELS[project.subcategory] || project.subcategory;

    card.innerHTML =
      '<div class="project-card__image-wrap">' +
        '<img class="project-card__image" src="' + project.image + '" alt="' + project.name + '" loading="lazy">' +
      '</div>' +
      '<div class="project-card__body">' +
        '<span class="project-card__category">' + categoryLabel + '</span>' +
        '<h3 class="project-card__name">' + project.name + '</h3>' +
        '<p class="project-card__description">' + project.description + '</p>' +
        '<a href="' + project.url + '" class="project-card__link">View Project</a>' +
      '</div>';

    return card;
  }

  function renderCards() {
    grid.innerHTML = '';
    PORTFOLIO_PROJECTS.forEach(function (project) {
      grid.appendChild(createCard(project));
    });
  }

  function applyFilters() {
    const cards = grid.querySelectorAll('.project-card');
    let visibleCount = 0;

    cards.forEach(function (card) {
      const matchesPrimary = state.primary === 'all' || card.dataset.category === state.primary;
      const matchesSub = !state.sub || card.dataset.subcategory === state.sub;
      const isVisible = matchesPrimary && matchesSub;

      card.hidden = !isVisible;
      if (isVisible) {
        visibleCount += 1;
      }
    });

    if (status) {
      status.textContent = visibleCount + (visibleCount === 1 ? ' project shown' : ' projects shown');
    }
  }

  function setActiveButton(group, selector, value) {
    group.querySelectorAll('button').forEach(function (btn) {
      const isActive = btn.dataset[selector] === value;
      btn.classList.toggle('is-active', isActive);
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
  }

  function showSubFilters(primary) {
    Object.keys(subFilterGroups).forEach(function (key) {
      const group = subFilterGroups[key];
      if (!group) return;
      const shouldShow = key === primary;
      group.hidden = !shouldShow;
    });
  }

  primaryFilters.addEventListener('click', function (event) {
    const button = event.target.closest('[data-filter-primary]');
    if (!button) return;

    state.primary = button.dataset.filterPrimary;
    state.sub = null;

    setActiveButton(primaryFilters, 'filterPrimary', state.primary);
    showSubFilters(state.primary);

    // Reset any previously active sub-filter buttons
    Object.values(subFilterGroups).forEach(function (group) {
      if (group) {
        group.querySelectorAll('button').forEach(function (btn) {
          btn.classList.remove('is-active');
          btn.setAttribute('aria-pressed', 'false');
        });
      }
    });

    applyFilters();
  });

  Object.values(subFilterGroups).forEach(function (group) {
    if (!group) return;

    group.addEventListener('click', function (event) {
      const button = event.target.closest('[data-filter-sub]');
      if (!button) return;

      const value = button.dataset.filterSub;
      const isAlreadyActive = state.sub === value;

      state.sub = isAlreadyActive ? null : value;
      setActiveButton(group, 'filterSub', isAlreadyActive ? '__none__' : state.sub);

      applyFilters();
    });
  });

  renderCards();
  applyFilters();
};
