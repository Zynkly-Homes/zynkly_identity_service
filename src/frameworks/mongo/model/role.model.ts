import { Schema, model } from 'mongoose';
import { IRoleDocument } from '../../../core/entities/role.entity';

const moduleAccessSchema = new Schema(
  {
    module_id: { type: String, required: true, trim: true },
    create:    { type: Boolean, required: true },
    edit:      { type: Boolean, required: true },
    view:      { type: Boolean, required: true },
    delete:    { type: Boolean, required: true },
    transfer:  { type: Boolean, required: true },
    export:    { type: Boolean, required: true },
  },
  { _id: false }
);

const roleSchema = new Schema<IRoleDocument>(
  {
    role_name:   { type: String, required: [true, 'role_name is required'], unique: true, trim: true },
    role_access: { type: [moduleAccessSchema], required: true, default: [] },
    is_active:   { type: Boolean, default: true },
  },
  { timestamps: true, versionKey: false }
);

export const Role = model<IRoleDocument>('Role', roleSchema);
