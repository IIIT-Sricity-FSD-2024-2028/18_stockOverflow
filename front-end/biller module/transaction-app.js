(function () {
  const session = JSON.parse(localStorage.getItem('so_session') || 'null');
  if (!session || session.role !== 'biller') {
    window.location.href = '../index.html';
    return;
  }
  if (!session.storeId || !Array.isArray(session.accessibleStoreIds) || !session.accessibleStoreIds.length) {
    window.location.href = '../auth/biller-pending.html';
    return;
  }

  const currencyFormatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  });

  const formatInr = (amount) => currencyFormatter.format(amount);
  const toast = document.getElementById('toast');
  let toastTimer = null;
  let transactions = [];

  const txSearchInput = document.getElementById('txSearchInput');
  const txPaymentFilter = document.getElementById('txPaymentFilter');

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

  async function loadTransactions() {
    transactions = await window.ImsApi.getTransactions();
    return transactions;
  }

  async function renderTransactions() {
    const container = document.getElementById('transactionsContainer');
    const emptyState = document.getElementById('emptyState');
    const currentTransactions = await loadTransactions();

    const searchQuery = (txSearchInput ? txSearchInput.value : '').trim().toLowerCase();
    const paymentFilter = txPaymentFilter ? txPaymentFilter.value.trim() : '';

    const filteredTransactions = currentTransactions.filter((trans) => {
      const matchesSearch = !searchQuery ||
        (trans.orderId || '').toLowerCase().includes(searchQuery) ||
        (trans.customer || '').toLowerCase().includes(searchQuery) ||
        (trans.store || '').toLowerCase().includes(searchQuery);
      const matchesPayment = !paymentFilter ||
        (trans.paymentMethod || '').toLowerCase() === paymentFilter.toLowerCase();

      return matchesSearch && matchesPayment;
    });

    if (!filteredTransactions.length) {
      container.innerHTML = '';
      emptyState.style.display = 'block';
      document.getElementById('totalOrders').textContent = String(currentTransactions.length);
      document.getElementById('totalRevenue').textContent = formatInr(currentTransactions.reduce((sum, t) => sum + (t.finalTotal || 0), 0));
      document.getElementById('totalItems').textContent = String(currentTransactions.reduce((sum, t) => sum + (Array.isArray(t.items) ? t.items.reduce((s, i) => s + (i.quantity || 0), 0) : 0), 0));
      return;
    }

    emptyState.style.display = 'none';
    let totalItems = 0;
    let totalRevenue = 0;

    container.innerHTML = filteredTransactions.map((trans) => {
      const index = transactions.findIndex(t => t.orderId === trans.orderId);
      const itemCount = (trans.items || []).reduce((sum, item) => sum + (item.quantity || 0), 0);
      totalItems += itemCount;
      totalRevenue += Number(trans.finalTotal || 0);

      const receiptLink = trans.receiptUrl
        ? `<a href="http://localhost:3001${trans.receiptUrl}" target="_blank" style="font-size:11px;color:var(--accent);font-weight:600;display:inline-flex;align-items:center;gap:3px;margin-top:4px;">📎 View Receipt Proof</a>`
        : `<button class="trans-btn" onclick="window.uploadReceiptForOrder('${trans.orderId}')" style="font-size:11px;padding:4px 8px;margin-top:4px;">📎 Upload Receipt</button>`;

      return `
        <div class="transaction-card">
          <div>
            <div class="trans-header">
              <span class="trans-id">${trans.orderId}</span>
              <span class="trans-date">${new Date(trans.timestamp).toLocaleString('en-IN')}</span>
              <span style="font-size:11px;font-weight:700;padding:2px 6px;background:#f3f4f6;border-radius:4px;color:#4b5563;">${trans.paymentMethod || 'Cash'}</span>
            </div>
            <div class="trans-customer">Customer: ${trans.customer}</div>
            <div class="trans-items">${itemCount} items from ${trans.store}</div>
            <div class="trans-total">${formatInr(trans.finalTotal)}</div>
            ${receiptLink}
          </div>
          <div class="trans-actions">
            <button class="trans-btn" onclick="window.showTransactionDetails(${index})">View Invoice</button>
            <button class="trans-btn" onclick="window.editTransactionInventory(${index})">Edit Items</button>
            <button class="trans-btn trans-btn-danger" onclick="window.deleteTransaction(${index})">Delete</button>
          </div>
        </div>
      `;
    }).join('');

    document.getElementById('totalOrders').textContent = String(currentTransactions.length);
    document.getElementById('totalRevenue').textContent = formatInr(currentTransactions.reduce((sum, t) => sum + (t.finalTotal || 0), 0));
    document.getElementById('totalItems').textContent = String(currentTransactions.reduce((sum, t) => sum + (Array.isArray(t.items) ? t.items.reduce((s, i) => s + (i.quantity || 0), 0) : 0), 0));
  }

  if (txSearchInput) txSearchInput.addEventListener('input', renderTransactions);
  if (txPaymentFilter) txPaymentFilter.addEventListener('change', renderTransactions);

  window.uploadReceiptForOrder = function (orderId) {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*,application/pdf';
    fileInput.onchange = async function () {
      if (!fileInput.files || !fileInput.files.length) return;
      const file = fileInput.files[0];
      const formData = new FormData();
      formData.append('file', file);

      try {
        const apiBase = window.API_BASE_URL || 'http://localhost:3001';
        const res = await fetch(`${apiBase}/api/transactions/${orderId}/receipt`, {
          method: 'POST',
          body: formData,
        });
        if (!res.ok) throw new Error('Failed to upload receipt');
        showToast('Receipt file attached to ' + orderId);
        await renderTransactions();
      } catch (err) {
        showToast(err.message || 'Error uploading receipt');
      }
    };
    fileInput.click();
  };

  window.showTransactionDetails = function (index) {
    const transaction = transactions[index];
    if (!transaction) return;
    const details = transaction.items
      .map((item) => item.name + ' x ' + item.quantity + ' = ' + formatInr(item.total))
      .join('\n');
    alert('Order ID: ' + transaction.orderId + '\nCustomer: ' + transaction.customer + '\nStore: ' + transaction.store + '\nPayment Method: ' + transaction.paymentMethod + '\n\n' + details + '\n\nSubtotal: ' + formatInr(transaction.subtotal || 0) + '\nShipping: ' + formatInr(transaction.shipping || 0) + '\nTax: ' + formatInr(transaction.tax || 0) + '\nDiscount: -' + formatInr(transaction.discount || 0) + '\nTotal Payable: ' + formatInr(transaction.finalTotal));
  };

  window.editTransactionInventory = function (index) {
    const transaction = transactions[index];
    if (!transaction) return;

    const modal = document.getElementById('editModal');
    const itemsDiv = document.getElementById('modalItems');
    itemsDiv.innerHTML = transaction.items.map((item, itemIndex) => `
      <div class="modal-item">
        <div class="modal-item-name">${item.name}</div>
        <div class="modal-item-qty">
          <span>Qty:</span>
          <input type="number" class="qty-input" min="0" value="${item.quantity}" data-index="${itemIndex}" />
        </div>
      </div>
    `).join('');

    window.currentEditTransactionIndex = index;
    modal.classList.add('show');
  };

  window.deleteTransaction = async function (index) {
    const transaction = transactions[index];
    if (!transaction) return;
    if (!window.confirm('Delete this transaction? Inventory will be recalculated.')) {
      return;
    }

    try {
      await window.ImsApi.deleteTransaction(transaction.orderId);
      showToast('Transaction deleted');
      await renderTransactions();
    } catch (error) {
      showToast(window.IMS_HTTP.getErrorMessage(error));
    }
  };

  document.getElementById('confirmBtn').addEventListener('click', async function () {
    const transaction = transactions[window.currentEditTransactionIndex];
    if (!transaction) return;

    const inputs = Array.from(document.querySelectorAll('.qty-input'));
    const nextItems = transaction.items.map((item, index) => {
      const input = inputs.find((entry) => Number(entry.getAttribute('data-index')) === index);
      const quantity = Math.max(0, Number(input ? input.value : item.quantity) || 0);
      return {
        ...item,
        quantity: quantity,
        total: Number((quantity * Number(item.price || 0)).toFixed(2)),
      };
    });

    try {
      await window.ImsApi.updateTransaction(transaction.orderId, {
        items: nextItems,
      });
      document.getElementById('editModal').classList.remove('show');
      showToast('Transaction updated');
      await renderTransactions();
    } catch (error) {
      showToast(window.IMS_HTTP.getErrorMessage(error));
    }
  });

  document.getElementById('cancelBtn').addEventListener('click', function () {
    document.getElementById('editModal').classList.remove('show');
  });

  document.getElementById('backBtn').addEventListener('click', function () {
    window.location.href = 'pos.html';
  });

  document.getElementById('syncBtn').addEventListener('click', async function () {
    try {
      await window.ImsApi.reconcileInventory();
      showToast('Inventory synced');
      await renderTransactions();
    } catch (error) {
      showToast(window.IMS_HTTP.getErrorMessage(error));
    }
  });

  renderTransactions();
})();

