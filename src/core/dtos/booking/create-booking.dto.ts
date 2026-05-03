import Joi from 'joi';
import { BookingVia } from '../../entities/booking.entity';

export interface CreateBookingDto {
  branch:             string;
  user_name:          string;
  user_id:            string;
  user_phone:         string;
  address:            string;
  live_location_url?: string;
  booking_via:        BookingVia;
}

export const createBookingSchema = Joi.object<CreateBookingDto>({
  branch:             Joi.string().required(),
  user_name:          Joi.string().required(),
  user_id:            Joi.string().required(),
  user_phone:         Joi.string().required(),
  address:            Joi.string().required(),
  live_location_url:  Joi.string().uri().optional(),
  booking_via:        Joi.string().valid(...Object.values(BookingVia)).required(),
});
