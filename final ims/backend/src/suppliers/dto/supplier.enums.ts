export enum BusinessType {
  Manufacturer = 'Manufacturer',
  Wholesaler = 'Wholesaler',
  Distributor = 'Distributor',
  ImporterExporter = 'Importer / Exporter',
  TradingCompany = 'Trading Company',
}

export enum Currency {
  INR = 'INR',
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP',
  AUD = 'AUD',
}

export enum PaymentTerms {
  Net30 = 'Net 30',
  Net15 = 'Net 15',
  Net45 = 'Net 45',
  COD = 'COD',
  Prepaid = 'Prepaid',
}

export enum SellingType {
  Wholesale = 'Wholesale',
  Retail = 'Retail',
  Both = 'Both',
}

export enum SupplierCategory {
  ElectronicsTechnology = 'Electronics & Technology',
  ComputersPeripherals = 'Computers & Peripherals',
  FashionApparel = 'Fashion & Apparel',
  FoodGrocery = 'Food & Grocery',
  HomeFurniture = 'Home & Furniture',
  HealthBeauty = 'Health & Beauty',
  MobileTelecom = 'Mobile & Telecom',
  SportsOutdoors = 'Sports & Outdoors',
  BagsAccessories = 'Bags & Accessories',
  Appliances = 'Appliances',
  MixedGeneral = 'Mixed / General',
}

export enum RetailerCategory {
  Electronics = 'Electronics',
  Computers = 'Computers',
  Fashion = 'Fashion',
  Furniture = 'Furniture',
  FoodGrocery = 'Food & Grocery',
  Mobile = 'Mobile',
  BagsAccessories = 'Bags & Accessories',
  Appliances = 'Appliances',
  Mixed = 'Mixed',
}

export enum ProductCategory {
  Electronics = 'Electronics',
  Computers = 'Computers',
  Fashion = 'Fashion',
  Furniture = 'Furniture',
  Mobile = 'Mobile',
  Bags = 'Bags',
  Appliances = 'Appliances',
  FoodBeverage = 'Food & Beverage',
  Sports = 'Sports',
  Beauty = 'Beauty',
  Mixed = 'Mixed',
}

export enum ProductUnit {
  Piece = 'Piece',
  Box = 'Box',
  Kg = 'Kg',
  Set = 'Set',
  Pair = 'Pair',
  Meter = 'Meter',
  Ltr = 'Ltr',
}

export enum DeliveryRadius {
  LocalCity = 'Local City',
  StateWide = 'State-wide',
  PanIndia = 'Pan India',
  International = 'International',
}

export enum ShippingMode {
  OwnFleet = 'Own Fleet',
  ThirdPartyCourier = 'Third-party Courier',
  Both = 'Both',
  PickupOnly = 'Pickup Only',
}

export enum ReturnPolicy {
  SevenDayReturns = '7-day Returns',
  FourteenDayReturns = '14-day Returns',
  ThirtyDayReturns = '30-day Returns',
  NoReturns = 'No Returns',
  DefectsOnly = 'Defects Only',
}
