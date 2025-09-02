import { WardenPermission } from "./warden-permission.ts";

export interface WardenRole {
  roleId: string;
  label: string;
  description?: string;
  permissions: WardenPermission[];
}
