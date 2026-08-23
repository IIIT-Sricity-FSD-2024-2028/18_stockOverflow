const fs = require('fs');
let file = fs.readFileSync('d:/FFSD/18_stockOverflow/final_ims/frontend/js/mockData.js', 'utf8');
file = file.replace(/\.Split\("sku: '"\)\[1\]\.Substring\(0, 5\)\)\/400', emoji:[^}]+\},/g, '');
fs.writeFileSync('d:/FFSD/18_stockOverflow/final_ims/frontend/js/mockData.js', file);
