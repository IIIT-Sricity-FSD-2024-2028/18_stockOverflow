export type ProductTrend = 'up' | 'down' | 'stable';
export type ProductStatus = 'active' | 'inactive' | 'draft';
export type ProductVisibility = 'published' | 'hidden' | 'scheduled';
export type SupplierStatus = 'active' | 'inactive';
export type WarehouseStatus = 'active' | 'inactive';
export type ReturnStatus = 'Pending' | 'Approved' | 'Rejected' | 'Exchanged';
export type ReturnPriority = 'High' | 'Medium' | 'Low';
export type StockAdjustmentType = 'add' | 'remove';
export type StockAdjustmentStatus = 'completed' | 'pending';
export type PurchaseOrderStatus =
  | 'Draft'
  | 'Pending Approval'
  | 'Confirmed'
  | 'Cancelled'
  | 'Received';
export type PurchaseOrderStockStatus = 'ok' | 'low' | 'out';

export interface RatingBreakdown {
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
}

export interface ProductFeedback {
  id: string;
  sku: string;
  productName: string;
  customer: string;
  customerId?: string;
  type: string;
  rating: number;
  comment: string;
  date: string;
}

export interface StoreInventoryEntry {
  storeId: string;
  qty: number;
}

export interface ProductRecord {
  id: string;
  sku: string;
  name: string;
  category: string;
  subcategory: string;
  subCategory?: string;
  brand: string;
  priceUSD: number;
  price: number;
  cost?: number;
  discountType?: string;
  discountValue?: number;
  finalPrice?: number;
  taxRate?: number;
  taxType?: string;
  unit: string;
  qty: number;
  initialQty: number;
  min: number;
  max: number;
  creator: string;
  creatorImg: string;
  productImg: string;
  galleryImages: string[];
  images: string[];
  emoji: string;
  soldThisMonth: number;
  trend: ProductTrend | string;
  description: string;
  descriptionHtml?: string;
  supplier: string;
  supplierSku?: string;
  barcode?: string;
  warehouse?: string;
  bin?: string;
  reorderPoint?: number;
  reorderQty?: number;
  hasVariants?: boolean;
  variants?: Array<Record<string, unknown>>;
  hasExpiry?: boolean;
  expiryDate?: string;
  batchNumber?: string;
  weightKg?: number;
  lengthCm?: number;
  widthCm?: number;
  heightCm?: number;
  shippingClass?: string;
  customFields?: Array<Record<string, unknown>>;
  tags?: string[];
  highlights: string[];
  specs: Record<string, string>;
  palette: string[];
  storeInventory: StoreInventoryEntry[];
  initialStoreInventory: StoreInventoryEntry[];
  feedback: ProductFeedback[];
  ratingBreakdown: RatingBreakdown;
  ratingCount: number;
  ratingAvg: number;
  revenue: number;
  status: ProductStatus | string;
  visibility: ProductVisibility | string;
  createdAt: string;
  updatedAt: string;
  restockedAt?: string;
  lastStockChangeAt?: string;
}

export type Product = ProductRecord;

export interface StoreRecord {
  id: string;
  name: string;
  location: string;
  manager: string;
  status: string;
}

export interface CustomerRecord {
  id: string | number;
  name: string;
  fname: string;
  lname: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  store: string;
  status: string;
  totalOrders: number;
  totalSpent: number;
  orders: number;
  spent: number;
  created: string;
  rating: number;
  notes: string;
}

export type Customer = CustomerRecord;

export interface BillerRecord {
  id: string | number;
  code: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  country: string;
  status: string;
  avatar: string;
}

export type Biller = BillerRecord;

export interface Supplier {
  id: string | number;
  code: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  country: string;
  category: string;
  terms: string;
  rating: number;
  status: SupplierStatus | string;
  totalProducts: number;
  totalOrders: number;
  onTimeRate: number;
  qualityScore: number;
  averageLeadTimeDays: number;
}

