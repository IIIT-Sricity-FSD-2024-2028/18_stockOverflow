import { Test, TestingModule } from '@nestjs/testing';
import { CreateSupplierSetupDto } from './dto/create-supplier-setup.dto';
import { BusinessType, Currency } from './dto/supplier.enums';
import { SupplierRecord } from './supplier-record.interface';
import { SuppliersController } from './suppliers.controller';
import { SuppliersService } from './suppliers.service';

describe('SuppliersController', () => {
  let controller: SuppliersController;
  let service: {
    create: jest.Mock;
    findAll: jest.Mock;
    getDirectory: jest.Mock;
    findLatest: jest.Mock;
    findByBusinessEmail: jest.Mock;
    findOne: jest.Mock;
    update: jest.Mock;
    remove: jest.Mock;
  };

  const createSupplierSetupDto: CreateSupplierSetupDto = {
    business: {
      companyName: 'Acme Supply',
      businessType: BusinessType.Distributor,
      businessEmail: 'ops@acme.test',
      currency: Currency.INR,
    },
    primaryContact: {
      fullName: 'Alex Supplier',
      directEmail: 'alex@acme.test',
    },
    retailers: [],
    products: [],
    profileStatus: 'active',
  };

  const supplierRecord: SupplierRecord = {
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

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SuppliersController],
      providers: [
        {
          provide: SuppliersService,
          useValue: service,
        },
      ],
    }).compile();

    controller = module.get<SuppliersController>(SuppliersController);
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
    expect(controller.findByBusinessEmail('ops@acme.test')).toEqual(
      supplierRecord,
    );
    expect(controller.findOne('sup-001')).toEqual(supplierRecord);
  });

  it('updates and removes supplier records through the service', () => {
    const updatedRecord: SupplierRecord = {
      ...supplierRecord,
      business: {
        ...supplierRecord.business,
        companyName: 'Acme Supply Updated',
      },
      updatedAt: '2026-05-03T01:00:00.000Z',
    };

    service.update.mockReturnValue(updatedRecord);

    expect(
      controller.update('sup-001', {
        business: {
          ...supplierRecord.business,
          companyName: 'Acme Supply Updated',
        },
      }),
    ).toEqual(updatedRecord);
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
