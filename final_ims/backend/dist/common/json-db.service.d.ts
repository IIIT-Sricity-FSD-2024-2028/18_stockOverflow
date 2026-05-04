import { OnModuleInit } from '@nestjs/common';
import { DatabaseCollectionKey, DatabaseSchema } from './database.types';
export declare class JsonDbService implements OnModuleInit {
    private readonly dbFilePath;
    private db;
    onModuleInit(): void;
    getCollection<K extends DatabaseCollectionKey>(key: K): DatabaseSchema[K];
    saveCollection<K extends DatabaseCollectionKey>(key: K, value: DatabaseSchema[K]): DatabaseSchema[K];
    updateCollection<K extends DatabaseCollectionKey>(key: K, updater: (collection: DatabaseSchema[K]) => DatabaseSchema[K]): DatabaseSchema[K];
    getSnapshot(): DatabaseSchema;
    private ensureDatabaseFile;
    private readFromDisk;
    private persist;
}
