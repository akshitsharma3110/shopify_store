// ============================================================
// ACCTIVE Sports — theme.js (Valor-Inspired)
// Features: Predictive Search, AJAX Filter/Sort, Color Swatches,
//           Product Gallery, Cart Drawer, Mobile Nav, Header scroll
// ============================================================
'use strict';

// ---- Utilities ----
const $ = (s, ctx = document) => ctx.querySelector(s);
const $$ = (s, ctx = document) => [...ctx.querySelectorAll(s)];
const on = (el, ev, fn, opts) => el && el.addEventListener(ev, fn, opts);

function debounce(fn, ms = 300) {
  let t;
  return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
}

function formatMoney(cents) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR',
    minimumFractionDigits: 0, maximumFractionDigits: 0
  }).format(cents / 100);
}

// ---- Announcement Bar dismiss ----
function initAnnouncement() {
  const bar = $('#announcement-bar');
  const btn = $('[data-announcement-dismiss]');
  if (!bar || !btn) return;
  on(btn, 'click', () => {
    bar.style.maxHeight = bar.offsetHeight + 'px';
    requestAnimationFrame(() => {
      bar.style.transition = 'max-height 0.3s ease, opacity 0.3s ease';
      bar.style.maxHeight = '0';
      bar.style.opacity = '0';
      bar.style.overflow = 'hidden';
    });
    try { sessionStorage.setItem('ann-dismissed', '1'); } catch(e) {}
  });
  try { if (sessionStorage.getItem('ann-dismissed')) bar.style.display = 'none'; } catch(e) {}
}

// ---- Header scroll ----
function initHeaderScroll() {
  const header = $('.site-header');
  if (!header) return;
  const update = () => header.classList.toggle('scrolled', window.scrollY > 20);
  on(window, 'scroll', update, { passive: true });
  update();
}

// ---- Mobile Nav ----
function initMobileNav() {
  const openBtn = $('#header-menu-open');
  const closeBtn = $('#mobile-nav-close');
  const nav = $('#mobile-nav');
  const overlay = $('#mobile-nav-overlay');
  if (!nav) return;

  function open() {
    nav.classList.add('is-open');
    overlay && overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    openBtn && openBtn.setAttribute('aria-expanded', 'true');
  }
  function close() {
    nav.classList.remove('is-open');
    overlay && overlay.classList.remove('is-open');
    document.body.style.overflow = '';
    openBtn && openBtn.setAttribute('aria-expanded', 'false');
  }
  on(openBtn, 'click', open);
  on(closeBtn, 'click', close);
  on(overlay, 'click', close);
  on(document, 'keydown', e => e.key === 'Escape' && nav.classList.contains('is-open') && close());
}

