"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateSupplierSetupDto = exports.BankDetailsDto = exports.PricingPoliciesDto = exports.ProductDto = exports.RetailerDto = exports.PrimaryContactDto = exports.SupplierBusinessInfoDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const supplier_enums_1 = require("./supplier.enums");
const PHONE_REGEX = /^\+?[0-9\s-]{7,20}$/;
const GST_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
const SUPPLIER_CODE_REGEX = /^[A-Z]{2,5}-[0-9]{3,6}$/;
const RETAILER_CODE_REGEX = /^RET-[0-9]{3,6}$/;
const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;
const UPI_REGEX = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+$/;
class SupplierBusinessInfoDto {
    constructor() {
        this.currency = supplier_enums_1.Currency.INR;
        this.paymentTerms = supplier_enums_1.PaymentTerms.Net30;
        this.sellingType = supplier_enums_1.SellingType.Wholesale;
    }
}
exports.SupplierBusinessInfoDto = SupplierBusinessInfoDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(120),
    __metadata("design:type", String)
], SupplierBusinessInfoDto.prototype, "companyName", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(supplier_enums_1.BusinessType),
    __metadata("design:type", String)
], SupplierBusinessInfoDto.prototype, "businessType", void 0);
__decorate([
    (0, class_validator_1.IsEmail)(),
    (0, class_validator_1.MaxLength)(160),
    __metadata("design:type", String)
], SupplierBusinessInfoDto.prototype, "businessEmail", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Matches)(PHONE_REGEX, {
        message: 'phoneNumber must be a valid phone number',
    }),
    __metadata("design:type", String)
], SupplierBusinessInfoDto.prototype, "phoneNumber", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Matches)(GST_REGEX, {
        message: 'gstNumber must be a valid Indian GST number',
    }),
    __metadata("design:type", String)
], SupplierBusinessInfoDto.prototype, "gstNumber", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Matches)(SUPPLIER_CODE_REGEX, {
        message: 'supplierCode must look like SUP-1234',
    }),
    __metadata("design:type", String)
], SupplierBusinessInfoDto.prototype, "supplierCode", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(supplier_enums_1.Currency),
    __metadata("design:type", String)
], SupplierBusinessInfoDto.prototype, "currency", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(250),
    __metadata("design:type", String)
], SupplierBusinessInfoDto.prototype, "businessAddress", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(80),
    __metadata("design:type", String)
], SupplierBusinessInfoDto.prototype, "state", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUrl)({ require_protocol: true }),
    (0, class_validator_1.MaxLength)(180),
    __metadata("design:type", String)
], SupplierBusinessInfoDto.prototype, "website", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(supplier_enums_1.SupplierCategory),
    __metadata("design:type", String)
], SupplierBusinessInfoDto.prototype, "primaryCategory", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(supplier_enums_1.PaymentTerms),
    __metadata("design:type", String)
], SupplierBusinessInfoDto.prototype, "paymentTerms", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(supplier_enums_1.SellingType),
    __metadata("design:type", String)
], SupplierBusinessInfoDto.prototype, "sellingType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(1000),
    __metadata("design:type", String)
], SupplierBusinessInfoDto.prototype, "description", void 0);
class PrimaryContactDto {
}
exports.PrimaryContactDto = PrimaryContactDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(120),
    __metadata("design:type", String)
], PrimaryContactDto.prototype, "fullName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], PrimaryContactDto.prototype, "designation", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEmail)(),
    (0, class_validator_1.MaxLength)(160),
    __metadata("design:type", String)
], PrimaryContactDto.prototype, "directEmail", void 0);
class RetailerDto {
    constructor() {
        this.creditTerms = supplier_enums_1.PaymentTerms.Net30;
    }
}
exports.RetailerDto = RetailerDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(120),
    __metadata("design:type", String)
], RetailerDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Matches)(RETAILER_CODE_REGEX, {
        message: 'code must look like RET-001',
    }),
    __metadata("design:type", String)
], RetailerDto.prototype, "code", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(120),
    __metadata("design:type", String)
], RetailerDto.prototype, "contactPerson", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Matches)(PHONE_REGEX, {
        message: 'phone must be a valid phone number',
    }),
    __metadata("design:type", String)
], RetailerDto.prototype, "phone", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEmail)(),
    (0, class_validator_1.MaxLength)(160),
    __metadata("design:type", String)
], RetailerDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(80),
    __metadata("design:type", String)
], RetailerDto.prototype, "state", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(supplier_enums_1.RetailerCategory),
    __metadata("design:type", String)
], RetailerDto.prototype, "categorySupplied", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(supplier_enums_1.PaymentTerms),
    __metadata("design:type", String)
], RetailerDto.prototype, "creditTerms", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(250),
    __metadata("design:type", String)
], RetailerDto.prototype, "address", void 0);
class ProductDto {
    constructor() {
        this.unit = supplier_enums_1.ProductUnit.Piece;
    }
}
exports.ProductDto = ProductDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(40),
    __metadata("design:type", String)
], ProductDto.prototype, "sku", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(160),
    __metadata("design:type", String)
], ProductDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(120),
    __metadata("design:type", String)
], ProductDto.prototype, "brand", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(120),
    __metadata("design:type", String)
], ProductDto.prototype, "variant", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(supplier_enums_1.ProductCategory),
    __metadata("design:type", String)
], ProductDto.prototype, "category", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], ProductDto.prototype, "unitPrice", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], ProductDto.prototype, "minOrderQty", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], ProductDto.prototype, "stockAvailable", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(supplier_enums_1.ProductUnit),
    __metadata("design:type", String)
], ProductDto.prototype, "unit", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], ProductDto.prototype, "expiryDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(280),
    __metadata("design:type", String)
], ProductDto.prototype, "reviewSummary", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(1000),
    __metadata("design:type", String)
], ProductDto.prototype, "description", void 0);
class PricingPoliciesDto {
    constructor() {
        this.defaultPaymentTerms = supplier_enums_1.PaymentTerms.Net30;
    }
}
exports.PricingPoliciesDto = PricingPoliciesDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(supplier_enums_1.PaymentTerms),
    __metadata("design:type", String)
], PricingPoliciesDto.prototype, "defaultPaymentTerms", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], PricingPoliciesDto.prototype, "minimumOrderValue", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], PricingPoliciesDto.prototype, "averageLeadTimeDays", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(supplier_enums_1.DeliveryRadius),
    __metadata("design:type", String)
], PricingPoliciesDto.prototype, "deliveryRadius", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(supplier_enums_1.ShippingMode),
    __metadata("design:type", String)
], PricingPoliciesDto.prototype, "shippingMode", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(supplier_enums_1.ReturnPolicy),
    __metadata("design:type", String)
], PricingPoliciesDto.prototype, "returnPolicy", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(1000),
    __metadata("design:type", String)
], PricingPoliciesDto.prototype, "specialTermsNotes", void 0);
class BankDetailsDto {
}
exports.BankDetailsDto = BankDetailsDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(120),
    __metadata("design:type", String)
], BankDetailsDto.prototype, "bankName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(120),
    __metadata("design:type", String)
], BankDetailsDto.prototype, "accountHolderName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(34),
    __metadata("design:type", String)
], BankDetailsDto.prototype, "accountNumber", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Matches)(IFSC_REGEX, {
        message: 'ifscCode must be a valid IFSC code',
    }),
    __metadata("design:type", String)
], BankDetailsDto.prototype, "ifscCode", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Matches)(UPI_REGEX, {
        message: 'upiId must be a valid UPI ID',
    }),
    __metadata("design:type", String)
], BankDetailsDto.prototype, "upiId", void 0);
class CreateSupplierSetupDto {
}
exports.CreateSupplierSetupDto = CreateSupplierSetupDto;
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => SupplierBusinessInfoDto),
    __metadata("design:type", SupplierBusinessInfoDto)
], CreateSupplierSetupDto.prototype, "business", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => PrimaryContactDto),
    __metadata("design:type", PrimaryContactDto)
], CreateSupplierSetupDto.prototype, "primaryContact", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['active', 'inactive']),
    __metadata("design:type", String)
], CreateSupplierSetupDto.prototype, "profileStatus", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMaxSize)(200),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => RetailerDto),
    __metadata("design:type", Array)
], CreateSupplierSetupDto.prototype, "retailers", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMaxSize)(500),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ProductDto),
    __metadata("design:type", Array)
], CreateSupplierSetupDto.prototype, "products", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => PricingPoliciesDto),
    __metadata("design:type", PricingPoliciesDto)
], CreateSupplierSetupDto.prototype, "pricingPolicies", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => BankDetailsDto),
    __metadata("design:type", BankDetailsDto)
], CreateSupplierSetupDto.prototype, "bankDetails", void 0);
//# sourceMappingURL=create-supplier-setup.dto.js.map