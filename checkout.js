/**
 * CASA TOTAL - Mobile App Checkout Controller
 * App-First Flow:
 * Step 1: Entrega (Delivery $5, Retiro $0, Envío $20) + Pago Inmediato (Datos bancarios y montos)
 * Step 2: Reporte del Pago (Subir comprobante, ref) + Destino de entrega + Datos del cliente
 * Step 3: Confirmación de Orden + Envío por WhatsApp / Asesor
 */

// Official BCV exchange rate requested: Bs 875.65 x 1$
const BCV_RATE = 875.65;

// Official Banking Data for Casa Total Ferretería
const BANK_DATA = {
  pagomovil: {
    bank: "Banco Nacional de Crédito (BNC) - 0191",
    phone: "0414-9876543",
    rif: "J-50182934-1",
    titular: "Casa Total Ferretería y Hogar C.A."
  },
  transferencia: {
    bank: "Banesco Banco Universal - 0134",
    account: "0134-0842-99-0004567890",
    rif: "J-50182934-1",
    titular: "Casa Total Ferretería y Hogar C.A.",
    type: "Cuenta Corriente"
  }
};

const checkoutApp = {
  cart: [],
  currentStep: 1,
  selectedDelivery: 'delivery',
  deliveryFee: 5.00, // $5 Delivery, $0 Retiro, $20 Envío
  selectedPayment: 'pagomovil',
  uploadedProof: null,
  cashDenom: 'Monto Exacto',
  posCard: 'Débito Nacional',
  confirmedOrder: null,
  accordionOpen: false,

  init() {
    this.loadCart();
    this.selectDeliveryMethod('delivery');
    this.renderAccordionCart();
    this.updateTimelineUI();
  },

  // 1. LOAD CART OR DEMO PRODUCT
  loadCart() {
    try {
      const stored = localStorage.getItem('casa_total_cart') || localStorage.getItem('casatotal_cart');
      if (stored) {
        this.cart = JSON.parse(stored);
      }
    } catch (e) {
      console.warn("Could not read cart:", e);
    }

    if (!this.cart || this.cart.length === 0) {
      this.cart = [
        {
          product: {
            id: "ct-001",
            name: "Limpiador Motor Flush 350 ml Dr Care",
            price: 99.99,
            image: "./assets/prod-motorflush.jpg"
          },
          quantity: 1
        }
      ];
    }
  },

  getItemProps(item) {
    if (item.product) {
      return {
        id: item.product.id,
        title: item.product.name,
        price: item.product.price,
        image: item.product.image,
        quantity: item.quantity || 1
      };
    }
    return {
      id: item.id,
      title: item.title || item.name,
      price: item.price,
      image: item.image,
      quantity: item.quantity || 1
    };
  },

  // 2. TOGGLE CART ACCORDION
  toggleSummaryAccordion() {
    this.accordionOpen = !this.accordionOpen;
    const drawer = document.getElementById('accordionDrawer');
    if (drawer) {
      drawer.classList.toggle('open', this.accordionOpen);
    }
  },

  // 3. STEP 1: DELIVERY SELECTION ($5 Delivery, $0 Retiro, $20 Envío)
  selectDeliveryMethod(type) {
    this.selectedDelivery = type;

    // Delivery costs exactly as specified
    if (type === 'delivery') {
      this.deliveryFee = 5.00; // $5 delivery
    } else if (type === 'retiro') {
      this.deliveryFee = 0.00; // Retiro en almacén: gratis
    } else if (type === 'envio') {
      this.deliveryFee = 20.00; // $20 envío nacional MRW/Zoom
    }

    // Toggle card selection
    document.getElementById('btnDelivery')?.classList.toggle('active', type === 'delivery');
    document.getElementById('btnRetiro')?.classList.toggle('active', type === 'retiro');
    document.getElementById('btnEnvio')?.classList.toggle('active', type === 'envio');

    this.renderAccordionCart();
    this.renderPaymentChips();
  },

  // 4. STEP 1: PAYMENT METHOD CHIPS BASED ON DELIVERY TYPE
  renderPaymentChips() {
    const container = document.getElementById('paymentChipsGrid');
    if (!container) return;

    let available = [];

    if (this.selectedDelivery === 'delivery') {
      available = [
        { id: 'pagomovil', name: 'Pago Móvil', desc: 'Acreditación instantánea (BNC)', icon: '📲' },
        { id: 'transferencia', name: 'Transferencia', desc: 'Banesco Universal', icon: '🏦' },
        { id: 'punto', name: 'Punto de Venta', desc: 'El motorizado lleva el punto', icon: '💳' },
        { id: 'efectivo', name: 'Efectivo', desc: 'Divisas $ o Bs contra entrega', icon: '💵' }
      ];
    } else if (this.selectedDelivery === 'retiro') {
      available = [
        { id: 'pagomovil', name: 'Pago Móvil', desc: 'Acreditación instantánea', icon: '📲' },
        { id: 'transferencia', name: 'Transferencia', desc: 'Banesco Universal', icon: '🏦' },
        { id: 'punto', name: 'Punto de Venta', desc: 'En mostrador o caja', icon: '💳' },
        { id: 'efectivo', name: 'Efectivo', desc: 'En almacén o caja', icon: '💵' }
      ];
    } else if (this.selectedDelivery === 'envio') {
      available = [
        { id: 'transferencia', name: 'Transferencia', desc: 'Banesco Universal', icon: '🏦' },
        { id: 'pagomovil', name: 'Pago Móvil', desc: 'Acreditación instantánea (BNC)', icon: '📲' }
      ];
    }

    // Keep selected or fallback to first
    if (!available.some(a => a.id === this.selectedPayment)) {
      this.selectedPayment = available[0].id;
    }

    container.innerHTML = available.map(m => `
      <button type="button" class="payment-chip-btn ${m.id === this.selectedPayment ? 'active' : ''}" onclick="checkoutApp.selectPaymentMethod('${m.id}')">
        <span class="pay-chip-icon">${m.icon}</span>
        <div class="pay-chip-text">
          <strong>${m.name}</strong>
          <small>${m.desc}</small>
        </div>
      </button>
    `).join('');

    this.renderBankDetailsCard();
  },

  selectPaymentMethod(methodId) {
    this.selectedPayment = methodId;
    this.renderPaymentChips();
  },

  // 5. STEP 1: BANK DETAILS CARD
  renderBankDetailsCard() {
    const card = document.getElementById('bankDisplayCard');
    if (!card) return;

    const totalUsd = this.calculateTotalUsd();
    const totalBsFormatted = this.formatBs(totalUsd);

    if (this.selectedPayment === 'pagomovil') {
      const p = BANK_DATA.pagomovil;
      card.innerHTML = `
        <div class="bank-card-title-row">
          <strong>📲 Datos de Pago Móvil Oficial Casa Total</strong>
          <span style="font-size:10.5px; color:#ea580c; font-weight:700;">Acreditación en 1 min</span>
        </div>

        <div class="bank-exact-amount-box">
          <span>Monto exacto a transferir:</span>
          <strong>${totalBsFormatted}</strong>
          <button type="button" class="btn-app-copy" onclick="checkoutApp.copyToClipboard('${totalBsFormatted}', 'Monto en Bs')">Copiar</button>
        </div>

        <div class="bank-data-rows">
          <div class="bank-info-line">
            <span>Banco:</span>
            <strong>${p.bank}</strong>
          </div>
          <div class="bank-info-line">
            <span>Teléfono:</span>
            <strong>${p.phone}</strong>
            <button type="button" class="btn-app-copy" onclick="checkoutApp.copyToClipboard('${p.phone}', 'Teléfono')">Copiar</button>
          </div>
          <div class="bank-info-line">
            <span>RIF:</span>
            <strong>${p.rif}</strong>
            <button type="button" class="btn-app-copy" onclick="checkoutApp.copyToClipboard('${p.rif}', 'RIF')">Copiar</button>
          </div>
        </div>

        <div class="bank-instructions-alert">
          💡 Realiza el pago móvil desde tu banco por <strong>${totalBsFormatted}</strong> y en el siguiente paso adjuntas la captura y referencia.
        </div>
      `;
    } else if (this.selectedPayment === 'transferencia') {
      const t = BANK_DATA.transferencia;
      card.innerHTML = `
        <div class="bank-card-title-row">
          <strong>🏦 Cuenta Bancaria Oficial</strong>
          <span style="font-size:10.5px; color:#ea580c; font-weight:700;">Banesco</span>
        </div>

        <div class="bank-exact-amount-box">
          <span>Monto exacto a transferir:</span>
          <strong>${totalBsFormatted}</strong>
          <button type="button" class="btn-app-copy" onclick="checkoutApp.copyToClipboard('${totalBsFormatted}', 'Monto en Bs')">Copiar</button>
        </div>

        <div class="bank-data-rows">
          <div class="bank-info-line">
            <span>Banco:</span>
            <strong>${t.bank}</strong>
          </div>
          <div class="bank-info-line">
            <span>Cuenta (20 dígitos):</span>
            <strong>${t.account}</strong>
            <button type="button" class="btn-app-copy" onclick="checkoutApp.copyToClipboard('${t.account}', 'Cuenta')">Copiar</button>
          </div>
          <div class="bank-info-line">
            <span>Beneficiario:</span>
            <strong>${t.titular}</strong>
          </div>
          <div class="bank-info-line">
            <span>RIF:</span>
            <strong>${t.rif}</strong>
            <button type="button" class="btn-app-copy" onclick="checkoutApp.copyToClipboard('${t.rif}', 'RIF')">Copiar</button>
          </div>
        </div>

        <div class="bank-instructions-alert">
          💡 Transfiere el monto total de <strong>${totalBsFormatted}</strong> y en el siguiente paso registra la referencia bancaria.
        </div>
      `;
    } else if (this.selectedPayment === 'punto') {
      card.innerHTML = `
        <div class="bank-card-title-row">
          <strong>💳 Punto de Venta</strong>
          <span style="font-size:10.5px; color:#16a34a; font-weight:700;">Débito / Crédito</span>
        </div>
        <p style="font-size:12px; color:#334155; margin-bottom:8px;">
          ${this.selectedDelivery === 'delivery' 
            ? '🛵 El chofer o motorizado llevará el equipo inalámbrico a tu dirección para procesar tu tarjeta física al recibir.' 
            : '🏬 Podrás pagar con tarjeta de débito o crédito en caja al momento de retirar en almacén.'}
        </p>
        <div class="bank-instructions-alert">
          ✓ Aceptamos tarjetas nacionales e internacionales sin recargo. Total a cobrar: <strong>USD $${totalUsd.toFixed(2)}</strong>.
        </div>
      `;
    } else if (this.selectedPayment === 'efectivo') {
      card.innerHTML = `
        <div class="bank-card-title-row">
          <strong>💵 Efectivo Contra Entrega</strong>
          <span style="font-size:10.5px; color:#16a34a; font-weight:700;">Dólares o Bolívares</span>
        </div>
        <p style="font-size:12px; color:#334155; margin-bottom:8px;">
          Total a pagar: <strong>USD $${totalUsd.toFixed(2)}</strong> o <strong>${totalBsFormatted}</strong> en efectivo.
        </p>
        <div class="bank-instructions-alert">
          💵 En el siguiente paso te permitiremos indicar con qué billete pagarás para llevarte el vuelto exacto.
        </div>
      `;
    }
  },

  // 6. TIMELINE TRANSITIONS (EXACTLY 3 STEPS)
  goToStep(step) {
    if (step > this.currentStep + 1 && !this.confirmedOrder) {
      this.showToast("Completa el paso actual primero");
      return;
    }
    this.currentStep = step;
    this.updateTimelineUI();
  },

  advanceToStep(step) {
    this.currentStep = step;
    this.updateTimelineUI();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  updateTimelineUI() {
    // Show active screen
    document.querySelectorAll('.app-step-screen').forEach(s => s.classList.remove('active'));
    document.getElementById(`screenStep${this.currentStep}`)?.classList.add('active');

    // Update exactly 3 tabs
    for (let i = 1; i <= 3; i++) {
      const tab = document.getElementById(`tabStep${i}`);
      if (!tab) continue;
      tab.classList.remove('active', 'completed');
      if (i === this.currentStep) {
        tab.classList.add('active');
      } else if (i < this.currentStep) {
        tab.classList.add('completed');
      }
    }

    // If entering Step 2, adjust requirements based on selected payment & delivery
    if (this.currentStep === 2) {
      this.updateStep2Requirements();
    }
  },

  // 7. STEP 2: PREPARE FORM INPUTS
  updateStep2Requirements() {
    // Toggle Proof vs Cash vs POS
    const bankWrapper = document.getElementById('bankInputsWrapper');
    const cashWrapper = document.getElementById('cashDetailsWrapper');
    const posWrapper = document.getElementById('posDetailsWrapper');

    if (this.selectedPayment === 'pagomovil' || this.selectedPayment === 'transferencia') {
      bankWrapper.style.display = 'block';
      cashWrapper.style.display = 'none';
      posWrapper.style.display = 'none';
    } else if (this.selectedPayment === 'efectivo') {
      bankWrapper.style.display = 'none';
      cashWrapper.style.display = 'block';
      posWrapper.style.display = 'none';
    } else if (this.selectedPayment === 'punto') {
      bankWrapper.style.display = 'none';
      cashWrapper.style.display = 'none';
      posWrapper.style.display = 'block';
    }

    // Toggle Delivery destination inputs
    const delWrapper = document.getElementById('fieldsDeliveryWrapper');
    const retWrapper = document.getElementById('fieldsRetiroWrapper');
    const envWrapper = document.getElementById('fieldsEnvioWrapper');
    const headEl = document.getElementById('destinationHeading');
    const subEl = document.getElementById('destinationSubtext');

    if (this.selectedDelivery === 'delivery') {
      delWrapper.style.display = 'block';
      retWrapper.style.display = 'none';
      envWrapper.style.display = 'none';
      headEl.textContent = 'Dirección de Entrega a Domicilio';
      subEl.textContent = 'Indica el lugar donde entregaremos tu pedido ($5.00):';
    } else if (this.selectedDelivery === 'retiro') {
      delWrapper.style.display = 'none';
      retWrapper.style.display = 'block';
      envWrapper.style.display = 'none';
      headEl.textContent = 'Almacén de Retiro';
      subEl.textContent = 'Selecciona la sede donde retirarás sin costo adicional:';
    } else if (this.selectedDelivery === 'envio') {
      delWrapper.style.display = 'none';
      retWrapper.style.display = 'none';
      envWrapper.style.display = 'block';
      headEl.textContent = 'Datos de Envío Nacional (MRW / Zoom)';
      subEl.textContent = 'Indica los datos de la agencia para tu encomienda ($20.00):';
    }
  },

  toggleBillingFields() {
    const isSame = document.getElementById('sameBillingToggle').checked;
    const subcard = document.getElementById('differentBillingSubcard');
    if (subcard) {
      subcard.style.display = isSame ? 'none' : 'block';
    }
  },

  selectCashDenom(btn, val) {
    document.querySelectorAll('#cashDetailsWrapper .denom-chip').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    this.cashDenom = val;
  },

  selectPosCard(btn, val) {
    document.querySelectorAll('#posDetailsWrapper .denom-chip').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    this.posCard = val;
  },

  handleProofUpload(input) {
    const file = input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      this.uploadedProof = {
        name: file.name,
        dataUrl: e.target.result
      };

      document.getElementById('uploadIdle').style.display = 'none';
      const successEl = document.getElementById('uploadSuccess');
      successEl.style.display = 'flex';
      document.getElementById('uploadImgThumb').src = e.target.result;
      document.getElementById('uploadFileName').textContent = file.name;
    };
    reader.readAsDataURL(file);
  },

  clearProof(e) {
    if (e) e.stopPropagation();
    this.uploadedProof = null;
    document.getElementById('proofInput').value = '';
    document.getElementById('uploadSuccess').style.display = 'none';
    document.getElementById('uploadIdle').style.display = 'flex';
  },

  // 8. SUBMIT FINAL ORDER
  submitOrder(e) {
    e.preventDefault();

    const name = document.getElementById('clientName').value.trim() || 'Cliente Demo';
    const idNum = document.getElementById('clientId').value.trim() || 'V-00000000';
    const phone = document.getElementById('clientPhone').value.trim() || '0412-0000000';
    const email = document.getElementById('clientEmail').value.trim() || 'demo@test.com';
    const notes = document.getElementById('clientNotes').value.trim();

    const ref = document.getElementById('paymentRef')?.value.trim() || 'N/A';
    const clientBank = document.getElementById('clientBank')?.value || 'N/A';

    const orderId = `CT-${Math.floor(10000 + Math.random() * 90000)}`;
    const totalUsd = this.calculateTotalUsd();
    const totalBs = this.formatBs(totalUsd);

    let deliveryString = '';
    let billingString = 'Misma que la de entrega';

    if (this.selectedDelivery === 'delivery') {
      const city = document.getElementById('delCity').value;
      const sec = document.getElementById('delSector').value;
      const addr = document.getElementById('delAddress').value;
      deliveryString = `Delivery Express ($5.00) - ${city}, ${sec}. ${addr}`;

      const sameBilling = document.getElementById('sameBillingToggle').checked;
      if (!sameBilling) {
        const bName = document.getElementById('billFiscalName').value.trim();
        const bRif = document.getElementById('billFiscalRif').value.trim();
        const bShort = document.getElementById('billFiscalShort').value.trim();
        billingString = `Fiscal: ${bName} (${bRif}) - ${bShort}`;
      }
    } else if (this.selectedDelivery === 'retiro') {
      const loc = document.getElementById('pickupLocation').value;
      const person = document.getElementById('pickupPerson').value || name;
      deliveryString = `Retiro en Almacén (GRATIS): ${loc} (Retira: ${person})`;
    } else if (this.selectedDelivery === 'envio') {
      const cour = document.getElementById('shipCourier').value;
      const state = document.getElementById('shipState').value;
      const agency = document.getElementById('shipAgency').value;
      const fAddr = document.getElementById('shipFiscalAddress').value;
      deliveryString = `Envío Nacional ($20.00): ${cour} - ${state} (${agency})`;
      if (fAddr) billingString = `Fiscal: ${fAddr}`;
    }

    this.confirmedOrder = {
      orderId,
      name,
      idNum,
      phone,
      email,
      notes,
      deliveryMethod: this.selectedDelivery,
      deliveryString,
      billingString,
      paymentMethod: this.selectedPayment,
      ref,
      clientBank,
      cashDenom: this.cashDenom,
      posCard: this.posCard,
      totalUsd,
      totalBs,
      proof: this.uploadedProof,
      date: new Date().toLocaleString('es-VE')
    };

    // Render receipt in Screen 3
    document.getElementById('confirmedOrderId').textContent = orderId;
    this.renderDigitalReceipt(this.confirmedOrder);
    this.setupWhatsAppDispatch(this.confirmedOrder);

    // Advance to Screen 3
    this.currentStep = 3;
    this.updateTimelineUI();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.showToast(`¡Pedido ${orderId} registrado!`);
  },

  renderDigitalReceipt(ord) {
    const box = document.getElementById('digitalReceiptBox');
    if (!box) return;

    let payLabel = '';
    if (ord.paymentMethod === 'pagomovil') payLabel = `Pago Móvil (${ord.clientBank}) - Ref: ${ord.ref}`;
    else if (ord.paymentMethod === 'transferencia') payLabel = `Transferencia (${ord.clientBank}) - Ref: ${ord.ref}`;
    else if (ord.paymentMethod === 'efectivo') payLabel = `Efectivo (${ord.cashDenom})`;
    else if (ord.paymentMethod === 'punto') payLabel = `Punto de Venta (${ord.posCard})`;

    box.innerHTML = `
      <div class="app-receipt-row">
        <span>Fecha y Hora:</span>
        <strong>${ord.date}</strong>
      </div>
      <div class="app-receipt-row">
        <span>Cliente:</span>
        <strong>${ord.name} (${ord.idNum})</strong>
      </div>
      <div class="app-receipt-row">
        <span>WhatsApp:</span>
        <strong>${ord.phone}</strong>
      </div>
      <div class="app-receipt-row">
        <span>Entrega:</span>
        <strong style="text-align:right; max-width:260px;">${ord.deliveryString}</strong>
      </div>
      <div class="app-receipt-row">
        <span>Facturación:</span>
        <strong style="text-align:right; max-width:260px;">${ord.billingString}</strong>
      </div>
      <div class="app-receipt-row">
        <span>Método de Pago:</span>
        <strong style="color:var(--primary-orange);">${payLabel}</strong>
      </div>
      <div class="app-receipt-row" style="border-top:1.5px solid #cbd5e1; padding-top:8px; margin-top:6px;">
        <span style="font-size:13px; font-weight:800;">TOTAL PAGADO USD:</span>
        <strong style="font-size:15px; color:var(--primary-orange); font-weight:900;">USD $${ord.totalUsd.toFixed(2)}</strong>
      </div>
      <div class="app-receipt-row">
        <span style="font-size:12px; font-weight:700;">TOTAL EN BOLÍVARES:</span>
        <strong style="font-size:13px; color:var(--primary-dark); font-weight:800;">${ord.totalBs}</strong>
      </div>

      ${ord.proof ? `
        <div style="margin-top:10px; padding-top:8px; border-top:1px dashed #e2e8f0; display:flex; align-items:center; gap:8px;">
          <img src="${ord.proof.dataUrl}" style="width:36px; height:36px; border-radius:4px; object-fit:cover; border:1px solid #cbd5e1;">
          <span style="font-size:11px; color:#16a34a; font-weight:700;">✓ Comprobante ${ord.proof.name} adjunto</span>
        </div>
      ` : ''}
    `;
  },

  setupWhatsAppDispatch(ord) {
    const btnWa = document.getElementById('btnWhatsAppDispatch');
    const btnAsesor = document.getElementById('btnAsesorDispatch');

    let itemsText = '';
    this.cart.forEach(rawItem => {
      const item = this.getItemProps(rawItem);
      const line = item.price * item.quantity;
      itemsText += `• ${item.quantity}x ${item.title} ($${line.toFixed(2)})\n`;
    });

    const msg = `¡Hola Casa Total! 🛠️ Acabo de registrar el pedido *#${ord.orderId}* en la aplicación:

*DATOS DEL CLIENTE:*
• Nombre: ${ord.name}
• Cédula/RIF: ${ord.idNum}
• Teléfono: ${ord.phone}
• Correo: ${ord.email}

*MODALIDAD DE ENTREGA:*
• ${ord.deliveryString}
• Facturación Fiscal: ${ord.billingString}

*MÉTODO DE PAGO:*
• ${ord.paymentMethod.toUpperCase()}
• ${ord.ref !== 'N/A' ? `Banco: ${ord.clientBank} | Ref: #${ord.ref}` : ord.cashDenom || ord.posCard}

*PRODUCTOS COMPRADOS:*
${itemsText}
*COSTO DE ENTREGA:* $${this.deliveryFee.toFixed(2)}
*TOTAL PAGADO:* USD $${ord.totalUsd.toFixed(2)} (${ord.totalBs})

Adjunto el comprobante de la transferencia para validar el despacho. ¡Muchas gracias!`;

    const encodedMsg = encodeURIComponent(msg);

    if (btnWa) {
      btnWa.href = `https://wa.me/584120000000?text=${encodedMsg}`;
    }
    if (btnAsesor) {
      btnAsesor.href = `https://wa.me/584120000001?text=${encodedMsg}`;
      btnAsesor.addEventListener('click', (e) => {
        e.preventDefault();
        this.openOrderChat(ord);
      });
    }

    this.setupOrderChat(ord);
  },

  openOrderChat(ord) {
    const modal = document.getElementById('orderChatModal');
    const backdrop = document.getElementById('orderChatBackdrop');
    const msgContainer = document.getElementById('orderChatMessages');
    if (!modal || !backdrop) return;

    modal.classList.add('open');
    backdrop.classList.add('active');

    if (msgContainer && !msgContainer.hasChildNodes()) {
      this.appendOrderChatMessage(`👋 ¡Hola <strong>${ord.name || 'Cliente'}</strong>! Soy tu <strong>Asesor Virtual de Casa Total</strong>. Veo que registraste con éxito tu orden <strong>#${ord.orderId}</strong> por un monto total de <strong>USD $${ord.totalUsd.toFixed(2)} (${ord.totalBs})</strong>.`, 'bot');
      setTimeout(() => {
        this.appendOrderChatMessage(`Tu comprobante de pago está en revisión por nuestro equipo administrativo. Selecciona una opción o escribe tu consulta sobre despacho o materiales:`, 'bot');
      }, 500);
    }
  },

  closeOrderChat() {
    const modal = document.getElementById('orderChatModal');
    const backdrop = document.getElementById('orderChatBackdrop');
    if (modal) modal.classList.remove('open');
    if (backdrop) backdrop.classList.remove('active');
  },

  appendOrderChatMessage(text, sender) {
    const container = document.getElementById('orderChatMessages');
    if (!container) return;
    const msg = document.createElement('div');
    msg.className = `chat-msg ${sender}`;
    msg.innerHTML = text;
    container.appendChild(msg);
    container.scrollTop = container.scrollHeight;
  },

  handleBotQuestion(topic) {
    const ord = this.lastOrder || {};
    if (topic === 'tiempo_entrega') {
      this.appendOrderChatMessage('🚚 ¿Cuánto tiempo tarda mi entrega?', 'user');
      setTimeout(() => {
        this.appendOrderChatMessage('<strong>Tiempos de entrega estimados:</strong><br>• <strong>Delivery Express:</strong> Mismo día (2 a 4 horas tras verificar pago).<br>• <strong>Retiro en Tienda Casa Total:</strong> Disponible de inmediato en horario de almacén.<br>• <strong>Fletes y Envíos Nacionales:</strong> 24 a 48 horas hábiles por MRW, Tealca o Zoom.', 'bot');
      }, 500);
    } else if (topic === 'estatus_pago') {
      this.appendOrderChatMessage('💳 ¿Cómo validan mi comprobante de pago?', 'user');
      setTimeout(() => {
        this.appendOrderChatMessage(`Tu pago con método <strong>${ord.paymentMethod || 'Pago Móvil / Transferencia'}</strong> es validado directamente en nuestras cuentas bancarias. Si deseas agilizar la entrega, puedes enviar tu captura por WhatsApp.`, 'bot');
      }, 500);
    } else if (topic === 'hablar_humano') {
      this.appendOrderChatMessage('📲 Deseo contactar con un asesor humano en WhatsApp', 'user');
      setTimeout(() => {
        const btnWa = document.getElementById('btnWhatsAppDispatch');
        const url = btnWa ? btnWa.href : 'https://wa.me/584120000000';
        this.appendOrderChatMessage(`Haz clic aquí para hablar directamente con nuestro equipo de Casa Total: <a href="${url}" target="_blank" style="color:#FF5B00; font-weight:700; text-decoration:underline;">Abrir WhatsApp Casa Total</a>`, 'bot');
      }, 500);
    }
  },

  setupOrderChat(ord) {
    this.lastOrder = ord;
    const closeBtn = document.getElementById('closeOrderChatBtn');
    const backdrop = document.getElementById('orderChatBackdrop');
    const form = document.getElementById('orderChatForm');
    const input = document.getElementById('orderChatInput');

    if (closeBtn) closeBtn.onclick = () => this.closeOrderChat();
    if (backdrop) backdrop.onclick = () => this.closeOrderChat();

    if (form) {
      form.onsubmit = (e) => {
        e.preventDefault();
        const text = input.value.trim();
        if (!text) return;
        this.appendOrderChatMessage(text, 'user');
        input.value = '';
        setTimeout(() => {
          this.appendOrderChatMessage(`Gracias por escribirnos. Tu consulta sobre el pedido <strong>#${ord.orderId}</strong> ha sido recibida. Un asesor de nuestro equipo te responderá en breve. También puedes escribirnos directamente al WhatsApp oficial para atención inmediata.`, 'bot');
        }, 700);
      };
    }
  },

  clearCartAndFinish() {
    try {
      localStorage.removeItem('casa_total_cart');
      localStorage.removeItem('casatotal_cart');
    } catch (e) {}
  },

  // 9. CART ACCORDION RENDERING & TOTALS
  renderAccordionCart() {
    const countEl = document.getElementById('accordionItemCount');
    const topUsdEl = document.getElementById('accordionTotalUsd');
    const topBsEl = document.getElementById('accordionTotalBs');
    const drawerList = document.getElementById('drawerItemsList');
    const subUsdEl = document.getElementById('drawerSubtotalUsd');
    const feeEl = document.getElementById('drawerDeliveryFee');
    const rateEl = document.getElementById('drawerBcvRate');
    const grandUsdEl = document.getElementById('drawerGrandTotalUsd');
    const footUsdEl = document.getElementById('footerTotalUsd');
    const footBsEl = document.getElementById('footerTotalBs');

    const totalQty = this.cart.reduce((s, raw) => {
      const i = this.getItemProps(raw);
      return s + i.quantity;
    }, 0);
    if (countEl) countEl.textContent = `${totalQty} ${totalQty === 1 ? 'producto' : 'productos'}`;

    if (drawerList) {
      drawerList.innerHTML = this.cart.map(raw => {
        const item = this.getItemProps(raw);
        return `
          <div class="drawer-item-row">
            <img src="${item.image}" alt="${item.title}" class="drawer-item-img">
            <div class="drawer-item-info">
              <div class="drawer-item-name">${item.title}</div>
              <div class="drawer-item-calc">${item.quantity} x USD $${item.price.toFixed(2)}</div>
            </div>
            <strong style="font-size:12px; color:var(--text-dark);">USD $${(item.price * item.quantity).toFixed(2)}</strong>
          </div>
        `;
      }).join('');
    }

    const subtotal = this.calculateSubtotalUsd();
    const grandTotal = this.calculateTotalUsd();
    const grandBs = this.formatBs(grandTotal);

    if (topUsdEl) topUsdEl.textContent = `USD $${grandTotal.toFixed(2)}`;
    if (topBsEl) topBsEl.textContent = grandBs;

    if (subUsdEl) subUsdEl.textContent = `USD $${subtotal.toFixed(2)}`;
    if (feeEl) {
      if (this.deliveryFee === 0) feeEl.textContent = '¡GRATIS!';
      else feeEl.textContent = `USD $${this.deliveryFee.toFixed(2)}`;
    }
    if (rateEl) rateEl.textContent = `Bs ${BCV_RATE.toFixed(2).replace('.', ',')}`;
    if (grandUsdEl) grandUsdEl.textContent = `USD $${grandTotal.toFixed(2)}`;

    if (footUsdEl) footUsdEl.textContent = `USD $${grandTotal.toFixed(2)}`;
    if (footBsEl) footBsEl.textContent = grandBs;
  },

  calculateSubtotalUsd() {
    return this.cart.reduce((s, raw) => {
      const item = this.getItemProps(raw);
      return s + (item.price * item.quantity);
    }, 0);
  },

  calculateTotalUsd() {
    return this.calculateSubtotalUsd() + this.deliveryFee;
  },

  formatBs(usd) {
    const bs = usd * BCV_RATE;
    return `Bs ${bs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  },

  copyToClipboard(text, label) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text);
    } else {
      const t = document.createElement('textarea');
      t.value = text;
      document.body.appendChild(t);
      t.select();
      document.execCommand('copy');
      document.body.removeChild(t);
    }
    this.showToast(`¡${label} copiado!`);
  },

  showToast(msg) {
    const toast = document.getElementById('appToast');
    const txt = document.getElementById('toastMsg');
    if (!toast || !txt) return;

    txt.textContent = msg;
    toast.classList.add('show');
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2500);
  }
};

document.addEventListener('DOMContentLoaded', () => {
  checkoutApp.init();
});
