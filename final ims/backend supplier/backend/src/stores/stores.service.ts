import { Injectable } from '@nestjs/common';
import { JsonDbService } from '../common/json-db.service';

@Injectable()
export class StoresService {
  constructor(private readonly db: JsonDbService) {}

  findAll() {
    return this.db.getCollection('stores');
  }
}
