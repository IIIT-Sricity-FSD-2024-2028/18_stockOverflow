const fs = require('fs');

// First let's update supplier.css to ensure modal-bg has .active and .open
let css = fs.readFileSync('React-frontend/src/supplier/supplier.css', 'utf8');
if (!css.includes('.modal-bg.active')) {
  css = css.replace('.modal-bg.open{display:flex}', '.modal-bg.open, .modal-bg.active{display:flex}');
  fs.writeFileSync('React-frontend/src/supplier/supplier.css', css);
  console.log('Updated supplier.css with .modal-bg.active');
}

console.log('Building pristine SupplierDashboard.jsx...');