export interface WarehouseInventoryItem {
  sku: string;
  name: string;
  cat: string;
  qty: number;
  max: number;
  price: number;
  emoji: string;
}

export interface WarehouseZone {
  name: string;
  used: number;
  total: number;
  color: string;
}

export interface Warehouse {
  id: string | number;
  name: string;
  contact: string;
  phone: string;
  totalProducts: number;
  totalStock: number;
  createdOn: string;
  createdTs: number;
  status: WarehouseStatus | string;
  inventory: WarehouseInventoryItem[];
  zones: WarehouseZone[];
}

export interface PurchaseOrderItem {
  id: string;
  name: string;
  emoji: string;
  sku: string;
  cat: string;
  price: number;
  qty: number;
  stock: number;
  stockStatus: PurchaseOrderStockStatus | string;
}

export interface PurchaseOrder {
  id: string;
  supplierId: string | number;
  supplierName: string;
  retailerId?: string;
  retailerName?: string;
  items: PurchaseOrderItem[];
  deliveryDate: string;
  paymentTerms: string;
  notes: string;
  shippingAddress: string;
  subtotal: number;
  tax: number;
  total: number;
  units: number;
  status: PurchaseOrderStatus | string;
  createdAt: string;
}

export interface ReservationRecord {
  requestId: string;
  sku: string;
  name: string;
  qty: number;
  priceUSD: number;
  productImg: string;
  emoji: string;
  maxAvailable: number;
  storeId: string;
  store: string;
  paymentMethod: string;
  status: string;
  reservedAt: string;
}

export interface ReservationRequestRecord {
  requestId: string;
  sku: string;
  productName: string;
  qty: number;
  storeId: string;
  store: string;
  paymentMethod: string;
  status: string;
  createdAt: string;
  completedAt?: string;
  completedBy?: string;
  confirmationShownAt?: string;
  orderId?: string;
}

export interface TransactionItemRecord {
  sku: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
  isReserved: boolean;
  requestIds: string[];
}

export interface TransactionRecord {
  orderId: string;
  timestamp: string;
  customer: string;
  store: string;
  storeId: string;
  paymentMethod: string;
  items: TransactionItemRecord[];
  subtotal: number;
  shipping: number;
  tax: number;
  coupon: number;
  discount: number;
  roundoff: number;
  finalTotal: number;
  status: string;
}

export interface ReturnRecord {
  id: string;
  orderId: string;
  customer: string;
  customerId?: string;
  email: string;
  sku: string;
  productName: string;
  product: string;
  productImg: string;
  emoji: string;
  reason: string;
  condition: string;
  refundMethod: string;
  method: string;
  notes: string;
  status: ReturnStatus | string;
  date: string;
  dateN: number;
  amount: number;
  priority: ReturnPriority | string;
  storeId?: string;
  store?: string;
  source?: string;
}

export type ReturnRequest = ReturnRecord;

export interface StockAdjustment {
  id: string | number;
  productSku: string;
  product: string;
  warehouse: string;
  type: StockAdjustmentType | string;
  qty: number;
  reason: string;
  date: string;
  person: string;
  personImg: string;
  status: StockAdjustmentStatus | string;
  notes: string;
}

export interface BillerRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  country: string;
  retailerId: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  approvedAt?: string;
  rejectedAt?: string;
}

export interface DatabaseSchema {
  products: ProductRecord[];
  stores: StoreRecord[];
  customers: CustomerRecord[];
  billers: BillerRecord[];
  biller_requests: BillerRequest[];
  suppliers: Supplier[];
  warehouses: Warehouse[];
  purchaseOrders: PurchaseOrder[];
  reservations: ReservationRecord[];
  reservationRequests: ReservationRequestRecord[];
  transactions: TransactionRecord[];
  returns: ReturnRecord[];
  stockAdjustments: StockAdjustment[];
}

export type DatabaseCollectionKey = keyof DatabaseSchema;
