const fs = require('fs');
let file = fs.readFileSync('d:/FFSD/18_stockOverflow/final_ims/frontend/js/commerce-api.js', 'utf8');
const oldBody = /async function getProducts\(force, storeId\) \{\s*if \(\!force && Array\.isArray\(cache\.products\)\) \{\s*return clone\(cache\.products\);\s*\}\s*cache\.products = await window\.IMS_HTTP\.request\(withStaffScopeQuery\('\/products'\)\);\s*return clone\(cache\.products\);\s*\}/s;
const newBody = "async function getProducts(force, storeId) {\n      if (storeId) {\n        // Fetch dynamic location-based inventory directly without cache\n        return window.IMS_HTTP.request(withStaffScopeQuery('/products?storeId=' + encodeURIComponent(storeId)));\n      }\n      if (!force && Array.isArray(cache.products)) {\n        return clone(cache.products);\n      }\n      cache.products = await window.IMS_HTTP.request(withStaffScopeQuery('/products'));\n      return clone(cache.products);\n    }";
file = file.replace(oldBody, newBody);
fs.writeFileSync('d:/FFSD/18_stockOverflow/final_ims/frontend/js/commerce-api.js', file);
