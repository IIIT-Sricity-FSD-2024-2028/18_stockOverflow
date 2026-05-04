import { DatabaseCollectionKey, DatabaseSchema, Product } from './database.types';
import { JsonDbService } from './json-db.service';
export declare abstract class JsonCollectionService<T extends {
    id: string | number;
}, TCollectionKey extends DatabaseCollectionKey = DatabaseCollectionKey> {
    protected readonly db: JsonDbService;
    protected abstract readonly collectionKey: TCollectionKey;
    protected abstract readonly entityName: string;
    constructor(db: JsonDbService);
    findAll(): DatabaseSchema[TCollectionKey];
    findOne(id: string | number): T;
    remove(id: string | number): {
        message: string;
        item: T;
    };
    protected findAllTyped(): T[];
    protected write(items: T[]): T[];
    protected nextNumericId(): number;
    protected nextCode(prefix: string, width?: number, property?: string): string;
    protected newUuid(): `${string}-${string}-${string}-${string}-${string}`;
    protected timestamp(): string;
    protected formatDateLabel(date?: Date): string;
    protected dateNumber(date: Date): number;
    protected ensureUniqueStringValue(currentId: string | number | null, property: keyof T, value: string, message: string): void;
    protected nextProductSku(products: Product[]): string;
}
