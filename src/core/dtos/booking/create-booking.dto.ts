import Joi from 'joi';
import { BookingVia, PaymentMethod, PaymentStatus } from '../../entities/booking.entity';

export interface CreateBookingDto {
  branch?:                        string;
  user_name?:                     string;
  user_id?:                       string;
  user_phone?:                    string;
  address?:                       string;
  live_location_url?:             string;
  house_helper_name?:             string;
  booking_via?:                   BookingVia;
  booking_created_date_and_time?: Date;
  package_name?:                  string;
  payment_method?:                PaymentMethod;
  payment_amount?:                number;
  payment_status?:                PaymentStatus;
}

export const createBookingSchema = Joi.object<CreateBookingDto>({
  branch:                         Joi.string().optional(),
  user_name:                      Joi.string().optional(),
  user_id:                        Joi.string().optional(),
  user_phone:                     Joi.string().optional(),
  address:                        Joi.string().optional(),
  live_location_url:              Joi.string().uri().optional(),
  house_helper_name:              Joi.string().optional(),
  booking_via:                    Joi.string().valid(...Object.values(BookingVia)).optional(),
  booking_created_date_and_time:  Joi.date().iso().optional(),
  package_name:                   Joi.string().optional(),
  payment_method:                 Joi.string().valid(...Object.values(PaymentMethod)).optional(),
  payment_amount:                 Joi.number().min(0).optional(),
  payment_status:                 Joi.string().valid(...Object.values(PaymentStatus)).optional(),
});
