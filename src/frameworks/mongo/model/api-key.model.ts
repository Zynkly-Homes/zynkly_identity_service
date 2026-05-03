import { Schema, model } from 'mongoose';
import { IApiKeyDocument } from '../../../core/entities/api-key.entity';

const apiKeySchema = new Schema<IApiKeyDocument>(
  {
    name:        { type: String,  required: [true, 'name is required'], trim: true },
    key:         { type: String,  required: [true, 'key is required'], unique: true },
    is_active:   { type: Boolean, default: true },
    usage_limit: { type: Number,  required: [true, 'usage_limit is required'], default: -1 },
    usage_count: { type: Number,  default: 0 },
    expires_at:  { type: Date,    required: [true, 'expires_at is required'] },
    created_by:  { type: Schema.Types.ObjectId, ref: 'User', required: [true, 'created_by is required'] },
  },
  { timestamps: true, versionKey: false }
);

export const ApiKey = model<IApiKeyDocument>('ApiKey', apiKeySchema);
