(function () {
  const currencyFormatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  });

  const formatInr = (amount) => currencyFormatter.format(amount);
  const toast = document.getElementById('toast');
  let toastTimer = null;
  let transactions = [];

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

    if (!currentTransactions.length) {
      container.innerHTML = '';
      emptyState.style.display = 'block';
      document.getElementById('totalOrders').textContent = '0';
      document.getElementById('totalRevenue').textContent = formatInr(0);
      document.getElementById('totalItems').textContent = '0';
      return;
    }

    emptyState.style.display = 'none';
    let totalItems = 0;
    let totalRevenue = 0;

    container.innerHTML = currentTransactions.map((trans, index) => {
      const itemCount = (trans.items || []).reduce((sum, item) => sum + (item.quantity || 0), 0);
      totalItems += itemCount;
      totalRevenue += Number(trans.finalTotal || 0);

      return `
        <div class="transaction-card">
          <div>
            <div class="trans-header">
              <span class="trans-id">${trans.orderId}</span>
              <span class="trans-date">${new Date(trans.timestamp).toLocaleString('en-IN')}</span>
            </div>
            <div class="trans-customer">Customer: ${trans.customer}</div>
            <div class="trans-items">${itemCount} items from ${trans.store}</div>
            <div class="trans-total">${formatInr(trans.finalTotal)}</div>
          </div>
          <div class="trans-actions">
            <button class="trans-btn" onclick="window.showTransactionDetails(${index})">View</button>
            <button class="trans-btn" onclick="window.editTransactionInventory(${index})">Edit Inventory</button>
            <button class="trans-btn trans-btn-danger" onclick="window.deleteTransaction(${index})">Delete</button>
          </div>
        </div>
      `;
    }).join('');

    document.getElementById('totalOrders').textContent = String(currentTransactions.length);
    document.getElementById('totalRevenue').textContent = formatInr(totalRevenue);
    document.getElementById('totalItems').textContent = String(totalItems);
  }

  window.showTransactionDetails = function (index) {
    const transaction = transactions[index];
    if (!transaction) return;
    const details = transaction.items
      .map((item) => item.name + ' x ' + item.quantity + ' = ' + formatInr(item.total))
      .join('\n');
    alert('Order: ' + transaction.orderId + '\nCustomer: ' + transaction.customer + '\n\n' + details + '\n\nTotal: ' + formatInr(transaction.finalTotal));
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
  setInterval(renderTransactions, 5000);
})();
