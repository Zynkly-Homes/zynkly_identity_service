import { Schema, model } from 'mongoose';
import { IModuleDocument } from '../../../core/entities/module.entity';

const moduleSchema = new Schema<IModuleDocument>(
  {
    module_id:   { type: String, required: [true, 'module_id is required'], unique: true, trim: true, lowercase: true },
    module_name: { type: String, required: [true, 'module_name is required'], trim: true },
    is_active:   { type: Boolean, default: true },
  },
  { timestamps: true, versionKey: false }
);

export const Module = model<IModuleDocument>('Module', moduleSchema);
