const fs = require('fs');
const js = fs.readFileSync('scratch/vanilla_dashboard_script.js', 'utf8');

// 1. Find renderProducts template
const prodIdx = js.indexOf('renderProducts = function');
if (prodIdx > -1) {
  console.log('--- RENDER PRODUCTS SNIPPET ---');
  console.log(js.substring(prodIdx, prodIdx + 1200));
}

// 2. Find renderRetailers template
const retIdx = js.indexOf('renderRetailers = function');
if (retIdx > -1) {
  console.log('\n--- RENDER RETAILERS SNIPPET ---');
  console.log(js.substring(retIdx, retIdx + 1400));
}

// 3. Find renderOrders / mapBackendPurchaseOrderToDashboardOrder / order table render
const orderTableIdx = js.indexOf('ordersBody');
if (orderTableIdx > -1) {
  console.log('\n--- ORDERS BODY SNIPPET ---');
  console.log(js.substring(orderTableIdx - 100, orderTableIdx + 1200));
}

// 4. Find topRetailers snippet
const topRetIdx = js.indexOf('topRetailers.innerHTML');
if (topRetIdx > -1) {
  console.log('\n--- TOP RETAILERS SNIPPET ---');
  console.log(js.substring(topRetIdx - 100, topRetIdx + 1000));
}
