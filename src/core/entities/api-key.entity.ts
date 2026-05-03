import { Document, Types } from 'mongoose';

export interface IApiKey {
  name:        string;
  key:         string;
  is_active:   boolean;
  usage_limit: number;         // max allowed uses; -1 = unlimited
  usage_count: number;         // how many times used so far
  expires_at:  Date;           // key stops working after this date
  created_by:  Types.ObjectId;
}

export interface IApiKeyDocument extends IApiKey, Document {}
