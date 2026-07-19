import { Request, Response }   from 'express';
import asyncHandler            from '../utils/async-handler.util';
import { sendSuccess }         from '../utils/response.util';
import { MongoDataServices }   from '../frameworks/mongo';
import { BookingActivityLogUseCase } from '../use-cases/booking-activity-log/booking-activity-log.use-case';

const dataServices          = new MongoDataServices();
const bookingActivityLogUseCase = new BookingActivityLogUseCase(dataServices);

export const getAllBookingActivityLogs = asyncHandler(async (req: Request, res: Response) => {
  const result = await bookingActivityLogUseCase.getAllLogs(req.query as Record<string, string>);
  sendSuccess(res, 'Booking activity logs fetched successfully', result);
});
