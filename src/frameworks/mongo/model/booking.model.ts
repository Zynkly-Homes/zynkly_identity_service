import mongoose, { Schema } from 'mongoose';
import { IBookingDocument, BookingVia, BookingStatus, PaymentMethod, PaymentStatus } from '../../../core/entities/booking.entity';

const CancellationLogSchema = new Schema({
  booking_status: { type: String, required: true },
  cancelled_by:   { type: String, required: true },
  cancelled_at:   { type: Date,   default: Date.now },
}, { _id: false });

const BookingSchema = new Schema<IBookingDocument>({
  reference_id:        { type: String, unique: true, required: true, index: true },
  branch:              { type: String, required: true },
  user_name:           { type: String, required: true },
  user_id:             { type: String, required: true },
  user_phone:          { type: String, required: true },
  address:             { type: String, required: true },
  live_location_url:            { type: String },
  booking_via:                  { type: String, enum: Object.values(BookingVia), required: true },
  booking_created_date_and_time: { type: Date },
  booking_status:      { type: String, enum: Object.values(BookingStatus), default: BookingStatus.ONGOING },
  cancellation_log:    { type: [CancellationLogSchema], default: [] },
  cancellation_reason: { type: String },
  package_name:        { type: String, required: true },
  payment_method:      { type: String, enum: Object.values(PaymentMethod), required: true },
  payment_amount:      { type: Number, required: true, min: 0 },
  payment_status:      { type: String, enum: Object.values(PaymentStatus), default: PaymentStatus.PENDING },
  is_active:           { type: Boolean, default: true },
}, { timestamps: true });

export const Booking = mongoose.model<IBookingDocument>('Booking', BookingSchema);
