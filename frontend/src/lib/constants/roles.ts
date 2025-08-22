// User roles
export const USER_ROLES = {
  ADMIN: 'admin',
  STAFF: 'staff',
  MANAGER: 'manager',
  VIEWER: 'viewer',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

// Role hierarchy (higher number = more permissions)
export const ROLE_HIERARCHY = {
  [USER_ROLES.VIEWER]: 1,
  [USER_ROLES.STAFF]: 2,
  [USER_ROLES.MANAGER]: 3,
  [USER_ROLES.ADMIN]: 4,
} as const;

// Role display names
export const ROLE_DISPLAY_NAMES = {
  [USER_ROLES.ADMIN]: 'Administrator',
  [USER_ROLES.MANAGER]: 'Manager',
  [USER_ROLES.STAFF]: 'Staff Member',
  [USER_ROLES.VIEWER]: 'Viewer',
} as const;

// Role descriptions
export const ROLE_DESCRIPTIONS = {
  [USER_ROLES.ADMIN]: 'Full system access with user management capabilities',
  [USER_ROLES.MANAGER]: 'Manage inventory, sales, customers and view reports',
  [USER_ROLES.STAFF]: 'Handle daily operations like sales and inventory updates',
  [USER_ROLES.VIEWER]: 'Read-only access to dashboard and reports',
} as const;
