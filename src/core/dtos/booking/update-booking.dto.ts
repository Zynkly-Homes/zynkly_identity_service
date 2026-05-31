import Joi from 'joi';
import { BookingVia, BookingStatus, PaymentMethod, PaymentStatus } from '../../entities/booking.entity';

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
  package_name?:                  string;
  payment_method?:                PaymentMethod;
  payment_amount?:                number;
  payment_status?:                PaymentStatus;
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
  package_name:                   Joi.string(),
  payment_method:                 Joi.string().valid(...Object.values(PaymentMethod)),
  payment_amount:                 Joi.number().min(0),
  payment_status:                 Joi.string().valid(...Object.values(PaymentStatus)),
  is_active:                      Joi.boolean(),
}).min(1);
