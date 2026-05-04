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
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const node_crypto_1 = require("node:crypto");
const json_db_service_1 = require("../common/json-db.service");
let ProductsService = class ProductsService {
    constructor(db) {
        this.db = db;
    }
    findAll(retailerId, storeId) {
        return this.filterProducts(this.getProducts(), retailerId, storeId);
    }
    findOne(id, retailerId, storeId) {
        const product = this.filterProducts(this.getProducts(), retailerId, storeId).find((entry) => entry.id === id);
        if (!product) {
            throw new common_1.NotFoundException('Product not found');
        }
        return product;
    }
    findBySku(sku, retailerId, storeId) {
        const product = this.filterProducts(this.getProducts(), retailerId, storeId).find((entry) => {
            return entry.sku.toLowerCase() === String(sku || '').toLowerCase();
        });
        if (!product) {
            throw new common_1.NotFoundException('Product not found');
        }
        return product;
    }
    create(createProductDto) {
        const products = this.getProducts();
        const sku = this.normalizeSku(createProductDto.sku ||
            this.generateNextSku(products, createProductDto.retailerId));
        this.ensureUniqueSku(products, sku, undefined, createProductDto.retailerId);
        const created = this.buildProductRecord(createProductDto, {
            id: (0, node_crypto_1.randomUUID)(),
            sku,
        });
        products.unshift(created);
        this.saveProducts(products);
        return created;
    }
    update(id, updateProductDto) {
        const products = this.getProducts();
        const index = products.findIndex((entry) => entry.id === id);
        if (index === -1) {
            throw new common_1.NotFoundException('Product not found');
        }
        const existing = products[index];
        const nextSku = this.normalizeSku(updateProductDto.sku || existing.sku);
        this.ensureUniqueSku(products, nextSku, existing.id, existing.retailerId);
        const merged = this.buildProductRecord(updateProductDto, {
            id: existing.id,
            sku: nextSku,
            existing,
        });
        products[index] = merged;
        this.saveProducts(products);
        return merged;
    }
    remove(id) {
        const products = this.getProducts();
        const index = products.findIndex((entry) => entry.id === id);
        if (index === -1) {
            throw new common_1.NotFoundException('Product not found');
        }
        const [removed] = products.splice(index, 1);
        this.saveProducts(products);
        return {
            message: 'Product deleted successfully',
            item: removed,
        };
    }
    getFeedback(sku, retailerId) {
        return this.findBySku(sku, retailerId).feedback.slice().sort((a, b) => {
            return new Date(b.date).getTime() - new Date(a.date).getTime();
        });
    }
    getRatingSummary(sku, retailerId) {
        const product = this.findBySku(sku, retailerId);
        return {
            avg: product.ratingAvg,
            total: product.ratingCount,
            breakdown: product.ratingBreakdown,
        };
    }
    addFeedback(sku, createProductFeedbackDto, retailerId) {
        const products = this.getProducts();
        const index = products.findIndex((entry) => {
            return (entry.sku.toLowerCase() === String(sku || '').toLowerCase() &&
                this.matchesRetailerScope(entry.retailerId, retailerId));
        });
        if (index === -1) {
            throw new common_1.NotFoundException('Product not found');
        }
        const product = products[index];
        const feedback = {
            id: (0, node_crypto_1.randomUUID)(),
            sku: product.sku,
            productName: this.normalizeText(createProductFeedbackDto.productName, product.name),
            customer: this.normalizeText(createProductFeedbackDto.customer, 'Recent Buyer'),
            type: this.normalizeText(createProductFeedbackDto.type, 'General'),
            rating: Math.max(1, Math.min(5, Math.trunc(createProductFeedbackDto.rating || 0))),
            comment: this.normalizeText(createProductFeedbackDto.comment, 'No comment provided.'),
            date: new Date().toISOString(),
        };
        product.feedback = [feedback, ...(product.feedback || [])].slice(0, 200);
        this.applyRatings(product);
        product.updatedAt = new Date().toISOString();
        products[index] = product;
        this.saveProducts(products);
        return feedback;
    }
    rebuildInventoryFromTransactions(transactions) {
        const products = this.getProducts().map((product) => ({
            ...product,
            qty: product.initialQty,
            price: product.price,
            revenue: 0,
            soldThisMonth: 0,
            storeInventory: product.initialStoreInventory.map((entry) => ({ ...entry })),
        }));
        const now = new Date();
        transactions.forEach((transaction) => {
            const transactionDate = new Date(transaction.timestamp);
            const countsForCurrentMonth = !Number.isNaN(transactionDate.getTime()) &&
                transactionDate.getFullYear() === now.getFullYear() &&
                transactionDate.getMonth() === now.getMonth();
            transaction.items.forEach((item) => {
                const product = products.find((entry) => {
                    return (entry.sku === item.sku &&
                        this.isSameRetailerScope(entry.retailerId, transaction.retailerId));
                });
                if (!product) {
                    return;
                }
                product.qty = Math.max(0, product.qty - item.quantity);
                product.revenue = this.toMoney((product.revenue || 0) + item.total);
                if (countsForCurrentMonth) {
                    product.soldThisMonth =
                        this.toSafeInteger(product.soldThisMonth || 0) + item.quantity;
                }
                const targetStoreId = transaction.storeId || this.resolveStoreId(transaction.store);
                const inventoryEntry = product.storeInventory.find((entry) => entry.storeId === targetStoreId) ||
                    product.storeInventory[0];
                if (inventoryEntry) {
                    inventoryEntry.qty = Math.max(0, inventoryEntry.qty - item.quantity);
                }
                product.updatedAt = new Date().toISOString();
            });
        });
        this.saveProducts(products);
        return products;
    }
    applyInventoryAdjustment(sku, qtyDelta, preferredStoreId, retailerId) {
        const products = this.getProducts();
        const index = products.findIndex((entry) => {
            return (entry.sku === sku &&
                this.matchesRetailerScope(entry.retailerId, retailerId));
        });
        if (index === -1) {
            throw new common_1.NotFoundException('Product not found');
        }
        const product = products[index];
        const nextQty = Math.max(0, product.qty + qtyDelta);
        const nextInitialQty = Math.max(0, product.initialQty + qtyDelta);
        const nextStoreInventory = this.adjustStoreInventory(product.storeInventory, qtyDelta, preferredStoreId);
        const nextInitialStoreInventory = this.adjustStoreInventory(product.initialStoreInventory, qtyDelta, preferredStoreId);
        const now = new Date().toISOString();
        const updated = {
            ...product,
            qty: nextQty,
            initialQty: nextInitialQty,
            storeInventory: nextStoreInventory,
            initialStoreInventory: nextInitialStoreInventory,
            updatedAt: now,
            lastStockChangeAt: now,
            restockedAt: qtyDelta > 0 ? now : product.restockedAt,
        };
        products[index] = updated;
        this.saveProducts(products);
        return updated;
    }
    getProducts() {
        const products = this.db.getCollection('products');
        return products.map((entry, index) => this.normalizeStoredProduct(entry, index));
    }
    saveProducts(products) {
        const normalized = products.map((entry, index) => this.normalizeStoredProduct(entry, index));
        return this.db.saveCollection('products', normalized);
    }
    filterProducts(products, retailerId, storeId) {
        const normalizedStoreId = this.normalizeText(storeId);
        return products
            .filter((product) => this.matchesRetailerScope(product.retailerId, retailerId))
            .filter((product) => {
            if (!normalizedStoreId) {
                return true;
            }
            return (product.storeInventory.some((entry) => this.normalizeText(entry.storeId) === normalizedStoreId) ||
                product.initialStoreInventory.some((entry) => this.normalizeText(entry.storeId) === normalizedStoreId));
        })
            .map((product) => this.projectProductForStore(product, normalizedStoreId));
    }
    normalizeStoredProduct(entry, index) {
        const now = new Date().toISOString();
        const sku = this.normalizeSku(entry.sku || `PT${String(index + 1).padStart(3, '0')}`);
        const name = this.normalizeText(entry.name, `Product ${index + 1}`);
        const category = this.normalizeText(entry.category, 'General');
        const subcategory = this.normalizeText(entry.subcategory || entry.subCategory, category);
        const priceUSD = this.toMoney(this.pickNumber(entry.priceUSD, entry.price, 0));
        const productImg = this.normalizeText(entry.productImg);
        const emoji = this.normalizeText(entry.emoji, String.fromCodePoint(0x1f4e6));
        const galleryImages = this.normalizeImageList(Array.isArray(entry.galleryImages) ? entry.galleryImages : entry.images);
        const allImages = this.buildImageSet(productImg, galleryImages, {
            name,
            category,
            sku,
            emoji,
        });
        const primaryImage = productImg || allImages[0];
        const qty = this.toSafeInteger(entry.qty ?? 0);
        const min = this.toSafeInteger(entry.min ?? 0);
        const max = Math.max(this.toSafeInteger(entry.max ?? 0), qty, min, 1);
        const initialQty = Math.max(this.toSafeInteger(entry.initialQty ?? qty), qty);
        const storeInventory = this.normalizeStoreInventory(entry.storeInventory, qty, index);
        const initialStoreInventory = this.normalizeStoreInventory(entry.initialStoreInventory && entry.initialStoreInventory.length
            ? entry.initialStoreInventory
            : storeInventory, initialQty, index);
        const feedback = Array.isArray(entry.feedback)
            ? entry.feedback
                .filter((item) => Boolean(item))
                .map((item, feedbackIndex) => ({
                id: item.id || `${sku.toLowerCase()}-feedback-${feedbackIndex + 1}`,
                sku,
                productName: this.normalizeText(item.productName, name),
                customer: this.normalizeText(item.customer, 'Recent Buyer'),
                customerId: this.normalizeText(item.customerId),
                type: this.normalizeText(item.type, 'General'),
                rating: Math.max(1, Math.min(5, Math.trunc(Number(item.rating) || 0))),
                comment: this.normalizeText(item.comment, 'No comment provided.'),
                date: item.date || now,
            }))
            : [];
        const normalized = {
            id: this.normalizeText(entry.id, `prod-${sku.toLowerCase()}`),
            retailerId: this.normalizeText(entry.retailerId),
            sku,
            name,
            category,
            subcategory,
            subCategory: subcategory,
            brand: this.normalizeText(entry.brand, 'Generic'),
            priceUSD,
            price: priceUSD,
            cost: this.toOptionalMoney(entry.cost),
            discountType: this.normalizeText(entry.discountType, 'none'),
            discountValue: this.toOptionalMoney(entry.discountValue),
            finalPrice: this.toMoney(this.pickNumber(entry.finalPrice, priceUSD, priceUSD)),
            taxRate: this.toOptionalMoney(entry.taxRate),
            taxType: this.normalizeText(entry.taxType, 'Inclusive'),
            unit: this.normalizeText(entry.unit, 'Pc'),
            qty,
            initialQty,
            min,
            max,
            creator: this.normalizeText(entry.creator, 'Retail Manager'),
            creatorImg: this.normalizeText(entry.creatorImg, this.buildAvatarSvg(this.normalizeText(entry.creator, 'Retail Manager'))),
            productImg: primaryImage,
            galleryImages: allImages.slice(0, 3),
            images: allImages,
            emoji,
            soldThisMonth: this.toSafeInteger(entry.soldThisMonth ?? 0),
            trend: this.normalizeText(entry.trend, 'up'),
            description: this.normalizeText(entry.description),
            descriptionHtml: this.normalizeText(entry.descriptionHtml),
            supplier: this.normalizeText(entry.supplier, entry.brand || 'StockOverflow Supply'),
            supplierSku: this.normalizeText(entry.supplierSku),
            barcode: this.normalizeText(entry.barcode),
            warehouse: this.normalizeText(entry.warehouse),
            bin: this.normalizeText(entry.bin),
            reorderPoint: this.toSafeInteger(entry.reorderPoint ?? min),
            reorderQty: this.toSafeInteger(entry.reorderQty ?? Math.max(1, min)),
            hasVariants: Boolean(entry.hasVariants || (entry.variants || []).length),
            variants: Array.isArray(entry.variants) ? entry.variants.map((item) => ({ ...item })) : [],
            hasExpiry: Boolean(entry.hasExpiry || entry.expiryDate || entry.batchNumber),
            expiryDate: this.normalizeText(entry.expiryDate),
            batchNumber: this.normalizeText(entry.batchNumber),
            weightKg: this.toOptionalMoney(entry.weightKg),
            lengthCm: this.toOptionalMoney(entry.lengthCm),
            widthCm: this.toOptionalMoney(entry.widthCm),
            heightCm: this.toOptionalMoney(entry.heightCm),
            shippingClass: this.normalizeText(entry.shippingClass, 'Standard'),
            customFields: Array.isArray(entry.customFields)
                ? entry.customFields.map((item) => ({ ...item }))
                : [],
            tags: Array.isArray(entry.tags)
                ? entry.tags.map((item) => this.normalizeText(item)).filter(Boolean)
                : [],
            highlights: Array.isArray(entry.highlights)
                ? entry.highlights.map((item) => this.normalizeText(item)).filter(Boolean)
                : [],
            specs: this.normalizeSpecs(entry.specs),
            palette: Array.isArray(entry.palette)
                ? entry.palette.map((item) => this.normalizeText(item)).filter(Boolean)
                : [],
            storeInventory,
            initialStoreInventory,
            feedback,
            ratingBreakdown: this.normalizeRatingBreakdown(entry.ratingBreakdown),
            ratingCount: this.toSafeInteger(entry.ratingCount ?? feedback.length),
            ratingAvg: this.toMoney(this.pickNumber(entry.ratingAvg, 0, 0)),
            revenue: this.toMoney(entry.revenue ?? 0),
            status: this.normalizeText(entry.status, 'active'),
            visibility: this.normalizeText(entry.visibility, 'published'),
            createdAt: entry.createdAt || now,
            updatedAt: entry.updatedAt || now,
            restockedAt: this.normalizeText(entry.restockedAt),
            lastStockChangeAt: this.normalizeText(entry.lastStockChangeAt),
        };
        this.applyRatings(normalized);
        if (!normalized.finalPrice) {
            normalized.finalPrice = normalized.priceUSD;
        }
        return normalized;
    }
    buildProductRecord(payload, options) {
        const existing = options.existing;
        const now = new Date().toISOString();
        const priceUSD = this.toMoney(this.pickNumber(payload.priceUSD, payload.price, existing?.priceUSD, existing?.price, 0));
        const qty = this.toSafeInteger(payload.qty ?? existing?.qty ?? 0);
        const min = this.toSafeInteger(payload.min ?? existing?.min ?? 0);
        const max = Math.max(this.toSafeInteger(payload.max ?? existing?.max ?? 0), qty, min, 1);
        const nextStoreInventory = this.resolveStoreInventory(payload.storeInventory, existing?.storeInventory, qty, this.normalizeText(payload.storeId, existing?.storeInventory?.[0]?.storeId, existing?.initialStoreInventory?.[0]?.storeId, 'default-store'));
        const previousStoreInventory = existing?.storeInventory || [];
        const initialStoreInventory = existing
            ? this.resolveInitialStoreInventory(existing.initialStoreInventory, previousStoreInventory, nextStoreInventory)
            : nextStoreInventory.map((entry) => ({ ...entry }));
        const explicitQty = typeof payload.qty === 'number';
        const nextInitialQty = existing
            ? Math.max(0, this.toSafeInteger(existing.initialQty) + (explicitQty ? qty - existing.qty : 0))
            : qty;
        const baseImageCandidates = this.normalizeImageList(payload.galleryImages || payload.images || existing?.galleryImages || existing?.images);
        const imageSet = this.buildImageSet(this.normalizeText(payload.productImg, existing?.productImg), baseImageCandidates, {
            name: this.normalizeText(payload.name, existing?.name || 'Product'),
            category: this.normalizeText(payload.category, existing?.category || 'General'),
            sku: options.sku,
            emoji: this.normalizeText(payload.emoji, existing?.emoji || String.fromCodePoint(0x1f4e6)),
        });
        const previousQty = existing?.qty ?? 0;
        const restockedAt = qty > previousQty
            ? now
            : existing?.restockedAt || (options.existing ? '' : now);
        const product = {
            id: options.id,
            retailerId: this.normalizeText(payload.retailerId, existing?.retailerId),
            sku: options.sku,
            name: this.normalizeText(payload.name, existing?.name || 'Product'),
            category: this.normalizeText(payload.category, existing?.category || 'General'),
            subcategory: this.normalizeText(payload.subcategory || payload.subCategory, existing?.subcategory || existing?.subCategory || existing?.category || 'General'),
            subCategory: this.normalizeText(payload.subcategory || payload.subCategory, existing?.subCategory || existing?.subcategory || existing?.category || 'General'),
            brand: this.normalizeText(payload.brand, existing?.brand || 'Generic'),
            priceUSD,
            price: priceUSD,
            cost: this.toOptionalMoney(payload.cost ?? existing?.cost),
            discountType: this.normalizeText(payload.discountType, existing?.discountType || 'none'),
            discountValue: this.toOptionalMoney(payload.discountValue ?? existing?.discountValue),
            finalPrice: this.resolveFinalPrice(priceUSD, payload, existing),
            taxRate: this.toOptionalMoney(payload.taxRate ?? existing?.taxRate),
            taxType: this.normalizeText(payload.taxType, existing?.taxType || 'Inclusive'),
            unit: this.normalizeText(payload.unit, existing?.unit || 'Pc'),
            qty,
            initialQty: nextInitialQty,
            min,
            max,
            creator: this.normalizeText(payload.creator, existing?.creator || 'Retail Manager'),
            creatorImg: this.normalizeText(payload.creatorImg, existing?.creatorImg || this.buildAvatarSvg(this.normalizeText(payload.creator, existing?.creator || 'Retail Manager'))),
            productImg: imageSet[0],
            galleryImages: imageSet.slice(0, 3),
            images: imageSet,
            emoji: this.normalizeText(payload.emoji, existing?.emoji || String.fromCodePoint(0x1f4e6)),
            soldThisMonth: this.toSafeInteger(payload.soldThisMonth ?? existing?.soldThisMonth ?? 0),
            trend: this.normalizeText(payload.trend, existing?.trend || 'up'),
            description: this.normalizeText(payload.description, existing?.description),
            descriptionHtml: this.normalizeText(payload.descriptionHtml, existing?.descriptionHtml),
            supplier: this.normalizeText(payload.supplier, existing?.supplier || existing?.brand || 'StockOverflow Supply'),
            supplierSku: this.normalizeText(payload.supplierSku, existing?.supplierSku),
            barcode: this.normalizeText(payload.barcode, existing?.barcode),
            warehouse: this.normalizeText(payload.warehouse, existing?.warehouse),
            bin: this.normalizeText(payload.bin, existing?.bin),
            reorderPoint: this.toSafeInteger(payload.reorderPoint ?? existing?.reorderPoint ?? min),
            reorderQty: this.toSafeInteger(payload.reorderQty ?? existing?.reorderQty ?? Math.max(1, min)),
            hasVariants: payload.hasVariants ??
                Boolean((Array.isArray(payload.variants) && payload.variants.length) ||
                    (existing?.variants || []).length),
            variants: Array.isArray(payload.variants)
                ? payload.variants.map((item) => ({ ...item }))
                : existing?.variants || [],
            hasExpiry: payload.hasExpiry ??
                Boolean(payload.expiryDate || payload.batchNumber || existing?.hasExpiry),
            expiryDate: this.normalizeText(payload.expiryDate, existing?.expiryDate),
            batchNumber: this.normalizeText(payload.batchNumber, existing?.batchNumber),
            weightKg: this.toOptionalMoney(payload.weightKg ?? existing?.weightKg),
            lengthCm: this.toOptionalMoney(payload.lengthCm ?? existing?.lengthCm),
            widthCm: this.toOptionalMoney(payload.widthCm ?? existing?.widthCm),
            heightCm: this.toOptionalMoney(payload.heightCm ?? existing?.heightCm),
            shippingClass: this.normalizeText(payload.shippingClass, existing?.shippingClass || 'Standard'),
            customFields: Array.isArray(payload.customFields)
                ? payload.customFields.map((item) => ({ ...item }))
                : existing?.customFields || [],
            tags: Array.isArray(payload.tags)
                ? payload.tags.map((item) => this.normalizeText(item)).filter(Boolean)
                : existing?.tags || [],
            highlights: Array.isArray(payload.highlights)
                ? payload.highlights.map((item) => this.normalizeText(item)).filter(Boolean)
                : existing?.highlights || [],
            specs: this.normalizeSpecs(payload.specs, existing?.specs),
            palette: Array.isArray(payload.palette)
                ? payload.palette.map((item) => this.normalizeText(item)).filter(Boolean)
                : existing?.palette || [],
            storeInventory: nextStoreInventory,
            initialStoreInventory,
            feedback: existing?.feedback || [],
            ratingBreakdown: existing?.ratingBreakdown || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
            ratingCount: existing?.ratingCount || 0,
            ratingAvg: existing?.ratingAvg || 0,
            revenue: existing?.revenue || 0,
            status: this.normalizeText(payload.status, existing?.status || 'active'),
            visibility: this.normalizeText(payload.visibility, existing?.visibility || 'published'),
            createdAt: existing?.createdAt || now,
            updatedAt: now,
            restockedAt,
            lastStockChangeAt: explicitQty && qty !== previousQty ? now : existing?.lastStockChangeAt,
        };
        this.applyRatings(product);
        return product;
    }
    resolveStoreInventory(nextEntries, existingEntries, totalQty, defaultStoreId = 'default-store') {
        if (Array.isArray(nextEntries) && nextEntries.length) {
            return this.normalizeStoreInventory(nextEntries, totalQty, 0, defaultStoreId);
        }
        if (Array.isArray(existingEntries) && existingEntries.length) {
            const previousTotal = existingEntries.reduce((sum, entry) => sum + (entry.qty || 0), 0);
            if (previousTotal > 0) {
                let running = 0;
                return existingEntries.map((entry, index) => {
                    const qty = index === existingEntries.length - 1
                        ? Math.max(0, totalQty - running)
                        : Math.max(0, Math.floor((totalQty * Math.max(0, entry.qty || 0)) / previousTotal));
                    running += qty;
                    return {
                        storeId: entry.storeId,
                        qty,
                    };
                });
            }
        }
        return this.normalizeStoreInventory(undefined, totalQty, 0, defaultStoreId);
    }
    resolveInitialStoreInventory(initialEntries, currentEntries, nextEntries) {
        const base = Array.isArray(initialEntries) && initialEntries.length
            ? initialEntries.map((entry) => ({ ...entry }))
            : currentEntries.map((entry) => ({ ...entry }));
        return nextEntries.map((entry, index) => {
            const previousCurrent = currentEntries.find((item) => item.storeId === entry.storeId);
            const previousInitial = base.find((item) => item.storeId === entry.storeId);
            const delta = entry.qty - (previousCurrent?.qty || 0);
            return {
                storeId: entry.storeId || previousInitial?.storeId || `s${index + 1}`,
                qty: Math.max(0, (previousInitial?.qty || 0) + delta),
            };
        });
    }
    normalizeStoreInventory(entries, totalQty, seedIndex = 0, defaultStoreId = 'default-store') {
        const defaultStoreIds = [defaultStoreId || `store-${seedIndex + 1}`];
        const source = Array.isArray(entries) && entries.length
            ? entries
            : [{ storeId: defaultStoreIds[0], qty: totalQty }];
        const normalized = source.map((entry, index) => ({
            storeId: this.normalizeText(entry.storeId, defaultStoreIds[index] || `s${seedIndex + index + 1}`),
            qty: this.toSafeInteger(entry.qty),
        }));
        const currentTotal = normalized.reduce((sum, entry) => sum + entry.qty, 0);
        if (normalized.length && currentTotal !== totalQty) {
            normalized[normalized.length - 1] = {
                ...normalized[normalized.length - 1],
                qty: Math.max(0, normalized[normalized.length - 1].qty + (totalQty - currentTotal)),
            };
        }
        return normalized;
    }
    adjustStoreInventory(entries, qtyDelta, preferredStoreId) {
        const normalized = entries.map((entry) => ({ ...entry }));
        if (!normalized.length || qtyDelta === 0) {
            return normalized;
        }
        const preferredIndex = preferredStoreId
            ? normalized.findIndex((entry) => entry.storeId === preferredStoreId)
            : -1;
        const targetIndex = preferredIndex >= 0 ? preferredIndex : normalized.length - 1;
        normalized[targetIndex] = {
            ...normalized[targetIndex],
            qty: Math.max(0, normalized[targetIndex].qty + qtyDelta),
        };
        return normalized;
    }
    buildImageSet(primaryImage, galleryImages, fallback) {
        const collected = [];
        const seen = new Set();
        const push = (value) => {
            const normalized = this.normalizeText(value);
            if (!normalized || seen.has(normalized)) {
                return;
            }
            seen.add(normalized);
            collected.push(normalized);
        };
        push(primaryImage);
        galleryImages.forEach(push);
        while (collected.length < 3) {
            push(this.buildProductPlaceholder(fallback, collected.length));
            if (collected.length < 3 && collected.length === seen.size) {
                const duplicateSource = collected[collected.length - 1] || this.buildProductPlaceholder(fallback, collected.length);
                push(`${duplicateSource}#${collected.length}`);
            }
        }
        return collected.slice(0, 3).map((entry, index) => {
            return entry.includes('#') ? this.buildProductPlaceholder(fallback, index) : entry;
        });
    }
    normalizeImageList(values) {
        if (!Array.isArray(values)) {
            return [];
        }
        return values
            .map((value) => this.normalizeText(value))
            .filter(Boolean);
    }
    buildProductPlaceholder(fallback, variantIndex) {
        const colors = ['#dbeafe', '#fee2e2', '#dcfce7', '#fef3c7', '#ede9fe'];
        const background = colors[variantIndex % colors.length];
        const subtitle = variantIndex === 0
            ? `${fallback.category} • ${fallback.sku}`
            : `${fallback.category} • View ${variantIndex + 1}`;
        const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="960" height="720" viewBox="0 0 960 720">
        <rect width="960" height="720" rx="42" fill="${background}"/>
        <rect x="88" y="98" width="784" height="524" rx="34" fill="#ffffff" opacity="0.86"/>
        <circle cx="480" cy="280" r="142" fill="#ffffff" opacity="0.92"/>
        <text x="480" y="330" text-anchor="middle" font-size="138">${this.escapeXml(fallback.emoji || String.fromCodePoint(0x1f4e6))}</text>
        <text x="480" y="548" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="40" font-weight="700" fill="#0f172a">${this.escapeXml(fallback.name)}</text>
        <text x="480" y="596" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="24" fill="#475569">${this.escapeXml(subtitle)}</text>
      </svg>
    `;
        return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
    }
    buildAvatarSvg(name) {
        const initials = this.escapeXml(String(name || 'RM')
            .split(' ')
            .filter(Boolean)
            .map((part) => part[0])
            .join('')
            .slice(0, 2)
            .toUpperCase());
        const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 240 240">
        <rect width="240" height="240" rx="120" fill="#4f46e5"/>
        <text x="120" y="136" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="72" font-weight="700" fill="#ffffff">${initials}</text>
      </svg>
    `;
        return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
    }
    escapeXml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }
    normalizeRatingBreakdown(breakdown) {
        return {
            1: this.toSafeInteger(Number(breakdown?.[1]) || 0),
            2: this.toSafeInteger(Number(breakdown?.[2]) || 0),
            3: this.toSafeInteger(Number(breakdown?.[3]) || 0),
            4: this.toSafeInteger(Number(breakdown?.[4]) || 0),
            5: this.toSafeInteger(Number(breakdown?.[5]) || 0),
        };
    }
    applyRatings(product) {
        const breakdown = this.normalizeRatingBreakdown(product.ratingBreakdown);
        if (Array.isArray(product.feedback) && product.feedback.length) {
            breakdown[1] = 0;
            breakdown[2] = 0;
            breakdown[3] = 0;
            breakdown[4] = 0;
            breakdown[5] = 0;
            product.feedback.forEach((entry) => {
                const rating = Math.max(1, Math.min(5, Math.trunc(entry.rating || 0)));
                breakdown[rating] += 1;
            });
        }
        const ratingCount = breakdown[1] + breakdown[2] + breakdown[3] + breakdown[4] + breakdown[5];
        const weighted = breakdown[1] * 1 +
            breakdown[2] * 2 +
            breakdown[3] * 3 +
            breakdown[4] * 4 +
            breakdown[5] * 5;
        product.ratingBreakdown = breakdown;
        product.ratingCount = ratingCount;
        product.ratingAvg = ratingCount ? Number((weighted / ratingCount).toFixed(1)) : 0;
    }
    normalizeSpecs(value, fallback = {}) {
        if (!value || typeof value !== 'object' || Array.isArray(value)) {
            return { ...fallback };
        }
        return Object.entries(value).reduce((acc, [key, item]) => {
            const normalizedKey = this.normalizeText(key);
            const normalizedValue = this.normalizeText(item);
            if (normalizedKey && normalizedValue) {
                acc[normalizedKey] = normalizedValue;
            }
            return acc;
        }, {});
    }
    resolveFinalPrice(priceUSD, payload, existing) {
        if (typeof payload.finalPrice === 'number' && Number.isFinite(payload.finalPrice)) {
            return this.toMoney(Math.max(0, payload.finalPrice));
        }
        const discountType = this.normalizeText(payload.discountType, existing?.discountType || 'none').toLowerCase();
        const discountValue = this.toMoney(this.pickNumber(payload.discountValue, existing?.discountValue, 0));
        if (discountType === 'percent') {
            return this.toMoney(Math.max(0, priceUSD - (priceUSD * discountValue) / 100));
        }
        if (discountType === 'fixed') {
            return this.toMoney(Math.max(0, priceUSD - discountValue));
        }
        return priceUSD;
    }
    normalizeSku(value) {
        return this.normalizeText(value).toUpperCase();
    }
    ensureUniqueSku(products, sku, ignoreId, retailerId) {
        const exists = products.some((entry) => {
            return (entry.sku.toLowerCase() === sku.toLowerCase() &&
                this.matchesRetailerScope(entry.retailerId, retailerId) &&
                entry.id !== ignoreId);
        });
        if (exists) {
            throw new Error('A product with this SKU already exists');
        }
    }
    generateNextSku(products, retailerId) {
        const nextValue = products
            .filter((product) => this.matchesRetailerScope(product.retailerId, retailerId))
            .reduce((max, product) => {
            const match = /^PT(\d+)$/i.exec(product.sku);
            return match ? Math.max(max, Number.parseInt(match[1], 10)) : max;
        }, 0) + 1;
        return `PT${String(nextValue).padStart(3, '0')}`;
    }
    projectProductForStore(product, storeId) {
        const normalizedStoreId = this.normalizeText(storeId);
        if (!normalizedStoreId) {
            return product;
        }
        const currentStore = product.storeInventory.find((entry) => entry.storeId === normalizedStoreId) ||
            null;
        const initialStore = product.initialStoreInventory.find((entry) => entry.storeId === normalizedStoreId) || null;
        return {
            ...product,
            qty: currentStore ? this.toSafeInteger(currentStore.qty) : 0,
            initialQty: initialStore
                ? this.toSafeInteger(initialStore.qty)
                : this.toSafeInteger(currentStore?.qty || 0),
        };
    }
    matchesRetailerScope(candidateRetailerId, retailerId) {
        const normalizedCandidate = this.normalizeText(candidateRetailerId);
        const normalizedRetailerId = this.normalizeText(retailerId);
        if (!normalizedRetailerId) {
            return true;
        }
        return normalizedCandidate === normalizedRetailerId;
    }
    isSameRetailerScope(leftRetailerId, rightRetailerId) {
        return (this.normalizeText(leftRetailerId) === this.normalizeText(rightRetailerId));
    }
    resolveStoreId(storeName) {
        const normalized = String(storeName || '').trim().toLowerCase();
        if (normalized === 'east coast hub') {
            return 's3';
        }
        if (normalized === 'global hub') {
            return 's7';
        }
        return 's1';
    }
    normalizeText(...values) {
        for (const value of values) {
            if (typeof value === 'string' && value.trim()) {
                return value.trim();
            }
        }
        return '';
    }
    pickNumber(...values) {
        for (const value of values) {
            if (typeof value === 'number' && Number.isFinite(value)) {
                return value;
            }
        }
        return 0;
    }
    toSafeInteger(value) {
        return Math.max(0, Number.isFinite(value) ? Math.trunc(value) : 0);
    }
    toMoney(value) {
        return Number((Number.isFinite(value) ? value : 0).toFixed(2));
    }
    toOptionalMoney(value) {
        return typeof value === 'number' && Number.isFinite(value)
            ? this.toMoney(value)
            : undefined;
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [json_db_service_1.JsonDbService])
], ProductsService);
//# sourceMappingURL=products.service.js.map