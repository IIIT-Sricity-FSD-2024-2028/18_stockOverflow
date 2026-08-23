const fs = require('fs');
let file = fs.readFileSync('d:/FFSD/18_stockOverflow/final_ims/frontend/customer module/app-flow.js', 'utf8');

const oldChange = /storeDropdown\.addEventListener\('change', \(e\) => \{.*?setTimeout\(\(\) => location\.reload\(\), 500\);\s*\}\s*\}\);/s;

const newChange = "storeDropdown.addEventListener('change', (e) => {\n        const val = e.target.value;\n        if (val === 'auto') {\n          if (navigator.geolocation) {\n            toast('Locating nearest store...');\n            navigator.geolocation.getCurrentPosition(\n              (position) => {\n                setTimeout(() => {\n                  toast('Located nearest store: Downtown Flagship');\n                  storeDropdown.value = 'S001';\n                  localStorage.setItem('imsSelectedStoreName', 'Downtown Flagship');\n                  storeDropdown.dispatchEvent(new Event('change')); // trigger filter\n                }, 800);\n              },\n              (error) => {\n                toast('Location access denied. Please select manually.');\n                storeDropdown.value = '';\n              }\n            );\n          } else {\n            toast('Geolocation not supported by browser.');\n            storeDropdown.value = '';\n          }\n        } else {\n          const selectedText = storeDropdown.options[storeDropdown.selectedIndex].text;\n          const storeName = val === '' ? 'Global' : selectedText.split(' (')[0];\n          localStorage.setItem('imsSelectedStoreName', storeName);\n          toast('Store set to: ' + storeName);\n        }\n      });";

file = file.replace(oldChange, newChange);
fs.writeFileSync('d:/FFSD/18_stockOverflow/final_ims/frontend/customer module/app-flow.js', file);
