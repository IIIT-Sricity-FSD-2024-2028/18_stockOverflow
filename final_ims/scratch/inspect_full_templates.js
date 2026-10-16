const fs = require('fs');
const js = fs.readFileSync('scratch/vanilla_dashboard_script.js', 'utf8');

function showAround(target, len = 2500) {
  const idx = js.indexOf(target);
  if (idx > -1) {
    console.log(`=== ${target} ===`);
    console.log(js.substring(idx, idx + len));
  }
}

showAround('row.innerHTML = `\n      <td><input type="checkbox"/></td>\n      <td style="font-family:\'Space Grotesk\'');
showAround('renderRetailers = function');
showAround('body.innerHTML = pageOrders.map');
showAround('breakdown.innerHTML = sortedRetailers');