// ---- Predictive Search ----
function initPredictiveSearch() {
  const form = $('#predictive-search-form');
  const input = $('#predictive-search-input');
  const results = $('#predictive-search-results');
  if (!input || !results) return;

  let currentQuery = '';

  const fetchResults = debounce(async (query) => {
    query = query.trim();
    if (query.length < 2) { results.innerHTML = ''; results.hidden = true; return; }
    if (query === currentQuery) return;
    currentQuery = query;

    try {
      const url = `/search/suggest.json?q=${encodeURIComponent(query)}&resources[type]=product&resources[limit]=6&resources[options][unavailable_products]=last`;
      const res = await fetch(url, { headers: { 'Content-Type': 'application/json' } });
      if (!res.ok) return;
      const { resources } = await res.json();
      const products = resources?.results?.products || [];

      if (products.length === 0) {
        results.innerHTML = `<p class="search-no-results">No results for "<strong>${query}</strong>"</p>`;
        results.hidden = false;
        return;
      }

      let html = '<p class="search-result-heading">Products</p>';
      products.forEach(p => {
        const img = p.featured_image?.url
          ? `<img class="search-result-img" src="${p.featured_image.url}&width=96" alt="${p.title}" loading="lazy">`
          : `<div class="search-result-img"></div>`;
        const price = p.price ? formatMoney(parseInt(p.price, 10)) : '';
        html += `
          <a href="${p.url}" class="search-result-item">
            ${img}
            <div>
              <div class="search-result-title">${p.title}</div>
              ${price ? `<div class="search-result-price">${price}</div>` : ''}
            </div>
          </a>`;
      });
      html += `<a href="/search?type=product&q=${encodeURIComponent(query)}" class="search-result-all">See all results →</a>`;

      results.innerHTML = html;
      results.hidden = false;
    } catch (e) {
      console.warn('Predictive search error:', e);
    }
  }, 250);

  on(input, 'input', e => fetchResults(e.target.value));
  on(input, 'focus', e => { if (e.target.value.length >= 2) fetchResults(e.target.value); });

  // Close on outside click
  on(document, 'click', e => {
    if (!form?.contains(e.target)) {
      results.innerHTML = '';
      results.hidden = true;
      currentQuery = '';
    }
  });

  on(document, 'keydown', e => {
    if (e.key === 'Escape') {
      results.innerHTML = '';
      results.hidden = true;
      input.blur();
    }
  });

  // Form submit
  on(form, 'submit', e => {
    if (!input.value.trim()) e.preventDefault();
  });
}

// ---- Cart Drawer ----
let cartState = { items: [], item_count: 0, total_price: 0 };

function openCartDrawer() {
  const drawer = $('#cart-drawer');
  const overlay = $('#cart-drawer-overlay');
  drawer && drawer.classList.add('is-open');
  overlay && overlay.classList.add('is-open');
  document.body.style.overflow = 'hidden';
}

function closeCartDrawer() {
  const drawer = $('#cart-drawer');
  const overlay = $('#cart-drawer-overlay');
  drawer && drawer.classList.remove('is-open');
  overlay && overlay.classList.remove('is-open');
  document.body.style.overflow = '';
}

async function fetchCart() {
  const res = await fetch('/cart.json');
  return res.json();
}

function renderCartDrawer(cart) {
  cartState = cart;
  const body = $('#cart-drawer-body');
  const footer = $('#cart-drawer-footer');
  const countEls = $$('[data-cart-count]');

  // Update count badges
  countEls.forEach(el => {
    el.textContent = cart.item_count;
    el.style.display = cart.item_count > 0 ? 'flex' : 'none';
  });

  if (!body) return;

  if (cart.item_count === 0) {
    body.innerHTML = `
      <div class="cart-empty-state">
        <svg class="cart-empty-icon" width="64" height="64" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"/>
        </svg>
        <h3 class="cart-empty-title">Your cart is empty</h3>
        <p>Discover our sportswear collection</p>
        <a href="/collections/all" class="btn btn-primary" onclick="closeCartDrawer()">Shop Now</a>
      </div>`;
    footer && (footer.hidden = true);
    return;
  }

  let itemsHtml = '';
  cart.items.forEach(item => {
    const img = item.image
      ? `<img class="cart-item-img" src="${item.image}" alt="${item.product_title}" loading="lazy">`
      : `<div class="cart-item-img"></div>`;
    itemsHtml += `
      <div class="cart-item" data-line-key="${item.key}">
        ${img}
        <div class="cart-item-details">
          <a class="cart-item-title" href="${item.url}">${item.product_title}</a>
          ${item.variant_title && item.variant_title !== 'Default Title' ? `<div class="cart-item-variant">${item.variant_title}</div>` : ''}
          <div class="cart-item-price-row">
            <div class="cart-item-qty">
              <button class="cart-item-qty-btn" data-line="${item.key}" data-delta="-1" aria-label="Decrease qty">−</button>
              <span class="cart-item-qty-val">${item.quantity}</span>
              <button class="cart-item-qty-btn" data-line="${item.key}" data-delta="1" aria-label="Increase qty">+</button>
            </div>
            <div class="cart-item-price">${formatMoney(item.final_line_price)}</div>
          </div>
          <button class="cart-item-remove" data-line="${item.key}" data-qty="0">Remove</button>
        </div>
      </div>`;
  });

  body.innerHTML = itemsHtml;
  footer && (footer.hidden = false);

  // Subtotal
  const subtotalEl = $('#cart-subtotal-value');
  subtotalEl && (subtotalEl.textContent = formatMoney(cart.total_price));

  // Bulk discount notice
  const bulkMin = parseInt(document.documentElement.dataset.bulkMin || '5', 10);
  const bulkPct = parseInt(document.documentElement.dataset.bulkPct || '50', 10);
  const bulkText = $('#bulk-discount-text');
  if (bulkText) {
    if (cart.item_count >= bulkMin) {
      bulkText.textContent = `🎉 ${bulkPct}% bulk discount will be applied at checkout!`;
    } else {
      const needed = bulkMin - cart.item_count;
      bulkText.textContent = `Add ${needed} more piece${needed > 1 ? 's' : ''} to unlock ${bulkPct}% off!`;
    }
  }

  // Attach qty/remove events
  $$('.cart-item-qty-btn', body).forEach(btn => {
    on(btn, 'click', () => updateCartItem(btn.dataset.line, parseInt(btn.dataset.delta, 10)));
  });
  $$('.cart-item-remove', body).forEach(btn => {
    on(btn, 'click', () => removeCartItem(btn.dataset.line));
  });
}

