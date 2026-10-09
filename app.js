/**
 * CASA TOTAL - E-COMMERCE JAVASCRIPT APPLICATION
 * Official web app for casatotal.com
 * Ferretería, Herramientas, Automotriz, Tanques y Artículos para el Hogar
 */

// Tasa oficial BCV solicitada: Bs 875.65 x 1$
const BCV_RATE = 875.65;

const PRODUCTS = [
  {
    id: 'ct-001',
    name: 'Limpiador Motor Flush 350 ml',
    brand: 'Dr care',
    category: 'Automotriz',
    originalPrice: 99.99,
    price: 99.99,
    image: './assets/prod-motorflush.jpg',
    description: 'Fórmula de limpieza interna profunda para motores a gasolina y diésel. Remueve lodo y barniz en 5 minutos.',
    inStock: true
  },
  {
    id: 'ct-002',
    name: 'Limpiador Motor Flush 350 ml',
    brand: 'Dr care',
    category: 'Automotriz',
    originalPrice: 99.99,
    price: 99.99,
    image: './assets/prod-motorflush.jpg',
    description: 'Fórmula de limpieza interna profunda para motores a gasolina y diésel. Remueve lodo y barniz en 5 minutos.',
    inStock: true
  },
  {
    id: 'ct-003',
    name: 'Limpiador Motor Flush 350 ml',
    brand: 'Dr care',
    category: 'Automotriz',
    originalPrice: 99.99,
    price: 99.99,
    image: './assets/prod-motorflush.jpg',
    description: 'Fórmula de limpieza interna profunda para motores a gasolina y diésel. Remueve lodo y barniz en 5 minutos.',
    inStock: true
  },
  {
    id: 'ct-004',
    name: 'Gato Caimán Hidráulico 2 Ton',
    brand: 'Ingco',
    category: 'Automotriz',
    originalPrice: 95.00,
    price: 79.99,
    image: './assets/cat-automotriz.jpg',
    description: 'Gato hidráulico de taller para vehículos livianos y camionetas, con ruedas giratorias de alta resistencia.',
    inStock: true
  },
  {
    id: 'ct-005',
    name: 'Tanque de Agua Cilíndrico 1000L',
    brand: 'Tanques',
    category: 'Tanques',
    originalPrice: 150.00,
    price: 129.99,
    image: './assets/cat-tanques.jpg',
    description: 'Tanque vertical con protección UV para almacenamiento de agua potable con conexiones de 3/4 pulgada.',
    inStock: true
  },
  {
    id: 'ct-006',
    name: 'Batería de Cocina Antiadherente 5 Pzas',
    brand: 'Truper',
    category: 'Utensilios',
    originalPrice: 65.00,
    price: 52.00, // 20% OFF
    image: './assets/cat-utensilios.jpg',
    description: 'Juego de sartenes y ollas de aluminio prensado con revestimiento antiadherente de 3 capas.',
    inStock: true
  },
  {
    id: 'ct-007',
    name: 'Set de Tornillos y Tarugos 150 Pzas',
    brand: 'Stanley',
    category: 'Fijaciones y Anclaje',
    originalPrice: 14.00,
    price: 9.99,
    image: './assets/banner-ferreteria.jpg',
    description: 'Surtido completo de tornillos autoperforantes, tuercas y ramplug para fijaciones en pared y madera.',
    inStock: true
  },
  {
    id: 'ct-008',
    name: 'Juego de Brocas Mixtas 13 Pzas',
    brand: 'Bosch',
    category: 'Brocas',
    originalPrice: 24.50,
    price: 19.50,
    image: './assets/banner-ferreteria.jpg',
    description: 'Brocas para mampostería, madera y metal con vástago cilíndrico en estuche organizador.',
    inStock: true
  },
  {
    id: 'ct-009',
    name: 'Taladro Percutor 1/2 650W',
    brand: 'Black+Decker',
    category: 'Equipos y herramientas a motor',
    originalPrice: 55.00,
    price: 44.00,
    image: './assets/banner-ferreteria.jpg',
    description: 'Potente motor de 650W con selector de percusión y rotación, velocidad variable reversible.',
    inStock: true
  }
];

const state = {
  cart: [],
  favorites: new Set(),
  activeBrand: 'all',
  activeCategory: 'all',
  currentSlide: 0
};

