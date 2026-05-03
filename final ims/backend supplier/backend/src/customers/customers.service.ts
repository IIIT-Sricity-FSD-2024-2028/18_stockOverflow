import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { CustomerRecord } from '../common/database.types';
import { JsonDbService } from '../common/json-db.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
  constructor(private readonly db: JsonDbService) {}

  findAll() {
    return this.getCustomers().map((customer) => this.normalizeCustomer(customer));
  }

  findOne(id: string) {
    const customer = this.findAll().find((entry) => String(entry.id) === String(id));
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }
    return customer;
  }

  create(createCustomerDto: CreateCustomerDto) {
    const customers = this.getCustomers();
    const email = this.normalizeText(createCustomerDto.email);

    if (
      email &&
      customers.some((entry) => this.normalizeText(entry.email).toLowerCase() === email.toLowerCase())
    ) {
      throw new ConflictException('A customer with this email already exists');
    }

    const normalized = this.buildCustomerRecord(createCustomerDto, {
      id: `cust-${randomUUID()}`,
      existing: undefined,
    });

    customers.unshift(normalized);
    this.saveCustomers(customers);
    return normalized;
  }

  update(id: string, updateCustomerDto: UpdateCustomerDto) {
    const customers = this.getCustomers();
    const index = customers.findIndex((entry) => String(entry.id) === String(id));
    if (index === -1) {
      throw new NotFoundException('Customer not found');
    }

    const existing = this.normalizeCustomer(customers[index]);
    const nextEmail = this.normalizeText(updateCustomerDto.email, existing.email);

    if (
      nextEmail &&
      customers.some(
        (entry) =>
          String(entry.id) !== String(id) &&
          this.normalizeText(entry.email).toLowerCase() === nextEmail.toLowerCase(),
      )
    ) {
      throw new ConflictException('A customer with this email already exists');
    }

    const merged = this.buildCustomerRecord(updateCustomerDto, {
      id: existing.id,
      existing,
    });

    customers[index] = merged;
    this.saveCustomers(customers);
    return merged;
  }

  remove(id: string) {
    const customers = this.getCustomers();
    const index = customers.findIndex((entry) => String(entry.id) === String(id));
    if (index === -1) {
      throw new NotFoundException('Customer not found');
    }

    const [removed] = customers.splice(index, 1);
    this.saveCustomers(customers);
    return {
      message: 'Customer deleted successfully',
      item: this.normalizeCustomer(removed),
    };
  }

  registerPurchase(customerName: string, finalTotal: number) {
    const normalizedName = this.normalizeText(customerName);
    if (!normalizedName || normalizedName.toLowerCase() === 'walk-in customer') {
      return null;
    }

    const customers = this.getCustomers();
    const index = customers.findIndex((entry) => {
      return this.normalizeText(entry.name).toLowerCase() === normalizedName.toLowerCase();
    });

    if (index === -1) {
      const created = this.buildCustomerRecord(
        {
          name: normalizedName,
          email: `${normalizedName.toLowerCase().replace(/\s+/g, '.')}@stockoverflow.local`,
          status: 'Active',
          totalOrders: 1,
          totalSpent: finalTotal,
          orders: 1,
          spent: finalTotal,
        },
        { id: `cust-${randomUUID()}` },
      );

      customers.unshift(created);
      this.saveCustomers(customers);
      return created;
    }

    const existing = this.normalizeCustomer(customers[index]);
    const updated = {
      ...existing,
      totalOrders: (existing.totalOrders || 0) + 1,
      totalSpent: this.toMoney((existing.totalSpent || 0) + (finalTotal || 0)),
      orders: (existing.orders || 0) + 1,
      spent: this.toMoney((existing.spent || 0) + (finalTotal || 0)),
    };

    customers[index] = updated;
    this.saveCustomers(customers);
    return updated;
  }

  private getCustomers() {
    return this.db.getCollection('customers');
  }

  private saveCustomers(customers: CustomerRecord[]) {
    return this.db.saveCollection('customers', customers);
  }

  private buildCustomerRecord(
    payload: Partial<CreateCustomerDto>,
    options: { id: string | number; existing?: CustomerRecord },
  ): CustomerRecord {
    const existing = options.existing;
    const name = this.resolveName(payload, existing);
    const [fname, ...rest] = name.split(' ').filter(Boolean);
    const lname = rest.join(' ').trim();
    const totalOrders = this.toSafeInteger(
      payload.totalOrders ?? payload.orders ?? existing?.totalOrders ?? existing?.orders ?? 0,
    );
    const totalSpent = this.toMoney(
      payload.totalSpent ?? payload.spent ?? existing?.totalSpent ?? existing?.spent ?? 0,
    );

    return {
      id: options.id,
      name,
      fname: this.normalizeText(payload.fname, existing?.fname || fname || 'Customer'),
      lname: this.normalizeText(payload.lname, existing?.lname || lname),
      email: this.normalizeText(payload.email, existing?.email || `${Date.now()}@stockoverflow.local`),
      phone: this.normalizeText(payload.phone, existing?.phone),
      city: this.normalizeText(payload.city, existing?.city),
      country: this.normalizeText(payload.country, existing?.country || 'India'),
      store: this.normalizeText(payload.store, existing?.store || 'Downtown Store'),
      status: this.normalizeText(payload.status, existing?.status || 'Active'),
      totalOrders,
      totalSpent,
      orders: totalOrders,
      spent: totalSpent,
      created: this.normalizeText(payload.created, existing?.created || this.formatDateLabel()),
      rating: this.clampRating(payload.rating ?? existing?.rating ?? 3),
      notes: this.normalizeText(payload.notes, existing?.notes),
    };
  }

  private normalizeCustomer(customer: Partial<CustomerRecord>): CustomerRecord {
    return this.buildCustomerRecord(customer, {
      id: customer.id || `cust-${randomUUID()}`,
      existing: customer as CustomerRecord,
    });
  }

  private resolveName(payload: Partial<CreateCustomerDto>, existing?: CustomerRecord) {
    const explicitName = this.normalizeText(payload.name);
    if (explicitName) {
      return explicitName;
    }

    const fname = this.normalizeText(payload.fname, existing?.fname);
    const lname = this.normalizeText(payload.lname, existing?.lname);
    const combined = [fname, lname].filter(Boolean).join(' ').trim();
    return combined || this.normalizeText(existing?.name, 'Customer');
  }

  private normalizeText(value: unknown, fallback = '') {
    return typeof value === 'string' && value.trim() ? value.trim() : fallback;
  }

  private toSafeInteger(value: number) {
    return Math.max(0, Number.isFinite(value) ? Math.trunc(value) : 0);
  }

  private toMoney(value: number) {
    return Number((Number.isFinite(value) ? value : 0).toFixed(2));
  }

  private clampRating(value: number) {
    const rating = Number.isFinite(value) ? Math.trunc(value) : 3;
    return Math.max(1, Math.min(5, rating));
  }

  private formatDateLabel(date = new Date()) {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }
}