async function updateCartItem(key, delta) {
  const cart = await fetchCart();
  const item = cart.items.find(i => i.key === key);
  if (!item) return;
  const newQty = Math.max(0, item.quantity + delta);
  await changeCartItem(key, newQty);
}

async function removeCartItem(key) {
  await changeCartItem(key, 0);
}

async function changeCartItem(key, qty) {
  try {
    const res = await fetch('/cart/change.json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: key, quantity: qty })
    });
    const cart = await res.json();
    renderCartDrawer(cart);
  } catch (e) {
    console.warn('Cart change error:', e);
  }
}

async function addToCart(formData) {
  try {
    const res = await fetch('/cart/add.json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.description || 'Could not add to cart');
    }
    const cart = await fetchCart();
    renderCartDrawer(cart);
    openCartDrawer();
    return cart;
  } catch (e) {
    alert(e.message);
    throw e;
  }
}

function initCartDrawer() {
  const drawer = $('#cart-drawer');
  const overlay = $('#cart-drawer-overlay');
  const closeBtns = $$('[data-cart-close]');
  const openBtns = $$('[data-cart-open]');

  openBtns.forEach(btn => on(btn, 'click', openCartDrawer));
  closeBtns.forEach(btn => on(btn, 'click', closeCartDrawer));
  on(overlay, 'click', closeCartDrawer);
  on(document, 'keydown', e => {
    if (e.key === 'Escape' && drawer?.classList.contains('is-open')) closeCartDrawer();
  });

  // Load initial cart state
  fetchCart().then(cart => renderCartDrawer(cart)).catch(() => {});

  // Intercept all ATC forms
  on(document, 'submit', async e => {
    const form = e.target.closest('[data-atc-form]');
    if (!form) return;
    e.preventDefault();
    const btn = form.querySelector('[type="submit"]');
    if (btn) { btn.classList.add('is-loading'); btn.disabled = true; }
    try {
      const data = { items: [{ id: parseInt(form.querySelector('[name="id"]').value, 10), quantity: parseInt(form.querySelector('[name="quantity"]')?.value || '1', 10) }] };
      await addToCart(data);
    } finally {
      if (btn) { btn.classList.remove('is-loading'); btn.disabled = false; }
    }
  });
}

