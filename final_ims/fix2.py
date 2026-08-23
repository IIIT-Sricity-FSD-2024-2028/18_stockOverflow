import sys
import re

with open(r'd:\FFSD\18_stockOverflow\final_ims\frontend\customer module\app-flow.js', 'r', encoding='utf-8') as f:
    content = f.read()

prefix = "  const wireProductDetail = () => {"
parts = content.split(prefix)

new_tail = """
    const thumbs = Array.from(document.querySelectorAll('.thumb'));
    const main = document.querySelector('.img-main');
    const mainImg = document.querySelector('#product-main-img');
    if (thumbs.length && main) {
      thumbs.forEach((thumb) => {
        thumb.addEventListener('click', () => {
          thumbs.forEach((t) => t.classList.remove('active'));
          thumb.classList.add('active');

          const thumbImg = thumb.querySelector('img');
          const nextImgSrc = thumb.dataset.img || thumbImg?.getAttribute('src');
          if (mainImg && nextImgSrc) {
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
    if (ctaPrimary) ctaPrimary.addEventListener('click', () => { window.location.href = 'productsearch.html'; });
    if (ctaSecondary) ctaSecondary.addEventListener('click', () => { window.location.href = 'orders.html'; });
  };
"""

# Extract wireDelegatedActions and below
actions_part = "  const wireDelegatedActions = () => {"
tail_parts = parts[1].split(actions_part)
rest_of_file = actions_part + tail_parts[1]

final_content = parts[0] + prefix + new_tail + "\n" + rest_of_file

with open(r'd:\FFSD\18_stockOverflow\final_ims\frontend\customer module\app-flow.js', 'w', encoding='utf-8') as f:
    f.write(final_content)
print("FIXED")