const app = {
  init() {
    this.loadState();
    this.renderOrangeShelf();
    this.renderSecondaryGrid(PRODUCTS);
    this.setupHeroCarousel();
    this.setupBrandPills();
    this.setupCategoryCards();
    this.setupBottomNav();
    this.setupDrawer();
    this.setupCart();
    this.setupCustomerChat();
    this.setupSearch();
    this.updateCartBadge();
    this.updateFavBadge();
  },

  loadState() {
    try {
      const savedCart = localStorage.getItem('casa_total_cart') || localStorage.getItem('casatotal_cart');
      if (savedCart) state.cart = JSON.parse(savedCart);
      const savedFavs = localStorage.getItem('casatotal_favs');
      if (savedFavs) state.favorites = new Set(JSON.parse(savedFavs));
    } catch (e) {}
  },

  saveState() {
    try {
      localStorage.setItem('casatotal_cart', JSON.stringify(state.cart));
      localStorage.setItem('casa_total_cart', JSON.stringify(state.cart));
      localStorage.setItem('casatotal_favs', JSON.stringify(Array.from(state.favorites)));
    } catch (e) {}
  },

  updateFavBadge() {
    const pill = document.getElementById('favCountPill');
    if (pill) {
      if (state.favorites.size > 0) {
        pill.textContent = state.favorites.size;
        pill.classList.add('show');
      } else {
        pill.classList.remove('show');
      }
    }
  },

  // 1. FORMAT CURRENCY
  formatUsd(amount) {
    return `USD ${amount.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  },

  formatBs(amountUsd) {
    const bs = amountUsd * BCV_RATE;
    return `Bs ${bs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  },

  // 2. RENDER FIRST ORANGE SHELF (Dr Care items from mockup)
  renderOrangeShelf() {
    const container = document.getElementById('orangeShelfContainer');
    if (!container) return;
    container.innerHTML = '';

    const shelfItems = PRODUCTS.slice(0, 3);
    shelfItems.forEach(prod => {
      container.appendChild(this.createProductCard(prod));
    });
  },

  // 3. RENDER SECONDARY PRODUCT GRID
  renderSecondaryGrid(items) {
    const container = document.getElementById('secondaryProductsContainer');
    if (!container) return;
    container.innerHTML = '';

    const displayItems = items.length ? items : PRODUCTS;
    displayItems.forEach(prod => {
      container.appendChild(this.createProductCard(prod));
    });
  },

  // 4. CREATE PRODUCT CARD COMPONENT
  createProductCard(p) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.dataset.id = p.id;

    const isFav = state.favorites.has(p.id);

    card.innerHTML = `
      <button class="product-fav-btn ${isFav ? 'active' : ''}" aria-label="Guardar en favoritos" onclick="app.toggleFavorite('${p.id}', event)">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="${isFav ? '#ef4444' : 'none'}" stroke="currentColor" stroke-width="2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>
      </button>

      <div class="product-img-wrapper" style="cursor: pointer;" onclick="app.openProductModal('${p.id}')">
        <img src="${p.image}" alt="${p.name}" class="product-img">
      </div>

      <span class="product-brand">${p.brand}</span>
      <h4 class="product-title" style="cursor: pointer;" onclick="app.openProductModal('${p.id}')">${p.name}</h4>

      <div class="product-prices" style="cursor: pointer;" onclick="app.openProductModal('${p.id}')">
        <span class="price-original">${this.formatUsd(p.originalPrice)}</span>
        <span class="price-current-usd">${this.formatUsd(p.price)}</span>
        <span class="price-current-bs">${this.formatBs(p.price)}</span>
      </div>

      <div class="product-actions-row">
        <button class="add-cart-btn" onclick="app.addToCart('${p.id}')" title="Agregar al carrito">
          <svg viewBox="0 0 24 24" width="13" height="13"><path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/></svg>
          <span>Agregar</span>
        </button>
        <button class="product-ask-btn" title="Consultar con Asesor Virtual" onclick="app.quickAsk('${p.name}')">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        </button>
      </div>
    `;

    return card;
  },

  // 5. HERO CAROUSEL
  setupHeroCarousel() {
    const slides = document.querySelectorAll('.hero-slide');
    const dots = document.querySelectorAll('.slider-dot');
    if (!slides.length) return;

    const goToSlide = (idx) => {
      slides.forEach(s => s.classList.remove('active'));
      dots.forEach(d => d.classList.remove('active'));
      state.currentSlide = (idx + slides.length) % slides.length;
      slides[state.currentSlide].classList.add('active');
      if (dots[state.currentSlide]) dots[state.currentSlide].classList.add('active');
    };

    dots.forEach((dot, idx) => {
      dot.addEventListener('click', () => goToSlide(idx));
    });

    setInterval(() => {
      goToSlide(state.currentSlide + 1);
    }, 4500);
  },

  // 6. BRAND PILLS FILTER
  setupBrandPills() {
    const pills = document.querySelectorAll('.brand-pill');
    pills.forEach(pill => {
      pill.addEventListener('click', () => {
        pills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        const brand = pill.dataset.brand;
        state.activeBrand = brand;

        if (brand === 'all') {
          this.renderSecondaryGrid(PRODUCTS);
          document.getElementById('shelfActiveBrandTitle').textContent = 'Catálogo Destacado Casa Total';
        } else {
          const filtered = PRODUCTS.filter(p => p.brand.toLowerCase() === brand.toLowerCase());
          this.renderSecondaryGrid(filtered);
          document.getElementById('shelfActiveBrandTitle').textContent = `Productos ${brand} en Casa Total`;
        }
      });
    });
  },

  // 7. CATEGORY SELECTOR CARDS (Updates Solid Orange Shelf & Tabs)
  setupCategoryCards() {
    const cards = document.querySelectorAll('.category-select-card');
    const dots = document.querySelectorAll('.cat-dot');

    cards.forEach((card, idx) => {
      card.addEventListener('click', () => {
        cards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');

        // Update dots
        dots.forEach((d, dIdx) => d.classList.toggle('active', dIdx === (idx % dots.length)));

        const cat = card.dataset.category;
        state.activeCategory = cat;

        // Filter products for the solid orange shelf
        const shelfContainer = document.getElementById('orangeShelfContainer');
        const shelfTitle = document.getElementById('shelfActiveCategoryTitle');
        if (shelfContainer) {
          shelfContainer.innerHTML = '';
          const filtered = PRODUCTS.filter(p => p.category.toLowerCase().includes(cat.toLowerCase()));
          const itemsToDisplay = filtered.length >= 3 ? filtered.slice(0, 3) : PRODUCTS.slice(0, 3);
          itemsToDisplay.forEach(p => shelfContainer.appendChild(this.createProductCard(p)));
        }
        if (shelfTitle) {
          shelfTitle.textContent = `Productos Destacados ${cat}`;
        }

        // Also update secondary grid
        const secondary = PRODUCTS.filter(p => p.category.toLowerCase().includes(cat.toLowerCase()));
        this.renderSecondaryGrid(secondary.length ? secondary : PRODUCTS);
        const titleEl = document.getElementById('shelfActiveBrandTitle');
        if (titleEl) titleEl.textContent = `Catálogo: ${cat}`;

        this.showToast(`Mostrando categoría: ${cat}`);
      });
    });
  },

  // 8. BOTTOM NAVIGATION ACTIONS (Black Stadium Capsule with Orange Elevated Home)
  setupBottomNav() {
    const navItems = document.querySelectorAll('.bottom-nav-bar .nav-item');
    const navChat = document.getElementById('navChat');
    const navDestacados = document.getElementById('navDestacados');
    const navHome = document.getElementById('navHome');
    const navFavoritos = document.getElementById('navFavoritos');
    const navOfertas = document.getElementById('navOfertas');

    const setActive = (target) => {
      navItems.forEach(n => n.classList.remove('active'));
      if (target) target.classList.add('active');
    };

    if (navHome) {
      navHome.addEventListener('click', () => {
        setActive(navHome);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        this.showToast('Inicio - Casa Total');
      });
    }

    if (navChat) {
      navChat.addEventListener('click', () => {
        setActive(navChat);
        this.openChat();
      });
    }

    if (navDestacados) {
      navDestacados.addEventListener('click', () => {
        setActive(navDestacados);
        this.scrollToProducts();
        this.showToast('Vitrina de Productos Destacados');
      });
    }

    if (navFavoritos) {
      navFavoritos.addEventListener('click', () => {
        setActive(navFavoritos);
        if (state.favorites.size === 0) {
          this.showToast('No tienes favoritos aún. ¡Toca el corazón en cualquier producto!');
        } else {
          const favs = PRODUCTS.filter(p => state.favorites.has(p.id));
          this.renderSecondaryGrid(favs);
          document.getElementById('shelfActiveBrandTitle').textContent = `Tus Favoritos (${favs.length})`;
          this.scrollToProducts();
        }
      });
    }

    if (navOfertas) {
      navOfertas.addEventListener('click', () => {
        setActive(navOfertas);
        const promos = PRODUCTS.filter(p => p.originalPrice > p.price);
        this.renderSecondaryGrid(promos);
        document.getElementById('shelfActiveBrandTitle').textContent = 'Grandes Ofertas y Descuentos Casa Total';
        this.showToast('20% OFF en Utensilios y Descuentos Especiales');
        this.scrollToProducts();
      });
    }
  },

  // 9. SIDE DRAWER (DEPARTAMENTOS ACCORDION CON SUBCATEGORÍAS)
  setupDrawer() {
    const openBtn = document.getElementById('openDrawerBtn');
    const closeBtn = document.getElementById('closeDrawerBtn');
    const drawer = document.getElementById('departmentsDrawer');
    const overlay = document.getElementById('drawerOverlay');

    const openDrawer = () => {
      drawer.classList.add('open');
      overlay.classList.add('active');
    };

    const closeDrawer = () => {
      drawer.classList.remove('open');
      overlay.classList.remove('active');
    };

    if (openBtn) openBtn.addEventListener('click', openDrawer);
    if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
    if (overlay) overlay.addEventListener('click', closeDrawer);

    // Accordion setup with auto-collapse matching Mundo Total
    const accordionItems = document.querySelectorAll('.accordion-item');
    accordionItems.forEach(item => {
      const trigger = item.querySelector('.accordion-trigger');
      const panel = item.querySelector('.accordion-panel');

      if (trigger && panel) {
        trigger.addEventListener('click', () => {
          const isCurrentlyExpanded = item.classList.contains('expanded');

          // Collapse other accordion items
          accordionItems.forEach(otherItem => {
            otherItem.classList.remove('expanded');
            const otherPanel = otherItem.querySelector('.accordion-panel');
            if (otherPanel) otherPanel.style.maxHeight = '0';
          });

          // If was closed, expand it
          if (!isCurrentlyExpanded) {
            item.classList.add('expanded');
            panel.style.maxHeight = panel.scrollHeight + 'px';
          }
        });
      }
    });

    // Subcategory item click inside drawer
    document.querySelectorAll('.subcat-item').forEach(subItem => {
      subItem.addEventListener('click', () => {
        const subcat = subItem.dataset.subcat || subItem.textContent.trim();
        closeDrawer();

        const filtered = PRODUCTS.filter(p =>
          p.name.toLowerCase().includes(subcat.toLowerCase()) ||
          p.category.toLowerCase().includes(subcat.toLowerCase())
        );

        this.renderSecondaryGrid(filtered.length ? filtered : PRODUCTS);
        const titleEl = document.getElementById('shelfActiveBrandTitle');
        if (titleEl) titleEl.textContent = `Subcategoría: ${subcat}`;
        this.scrollToProducts();
        this.showToast(`Cargando: ${subcat}`);
      });
    });
  },

  // 10. SHOPPING CART FUNCTIONALITY
  setupCart() {
    const openCartBtn = document.getElementById('openCartBtn');
    const closeCartBtn = document.getElementById('closeCartBtn');
    const cartModal = document.getElementById('cartFlyout');
    const backdrop = document.getElementById('cartBackdrop');
    const checkoutBtn = document.getElementById('checkoutBtn');
    const whatsappBtn = document.getElementById('whatsappOrderBtn');

    const openCart = () => {
      this.updateCartUi();
      cartModal.classList.add('open');
      backdrop.classList.add('active');
    };

    const closeCart = () => {
      cartModal.classList.remove('open');
      backdrop.classList.remove('active');
    };

    if (openCartBtn) openCartBtn.addEventListener('click', openCart);
    if (closeCartBtn) closeCartBtn.addEventListener('click', closeCart);
    if (backdrop) backdrop.addEventListener('click', closeCart);

    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', () => {
        if (state.cart.length === 0) {
          this.showToast('El carrito está vacío. Agrega productos para pagar.');
          return;
        }
        this.saveState();
        window.location.href = 'checkout.html';
      });
    }

    const closeCheckoutBtn = document.getElementById('closeCheckoutBtn');
    const checkoutBackdrop = document.getElementById('checkoutModalBackdrop');
    if (closeCheckoutBtn) closeCheckoutBtn.addEventListener('click', () => this.closeCheckoutModal());
    if (checkoutBackdrop) checkoutBackdrop.addEventListener('click', () => this.closeCheckoutModal());

    const closeDetailBtn = document.getElementById('closeDetailBtn');
    const productBackdrop = document.getElementById('productModalBackdrop');
    if (closeDetailBtn) closeDetailBtn.addEventListener('click', () => this.closeProductModal());
    if (productBackdrop) productBackdrop.addEventListener('click', () => this.closeProductModal());

    if (whatsappBtn) {
      whatsappBtn.addEventListener('click', () => {
        if (state.cart.length === 0) {
          this.showToast('El carrito está vacío');
          return;
        }
        let msg = '¡Hola Casa Total! 🛠️ Deseo realizar el siguiente pedido desde casatotal.com:\n\n';
        let total = 0;
        state.cart.forEach(item => {
          const sub = item.product.price * item.quantity;
          total += sub;
          msg += `• ${item.quantity}x ${item.product.name} (${item.product.brand}) - USD ${sub.toFixed(2)}\n`;
        });
        const totalBs = total * BCV_RATE;
        msg += `\n*TOTAL:* USD ${total.toFixed(2)} (Aprox. Bs ${totalBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })})\n`;
        msg += '\n¿Me podrían confirmar disponibilidad y cuenta bancaria/pago móvil?';

        const url = `https://wa.me/584120000000?text=${encodeURIComponent(msg)}`;
        window.open(url, '_blank');
      });
    }
  },

  // 10b. PRODUCT DETAIL MODAL
  openProductModal(productId) {
    const prod = PRODUCTS.find(p => p.id === productId);
    if (!prod) return;

    const modal = document.getElementById('productDetailModal');
    const backdrop = document.getElementById('productModalBackdrop');
    const body = document.getElementById('detailModalBody');
    if (!modal || !body) return;

    const bsPrice = this.formatBs(prod.price);
    const usdPrice = this.formatUsd(prod.price);


    body.innerHTML = `
      <div class="detail-image-box">
        <img src="${prod.image}" alt="${prod.name}">
      </div>
      <span class="detail-brand-badge">${prod.brand} • ${prod.category}</span>
      <h3 class="detail-title">${prod.name}</h3>

      <div class="detail-price-box">
        <div class="detail-price-usd">${usdPrice}</div>
        <div class="detail-price-bs">Aprox. ${bsPrice} (Tasa BCV)</div>
      </div>

      <p class="detail-desc">${prod.description}</p>

      <div class="detail-specs-list">
        <div><strong>Disponibilidad:</strong> En inventario para entrega inmediata</div>
        <div><strong>Garantía:</strong> Garantía Directa Casa Total</div>
        <div><strong>Envíos:</strong> Nacionales por MRW, Zoom, Tealca o retiro en tienda</div>
      </div>

      <div class="detail-actions">
        <div class="detail-actions-primary">
          <button class="detail-add-cart-btn" onclick="app.addToCart('${prod.id}'); app.closeProductModal();">
            🛒 Agregar al Carrito
          </button>
          <button class="detail-add-cart-btn" style="background:#16a34a;" onclick="app.addToCart('${prod.id}'); app.saveState(); window.location.href='checkout.html';">
            ⚡ Comprar Ahora
          </button>
        </div>
        <div class="detail-actions-secondary">
          <button class="detail-contact-btn whatsapp" onclick="window.open('https://wa.me/584120000000?text=' + encodeURIComponent('Hola Casa Total, deseo consultar sobre: ${prod.name} (${usdPrice})'), '_blank')">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m4.52 11.66c-.19-.09-1.11-.55-1.28-.61-.17-.07-.3-.1-.43.1-.13.19-.5 0.61-.61.73-.11.13-.23.15-.42.05-.19-.09-.81-.3-1.54-.95-.57-.51-.95-1.14-1.06-1.33-.11-.19-.01-.3.08-.39.09-.09.19-.23.29-.35.09-.11.13-.19.19-.32.06-.13.03-.25-.01-.34-.05-.09-.43-1.04-.59-1.42-.16-.38-.32-.33-.44-.33h-.37c-.13 0-.34.05-.52.24-.18.19-.69.67-.69 1.64 0 .97.71 1.9 1.01 2.1.3.2 1.4 2.14 3.39 3 1.99.85 1.99.57 2.35.53.36-.04 1.15-.47 1.31-.93.16-.46.16-.86.11-.93-.05-.07-.18-.12-.37-.21z"/></svg>
            WhatsApp
          </button>
          <button class="detail-contact-btn asesor" onclick="app.closeProductModal(); app.quickAsk('${prod.name}');">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            Asesor Virtual
          </button>
        </div>
      </div>
    `;

    modal.classList.add('open');
    if (backdrop) backdrop.classList.add('active');
  },

  closeProductModal() {
    const modal = document.getElementById('productDetailModal');
    const backdrop = document.getElementById('productModalBackdrop');
    if (modal) modal.classList.remove('open');
    if (backdrop) backdrop.classList.remove('active');
  },

  // 10c. CHECKOUT FLOW MODAL
  openCheckoutModal() {
    if (state.cart.length === 0) {
      this.showToast('El carrito está vacío');
      return;
    }

    const modal = document.getElementById('checkoutModal');
    const backdrop = document.getElementById('checkoutModalBackdrop');
    const content = document.getElementById('checkoutModalContent');
    const cartModal = document.getElementById('cartFlyout');
    const cartBackdrop = document.getElementById('cartBackdrop');

    if (cartModal) cartModal.classList.remove('open');
    if (cartBackdrop) cartBackdrop.classList.remove('active');

    let totalUsd = 0;
    let itemsHtml = '';
    state.cart.forEach(item => {
      const line = item.product.price * item.quantity;
      totalUsd += line;
      itemsHtml += `
        <div class="order-summary-row">
          <span>${item.quantity}x ${item.product.name}</span>
          <strong>${this.formatUsd(line)}</strong>
        </div>
      `;
    });

    content.innerHTML = `
      <form id="checkoutForm" onsubmit="app.processOrder(event)">
        <div class="order-summary-box">
          <h4 style="font-size:13px; font-weight:800; margin-bottom:8px; color:#111827;">Resumen de tu compra</h4>
          ${itemsHtml}
          <div class="order-summary-row total">
            <span>Total a Pagar:</span>
            <span>${this.formatUsd(totalUsd)} (${this.formatBs(totalUsd)})</span>
          </div>
        </div>

        <div class="checkout-form-group">
          <label>Nombre y Apellido *</label>
          <input type="text" id="orderName" class="checkout-input" required placeholder="Ej. Carlos Pérez">
        </div>

        <div class="checkout-form-group">
          <label>Teléfono / WhatsApp *</label>
          <input type="tel" id="orderPhone" class="checkout-input" required placeholder="Ej. 0412-1234567">
        </div>

        <div class="checkout-form-group">
          <label>Ciudad y Dirección de Entrega *</label>
          <input type="text" id="orderAddress" class="checkout-input" required placeholder="Ej. Valencia, Av. Bolívar Norte">
        </div>

        <div class="checkout-form-group">
          <label>Método de Pago Preferido *</label>
          <div class="payment-method-selector" id="paymentSelector">
            <button type="button" class="payment-method-btn active" onclick="app.selectPaymentMethod(this, 'Pago Móvil')">📲 Pago Móvil</button>
            <button type="button" class="payment-method-btn" onclick="app.selectPaymentMethod(this, 'Zelle')">💵 Zelle</button>
            <button type="button" class="payment-method-btn" onclick="app.selectPaymentMethod(this, 'Efectivo')">🤝 Efectivo Tienda</button>
          </div>
        </div>

        <button type="submit" class="submit-order-btn">
          Confirmar y Procesar Pedido
        </button>
      </form>
    `;

    modal.classList.add('open');
    if (backdrop) backdrop.classList.add('active');
  },

  selectPaymentMethod(btn, method) {
    document.querySelectorAll('#paymentSelector .payment-method-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.selectedPaymentMethod = method;
  },

  processOrder(e) {
    e.preventDefault();
    const name = document.getElementById('orderName').value.trim();
    const phone = document.getElementById('orderPhone').value.trim();
    const address = document.getElementById('orderAddress').value.trim();
    const payment = state.selectedPaymentMethod || 'Pago Móvil';

    const orderId = `CT-${Math.floor(10000 + Math.random() * 90000)}`;

    let totalUsd = 0;
    let itemsText = '';
    state.cart.forEach(item => {
      const line = item.product.price * item.quantity;
      totalUsd += line;
      itemsText += `• ${item.quantity}x ${item.product.name} (${this.formatUsd(line)})\n`;
    });

    const waMsg = `¡Hola Casa Total! 🛠️ He confirmado el pedido #${orderId} en casatotal.com:

*Cliente:* ${name}
*Teléfono:* ${phone}
*Dirección:* ${address}
*Pago:* ${payment}

*Productos:*
${itemsText}
*TOTAL:* USD ${totalUsd.toFixed(2)} (${this.formatBs(totalUsd)})

Por favor confírmenme los datos de pago y número de guía.`;

    const content = document.getElementById('checkoutModalContent');
    content.innerHTML = `
      <div class="order-success-screen">
        <div class="success-badge-icon">✓</div>
        <h3 style="font-size:20px; font-weight:900; color:#111827; margin-bottom:6px;">¡Pedido Confirmado!</h3>
        <p style="font-size:13px; color:#4b5563; margin-bottom:12px;">Tu número de orden es: <strong style="color:var(--primary-orange);">${orderId}</strong></p>
        
        <div style="background:#f8fafc; border-radius:14px; padding:12px; margin-bottom:16px; text-align:left; font-size:12.5px; color:#334155;">
          <p><strong>Cliente:</strong> ${name}</p>
          <p><strong>Teléfono:</strong> ${phone}</p>
          <p><strong>Destino:</strong> ${address}</p>
          <p><strong>Método de pago:</strong> ${payment}</p>
          <p style="margin-top:6px; font-weight:800; color:var(--primary-orange);">Total: ${this.formatUsd(totalUsd)} (${this.formatBs(totalUsd)})</p>
        </div>

        <a href="https://wa.me/584120000000?text=${encodeURIComponent(waMsg)}" target="_blank" class="submit-order-btn" style="display:inline-block; text-decoration:none; margin-bottom:10px; background:#25d366;">
          Enviar Comprobante por WhatsApp 📲
        </a>

        <button type="button" onclick="app.closeCheckoutModal()" style="background:#f1f5f9; border:none; padding:10px 18px; border-radius:20px; font-weight:700; color:#475569; cursor:pointer;">
          Seguir Comprando
        </button>
      </div>
    `;

    // Clear cart
    state.cart = [];
    this.updateCartBadge();
    this.saveState();
  },

  closeCheckoutModal() {
    const modal = document.getElementById('checkoutModal');
    const backdrop = document.getElementById('checkoutModalBackdrop');
    if (modal) modal.classList.remove('open');
    if (backdrop) backdrop.classList.remove('active');
  },

  addToCart(productId) {
    const prod = PRODUCTS.find(p => p.id === productId);
    if (!prod) return;

    const existing = state.cart.find(item => item.product.id === productId);
    if (existing) {
      existing.quantity += 1;
    } else {
      state.cart.push({ product: prod, quantity: 1 });
    }

    this.updateCartBadge();
    this.saveState();
    this.showToast(`Agregado: ${prod.name}`);
  },

  changeQuantity(productId, delta) {
    const item = state.cart.find(i => i.product.id === productId);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
      state.cart = state.cart.filter(i => i.product.id !== productId);
    }

    this.updateCartBadge();
    this.saveState();
    this.updateCartUi();
  },

  updateCartBadge() {
    const badge = document.getElementById('cartCountBadge');
    if (!badge) return;
    const totalCount = state.cart.reduce((sum, item) => sum + item.quantity, 0);
    badge.textContent = totalCount;
  },

  updateCartUi() {
    const container = document.getElementById('cartItemsContainer');
    const subtotalUsd = document.getElementById('cartSubtotalUsd');
    const subtotalBs = document.getElementById('cartSubtotalBs');
    if (!container) return;

    if (state.cart.length === 0) {
      container.innerHTML = `
        <div class="cart-empty-state">
          <p>Tu carrito está vacío.</p>
          <p style="font-size:12px; margin-top:4px;">Explora herramientas y productos de ferretería en Casa Total.</p>
        </div>
      `;
      if (subtotalUsd) subtotalUsd.textContent = 'USD 0,00';
      if (subtotalBs) subtotalBs.textContent = 'Bs 0,00';
      return;
    }

    container.innerHTML = '';
    let totalUsd = 0;

    state.cart.forEach(item => {
      const lineTotal = item.product.price * item.quantity;
      totalUsd += lineTotal;

      const row = document.createElement('div');
      row.className = 'cart-item-row';
      row.innerHTML = `
        <img src="${item.product.image}" alt="${item.product.name}" class="cart-item-img">
        <div class="cart-item-info">
          <h5 class="cart-item-title">${item.product.name}</h5>
          <span class="cart-item-price">${this.formatUsd(lineTotal)}</span>
          <div class="cart-qty-ctrl">
            <button class="qty-btn" onclick="app.changeQuantity('${item.product.id}', -1)">-</button>
            <span style="font-size:13px; font-weight:700;">${item.quantity}</span>
            <button class="qty-btn" onclick="app.changeQuantity('${item.product.id}', 1)">+</button>
          </div>
        </div>
      `;
      container.appendChild(row);
    });

    if (subtotalUsd) subtotalUsd.textContent = this.formatUsd(totalUsd);
    if (subtotalBs) subtotalBs.textContent = this.formatBs(totalUsd);
  },

  // 11. FAVORITES TOGGLE
  toggleFavorite(productId, event) {
    if (event) event.stopPropagation();
    const btn = event ? event.currentTarget : null;

    if (state.favorites.has(productId)) {
      state.favorites.delete(productId);
      if (btn) btn.classList.remove('active');
      this.showToast('Eliminado de favoritos');
    } else {
      state.favorites.add(productId);
      if (btn) btn.classList.add('active');
      this.showToast('Guardado en favoritos');
    }

    const pill = document.getElementById('favCountPill');
    if (pill) {
      if (state.favorites.size > 0) {
        pill.textContent = state.favorites.size;
        pill.classList.add('show');
      } else {
        pill.classList.remove('show');
      }
    }
    this.saveState();
  },

  // 12. CUSTOMER CHAT ADVISOR
  setupCustomerChat() {
    const closeBtn = document.getElementById('closeChatBtn');
    const backdrop = document.getElementById('chatModalBackdrop');
    const form = document.getElementById('chatForm');
    const input = document.getElementById('chatInput');

    if (closeBtn) closeBtn.addEventListener('click', () => this.closeChat());
    if (backdrop) backdrop.addEventListener('click', () => this.closeChat());

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = input.value.trim();
        if (!text) return;
        this.appendChatMessage(text, 'user');
        input.value = '';
        setTimeout(() => {
          this.appendChatMessage('Gracias por contactarnos. Un asesor de Casa Total te responderá en breve. También puedes escribirnos directo por WhatsApp para atención inmediata.', 'bot');
        }, 800);
      });
    }
  },

  openChat() {
    const modal = document.getElementById('chatAdvisorModal');
    const backdrop = document.getElementById('chatModalBackdrop');
    if (modal) modal.classList.add('open');
    if (backdrop) backdrop.classList.add('active');
  },

  closeChat() {
    const modal = document.getElementById('chatAdvisorModal');
    const backdrop = document.getElementById('chatModalBackdrop');
    if (modal) modal.classList.remove('open');
    if (backdrop) backdrop.classList.remove('active');
  },

  sendQuickReply(text) {
    this.appendChatMessage(text, 'user');
    setTimeout(() => {
      if (text.includes('Motor Flush')) {
        this.appendChatMessage('¡Sí! Tenemos disponibilidad inmediata de Limpiador Motor Flush Dr Care de 350 ml a USD 99,99 con despacho inmediato.', 'bot');
      } else if (text.includes('envíos')) {
        this.appendChatMessage('Realizamos envíos a todo el territorio nacional a través de MRW, Zoom, Tealca y fletes para tanques y maquinaria pesada.', 'bot');
      } else if (text.includes('pago')) {
        this.appendChatMessage('Aceptamos Pago Móvil, Transferencia en Bs. a tasa BCV, Zelle, Binance Pay y efectivo en tiendas.', 'bot');
      } else {
        this.appendChatMessage('📲 Conéctate con un asesor en WhatsApp aquí: <a href="https://wa.me/584120000000" target="_blank" style="color:#FF5B00;font-weight:700;">Abrir WhatsApp Casa Total</a>', 'bot');
      }
    }, 700);
  },

  quickAsk(productName) {
    this.openChat();
    this.sendQuickReply(`Hola, deseo consultar disponibilidad y precio de: ${productName}`);
  },

  appendChatMessage(text, sender) {
    const container = document.getElementById('chatMessages');
    if (!container) return;
    const msg = document.createElement('div');
    msg.className = `chat-msg ${sender}`;
    msg.innerHTML = text;
    container.appendChild(msg);
    container.scrollTop = container.scrollHeight;
  },

  // 13. SEARCH
  setupSearch() {
    const searchForm = document.getElementById('searchForm');
    const searchInput = document.getElementById('searchInput');
    const drawerForm = document.getElementById('drawerSearchForm');
    const drawerInput = document.getElementById('drawerSearchInput');

    const handleSearch = (query) => {
      const q = query.toLowerCase().trim();
      if (!q) {
        this.renderSecondaryGrid(PRODUCTS);
        return;
      }
      const filtered = PRODUCTS.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
      this.renderSecondaryGrid(filtered);
      document.getElementById('shelfActiveBrandTitle').textContent = `Resultados para: "${query}" (${filtered.length})`;
      this.scrollToProducts();
    };

    if (searchForm) {
      searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        handleSearch(searchInput.value);
      });
    }
    if (searchInput) {
      searchInput.addEventListener('input', (e) => handleSearch(e.target.value));
    }

    if (drawerForm) {
      drawerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        document.getElementById('departmentsDrawer').classList.remove('open');
        document.getElementById('drawerOverlay').classList.remove('active');
        handleSearch(drawerInput.value);
      });
    }
    if (drawerInput) {
      drawerInput.addEventListener('input', (e) => handleSearch(e.target.value));
    }
  },

  scrollToProducts() {
    const target = document.getElementById('orangeShelfContainer') || document.getElementById('secondaryProductsContainer');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  },

  showToast(message) {
    const toast = document.getElementById('toastNotification');
    const msgEl = document.getElementById('toastMessage');
    if (!toast || !msgEl) return;
    msgEl.textContent = message;
    toast.classList.add('show');
    clearTimeout(this._toastTimeout);
    this._toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  }
};

document.addEventListener('DOMContentLoaded', () => {
  app.init();
});