// ---- AJAX Collection Filter/Sort ----
function initCollectionFilters() {
  const filterForm = $('#collection-filter-form');
  const sortSelect = $('#collection-sort-select');
  const productGrid = $('#product-grid-container');
  if (!productGrid) return;

  async function updateCollection(url) {
    document.querySelector('.collection-layout')?.classList.add('collection-loading');
    try {
      const res = await fetch(url, { headers: { 'X-Requested-With': 'XMLHttpRequest' } });
      const text = await res.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, 'text/html');
      const newGrid = doc.querySelector('#product-grid-container');
      const newCount = doc.querySelector('#collection-count');
      const newFilters = doc.querySelector('#collection-filter-form');

      if (newGrid) productGrid.innerHTML = newGrid.innerHTML;
      const countEl = $('#collection-count');
      if (newCount && countEl) countEl.textContent = newCount.textContent;
      if (newFilters && filterForm) filterForm.innerHTML = newFilters.innerHTML;

      history.pushState({}, '', url);
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Re-init events after DOM update
      initFilterToggle();
    } catch (e) {
      console.warn('Filter error:', e);
    } finally {
      document.querySelector('.collection-layout')?.classList.remove('collection-loading');
    }
  }

  // Filter form changes
  on(filterForm, 'change', debounce(() => {
    const params = new URLSearchParams(new FormData(filterForm));
    const sortVal = sortSelect?.value;
    if (sortVal) params.set('sort_by', sortVal);
    updateCollection(`${window.location.pathname}?${params.toString()}`);
  }, 400));

  // Sort change
  on(sortSelect, 'change', () => {
    const params = new URLSearchParams(window.location.search);
    params.set('sort_by', sortSelect.value);
    updateCollection(`${window.location.pathname}?${params.toString()}`);
  });

  // Active filter pill removal
  on(document, 'click', e => {
    const pill = e.target.closest('[data-filter-remove]');
    if (!pill) return;
    e.preventDefault();
    const params = new URLSearchParams(window.location.search);
    const key = pill.dataset.filterKey;
    const val = pill.dataset.filterValue;
    if (key && val) {
      const values = params.getAll(key).filter(v => v !== val);
      params.delete(key);
      values.forEach(v => params.append(key, v));
    }
    updateCollection(`${window.location.pathname}?${params.toString()}`);
  });

  // Clear all
  on($('#filter-clear-all'), 'click', () => {
    updateCollection(window.location.pathname);
  });

  // Mobile filter toggle
  const filterToggleBtn = $('#filter-mobile-btn');
  const sidebar = $('#collection-sidebar');
  on(filterToggleBtn, 'click', () => {
    sidebar?.classList.toggle('is-open');
    filterToggleBtn.setAttribute('aria-expanded', sidebar?.classList.contains('is-open') ? 'true' : 'false');
  });
}

function initFilterToggle() {
  $$('.filter-group-toggle').forEach(btn => {
    const body = btn.nextElementSibling;
    on(btn, 'click', () => {
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', !expanded);
      body && (body.hidden = expanded);
    });
  });
}

// ---- Product Gallery ----
function initProductGallery() {
  const mainImg = $('#product-main-img');
  const thumbs = $$('.product-thumb');
  if (!mainImg || !thumbs.length) return;

  thumbs.forEach(thumb => {
    on(thumb, 'click', () => {
      const src = thumb.dataset.src;
      const srcset = thumb.dataset.srcset;
      if (!src) return;

      mainImg.style.opacity = '0';
      setTimeout(() => {
        mainImg.src = src;
        if (srcset) mainImg.srcset = srcset;
        mainImg.style.opacity = '1';
      }, 150);

      thumbs.forEach(t => t.classList.remove('is-active'));
      thumb.classList.add('is-active');
    });
  });

  // Zoom btn
  const zoomBtn = $('#product-zoom-btn');
  if (zoomBtn && mainImg) {
    on(zoomBtn, 'click', () => {
      const overlay = document.createElement('div');
      overlay.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.9);display:flex;align-items:center;justify-content:center;cursor:zoom-out;';
      const img = document.createElement('img');
      img.src = mainImg.src;
      img.style.cssText = 'max-width:90vw;max-height:90vh;object-fit:contain;border-radius:8px;';
      overlay.appendChild(img);
      document.body.appendChild(overlay);
      on(overlay, 'click', () => overlay.remove());
      on(document, 'keydown', function handler(e) {
        if (e.key === 'Escape') { overlay.remove(); document.removeEventListener('keydown', handler); }
      });
    });
  }

  mainImg.style.transition = 'opacity 0.15s ease';
}

