import sys
import re

with open(r'd:\FFSD\18_stockOverflow\final_ims\frontend\customer module\app-flow.js', 'r', encoding='utf-8') as f:
    content = f.read()

old_str = """          if (mainImg && nextImgSrc) {
            main.innerHTML = '';
            main.appendChild(mainImg);
            mainImg.style.display = '';
            mainImg.src = nextImgSrc;
            return;
          }"""

new_str = """          if (mainImg && nextImgSrc) {
            main.innerHTML = '';
            main.appendChild(mainImg);
            mainImg.style.display = '';
            mainImg.src = nextImgSrc;
            return;
          }

          if (!mainImg) {
            main.textContent = thumb.textContent;
          }
        });
      });
    }

    /* [Shopping Cart] Wire up the Add to Cart button */
    const addBtn = document.getElementById('addToCartBtn');
    if (addBtn) {
      addBtn.addEventListener('click', (e) => {
        e.preventDefault();
        
        const storeSelect = document.getElementById('detailStoreSelect');
        if (storeSelect && !storeSelect.value) {
          alert('Please select a store to reserve from!');
          return;
        }
        
        const storeId = storeSelect ? storeSelect.value : null;
        const storeName = storeSelect ? storeSelect.options[storeSelect.selectedIndex].text : null;
        
        const sku = document.getElementById('breadcrumb-sku')?.textContent?.trim().split(' ').pop() || localStorage.getItem('imsSelectedSku') || 'UNKNOWN-SKU';
        const name = document.getElementById('product-name')?.textContent?.trim() || localStorage.getItem('imsSelectedProduct') || 'Product';
        const priceText = document.getElementById('spec-price')?.textContent || '.99'; 
        const price = parseFloat(priceText.replace(/[^0-9.]/g, '')) || 99.99;
        
        const mainImgEl = document.querySelector('#product-main-img');
        const productImg = mainImgEl ? mainImgEl.getAttribute('src') : '';

        if (typeof window.addToCart === 'function') {
          window.addToCart({
            sku,
            name,
            price,
            productImg,
            qty: 1,
            storeId,
            storeName
          });
        }
      });
    }
  };

  const wireConsumerLanding = () => {
    const ctaPrimary = document.querySelector('.cta-primary');
    const ctaSecondary = document.querySelector('.cta-secondary');
    if (ctaPrimary) ctaPrimary.addEventListener('click', () => go('productsearch.html'));
    if (ctaSecondary) ctaSecondary.addEventListener('click', () => go('orders.html'));
  };"""

# I need to restore the whole thing. Let's see what remains first.
