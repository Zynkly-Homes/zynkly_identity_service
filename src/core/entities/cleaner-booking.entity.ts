import { Document }                     from 'mongoose';
import { PaymentStatus, PaymentMethod } from './booking.entity';

export interface IPayment {
  amount_paid:    number;
  date:           Date;
  description:    string;
  status:         PaymentStatus;
  payment_method: PaymentMethod;
}

export interface ICleanerBooking {
  reference_id:  string;
  cleaner_id:    string;
  cleaner_name:  string;
  joined_at:     Date;
  address:       string;
  mobile_number: string;
  payments:      IPayment[];
  is_active:     boolean;
  is_delete:     boolean;
}

export interface ICleanerBookingDocument extends ICleanerBooking, Document {}
