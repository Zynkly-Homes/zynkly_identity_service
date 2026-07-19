import mongoose, { Schema } from 'mongoose';
import { ICleanerBookingDocument } from '../../../core/entities/cleaner-booking.entity';
import { PaymentStatus, PaymentMethod } from '../../../core/entities/booking.entity';

const PaymentSchema = new Schema({
  amount_paid:    { type: Number, required: true, min: 0 },
  date:           { type: Date,   required: true },
  description:    { type: String, required: true },
  status:         { type: String, enum: Object.values(PaymentStatus), required: true },
  payment_method: { type: String, enum: Object.values(PaymentMethod), required: true },
}, { _id: false });

const CleanerBookingSchema = new Schema<ICleanerBookingDocument>({
  reference_id:  { type: String, unique: true, required: true, index: true },
  cleaner_id:    { type: String, index: true },
  cleaner_name:  { type: String },
  joined_at:     { type: Date },
  address:       { type: String },
  mobile_number: { type: String },
  payments:      { type: [PaymentSchema], default: [] },
  is_active:     { type: Boolean, default: true },
  is_delete:     { type: Boolean, default: false },
}, { timestamps: true });

export const CleanerBooking = mongoose.model<ICleanerBookingDocument>('CleanerBooking', CleanerBookingSchema);
