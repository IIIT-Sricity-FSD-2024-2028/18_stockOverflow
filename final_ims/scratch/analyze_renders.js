const fs = require('fs');
const js = fs.readFileSync('scratch/vanilla_dashboard_script.js', 'utf8');

// Find all functions with 'render' in name
const renderFns = [...js.matchAll(/function\s+([a-zA-Z0-9_]*render[a-zA-Z0-9_]*)\s*\(/gi)].map(m => m[1]);
console.log('Render functions:', renderFns);

// Find table tbodys or elements updated by innerHTML
const innerHTMLs = [...js.matchAll(/document\.getElementById\(['"]([^'"]+)['"]\)\.innerHTML/g)].map(m => m[1]);
console.log('Elements with innerHTML:', [...new Set(innerHTMLs)]);

// Find all document.getElementById calls
const elementIds = [...js.matchAll(/document\.getElementById\(['"]([^'"]+)['"]\)/g)].map(m => m[1]);
console.log('Unique element IDs manipulated:', [...new Set(elementIds)].length);
