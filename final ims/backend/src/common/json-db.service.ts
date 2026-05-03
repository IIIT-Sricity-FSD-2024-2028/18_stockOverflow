import { Injectable, OnModuleInit } from '@nestjs/common';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import {
  DatabaseCollectionKey,
  DatabaseSchema,
} from './database.types';
import { INITIAL_DB } from './seed-data';

@Injectable()
export class JsonDbService implements OnModuleInit {
  private readonly dbFilePath = resolve(process.cwd(), 'data', 'db.json');
  private db: DatabaseSchema = structuredClone(INITIAL_DB);

  onModuleInit() {
    this.ensureDatabaseFile();
    this.db = this.readFromDisk();
  }

  getCollection<K extends DatabaseCollectionKey>(key: K): DatabaseSchema[K] {
    return structuredClone(this.db[key]);
  }

  saveCollection<K extends DatabaseCollectionKey>(
    key: K,
    value: DatabaseSchema[K],
  ): DatabaseSchema[K] {
    this.db[key] = structuredClone(value);
    this.persist();
    return structuredClone(this.db[key]);
  }

  updateCollection<K extends DatabaseCollectionKey>(
    key: K,
    updater: (collection: DatabaseSchema[K]) => DatabaseSchema[K],
  ): DatabaseSchema[K] {
    const nextCollection = updater(this.getCollection(key));
    return this.saveCollection(key, nextCollection);
  }

  getSnapshot(): DatabaseSchema {
    return structuredClone(this.db);
  }

  private ensureDatabaseFile() {
    const folderPath = dirname(this.dbFilePath);
    if (!existsSync(folderPath)) {
      mkdirSync(folderPath, { recursive: true });
    }

    if (!existsSync(this.dbFilePath)) {
      writeFileSync(this.dbFilePath, JSON.stringify(INITIAL_DB, null, 2));
    }
  }

  private readFromDisk(): DatabaseSchema {
    try {
      const raw = readFileSync(this.dbFilePath, 'utf8');
      const parsed = JSON.parse(raw) as Partial<DatabaseSchema>;

      return {
        products: Array.isArray(parsed.products)
          ? parsed.products
          : structuredClone(INITIAL_DB.products),
        stores: Array.isArray(parsed.stores)
          ? parsed.stores
          : structuredClone(INITIAL_DB.stores),
        customers: Array.isArray(parsed.customers)
          ? parsed.customers
          : structuredClone(INITIAL_DB.customers),
        billers: Array.isArray(parsed.billers)
          ? parsed.billers
          : structuredClone(INITIAL_DB.billers),
        biller_requests: Array.isArray(parsed.biller_requests)
          ? parsed.biller_requests
          : structuredClone(INITIAL_DB.biller_requests),
        suppliers: Array.isArray(parsed.suppliers)
          ? parsed.suppliers
          : structuredClone(INITIAL_DB.suppliers),
        warehouses: Array.isArray(parsed.warehouses)
          ? parsed.warehouses
          : structuredClone(INITIAL_DB.warehouses),
        purchaseOrders: Array.isArray(parsed.purchaseOrders)
          ? parsed.purchaseOrders
          : structuredClone(INITIAL_DB.purchaseOrders),
        reservations: Array.isArray(parsed.reservations)
          ? parsed.reservations
          : [],
        reservationRequests: Array.isArray(parsed.reservationRequests)
          ? parsed.reservationRequests
          : [],
        transactions: Array.isArray(parsed.transactions)
          ? parsed.transactions
          : [],
        returns: Array.isArray(parsed.returns) ? parsed.returns : [],
        stockAdjustments: Array.isArray(parsed.stockAdjustments)
          ? parsed.stockAdjustments
          : structuredClone(INITIAL_DB.stockAdjustments),
      };
    } catch {
      return structuredClone(INITIAL_DB);
    }
  }

  private persist() {
    writeFileSync(this.dbFilePath, JSON.stringify(this.db, null, 2));
  }
}
