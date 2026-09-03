/**
 * DvgCart E-Commerce - Storefront Logic
 */

document.addEventListener("DOMContentLoaded", () => {
  // Application State
  let products = getProducts();
  let categories = getCategories();
  let activeCategory = "all";
  let currentSort = "featured";
  let appliedPromo = null; // { code: 'VIP10', discountPercent: 10 }
  let directBuyItem = null; // When 1-click 'Buy Now' is triggered
  let cart = JSON.parse(localStorage.getItem("dvgcart_cart")) || [];
  
  // Admin configurations
  let adminPhone = localStorage.getItem("dvgcart_admin_phone") || "919483635095";

  // Elements
  const productsGrid = document.getElementById("products-grid");
  const categoryFilters = document.getElementById("category-filters");
  const catalogSearchInput = document.getElementById("catalog-search");
  const catalogSortSelect = document.getElementById("catalog-sort");
  const clearSearchBtn = document.getElementById("clear-search-btn");
  const catalogResultsCount = document.getElementById("catalog-results-count");
  const headerSearchBtn = document.getElementById("header-search-btn");
  
  // Cart Elements
  const cartTrigger = document.getElementById("cart-trigger");
  const cartClose = document.getElementById("cart-close");
  const cartDrawer = document.getElementById("cart-drawer");
  const cartOverlay = document.getElementById("cart-overlay");
  const cartItemsContainer = document.getElementById("cart-items-container");
  const cartCount = document.getElementById("cart-count");
  const mobileCartCount = document.getElementById("mobile-cart-count");
  const cartDrawerCount = document.getElementById("cart-drawer-count");
  const cartSummaryQty = document.getElementById("cart-summary-qty");
  const cartSummaryTotal = document.getElementById("cart-summary-total");
  const checkoutTrigger = document.getElementById("checkout-trigger");

  // Free Shipping & Promo
  const freeShippingBarFill = document.getElementById("free-shipping-bar-fill");
  const freeShippingText = document.getElementById("free-shipping-text");
  const promoInput = document.getElementById("promo-input");
  const applyPromoBtn = document.getElementById("apply-promo-btn");
  const promoStatusMsg = document.getElementById("promo-status-msg");
  const cartDiscountRow = document.getElementById("cart-discount-row");
  const cartSummaryDiscount = document.getElementById("cart-summary-discount");
  
  // Modals
  const quickViewModal = document.getElementById("quick-view-modal");
  const quickViewClose = document.getElementById("quick-view-close");
  const quickViewContent = document.getElementById("quick-view-content");
  const heroQuickViewBtn = document.getElementById("hero-quickview-btn");
  
  const checkoutModal = document.getElementById("checkout-modal");
  const checkoutClose = document.getElementById("checkout-close");
  const checkoutForm = document.getElementById("checkout-form");
  const checkoutOrderPreview = document.getElementById("checkout-order-preview");
  const copyOrderBtn = document.getElementById("copy-order-btn");
  
  const mainHeader = document.getElementById("main-header");
  const logoDisplayContainer = document.getElementById("logo-display-container");
  const footerCategoriesList = document.getElementById("footer-categories-list");
  const floatingWaBtn = document.getElementById("floating-wa-btn");
  
  // Mobile Navigation Menu Elements
  const mobileMenuTrigger = document.getElementById("mobile-menu-trigger");
  const mobileMenuClose = document.getElementById("mobile-menu-close");
  const mobileMenuDrawer = document.getElementById("mobile-menu-drawer");
  const mobileMenuOverlay = document.getElementById("mobile-menu-overlay");
  const mobileNavLinks = document.querySelectorAll(".mobile-nav-link");

  // Elements - Social Links
  const footerLinkInsta = document.getElementById("footer-link-insta");
  const footerLinkFb = document.getElementById("footer-link-fb");
  const footerLinkYt = document.getElementById("footer-link-yt");
  const footerLinkWa = document.getElementById("footer-link-wa");
  const footerQuickOrderBtn = document.getElementById("footer-quick-order-btn");

  // Initialize
  initLogo();
  initSocialLinks();
  loadSavedCustomerInfo();
  
  const isSupabaseConfigured = typeof db !== "undefined" && db !== null;
  if (!isSupabaseConfigured) {
    renderFilters();
    renderProducts("all");
  }
  
  updateCartUI();
  initHeaderScroll();
  initMobileBottomBar();

  // Social Links Initialization
  function initSocialLinks() {
    if (footerLinkInsta) footerLinkInsta.href = localStorage.getItem("dvgcart_link_insta") || "#";
    if (footerLinkFb) footerLinkFb.href = localStorage.getItem("dvgcart_link_fb") || "#";
    if (footerLinkYt) footerLinkYt.href = localStorage.getItem("dvgcart_link_yt") || "#";
    
    let savedWaLink = localStorage.getItem("dvgcart_link_wa");
    const adminPhoneVal = localStorage.getItem("dvgcart_admin_phone") || adminPhone || "919483635095";
    const sanitizedPhone = adminPhoneVal.replace(/[^0-9]/g, "") || "919483635095";

    // Auto-clean any expired WhatsApp Business shortlink (e.g. LJGKPHIBJALKG1)
    if (savedWaLink && (savedWaLink.includes("LJGK") || savedWaLink.includes("/message/"))) {
      localStorage.removeItem("dvgcart_link_wa");
      savedWaLink = null;
      if (typeof saveCloudSetting === "function") {
        saveCloudSetting("link_wa", "");
      }
    }

    const validFloatingWaUrl = `https://wa.me/${sanitizedPhone}?text=${encodeURIComponent("Hello DvgCart Concierge, I would like VIP assistance with your collection.")}`;

    if (footerLinkWa) footerLinkWa.href = validFloatingWaUrl;
    if (floatingWaBtn) floatingWaBtn.href = validFloatingWaUrl;
    
    const mobTabWa = document.getElementById("mob-tab-wa");
    if (mobTabWa) mobTabWa.href = validFloatingWaUrl;

    const footerPhoneDisplay = document.getElementById("footer-phone-display");
    if (footerPhoneDisplay) {
      footerPhoneDisplay.href = `https://wa.me/${sanitizedPhone}`;
      footerPhoneDisplay.textContent = `+${sanitizedPhone}`;
    }

    if (footerQuickOrderBtn) {
      footerQuickOrderBtn.addEventListener("click", (e) => {
        e.preventDefault();
        openCheckout();
      });
    }
  }

  // Load Saved Client Profile
  function loadSavedCustomerInfo() {
    const savedName = localStorage.getItem("dvgcart_cust_name");
    const savedPhone = localStorage.getItem("dvgcart_cust_phone");
    const savedAddr = localStorage.getItem("dvgcart_cust_address");
    const savedCity = localStorage.getItem("dvgcart_cust_city");
    const savedPin = localStorage.getItem("dvgcart_cust_pincode");

    if (savedName && document.getElementById("cust-name")) document.getElementById("cust-name").value = savedName;
    if (savedPhone && document.getElementById("cust-phone")) document.getElementById("cust-phone").value = savedPhone;
    if (savedAddr && document.getElementById("cust-address")) document.getElementById("cust-address").value = savedAddr;
    if (savedCity && document.getElementById("cust-city")) document.getElementById("cust-city").value = savedCity;
    if (savedPin && document.getElementById("cust-pincode")) document.getElementById("cust-pincode").value = savedPin;
  }

  // Logo Detection and Integration
  function initLogo() {
    const adminLogo = localStorage.getItem("dvgcart_logo");
    const faviconEl = document.getElementById("tab-favicon");
    
    if (adminLogo && logoDisplayContainer) {
      logoDisplayContainer.innerHTML = `
        <img src="${adminLogo}" class="logo-img" alt="DvgCart Logo" onerror="this.style.display='none'; document.getElementById('logo-text-fallback').style.display='flex'">
        <div id="logo-text-fallback" style="display: none; align-items: center; gap: 4px;">
          <div class="logo-icon-fallback">D</div> DVG<span>CART</span>
        </div>
      `;
      if (faviconEl) faviconEl.href = adminLogo;
    } else if (logoDisplayContainer) {
      const img = new Image();
      img.onload = function() {
        logoDisplayContainer.innerHTML = `<img src="logo.png" class="logo-img" alt="DvgCart Logo">`;
        if (faviconEl) faviconEl.href = "logo.png";
      };
      img.onerror = function() {
        const img2 = new Image();
        img2.onload = function() {
          logoDisplayContainer.innerHTML = `<img src="images/logo.png" class="logo-img" alt="DvgCart Logo">`;
          if (faviconEl) faviconEl.href = "images/logo.png";
        };
        img2.onerror = function() {
          // Keep default fallback
        };
        img2.src = "images/logo.png";
      };
      img.src = "logo.png";
    }
  }

  // Header Scroll Effect
  function initHeaderScroll() {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 40) {
        mainHeader.classList.add("scrolled");
      } else {
        mainHeader.classList.remove("scrolled");
      }
    });
  }

  // Render Filters
  function renderFilters() {
    categoryFilters.innerHTML = '<button class="filter-btn active" data-category="all">All Creations</button>';
    footerCategoriesList.innerHTML = '';
    
    categories.forEach(category => {
      const btn = document.createElement("button");
      btn.className = "filter-btn";
      btn.setAttribute("data-category", category);
      btn.textContent = category;
      categoryFilters.appendChild(btn);

      const li = document.createElement("li");
      li.innerHTML = `<a href="#catalog" class="footer-cat-link" data-category="${category}">${category}</a>`;
      footerCategoriesList.appendChild(li);
    });

    document.querySelectorAll(".filter-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
        e.target.classList.add("active");
        renderProducts(e.target.getAttribute("data-category"));
      });
    });

    document.querySelectorAll(".footer-cat-link").forEach(link => {
      link.addEventListener("click", (e) => {
        const cat = e.target.getAttribute("data-category");
        document.querySelectorAll(".filter-btn").forEach(b => {
          if (b.getAttribute("data-category") === cat) {
            b.click();
          }
        });
      });
    });
  }

  // Search and Sort Listeners
  if (catalogSearchInput) {
    catalogSearchInput.addEventListener("input", (e) => {
      if (clearSearchBtn) {
        clearSearchBtn.style.display = e.target.value ? "block" : "none";
      }
      renderProducts();
    });
  }

  if (clearSearchBtn) {
    clearSearchBtn.addEventListener("click", () => {
      catalogSearchInput.value = "";
      clearSearchBtn.style.display = "none";
      renderProducts();
      catalogSearchInput.focus();
    });
  }

  if (catalogSortSelect) {
    catalogSortSelect.addEventListener("change", (e) => {
      currentSort = e.target.value;
      renderProducts();
    });
  }

  if (headerSearchBtn) {
    headerSearchBtn.addEventListener("click", () => {
      if (catalogSearchInput) {
        setTimeout(() => catalogSearchInput.focus(), 300);
      }
    });
  }

  // Render Products Grid
  function renderProducts(filterCategory) {
    if (filterCategory !== undefined) {
      activeCategory = filterCategory;
    }

    productsGrid.innerHTML = "";
    
    // Refresh products in case updated
    try {
      products = getProducts();
      if (!Array.isArray(products)) {
        products = [];
      }
    } catch (e) {
      console.error("Failed to load products from cache:", e);
      products = [];
    }
    
    let filtered = [];
    try {
      filtered = activeCategory === "all" 
        ? products 
        : products.filter(p => p && p.category && String(p.category).toLowerCase() === activeCategory.toLowerCase());
    } catch (e) {
      console.error("Filter category error:", e);
      filtered = products || [];
    }

    const searchTerm = catalogSearchInput ? catalogSearchInput.value.toLowerCase().trim() : "";
    if (searchTerm) {
      filtered = filtered.filter(p => {
        if (!p) return false;
        const titleMatch = p.title ? String(p.title).toLowerCase().includes(searchTerm) : false;
        const descMatch = p.description ? String(p.description).toLowerCase().includes(searchTerm) : false;
        const catMatch = p.category ? String(p.category).toLowerCase().includes(searchTerm) : false;
        const specsMatch = p.specs && Array.isArray(p.specs) 
          ? p.specs.some(spec => spec && String(spec).toLowerCase().includes(searchTerm)) 
          : false;
        return titleMatch || descMatch || catMatch || specsMatch;
      });
    }

    // Apply Sorting
    if (currentSort === "price-low") {
      filtered.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
    } else if (currentSort === "price-high") {
      filtered.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
    } else if (currentSort === "rating") {
      filtered.sort((a, b) => (Number(b.rating) || 4.9) - (Number(a.rating) || 4.9));
    } else if (currentSort === "featured") {
      filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }

    // Update results count indicator
    if (catalogResultsCount) {
      catalogResultsCount.textContent = `Displaying ${filtered.length} masterwork${filtered.length === 1 ? '' : 's'}`;
    }

    if (filtered.length === 0) {
      productsGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: var(--color-text-muted);">
          <p class="serif" style="font-size: 22px; margin-bottom: 10px; color: var(--color-text-light);">No Creations Found</p>
          <p style="font-size: 13px; font-weight: 300; margin-bottom: 20px;">Try refining your search keyword or switching category filter.</p>
          <button class="btn-luxury-outline" id="reset-catalog-filters-btn" style="padding: 10px 24px; font-size: 11px;">View All Creations</button>
        </div>
      `;

      const resetBtn = document.getElementById("reset-catalog-filters-btn");
      if (resetBtn) {
        resetBtn.addEventListener("click", () => {
          if (catalogSearchInput) catalogSearchInput.value = "";
          if (clearSearchBtn) clearSearchBtn.style.display = "none";
          document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
          const allBtn = document.querySelector('.filter-btn[data-category="all"]');
          if (allBtn) allBtn.classList.add("active");
          activeCategory = "all";
          renderProducts();
        });
      }
      return;
    }

    filtered.forEach(product => {
      if (!product) return;
      const card = document.createElement("div");
      card.className = "product-card";
      
      const badgeText = product.badge || (product.featured ? "Exclusive" : "");
      const badgeHTML = badgeText ? `<span class="product-card-badge">${badgeText}</span>` : "";
      
      const priceVal = typeof product.price === "number" ? product.price : parseFloat(product.price) || 0;
      const priceFormatted = priceVal.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

      const ratingVal = product.rating || 4.9;
      const reviewsVal = product.reviewsCount || 120;
      const stock = product.stockLeft !== undefined ? Number(product.stockLeft) : (product.quantity !== undefined ? Number(product.quantity) : 10);
      let stockHTML = "";
      const isOutOfStock = stock <= 0;
      if (isOutOfStock) {
        stockHTML = `<span style="color: #ef4444; font-size: 10px; font-weight: 700; letter-spacing: 0.5px; margin-top: 3px; display: block;">OUT OF STOCK</span>`;
      } else if (stock <= 5) {
        stockHTML = `<span style="color: #ef4444; font-size: 10px; font-weight: 600; letter-spacing: 0.5px; margin-top: 3px; display: block;">✦ Limited Stock: Only ${stock} left</span>`;
      }

      const shopBtnDisabled = isOutOfStock ? "disabled style='opacity: 0.4; cursor: not-allowed; border-color: rgba(255,255,255,0.1); color: #71717a;'" : "";
      const shopBtnText = isOutOfStock ? "SOLD" : "SHOP";

      card.innerHTML = `
        <div class="product-card-img-container quickview-action" data-id="${product.id}">
          ${badgeHTML}
          <img src="${product.image || 'images/bag.png'}" alt="${product.title || 'Product'}" class="product-card-img" onerror="this.src='images/bag.png'">
          <div class="product-card-overlay">
            <button class="action-circle-btn quickview-action" data-id="${product.id}" aria-label="Quick View">
              <svg viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
          </div>
        </div>
        <div class="product-card-info">
          <div class="card-text-block quickview-action" data-id="${product.id}">
            <h3 class="card-product-title">${product.title || 'Masterpiece'}</h3>
            <span class="card-product-price">${priceFormatted}</span>
            ${stockHTML}
          </div>
          <button class="card-direct-shop-btn addcart-direct-action" data-id="${product.id}" aria-label="Add to Bag" ${shopBtnDisabled}>
            <svg viewBox="0 0 24 24">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0"/>
            </svg>
            <span>${shopBtnText}</span>
          </button>
        </div>
      `;

      productsGrid.appendChild(card);
    });

    // Quickview Listeners on Image and Title
    document.querySelectorAll(".quickview-action").forEach(el => {
      el.addEventListener("click", (e) => {
        // Prevent trigger if clicking on action button
        if (e.target.closest(".addcart-direct-action")) return;
        const id = e.currentTarget.getAttribute("data-id");
        openQuickView(id);
      });
    });

    // Direct In-Card "Add to Cart / SHOP" Button
    document.querySelectorAll(".addcart-direct-action").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = e.currentTarget.getAttribute("data-id");
        addToCart(id);
      });
    });
  }

  // Cart Operations
  function addToCart(productId, selectedSize = null, quantity = 1) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const cartItemId = selectedSize ? `${productId}-${selectedSize}` : productId;
    const existingIndex = cart.findIndex(item => item.cartItemId === cartItemId || item.id === cartItemId);
    
    if (existingIndex > -1) {
      cart[existingIndex].quantity += quantity;
    } else {
      cart.push({
        cartItemId: cartItemId,
        id: product.id,
        title: product.title,
        price: product.price,
        image: product.image || (product.images && product.images[0]) || 'images/bag.png',
        selectedSize: selectedSize,
        quantity: quantity
      });
    }

    saveCart();
    updateCartUI();
    showToast(`Added ${product.title} to shopping bag.`);
    openCartDrawer();
  }

  // Instant 1-Click Buy Now
  function triggerDirectBuy(product, selectedSize = null, quantity = 1) {
    const directItem = {
      cartItemId: selectedSize ? `${product.id}-${selectedSize}` : product.id,
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.image || (product.images && product.images[0]) || 'images/bag.png',
      selectedSize: selectedSize,
      quantity: quantity
    };

    openCheckout(directItem);
  }

  function updateCartQty(cartItemId, delta) {
    const item = cart.find(i => (i.cartItemId || i.id) === cartItemId);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }

    saveCart();
    updateCartUI();
  }

  function removeFromCart(cartItemId) {
    const item = cart.find(i => (i.cartItemId || i.id) === cartItemId);
    cart = cart.filter(i => (i.cartItemId || i.id) !== cartItemId);
    saveCart();
    updateCartUI();
    if (item) {
      showToast(`Removed ${item.title} from shopping bag.`);
    }
  }

  function saveCart() {
    localStorage.setItem("dvgcart_cart", JSON.stringify(cart));
  }

  // Update Shopping Bag UI, Free Shipping Meter & Promo
  function updateCartUI() {
    const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    // Animate cart badge
    if (cartCount && cartCount.textContent !== String(totalQty) && totalQty > 0) {
      cartCount.classList.add("cart-bounce-anim");
      setTimeout(() => cartCount.classList.remove("cart-bounce-anim"), 400);
    }

    if (cartCount) cartCount.textContent = totalQty;
    if (mobileCartCount) mobileCartCount.textContent = totalQty;
    if (cartDrawerCount) cartDrawerCount.textContent = `${totalQty} item${totalQty === 1 ? '' : 's'}`;
    if (cartSummaryQty) cartSummaryQty.textContent = totalQty;

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Free Delivery across Davanagere & Harihar
    if (freeShippingText) {
      freeShippingText.innerHTML = `✦ <strong>Complimentary Free Delivery</strong> across Davanagere & Harihar`;
    }
    if (freeShippingBarFill) {
      freeShippingBarFill.style.width = "100%";
    }

    // Promo Voucher Calculation
    let discount = 0;
    if (appliedPromo && appliedPromo.discountPercent) {
      discount = Math.round(subtotal * (appliedPromo.discountPercent / 100));
      if (cartDiscountRow) {
        cartDiscountRow.style.display = "flex";
        if (cartSummaryDiscount) {
          cartSummaryDiscount.textContent = `-₹${discount.toLocaleString('en-IN')} (${appliedPromo.code})`;
        }
      }
    } else if (cartDiscountRow) {
      cartDiscountRow.style.display = "none";
    }

    const grandTotal = Math.max(0, subtotal - discount);
    if (cartSummaryTotal) {
      cartSummaryTotal.textContent = grandTotal.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
    }

    // Render Cart Drawer Items
    if (cartItemsContainer) {
      cartItemsContainer.innerHTML = "";
      if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
          <div class="cart-empty-message">
            <svg viewBox="0 0 24 24"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
            <p class="serif" style="font-size: 20px; color: var(--color-text-light);">Your Shopping Bag is Empty</p>
            <p style="font-size: 13px; font-weight: 300;">Discover our handcrafted masterworks to begin your curation.</p>
            <button class="btn-empty-cart-browse" id="empty-cart-browse-btn">Explore Collection</button>
          </div>
        `;
        if (checkoutTrigger) checkoutTrigger.style.display = "none";

        const browseBtn = document.getElementById("empty-cart-browse-btn");
        if (browseBtn) {
          browseBtn.addEventListener("click", () => {
            closeCartDrawer();
            const catalogSec = document.getElementById("catalog");
            if (catalogSec) catalogSec.scrollIntoView({ behavior: "smooth" });
          });
        }
      } else {
        if (checkoutTrigger) checkoutTrigger.style.display = "flex";
        
        cart.forEach(item => {
          const itemEl = document.createElement("div");
          itemEl.className = "cart-item";
          const itemKey = item.cartItemId || item.id;
          const priceFormatted = (item.price * item.quantity).toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
          const unitPrice = item.price.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
          const sizeBadge = item.selectedSize ? `<span class="cart-item-variant">Size: ${item.selectedSize}</span>` : '';
          
          itemEl.innerHTML = `
            <img src="${item.image}" alt="${item.title}" class="cart-item-img" onerror="this.src='images/bag.png'">
            <div class="cart-item-info">
              <h4 class="cart-item-title">${item.title}</h4>
              ${sizeBadge}
              <span class="cart-item-price">${priceFormatted} <small style="font-size: 11px; color: var(--color-text-muted); font-weight: normal;">(${unitPrice} ea)</small></span>
              <div class="cart-item-quantity-selector">
                <button class="qty-btn dec-qty" data-id="${itemKey}">-</button>
                <span class="qty-value">${item.quantity}</span>
                <button class="qty-btn inc-qty" data-id="${itemKey}">+</button>
              </div>
            </div>
            <button class="cart-item-remove" data-id="${itemKey}" aria-label="Remove Item">&times;</button>
          `;

          cartItemsContainer.appendChild(itemEl);
        });

        // Wire quantity and delete buttons
        document.querySelectorAll(".dec-qty").forEach(btn => {
          btn.addEventListener("click", (e) => {
            updateCartQty(e.target.getAttribute("data-id"), -1);
          });
        });

        document.querySelectorAll(".inc-qty").forEach(btn => {
          btn.addEventListener("click", (e) => {
            updateCartQty(e.target.getAttribute("data-id"), 1);
          });
        });

        document.querySelectorAll(".cart-item-remove").forEach(btn => {
          btn.addEventListener("click", (e) => {
            removeFromCart(e.target.getAttribute("data-id"));
          });
        });
      }
    }
  }

  // Promo Code Engine (Configured dynamically by Admin)
  const clearPromoBtn = document.getElementById("clear-promo-btn");
  if (applyPromoBtn && promoInput) {
    const defaultPromoCode = (localStorage.getItem("dvgcart_promo_code") || "VIP10").toUpperCase().trim();
    promoInput.placeholder = `Promo code (e.g. ${defaultPromoCode})`;

    promoInput.addEventListener("input", () => {
      if (clearPromoBtn) {
        clearPromoBtn.style.display = (promoInput.value.trim().length > 0 || appliedPromo) ? "inline-flex" : "none";
      }
    });

    applyPromoBtn.addEventListener("click", () => {
      const code = promoInput.value.trim().toUpperCase();
      if (!code) return;

      const adminPromoCode = (localStorage.getItem("dvgcart_promo_code") || "VIP10").toUpperCase().trim();
      const adminDiscountPercent = parseInt(localStorage.getItem("dvgcart_promo_discount_percent")) || 10;

      if (code === adminPromoCode) {
        appliedPromo = { code: adminPromoCode, discountPercent: adminDiscountPercent };
        if (promoStatusMsg) {
          promoStatusMsg.className = "promo-status-msg success";
          promoStatusMsg.textContent = `✓ ${adminDiscountPercent}% discount applied (${adminPromoCode})!`;
          promoStatusMsg.style.display = "block";
        }
        if (clearPromoBtn) clearPromoBtn.style.display = "inline-flex";
        showToast(`${adminPromoCode} voucher activated: ${adminDiscountPercent}% off entire order.`);
      } else {
        appliedPromo = null;
        if (promoStatusMsg) {
          promoStatusMsg.className = "promo-status-msg error";
          promoStatusMsg.textContent = `Invalid voucher code. Try '${adminPromoCode}'.`;
          promoStatusMsg.style.display = "block";
        }
        if (clearPromoBtn) clearPromoBtn.style.display = "inline-flex";
      }
      updateCartUI();
    });

    if (clearPromoBtn) {
      clearPromoBtn.addEventListener("click", () => {
        promoInput.value = "";
        appliedPromo = null;
        if (promoStatusMsg) {
          promoStatusMsg.style.display = "none";
          promoStatusMsg.textContent = "";
        }
        clearPromoBtn.style.display = "none";
        updateCartUI();
        showToast("Promo code cleared.");
      });
    }
  }

  // Drawer Toggles
  function openCartDrawer() {
    cartDrawer.classList.add("open");
    cartOverlay.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeCartDrawer() {
    cartDrawer.classList.remove("open");
    cartOverlay.classList.remove("active");
    document.body.style.overflow = "";
  }

  if (cartTrigger) cartTrigger.addEventListener("click", openCartDrawer);
  if (cartClose) cartClose.addEventListener("click", closeCartDrawer);
  if (cartOverlay) cartOverlay.addEventListener("click", closeCartDrawer);

  // Mobile Menu Drawer Toggles
  function openMobileMenu() {
    if (mobileMenuDrawer) mobileMenuDrawer.classList.add("open");
    if (mobileMenuOverlay) mobileMenuOverlay.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeMobileMenu() {
    if (mobileMenuDrawer) mobileMenuDrawer.classList.remove("open");
    if (mobileMenuOverlay) mobileMenuOverlay.classList.remove("active");
    document.body.style.overflow = "";
  }

  if (mobileMenuTrigger) mobileMenuTrigger.addEventListener("click", openMobileMenu);
  if (mobileMenuClose) mobileMenuClose.addEventListener("click", closeMobileMenu);
  if (mobileMenuOverlay) mobileMenuOverlay.addEventListener("click", closeMobileMenu);

  mobileNavLinks.forEach(link => {
    link.addEventListener("click", () => {
      closeMobileMenu();
      mobileNavLinks.forEach(l => l.classList.remove("active"));
      link.classList.add("active");
    });
  });

  // Mobile Sticky Bottom Bar Navigation
  function initMobileBottomBar() {
    const mobTabHome = document.getElementById("mob-tab-home");
    const mobTabCatalog = document.getElementById("mob-tab-catalog");
    const mobTabSearch = document.getElementById("mob-tab-search");
    const mobTabCart = document.getElementById("mob-tab-cart");

    if (mobTabHome) {
      mobTabHome.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }

    if (mobTabCatalog) {
      mobTabCatalog.addEventListener("click", () => {
        const catSec = document.getElementById("catalog");
        if (catSec) catSec.scrollIntoView({ behavior: "smooth" });
      });
    }

    if (mobTabSearch) {
      mobTabSearch.addEventListener("click", () => {
        const catSec = document.getElementById("catalog");
        if (catSec) {
          catSec.scrollIntoView({ behavior: "smooth" });
          if (catalogSearchInput) {
            setTimeout(() => catalogSearchInput.focus(), 400);
          }
        }
      });
    }

    if (mobTabCart) {
      mobTabCart.addEventListener("click", () => {
        openCartDrawer();
      });
    }
  }

  // Dynamic Hero Banner
  function renderHeroBanner() {
    const heroTitleEl = document.querySelector(".hero-title-elegance, .hero-title");
    const heroDescEl = document.querySelector(".hero-desc-elegance, .hero-desc");
    const heroImgEl = document.getElementById("hero-featured-image");

    const heroTitle = localStorage.getItem("dvgcart_hero_title");
    const heroDesc = localStorage.getItem("dvgcart_hero_desc");
    const heroImg = localStorage.getItem("dvgcart_hero_image");

    if (heroTitle && heroTitle !== "The Art of Premium Apparel" && heroTitleEl) {
      heroTitleEl.innerHTML = heroTitle;
    }
    if (heroDesc && !heroDesc.includes("organic cotton tees") && heroDescEl) {
      heroDescEl.textContent = heroDesc;
    }
    if (heroImg && heroImgEl) {
      heroImgEl.src = heroImg;
    }
  }
  renderHeroBanner();

  // Dynamic Announcement & Promo Bar
  function renderAnnouncementBar() {
    const shippingEl = document.getElementById("announcement-shipping-text");
    const promoEl = document.getElementById("announcement-promo-text");
    const customShipping = localStorage.getItem("dvgcart_announcement_shipping") || "COMPLIMENTARY INSURED EXPRESS SHIPPING ON DAVANAGERE & HARIHAR ORDERS";
    const customPromo = localStorage.getItem("dvgcart_announcement_promo");
    const activeCode = localStorage.getItem("dvgcart_promo_code") || "VIP10";
    const activePct = localStorage.getItem("dvgcart_promo_discount_percent") || "10";

    if (shippingEl) shippingEl.textContent = customShipping;
    if (promoEl) {
      if (customPromo) {
        promoEl.innerHTML = customPromo.replace(/([A-Z0-9]{3,})/g, '<strong class="gold-text">$1</strong>');
      } else {
        promoEl.innerHTML = `USE CODE <strong class="gold-text">${activeCode}</strong> FOR ${activePct}% OFF`;
      }
    }
  }
  renderAnnouncementBar();

  // Quick View Modal
  function openQuickView(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    let selectedSize = product.sizes && product.sizes.length > 0 ? product.sizes[0] : null;
    let selectedQuantity = 1;

    const priceFormatted = product.price.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
    const photos = (product.images && product.images.length > 0) ? product.images : [product.image || "images/bag.png"];

    let specsHTML = "";
    if (product.specs && product.specs.length > 0) {
      specsHTML = `
        <h4 class="product-detail-specs-title">Specifications & Caliber</h4>
        <ul class="product-detail-specs-list">
          ${product.specs.map(spec => `<li>${spec}</li>`).join("")}
        </ul>
      `;
    }

    let galleryHTML = "";
    if (photos.length > 1) {
      galleryHTML = `
        <div class="product-detail-gallery-thumbs">
          ${photos.map((imgSrc, index) => `
            <button class="gallery-thumb-btn ${index === 0 ? 'active' : ''}" data-index="${index}" title="View photo ${index + 1}">
              <img src="${imgSrc}" alt="${product.title} photo ${index + 1}" class="gallery-thumb-img" onerror="this.src='images/bag.png'">
            </button>
          `).join("")}
        </div>
      `;
    }

    let sizeSelectorHTML = "";
    if (product.sizes && product.sizes.length > 0) {
      sizeSelectorHTML = `
        <div class="quick-view-sizes">
          <span class="quick-view-sizes-label">Select Size</span>
          <div class="size-chips-row">
            ${product.sizes.map((s, idx) => `
              <button class="size-chip ${idx === 0 ? 'active' : ''}" data-size="${s}">${s}</button>
            `).join("")}
          </div>
        </div>
      `;
    }

    quickViewContent.innerHTML = `
      <div class="product-detail-image-box">
        <img src="${photos[0]}" alt="${product.title}" class="product-detail-img" id="quick-view-main-img" onerror="this.src='images/bag.png'">
        ${galleryHTML}
      </div>
      <div class="product-detail-info-box">
        <span class="product-detail-category">${product.category}</span>
        <h3 class="product-detail-title">${product.title}</h3>
        <span class="product-detail-price">${priceFormatted}</span>
        <p class="product-detail-desc">${product.description}</p>
        ${sizeSelectorHTML}
        
        <div class="quick-view-qty-row">
          <span class="form-label" style="margin-bottom:0;">Quantity:</span>
          <div class="cart-item-quantity-selector">
            <button class="qty-btn" id="qv-dec-qty">-</button>
            <span class="qty-value" id="qv-qty-val">1</span>
            <button class="qty-btn" id="qv-inc-qty">+</button>
          </div>
        </div>

        ${specsHTML}

        <div class="quick-view-btn-group">
          <button class="btn-qv-add" id="qv-add-cart-btn">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0"/></svg>
            <span>Add to Bag</span>
          </button>
          <button class="btn-qv-buy" id="qv-buy-now-btn">
            <span>⚡ Buy Now</span>
          </button>
        </div>
      </div>
    `;

    // Size chip selection
    quickViewContent.querySelectorAll(".size-chip").forEach(chip => {
      chip.addEventListener("click", () => {
        quickViewContent.querySelectorAll(".size-chip").forEach(c => c.classList.remove("active"));
        chip.classList.add("active");
        selectedSize = chip.getAttribute("data-size");
      });
    });

    // Quantity selector
    const qvQtyVal = document.getElementById("qv-qty-val");
    const qvDecBtn = document.getElementById("qv-dec-qty");
    const qvIncBtn = document.getElementById("qv-inc-qty");

    if (qvDecBtn && qvIncBtn && qvQtyVal) {
      qvDecBtn.addEventListener("click", () => {
        if (selectedQuantity > 1) {
          selectedQuantity -= 1;
          qvQtyVal.textContent = selectedQuantity;
        }
      });
      qvIncBtn.addEventListener("click", () => {
        selectedQuantity += 1;
        qvQtyVal.textContent = selectedQuantity;
      });
    }

    // Add to cart from quickview
    const qvAddBtn = document.getElementById("qv-add-cart-btn");
    if (qvAddBtn) {
      qvAddBtn.addEventListener("click", () => {
        addToCart(product.id, selectedSize, selectedQuantity);
        closeQuickView();
      });
    }

    // Direct buy now from quickview
    const qvBuyBtn = document.getElementById("qv-buy-now-btn");
    if (qvBuyBtn) {
      qvBuyBtn.addEventListener("click", () => {
        closeQuickView();
        triggerDirectBuy(product, selectedSize, selectedQuantity);
      });
    }

    // Gallery thumbnails
    if (photos.length > 1) {
      const mainImg = document.getElementById("quick-view-main-img");
      const thumbBtns = quickViewContent.querySelectorAll(".gallery-thumb-btn");
      thumbBtns.forEach(btn => {
        btn.addEventListener("click", () => {
          const idx = parseInt(btn.getAttribute("data-index"), 10);
          if (mainImg && photos[idx]) {
            mainImg.style.opacity = "0.3";
            setTimeout(() => {
              mainImg.src = photos[idx];
              mainImg.style.opacity = "1";
            }, 150);
          }
          thumbBtns.forEach(b => b.classList.remove("active"));
          btn.classList.add("active");
        });
      });
    }

    quickViewModal.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function closeQuickView() {
    quickViewModal.classList.remove("open");
    if (!cartDrawer.classList.contains("open") && !checkoutModal.classList.contains("open")) {
      document.body.style.overflow = "";
    }
  }

  if (quickViewClose) quickViewClose.addEventListener("click", closeQuickView);
  if (quickViewModal) {
    quickViewModal.addEventListener("click", (e) => {
      if (e.target === quickViewModal) closeQuickView();
    });
  }

  // Hero Quickview Trigger
  if (heroQuickViewBtn) {
    heroQuickViewBtn.addEventListener("click", () => {
      const featured = products.find(p => p.featured) || products[0];
      if (featured) openQuickView(featured.id);
    });
  }

  // Render Order Preview inside Checkout Modal
  function renderCheckoutOrderPreview(itemsToCheckout) {
    if (!checkoutOrderPreview) return;

    if (!itemsToCheckout || itemsToCheckout.length === 0) {
      checkoutOrderPreview.innerHTML = `<p style="font-size: 13px; color: var(--color-text-muted); text-align: center;">No acquisitions selected.</p>`;
      return;
    }

    let subtotal = 0;
    let itemsHTML = itemsToCheckout.map(item => {
      const itemTotal = item.price * item.quantity;
      subtotal += itemTotal;
      const sizeTag = item.selectedSize ? ` <span style="color: var(--color-accent);">[${item.selectedSize}]</span>` : '';
      return `
        <div class="checkout-preview-item">
          <span>${item.quantity}x ${item.title}${sizeTag}</span>
          <span style="font-weight: 500;">₹${itemTotal.toLocaleString('en-IN')}</span>
        </div>
      `;
    }).join("");

    let discount = 0;
    let discountRowHTML = "";
    if (appliedPromo && appliedPromo.discountPercent) {
      discount = Math.round(subtotal * (appliedPromo.discountPercent / 100));
      discountRowHTML = `
        <div class="checkout-preview-item" style="color: #a7c957;">
          <span>VIP Discount (${appliedPromo.code})</span>
          <span>-₹${discount.toLocaleString('en-IN')}</span>
        </div>
      `;
    }

    const grandTotal = Math.max(0, subtotal - discount);

    checkoutOrderPreview.innerHTML = `
      <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: var(--color-accent); margin-bottom: 8px; font-weight: 600;">Acquisition Summary (${itemsToCheckout.length} items)</div>
      ${itemsHTML}
      ${discountRowHTML}
      <div class="checkout-preview-item" style="color: var(--color-text-muted);">
        <span>Express Delivery (Davanagere & Harihar)</span>
        <span class="gold-text">Complimentary Free</span>
      </div>
      <div class="checkout-preview-total-row">
        <span>Total Payable:</span>
        <span>₹${grandTotal.toLocaleString('en-IN')}</span>
      </div>
    `;
  }

  // Open Concierge Checkout Modal
  function openCheckout(directItem = null) {
    directBuyItem = directItem;
    const itemsToOrder = directBuyItem ? [directBuyItem] : cart;

    if (itemsToOrder.length === 0) {
      showToast("Your shopping bag is empty. Please select a product.");
      return;
    }

    renderCheckoutOrderPreview(itemsToOrder);
    loadSavedCustomerInfo();

    closeCartDrawer();
    checkoutModal.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function closeCheckout() {
    checkoutModal.classList.remove("open");
    directBuyItem = null;
    document.body.style.overflow = "";
  }

  if (checkoutTrigger) checkoutTrigger.addEventListener("click", () => openCheckout());
  if (checkoutClose) checkoutClose.addEventListener("click", closeCheckout);
  if (checkoutModal) {
    checkoutModal.addEventListener("click", (e) => {
      if (e.target === checkoutModal) closeCheckout();
    });
  }

  // Generate WhatsApp Message Text
  function generateOrderMessageText(name, phone, address, city, pincode, paymentMethod, notes, itemsToOrder) {
    let subtotal = 0;
    let orderId = "ORD-" + Math.floor(1000 + Math.random() * 9000);

    let messageText = `✨ *DVGCART - LUXURY CONCIERGE ORDER* ✨\n`;
    messageText += `*Reference Code:* #${orderId}\n`;
    messageText += `------------------------------------\n\n`;
    
    messageText += `👤 *CLIENT PROFILE:*\n`;
    messageText += `• Name: ${name}\n`;
    messageText += `• WhatsApp Contact: ${phone}\n`;
    messageText += `• Destination: ${address}, ${city} - ${pincode}\n`;
    messageText += `• Payment Preference: ${paymentMethod}\n`;
    if (notes) {
      messageText += `• Bespoke Notes: ${notes}\n`;
    }

    messageText += `\n🛍️ *ACQUISITIONS:*\n`;
    itemsToOrder.forEach(item => {
      const itemTotal = item.price * item.quantity;
      subtotal += itemTotal;
      const sizeInfo = item.selectedSize ? ` [Size: ${item.selectedSize}]` : "";
      messageText += `• ${item.quantity}x ${item.title}${sizeInfo} - ₹${itemTotal.toLocaleString('en-IN')}\n`;
    });

    let discount = 0;
    if (appliedPromo && appliedPromo.discountPercent) {
      discount = Math.round(subtotal * (appliedPromo.discountPercent / 100));
      messageText += `\n🏷️ *VIP Voucher (${appliedPromo.code}):* -₹${discount.toLocaleString('en-IN')}\n`;
    }

    const netPayable = Math.max(0, subtotal - discount);

    messageText += `🚚 *Delivery:* Complimentary Free Delivery (Davanagere & Harihar)\n`;
    messageText += `\n💵 *NET PAYABLE:* ₹${netPayable.toLocaleString('en-IN')}\n`;
    messageText += `------------------------------------\n`;
    messageText += `🚀 Transmitted via DvgCart Storefront Order.`;

    return { messageText, orderId, subtotal, netPayable };
  }

  // Transmit Checkout to WhatsApp
  if (checkoutForm) {
    checkoutForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const name = document.getElementById("cust-name").value.trim();
      const phone = document.getElementById("cust-phone").value.trim();
      const address = document.getElementById("cust-address").value.trim();
      const city = document.getElementById("cust-city").value.trim();
      const pincode = document.getElementById("cust-pincode").value.trim();
      const notes = document.getElementById("cust-notes").value.trim();

      const paymentMethodRadio = document.querySelector('input[name="payment-method"]:checked');
      const paymentMethod = paymentMethodRadio ? paymentMethodRadio.value : "UPI (GPay / PhonePe / Paytm)";

      const shouldRemember = document.getElementById("save-cust-details").checked;
      if (shouldRemember) {
        localStorage.setItem("dvgcart_cust_name", name);
        localStorage.setItem("dvgcart_cust_phone", phone);
        localStorage.setItem("dvgcart_cust_address", address);
        localStorage.setItem("dvgcart_cust_city", city);
        localStorage.setItem("dvgcart_cust_pincode", pincode);
      }

      const itemsToOrder = directBuyItem ? [directBuyItem] : cart;
      if (itemsToOrder.length === 0) {
        showToast("No items selected for order.");
        return;
      }

      const { messageText, orderId, netPayable } = generateOrderMessageText(
        name, phone, address, city, pincode, paymentMethod, notes, itemsToOrder
      );

      const encodedText = encodeURIComponent(messageText);
      adminPhone = localStorage.getItem("dvgcart_admin_phone") || "919483635095";
      const sanitizedPhone = adminPhone.replace(/[^0-9]/g, "");
      const whatsappUrl = `https://wa.me/${sanitizedPhone}?text=${encodedText}`;

      showToast("Connecting with VIP concierge on WhatsApp...", 2000);

      setTimeout(async () => {
        // Build newOrder object
        const newOrder = {
          orderId: orderId,
          clientName: name,
          clientPhone: phone,
          clientAddress: address,
          city: city,
          pincode: pincode,
          paymentMethod: paymentMethod,
          notes: notes,
          items: itemsToOrder,
          subtotal: subtotal || netPayable,
          discount: (subtotal && netPayable) ? Math.max(0, subtotal - netPayable) : 0,
          total: netPayable,
          date: new Date().toLocaleDateString(),
          status: "Transmitted"
        };

        // 1. Save order in LocalStorage
        const orders = JSON.parse(localStorage.getItem("dvgcart_orders")) || [];
        orders.unshift(newOrder);
        localStorage.setItem("dvgcart_orders", JSON.stringify(orders));

        // 2. Save order in Supabase Database 'orders' table
        if (typeof saveCloudOrder === "function") {
          saveCloudOrder(newOrder);
        }

        // 3. Deduct inventory quantities
        let inventoryChanged = false;
        itemsToOrder.forEach(orderItem => {
          const productInCatalog = products.find(p => p.id === orderItem.id);
          if (productInCatalog && typeof productInCatalog.stockLeft === "number") {
            productInCatalog.stockLeft = Math.max(0, productInCatalog.stockLeft - (orderItem.quantity || 1));
            inventoryChanged = true;
          }
        });
        if (inventoryChanged) {
          saveProducts(products);
          if (typeof saveCloudCatalog === "function") {
            saveCloudCatalog(products, categories);
          }
          renderProducts();
        }

        // Open WhatsApp
        window.open(whatsappUrl, "_blank");

        // If not direct buy, reset cart
        if (!directBuyItem) {
          cart = [];
          saveCart();
          updateCartUI();
        }
        
        closeCheckout();
        showToast("Order transmitted successfully. Welcome to DvgCart.", 5000);
      }, 1000);
    });
  }

  // Copy Order Summary Fallback
  if (copyOrderBtn) {
    copyOrderBtn.addEventListener("click", () => {
      const name = document.getElementById("cust-name") ? document.getElementById("cust-name").value.trim() : "Valued Client";
      const phone = document.getElementById("cust-phone") ? document.getElementById("cust-phone").value.trim() : "";
      const address = document.getElementById("cust-address") ? document.getElementById("cust-address").value.trim() : "";
      const city = document.getElementById("cust-city") ? document.getElementById("cust-city").value.trim() : "";
      const pincode = document.getElementById("cust-pincode") ? document.getElementById("cust-pincode").value.trim() : "";
      const notes = document.getElementById("cust-notes") ? document.getElementById("cust-notes").value.trim() : "";
      
      const paymentMethodRadio = document.querySelector('input[name="payment-method"]:checked');
      const paymentMethod = paymentMethodRadio ? paymentMethodRadio.value : "UPI (GPay / PhonePe / Paytm)";

      const itemsToOrder = directBuyItem ? [directBuyItem] : cart;
      if (itemsToOrder.length === 0) {
        showToast("No items to copy.");
        return;
      }

      const { messageText } = generateOrderMessageText(
        name || "Valued Client", phone, address, city, pincode, paymentMethod, notes, itemsToOrder
      );

      if (navigator.clipboard) {
        navigator.clipboard.writeText(messageText).then(() => {
          showToast("📋 Order summary copied to clipboard!");
        }).catch(() => {
          showToast("Could not access clipboard.");
        });
      } else {
        showToast("Clipboard not supported in browser.");
      }
    });
  }

  // Toast System
  function showToast(message, duration = 3500) {
    const toastContainer = document.getElementById("toast-container");
    if (!toastContainer) return;

    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerHTML = `
      <span class="toast-success-icon">✦</span>
      <span>${message}</span>
    `;
    
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateX(50px)";
      setTimeout(() => {
        toast.remove();
      }, 400);
    }, duration);
  }

  // Background Sync from Cloud
  async function performBackgroundSync() {
    const isDbActive = typeof db !== "undefined" && db !== null;
    if (!isDbActive) {
      try {
        const response = await fetch("/api/config");
        if (response.ok) {
          const config = await response.json();
          if (config.url && config.anonKey) {
            window.SUPABASE_CONFIG = config;
            if (typeof supabase !== "undefined") {
              db = supabase.createClient(config.url, config.anonKey);
            }
          }
        }
      } catch (err) {
        console.warn("Vercel serverless environment variables fetch bypassed:", err);
      }
    }

    if (typeof fetchCloudSettings === "function") {
      await fetchCloudSettings();
    }
    
    initLogo();
    initSocialLinks();
    renderHeroBanner();
    renderAnnouncementBar();

    const cloudData = await fetchCloudCatalog();
    if (cloudData && cloudData.products && cloudData.products.length > 0) {
      products = cloudData.products;
      categories = cloudData.categories || getCategories();
      renderFilters();
      renderProducts();
      console.log("Storefront catalog synced from cloud. Products:", products.length);
    } else {
      try {
        products = getProducts();
        categories = getCategories();
      } catch (e) {
        console.error("Cache parsing failed during offline fallback:", e);
      }
      renderFilters();
      renderProducts();
      console.log("Using local catalog fallback. Products:", products.length);
    }
  }
  performBackgroundSync();
});
