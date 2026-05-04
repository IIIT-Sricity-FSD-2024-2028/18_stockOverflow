(async function () {
  // AUTH GUARD
  const session = JSON.parse(localStorage.getItem('so_session') || 'null');
  if (!session || session.role !== 'biller') {
    window.location.href = '../index.html';
    return;
  }
  if (
    session &&
    session.role === 'biller' &&
    (!session.storeId || !Array.isArray(session.accessibleStoreIds) || !session.accessibleStoreIds.length)
  ) {
    window.location.href = '../auth/biller-pending.html';
    return;
  }

  const currencyFormatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  });

  const headerTime = document.querySelector('.header-time');
  const catItems = Array.from(document.querySelectorAll('.cat-item'));
  const searchInput = document.getElementById('productSearch');
  const newOrderBtn = document.getElementById('newOrderBtn');
  const storeSwitcher = document.getElementById('storeSwitcher');
  const filterBtn = document.getElementById('filterBtn');
  const addProductBtn = document.getElementById('addProductBtn');
  const viewOrdersBtn = document.getElementById('viewOrdersBtn');
  const transactionBtn = document.getElementById('transactionBtn');
  const clearCartBtn = document.getElementById('clearCartBtn');
  const customerSelector = document.getElementById('customerSelector');
  const addCustomerBtn = document.getElementById('addCustomerBtn');
  const scanCustomerBtn = document.getElementById('scanCustomerBtn');
  const roundoffToggle = document.getElementById('roundoffToggle');
  const cartBadge = document.querySelector('.cart-badge');
  const itemCountBadge = document.querySelector('.item-count-badge');
  const emptyCart = document.querySelector('.empty-cart');
  const orderItemsList = document.getElementById('orderItemsList');
  const productGrid = document.getElementById('productGrid');
  const subtotalValue = document.getElementById('subtotalValue');
  const shippingInput = document.getElementById('shippingInput');
  const shippingValue = document.getElementById('shippingValue');
  const taxInput = document.getElementById('taxInput');
  const taxValue = document.getElementById('taxValue');
  const couponInput = document.getElementById('couponInput');
  const couponValue = document.getElementById('couponValue');
  const discountInput = document.getElementById('discountInput');
  const discountValue = document.getElementById('discountValue');
  const roundoffValue = document.getElementById('roundoffValue');
  const totalPayableValue = document.getElementById('totalPayableValue');
  const chargeBtn = document.getElementById('chargeBtn');
  const resetOrderBtn = document.getElementById('resetOrderBtn');
  const payButtons = Array.from(document.querySelectorAll('.pay-btn'));
  const iconButtons = Array.from(document.querySelectorAll('.icon-btn'));
  const toast = document.getElementById('toast');
  const ordersModal = document.getElementById('ordersModal');
  const reservedOrdersList = document.getElementById('reservedOrdersList');
  const reservedSection = document.getElementById('reservedSection');
  const reservedList = document.getElementById('reservedList');

  const parsePrice = (priceText) => Number(String(priceText || '').replace(/[^\d.]/g, '')) || 0;
  const toUsd = (price) => '$' + Number(price || 0).toFixed(2);
  const formatInr = (amount) => currencyFormatter.format(amount);

  let retailerProducts = [];
  let storeRecords = [];
  let storeNames = ['Downtown Store', 'East Coast Hub', 'Global Hub'];
  let customers = ['Walk-in Customer'];
  let products = [];
  let storeIndex = 0;
  let customerIndex = 0;
  let sortMode = 'none';
  let toastTimer = null;
  let stagedReservationRequestIds = {};
  let requestIdsBySku = {};

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    if (toastTimer) {
      clearTimeout(toastTimer);
    }
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 1800);
  }

  function mapCategoryToPos(category) {
    const normalized = String(category || '').trim().toLowerCase();
    if (normalized === 'electronics') return 'electronics';
    if (normalized === 'shoe' || normalized === 'shoes' || normalized === 'footwear') return 'footwear';
    if (normalized === 'phone' || normalized === 'phones' || normalized === 'mobile' || normalized === 'mobiles') return 'mobiles';
    if (normalized === 'computer' || normalized === 'computers' || normalized === 'laptop' || normalized === 'laptops') return 'laptops';
    if (normalized === 'appliances' || normalized === 'appliance') return 'appliances';
    return 'accessories';
  }

  function getCurrentStoreRecord() {
    return storeRecords[storeIndex] || { id: 's1', name: storeNames[storeIndex] || 'Downtown Store' };
  }

  function getCurrentStoreName() {
    return getCurrentStoreRecord().name || 'Downtown Store';
  }

  function getCurrentStoreId() {
    return getCurrentStoreRecord().id || 's1';
  }

  function isReservationStaged(requestId) {
    return Boolean(requestId && stagedReservationRequestIds[requestId]);
  }

  function clearReservationStage() {
    stagedReservationRequestIds = {};
    requestIdsBySku = {};
  }

  function syncStoreLabel() {
    const storeLabel = storeSwitcher.querySelector('span:nth-child(2)');
    storeLabel.textContent = getCurrentStoreName();
  }

  function syncCustomerLabel() {
    customerSelector.innerHTML = customers[customerIndex] + ' <span>▾</span>';
  }

  function updateClock() {
    const now = new Date();
    headerTime.textContent = 'Time ' + now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }

  function buildRetailerCard(productData) {
    const card = document.createElement('div');
    const safeName = String(productData.name || 'Unnamed Product');
    const safeCategory = String(productData.category || 'General');
    const safeImage = String(productData.productImg || '').trim();
    const safeEmoji = String(productData.emoji || String.fromCodePoint(0x1f4e6));

    card.className = 'product-card';
    card.dataset.category = mapCategoryToPos(productData.category);
    card.innerHTML = `
      <div class="product-img">${safeImage ? `<img src="${safeImage}" alt="${safeName}" style="max-width:100%;max-height:100%;object-fit:contain;" onerror="this.style.display='none';this.parentElement.textContent='${safeEmoji}';"/>` : safeEmoji}</div>
      <div class="product-info">
        <div class="product-cat">${safeCategory}</div>
        <div class="product-name">${safeName}</div>
        <div class="product-bottom">
          <div class="product-price">${toUsd(productData.priceUSD)}</div>
          <div class="qty-ctrl">
            <button class="qty-btn">+</button>
            <span class="qty-count">0</span>
            <button class="qty-btn">-</button>
          </div>
        </div>
      </div>
    `;

    return card;
  }

  function getLineItems() {
    return products
      .map((product) => {
        const quantity = Number(product.countEl.textContent) || 0;
        return { ...product, quantity, total: quantity * product.price };
      })
      .filter((item) => item.quantity > 0);
  }

  function getItemCount() {
    return getLineItems().reduce((sum, item) => sum + item.quantity, 0);
  }

  function updateCart() {
    const lineItems = getLineItems();
    const itemCount = lineItems.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
    const shipping = itemCount > 0 ? (parseFloat(shippingInput.value) || 0) : 0;
    const tax = parseFloat(taxInput.value) || 0;
    const coupon = parseFloat(couponInput.value) || 0;
    const discount = parseFloat(discountInput.value) || 0;
    const rawTotal = subtotal + shipping + tax - coupon - discount;
    const finalTotal = roundoffToggle.checked ? Math.round(rawTotal) : rawTotal;
    const roundoff = finalTotal - rawTotal;

    cartBadge.textContent = itemCount + ' items';
    itemCountBadge.textContent = itemCount;
    emptyCart.classList.toggle('is-hidden', itemCount > 0);
    orderItemsList.classList.toggle('is-hidden', itemCount === 0);

    orderItemsList.innerHTML = lineItems.map((item) => `
      <div class="order-item">
        <div>
          <div class="order-item-name">${item.name}</div>
          <div class="order-item-meta">${item.quantity} x ${formatInr(item.price)}</div>
        </div>
        <div class="order-item-name">${formatInr(item.total)}</div>
      </div>
    `).join('');

    subtotalValue.textContent = formatInr(subtotal);
    shippingValue.textContent = formatInr(shipping);
    taxValue.textContent = formatInr(tax);
    couponValue.textContent = formatInr(Math.abs(coupon));
    discountValue.textContent = formatInr(Math.abs(discount));
    roundoffValue.textContent = (roundoff >= 0 ? '' : '-') + formatInr(Math.abs(roundoff));
    totalPayableValue.textContent = formatInr(finalTotal);
  }

  function clearOrder() {
    products.forEach((product) => {
      product.countEl.textContent = '0';
    });
    clearReservationStage();
    updateCart();
  }

  function updateProductVisibility() {
    const activeCategory = document.querySelector('.cat-item.active')?.dataset.category || 'all';
    const query = (searchInput.value || '').trim().toLowerCase();

    products.forEach((product) => {
      const inCategory = activeCategory === 'all' || product.category === activeCategory;
      const inSearch = !query || product.name.toLowerCase().includes(query) || product.category.toLowerCase().includes(query);
      product.card.classList.toggle('is-hidden', !(inCategory && inSearch));
    });
  }

  function checkInventoryAvailability() {
    const lineItems = getLineItems();
    return lineItems.reduce((acc, item) => {
      const product = retailerProducts.find((entry) => entry.sku === item.sku);
      if (!product) {
        acc.push({ name: item.name, requested: item.quantity, available: 0 });
        return acc;
      }

      const storeEntry = Array.isArray(product.storeInventory)
        ? product.storeInventory.find((entry) => entry.storeId === getCurrentStoreId())
        : null;
      const available = Math.min(
        Number(product.qty || 0),
        storeEntry ? Number(storeEntry.qty || 0) : Number(product.qty || 0)
      );

      if (available < item.quantity) {
        acc.push({ name: item.name, requested: item.quantity, available: available });
      }

      return acc;
    }, []);
  }

  function showUnavailabilityPopup(unavailableItems) {
    const message = unavailableItems
      .map((item) => item.name + ': Requested ' + item.requested + ', Available ' + item.available)
      .join('\n');
    alert('Insufficient inventory\n\n' + message);
  }

  function generateBill(transaction) {
    if (!transaction || !Array.isArray(transaction.items) || !transaction.items.length) {
      return null;
    }

    return [
      '===================================',
      '         STOCK OVERFLOW',
      '          INVOICE / BILL',
      '===================================',
      '',
      'Order ID: ' + transaction.orderId,
      'Date & Time: ' + new Date(transaction.timestamp).toLocaleString('en-IN'),
      'Customer: ' + (transaction.customer || 'Walk-in Customer'),
      'Store: ' + (transaction.store || 'Downtown Store'),
      '',
      '===================================',
      'ITEM DETAILS',
      '===================================',
      '',
      transaction.items.map((item) => {
        return item.name + '\n  ' + item.quantity + ' x ' + formatInr(item.price) + ' = ' + formatInr(item.total);
      }).join('\n\n'),
      '',
      '===================================',
      'BILLING SUMMARY',
      '===================================',
      '',
      'Subtotal:      ' + formatInr(transaction.subtotal),
      'Shipping:      ' + formatInr(transaction.shipping),
      'Tax:           ' + formatInr(transaction.tax),
      'Coupon:        -' + formatInr(transaction.coupon),
      'Discount:      -' + formatInr(transaction.discount),
      'Roundoff:      ' + formatInr(transaction.roundoff),
      'Total Payable: ' + formatInr(transaction.finalTotal),
      '',
      'Payment Method: ' + (transaction.paymentMethod || 'Cash'),
      '',
      'Thank you for shopping at Stock Overflow!',
      '===================================',
    ].join('\n');
  }

  function openBillWindow(billText) {
    if (!billText) return;
    const billWindow = window.open('', 'Bill', 'height=600,width=500');
    if (!billWindow) return;
    billWindow.document.write('<pre style="font-family: monospace; padding: 20px; line-height: 1.6; font-size: 12px;">');
    billWindow.document.write(billText);
    billWindow.document.write('</pre>');
    billWindow.document.close();
    billWindow.print();
  }

  async function fetchReservationsForCurrentStore() {
    const reservations = await window.ImsApi.getReservations(getCurrentStoreId());
    return reservations.filter((entry) => !isReservationStaged(entry.requestId));
  }

  async function renderReservedProducts() {
    let reservations = [];
    try {
      reservations = await fetchReservationsForCurrentStore();
    } catch (_error) {
      reservations = [];
    }

    if (!reservations.length) {
      reservedSection.style.display = 'none';
      reservedList.innerHTML = '';
      return;
    }

    reservedSection.style.display = 'block';
    reservedList.innerHTML = reservations.map((reservation) => {
      const available = reservation.maxAvailable || 0;
      const statusColor = available >= reservation.qty ? '#10b981' : '#ef4444';
      return `
        <div style="display:flex;gap:6px;padding:6px 10px;background:#fff;border-radius:8px;border:1px solid #fcd34d;cursor:pointer;font-size:11px;align-items:center;flex-wrap:wrap;" onclick="addReservedToCart('${reservation.sku}', ${reservation.qty || 1}, '${reservation.requestId}')">
          <div>${reservation.emoji || String.fromCodePoint(0x1f4e6)}</div>
          <div style="flex:1;">
            <div style="font-weight:700;font-size:11px;">${reservation.name}</div>
            <div style="font-size:10px;color:#666;">x${reservation.qty} | Available: ${available}</div>
          </div>
          <button style="background:${statusColor};color:#fff;border:none;border-radius:6px;padding:4px 8px;font-size:10px;font-weight:600;cursor:pointer;">+</button>
        </div>
      `;
    }).join('');
  }

  async function openReservationsModal() {
    let reservations = [];
    try {
      reservations = await fetchReservationsForCurrentStore();
    } catch (_error) {
      reservations = [];
    }

    if (!reservations.length) {
      reservedOrdersList.innerHTML = '<p style="text-align:center; color:var(--text-muted);">No reserved orders</p>';
      ordersModal.style.display = 'flex';
      return;
    }

    reservedOrdersList.innerHTML = reservations.map((reservation) => `
      <div style="border:1px solid var(--border); border-radius:8px; padding:12px; background:#f9fafb;">
        <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:8px;">
          <div>
            <div style="font-weight:600; color:var(--text-primary);">${reservation.name}</div>
            <div style="font-size:12px; color:var(--text-muted);">SKU: ${reservation.sku || 'N/A'}</div>
          </div>
          <span style="background:var(--orange); color:white; padding:3px 8px; border-radius:4px; font-size:11px; font-weight:600;">Reserved</span>
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center; font-size:13px; margin-bottom:8px;">
          <div>${formatInr(reservation.priceUSD || 0)}</div>
          <div style="color:var(--text-muted);">Qty: ${reservation.qty || 1}</div>
        </div>
        <button onclick="addReservedToCart('${reservation.sku}', ${reservation.qty || 1}, '${reservation.requestId}')" style="width:100%; padding:8px; background:var(--accent); color:white; border:none; border-radius:6px; cursor:pointer; font-size:13px; font-weight:600;">Add to Order</button>
      </div>
    `).join('');

    ordersModal.style.display = 'flex';
  }

  window.addReservedToCart = async function (sku, quantity, requestId) {
    const product = products.find((entry) => entry.sku === sku);
    if (!product) {
      showToast('Product not found');
      return;
    }

    const safeQty = Math.max(1, Number(quantity) || 1);
    const current = Number(product.countEl.textContent) || 0;
    product.countEl.textContent = String(current + safeQty);

    if (requestId) {
      stagedReservationRequestIds[requestId] = true;
      requestIdsBySku[sku] = Array.isArray(requestIdsBySku[sku]) ? requestIdsBySku[sku] : [];
      if (requestIdsBySku[sku].indexOf(requestId) === -1) {
        requestIdsBySku[sku].push(requestId);
      }
    }

    updateCart();
    await renderReservedProducts();
    showToast(product.name + ' added from reservations');
  };

  function bindProductEvents() {
    products.forEach((product) => {
      const buttons = product.card.querySelectorAll('.qty-btn');
      buttons.forEach((button) => {
        button.addEventListener('click', (event) => {
          event.stopPropagation();
          const isPlus = button.textContent.includes('+');
          const current = Number(product.countEl.textContent) || 0;
          product.countEl.textContent = String(isPlus ? current + 1 : Math.max(0, current - 1));
          updateCart();
        });
      });

      product.card.addEventListener('click', (event) => {
        if (event.target.closest('.qty-btn')) {
          return;
        }
        const current = Number(product.countEl.textContent) || 0;
        product.countEl.textContent = String(current + 1);
        updateCart();
        showToast(product.name + ' added');
      });
    });
  }

  function renderProducts() {
    productGrid.innerHTML = '';
    retailerProducts.forEach((productData) => {
      productGrid.appendChild(buildRetailerCard(productData));
    });

    const productCards = Array.from(productGrid.querySelectorAll('.product-card'));
    products = productCards.map((card, index) => {
      const productData = retailerProducts[index] || {};
      return {
        card,
        name: card.querySelector('.product-name').textContent.trim(),
        category: card.dataset.category || mapCategoryToPos(productData.category),
        price: parsePrice(card.querySelector('.product-price').textContent),
        countEl: card.querySelector('.qty-count'),
        sku: productData.sku || 'SKU-' + index,
        retailerProduct: productData
      };
    });

    bindProductEvents();
  }

  catItems.forEach((item) => {
    item.addEventListener('click', () => {
      catItems.forEach((entry) => entry.classList.remove('active'));
      item.classList.add('active');
      updateProductVisibility();
    });
  });

  searchInput.addEventListener('input', updateProductVisibility);

  payButtons.forEach((button) => {
    button.addEventListener('click', () => {
      payButtons.forEach((entry) => entry.classList.remove('active'));
      button.classList.add('active');
      showToast('Payment method: ' + button.textContent.trim());
    });
  });

  iconButtons.forEach((button, index) => {
    const labels = ['Calculator', 'Select', 'Cash Drawer', 'Print', 'Reports', 'Settings'];
    button.addEventListener('click', () => {
      showToast((labels[index] || 'Tool') + ' clicked');
    });
  });

  newOrderBtn.addEventListener('click', () => {
    if (getItemCount() > 0 && !window.confirm('Start a new order and clear current cart?')) {
      return;
    }
    clearOrder();
    showToast('New order started');
  });

  storeSwitcher.addEventListener('click', async () => {
    if (storeRecords.length <= 1) {
      showToast('You are assigned to ' + getCurrentStoreName());
      return;
    }
    storeIndex = (storeIndex + 1) % storeNames.length;
    syncStoreLabel();
    await renderReservedProducts();
    showToast('Switched to ' + getCurrentStoreName());
  });

  filterBtn.addEventListener('click', () => {
    if (sortMode === 'none') sortMode = 'price-asc';
    else if (sortMode === 'price-asc') sortMode = 'price-desc';
    else sortMode = 'none';

    if (sortMode === 'none') products.sort((a, b) => a.name.localeCompare(b.name));
    else if (sortMode === 'price-asc') products.sort((a, b) => a.price - b.price);
    else products.sort((a, b) => b.price - a.price);

    products.forEach((product) => productGrid.appendChild(product.card));
    showToast('Filter applied');
  });

  addProductBtn.addEventListener('click', async () => {
    const name = window.prompt('Product name:');
    if (!name) return;
    const categoryInput = window.prompt('Category (e.g. electronics):', 'electronics');
    const priceInput = window.prompt('Price (number):', '99');
    const price = Number(priceInput);
    if (!categoryInput || Number.isNaN(price) || price <= 0) {
      showToast('Invalid product details');
      return;
    }

    try {
      await window.IMS_HTTP.request('/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          category: categoryInput.trim(),
          brand: 'Custom',
          priceUSD: price,
          qty: 50,
          min: 5,
          max: 100,
          creator: 'POS Biller',
          emoji: String.fromCodePoint(0x1f4e6),
          description: 'Created directly from POS.',
          supplier: 'POS Intake',
        }),
      });
      retailerProducts = await window.ImsApi.getProducts(true);
      renderProducts();
      updateProductVisibility();
      showToast(name.trim() + ' created');
    } catch (error) {
      showToast(window.IMS_HTTP.getErrorMessage(error));
    }
  });

  customerSelector.addEventListener('click', () => {
    customerIndex = (customerIndex + 1) % customers.length;
    syncCustomerLabel();
    showToast('Customer: ' + customers[customerIndex]);
  });

  addCustomerBtn.addEventListener('click', () => {
    const name = window.prompt('Enter new customer name:');
    if (!name) return;
    customers.push(name.trim());
    customerIndex = customers.length - 1;
    syncCustomerLabel();
    showToast('Customer added: ' + name.trim());
  });

  scanCustomerBtn.addEventListener('click', () => {
    showToast('Scanner opened (demo)');
  });

  roundoffToggle.addEventListener('change', () => {
    updateCart();
    showToast(roundoffToggle.checked ? 'Roundoff enabled' : 'Roundoff disabled');
  });

  shippingInput.addEventListener('change', () => {
    updateCart();
    showToast('Shipping updated');
  });
  taxInput.addEventListener('change', () => {
    updateCart();
    showToast('Tax updated');
  });
  couponInput.addEventListener('change', () => {
    updateCart();
    showToast('Coupon updated');
  });
  discountInput.addEventListener('change', () => {
    updateCart();
    showToast('Discount updated');
  });

  viewOrdersBtn.addEventListener('click', openReservationsModal);
  transactionBtn.addEventListener('click', () => {
    window.location.href = 'transaction.html';
  });

  resetOrderBtn.addEventListener('click', () => {
    clearOrder();
    showToast('Order reset');
  });

  clearCartBtn.addEventListener('click', async () => {
    if (!getItemCount()) {
      showToast('Cart already empty');
      return;
    }
    if (!window.confirm('Clear all items from current order?')) {
      return;
    }
    clearOrder();
    await renderReservedProducts();
    showToast('Cart cleared');
  });

  chargeBtn.addEventListener('click', async () => {
    if (!getItemCount()) {
      showToast('No items to charge');
      return;
    }

    const unavailableItems = checkInventoryAvailability();
    if (unavailableItems.length) {
      showUnavailabilityPopup(unavailableItems);
      return;
    }

    const total = totalPayableValue.textContent;
    if (!window.confirm('Confirm payment of ' + total + '?')) {
      return;
    }

    const lineItems = getLineItems();
    const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
    const shipping = parseFloat(shippingInput.value) || 0;
    const tax = parseFloat(taxInput.value) || 0;
    const coupon = parseFloat(couponInput.value) || 0;
    const discount = parseFloat(discountInput.value) || 0;
    const rawTotal = subtotal + shipping + tax - coupon - discount;
    const roundoff = roundoffToggle.checked ? Math.round(rawTotal) - rawTotal : 0;

    try {
      const createdTx = await window.ImsApi.createTransaction({
        retailerId: session.retailerId,
        customer: customers[customerIndex] || 'Walk-in Customer',
        store: getCurrentStoreName(),
        storeId: getCurrentStoreId(),
        paymentMethod: document.querySelector('.pay-btn.active')?.textContent?.trim() || 'Cash',
        items: lineItems.map((item) => ({
          sku: item.sku,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          total: item.total,
          isReserved: Array.isArray(requestIdsBySku[item.sku]) && requestIdsBySku[item.sku].length > 0,
          requestIds: Array.isArray(requestIdsBySku[item.sku]) ? requestIdsBySku[item.sku] : [],
        })),
        shipping: shipping,
        tax: tax,
        coupon: coupon,
        discount: discount,
        roundoff: roundoff,
      });

      openBillWindow(generateBill(createdTx));
      retailerProducts = await window.ImsApi.getProducts(true);
      renderProducts();
      clearOrder();
      await renderReservedProducts();
      updateProductVisibility();
      showToast('Payment successful: ' + formatInr(createdTx.finalTotal || 0));
    } catch (error) {
      const unavailable = error && error.payload && error.payload.unavailable;
      if (Array.isArray(unavailable) && unavailable.length) {
        showUnavailabilityPopup(unavailable);
        return;
      }
      showToast(window.IMS_HTTP.getErrorMessage(error));
    }
  });

  document.getElementById('logout').addEventListener('click', function () {
    window.location.href = '../index.html';
  });

  try {
    const loaded = await Promise.all([
      window.ImsApi.getProducts(),
      window.ImsApi.getStores(),
      window.ImsApi.getCustomers(),
    ]);
    retailerProducts = Array.isArray(loaded[0]) ? loaded[0] : [];
    storeRecords = Array.isArray(loaded[1]) && loaded[1].length ? loaded[1] : [];
    if (session.role === 'biller') {
      const allowedStoreIds = Array.isArray(session.accessibleStoreIds)
        ? session.accessibleStoreIds.map((entry) => String(entry || '').trim()).filter(Boolean)
        : [session.storeId].filter(Boolean);
      storeRecords = storeRecords.filter((store) => {
        return allowedStoreIds.indexOf(String(store.id || '').trim()) >= 0;
      });
      if (!storeRecords.length && session.storeId) {
        storeRecords = [{
          id: session.storeId,
          name: session.store || 'Assigned Store',
        }];
      }
    }
    if (storeRecords.length) {
      storeNames = storeRecords.map((store) => String(store.name || '').trim()).filter(Boolean);
      const requestedStoreId = new URLSearchParams(window.location.search).get('storeId') ||
        session.currentStoreId ||
        session.storeId;
      const requestedIndex = storeRecords.findIndex((store) => {
        return String(store.id || '') === String(requestedStoreId || '');
      });
      storeIndex = requestedIndex >= 0 ? requestedIndex : 0;
    }
    customers = ['Walk-in Customer'].concat(
      (Array.isArray(loaded[2]) ? loaded[2] : [])
        .map((customer) => String(customer.name || '').trim())
        .filter(Boolean)
        .filter((name) => name.toLowerCase() !== 'walk-in customer')
    );
  } catch (error) {
    showToast(window.IMS_HTTP.getErrorMessage(error));
  }

  renderProducts();
  updateClock();
  syncStoreLabel();
  syncCustomerLabel();
  updateCart();
  updateProductVisibility();
  await renderReservedProducts();
  setInterval(updateClock, 30000);
})();
