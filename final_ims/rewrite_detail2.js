const fs = require('fs');
let file = fs.readFileSync('d:/FFSD/18_stockOverflow/final_ims/frontend/customer module/product-detail.html', 'utf8');

const oldHtml = '      document.addEventListener(\'DOMContentLoaded\', async function() {\n        try {\n          await loadProductDetails();\n        } catch (error) {';

const newHtml =       document.addEventListener('DOMContentLoaded', async function() {
        try {
          await loadProductDetails();
          
          // Load Stores for select
          const storeSelect = document.getElementById('detailStoreSelect');
          if (storeSelect) {
            const stores = await window.ImsApi.getStores();
            storeSelect.innerHTML = '<option value="">Select a store...</option>' + stores.map(s => '<option value="' + s.id + '">' + s.name + '</option>').join('');
            
            // Auto-select based on previous location setting
            const savedStoreId = localStorage.getItem('imsSelectedStoreId');
            if (savedStoreId) {
              storeSelect.value = savedStoreId;
            }
          }
        } catch (error) {;

file = file.replace(oldHtml, newHtml);
fs.writeFileSync('d:/FFSD/18_stockOverflow/final_ims/frontend/customer module/product-detail.html', file);
