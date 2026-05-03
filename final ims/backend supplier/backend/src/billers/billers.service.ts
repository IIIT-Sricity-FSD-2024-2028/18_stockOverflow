import { Injectable, NotFoundException } from '@nestjs/common';
import { JsonCollectionService } from '../common/collection.service';
import { Biller } from '../common/database.types';
import { JsonDbService } from '../common/json-db.service';
import { CreateBillerDto } from './dto/create-biller.dto';
import { UpdateBillerDto } from './dto/update-biller.dto';
import { UsersService } from '../users/users.service';

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

  constructor(db: JsonDbService, private readonly usersService: UsersService) {
    super(db);
  }

  override findAll() {
    return this.findAllTyped();
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
  createRequest(requestData: any) {
    const requests = this.getRequests();
    const newRequest = {
      id: Date.now().toString(),
      ...requestData,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    requests.push(newRequest);
    this.db.saveCollection('biller_requests', requests);
    return newRequest;
  }

  getRequests() {
    return this.db.getCollection('biller_requests') || [];
  }

  approveRequest(id: string) {
    const requests = this.getRequests();
    const requestIndex = requests.findIndex(r => r.id === id);
    if (requestIndex === -1) {
      throw new NotFoundException('Biller request not found');
    }

    const request = requests[requestIndex];
    request.status = 'approved';
    request.approvedAt = new Date().toISOString();

    // Create biller record
    const biller = this.create({
      name: request.name,
      company: request.company,
      email: request.email,
      phone: request.phone,
      country: request.country,
      status: 'active'
    });

    // Create user account
    this.usersService.create({
      name: request.name,
      email: request.email,
      password: 'temp123', // Temporary password, should be changed
      role: 'biller',
      store: 'Biller Store' // Default store for billers
    });

    this.db.saveCollection('biller_requests', requests);
    return { request, biller };
  }

  rejectRequest(id: string) {
    const requests = this.getRequests();
    const requestIndex = requests.findIndex(r => r.id === id);
    if (requestIndex === -1) {
      throw new NotFoundException('Biller request not found');
    }

    const request = requests[requestIndex];
    request.status = 'rejected';
    request.rejectedAt = new Date().toISOString();

    this.db.saveCollection('biller_requests', requests);
    return request;
  }
}