// ---- Color Swatches on product page ----
function initProductSwatches() {
  const form = $('[data-product-form]');
  if (!form) return;

  $$('.option-swatch', form).forEach(swatch => {
    on(swatch, 'click', () => {
      const optionName = swatch.dataset.option;
      const optionVal = swatch.dataset.value;

      // Update active state
      $$(`[data-option="${optionName}"]`, form).forEach(s => s.classList.remove('is-active'));
      swatch.classList.add('is-active');

      // Update label display
      const label = form.querySelector(`[data-option-selected="${optionName}"]`);
      if (label) label.textContent = optionVal;

      // Find matching variant
      updateSelectedVariant(form);
    });
  });

  $$('.option-size-btn', form).forEach(btn => {
    on(btn, 'click', () => {
      if (btn.classList.contains('is-unavailable')) return;
      const optionName = btn.dataset.option;
      $$(`[data-option="${optionName}"]`, form).forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      const label = form.querySelector(`[data-option-selected="${optionName}"]`);
      if (label) label.textContent = btn.dataset.value;
      updateSelectedVariant(form);
    });
  });
}

function updateSelectedVariant(form) {
  const variantsData = JSON.parse(form.dataset.variants || '[]');
  const selectedOptions = {};
  $$('[data-option]', form).forEach(el => {
    if (el.classList.contains('is-active')) {
      selectedOptions[el.dataset.option] = el.dataset.value;
    }
  });

  const variant = variantsData.find(v =>
    v.options.every((opt, i) => {
      const key = Object.keys(selectedOptions)[i];
      return !key || selectedOptions[key] === opt;
    })
  );

  if (!variant) return;

  // Update hidden variant ID
  const idInput = form.querySelector('[name="id"]');
  if (idInput) idInput.value = variant.id;

  // Update price
  const priceEl = $('#product-price');
  const comparePriceEl = $('#product-compare-price');
  if (priceEl && variant.price) {
    priceEl.textContent = formatMoney(variant.price);
  }
  if (comparePriceEl) {
    if (variant.compare_at_price > variant.price) {
      comparePriceEl.textContent = formatMoney(variant.compare_at_price);
      comparePriceEl.hidden = false;
    } else {
      comparePriceEl.hidden = true;
    }
  }

  // Update ATC button
  const atcBtn = form.querySelector('[data-atc-btn]');
  if (atcBtn) {
    if (!variant.available) {
      atcBtn.disabled = true;
      atcBtn.textContent = 'Sold Out';
    } else {
      atcBtn.disabled = false;
      atcBtn.textContent = 'Add to Cart';
    }
  }

  // Update gallery image if variant has one
  if (variant.featured_image) {
    const thumb = $(`[data-variant-img="${variant.id}"]`);
    thumb && thumb.click();
  }
}

// ---- Color Swatches on product CARDS ----
function initCardSwatches() {
  $$('.product-card').forEach(card => {
    const swatches = $$('.color-swatch', card);
    if (!swatches.length) return;

    swatches.forEach(swatch => {
      on(swatch, 'mouseenter', () => {
        const imgSrc = swatch.dataset.img;
        const imgEl = card.querySelector('.product-card-img');
        if (imgSrc && imgEl) {
          imgEl.dataset.origSrc = imgEl.dataset.origSrc || imgEl.src;
          imgEl.style.opacity = '0';
          setTimeout(() => { imgEl.src = imgSrc; imgEl.style.opacity = '1'; }, 100);
        }
        swatches.forEach(s => s.classList.remove('is-active'));
        swatch.classList.add('is-active');
      });

      on(swatch, 'mouseleave', () => {
        // Don't revert on mouseleave — stays on last hovered
      });
    });
  });
}

