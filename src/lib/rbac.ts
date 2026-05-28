import { ROLE_PERMISSIONS, type Permission, type UserRole } from "./types";

/** Check if a role has a given permission */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  const perms = ROLE_PERMISSIONS[role] ?? [];
  return perms.includes(permission);
}

/** Check if a role has ALL of the listed permissions */
export function hasAllPermissions(role: UserRole, permissions: Permission[]): boolean {
  return permissions.every((p) => hasPermission(role, p));
}

/** Check if a role has ANY of the listed permissions */
export function hasAnyPermission(role: UserRole, permissions: Permission[]): boolean {
  return permissions.some((p) => hasPermission(role, p));
}

/** Returns true if the role is super_admin or admin */
export function isAdmin(role: UserRole): boolean {
  return role === "super_admin" || role === "admin";
}

export function isSuperAdmin(role: UserRole): boolean {
  return role === "super_admin";
}
