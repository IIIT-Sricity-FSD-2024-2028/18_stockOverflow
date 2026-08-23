const fs = require('fs');
['d:/FFSD/18_stockOverflow/final_ims/frontend/customer module/productsearch.html', 'd:/FFSD/18_stockOverflow/final_ims/frontend/customer module/consumer-landingpage.html'].forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/await window\.ImsApi\.getProducts\(\);/, "await window.ImsApi.getProducts(false, localStorage.getItem('imsSelectedStoreId'));");
  fs.writeFileSync(file, content);
});
