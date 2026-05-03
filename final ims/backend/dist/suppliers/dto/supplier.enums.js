"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReturnPolicy = exports.ShippingMode = exports.DeliveryRadius = exports.ProductUnit = exports.ProductCategory = exports.RetailerCategory = exports.SupplierCategory = exports.SellingType = exports.PaymentTerms = exports.Currency = exports.BusinessType = void 0;
var BusinessType;
(function (BusinessType) {
    BusinessType["Manufacturer"] = "Manufacturer";
    BusinessType["Wholesaler"] = "Wholesaler";
    BusinessType["Distributor"] = "Distributor";
    BusinessType["ImporterExporter"] = "Importer / Exporter";
    BusinessType["TradingCompany"] = "Trading Company";
})(BusinessType || (exports.BusinessType = BusinessType = {}));
var Currency;
(function (Currency) {
    Currency["INR"] = "INR";
    Currency["USD"] = "USD";
    Currency["EUR"] = "EUR";
    Currency["GBP"] = "GBP";
    Currency["AUD"] = "AUD";
})(Currency || (exports.Currency = Currency = {}));
var PaymentTerms;
(function (PaymentTerms) {
    PaymentTerms["Net30"] = "Net 30";
    PaymentTerms["Net15"] = "Net 15";
    PaymentTerms["Net45"] = "Net 45";
    PaymentTerms["COD"] = "COD";
    PaymentTerms["Prepaid"] = "Prepaid";
})(PaymentTerms || (exports.PaymentTerms = PaymentTerms = {}));
var SellingType;
(function (SellingType) {
    SellingType["Wholesale"] = "Wholesale";
    SellingType["Retail"] = "Retail";
    SellingType["Both"] = "Both";
})(SellingType || (exports.SellingType = SellingType = {}));
var SupplierCategory;
(function (SupplierCategory) {
    SupplierCategory["ElectronicsTechnology"] = "Electronics & Technology";
    SupplierCategory["ComputersPeripherals"] = "Computers & Peripherals";
    SupplierCategory["FashionApparel"] = "Fashion & Apparel";
    SupplierCategory["FoodGrocery"] = "Food & Grocery";
    SupplierCategory["HomeFurniture"] = "Home & Furniture";
    SupplierCategory["HealthBeauty"] = "Health & Beauty";
    SupplierCategory["MobileTelecom"] = "Mobile & Telecom";
    SupplierCategory["SportsOutdoors"] = "Sports & Outdoors";
    SupplierCategory["BagsAccessories"] = "Bags & Accessories";
    SupplierCategory["Appliances"] = "Appliances";
    SupplierCategory["MixedGeneral"] = "Mixed / General";
})(SupplierCategory || (exports.SupplierCategory = SupplierCategory = {}));
var RetailerCategory;
(function (RetailerCategory) {
    RetailerCategory["Electronics"] = "Electronics";
    RetailerCategory["Computers"] = "Computers";
    RetailerCategory["Fashion"] = "Fashion";
    RetailerCategory["Furniture"] = "Furniture";
    RetailerCategory["FoodGrocery"] = "Food & Grocery";
    RetailerCategory["Mobile"] = "Mobile";
    RetailerCategory["BagsAccessories"] = "Bags & Accessories";
    RetailerCategory["Appliances"] = "Appliances";
    RetailerCategory["Mixed"] = "Mixed";
})(RetailerCategory || (exports.RetailerCategory = RetailerCategory = {}));
var ProductCategory;
(function (ProductCategory) {
    ProductCategory["Electronics"] = "Electronics";
    ProductCategory["Computers"] = "Computers";
    ProductCategory["Fashion"] = "Fashion";
    ProductCategory["Furniture"] = "Furniture";
    ProductCategory["Mobile"] = "Mobile";
    ProductCategory["Bags"] = "Bags";
    ProductCategory["Appliances"] = "Appliances";
    ProductCategory["FoodBeverage"] = "Food & Beverage";
    ProductCategory["Sports"] = "Sports";
    ProductCategory["Beauty"] = "Beauty";
    ProductCategory["Mixed"] = "Mixed";
})(ProductCategory || (exports.ProductCategory = ProductCategory = {}));
var ProductUnit;
(function (ProductUnit) {
    ProductUnit["Piece"] = "Piece";
    ProductUnit["Box"] = "Box";
    ProductUnit["Kg"] = "Kg";
    ProductUnit["Set"] = "Set";
    ProductUnit["Pair"] = "Pair";
    ProductUnit["Meter"] = "Meter";
    ProductUnit["Ltr"] = "Ltr";
})(ProductUnit || (exports.ProductUnit = ProductUnit = {}));
var DeliveryRadius;
(function (DeliveryRadius) {
    DeliveryRadius["LocalCity"] = "Local City";
    DeliveryRadius["StateWide"] = "State-wide";
    DeliveryRadius["PanIndia"] = "Pan India";
    DeliveryRadius["International"] = "International";
})(DeliveryRadius || (exports.DeliveryRadius = DeliveryRadius = {}));
var ShippingMode;
(function (ShippingMode) {
    ShippingMode["OwnFleet"] = "Own Fleet";
    ShippingMode["ThirdPartyCourier"] = "Third-party Courier";
    ShippingMode["Both"] = "Both";
    ShippingMode["PickupOnly"] = "Pickup Only";
})(ShippingMode || (exports.ShippingMode = ShippingMode = {}));
var ReturnPolicy;
(function (ReturnPolicy) {
    ReturnPolicy["SevenDayReturns"] = "7-day Returns";
    ReturnPolicy["FourteenDayReturns"] = "14-day Returns";
    ReturnPolicy["ThirtyDayReturns"] = "30-day Returns";
    ReturnPolicy["NoReturns"] = "No Returns";
    ReturnPolicy["DefectsOnly"] = "Defects Only";
})(ReturnPolicy || (exports.ReturnPolicy = ReturnPolicy = {}));
//# sourceMappingURL=supplier.enums.js.map