import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import {
  DatabaseCollectionKey,
  DatabaseSchema,
  Product,
} from './database.types';
import { JsonDbService } from './json-db.service';

@Injectable()
export abstract class JsonCollectionService<
  T extends { id: string | number },
  TCollectionKey extends DatabaseCollectionKey = DatabaseCollectionKey,
> {
  protected abstract readonly collectionKey: TCollectionKey;
  protected abstract readonly entityName: string;

  constructor(protected readonly db: JsonDbService) {}

  findAll(): DatabaseSchema[TCollectionKey] {
    return this.db.getCollection(this.collectionKey);
  }

  findOne(id: string | number): T {
    const entity = this.findAllTyped().find(
      (item) => String(item.id) === String(id),
    );

    if (!entity) {
      throw new NotFoundException(`${this.entityName} not found`);
    }

    return entity;
  }

  remove(id: string | number) {
    const items = this.findAllTyped();
    const index = items.findIndex((item) => String(item.id) === String(id));

    if (index === -1) {
      throw new NotFoundException(`${this.entityName} not found`);
    }

    const [deleted] = items.splice(index, 1);
    this.write(items);

    return {
      message: `${this.entityName} deleted successfully`,
      item: deleted,
    };
  }

  protected findAllTyped(): T[] {
    return this.db.getCollection(this.collectionKey) as unknown as T[];
  }

  protected write(items: T[]): T[] {
    return this.db.saveCollection(this.collectionKey, items as never) as unknown as T[];
  }

  protected nextNumericId(): number {
    return (
      this.findAllTyped().reduce<number>((max, item) => {
        return typeof item.id === 'number' ? Math.max(max, item.id) : max;
      }, 0) + 1
    );
  }

  protected nextCode(prefix: string, width = 3, property = 'code'): string {
    const numericIds = this.findAllTyped()
      .map((item) => String((item as Record<string, unknown>)[property] ?? ''))
      .map((value) => {
        const match = new RegExp(`${prefix}-?(\\d+)$`, 'i').exec(value);
        return match ? Number.parseInt(match[1], 10) : 0;
      });

    const nextValue = (Math.max(0, ...numericIds) + 1).toString().padStart(
      width,
      '0',
    );

    return prefix.includes('-') ? `${prefix}${nextValue}` : `${prefix}${nextValue}`;
  }

  protected newUuid() {
    return randomUUID();
  }

  protected timestamp() {
    return new Date().toISOString();
  }

  protected formatDateLabel(date = new Date()) {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  protected dateNumber(date: Date) {
    return Number(
      date
        .toISOString()
        .slice(0, 10)
        .replaceAll('-', ''),
    );
  }

  protected ensureUniqueStringValue(
    currentId: string | number | null,
    property: keyof T,
    value: string,
    message: string,
  ) {
    const exists = this.findAllTyped().some((item) => {
      const propValue = item[property];
      return (
        String(item.id) !== String(currentId ?? '') &&
        typeof propValue === 'string' &&
        propValue.toLowerCase() === value.toLowerCase()
      );
    });

    if (exists) {
      throw new ConflictException(message);
    }
  }

  protected nextProductSku(products: Product[]) {
    const nextNumber =
      products.reduce((max, product) => {
        const match = /^PT(\d+)$/i.exec(product.sku);
        return match ? Math.max(max, Number.parseInt(match[1], 10)) : max;
      }, 0) + 1;

    return `PT${String(nextNumber).padStart(3, '0')}`;
  }
}
