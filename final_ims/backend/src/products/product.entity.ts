export class Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  brand: string;
  priceUSD: number;
  unit: string;
  qty: number;
  max?: number;
  creator?: string;
  productImg?: string;
  emoji?: string;
  soldThisMonth?: number;
  trend?: string;
  storeInventory?: { storeId: string; qty: number }[];
}