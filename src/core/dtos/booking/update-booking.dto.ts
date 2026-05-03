import Joi from 'joi';
import { BookingVia, BookingStatus } from '../../entities/booking.entity';

export interface UpdateBookingDto {
  branch?:                        string;
  user_name?:                     string;
  user_id?:                       string;
  user_phone?:                    string;
  address?:                       string;
  live_location_url?:             string;
  booking_via?:                   BookingVia;
  booking_status?:                BookingStatus;
  booking_created_date_and_time?: Date;
  cancellation_reason?:           string;
  is_active?:                     boolean;
}

export const updateBookingSchema = Joi.object<UpdateBookingDto>({
  branch:                         Joi.string(),
  user_name:                      Joi.string(),
  user_id:                        Joi.string(),
  user_phone:                     Joi.string(),
  address:                        Joi.string(),
  live_location_url:              Joi.string().uri().allow(''),
  booking_via:                    Joi.string().valid(...Object.values(BookingVia)),
  booking_status:                 Joi.string().valid(...Object.values(BookingStatus)),
  booking_created_date_and_time:  Joi.date().iso(),
  cancellation_reason:            Joi.string(),
  is_active:                      Joi.boolean(),
}).min(1);
