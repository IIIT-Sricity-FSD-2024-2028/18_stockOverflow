const fs = require('fs');
let file = fs.readFileSync('d:/FFSD/18_stockOverflow/final_ims/backend/data/db.json', 'utf8');
const data = JSON.parse(file);
if (!data.products.find(p => p.sku === 'PT016')) {
    const newProduct = {
        "id": "abc-123-def-456",
        "retailerId": "eea40a42-2284-47e8-89ef-c4d837017996",
        "sku": "PT016",
        "name": "Logitech MX Master 3",
        "category": "Electronics",
        "subcategory": "Accessories",
        "subCategory": "Accessories",
        "brand": "Logitech",
        "priceUSD": 99,
        "price": 99,
        "discountType": "none",
        "finalPrice": 99,
        "taxType": "Inclusive",
        "unit": "Pc",
        "qty": 250,
        "initialQty": 250,
        "min": 50,
        "max": 400,
        "creator": "AI Assistant",
        "creatorImg": "https://picsum.photos/seed/product31/400",
        "productImg": "https://picsum.photos/seed/product32/400",
        "galleryImages": [
            "https://picsum.photos/seed/product32/400"
        ],
        "images": []
    };
    data.products.push(newProduct);
    fs.writeFileSync('d:/FFSD/18_stockOverflow/final_ims/backend/data/db.json', JSON.stringify(data, null, 2));
}
