const fs = require('fs');
let file = fs.readFileSync('d:/FFSD/18_stockOverflow/final_ims/frontend/customer module/product-detail.html', 'utf8');

const regex = /<button class="reserve-btn" id="addToCartBtn">\+ Reserve<\/button>\s*<\/div>\s*<!-- Tag row: SKU \/ Category \/ Stock status \/ Brand -->/s;

const newHtml = <button class="reserve-btn" id="addToCartBtn">+ Reserve</button>
            </div>

            <div style="margin-bottom: 12px; background: #f8fafc; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0;">
              <label for="detailStoreSelect" style="display:block; font-size:12px; font-weight:600; color:#475569; margin-bottom:6px;">Select Store to Reserve From <span style="color:#ef4444;">*</span></label>
              <select id="detailStoreSelect" style="width: 100%; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 13px; outline: none;">
                <option value="">Loading stores...</option>
              </select>
            </div>

            <!-- Tag row: SKU / Category / Stock status / Brand -->;

file = file.replace(regex, newHtml);
fs.writeFileSync('d:/FFSD/18_stockOverflow/final_ims/frontend/customer module/product-detail.html', file);
