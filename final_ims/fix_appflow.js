const fs = require('fs');
let file = fs.readFileSync('d:/FFSD/18_stockOverflow/final_ims/frontend/customer module/app-flow.js', 'utf8');

const regex = /          if \\(mainImg && nextImgSrc\\) \\{\\s*main\\.innerHTML = '';\\s*main\\.appendChild\\(mainImg\\);\\s*mainImg\\.style\\.display = '';\\s*mainImg\\.src = nextImgSrc;\\s*return;\\s*\\}\\s*const ctaPrimary = document\\.querySelector\\('\\.cta-primary'\\);/s;

const newCode = \          if (mainImg && nextImgSrc) {
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

        window.addToCart({
          sku,
          name,
          price,
          productImg,
          qty: 1,
          storeId,
          storeName
        });
      });
    }
  };

  const wireConsumerLanding = () => {
    const ctaPrimary = document.querySelector('.cta-primary');\;

let newFile = file.replace(regex, newCode);
if (newFile === file) {
  console.log("NO MATCH FOUND!");
}
fs.writeFileSync('d:/FFSD/18_stockOverflow/final_ims/frontend/customer module/app-flow.js', newFile);
