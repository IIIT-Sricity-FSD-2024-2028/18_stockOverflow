
>   <script>
      document.addEventListener('DOMContentLoaded', () => {
        const container = document.getElementById('cartItemsContainer');
        const subtotalEl = document.getElementById('summarySubtotal');
        const taxesEl = document.getElementById('summaryTaxes');
        const totalEl = document.getElementById('summaryTotal');
        const checkoutBtn = document.getElementById('checkoutBtn');
  
        const renderCart = () => {
          const state = JSON.parse(localStorage.getItem('imsAppStateV1') || '{}');
          const cart = state.cart || [];
          
          container.innerHTML = '';
          if (cart.length === 0) {
            container.innerHTML = `
              <div class="empty-state">
                <h2>No items reserved</h2>
                <p>Looks like you haven't added anything to reserve yet.</p>
                <a href="productsearch.html">Browse Catalog</a>
              </div>
            `;
            subtotalEl.textContent = '$0.00';
            taxesEl.textContent = '$0.00';
            totalEl.textContent = '$0.00';
            checkoutBtn.style.opacity = '0.5';
            checkoutBtn.style.pointerEvents = 'none';
            return;
          }
  
          let subtotal = 0;
          cart.forEach(item => {
            subtotal += item.price * item.qty;
            const div = document.createElement('div');
            div.className = 'cart-item';
            div.innerHTML = `
              <div class="item-img" style="overflow:hidden; background:#fff; padding:4px;">
                <img src="${item.productImg || 'https://picsum.photos/seed/' + item.sku + '/400'}" alt="${item.name}" 
style="width:100%;height:100%;object-fit:contain;" 
onerror="this.style.display='none';this.nextElementSibling.style.display='block';" />
                <div style="display:none; font-size:24px;">????</div>
              </div>
              <div class="item-info">
                <div class="item-name">${item.name}</div>
                <div class="item-sku">SKU: ${item.sku}</div>
              </div>
              <div class="qty-control">
                <button class="qty-btn" onclick="window.updateCartItem('${item.sku}', ${item.qty - 1}); 
location.reload()">-</button>
                <div class="qty-val">${item.qty}</div>
                <button class="qty-btn" onclick="window.updateCartItem('${item.sku}', ${item.qty + 1}); 
location.reload()">+</button>
              </div>
              <div class="item-price">$${(item.price * item.qty).toFixed(2)}</div>
              <button class="remove-btn" onclick="window.removeFromCart('${item.sku}'); 
location.reload()">Remove</button>
            `;
            container.appendChild(div);
          });
  
          const taxes = subtotal * 0.08; // 8% mock tax
          const total = subtotal + taxes;
          
          subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
          taxesEl.textContent = `$${taxes.toFixed(2)}`;
          totalEl.textContent = `$${total.toFixed(2)}`;
          
          // Save to order summary for receipt
          state.lastOrderSummary = {
             total: `$${total.toFixed(2)}`,
             date: new Date().toISOString(),
             source: 'store-reservation'
          };
          localStorage.setItem('imsAppStateV1', JSON.stringify(state));
          
          checkoutBtn.style.opacity = '1';
          checkoutBtn.style.pointerEvents = 'auto';
        };
  
        renderCart();
      });
    </script>
  </body>
  </html>


