import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JsonCollectionService } from '../common/collection.service';
import { Biller, BillerRequest } from '../common/database.types';
import { JsonDbService } from '../common/json-db.service';
import { ApproveBillerRequestDto } from './dto/approve-biller-request.dto';
import { CreateBillerDto } from './dto/create-biller.dto';
import { CreateBillerRequestDto } from './dto/create-biller-request.dto';
import { UpdateBillerDto } from './dto/update-biller.dto';
import { UsersService } from '../users/users.service';
import { StoresService } from '../stores/stores.service';

@Injectable()
export class BillersService extends JsonCollectionService<Biller, 'billers'> {
  protected readonly collectionKey = 'billers' as const;
  protected readonly entityName = 'Biller';

  private readonly avatarPalette = [
    '#4CAF50',
    '#2196F3',
    '#FF9800',
    '#E91E63',
    '#9C27B0',
    '#F44336',
    '#00BCD4',
    '#673AB7',
  ];

  constructor(
    db: JsonDbService,
    private readonly usersService: UsersService,
    private readonly storesService: StoresService,
  ) {
    super(db);
  }

  override findAll(retailerId?: string, storeId?: string) {
    return this.findAllTyped().filter((biller) =>
      this.matchesScope(biller, retailerId, storeId),
    );
  }

  create(createBillerDto: CreateBillerDto) {
    this.ensureUniqueStringValue(
      null,
      'email',
      createBillerDto.email,
      'A biller with this email already exists',
    );

    const billers = this.findAllTyped();
    const biller: Biller = {
      id: this.nextNumericId(),
      retailerId: createBillerDto.retailerId,
      storeId: createBillerDto.storeId,
      code: this.nextCode('BI'),
      name: createBillerDto.name,
      company: createBillerDto.company,
      email: createBillerDto.email,
      phone: createBillerDto.phone,
      country: createBillerDto.country,
      status: createBillerDto.status ?? 'active',
      avatar:
        createBillerDto.avatar ||
        this.avatarPalette[billers.length % this.avatarPalette.length],
    };

    billers.unshift(biller);
    this.write(billers);

    return biller;
  }

  update(id: number, updateBillerDto: UpdateBillerDto) {
    const billers = this.findAllTyped();
    const index = billers.findIndex((biller) => biller.id === id);

    if (index === -1) {
      throw new NotFoundException('Biller not found');
    }

    const existing = billers[index];
    const nextEmail = updateBillerDto.email || existing.email;

    this.ensureUniqueStringValue(
      existing.id,
      'email',
      nextEmail,
      'A biller with this email already exists',
    );

    const updated: Biller = {
      ...existing,
      ...updateBillerDto,
      email: nextEmail,
    };

    billers[index] = updated;
    this.write(billers);

    return updated;
  }

