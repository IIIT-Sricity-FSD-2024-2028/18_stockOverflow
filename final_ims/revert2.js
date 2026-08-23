const fs = require('fs');
['d:/FFSD/18_stockOverflow/final_ims/frontend/customer module/productsearch.html', 'd:/FFSD/18_stockOverflow/final_ims/frontend/customer module/consumer-landingpage.html', 'd:/FFSD/18_stockOverflow/final_ims/frontend/customer module/product-detail.html'].forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/await window\.ImsApi\.getProducts\(false, localStorage\.getItem\('imsSelectedStoreId'\)\);/g, "await window.ImsApi.getProducts();");
  fs.writeFileSync(file, content);
});
