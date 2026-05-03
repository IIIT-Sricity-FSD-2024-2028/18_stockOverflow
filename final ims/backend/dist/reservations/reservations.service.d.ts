import { ReservationRecord, ReservationRequestRecord } from '../common/database.types';
import { JsonDbService } from '../common/json-db.service';
import { ProductsService } from '../products/products.service';
import { CreateReservationRequestDto } from './dto/create-reservation-request.dto';
import { UpdateReservationRequestDto } from './dto/update-reservation-request.dto';
export declare class ReservationsService {
    private readonly db;
    private readonly productsService;
    constructor(db: JsonDbService, productsService: ProductsService);
    findAll(storeId?: string): ReservationRecord[];
    findRequests(status?: string): ReservationRequestRecord[];
    findRequest(requestId: string): ReservationRequestRecord;
    createRequest(createReservationRequestDto: CreateReservationRequestDto): {
        request: ReservationRequestRecord;
        reservation: ReservationRecord;
    };
    updateRequest(requestId: string, updateReservationRequestDto: UpdateReservationRequestDto): ReservationRequestRecord;
    completeRequests(requestIds: string[], orderId: string): ReservationRequestRecord[];
    private resolveStoreName;
    private normalizeText;
}