  // Biller request methods
  createRequest(requestData: CreateBillerRequestDto) {
    const requests = this.getRequests();
    const scope = this.resolveRequestScope(requestData);
    const newRequest: BillerRequest = {
      id: Date.now().toString(),
      ...requestData,
      retailerId: scope.retailerId,
      storeId: scope.storeId,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    requests.push(newRequest);
    this.db.saveCollection('biller_requests', requests);
    return newRequest;
  }

  getRequests() {
    return this.db.getCollection('biller_requests') || [];
  }

  approveRequest(id: string, approvalScope?: ApproveBillerRequestDto) {
    const requests = this.getRequests();
    const requestIndex = requests.findIndex((r) => r.id === id);
    if (requestIndex === -1) {
      throw new NotFoundException('Biller request not found');
    }

    const request = requests[requestIndex] as BillerRequest;
    const scope = this.resolveRequestScope({
      ...request,
      retailerId: this.normalizeText(approvalScope?.retailerId, request.retailerId),
      storeId: this.normalizeText(approvalScope?.storeId, request.storeId),
    });
    const biller = this.upsertApprovedBiller(request, scope);
    this.ensureBillerUserExists(request);

    request.retailerId = scope.retailerId;
    if (scope.storeId) {
      request.storeId = scope.storeId;
    }
    request.status = 'approved';
    request.approvedAt = new Date().toISOString();

    this.db.saveCollection('biller_requests', requests);
    return { request, biller };
  }

  rejectRequest(id: string) {
    const requests = this.getRequests();
    const requestIndex = requests.findIndex((r) => r.id === id);
    if (requestIndex === -1) {
      throw new NotFoundException('Biller request not found');
    }

    const request = requests[requestIndex];
    request.status = 'rejected';
    request.rejectedAt = new Date().toISOString();

    this.db.saveCollection('biller_requests', requests);
    return request;
  }

  private matchesScope(
    biller: Partial<Biller>,
    retailerId?: string,
    storeId?: string,
  ) {
    const normalizedRetailerId = this.normalizeText(retailerId);
    const normalizedStoreId = this.normalizeText(storeId);

    if (
      normalizedRetailerId &&
      this.normalizeText(biller.retailerId) &&
      this.normalizeText(biller.retailerId) !== normalizedRetailerId
    ) {
      return false;
    }

    if (
      normalizedRetailerId &&
      !this.normalizeText(biller.retailerId) &&
      !this.normalizeText(biller.storeId)
    ) {
      return false;
    }

    if (
      normalizedStoreId &&
      this.normalizeText(biller.storeId) &&
      this.normalizeText(biller.storeId) !== normalizedStoreId
    ) {
      return false;
    }

    return true;
  }

  private upsertApprovedBiller(
    request: BillerRequest,
    scope: { retailerId: string; storeId: string },
  ) {
    const billers = this.findAllTyped();
    const normalizedEmail = this.normalizeEmail(request.email);
    const existingIndex = billers.findIndex((entry) => {
      return this.normalizeEmail(entry.email) === normalizedEmail;
    });

    if (existingIndex === -1) {
      return this.create({
        retailerId: scope.retailerId,
        storeId: scope.storeId,
        name: request.name,
        company: request.company,
        email: request.email,
        phone: request.phone,
        country: request.country,
        status: 'active',
      });
    }

    const existing = billers[existingIndex];
    const existingRetailerId = this.normalizeText(existing.retailerId);
    const existingStoreId = this.normalizeText(existing.storeId);

    if (
      scope.retailerId &&
      existingRetailerId &&
      existingRetailerId !== scope.retailerId
    ) {
      throw new ConflictException(
        'This biller email is already linked to another retailer.',
      );
    }

    if (scope.storeId && existingStoreId && existingStoreId !== scope.storeId) {
      throw new ConflictException(
        'This biller email is already linked to another store.',
      );
    }

    const updated: Biller = {
      ...existing,
      retailerId: this.normalizeText(existingRetailerId, scope.retailerId),
      storeId: this.normalizeText(existingStoreId, scope.storeId),
      name: this.normalizeText(request.name, existing.name),
      company: this.normalizeText(request.company, existing.company),
      phone: this.normalizeText(request.phone, existing.phone),
      country: this.normalizeText(request.country, existing.country),
      status: 'active',
    };

    billers[existingIndex] = updated;
    this.write(billers);
    return updated;
  }

  private ensureBillerUserExists(request: BillerRequest) {
    const existingUsers = this.usersService.findAll(undefined, request.email);

    if (!existingUsers.length) {
      this.usersService.create({
        name: request.name,
        email: request.email,
        password: 'temp123',
        role: 'biller',
        store: '',
      });
      return;
    }

    const existingUser = existingUsers[0];
    if (String(existingUser.role || '').toLowerCase() !== 'biller') {
      throw new ConflictException(
        'A non-biller user already exists with this email address.',
      );
    }
  }

  private resolveRequestScope(payload: Partial<BillerRequest>) {
    const requestedRetailerId = this.normalizeText(payload.retailerId);
    const requestedStoreId = this.normalizeText(payload.storeId);
    const stores = this.storesService.findAll();
    const directStore = stores.find((store) => {
      return this.normalizeText(store.id) === requestedStoreId;
    });

    if (directStore) {
      return {
        retailerId: this.normalizeText(
          directStore.retailerId,
          requestedRetailerId,
        ),
        storeId: this.normalizeText(directStore.id, requestedStoreId),
      };
    }

    if (!requestedStoreId && requestedRetailerId) {
      const legacyStore = stores.find((store) => {
        return this.normalizeText(store.id) === requestedRetailerId;
      });

      if (legacyStore) {
        return {
          retailerId: this.normalizeText(legacyStore.retailerId),
          storeId: this.normalizeText(legacyStore.id),
        };
      }
    }

    return {
      retailerId: requestedRetailerId,
      storeId: requestedStoreId,
    };
  }

  private normalizeText(...values: unknown[]) {
    for (const value of values) {
      if (typeof value === 'string' && value.trim()) {
        return value.trim();
      }
    }
    return '';
  }

  private normalizeEmail(value: unknown) {
    return this.normalizeText(value).toLowerCase();
  }
}
