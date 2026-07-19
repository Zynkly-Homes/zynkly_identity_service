import Joi from 'joi';
import { PaymentStatus, PaymentMethod } from '../../entities/booking.entity';

export interface NewPaymentDto {
  amount_paid:    number;
  date:           Date;
  description:    string;
  status:         PaymentStatus;
  payment_method: PaymentMethod;
}

export interface UpdateCleanerBookingDto {
  cleaner_id?:     string;
  cleaner_name?:   string;
  joined_at?:      Date;
  address?:        string;
  mobile_number?:  string;
  new_payment?:    NewPaymentDto;
  payments?:       NewPaymentDto[];
  is_active?:      boolean;
  is_delete?:      boolean;
}

// All five keys are mandatory whenever a payment entry is supplied — no other keys are accepted.
const newPaymentSchema = Joi.object<NewPaymentDto>({
  amount_paid:    Joi.number().min(0).required(),
  date:           Joi.date().iso().required(),
  description:    Joi.string().allow('').required(),
  status:         Joi.string().valid(...Object.values(PaymentStatus)).required(),
  payment_method: Joi.string().valid(...Object.values(PaymentMethod)).required(),
});

export const updateCleanerBookingSchema = Joi.object<UpdateCleanerBookingDto>({
  cleaner_id:    Joi.string().allow('', null),
  cleaner_name:  Joi.string().allow('', null),
  joined_at:     Joi.date().iso().allow('', null),
  address:       Joi.string().allow('', null),
  mobile_number: Joi.string().allow('', null),
  new_payment:   newPaymentSchema,
  // Append multiple payment entries in one call — same shape/requirements as new_payment.
  payments:      Joi.array().items(newPaymentSchema).min(1),
  is_active:     Joi.boolean().allow(null),
  is_delete:     Joi.boolean().allow(null),
}).min(1);
