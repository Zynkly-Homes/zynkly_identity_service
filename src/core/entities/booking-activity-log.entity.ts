import { Document } from 'mongoose';

export enum ActivityHitBy {
  JWT             = 'jwt',
  API_KEY         = 'api_key',
  JWT_AND_API_KEY = 'jwt+api_key',
  ANONYMOUS       = 'anonymous',
}

export interface IBookingActivityLog {
  method:            string;
  endpoint:          string;
  booking_id?:       string;
  status_code:       number;
  response_time_ms:  number;
  user_id?:          string;
  hit_by:            ActivityHitBy;
  ip?:               string;
}

export interface IBookingActivityLogDocument extends IBookingActivityLog, Document {}
