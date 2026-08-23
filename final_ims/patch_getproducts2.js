const fs = require('fs');
let file = 'd:/FFSD/18_stockOverflow/final_ims/frontend/customer module/product-detail.html';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/await window\.ImsApi\.getProducts\(\);/, "await window.ImsApi.getProducts(false, localStorage.getItem('imsSelectedStoreId'));");
fs.writeFileSync(file, content);
