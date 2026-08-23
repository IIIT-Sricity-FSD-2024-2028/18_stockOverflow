const fs = require('fs');
let file = fs.readFileSync('d:/FFSD/18_stockOverflow/final_ims/frontend/js/mockData.js', 'utf8');
const oldLine = /\{ sku: 'PT015'.*?\n/s;
const newLines = "    { sku: 'PT015', name: 'Nike Air Max 2025', category: 'Footwear', brand: 'Nike', priceUSD: 189, unit: 'Pc', qty: 210, max: 400, creator: 'John Weaver', creatorImg: '', productImg: 'https://picsum.photos/seed/PT015/400', emoji: 'dYY', soldThisMonth: 47, trend: 'up', min: 35 },\n    { sku: 'PT016', name: 'Logitech MX Master 3', category: 'Accessories', brand: 'Logitech', priceUSD: 99, unit: 'Pc', qty: 250, max: 400, creator: 'AI Assistant', creatorImg: '', productImg: 'https://picsum.photos/seed/PT016/400', emoji: 'dY\"', soldThisMonth: 89, trend: 'up', min: 50 }\n";
file = file.replace(oldLine, newLines);
fs.writeFileSync('d:/FFSD/18_stockOverflow/final_ims/frontend/js/mockData.js', file);
