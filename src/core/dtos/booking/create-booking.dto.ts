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
  cleaner_id?:                    string;
  booking_via?:                   BookingVia;
  booking_created_date_and_time?: Date;
  package_name?:                  string;
  payment_method?:                PaymentMethod;
  payment_amount?:                number;
  payment_status?:                PaymentStatus;
}

export const createBookingSchema = Joi.object<CreateBookingDto>({
  branch:                         Joi.string().allow('', null).optional(),
  user_name:                      Joi.string().allow('', null).optional(),
  user_id:                        Joi.string().allow('', null).optional(),
  user_phone:                     Joi.string().allow('', null).optional(),
  address:                        Joi.string().allow('', null).optional(),
  live_location_url:              Joi.string().uri().allow('', null).optional(),
  house_helper_name:              Joi.string().allow('', null).optional(),
  cleaner_id:                     Joi.string().allow('', null).optional(),
  booking_via:                    Joi.string().valid(...Object.values(BookingVia)).allow('', null).optional(),
  booking_created_date_and_time:  Joi.date().iso().allow('', null).optional(),
  package_name:                   Joi.string().allow('', null).optional(),
  payment_method:                 Joi.string().valid(...Object.values(PaymentMethod)).allow('', null).optional(),
  payment_amount:                 Joi.number().min(0).allow(null).optional(),
  payment_status:                 Joi.string().valid(...Object.values(PaymentStatus)).allow('', null).optional(),
});
