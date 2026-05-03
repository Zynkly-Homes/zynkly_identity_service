import { Request, Response, NextFunction } from 'express';
import { Role }            from '../frameworks/mongo/model/role.model';
import { PermissionAction } from '../core/entities/role.entity';

/**
 * requirePermission — Layer 3 of the security chain (after authMiddleware + apiKeyMiddleware).
 *
 * HOW RBAC (Role-Based Access Control) WORKS HERE:
 *
 *  Each user has a role_id in their JWT payload (set at login).
 *  Each role has a role_access array that looks like:
 *    [
 *      { module_id: "user_management", create: true,  edit: true,  view: true,  delete: false, ... },
 *      { module_id: "marks_management", create: false, edit: false, view: true,  delete: false, ... },
 *    ]
 *
 *  This factory function returns an Express middleware for a specific
 *  (moduleId, action) pair. Example usage in routes:
 *    router.get('/',    requirePermission('user_management', 'view'),   getAllUsers);
 *    router.post('/',   requirePermission('user_management', 'create'), createUser);
 *    router.patch('/:id', requirePermission('user_management', 'edit'), updateUser);
 *    router.delete('/:id', requirePermission('user_management', 'delete'), deleteUser);
 *
 * PERMISSION CHECK FLOW (three gates):
 *
 *  Gate 1 — Role exists and is active
 *    - Fetch the role from DB using role_id from req.user (set by authMiddleware).
 *    - We always read from DB (not JWT) so permission changes take effect immediately.
 *    - If role not found or inactive → 403.
 *
 *  Gate 2 — Module is present in the role's access list
 *    - Look for an entry in role_access where module_id === moduleId.
 *    - If the module is not in the list → the role has NO access to this module at all → 403.
 *
 *  Gate 3 — The specific action is allowed
 *    - Check that access[action] === true.
 *    - If false → the role can see the module but cannot perform this specific action → 403.
 *
 *  On success → next() is called and the request proceeds to the controller.
 *
 * WHY DB LOOKUP INSTEAD OF JWT CLAIMS?
 *   Storing permissions in the JWT would make them stale — if an admin updates
 *   a role's permissions, existing tokens would still carry the old permissions
 *   until they expire. By reading from DB on every request we get real-time RBAC.
 *
 * @param moduleId  The slug of the module to check (e.g. 'user_management')
 * @param action    The action being attempted: 'create' | 'edit' | 'view' | 'delete' | 'transfer' | 'export'
 */
export function requirePermission(moduleId: string, action: PermissionAction) {

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {

    // role_id is embedded in the JWT payload by authMiddleware — should always be present
    const roleId = req.user?.role_id;

    if (!roleId) {
      // Defensive guard — should never reach here if authMiddleware ran first
      res.status(403).json({
        success: false,
        message: 'Forbidden: No role is assigned to this account.',
      });
      return;
    }

    // ── Gate 1: Fetch role from DB and check it is active ─────────────────
    // Always fetch fresh from DB so permission changes are instant.
    const role = await Role.findById(roleId);

    if (!role) {
      res.status(403).json({
        success: false,
        message: 'Forbidden: Your assigned role no longer exists. Please contact the administrator.',
      });
      return;
    }

    if (!role.is_active) {
      res.status(403).json({
        success: false,
        message: 'Forbidden: Your assigned role has been deactivated. Please contact the administrator.',
      });
      return;
    }

    // ── Gate 2: Check if this module is in the role's access list ──────────
    // role_access is an array; find the entry matching the requested module.
    const moduleAccess = role.role_access.find(entry => entry.module_id === moduleId);

    if (!moduleAccess) {
      res.status(403).json({
        success: false,
        message: `Forbidden: You do not have access to the '${moduleId}' module.`,
      });
      return;
    }

    // ── Gate 3: Check if the specific action is permitted ──────────────────
    // e.g. a "viewer" role may have view: true but create: false
    if (!moduleAccess[action]) {
      res.status(403).json({
        success: false,
        message: `Forbidden: You do not have '${action}' permission on the '${moduleId}' module.`,
      });
      return;
    }

    // All gates passed — allow the request through
    next();
  };
}
