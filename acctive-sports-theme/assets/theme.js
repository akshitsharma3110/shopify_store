// ============================================
// ACCTIVE Sports Industries — Theme JS
// Core interactive functionality
// ============================================

(function () {
  'use strict';

  // ---- Utilities ----
  const $ = (selector, context = document) => context.querySelector(selector);
  const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];
  const on = (el, event, handler, opts) => el && el.addEventListener(event, handler, opts);
  const emit = (el, event, detail = {}) => el && el.dispatchEvent(new CustomEvent(event, { bubbles: true, detail }));

  // Debounce
  function debounce(fn, delay = 300) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  // Format price in INR
  function formatPrice(cents) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(cents / 100);
  }

  // ---- Header scroll shadow ----
  function initHeaderScroll() {
    const header = $('.site-header');
    if (!header) return;
    const onScroll = () => {
      header.classList.toggle('scrolled', window.scrollY > 10);
    };
    on(window, 'scroll', onScroll, { passive: true });
    onScroll();
  }

  // ---- Mobile Menu ----
  function initMobileMenu() {
    const openBtn = $('#header-menu-open');
    const closeBtn = $('#mobile-nav-close');
    const mobileNav = $('#mobile-nav');
    if (!openBtn || !mobileNav) return;

    function open() {
      mobileNav.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      openBtn.setAttribute('aria-expanded', 'true');
    }

    function close() {
      mobileNav.classList.remove('is-open');
      document.body.style.overflow = '';
      openBtn.setAttribute('aria-expanded', 'false');
    }

    on(openBtn, 'click', open);
    on(closeBtn, 'click', close);
    on(mobileNav, 'click', (e) => {
      if (e.target === mobileNav) close();
    });
    on(document, 'keydown', (e) => {
      if (e.key === 'Escape' && mobileNav.classList.contains('is-open')) close();
    });
  }

  // ---- Search Modal ----
  function initSearch() {
    const openBtns = $$('[data-search-open]');
    const closeBtn = $('[data-search-close]');
    const modal = $('#search-modal');
    const input = modal ? modal.querySelector('input[name="q"]') : null;

    if (!modal) return;

    function open() {
      modal.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      setTimeout(() => input && input.focus(), 100);
    }

    function close() {
      modal.classList.remove('is-open');
      document.body.style.overflow = '';
    }

    openBtns.forEach(btn => on(btn, 'click', open));
    on(closeBtn, 'click', close);
    on(modal, 'click', (e) => { if (e.target === modal) close(); });
    on(document, 'keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('is-open')) close();
    });
  }

  // ---- Cart Drawer ----
  function initCartDrawer() {
    const drawer = $('#cart-drawer');
    const overlay = $('#cart-drawer-overlay');
    const openBtns = $$('[data-cart-open]');
    const closeBtn = $('[data-cart-close]');

    if (!drawer) return;

    function open() {
      drawer.classList.add('is-open');
      overlay && overlay.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      refreshCartDrawer();
    }

    function close() {
      drawer.classList.remove('is-open');
      overlay && overlay.classList.remove('is-open');
      document.body.style.overflow = '';
    }

    openBtns.forEach(btn => on(btn, 'click', open));
    on(closeBtn, 'click', close);
    on(overlay, 'click', close);
    on(document, 'keydown', (e) => {
      if (e.key === 'Escape' && drawer.classList.contains('is-open')) close();
    });

    // Listen for cart updates
    on(document, 'cart:updated', () => refreshCartDrawer());

    async function refreshCartDrawer() {
      try {
        const res = await fetch('/cart.js');
        const cart = await res.json();
        updateCartCount(cart.item_count);
        updateBulkNotice(cart.item_count, cart.total_price);
        renderCartItems(cart, drawer);
      } catch (e) {
        console.error('Cart fetch error:', e);
      }
    }

    window.openCartDrawer = open;
    window.closeCartDrawer = close;
    window.refreshCartDrawer = refreshCartDrawer;
  }

  function updateCartCount(count) {
    $$('[data-cart-count]').forEach(el => {
      el.textContent = count;
      el.style.display = count > 0 ? 'flex' : 'none';
    });
  }

  function updateBulkNotice(itemCount, totalPrice) {
    const bulkMin = parseInt(document.documentElement.dataset.bulkMin || '5');
    const bulkPct = parseInt(document.documentElement.dataset.bulkPct || '50');
    $$('[data-bulk-notice]').forEach(el => {
      const remaining = bulkMin - itemCount;
      if (itemCount >= bulkMin) {
        el.classList.add('active');
        el.querySelector('[data-bulk-text]').textContent =
          `🎉 Bulk discount (${bulkPct}% off) will be applied at checkout!`;
      } else {
        el.classList.remove('active');
        el.querySelector('[data-bulk-text]').textContent =
          `Add ${remaining} more piece${remaining === 1 ? '' : 's'} to unlock ${bulkPct}% off`;
      }
    });
  }

  function renderCartItems(cart, drawer) {
    const body = drawer.querySelector('.cart-drawer-body');
    const footer = drawer.querySelector('.cart-drawer-footer');
    if (!body) return;

    if (cart.item_count === 0) {
      body.innerHTML = `
        <div class="cart-empty-state">
          <svg class="cart-empty-icon" width="64" height="64" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"/>
          </svg>
          <h3 class="cart-empty-title">Your cart is empty</h3>
          <p class="cart-empty-desc">Browse our sportswear collection and start shopping.</p>
          <a href="/collections/all" class="btn btn-primary" onclick="closeCartDrawer()">Shop Now</a>
        </div>`;
      if (footer) footer.style.display = 'none';
      return;
    }

    if (footer) footer.style.display = 'block';

    let itemsHtml = '';
    cart.items.forEach(item => {
      const img = item.featured_image ? item.featured_image.url : '';
      itemsHtml += `
        <div class="cart-item" data-key="${item.key}">
          ${img ? `<img class="cart-item-image" src="${img}" alt="${item.title}" loading="lazy">` : '<div class="cart-item-image" style="background:#f1f5f9;border-radius:6px;"></div>'}
          <div>
            <div class="cart-item-title">${item.product_title}</div>
            <div class="cart-item-variant">${item.variant_title || ''}</div>
            <div style="display:flex;align-items:center;gap:8px;margin-top:8px;">
              <div class="quantity-selector" style="height:32px;">
                <button class="quantity-btn" data-action="minus" data-key="${item.key}" style="width:32px;height:32px;font-size:14px;" aria-label="Decrease">−</button>
                <input class="quantity-input" value="${item.quantity}" min="0" style="width:36px;height:32px;font-size:13px;" data-key="${item.key}" aria-label="Quantity">
                <button class="quantity-btn" data-action="plus" data-key="${item.key}" style="width:32px;height:32px;font-size:14px;" aria-label="Increase">+</button>
              </div>
              <button class="btn btn-ghost btn-sm" data-remove="${item.key}" style="color:var(--color-muted);font-size:12px;padding:0;" aria-label="Remove">Remove</button>
            </div>
          </div>
          <div class="cart-item-price">${formatPrice(item.final_line_price)}</div>
        </div>`;
    });

    body.innerHTML = itemsHtml;

    // Quantity buttons
    body.querySelectorAll('.quantity-btn').forEach(btn => {
      on(btn, 'click', async () => {
        const key = btn.dataset.key;
        const action = btn.dataset.action;
        const input = body.querySelector(`input[data-key="${key}"]`);
        let qty = parseInt(input.value);
        qty = action === 'plus' ? qty + 1 : Math.max(0, qty - 1);
        await updateCartItem(key, qty);
      });
    });

    body.querySelectorAll('[data-remove]').forEach(btn => {
      on(btn, 'click', () => updateCartItem(btn.dataset.remove, 0));
    });

    // Subtotal
    if (footer) {
      const subtotalEl = footer.querySelector('[data-cart-subtotal]');
      if (subtotalEl) subtotalEl.textContent = formatPrice(cart.total_price);
    }

    updateBulkNotice(cart.item_count, cart.total_price);
  }

  async function updateCartItem(key, quantity) {
    try {
      const res = await fetch('/cart/change.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: key, quantity })
      });
      const cart = await res.json();
      updateCartCount(cart.item_count);
      updateBulkNotice(cart.item_count, cart.total_price);
      const drawer = $('#cart-drawer');
      if (drawer) renderCartItems(cart, drawer);
      emit(document, 'cart:updated', { cart });
    } catch (e) {
      console.error('Cart update error:', e);
    }
  }

  // ---- Add to Cart ----
  function initAddToCart() {
    on(document, 'submit', async (e) => {
      const form = e.target.closest('form[data-product-form]');
      if (!form) return;
      e.preventDefault();

      const submitBtn = form.querySelector('[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.classList.add('loading');
        submitBtn.textContent = 'Adding...';
      }

      try {
        const formData = new FormData(form);
        const res = await fetch('/cart/add.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: formData.get('id'),
            quantity: parseInt(formData.get('quantity') || '1')
          })
        });

        if (!res.ok) throw new Error('Failed to add to cart');

        emit(document, 'cart:updated');
        if (window.openCartDrawer) window.openCartDrawer();
      } catch (err) {
        console.error('Add to cart error:', err);
        alert('Something went wrong. Please try again.');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.classList.remove('loading');
          submitBtn.textContent = 'Add to Cart';
        }
      }
    });
  }

  // ---- Product Page: variant selector ----
  function initVariantSelector() {
    const form = $('form[data-product-form]');
    if (!form) return;

    const sizeOptions = $$('.size-option:not(.disabled)', form);
    const priceEl = $('.product-price-current');
    const mrpEl = $('.product-price-mrp');
    const addToCartBtn = form.querySelector('[type="submit"]');
    let selectedVariantId = null;

    sizeOptions.forEach(opt => {
      on(opt, 'click', () => {
        if (opt.classList.contains('disabled')) return;
        sizeOptions.forEach(o => o.classList.remove('active'));
        opt.classList.add('active');
        selectedVariantId = opt.dataset.variantId;
        const hiddenId = form.querySelector('input[name="id"]');
        if (hiddenId) hiddenId.value = selectedVariantId;

        const price = opt.dataset.price;
        const comparePrice = opt.dataset.comparePrice;

        if (price && parseInt(price) > 0) {
          if (priceEl) priceEl.textContent = formatPrice(parseInt(price));
          if (mrpEl) {
            mrpEl.textContent = comparePrice && parseInt(comparePrice) > 0
              ? formatPrice(parseInt(comparePrice))
              : '';
          }
          if (addToCartBtn) {
            addToCartBtn.disabled = false;
            addToCartBtn.textContent = 'Add to Cart';
          }
        } else {
          if (priceEl) priceEl.textContent = 'Price on Request';
          if (mrpEl) mrpEl.textContent = '';
          if (addToCartBtn) {
            addToCartBtn.disabled = true;
            addToCartBtn.textContent = 'Price on Request';
          }
        }
      });
    });

    // Quantity selector
    const minusBtn = form.querySelector('[data-qty-minus]');
    const plusBtn = form.querySelector('[data-qty-plus]');
    const qtyInput = form.querySelector('input[name="quantity"]');

    if (minusBtn && plusBtn && qtyInput) {
      on(minusBtn, 'click', () => {
        const v = parseInt(qtyInput.value);
        if (v > 1) qtyInput.value = v - 1;
      });
      on(plusBtn, 'click', () => {
        qtyInput.value = parseInt(qtyInput.value) + 1;
      });
    }
  }

  // ---- Product Gallery (thumbnails) ----
  function initProductGallery() {
    const thumbs = $$('.product-thumbnail');
    const mainImg = $('.product-main-image img');
    if (!thumbs.length || !mainImg) return;

    thumbs.forEach(thumb => {
      on(thumb, 'click', () => {
        thumbs.forEach(t => t.classList.remove('active'));
        thumb.classList.add('active');
        const src = thumb.querySelector('img')?.src;
        if (src) {
          mainImg.src = src.replace('_80x80', '_800x800');
        }
      });
    });
  }

  // ---- Product Tabs ----
  function initProductTabs() {
    const tabBtns = $$('.product-tab-btn');
    const tabPanels = $$('.product-tab-content');
    if (!tabBtns.length) return;

    tabBtns.forEach((btn, i) => {
      on(btn, 'click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        tabPanels.forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        const panel = document.getElementById(btn.dataset.tab);
        if (panel) panel.classList.add('active');
      });
    });
  }

  // ---- FAQ Accordion ----
  function initFAQ() {
    const items = $$('.faq-item');
    items.forEach(item => {
      const question = item.querySelector('.faq-question');
      on(question, 'click', () => {
        const isOpen = item.classList.contains('is-open');
        // Close all
        items.forEach(i => i.classList.remove('is-open'));
        if (!isOpen) item.classList.add('is-open');
        question.setAttribute('aria-expanded', !isOpen);
      });
    });
  }

  // ---- Collection Filters (mobile toggle) ----
  function initFilters() {
    const filterToggle = $('#filter-toggle');
    const filterSidebar = $('.filter-sidebar');
    if (!filterToggle || !filterSidebar) return;

    on(filterToggle, 'click', () => {
      filterSidebar.classList.toggle('is-open');
      filterToggle.setAttribute(
        'aria-expanded',
        filterSidebar.classList.contains('is-open')
      );
    });

    // Sort select
    const sortSelect = $('#sort-by');
    if (sortSelect) {
      on(sortSelect, 'change', () => {
        const url = new URL(window.location.href);
        url.searchParams.set('sort_by', sortSelect.value);
        window.location.href = url.toString();
      });
    }
  }

  // ---- Newsletter Form ----
  function initNewsletter() {
    $$('form[data-newsletter]').forEach(form => {
      on(form, 'submit', async (e) => {
        e.preventDefault();
        const email = form.querySelector('input[type="email"]')?.value;
        const successMsg = form.querySelector('[data-newsletter-success]');
        if (successMsg) {
          successMsg.style.display = 'block';
          form.style.display = 'none';
        }
        // Shopify handles the actual subscription via customer tag
      });
    });
  }

  // ---- Announcement bar dismiss ----
  function initAnnouncementDismiss() {
    const dismissBtn = $('[data-announcement-dismiss]');
    const bar = $('.announcement-bar');
    if (!dismissBtn || !bar) return;
    on(dismissBtn, 'click', () => {
      bar.style.display = 'none';
      sessionStorage.setItem('announcement-dismissed', '1');
    });
    if (sessionStorage.getItem('announcement-dismissed')) {
      bar.style.display = 'none';
    }
  }

  // ---- Init all ----
  document.addEventListener('DOMContentLoaded', () => {
    initHeaderScroll();
    initMobileMenu();
    initSearch();
    initCartDrawer();
    initAddToCart();
    initVariantSelector();
    initProductGallery();
    initProductTabs();
    initFAQ();
    initFilters();
    initNewsletter();
    initAnnouncementDismiss();
  });

})();
