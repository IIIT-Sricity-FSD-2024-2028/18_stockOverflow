const fs = require('fs');
let file = fs.readFileSync('d:/FFSD/18_stockOverflow/final_ims/frontend/Retailer module/common-products.js', 'utf8');
const oldLine = /trend: 'up'\r?\n    \}\r?\n  \];/s;
const newLines = "trend: 'up'\n    },\n    {\n      sku: 'PT016',\n      name: 'Logitech MX Master 3',\n      category: 'Electronics',\n      brand: 'Logitech',\n      priceUSD: 99,\n      unit: 'Pc',\n      qty: 250,\n      max: 400,\n      creator: 'AI Assistant',\n      creatorImg: 'https://picsum.photos/seed/product31/400',\n      productImg: 'https://picsum.photos/seed/product32/400',\n      emoji: 'dY\"',\n      soldThisMonth: 89,\n      trend: 'up'\n    }\n  ];";
file = file.replace(oldLine, newLines);
fs.writeFileSync('d:/FFSD/18_stockOverflow/final_ims/frontend/Retailer module/common-products.js', file);
