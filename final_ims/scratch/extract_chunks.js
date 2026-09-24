const fs = require('fs');
const html = fs.readFileSync('frontend/supplier module/supplier-dashboard.html', 'utf8');

function extractBetween(startStr, endStr) {
  const p1 = html.indexOf(startStr);
  if (p1 === -1) return null;
  const p2 = html.indexOf(endStr, p1);
  if (p2 === -1) return null;
  return html.substring(p1, p2);
}

// 1. Sidebar
const sidebar = extractBetween('<aside class="sidebar">', '</aside>') + '</aside>';
fs.writeFileSync('scratch/vanilla_sidebar.html', sidebar);

// 2. Topbar
const topbar = extractBetween('<header class="topbar">', '</header>') + '</header>';
fs.writeFileSync('scratch/vanilla_topbar.html', topbar);

// 3. Sections
const secDashboard = extractBetween('<div class="section active" id="sec-dashboard">', '<div class="section" id="sec-profile">');
fs.writeFileSync('scratch/sec_dashboard.html', secDashboard);

const secProfile = extractBetween('<div class="section" id="sec-profile">', '<div class="section" id="sec-products">');
fs.writeFileSync('scratch/sec_profile.html', secProfile);

const secProducts = extractBetween('<div class="section" id="sec-products">', '<div class="section" id="sec-orders">');
fs.writeFileSync('scratch/sec_products.html', secProducts);

const secOrders = extractBetween('<div class="section" id="sec-orders">', '<div class="section" id="sec-retailers">');
fs.writeFileSync('scratch/sec_orders.html', secOrders);

const secRetailers = extractBetween('<div class="section" id="sec-retailers">', '<div class="section" id="sec-performance">');
fs.writeFileSync('scratch/sec_retailers.html', secRetailers);

const secPerformance = extractBetween('<div class="section" id="sec-performance">', '<div class="section" id="sec-plan">');
fs.writeFileSync('scratch/sec_performance.html', secPerformance);

const secPlan = extractBetween('<div class="section" id="sec-plan">', '<!-- ══ MODAL: ADD PRODUCT ══ -->') || extractBetween('<div class="section" id="sec-plan">', '<div class="modal-bg" id="productModal">');
fs.writeFileSync('scratch/sec_plan.html', secPlan);

// 4. Modals
const modals = extractBetween('<div class="modal-bg" id="productModal">', '<script');
fs.writeFileSync('scratch/vanilla_modals.html', modals);

console.log('Extracted all sections and modals successfully!');