// ---- Qty selector ----
function initQtySelectors() {
  $$('.qty-selector').forEach(sel => {
    const dec = sel.querySelector('[data-qty-dec]');
    const inc = sel.querySelector('[data-qty-inc]');
    const input = sel.querySelector('.qty-input');
    if (!input) return;
    on(dec, 'click', () => { input.value = Math.max(1, parseInt(input.value || 1) - 1); });
    on(inc, 'click', () => { input.value = parseInt(input.value || 1) + 1; });
  });
}

// ---- Accordion (FAQ + Product tabs) ----
function initAccordions() {
  $$('[data-accordion-toggle]').forEach(toggle => {
    on(toggle, 'click', () => {
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', !expanded);
      const contentId = toggle.getAttribute('aria-controls');
      const content = contentId ? document.getElementById(contentId) : toggle.nextElementSibling;
      if (content) {
        content.classList.toggle('is-open', !expanded);
      }
    });
  });

  // FAQ
  $$('.faq-question').forEach(btn => {
    on(btn, 'click', () => {
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', !expanded);
      const answer = btn.nextElementSibling;
      if (answer) answer.classList.toggle('is-open', !expanded);
    });
  });

  // Product tabs
  $$('.product-tab-toggle').forEach(toggle => {
    on(toggle, 'click', () => {
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', !expanded);
      const content = toggle.nextElementSibling;
      if (content) content.classList.toggle('is-open', !expanded);
    });
  });
}

// ---- Newsletter ----
function initNewsletter() {
  $$('.newsletter-form, .footer-newsletter-form').forEach(form => {
    on(form, 'submit', async e => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      const input = form.querySelector('input[type="email"]');
      if (!input?.value) return;
      if (btn) { btn.textContent = '✓ Subscribed!'; btn.disabled = true; }
      input.value = '';
      setTimeout(() => { if (btn) { btn.textContent = 'Subscribe'; btn.disabled = false; } }, 3000);
    });
  });
}

// ---- View toggle (grid/list) ----
function initViewToggle() {
  const grid = $('#product-grid-container');
  if (!grid) return;
  $$('.view-toggle-btn').forEach(btn => {
    on(btn, 'click', () => {
      $$('.view-toggle-btn').forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      const view = btn.dataset.view;
      grid.className = grid.className.replace(/product-grid--\w+/, '');
      if (view === 'list') {
        grid.style.gridTemplateColumns = '1fr';
      } else {
        grid.style.gridTemplateColumns = '';
        grid.classList.add('product-grid--4');
      }
    });
  });
}

// ---- Cart page AJAX ----
function initCartPage() {
  on($('#cart-page-form'), 'change', debounce(async (e) => {
    const input = e.target.closest('[data-cart-line-key]');
    if (!input) return;
    await changeCartItem(input.dataset.cartLineKey, parseInt(input.value, 10));
    window.location.reload();
  }, 500));
}

// ---- Init all ----
document.addEventListener('DOMContentLoaded', () => {
  initAnnouncement();
  initHeaderScroll();
  initMobileNav();
  initPredictiveSearch();
  initCartDrawer();
  initCollectionFilters();
  initFilterToggle();
  initProductGallery();
  initProductSwatches();
  initCardSwatches();
  initQtySelectors();
  initAccordions();
  initNewsletter();
  initViewToggle();
  initCartPage();

  // Remove no-js class
  document.documentElement.classList.remove('no-js');
  document.documentElement.classList.add('js');
});
