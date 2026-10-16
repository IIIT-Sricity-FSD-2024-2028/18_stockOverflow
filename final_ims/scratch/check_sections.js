const fs = require('fs');
const html = fs.readFileSync('frontend/supplier module/supplier-dashboard.html', 'utf8');

const markers = [
  'id="sec-dashboard"',
  'id="sec-profile"',
  'id="sec-products"',
  'id="sec-orders"',
  'id="sec-retailers"',
  'id="sec-performance"',
  'id="sec-plan"',
  'id="productModal"'
];

for (let i = 0; i < markers.length - 1; i++) {
  const p1 = html.indexOf(markers[i]);
  const p2 = html.indexOf(markers[i+1]);
  console.log(`${markers[i]} -> ${markers[i+1]}: range ${p1} to ${p2} (length: ${p2 - p1})`);
}
