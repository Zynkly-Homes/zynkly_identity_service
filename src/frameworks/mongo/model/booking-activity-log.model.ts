import mongoose, { Schema } from 'mongoose';
import { IBookingActivityLogDocument, ActivityHitBy } from '../../../core/entities/booking-activity-log.entity';

const BookingActivityLogSchema = new Schema<IBookingActivityLogDocument>({
  method:           { type: String, required: true, index: true },
  endpoint:         { type: String, required: true },
  booking_id:       { type: String, index: true },
  status_code:      { type: Number, required: true, index: true },
  response_time_ms: { type: Number, required: true },
  user_id:          { type: String, index: true },
  hit_by:           { type: String, enum: Object.values(ActivityHitBy), required: true },
  ip:               { type: String },
}, { timestamps: true });

export const BookingActivityLog = mongoose.model<IBookingActivityLogDocument>('BookingActivityLog', BookingActivityLogSchema);
