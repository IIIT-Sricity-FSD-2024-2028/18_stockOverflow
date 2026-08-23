const fs = require('fs');
let file = fs.readFileSync('d:/FFSD/18_stockOverflow/final_ims/frontend/customer module/checkout.html', 'utf8');

const htmlRegex = /\s*<div class="section-title">Store Selection<\/div>\s*<div class="form-group">\s*<label>Select Store<\/label>\s*<select id="checkoutStoreSelect" required>\s*<option value="">Loading stores\.\.\.<\/option>\s*<\/select>\s*<\/div>/g;
file = file.replace(htmlRegex, '');

const oldScript =       document.addEventListener('DOMContentLoaded', async () => {
        // Load Stores
        const storeSelect = document.getElementById('checkoutStoreSelect');
        try {
          const stores = await window.ImsApi.getStores();
          storeSelect.innerHTML = stores.map(s => \\\<option value="\\\">\\\</option>\\\).join('');
          
          // Auto-select based on previous location setting
          const savedStoreId = localStorage.getItem('imsSelectedStoreId');
          if (savedStoreId) {
            storeSelect.value = savedStoreId;
          }
        } catch (err) {
          storeSelect.innerHTML = '<option value="S001">Downtown Flagship (Fallback)</option>';
        }

        const updateStoreDisplay = () => {
          if(storeSelect.options.length > 0 && storeSelect.selectedIndex >= 0) {
             document.getElementById('selectedStoreDisplay').textContent = storeSelect.options[storeSelect.selectedIndex].text;
          }
        };
        
        storeSelect.addEventListener('change', updateStoreDisplay);
        updateStoreDisplay();
        
        // Pre-fill Customer Details
        const session = JSON.parse(localStorage.getItem('so_session') || '{}');
        if (session.name) document.getElementById('custName').value = session.name;
        if (session.email) document.getElementById('custEmail').value = session.email;
      });

      document.getElementById('checkoutForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const btn = document.querySelector('.submit-btn');
        btn.textContent = 'Processing Reservation...';
        btn.style.opacity = '0.7';
        btn.disabled = true;

        const storeSelect = document.getElementById('checkoutStoreSelect');
        const storeId = storeSelect.value;
        const storeName = storeSelect.options[storeSelect.selectedIndex].text;
        const paymentMethod = document.getElementById('paymentMethod').value;;

const newScript =       document.addEventListener('DOMContentLoaded', async () => {
        // Pre-fill Customer Details
        const session = JSON.parse(localStorage.getItem('so_session') || '{}');
        if (session.name) document.getElementById('custName').value = session.name;
        if (session.email) document.getElementById('custEmail').value = session.email;
      });

      document.getElementById('checkoutForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const btn = document.querySelector('.submit-btn');
        btn.textContent = 'Processing Reservation...';
        btn.style.opacity = '0.7';
        btn.disabled = true;

        const paymentMethod = document.getElementById('paymentMethod').value;;

file = file.replace(oldScript, newScript);

const oldLoop =             await window.ImsApi.createReservationRequest({
              sku: item.sku,
              qty: item.qty,
              customer: document.getElementById('custName').value,
              customerEmail: document.getElementById('custEmail').value,
              customerId: session.id || undefined,
              storeId: storeId,
              store: storeName,
              paymentMethod: paymentMethod
            });;

const newLoop =             await window.ImsApi.createReservationRequest({
              sku: item.sku,
              qty: item.qty,
              customer: document.getElementById('custName').value,
              customerEmail: document.getElementById('custEmail').value,
              customerId: session.id || undefined,
              storeId: item.storeId || 'S001',
              store: item.storeName || 'Downtown Flagship',
              paymentMethod: paymentMethod
            });;

file = file.replace(oldLoop, newLoop);

fs.writeFileSync('d:/FFSD/18_stockOverflow/final_ims/frontend/customer module/checkout.html', file);
