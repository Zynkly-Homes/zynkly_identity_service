import { Document } from 'mongoose';

export enum BookingVia {
  APP             = 'app',
  WEBSITE         = 'website',
  LAPTOP          = 'laptop',
  WHATSAPP_TO_CRM = 'whatsapp_to_crm',
  CALL            = 'call',
}

export enum BookingStatus {
  ONGOING              = 'ongoing',
  COMPLETED            = 'completed',
  CANCELLED_VIA_USER   = 'cancelled_via_user',
  CANCELLED_BY_ADMIN   = 'cancelled_by_admin_crm',
}

export interface ICancellationLog {
  booking_status: string;
  cancelled_by:   string;
  cancelled_at:   Date;
}

export interface IBooking {
  reference_id:                  string;
  branch:                        string;
  user_name:                     string;
  user_id:                       string;
  user_phone:                    string;
  address:                       string;
  live_location_url?:            string;
  booking_via:                   BookingVia;
  booking_status:                BookingStatus;
  booking_created_date_and_time?: Date;
  cancellation_log:              ICancellationLog[];
  cancellation_reason?:          string;
  is_active:                     boolean;
}

export interface IBookingDocument extends IBooking, Document {}
