const fs = require('fs');
const js = fs.readFileSync('scratch/vanilla_dashboard_script.js', 'utf8');

// Find function declarations
const fns = [...js.matchAll(/function\s+([a-zA-Z0-9_]+)\s*\(/g)].map(m => m[1]);
console.log('Functions:', fns);

// Find fetch calls
const fetches = [...js.matchAll(/fetch\s*\(\s*[`'"]([^`'"]+)/g)].map(m => m[1]);
console.log('Fetches:', fetches);

// Find variables
const lets = [...js.matchAll(/(?:let|const|var)\s+([a-zA-Z0-9_]+)\s*=/g)].map(m => m[1]);
console.log('Variables sample:', lets.slice(0, 30));
