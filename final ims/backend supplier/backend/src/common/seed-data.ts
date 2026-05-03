import {
  BillerRecord,
  CustomerRecord,
  DatabaseSchema,
  ProductFeedback,
  ProductRecord,
  RatingBreakdown,
  StoreInventoryEntry,
  StoreRecord,
} from './database.types';

type ProductSeed = {
  sku: string;
  name: string;
  category: string;
  subcategory: string;
  brand: string;
  priceUSD: number;
  qty: number;
  min: number;
  max: number;
  creator: string;
  emoji: string;
  soldThisMonth: number;
  trend: string;
  supplier: string;
  description: string;
  highlights: string[];
  specs: Record<string, string>;
  palette: string[];
  feedback: Array<{
    customer: string;
    rating: number;
    type: string;
    comment: string;
    date: string;
  }>;
};

const PRIMARY_STORES = ['s1', 's3', 's7'] as const;

function encodeSvg(svg: string) {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function buildCardSvg(
  title: string,
  subtitle: string,
  emoji: string,
  background: string,
) {
  return encodeSvg(
    `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="720" viewBox="0 0 960 720">
      <rect width="960" height="720" rx="42" fill="${background}"/>
      <rect x="88" y="98" width="784" height="524" rx="34" fill="#ffffff" opacity="0.86"/>
      <circle cx="480" cy="280" r="142" fill="#ffffff" opacity="0.9"/>
      <text x="480" y="330" text-anchor="middle" font-size="138">${emoji}</text>
      <text x="480" y="548" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="40" font-weight="700" fill="#0f172a">${title}</text>
      <text x="480" y="596" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="24" fill="#475569">${subtitle}</text>
    </svg>`,
  );
}

function buildAvatarSvg(name: string, background: string) {
  const initials = String(name || 'RM')
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return encodeSvg(
    `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 240 240">
      <rect width="240" height="240" rx="120" fill="${background}"/>
      <text x="120" y="136" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="72" font-weight="700" fill="#ffffff">${initials}</text>
    </svg>`,
  );
}

function cloneStoreInventory(entries: StoreInventoryEntry[]) {
  return entries.map((entry) => ({ ...entry }));
}

function distributeStoreInventory(totalQty: number) {
  const safeQty = Math.max(0, Math.trunc(totalQty));
  let remaining = safeQty;
  const weights = [0.35, 0.28, 0.37];

  return PRIMARY_STORES.map((storeId, index) => {
    const qty =
      index === PRIMARY_STORES.length - 1
        ? remaining
        : Math.floor(safeQty * weights[index]);
    remaining -= qty;
    return { storeId, qty: Math.max(0, qty) };
  });
}

function buildRatingBreakdown(feedback: ProductFeedback[]): RatingBreakdown {
  return feedback.reduce<RatingBreakdown>(
    (acc, entry) => {
      const safeRating = Math.max(1, Math.min(5, Math.trunc(entry.rating || 0)));
      acc[safeRating as keyof RatingBreakdown] += 1;
      return acc;
    },
    { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  );
}

function buildFeedback(seed: ProductSeed): ProductFeedback[] {
  return seed.feedback.map((entry, index) => ({
    id: `${seed.sku.toLowerCase()}-feedback-${index + 1}`,
    sku: seed.sku,
    productName: seed.name,
    customer: entry.customer,
    type: entry.type,
    rating: entry.rating,
    comment: entry.comment,
    date: entry.date,
  }));
}

const STORE_SEEDS: StoreRecord[] = [
  {
    id: 's1',
    name: 'Downtown Store',
    location: 'Mumbai Central',
    manager: 'Primary Retailer',
    status: 'Active',
  },
  {
    id: 's3',
    name: 'East Coast Hub',
    location: 'Kolkata Harbour',
    manager: 'Operations Lead',
    status: 'Active',
  },
  {
    id: 's7',
    name: 'Global Hub',
    location: 'Bengaluru Tech Park',
    manager: 'Network Manager',
    status: 'Active',
  },
];

const CUSTOMER_SEEDS: CustomerRecord[] = [
  {
    id: 'cust-walkin',
    name: 'Walk-in Customer',
    fname: 'Walk-in',
    lname: 'Customer',
    email: 'walkin@stockoverflow.local',
    phone: '0000000000',
    city: 'Mumbai',
    country: 'India',
    store: 'Downtown Store',
    status: 'Active',
    totalOrders: 0,
    totalSpent: 0,
    orders: 0,
    spent: 0,
    created: 'Jan 01, 2026',
    rating: 3,
    notes: '',
  },
  {
    id: 'cust-aarav',
    name: 'Aarav Sharma',
    fname: 'Aarav',
    lname: 'Sharma',
    email: 'aarav.sharma@example.com',
    phone: '9000000001',
    city: 'Mumbai',
    country: 'India',
    store: 'Downtown Store',
    status: 'Active',
    totalOrders: 4,
    totalSpent: 1420,
    orders: 4,
    spent: 1420,
    created: 'Jan 12, 2026',
    rating: 5,
    notes: 'Frequent repeat buyer.',
  },
  {
    id: 'cust-priya',
    name: 'Priya Singh',
    fname: 'Priya',
    lname: 'Singh',
    email: 'priya.singh@example.com',
    phone: '9000000002',
    city: 'Kolkata',
    country: 'India',
    store: 'East Coast Hub',
    status: 'Active',
    totalOrders: 3,
    totalSpent: 980,
    orders: 3,
    spent: 980,
    created: 'Feb 03, 2026',
    rating: 4,
    notes: '',
  },
  {
    id: 'cust-riya',
    name: 'Riya Patel',
    fname: 'Riya',
    lname: 'Patel',
    email: 'riya.patel@example.com',
    phone: '9000000003',
    city: 'Bengaluru',
    country: 'India',
    store: 'Global Hub',
    status: 'Active',
    totalOrders: 5,
    totalSpent: 1765,
    orders: 5,
    spent: 1765,
    created: 'Mar 18, 2026',
    rating: 4,
    notes: 'High engagement with smart electronics.',
  },
];

const BILLER_SEEDS: BillerRecord[] = [
  {
    id: 'biller-1',
    code: 'BI001',
    name: 'Karan Deshpande',
    company: 'Stock Overflow Retail',
    email: 'karan.deshpande@example.com',
    phone: '9100000001',
    country: 'India',
    status: 'active',
    avatar: '#38bdf8',
  },
  {
    id: 'biller-2',
    code: 'BI002',
    name: 'Nisha Rao',
    company: 'Stock Overflow Retail',
    email: 'nisha.rao@example.com',
    phone: '9100000002',
    country: 'India',
    status: 'active',
    avatar: '#4ade80',
  },
];

const PRODUCT_SEEDS: ProductSeed[] = [
  {
    sku: 'PT001',
    name: 'Lenovo IdeaPad 3',
    category: 'Computers',
    subcategory: 'Laptops',
    brand: 'Lenovo',
    priceUSD: 600,
    qty: 100,
    min: 20,
    max: 300,
    creator: 'James Kirwin',
    emoji: String.fromCodePoint(0x1f4bb),
    soldThisMonth: 22,
    trend: 'up',
    supplier: 'Lenovo India Distribution Network',
    description:
      'A balanced everyday laptop for office work, studies, and multitasking with SSD storage and dependable battery life.',
    highlights: [
      '15.6-inch FHD anti-glare display',
      'Fast SSD storage',
      'Everyday productivity performance',
      'Portable classroom and office setup',
    ],
    specs: {
      processor: 'AMD Ryzen 5',
      memory: '8 GB DDR4',
      storage: '512 GB SSD',
      warranty: '1 year',
    },
    palette: ['#dbeafe', '#eff6ff', '#bfdbfe'],
    feedback: [
      {
        customer: 'Aarav Mehta',
        rating: 5,
        type: 'Product Quality',
        comment: 'Quick boot time and a very solid keyboard for daily work.',
        date: '2026-04-16T10:30:00.000Z',
      },
      {
        customer: 'Neha Sharma',
        rating: 4,
        type: 'Other',
        comment: 'Reliable for classes and spreadsheets with good battery life.',
        date: '2026-04-08T09:15:00.000Z',
      },
    ],
  },
  {
    sku: 'PT002',
    name: 'Beats Pro',
    category: 'Audio',
    subcategory: 'Headphones',
    brand: 'Beats',
    priceUSD: 160,
    qty: 140,
    min: 24,
    max: 300,
    creator: 'Francis Chang',
    emoji: String.fromCodePoint(0x1f3a7),
    soldThisMonth: 38,
    trend: 'up',
    supplier: 'Beats Consumer Audio Supply',
    description:
      'Wireless over-ear headphones with active noise cancellation and a travel-friendly foldable design.',
    highlights: [
      'Adaptive noise cancellation',
      'Strong bass response',
      'USB-C fast charging',
      'Comfortable over-ear fit',
    ],
    specs: {
      battery: 'Up to 40 hours',
      connectivity: 'Bluetooth 5.3',
      driver: '40 mm dynamic',
      warranty: '1 year',
    },
    palette: ['#fee2e2', '#fff1f2', '#fecaca'],
    feedback: [
      {
        customer: 'Ritika Anand',
        rating: 5,
        type: 'Product Quality',
        comment: 'Noise cancellation is strong and the headband stays comfortable.',
        date: '2026-04-20T12:40:00.000Z',
      },
      {
        customer: 'Soham Desai',
        rating: 4,
        type: 'Other',
        comment: 'Punchy sound and stable Bluetooth pairing across laptop and phone.',
        date: '2026-04-11T07:25:00.000Z',
      },
    ],
  },
  {
    sku: 'PT003',
    name: 'Nike Jordan',
    category: 'Footwear',
    subcategory: 'Sneakers',
    brand: 'Nike',
    priceUSD: 110,
    qty: 300,
    min: 50,
    max: 500,
    creator: 'Antonio Engle',
    emoji: String.fromCodePoint(0x1f45f),
    soldThisMonth: 54,
    trend: 'up',
    supplier: 'Nike Footwear Distribution',
    description:
      'Basketball-inspired high-top sneakers with cushioned midsoles and everyday streetwear appeal.',
    highlights: [
      'Air-cushioned comfort',
      'High-grip outsole',
      'Leather and textile upper',
      'Streetwear-ready silhouette',
    ],
    specs: {
      upper: 'Leather and textile',
      sole: 'Rubber outsole',
      fit: 'Regular',
      warranty: '30-day exchange',
    },
    palette: ['#fef3c7', '#fef9c3', '#fde68a'],
    feedback: [
      {
        customer: 'Kabir Jain',
        rating: 5,
        type: 'Product Quality',
        comment: 'Great ankle support and a premium finish in hand.',
        date: '2026-04-15T15:50:00.000Z',
      },
      {
        customer: 'Ishita Verma',
        rating: 4,
        type: 'Other',
        comment: 'Comfortable after a short break-in with strong outsole grip.',
        date: '2026-04-06T05:20:00.000Z',
      },
    ],
  },
  {
    sku: 'PT004',
    name: 'Apple Series 5 Watch',
    category: 'Wearables',
    subcategory: 'Smart Watches',
    brand: 'Apple',
    priceUSD: 120,
    qty: 450,
    min: 40,
    max: 500,
    creator: 'Leo Kelly',
    emoji: String.fromCodePoint(0x231a),
    soldThisMonth: 17,
    trend: 'down',
    supplier: 'Apple Authorized Wearables Channel',
    description:
      'A GPS-enabled smartwatch focused on fitness tracking, health monitoring, and quick iPhone pairing.',
    highlights: [
      'Always-on Retina display',
      'Heart-rate and activity tracking',
      'Swim-proof aluminum case',
      'Seamless iPhone pairing',
    ],
    specs: {
      size: '45 mm',
      battery: 'Up to 18 hours',
      sensors: 'Optical heart sensor',
      warranty: '1 year',
    },
    palette: ['#ede9fe', '#f5f3ff', '#ddd6fe'],
    feedback: [
      {
        customer: 'Manasi Kulkarni',
        rating: 4,
        type: 'Product Quality',
        comment: 'Fitness tracking is reliable and the display stays bright outdoors.',
        date: '2026-04-12T11:10:00.000Z',
      },
      {
        customer: 'Dev Arora',
        rating: 4,
        type: 'Pricing Concern',
        comment: 'Premium pricing, but the daily sync and activity rings are excellent.',
        date: '2026-04-04T08:05:00.000Z',
      },
    ],
  },
  {
    sku: 'PT005',
    name: 'Amazon Echo Dot',
    category: 'Smart Home',
    subcategory: 'Speakers',
    brand: 'Amazon',
    priceUSD: 80,
    qty: 320,
    min: 40,
    max: 500,
    creator: 'Annette Walker',
    emoji: String.fromCodePoint(0x1f50a),
    soldThisMonth: 29,
    trend: 'up',
    supplier: 'Amazon Smart Devices Wholesale',
    description:
      'A compact smart speaker for voice commands, timers, casual music playback, and simple routines.',
    highlights: [
      'Voice assistant built in',
      'Compact room-friendly design',
      'Smart home routine support',
      'Bluetooth and Wi-Fi connectivity',
    ],
    specs: {
      audio: '1.6-inch front-firing speaker',
      assistant: 'Alexa',
      power: 'Wall adapter',
      warranty: '1 year',
    },
    palette: ['#cffafe', '#ecfeff', '#a5f3fc'],
    feedback: [
      {
        customer: 'Pranav Gupta',
        rating: 5,
        type: 'Other',
        comment: 'Setup was simple and voice pickup works well across the room.',
        date: '2026-04-18T09:00:00.000Z',
      },
      {
        customer: 'Siya Nair',
        rating: 4,
        type: 'Product Quality',
        comment: 'Very handy for routines and background music in a study room.',
        date: '2026-04-10T13:35:00.000Z',
      },
    ],
  },
  {
    sku: 'PT006',
    name: 'Sanford Chair Sofa',
    category: 'Furniture',
    subcategory: 'Accent Chairs',
    brand: 'Modern Wave',
    priceUSD: 320,
    qty: 650,
    min: 60,
    max: 800,
    creator: 'John Weaver',
    emoji: String.fromCodePoint(0x1fa91),
    soldThisMonth: 8,
    trend: 'down',
    supplier: 'Modern Wave Home Furnishings',
    description:
      'A soft upholstered lounge chair with supportive foam cushioning and an inviting living-room profile.',
    highlights: [
      'Textured woven upholstery',
      'Supportive medium-firm seat',
      'Wooden internal frame',
      'Living-room accent silhouette',
    ],
    specs: {
      material: 'Fabric upholstery',
      frame: 'Engineered wood',
      seatHeight: '44 cm',
      warranty: '18 months',
    },
    palette: ['#e0f2fe', '#f0f9ff', '#bae6fd'],
    feedback: [
      {
        customer: 'Ananya Bose',
        rating: 4,
        type: 'Product Quality',
        comment: 'Looks elegant and the seat support is better than expected.',
        date: '2026-04-07T16:10:00.000Z',
      },
      {
        customer: 'Karan Malhotra',
        rating: 5,
        type: 'Other',
        comment: 'Assembly was easy and the fabric has held up well.',
        date: '2026-03-28T06:45:00.000Z',
      },
    ],
  },
  {
    sku: 'PT007',
    name: 'Red Premium Satchel',
    category: 'Accessories',
    subcategory: 'Handbags',
    brand: 'Dior',
    priceUSD: 60,
    qty: 700,
    min: 50,
    max: 800,
    creator: 'Gary Hennessy',
    emoji: String.fromCodePoint(0x1f45c),
    soldThisMonth: 41,
    trend: 'up',
    supplier: 'Dior Lifestyle Accessories',
    description:
      'A structured satchel with polished hardware, compact proportions, and practical everyday storage.',
    highlights: [
      'Textured finish',
      'Adjustable shoulder strap',
      'Magnetic flap closure',
      'Three interior pockets',
    ],
    specs: {
      material: 'PU and textile blend',
      strap: 'Adjustable',
      closure: 'Magnetic flap',
      warranty: '6 months',
    },
    palette: ['#fecdd3', '#fff1f2', '#fda4af'],
    feedback: [
      {
        customer: 'Pooja Sethi',
        rating: 5,
        type: 'Product Quality',
        comment: 'Compact without feeling cramped and the hardware feels sturdy.',
        date: '2026-04-22T14:20:00.000Z',
      },
      {
        customer: 'Jiya Patel',
        rating: 4,
        type: 'Other',
        comment: 'Beautiful finish and the strap hardware feels durable.',
        date: '2026-04-09T10:10:00.000Z',
      },
    ],
  },
  {
    sku: 'PT008',
    name: 'iPhone 14 Pro',
    category: 'Mobiles',
    subcategory: 'Smartphones',
    brand: 'Apple',
    priceUSD: 540,
    qty: 630,
    min: 70,
    max: 800,
    creator: 'Eleanor Panek',
    emoji: String.fromCodePoint(0x1f4f1),
    soldThisMonth: 63,
    trend: 'up',
    supplier: 'Apple Premium Mobile Channel',
    description:
      'A flagship smartphone with a smooth display, high-end cameras, and strong day-to-day performance.',
    highlights: [
      '6.1-inch ProMotion display',
      'Triple rear camera system',
      'All-day battery profile',
      '5G connectivity',
    ],
    specs: {
      display: '6.1-inch OLED',
      storage: '256 GB',
      camera: '48 MP main',
      warranty: '1 year',
    },
    palette: ['#dbeafe', '#e0f2fe', '#bae6fd'],
    feedback: [
      {
        customer: 'Rahul Bansal',
        rating: 5,
        type: 'Product Quality',
        comment: 'Camera detail and battery optimization are excellent for travel.',
        date: '2026-04-19T08:25:00.000Z',
      },
      {
        customer: 'Tanya Gupta',
        rating: 4,
        type: 'Pricing Concern',
        comment: 'Expensive, but the display quality is excellent every day.',
        date: '2026-04-02T17:05:00.000Z',
      },
    ],
  },
  {
    sku: 'PT009',
    name: 'Gaming Chair',
    category: 'Furniture',
    subcategory: 'Office Chairs',
    brand: 'Arlime',
    priceUSD: 200,
    qty: 410,
    min: 40,
    max: 500,
    creator: 'William Levy',
    emoji: String.fromCodePoint(0x1fa91),
    soldThisMonth: 12,
    trend: 'down',
    supplier: 'Arlime Workspace Seating',
    description:
      'An ergonomic gaming chair with lumbar support, recline control, and dense padding for long sessions.',
    highlights: [
      'Adjustable recline',
      'Integrated lumbar support',
      'PU leather finish',
      'Caster base',
    ],
    specs: {
      material: 'PU leather',
      recline: '90-135 degrees',
      armrests: 'Fixed padded',
      warranty: '1 year',
    },
    palette: ['#c7d2fe', '#e0e7ff', '#a5b4fc'],
    feedback: [
      {
        customer: 'Aditya Rao',
        rating: 4,
        type: 'Product Quality',
        comment: 'Back support is good for long work sessions and gaming.',
        date: '2026-04-13T06:30:00.000Z',
      },
      {
        customer: 'Nikita Paul',
        rating: 4,
        type: 'Other',
        comment: 'Easy to assemble and the seat cushion keeps its shape well.',
        date: '2026-04-01T12:55:00.000Z',
      },
    ],
  },
  {
    sku: 'PT010',
    name: 'Borealis Backpack',
    category: 'Accessories',
    subcategory: 'Backpacks',
    brand: 'The North Face',
    priceUSD: 45,
    qty: 550,
    min: 50,
    max: 800,
    creator: 'Charlotte Klotz',
    emoji: String.fromCodePoint(0x1f392),
    soldThisMonth: 33,
    trend: 'up',
    supplier: 'The North Face Travel Gear',
    description:
      'A commuter-friendly backpack with organized compartments, padded straps, and a laptop sleeve.',
    highlights: [
      'Dedicated laptop compartment',
      'Ventilated back panel',
      'Water-resistant fabric',
      '28 L everyday capacity',
    ],
    specs: {
      capacity: '28 L',
      material: 'Recycled polyester',
      laptop: 'Up to 15-inch',
      warranty: '1 year',
    },
    palette: ['#d1fae5', '#ecfdf5', '#a7f3d0'],
    feedback: [
      {
        customer: 'Harshita Singh',
        rating: 5,
        type: 'Product Quality',
        comment: 'Comfortable on the shoulders and the laptop sleeve is nicely padded.',
        date: '2026-04-17T11:50:00.000Z',
      },
      {
        customer: 'Yash Kapoor',
        rating: 4,
        type: 'Other',
        comment: 'Good organizer pockets and sturdy zip quality for commuting.',
        date: '2026-04-05T09:45:00.000Z',
      },
    ],
  },
  {
    sku: 'PT011',
    name: 'Sony WH-1000XM6',
    category: 'Audio',
    subcategory: 'Headphones',
    brand: 'Sony',
    priceUSD: 349,
    qty: 8,
    min: 12,
    max: 300,
    creator: 'James Kirwin',
    emoji: String.fromCodePoint(0x1f3a7),
    soldThisMonth: 55,
    trend: 'up',
    supplier: 'Sony Premium Audio India',
    description:
      'Premium noise-cancelling headphones with detailed audio tuning and smart ambient modes.',
    highlights: [
      'Strong active noise cancellation',
      'Touch controls',
      'Multipoint Bluetooth pairing',
      'Travel hard case included',
    ],
    specs: {
      battery: 'Up to 30 hours',
      connectivity: 'Bluetooth 5.3',
      driver: '30 mm composite',
      warranty: '1 year',
    },
    palette: ['#e2e8f0', '#f8fafc', '#cbd5e1'],
    feedback: [
      {
        customer: 'Veer Saxena',
        rating: 5,
        type: 'Product Quality',
        comment: 'Excellent ANC in shared offices and very detailed sound.',
        date: '2026-04-21T07:10:00.000Z',
      },
      {
        customer: 'Mitali Roy',
        rating: 4,
        type: 'Stock Issue',
        comment: 'Fantastic performance, but stock disappears quickly.',
        date: '2026-04-14T14:40:00.000Z',
      },
    ],
  },
  {
    sku: 'PT012',
    name: 'MacBook Air M4',
    category: 'Computers',
    subcategory: 'Laptops',
    brand: 'Apple',
    priceUSD: 1099,
    qty: 0,
    min: 10,
    max: 200,
    creator: 'Francis Chang',
    emoji: String.fromCodePoint(0x1f4bb),
    soldThisMonth: 19,
    trend: 'up',
    supplier: 'Apple Authorized Reseller Network',
    description:
      'A lightweight productivity laptop with Apple silicon performance, strong battery life, and silent operation.',
    highlights: [
      'Lightweight travel-friendly body',
      'Strong battery life',
      'Silent fanless design',
      'High-resolution display',
    ],
    specs: {
      processor: 'Apple M4',
      memory: '16 GB unified',
      storage: '512 GB SSD',
      warranty: '1 year',
    },
    palette: ['#e0e7ff', '#eef2ff', '#c7d2fe'],
    feedback: [
      {
        customer: 'Sana Qureshi',
        rating: 5,
        type: 'Product Quality',
        comment: 'Silent, quick, and ideal for travel editing workflows.',
        date: '2026-04-03T08:00:00.000Z',
      },
      {
        customer: 'Arjun Khanna',
        rating: 4,
        type: 'Stock Issue',
        comment: 'Excellent machine, but it has been unavailable in my config.',
        date: '2026-03-30T13:10:00.000Z',
      },
    ],
  },
  {
    sku: 'PT013',
    name: "Levi's 512 Jeans",
    category: 'Fashion',
    subcategory: 'Denim',
    brand: "Levi's",
    priceUSD: 79,
    qty: 480,
    min: 45,
    max: 600,
    creator: 'Leo Kelly',
    emoji: String.fromCodePoint(0x1f456),
    soldThisMonth: 28,
    trend: 'up',
    supplier: 'Levi Strauss Apparel Supply',
    description:
      'Slim tapered denim with stretch comfort and a dependable all-day wearable fit.',
    highlights: [
      'Slim tapered fit',
      'Stretch denim blend',
      'Classic five-pocket layout',
      'Mid-rise waist',
    ],
    specs: {
      fabric: 'Cotton blend',
      fit: 'Slim tapered',
      wash: 'Mid indigo',
      warranty: '30-day exchange',
    },
    palette: ['#bfdbfe', '#dbeafe', '#93c5fd'],
    feedback: [
      {
        customer: 'Rohan Iyer',
        rating: 4,
        type: 'Product Quality',
        comment: 'Good stretch and the taper works nicely with sneakers.',
        date: '2026-04-18T04:50:00.000Z',
      },
      {
        customer: 'Mira Shah',
        rating: 4,
        type: 'Other',
        comment: 'Consistent fit across washes and the fabric feels durable.',
        date: '2026-04-01T10:20:00.000Z',
      },
    ],
  },
  {
    sku: 'PT014',
    name: 'Dyson V16 Vacuum',
    category: 'Appliances',
    subcategory: 'Vacuum Cleaners',
    brand: 'Dyson',
    priceUSD: 599,
    qty: 5,
    min: 10,
    max: 150,
    creator: 'Annette Walker',
    emoji: String.fromCodePoint(0x1f9f9),
    soldThisMonth: 7,
    trend: 'down',
    supplier: 'Dyson Home Appliances Channel',
    description:
      'A cordless vacuum with strong suction, useful attachments, and a lightweight format for fast cleanups.',
    highlights: [
      'Cordless stick design',
      'Whole-home attachment kit',
      'Advanced filtration',
      'Wall dock charger included',
    ],
    specs: {
      runtime: 'Up to 60 minutes',
      dustbin: '0.76 L',
      weight: '3.1 kg',
      warranty: '2 years',
    },
    palette: ['#fef3c7', '#fff7ed', '#fdba74'],
    feedback: [
      {
        customer: 'Shreya Das',
        rating: 4,
        type: 'Product Quality',
        comment: 'Powerful suction on rugs and easy to carry upstairs.',
        date: '2026-04-09T15:15:00.000Z',
      },
      {
        customer: 'Vikram Sen',
        rating: 3,
        type: 'Pricing Concern',
        comment: 'Performs well, but accessories are on the expensive side.',
        date: '2026-03-27T08:40:00.000Z',
      },
    ],
  },
  {
    sku: 'PT015',
    name: 'Nike Air Max 2025',
    category: 'Footwear',
    subcategory: 'Running Shoes',
    brand: 'Nike',
    priceUSD: 189,
    qty: 210,
    min: 35,
    max: 400,
    creator: 'John Weaver',
    emoji: String.fromCodePoint(0x1f45f),
    soldThisMonth: 47,
    trend: 'up',
    supplier: 'Nike Performance Footwear',
    description:
      'A performance running shoe with responsive cushioning, breathable mesh, and a lightweight trainer setup.',
    highlights: [
      'Responsive foam cushioning',
      'Breathable mesh upper',
      'Road running traction',
      'Lightweight daily trainer',
    ],
    specs: {
      upper: 'Engineered mesh',
      midsole: 'Responsive foam',
      drop: '10 mm',
      warranty: '30-day exchange',
    },
    palette: ['#dcfce7', '#ecfccb', '#86efac'],
    feedback: [
      {
        customer: 'Keshav Batra',
        rating: 5,
        type: 'Product Quality',
        comment: 'Very comfortable for regular runs and quick tempo workouts.',
        date: '2026-04-23T05:35:00.000Z',
      },
      {
        customer: 'Aditi Narang',
        rating: 4,
        type: 'Other',
        comment: 'Light enough for daily training and the upper breathes well.',
        date: '2026-04-12T18:25:00.000Z',
      },
    ],
  },
];

function buildProduct(seed: ProductSeed, index: number): ProductRecord {
  const storeInventory = distributeStoreInventory(seed.qty);
  const feedback = buildFeedback(seed);
  const ratingBreakdown = buildRatingBreakdown(feedback);
  const ratingCount =
    ratingBreakdown[1] +
    ratingBreakdown[2] +
    ratingBreakdown[3] +
    ratingBreakdown[4] +
    ratingBreakdown[5];
  const ratingAvg = ratingCount
    ? Number(
        (
          (ratingBreakdown[1] * 1 +
            ratingBreakdown[2] * 2 +
            ratingBreakdown[3] * 3 +
            ratingBreakdown[4] * 4 +
            ratingBreakdown[5] * 5) /
          ratingCount
        ).toFixed(1),
      )
    : 0;
  const background = seed.palette[0] || '#dbeafe';
  const creatorBackground = seed.palette[2] || seed.palette[0] || '#38bdf8';
  const productImg = buildCardSvg(
    seed.name,
    `${seed.category} • ${seed.sku}`,
    seed.emoji,
    background,
  );
  const galleryImages = [0, 1, 2].map((galleryIndex) =>
    buildCardSvg(
      seed.name,
      `${seed.subcategory} • View ${galleryIndex + 1}`,
      seed.emoji,
      seed.palette[galleryIndex % seed.palette.length] || background,
    ),
  );

  return {
    id: `prod-${seed.sku.toLowerCase()}`,
    sku: seed.sku,
    name: seed.name,
    category: seed.category,
    subcategory: seed.subcategory,
    subCategory: seed.subcategory,
    brand: seed.brand,
    priceUSD: seed.priceUSD,
    price: seed.priceUSD,
    unit: 'Pc',
    qty: seed.qty,
    initialQty: seed.qty,
    min: seed.min,
    max: seed.max,
    creator: seed.creator,
    creatorImg: buildAvatarSvg(seed.creator, creatorBackground),
    productImg,
    galleryImages,
    images: galleryImages.slice(),
    emoji: seed.emoji,
    soldThisMonth: seed.soldThisMonth,
    trend: seed.trend,
    description: seed.description,
    supplier: seed.supplier,
    highlights: seed.highlights,
    specs: seed.specs,
    palette: seed.palette,
    storeInventory: cloneStoreInventory(storeInventory),
    initialStoreInventory: cloneStoreInventory(storeInventory),
    feedback,
    ratingBreakdown,
    ratingCount,
    ratingAvg,
    revenue: 0,
    status: 'active',
    visibility: 'published',
    createdAt: '2026-01-01T09:00:00.000Z',
    updatedAt: '2026-01-01T09:00:00.000Z',
  };
}

export const INITIAL_DB: DatabaseSchema = {
  products: PRODUCT_SEEDS.map(buildProduct),
  stores: STORE_SEEDS,
  customers: CUSTOMER_SEEDS,
  billers: BILLER_SEEDS,
  biller_requests: [],
  suppliers: [],
  warehouses: [],
  purchaseOrders: [],
  reservations: [],
  reservationRequests: [],
  transactions: [],
  returns: [],
  stockAdjustments: [],
};
