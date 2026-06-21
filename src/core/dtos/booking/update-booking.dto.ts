import Joi from 'joi';
import { BookingVia, BookingStatus, PaymentMethod, PaymentStatus } from '../../entities/booking.entity';

export interface UpdateBookingDto {
  branch?:                        string;
  user_name?:                     string;
  user_id?:                       string;
  user_phone?:                    string;
  address?:                       string;
  live_location_url?:             string;
  house_helper_name?:             string;
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
  branch:                         Joi.string().allow('', null),
  user_name:                      Joi.string().allow('', null),
  user_id:                        Joi.string().allow('', null),
  user_phone:                     Joi.string().allow('', null),
  address:                        Joi.string().allow('', null),
  live_location_url:              Joi.string().uri().allow('', null),
  house_helper_name:              Joi.string().allow('', null),
  booking_via:                    Joi.string().valid(...Object.values(BookingVia)).allow('', null),
  booking_status:                 Joi.string().valid(...Object.values(BookingStatus)).allow('', null),
  booking_created_date_and_time:  Joi.date().iso().allow('', null),
  cancellation_reason:            Joi.string().allow('', null),
  package_name:                   Joi.string().allow('', null),
  payment_method:                 Joi.string().valid(...Object.values(PaymentMethod)).allow('', null),
  payment_amount:                 Joi.number().min(0).allow(null),
  payment_status:                 Joi.string().valid(...Object.values(PaymentStatus)).allow('', null),
  is_active:                      Joi.boolean().allow(null),
}).min(1);
