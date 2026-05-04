import { CreateReservationRequestDto } from './dto/create-reservation-request.dto';
import { UpdateReservationRequestDto } from './dto/update-reservation-request.dto';
import { ReservationsService } from './reservations.service';
export declare class ReservationsController {
    private readonly reservationsService;
    constructor(reservationsService: ReservationsService);
    findAll(storeId?: string): import("../common/database.types").ReservationRecord[];
    findRequests(status?: string, customer?: string): import("../common/database.types").ReservationRequestRecord[];
    findRequest(requestId: string): import("../common/database.types").ReservationRequestRecord;
    createRequest(createReservationRequestDto: CreateReservationRequestDto): {
        request: import("../common/database.types").ReservationRequestRecord;
        reservation: import("../common/database.types").ReservationRecord;
    };
    updateRequest(requestId: string, updateReservationRequestDto: UpdateReservationRequestDto): import("../common/database.types").ReservationRequestRecord;
}
