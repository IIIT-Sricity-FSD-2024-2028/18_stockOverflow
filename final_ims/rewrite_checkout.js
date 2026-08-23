const fs = require('fs');
let file = fs.readFileSync('d:/FFSD/18_stockOverflow/final_ims/frontend/customer module/checkout.html', 'utf8');

const oldHtml = /<div class="store-badge">.*?<script src="app-flow\.js"><\/script>\s*<script>.*?<\/script>/s;

const newHtml = <div class="store-badge">
          dY"? Reserving at: <strong id="selectedStoreDisplay">Loading...</strong>
        </div>

        <form id="checkoutForm">
          <div class="section-title">Contact Information</div>
          <div class="form-group">
            <label>Full Name</label>
            <input type="text" id="custName" placeholder="John Doe" required>
          </div>
          <div class="form-group">
            <label>Email Address</label>
            <input type="email" id="custEmail" placeholder="john@example.com" required>
          </div>

          <div class="section-title">Store Selection</div>
          <div class="form-group">
            <label>Select Store</label>
            <select id="checkoutStoreSelect" required>
              <option value="">Loading stores...</option>
            </select>
          </div>

          <div class="section-title">Payment Preference</div>
          <p style="font-size:12px;color:var(--text-muted);margin-bottom:12px;">Payment will be collected at the store.</p>
          <div class="form-group">
            <select id="paymentMethod" required>
              <option value="Card">Pay with Card at Store</option>
              <option value="Cash">Pay with Cash at Store</option>
              <option value="UPI">Pay with UPI at Store</option>
            </select>
          </div>

          <button type="submit" class="submit-btn">Confirm Reservation</button>
        </form>
        <a href="cart.html" class="back-link">Return to Cart</a>
      </div>
    </div>
  </div>

  <script src="../retailer module/common-products.js"></script>
  <script src="../js/api-config.js"></script>
  <script src="../js/commerce-api.js"></script>
  <script src="app-flow.js"></script>
  <script>
    document.addEventListener('DOMContentLoaded', async () => {
      // Load Stores
      const storeSelect = document.getElementById('checkoutStoreSelect');
      try {
        const stores = await window.ImsApi.getStores();
        storeSelect.innerHTML = stores.map(s => \<option value="\">\</option>\).join('');
        
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
      const paymentMethod = document.getElementById('paymentMethod').value;
      
      const session = JSON.parse(localStorage.getItem('so_session') || '{}');
      const state = JSON.parse(localStorage.getItem('imsAppStateV1') || '{}');
      const cart = state.cart || [];
      
      if (cart.length === 0) {
        alert('Your cart is empty!');
        window.location.href = 'cart.html';
        return;
      }

      try {
        // Submit a reservation request for EACH item in the cart
        for (const item of cart) {
          await window.ImsApi.createReservationRequest({
            sku: item.sku,
            qty: item.qty,
            customer: document.getElementById('custName').value,
            customerEmail: document.getElementById('custEmail').value,
            customerId: session.id || undefined,
            storeId: storeId,
            store: storeName,
            paymentMethod: paymentMethod
          });
        }
        
        // Clear cart
        window.clearCart();
        window.location.href = 'orders.html?fromReserve=1';
      } catch (error) {
        alert(window.IMS_HTTP.getErrorMessage(error));
        btn.textContent = 'Confirm Reservation';
        btn.style.opacity = '1';
        btn.disabled = false;
      }
    });
  </script>;

file = file.replace(oldHtml, newHtml.replace(/dY"\?/g, '??'));
fs.writeFileSync('d:/FFSD/18_stockOverflow/final_ims/frontend/customer module/checkout.html', file);
