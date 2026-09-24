const fs = require('fs');
const html = fs.readFileSync('frontend/supplier module/supplier-dashboard.html', 'utf8');
console.log('HTML size:', html.length);

const styleMatch = html.match(/<style>([\s\S]*?)<\/style>/);
if (styleMatch) {
  console.log('Style length:', styleMatch[1].length);
  fs.writeFileSync('React-frontend/src/supplier/supplier-dashboard-vanilla.css', styleMatch[1]);
  console.log('Saved CSS to React-frontend/src/supplier/supplier-dashboard-vanilla.css');
}

const secMatches = [...html.matchAll(/id="(sec-[^"]+)"/g)].map(m => m[1]);
console.log('Sections:', secMatches);

const modalMatches = [...html.matchAll(/id="([^"]*Modal[^"]*)"/g)].map(m => m[1]);
console.log('Modals:', modalMatches);

// Extract sidebar structure
const asideMatch = html.match(/<aside[\s\S]*?<\/aside>/);
if (asideMatch) {
  console.log('Found aside');
}

// Check script logic
const scriptMatches = [...html.matchAll(/<script(?![^>]*src)[^>]*>([\s\S]*?)<\/script>/g)];
console.log('Script count:', scriptMatches.length);
if (scriptMatches.length > 0) {
  fs.writeFileSync('scratch/vanilla_dashboard_script.js', scriptMatches[scriptMatches.length - 1][1]);
  console.log('Wrote vanilla script to scratch/vanilla_dashboard_script.js, length:', scriptMatches[scriptMatches.length - 1][1].length);
}
