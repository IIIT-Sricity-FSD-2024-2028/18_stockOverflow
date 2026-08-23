const fs = require('fs');
let file = fs.readFileSync('d:/FFSD/18_stockOverflow/final_ims/frontend/customer module/app-flow.js', 'utf8');

const oldChange = /storeDropdown\.addEventListener\('change', \(e\) => \{.*?\/\/\s*Save manual selection.*?const storeName = val === '' \? 'Global' : selectedText\.split\(' \('\)\[0\];\s*localStorage\.setItem\('imsSelectedStoreName', storeName\);\s*toast\(\Store set to: \$\{storeName\}\\);\s*\}\s*\}\);/s;

const newChange = storeDropdown.addEventListener('change', (e) => {
          const val = e.target.value;
          if (val === 'auto') {
            // Simulate Geolocation API request
            if (navigator.geolocation) {
              toast('Requesting location access...');
              navigator.geolocation.getCurrentPosition(
                (position) => {
                  setTimeout(() => {
                    toast('Located nearest store: Downtown Flagship');
                    storeDropdown.value = 'S001'; // Defaulting to S001 for the demo
                    localStorage.setItem('imsSelectedStoreName', 'Downtown Flagship');
                    localStorage.setItem('imsSelectedStoreId', 'S001');
                    setTimeout(() => location.reload(), 500);
                  }, 800);
                },
                (err) => {
                  toast('Location access denied. Please select manually.');
                  storeDropdown.value = '';
                }
              );
            } else {
              toast('Geolocation not supported by this browser.');
            }
          } else {
            // Save manual selection
            const selectedText = storeDropdown.options[storeDropdown.selectedIndex].text;
            const storeName = val === '' ? 'Global' : selectedText.split(' (')[0];
            localStorage.setItem('imsSelectedStoreName', storeName);
            localStorage.setItem('imsSelectedStoreId', val);
            toast(\Store set to: \\);
            setTimeout(() => location.reload(), 500);
          }
        });;

file = file.replace(oldChange, newChange);
fs.writeFileSync('d:/FFSD/18_stockOverflow/final_ims/frontend/customer module/app-flow.js', file);
