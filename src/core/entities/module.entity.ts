import { Document } from 'mongoose';

export interface IModule {
  module_id:   string;  // slug key, e.g. "user_management"
  module_name: string;  // display name, e.g. "User Management"
  is_active:   boolean;
}

export interface IModuleDocument extends IModule, Document {}
