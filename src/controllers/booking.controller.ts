import { Request, Response }                       from 'express';
import asyncHandler                                 from '../utils/async-handler.util';
import { sendSuccess, sendError }                   from '../utils/response.util';
import { MongoDataServices }                        from '../frameworks/mongo';
import { BookingUseCase }                           from '../use-cases/booking/booking.use-case';
import { createBookingSchema, updateBookingSchema } from '../core/dtos';

const dataServices  = new MongoDataServices();
const bookingUseCase = new BookingUseCase(dataServices);

export const getAllBookings = asyncHandler(async (req: Request, res: Response) => {
  const result = await bookingUseCase.getAllBookings(req.query as Record<string, string>);
  sendSuccess(res, 'Bookings fetched successfully', result);
});

export const getBookingById = asyncHandler(async (req: Request, res: Response) => {
  const result = await bookingUseCase.getBookingById(req.params['id']!);
  sendSuccess(res, 'Booking fetched successfully', result);
});

export const createBooking = asyncHandler(async (req: Request, res: Response) => {
  const { error, value } = createBookingSchema.validate(req.body, { abortEarly: false });
  if (error) return sendError(res, 'Validation failed', 400, error.details.map(d => d.message));

  const result = await bookingUseCase.createBooking(value);
  sendSuccess(res, 'Booking created successfully', result, 201);
});

export const updateBooking = asyncHandler(async (req: Request, res: Response) => {
  const { error, value } = updateBookingSchema.validate(req.body, { abortEarly: false });
  if (error) return sendError(res, 'Validation failed', 400, error.details.map(d => d.message));

  // isAdmin = true when the request passed API key validation (set by apiKeyMiddleware)
  const isAdmin = req.isApiKeyAuthenticated === true;
  const result  = await bookingUseCase.updateBooking(
    req.params['id']!,
    value,
    isAdmin,
    req.user!.user_id,
  );
  sendSuccess(res, 'Booking updated successfully', result);
});

export const deleteBooking = asyncHandler(async (req: Request, res: Response) => {
  await bookingUseCase.deleteBooking(req.params['id']!);
  sendSuccess(res, 'Booking deleted successfully', null);
});
