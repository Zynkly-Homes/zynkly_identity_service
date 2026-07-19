import Joi from 'joi';
import { PaymentStatus, PaymentMethod } from '../../entities/booking.entity';

export interface CreatePaymentDto {
  amount_paid:    number;
  date:           Date;
  description:    string;
  status:         PaymentStatus;
  payment_method: PaymentMethod;
}

export interface CreateCleanerBookingDto {
  cleaner_id?:     string;
  cleaner_name?:   string;
  joined_at?:      Date;
  address?:        string;
  mobile_number?:  string;
  payments?:       CreatePaymentDto[];
  is_active?:      boolean;
}

// All five keys are mandatory whenever a payment entry is supplied — no other keys are accepted.
const paymentSchema = Joi.object<CreatePaymentDto>({
  amount_paid:    Joi.number().min(0).required(),
  date:           Joi.date().iso().required(),
  description:    Joi.string().allow('').required(),
  status:         Joi.string().valid(...Object.values(PaymentStatus)).required(),
  payment_method: Joi.string().valid(...Object.values(PaymentMethod)).required(),
});

export const createCleanerBookingSchema = Joi.object<CreateCleanerBookingDto>({
  cleaner_id:    Joi.string().allow('', null).optional(),
  cleaner_name:  Joi.string().allow('', null).optional(),
  joined_at:     Joi.date().iso().allow('', null).optional(),
  address:       Joi.string().allow('', null).optional(),
  mobile_number: Joi.string().allow('', null).optional(),
  payments:      Joi.array().items(paymentSchema).optional(),
  is_active:     Joi.boolean().allow(null).optional(),
});
