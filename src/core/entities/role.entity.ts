import { Document } from 'mongoose';

/** Actions that can be controlled per module */
export type PermissionAction = 'create' | 'edit' | 'view' | 'delete' | 'transfer' | 'export';

/** Per-module permission block stored inside a role */
export interface IModuleAccess {
  module_id: string;    // references IModule.module_id
  create:    boolean;
  edit:      boolean;
  view:      boolean;
  delete:    boolean;
  transfer:  boolean;
  export:    boolean;
}

export interface IRole {
  role_name:   string;
  role_access: IModuleAccess[];
  is_active:   boolean;
}

export interface IRoleDocument extends IRole, Document {}
