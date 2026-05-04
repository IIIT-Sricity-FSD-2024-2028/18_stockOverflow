"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const supplier_enums_1 = require("./dto/supplier.enums");
const suppliers_controller_1 = require("./suppliers.controller");
const suppliers_service_1 = require("./suppliers.service");
describe('SuppliersController', () => {
    let controller;
    let service;
    const createSupplierSetupDto = {
        business: {
            companyName: 'Acme Supply',
            businessType: supplier_enums_1.BusinessType.Distributor,
            businessEmail: 'ops@acme.test',
            currency: supplier_enums_1.Currency.INR,
        },
        primaryContact: {
            fullName: 'Alex Supplier',
            directEmail: 'alex@acme.test',
        },
        retailers: [],
        products: [],
        profileStatus: 'active',
    };
    const supplierRecord = {
        ...createSupplierSetupDto,
        id: 'sup-001',
        status: 'completed',
        createdAt: '2026-05-03T00:00:00.000Z',
        updatedAt: '2026-05-03T00:00:00.000Z',
    };
    beforeEach(async () => {
        service = {
            create: jest.fn(),
            findAll: jest.fn(),
            getDirectory: jest.fn(),
            findLatest: jest.fn(),
            findByBusinessEmail: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
        };
        const module = await testing_1.Test.createTestingModule({
            controllers: [suppliers_controller_1.SuppliersController],
            providers: [
                {
                    provide: suppliers_service_1.SuppliersService,
                    useValue: service,
                },
            ],
        }).compile();
        controller = module.get(suppliers_controller_1.SuppliersController);
    });
    it('creates and returns a supplier setup record', () => {
        service.create.mockReturnValue(supplierRecord);
        expect(controller.create(createSupplierSetupDto)).toEqual(supplierRecord);
        expect(service.create).toHaveBeenCalledWith(createSupplierSetupDto);
    });
    it('returns supplier listings and lookup results', () => {
        const directoryEntry = {
            id: supplierRecord.id,
            companyName: supplierRecord.business.companyName,
            businessType: supplierRecord.business.businessType,
            businessEmail: supplierRecord.business.businessEmail,
            productCount: 0,
            createdAt: supplierRecord.createdAt,
            updatedAt: supplierRecord.updatedAt,
        };
        service.findAll.mockReturnValue([supplierRecord]);
        service.getDirectory.mockReturnValue([directoryEntry]);
        service.findLatest.mockReturnValue(supplierRecord);
        service.findByBusinessEmail.mockReturnValue(supplierRecord);
        service.findOne.mockReturnValue(supplierRecord);
        expect(controller.findAll()).toEqual([supplierRecord]);
        expect(controller.getDirectory()).toEqual([directoryEntry]);
        expect(controller.findLatest()).toEqual(supplierRecord);
        expect(controller.findByBusinessEmail('ops@acme.test')).toEqual(supplierRecord);
        expect(controller.findOne('sup-001')).toEqual(supplierRecord);
    });
    it('updates and removes supplier records through the service', () => {
        const updatedRecord = {
            ...supplierRecord,
            business: {
                ...supplierRecord.business,
                companyName: 'Acme Supply Updated',
            },
            updatedAt: '2026-05-03T01:00:00.000Z',
        };
        service.update.mockReturnValue(updatedRecord);
        expect(controller.update('sup-001', {
            business: {
                ...supplierRecord.business,
                companyName: 'Acme Supply Updated',
            },
        })).toEqual(updatedRecord);
        expect(service.update).toHaveBeenCalledWith('sup-001', {
            business: {
                ...supplierRecord.business,
                companyName: 'Acme Supply Updated',
            },
        });
        expect(controller.remove('sup-001')).toBeUndefined();
        expect(service.remove).toHaveBeenCalledWith('sup-001');
    });
});
//# sourceMappingURL=suppliers.controller.spec.js.map