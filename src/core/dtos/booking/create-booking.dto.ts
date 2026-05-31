import Joi from 'joi';
import { BookingVia, PaymentMethod, PaymentStatus } from '../../entities/booking.entity';

export interface CreateBookingDto {
  branch:                         string;
  user_name:                      string;
  user_id:                        string;
  user_phone:                     string;
  address:                        string;
  live_location_url?:             string;
  booking_via:                    BookingVia;
  booking_created_date_and_time?: Date;
  package_name:                   string;
  payment_method:                 PaymentMethod;
  payment_amount:                 number;
  payment_status?:                PaymentStatus;
}

export const createBookingSchema = Joi.object<CreateBookingDto>({
  branch:                         Joi.string().required(),
  user_name:                      Joi.string().required(),
  user_id:                        Joi.string().required(),
  user_phone:                     Joi.string().required(),
  address:                        Joi.string().required(),
  live_location_url:              Joi.string().uri().optional(),
  booking_via:                    Joi.string().valid(...Object.values(BookingVia)).required(),
  booking_created_date_and_time:  Joi.date().iso().optional(),
  package_name:                   Joi.string().required(),
  payment_method:                 Joi.string().valid(...Object.values(PaymentMethod)).required(),
  payment_amount:                 Joi.number().min(0).required(),
  payment_status:                 Joi.string().valid(...Object.values(PaymentStatus)).optional(),
});
