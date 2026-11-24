import { OnModuleInit } from '@nestjs/common';
import { ReservationRecord, ReservationRequestRecord } from '../common/database.types';
import { JsonDbService } from '../common/json-db.service';
import { ProductsService } from '../products/products.service';
import { CreateReservationRequestDto } from './dto/create-reservation-request.dto';
import { UpdateReservationRequestDto } from './dto/update-reservation-request.dto';
export declare class ReservationsService implements OnModuleInit {
    private readonly db;
    private readonly productsService;
    static readonly HOLD_DURATION_MS: number;
    constructor(db: JsonDbService, productsService: ProductsService);
    onModuleInit(): void;
    purgeExpiredReservations(): {
        expiredCount: number;
    };
    findAll(storeId?: string): ReservationRecord[];
    findRequests(status?: string, customerLookup?: string, storeId?: string): ReservationRequestRecord[];
    findRequest(requestId: string): ReservationRequestRecord;
    createRequest(createReservationRequestDto: CreateReservationRequestDto): {
        request: ReservationRequestRecord;
        reservation: ReservationRecord;
    };
    updateRequest(requestId: string, updateReservationRequestDto: UpdateReservationRequestDto): ReservationRequestRecord;
    cancelRequest(requestId: string, reason?: string, cancelledBy?: string): ReservationRequestRecord;
    completeRequests(requestIds: string[], orderId: string): ReservationRequestRecord[];
    private matchesStore;
    private resolveStoreName;
    private normalizeText;
    private matchesCustomer;
}
