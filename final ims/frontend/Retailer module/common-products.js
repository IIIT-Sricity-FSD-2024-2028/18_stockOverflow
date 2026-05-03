(function () {
  var STORAGE_KEY = 'imsRetailerProductsV1';
  const masterProducts = [
    {
      sku: 'PT001',
      name: 'Lenovo IdeaPad 3',
      category: 'Computers',
      brand: 'Lenovo',
      priceUSD: 600,
      unit: 'Pc',
      qty: 100,
      storeInventory: [{ storeId: 'u-retailer-1', qty: 100 }],
      stock: { 'u-retailer-1': 100 },
      max: 300,
      creator: 'James Kirwin',
      creatorImg: 'https://www.figma.com/api/mcp/asset/70e2ee73-c607-4c1f-9c9a-0cbe445512f4',
      productImg: 'https://www.figma.com/api/mcp/asset/735bdaa1-f070-4a7e-821c-e69bbf1186d2',
      emoji: '💻',
      soldThisMonth: 22,
      trend: 'up'
    },
    {
      sku: 'PT002',
      name: 'Beats Pro',
      category: 'Electronics',
      brand: 'Beats',
      priceUSD: 160,
      unit: 'Pc',
      qty: 140,
      max: 300,
      creator: 'Francis Chang',
      creatorImg: 'https://www.figma.com/api/mcp/asset/4875a3a0-18a8-4fb2-9c1f-69b908ec9417',
      productImg: 'https://www.figma.com/api/mcp/asset/6610a8dc-7159-4241-ae74-5f99b1198ee7',
      emoji: '🎧',
      soldThisMonth: 38,
      trend: 'up'
    },
    {
      sku: 'PT003',
      name: 'Nike Jordan',
      category: 'Shoe',
      brand: 'Nike',
      priceUSD: 110,
      unit: 'Pc',
      qty: 300,
      max: 500,
      creator: 'Antonio Engle',
      creatorImg: 'https://www.figma.com/api/mcp/asset/d5518c84-4bc4-4659-9958-20d59962e84b',
      productImg: 'https://www.figma.com/api/mcp/asset/0caf812b-4bf5-4855-b63b-1f531c9a1e2d',
      emoji: '👟',
      soldThisMonth: 54,
      trend: 'up'
    },
    {
      sku: 'PT004',
      name: 'Apple Series 5 Watch',
      category: 'Electronics',
      brand: 'Apple',
      priceUSD: 120,
      unit: 'Pc',
      qty: 450,
      max: 500,
      creator: 'Leo Kelly',
      creatorImg: 'https://www.figma.com/api/mcp/asset/e1dadb8b-184f-44fe-bdeb-1a51e1564eeb',
      productImg: 'https://www.figma.com/api/mcp/asset/5d50ee22-bc47-47b3-b9f4-61a4895fa547',
      emoji: '⌚',
      soldThisMonth: 17,
      trend: 'down'
    },
    {
      sku: 'PT005',
      name: 'Amazon Echo Dot',
      category: 'Electronics',
      brand: 'Amazon',
      priceUSD: 80,
      unit: 'Pc',
      qty: 320,
      max: 500,
      creator: 'Annette Walker',
      creatorImg: 'https://www.figma.com/api/mcp/asset/4de98c98-28bb-46b8-afad-9604e6e36268',
      productImg: 'https://www.figma.com/api/mcp/asset/c428762c-d427-4fd4-8783-a7ad64ea5b85',
      emoji: '🔊',
      soldThisMonth: 29,
      trend: 'up'
    },
    {
      sku: 'PT006',
      name: 'Sanford Chair Sofa',
      category: 'Furniture',
      brand: 'Modern Wave',
      priceUSD: 320,
      unit: 'Pc',
      qty: 650,
      max: 800,
      creator: 'John Weaver',
      creatorImg: 'https://www.figma.com/api/mcp/asset/d9a7af25-3f15-42c4-9589-96bd63ac9bca',
      productImg: 'https://www.figma.com/api/mcp/asset/97dece36-1822-41e2-ac5d-abf55c224abd',
      emoji: '🛋️',
      soldThisMonth: 8,
      trend: 'down'
    },
    {
      sku: 'PT007',
      name: 'Red Premium Satchel',
      category: 'Bags',
      brand: 'Dior',
      priceUSD: 60,
      unit: 'Pc',
      qty: 700,
      max: 800,
      creator: 'Gary Hennessy',
      creatorImg: 'https://www.figma.com/api/mcp/asset/38d4ff50-b365-4010-89a3-c4c7970201ca',
      productImg: 'https://www.figma.com/api/mcp/asset/97044a6f-0f4a-486c-ac45-ad0f2c5a0c62',
      emoji: '👜',
      soldThisMonth: 41,
      trend: 'up'
    },
    {
      sku: 'PT008',
      name: 'iPhone 14 Pro',
      category: 'Phone',
      brand: 'Apple',
      priceUSD: 540,
      unit: 'Pc',
      qty: 630,
      max: 800,
      creator: 'Eleanor Panek',
      creatorImg: 'https://www.figma.com/api/mcp/asset/0ea47749-df36-4768-bff0-50654a1e9123',
      productImg: 'https://www.figma.com/api/mcp/asset/37ec56a8-ac9e-4371-a973-68a8a931703c',
      emoji: '📱',
      soldThisMonth: 63,
      trend: 'up'
    },
    {
      sku: 'PT009',
      name: 'Gaming Chair',
      category: 'Furniture',
      brand: 'Arlime',
      priceUSD: 200,
      unit: 'Pc',
      qty: 410,
      max: 500,
      creator: 'William Levy',
      creatorImg: 'https://www.figma.com/api/mcp/asset/c443dd72-8038-47b5-9154-94f8138db7d3',
      productImg: 'https://www.figma.com/api/mcp/asset/8d113917-5b4a-4693-94f4-98177c4d6cc6',
      emoji: '🪑',
      soldThisMonth: 12,
      trend: 'down'
    },
    {
      sku: 'PT010',
      name: 'Borealis Backpack',
      category: 'Bags',
      brand: 'The North Face',
      priceUSD: 45,
      unit: 'Pc',
      qty: 550,
      max: 800,
      creator: 'Charlotte Klotz',
      creatorImg: 'https://www.figma.com/api/mcp/asset/7aa74334-d316-48b9-9833-a00521f5ebc1',
      productImg: 'https://www.figma.com/api/mcp/asset/3cca4ac4-77e6-416c-9fc3-97d627b98218',
      emoji: '🎒',
      soldThisMonth: 33,
      trend: 'up'
    },
    {
      sku: 'PT011',
      name: 'Sony WH-1000XM6',
      category: 'Electronics',
      brand: 'Sony',
      priceUSD: 349,
      unit: 'Pc',
      qty: 8,
      max: 300,
      creator: 'James Kirwin',
      creatorImg: 'https://www.figma.com/api/mcp/asset/70e2ee73-c607-4c1f-9c9a-0cbe445512f4',
      productImg: 'https://www.figma.com/api/mcp/asset/6610a8dc-7159-4241-ae74-5f99b1198ee7',
      emoji: '🎧',
      soldThisMonth: 55,
      trend: 'up'
    },
    {
      sku: 'PT012',
      name: 'MacBook Air M4',
      category: 'Computers',
      brand: 'Apple',
      priceUSD: 1099,
      unit: 'Pc',
      qty: 0,
      max: 200,
      creator: 'Francis Chang',
      creatorImg: 'https://www.figma.com/api/mcp/asset/4875a3a0-18a8-4fb2-9c1f-69b908ec9417',
      productImg: 'https://www.figma.com/api/mcp/asset/735bdaa1-f070-4a7e-821c-e69bbf1186d2',
      emoji: '💻',
      soldThisMonth: 19,
      trend: 'up'
    },
    {
      sku: 'PT013',
      name: "Levi's 512 Jeans",
      category: 'Fashion',
      brand: "Levi's",
      priceUSD: 79,
      unit: 'Pc',
      qty: 480,
      max: 600,
      creator: 'Leo Kelly',
      creatorImg: 'https://www.figma.com/api/mcp/asset/e1dadb8b-184f-44fe-bdeb-1a51e1564eeb',
      productImg: 'https://www.figma.com/api/mcp/asset/0caf812b-4bf5-4855-b63b-1f531c9a1e2d',
      emoji: '👖',
      soldThisMonth: 28,
      trend: 'up'
    },
    {
      sku: 'PT014',
      name: 'Dyson V16 Vacuum',
      category: 'Appliances',
      brand: 'Dyson',
      priceUSD: 599,
      unit: 'Pc',
      qty: 5,
      max: 150,
      creator: 'Annette Walker',
      creatorImg: 'https://www.figma.com/api/mcp/asset/4de98c98-28bb-46b8-afad-9604e6e36268',
      productImg: 'https://www.figma.com/api/mcp/asset/5d50ee22-bc47-47b3-b9f4-61a4895fa547',
      emoji: '🧹',
      soldThisMonth: 7,
      trend: 'down'
    },
    {
      sku: 'PT015',
      name: 'Nike Air Max 2025',
      category: 'Shoe',
      brand: 'Nike',
      priceUSD: 189,
      unit: 'Pc',
      qty: 210,
      max: 400,
      creator: 'John Weaver',
      creatorImg: 'https://www.figma.com/api/mcp/asset/d9a7af25-3f15-42c4-9589-96bd63ac9bca',
      productImg: 'https://www.figma.com/api/mcp/asset/c428762c-d427-4fd4-8783-a7ad64ea5b85',
      emoji: '👟',
      soldThisMonth: 47,
      trend: 'up'
    }
  ];

  const PRODUCT_ENRICHMENTS = {
    PT001: {
      category: 'Computers',
      subcategory: 'Laptops',
      supplier: 'Lenovo India Distribution Network',
      description: '15.6-inch everyday laptop with AMD Ryzen performance, 8 GB memory, 512 GB SSD storage, and a battery profile tuned for study, office work, and multitasking.',
      highlights: ['15.6-inch FHD anti-glare display', 'AMD Ryzen 5 class performance', '512 GB NVMe SSD', 'Wi-Fi 6 ready connectivity'],
      specs: { processor: 'AMD Ryzen 5', memory: '8 GB DDR4', storage: '512 GB SSD', display: '15.6-inch FHD', warranty: '1 year carry-in' },
      palette: ['#dbeafe', '#eff6ff', '#bfdbfe'],
      storeInventory: [{ storeId: 's1', qty: 34 }, { storeId: 's3', qty: 28 }, { storeId: 's7', qty: 38 }],
      feedback: [
        { customer: 'Aarav Mehta', rating: 5, type: 'Product Quality', comment: 'Boot time is quick and the keyboard feels solid for daily office work.', date: '2026-04-16T10:30:00Z' },
        { customer: 'Neha Sharma', rating: 4, type: 'Pricing Concern', comment: 'Very dependable for classes and spreadsheets. Battery is good for a full workday.', date: '2026-04-08T09:15:00Z' }
      ]
    },
    PT002: {
      category: 'Audio',
      subcategory: 'Headphones',
      supplier: 'Beats Consumer Audio Supply',
      description: 'Over-ear wireless headphones with active noise cancellation, deep bass tuning, and a travel-ready foldable frame.',
      highlights: ['Adaptive active noise cancellation', 'Spatial audio support', 'Fast charge via USB-C', 'Premium carrying pouch'],
      specs: { driver: '40 mm dynamic', battery: 'Up to 40 hours', weight: '260 g', connectivity: 'Bluetooth 5.3', warranty: '1 year' },
      palette: ['#fee2e2', '#fff1f2', '#fecaca'],
      storeInventory: [{ storeId: 's1', qty: 42 }, { storeId: 's6', qty: 39 }, { storeId: 's7', qty: 59 }],
      feedback: [
        { customer: 'Ritika Anand', rating: 5, type: 'Product Quality', comment: 'Noise cancellation is strong on flights and the headband is comfortable for long sessions.', date: '2026-04-20T12:40:00Z' },
        { customer: 'Soham Desai', rating: 4, type: 'Other', comment: 'Punchy sound signature and stable Bluetooth pairing across laptop and phone.', date: '2026-04-11T07:25:00Z' }
      ]
    },
    PT003: {
      category: 'Footwear',
      subcategory: 'Sneakers',
      supplier: 'Nike Footwear Distribution',
      description: 'Basketball-inspired high-top sneaker with cushioned midsoles, durable leather overlays, and streetwear styling.',
      highlights: ['Air-cushioned comfort', 'High-grip outsole pattern', 'Leather and textile upper', 'Everyday streetwear fit'],
      specs: { upper: 'Leather and textile', sole: 'Rubber outsole', fit: 'Regular', sizes: 'UK 6-11', warranty: '30-day exchange' },
      palette: ['#fef3c7', '#fef9c3', '#fde68a'],
      storeInventory: [{ storeId: 's4', qty: 102 }, { storeId: 's5', qty: 88 }, { storeId: 's7', qty: 110 }],
      feedback: [
        { customer: 'Kabir Jain', rating: 5, type: 'Product Quality', comment: 'Great ankle support and the finish looks premium in hand.', date: '2026-04-15T15:50:00Z' },
        { customer: 'Ishita Verma', rating: 4, type: 'Other', comment: 'Comfortable after a short break-in period and the outsole grip is excellent.', date: '2026-04-06T05:20:00Z' }
      ]
    },
    PT004: {
      category: 'Wearables',
      subcategory: 'Smart Watches',
      supplier: 'Apple Authorized Wearables Channel',
      description: 'GPS-enabled smartwatch with fitness tracking, health monitoring, and a bright always-on Retina display.',
      highlights: ['Heart-rate and activity tracking', 'Always-on Retina display', 'Swim-proof aluminum case', 'Seamless iPhone pairing'],
      specs: { size: '45 mm', battery: 'Up to 18 hours', sensors: 'Optical heart sensor', connectivity: 'Bluetooth / GPS', warranty: '1 year' },
      palette: ['#ede9fe', '#f5f3ff', '#ddd6fe'],
      storeInventory: [{ storeId: 's2', qty: 160 }, { storeId: 's4', qty: 124 }, { storeId: 's7', qty: 166 }],
      feedback: [
        { customer: 'Manasi Kulkarni', rating: 4, type: 'Product Quality', comment: 'Fitness tracking is reliable and the display stays bright outdoors.', date: '2026-04-12T11:10:00Z' },
        { customer: 'Dev Arora', rating: 4, type: 'Pricing Concern', comment: 'Premium pricing, but the activity rings and notification sync are excellent.', date: '2026-04-04T08:05:00Z' }
      ]
    },
    PT005: {
      category: 'Smart Home',
      subcategory: 'Speakers',
      supplier: 'Amazon Smart Devices Wholesale',
      description: 'Compact smart speaker for voice commands, music playback, timers, and connected-home control.',
      highlights: ['Voice assistant built in', 'Compact room-friendly design', 'Multi-room audio support', 'Works with smart home routines'],
      specs: { audio: '1.6-inch front-firing speaker', assistant: 'Alexa', connectivity: 'Wi-Fi / Bluetooth', power: 'Wall adapter', warranty: '1 year' },
      palette: ['#cffafe', '#ecfeff', '#a5f3fc'],
      storeInventory: [{ storeId: 's2', qty: 102 }, { storeId: 's6', qty: 98 }, { storeId: 's7', qty: 120 }],
      feedback: [
        { customer: 'Pranav Gupta', rating: 5, type: 'Other', comment: 'Setup was straightforward and the voice pickup works well even from across the room.', date: '2026-04-18T09:00:00Z' },
        { customer: 'Siya Nair', rating: 4, type: 'Product Quality', comment: 'Useful for routines and casual music playback in a study room.', date: '2026-04-10T13:35:00Z' }
      ]
    },
    PT006: {
      category: 'Furniture',
      subcategory: 'Accent Chairs',
      supplier: 'Modern Wave Home Furnishings',
      description: 'Soft upholstered lounge chair with wide armrests, dense foam cushioning, and a supportive seat profile.',
      highlights: ['Textured woven upholstery', 'Supportive medium-firm seat', 'Wooden internal frame', 'Living-room accent silhouette'],
      specs: { material: 'Fabric upholstery', frame: 'Engineered wood', seatHeight: '44 cm', weightCapacity: '120 kg', warranty: '18 months' },
      palette: ['#e0f2fe', '#f0f9ff', '#bae6fd'],
      storeInventory: [{ storeId: 's3', qty: 220 }, { storeId: 's6', qty: 180 }, { storeId: 's7', qty: 250 }],
      feedback: [
        { customer: 'Ananya Bose', rating: 4, type: 'Product Quality', comment: 'Looks elegant in a living room and the seat support is better than expected.', date: '2026-04-07T16:10:00Z' },
        { customer: 'Karan Malhotra', rating: 5, type: 'Other', comment: 'Assembly was simple and the fabric has held up well after regular use.', date: '2026-03-28T06:45:00Z' }
      ]
    },
    PT007: {
      category: 'Accessories',
      subcategory: 'Handbags',
      supplier: 'Dior Lifestyle Accessories',
      description: 'Structured satchel with polished hardware, compartmented interior storage, and a compact everyday silhouette.',
      highlights: ['Textured finish with polished hardware', 'Magnetic flap closure', 'Adjustable shoulder strap', 'Three interior pockets'],
      specs: { material: 'PU and textile blend', strap: 'Adjustable', closure: 'Magnetic flap', pockets: '3 interior', warranty: '6 months' },
      palette: ['#fecdd3', '#fff1f2', '#fda4af'],
      storeInventory: [{ storeId: 's4', qty: 210 }, { storeId: 's5', qty: 240 }, { storeId: 's7', qty: 250 }],
      feedback: [
        { customer: 'Pooja Sethi', rating: 5, type: 'Product Quality', comment: 'Compact but still fits wallet, phone, and essentials without feeling bulky.', date: '2026-04-22T14:20:00Z' },
        { customer: 'Jiya Patel', rating: 4, type: 'Other', comment: 'Beautiful finish and the strap hardware feels durable.', date: '2026-04-09T10:10:00Z' }
      ]
    },
    PT008: {
      category: 'Mobiles',
      subcategory: 'Smartphones',
      supplier: 'Apple Premium Mobile Channel',
      description: 'Flagship smartphone with ProMotion display, high-performance chipset, and a versatile triple-camera setup.',
      highlights: ['6.1-inch ProMotion display', 'Triple rear camera system', 'All-day battery life', 'Ceramic Shield front glass'],
      specs: { display: '6.1-inch OLED', storage: '256 GB', camera: '48 MP main', connectivity: '5G', warranty: '1 year' },
      palette: ['#dbeafe', '#e0f2fe', '#bae6fd'],
      storeInventory: [{ storeId: 's1', qty: 190 }, { storeId: 's3', qty: 180 }, { storeId: 's7', qty: 260 }],
      feedback: [
        { customer: 'Rahul Bansal', rating: 5, type: 'Product Quality', comment: 'Camera detail and battery optimization are excellent for travel and daily use.', date: '2026-04-19T08:25:00Z' },
        { customer: 'Tanya Gupta', rating: 4, type: 'Pricing Concern', comment: 'Expensive, but the display quality and day-to-day responsiveness are outstanding.', date: '2026-04-02T17:05:00Z' }
      ]
    },
    PT009: {
      category: 'Furniture',
      subcategory: 'Office Chairs',
      supplier: 'Arlime Workspace Seating',
      description: 'Ergonomic gaming chair with lumbar support, recline adjustment, and high-density foam padding for extended sessions.',
      highlights: ['Adjustable recline and tilt', 'Integrated lumbar support', 'PU leather finish', 'Caster base for smooth movement'],
      specs: { material: 'PU leather', recline: '90 to 135 degrees', armrests: 'Fixed padded', weightCapacity: '125 kg', warranty: '1 year' },
      palette: ['#c7d2fe', '#e0e7ff', '#a5b4fc'],
      storeInventory: [{ storeId: 's3', qty: 132 }, { storeId: 's5', qty: 118 }, { storeId: 's7', qty: 160 }],
      feedback: [
        { customer: 'Aditya Rao', rating: 4, type: 'Product Quality', comment: 'Back support is good for long work sessions and the recline feels stable.', date: '2026-04-13T06:30:00Z' },
        { customer: 'Nikita Paul', rating: 4, type: 'Other', comment: 'Easy to assemble and the seat cushion keeps its shape well.', date: '2026-04-01T12:55:00Z' }
      ]
    },
    PT010: {
      category: 'Accessories',
      subcategory: 'Backpacks',
      supplier: 'The North Face Travel Gear',
      description: 'Commuter-friendly backpack with organized compartments, padded shoulder straps, and a laptop sleeve.',
      highlights: ['Dedicated laptop compartment', 'Ventilated back panel', 'Water-resistant fabric', 'Everyday 28 L capacity'],
      specs: { capacity: '28 L', material: 'Recycled polyester', laptop: 'Up to 15-inch', weight: '1.1 kg', warranty: '1 year' },
      palette: ['#d1fae5', '#ecfdf5', '#a7f3d0'],
      storeInventory: [{ storeId: 's2', qty: 180 }, { storeId: 's4', qty: 170 }, { storeId: 's7', qty: 200 }],
      feedback: [
        { customer: 'Harshita Singh', rating: 5, type: 'Product Quality', comment: 'Comfortable on the shoulders and the laptop sleeve is nicely padded.', date: '2026-04-17T11:50:00Z' },
        { customer: 'Yash Kapoor', rating: 4, type: 'Other', comment: 'Good organizer pockets and sturdy zip quality for daily commuting.', date: '2026-04-05T09:45:00Z' }
      ]
    },
    PT011: {
      category: 'Audio',
      subcategory: 'Headphones',
      supplier: 'Sony Premium Audio India',
      description: 'Premium noise-cancelling headphones with detailed audio tuning, intelligent ambient modes, and travel-grade comfort.',
      highlights: ['Industry-leading ANC class', 'Touch controls on earcup', 'Multipoint Bluetooth pairing', 'Travel hard case included'],
      specs: { driver: '30 mm carbon fiber composite', battery: 'Up to 30 hours', connectivity: 'Bluetooth 5.3', weight: '250 g', warranty: '1 year' },
      palette: ['#e2e8f0', '#f8fafc', '#cbd5e1'],
      storeInventory: [{ storeId: 's1', qty: 3 }, { storeId: 's6', qty: 2 }, { storeId: 's7', qty: 3 }],
      feedback: [
        { customer: 'Veer Saxena', rating: 5, type: 'Product Quality', comment: 'The ANC is excellent in shared offices and the sound remains detailed at low volume.', date: '2026-04-21T07:10:00Z' },
        { customer: 'Mitali Roy', rating: 4, type: 'Stock Issue', comment: 'Wanted a second pair but stock runs out quickly. Performance is excellent.', date: '2026-04-14T14:40:00Z' }
      ]
    },
    PT012: {
      category: 'Computers',
      subcategory: 'Laptops',
      supplier: 'Apple Authorized Reseller Network',
      description: 'Lightweight productivity laptop with Apple silicon efficiency, silent performance, and a bright Retina display.',
      highlights: ['Fanless Apple silicon design', 'Thin and lightweight body', 'Long battery life', 'Retina display with P3 color'],
      specs: { processor: 'Apple M4', memory: '16 GB unified memory', storage: '512 GB SSD', display: '13.6-inch Liquid Retina', warranty: '1 year' },
      palette: ['#e0e7ff', '#eef2ff', '#c7d2fe'],
      storeInventory: [{ storeId: 's1', qty: 0 }, { storeId: 's3', qty: 0 }, { storeId: 's7', qty: 0 }],
      feedback: [
        { customer: 'Sana Qureshi', rating: 5, type: 'Product Quality', comment: 'Silent, quick, and ideal for travel editing workflows.', date: '2026-04-03T08:00:00Z' },
        { customer: 'Arjun Khanna', rating: 4, type: 'Stock Issue', comment: 'Excellent machine, but it has been unavailable in my preferred configuration.', date: '2026-03-30T13:10:00Z' }
      ]
    },
    PT013: {
      category: 'Fashion',
      subcategory: 'Denim',
      supplier: 'Levi Strauss Apparel Supply',
      description: 'Slim tapered denim with stretch comfort, classic five-pocket styling, and an all-day wearable mid-rise fit.',
      highlights: ['Slim tapered fit', 'Stretch denim blend', 'Classic five-pocket design', 'Mid-rise waist'],
      specs: { fabric: 'Cotton blend', fit: 'Slim tapered', wash: 'Mid indigo', sizes: '28-38', warranty: '30-day exchange' },
      palette: ['#bfdbfe', '#dbeafe', '#93c5fd'],
      storeInventory: [{ storeId: 's4', qty: 160 }, { storeId: 's5', qty: 140 }, { storeId: 's7', qty: 180 }],
      feedback: [
        { customer: 'Rohan Iyer', rating: 4, type: 'Product Quality', comment: 'Good stretch and the taper works nicely with sneakers.', date: '2026-04-18T04:50:00Z' },
        { customer: 'Mira Shah', rating: 4, type: 'Other', comment: 'Consistent fit across washes and the fabric feels durable.', date: '2026-04-01T10:20:00Z' }
      ]
    },
    PT014: {
      category: 'Appliances',
      subcategory: 'Vacuum Cleaners',
      supplier: 'Dyson Home Appliances Channel',
      description: 'Cordless vacuum with strong suction, whole-home attachments, and a lightweight stick form for quick cleanups.',
      highlights: ['Cordless stick vacuum format', 'Whole-home attachment kit', 'HEPA-level filtration', 'Wall dock charger included'],
      specs: { runtime: 'Up to 60 minutes', dustbin: '0.76 L', weight: '3.1 kg', filtration: 'Advanced HEPA', warranty: '2 years' },
      palette: ['#fef3c7', '#fff7ed', '#fdba74'],
      storeInventory: [{ storeId: 's2', qty: 2 }, { storeId: 's6', qty: 1 }, { storeId: 's7', qty: 2 }],
      feedback: [
        { customer: 'Shreya Das', rating: 4, type: 'Product Quality', comment: 'Powerful suction on rugs and it is much easier to carry upstairs than a barrel unit.', date: '2026-04-09T15:15:00Z' },
        { customer: 'Vikram Sen', rating: 3, type: 'Pricing Concern', comment: 'Performs well, but replacement accessories are on the expensive side.', date: '2026-03-27T08:40:00Z' }
      ]
    },
    PT015: {
      category: 'Footwear',
      subcategory: 'Running Shoes',
      supplier: 'Nike Performance Footwear',
      description: 'Performance running shoe with responsive cushioning, breathable mesh, and a lightweight daily-trainer setup.',
      highlights: ['Responsive foam cushioning', 'Breathable mesh upper', 'Road running traction', 'Lightweight daily trainer'],
      specs: { upper: 'Engineered mesh', midsole: 'Responsive foam', weight: 'Approx 295 g', drop: '10 mm', warranty: '30-day exchange' },
      palette: ['#dcfce7', '#ecfccb', '#86efac'],
      storeInventory: [{ storeId: 's1', qty: 80 }, { storeId: 's4', qty: 65 }, { storeId: 's7', qty: 65 }],
      feedback: [
        { customer: 'Keshav Batra', rating: 5, type: 'Product Quality', comment: 'Very comfortable for 5-10 km runs and the forefoot feels responsive.', date: '2026-04-23T05:35:00Z' },
        { customer: 'Aditi Narang', rating: 4, type: 'Other', comment: 'Light enough for daily training and the upper breathes well in warm weather.', date: '2026-04-12T18:25:00Z' }
      ]
    }
  };

  const LOCAL_PRODUCT_IMAGES = [
    '../assets/warehouse.jpg',
    '../assets/consumer.jpg',
    '../assets/dashboard.png',
    '../assets/stock_platform.jpg',
    '../assets/your-command-center.jpg',
    '../assets/realtime-inventory.jpg'
  ];

  const LOCAL_CREATOR_IMAGES = [
    '../assets/workers.jpeg',
    '../assets/warehouse-empl.jpeg',
    '../assets/consumer.jpg',
    '../assets/verify.jpeg'
  ];

  const PRODUCT_PLACEHOLDER_COLORS = ['#ecfccb', '#dbeafe', '#fef3c7', '#fee2e2', '#ede9fe', '#cffafe'];

  function escapeXml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function buildProductPlaceholder(product, index) {
    var seedText = String(product && (product.sku || product.name || product.category || '')).toUpperCase();
    var hash = 0;
    for (var i = 0; i < seedText.length; i += 1) {
      hash = ((hash << 5) - hash) + seedText.charCodeAt(i);
      hash |= 0;
    }

    var color = PRODUCT_PLACEHOLDER_COLORS[Math.abs(hash || index) % PRODUCT_PLACEHOLDER_COLORS.length];
    var emoji = escapeXml(product && product.emoji ? product.emoji : '📦');
    var title = escapeXml(product && product.name ? product.name : 'Product');
    var subtitle = escapeXml(product && product.category ? product.category : 'Inventory Item');

    var svg = ''
      + '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">'
      + '<rect width="800" height="600" fill="' + color + '"/>'
      + '<circle cx="400" cy="210" r="120" fill="#ffffff" fill-opacity="0.72"/>'
      + '<text x="400" y="250" text-anchor="middle" font-size="120">' + emoji + '</text>'
      + '<text x="400" y="410" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="42" fill="#0f172a">' + title + '</text>'
      + '<text x="400" y="460" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="26" fill="#334155">' + subtitle + '</text>'
      + '</svg>';

    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  }

  function buildGalleryPlaceholder(product, index, variantIndex) {
    var enrichment = PRODUCT_ENRICHMENTS[product && product.sku] || {};
    var palette = Array.isArray(enrichment.palette) && enrichment.palette.length
      ? enrichment.palette
      : [PRODUCT_PLACEHOLDER_COLORS[index % PRODUCT_PLACEHOLDER_COLORS.length], '#ffffff', '#e2e8f0'];
    var background = palette[variantIndex % palette.length];
    var accent = palette[(variantIndex + 1) % palette.length];
    var detail = palette[(variantIndex + 2) % palette.length];
    var emoji = escapeXml(product && product.emoji ? product.emoji : '📦');
    var title = escapeXml(product && product.name ? product.name : 'Product');
    var subtitle = escapeXml((enrichment.subcategory || product.category || 'Catalog Item') + ' • View ' + (variantIndex + 1));

    var svg = ''
      + '<svg xmlns="http://www.w3.org/2000/svg" width="960" height="720" viewBox="0 0 960 720">'
      + '<rect width="960" height="720" rx="36" fill="' + background + '"/>'
      + '<rect x="90" y="110" width="780" height="500" rx="32" fill="#ffffff" opacity="0.85"/>'
      + '<rect x="120" y="140" width="720" height="440" rx="24" fill="' + accent + '" opacity="0.45"/>'
      + '<circle cx="480" cy="300" r="138" fill="' + detail + '" opacity="0.9"/>'
      + '<text x="480" y="340" text-anchor="middle" font-size="128">' + emoji + '</text>'
      + '<text x="480" y="560" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="42" font-weight="700" fill="#0f172a">' + title + '</text>'
      + '<text x="480" y="604" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="26" fill="#334155">' + subtitle + '</text>'
      + '</svg>';

    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  }

  function deriveStoreInventory(item) {
    if (Array.isArray(item.storeInventory) && item.storeInventory.length) {
      return item.storeInventory.map(function (entry) {
        return { storeId: entry.storeId, qty: Math.max(0, Number(entry.qty) || 0) };
      });
    }

    var qty = Math.max(0, Number(item.qty) || 0);
    var storeIds = ['s1', 's3', 's7'];
    var weights = [0.35, 0.28, 0.37];
    var remaining = qty;

    return storeIds.map(function (storeId, index) {
      var computed = index === storeIds.length - 1 ? remaining : Math.floor(qty * weights[index]);
      remaining -= computed;
      return { storeId: storeId, qty: Math.max(0, computed) };
    });
  }

  function mapInventoryImage(url, fallbacks, index) {
    var src = String(url || '').trim();
    if (!src || /figma\.com\/api\/mcp\/asset/i.test(src)) {
      return fallbacks[index % fallbacks.length];
    }
    return src;
  }

  function mapProductImage(url, product, index) {
    var src = String(url || '').trim();
    var isLegacyGeneric = LOCAL_PRODUCT_IMAGES.indexOf(src) !== -1;
    if (!src || isLegacyGeneric || /figma\.com\/api\/mcp\/asset/i.test(src)) {
      return buildProductPlaceholder(product, index);
    }
    return src;
  }

  function normalizeGalleryImages(item, mappedProductImage, index) {
    var fromItem = Array.isArray(item.galleryImages) ? item.galleryImages : [];
    var collected = [];

    function pushUnique(value) {
      var src = String(value || '').trim();
      if (!src) return;
      if (collected.indexOf(src) === -1) {
        collected.push(src);
      }
    }

    fromItem.forEach(pushUnique);
    pushUnique(mappedProductImage);

    if (!collected.length) {
      collected = [buildGalleryPlaceholder(item, index, 0)];
    }

    // Keep 3 display slots for UI compatibility; repeat exact product images when fewer are provided.
    while (collected.length < 3) {
      collected.push(collected[collected.length - 1]);
    }

    return collected.slice(0, 3);
  }

  function normalizeProducts(products) {
    if (!Array.isArray(products)) {
      return [];
    }

    return products.map(function (product, index) {
      var item = Object.assign({}, product);
      var enrichment = PRODUCT_ENRICHMENTS[item.sku] || {};
      var qty = Number(item.qty);
      var max = Number(item.max);

      item.qty = Number.isFinite(qty) && qty > 0 ? qty : 0;
      item.max = Number.isFinite(max) && max > 0 ? max : Math.max(item.qty, 100);

      item.description = item.description || enrichment.description || '';
      item.subcategory = item.subcategory || enrichment.subcategory || item.category || 'General';
      item.supplier = item.supplier || enrichment.supplier || item.creator || item.brand || 'Stock Overflow Supply';
      item.highlights = Array.isArray(item.highlights) && item.highlights.length ? item.highlights.slice(0, 4) : (enrichment.highlights || []);
      item.specs = Object.assign({}, enrichment.specs || {}, item.specs || {});
      item.leadTimeDays = Number(item.leadTimeDays || enrichment.leadTimeDays || 4);
      item.minOrderQty = Number(item.minOrderQty || enrichment.minOrderQty || 1);

      var ratingAvg = Number(item.ratingAvg);
      var ratingCount = Number(item.ratingCount);

      if (!item.ratingBreakdown || typeof item.ratingBreakdown !== 'object') {
        item.ratingBreakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      } else {
        item.ratingBreakdown = {
          1: Number(item.ratingBreakdown[1]) || 0,
          2: Number(item.ratingBreakdown[2]) || 0,
          3: Number(item.ratingBreakdown[3]) || 0,
          4: Number(item.ratingBreakdown[4]) || 0,
          5: Number(item.ratingBreakdown[5]) || 0,
        };
      }

      if (!Array.isArray(item.feedback)) {
        item.feedback = Array.isArray(enrichment.feedback) ? enrichment.feedback.slice() : [];
      }

      if (!item.feedback.length && Array.isArray(enrichment.feedback)) {
        item.feedback = enrichment.feedback.slice();
      }

      if ((!Number.isFinite(ratingCount) || ratingCount <= 0) && item.feedback.length) {
        item.feedback.forEach(function (entry) {
          var safeRating = Math.max(1, Math.min(5, Number(entry.rating) || 0));
          if (safeRating) {
            item.ratingBreakdown[safeRating] += 1;
          }
        });
      }

      var totalRatings = Object.keys(item.ratingBreakdown).reduce(function (sum, key) {
        return sum + (Number(item.ratingBreakdown[key]) || 0);
      }, 0);
      var weightedRatings = (item.ratingBreakdown[1] * 1) + (item.ratingBreakdown[2] * 2) + (item.ratingBreakdown[3] * 3) + (item.ratingBreakdown[4] * 4) + (item.ratingBreakdown[5] * 5);
      item.ratingCount = Number.isFinite(ratingCount) && ratingCount >= 0 ? Math.floor(ratingCount) : totalRatings;
      item.ratingAvg = Number.isFinite(ratingAvg) && ratingAvg > 0 ? ratingAvg : (item.ratingCount ? (weightedRatings / item.ratingCount) : 0);

      item.storeInventory = deriveStoreInventory(item);
      item.creatorImg = mapInventoryImage(item.creatorImg, LOCAL_CREATOR_IMAGES, index);
      item.productImg = mapProductImage(item.productImg, item, index);
      item.galleryImages = normalizeGalleryImages(item, item.productImg, index);
      if (!item.productImg) {
        item.productImg = item.galleryImages[0];
      }
      return item;
    });
  }

  function loadPersistedProducts() {
    try {
      if (window.DB) {
        var parsed = window.DB.getInventory();
        if (!Array.isArray(parsed) || parsed.length === 0) {
          return null;
        }
        return parsed;
      } else {
        var raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        return JSON.parse(raw);
      }
    } catch (error) {
      return null;
    }
  }

  function mergeProducts(baseProducts, persistedProducts) {
    if (!Array.isArray(persistedProducts) || persistedProducts.length === 0) {
      return baseProducts.map(function (product) {
        return Object.assign({}, product);
      });
    }

    var mergedBySku = {};
    var baseBySku = {};

    baseProducts.forEach(function (product) {
      baseBySku[product.sku] = product;
      mergedBySku[product.sku] = Object.assign({}, product);
    });

    persistedProducts.forEach(function (product) {
      var base = mergedBySku[product.sku] || {};
      mergedBySku[product.sku] = Object.assign({}, base, product);
    });

    var ordered = [];
    baseProducts.forEach(function (product) {
      ordered.push(mergedBySku[product.sku]);
    });

    persistedProducts.forEach(function (product) {
      if (!baseBySku[product.sku]) {
        ordered.push(mergedBySku[product.sku]);
      }
    });

    return normalizeProducts(ordered);
  }

  function buildListProducts(products) {
    return products.map(function (p) {
      return {
        sku: p.sku,
        name: p.name,
        category: p.category,
        brand: p.brand,
        price: '$' + p.priceUSD,
        unit: p.unit,
        qty: p.qty,
        creator: p.creator,
        creatorImg: p.creatorImg,
        productImg: p.productImg
      };
    });
  }

  function buildInventoryProducts(products) {
    return products.map(function (p) {
      return {
        sku: p.sku,
        name: p.name,
        cat: p.category,
        qty: p.qty,
        max: p.max,
        price: p.priceUSD,
        emoji: p.emoji,
        soldThisMonth: p.soldThisMonth,
        trend: p.trend
      };
    });
  }

  function buildSampleProductNames(products) {
    return products.map(function (p) {
      return p.name;
    });
  }

  function cloneProducts(products) {
    return products.map(function (p) {
      return Object.assign({}, p);
    });
  }

  function persistProducts(products) {
    var normalized = normalizeProducts(products);
    try {
      if (window.DB) {
        window.DB.saveInventory(normalized);
      } else {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
      }
      return true;
    } catch (error) {
      return false;
    }
  }

  function applyResolvedProducts(products) {
    resolvedMasterProducts = cloneProducts(normalizeProducts(products));
    listProducts = buildListProducts(resolvedMasterProducts);
    inventoryProducts = buildInventoryProducts(resolvedMasterProducts);
    sampleProductNames = buildSampleProductNames(resolvedMasterProducts);
  }

  function refreshFromStorage() {
    var persisted = loadPersistedProducts();
    var merged = mergeProducts(masterProducts, persisted);
    applyResolvedProducts(merged);
  }

  function getMasterProducts() {
    refreshFromStorage();
    return cloneProducts(resolvedMasterProducts);
  }

  function generateNextSku() {
    refreshFromStorage();
    var maxSkuNum = 0;
    resolvedMasterProducts.forEach(function (p) {
      var match = /^PT(\d+)$/.exec(String(p.sku || '').toUpperCase());
      if (match) {
        var num = parseInt(match[1], 10);
        if (num > maxSkuNum) {
          maxSkuNum = num;
        }
      }
    });

    var next = maxSkuNum + 1;
    return 'PT' + String(next).padStart(3, '0');
  }

  function upsertProduct(product) {
    if (!product || !product.sku) {
      return null;
    }

    var current = getMasterProducts();
    var idx = current.findIndex(function (p) {
      return p.sku === product.sku;
    });

    if (idx >= 0) {
      current[idx] = Object.assign({}, current[idx], product);
    } else {
      current.push(Object.assign({}, product));
    }

    if (!persistProducts(current)) {
      return null;
    }

    applyResolvedProducts(current);
    return Object.assign({}, idx >= 0 ? current[idx] : product);
  }

  function deleteProductBySku(sku) {
    if (!sku) {
      return false;
    }

    var current = getMasterProducts();
    var next = current.filter(function (p) {
      return p.sku !== sku;
    });

    if (next.length === current.length) {
      return false;
    }

    if (!persistProducts(next)) {
      return false;
    }

    applyResolvedProducts(next);
    return true;
  }

  var persistedProducts = loadPersistedProducts();
  var resolvedMasterProducts = normalizeProducts(mergeProducts(masterProducts, persistedProducts));
  var listProducts = buildListProducts(resolvedMasterProducts);
  var inventoryProducts = buildInventoryProducts(resolvedMasterProducts);
  var sampleProductNames = buildSampleProductNames(resolvedMasterProducts);

  window.RetailerProductsData = {
    storageKey: STORAGE_KEY,
    masterProducts: resolvedMasterProducts,
    listProducts: listProducts,
    inventoryProducts: inventoryProducts,
    sampleProductNames: sampleProductNames,
    getMasterProducts: getMasterProducts,
    generateNextSku: generateNextSku,
    upsertProduct: upsertProduct,
    deleteProductBySku: deleteProductBySku,
    refreshFromStorage: refreshFromStorage,
    persistProducts: persistProducts,
    saveProductsToStorage: persistProducts
  };

  Object.defineProperties(window.RetailerProductsData, {
    masterProducts: {
      get: function () {
        refreshFromStorage();
        return resolvedMasterProducts;
      }
    },
    listProducts: {
      get: function () {
        refreshFromStorage();
        return listProducts;
      }
    },
    inventoryProducts: {
      get: function () {
        refreshFromStorage();
        return inventoryProducts;
      }
    },
    sampleProductNames: {
      get: function () {
        refreshFromStorage();
        return sampleProductNames;
      }
    }
  });

  window.addEventListener('storage', function (event) {
    if (event && event.key && event.key !== STORAGE_KEY && event.key !== 'so_inventory') {
      return;
    }
    refreshFromStorage();
  });

  window.addEventListener('so_inventory_updated', function () {
    refreshFromStorage();
  });
})();
