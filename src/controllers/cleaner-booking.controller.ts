import { Request, Response }                                     from 'express';
import asyncHandler                                               from '../utils/async-handler.util';
import { sendSuccess, sendError }                                 from '../utils/response.util';
import { MongoDataServices }                                      from '../frameworks/mongo';
import { CleanerBookingUseCase }                                  from '../use-cases/cleaner-booking/cleaner-booking.use-case';
import { createCleanerBookingSchema, updateCleanerBookingSchema } from '../core/dtos';

const dataServices        = new MongoDataServices();
const cleanerBookingUseCase = new CleanerBookingUseCase(dataServices);

export const getAllCleanerBookings = asyncHandler(async (req: Request, res: Response) => {
  const result = await cleanerBookingUseCase.getAllCleanerBookings(req.query as Record<string, string>);
  sendSuccess(res, 'Cleaner bookings fetched successfully', result);
});

export const getCleanerBookingById = asyncHandler(async (req: Request, res: Response) => {
  const result = await cleanerBookingUseCase.getCleanerBookingById(req.params['id']!);
  sendSuccess(res, 'Cleaner booking fetched successfully', result);
});

export const createCleanerBooking = asyncHandler(async (req: Request, res: Response) => {
  const { error, value } = createCleanerBookingSchema.validate(req.body, { abortEarly: false });
  if (error) return sendError(res, 'Validation failed', 400, error.details.map(d => d.message));

  const result = await cleanerBookingUseCase.createCleanerBooking(value);
  sendSuccess(res, 'Cleaner booking created successfully', result, 201);
});

export const updateCleanerBooking = asyncHandler(async (req: Request, res: Response) => {
  const { error, value } = updateCleanerBookingSchema.validate(req.body, { abortEarly: false });
  if (error) return sendError(res, 'Validation failed', 400, error.details.map(d => d.message));

  // isAdmin = true when the request passed API key validation (set by apiKeyMiddleware)
  const isAdmin = req.isApiKeyAuthenticated === true;
  const result  = await cleanerBookingUseCase.updateCleanerBooking(req.params['id']!, value, isAdmin);
  sendSuccess(res, 'Cleaner booking updated successfully', result);
});

export const deleteCleanerBooking = asyncHandler(async (req: Request, res: Response) => {
  await cleanerBookingUseCase.deleteCleanerBooking(req.params['id']!);
  sendSuccess(res, 'Cleaner booking deleted successfully', null);
});
