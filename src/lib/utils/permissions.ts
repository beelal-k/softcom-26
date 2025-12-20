import { teamService } from '@/lib/services';
import { organizationService } from '../services';

export type Permission =
  | 'org:read'
  | 'org:write'
  | 'org:delete'
  | 'team:read'
  | 'team:write'
  | 'team:delete'
  | 'team:manage_members'
  | 'team:manage_permissions'
  | 'user:read'
  | 'user:write'
  | 'user:delete';

/**
 * Check if user has permission through their team memberships
 */
export async function hasPermission(
  userId: string,
  organizationId: string,
  permission: Permission
): Promise<boolean> {
  try {
    const teams = await teamService.getByUser(userId);

    const orgTeams = teams.filter(
      (team) => team.organizationId.toString() === organizationId
    );

    for (const team of orgTeams) {
      if (team.permissions.includes(permission)) {
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error('Permission check error:', error);
    return false;
  }
}

/**
 * Check if user is organization owner
 */
export async function isOrganizationOwner(
  userId: string,
  organizationId: string
): Promise<boolean> {
  try {
    const org = await organizationService.getById(organizationId.toString());
    if (!org) return false;

    return org.owner._id.toString() === userId;
  } catch (error) {
    console.error('Owner check error:', error);
    return false;
  }
}

/**
 * Check if user is team member
 */
export async function isTeamMember(
  userId: string,
  teamId: string
): Promise<boolean> {
  try {
    return await teamService.isMember(teamId, userId);
  } catch (error) {
    console.error('Member check error:', error);
    return false;
  }
}

/**
 * Get user role in team
 */
export async function getUserTeamRole(
  userId: string,
  teamId: string
): Promise<'member' | 'manager' | null> {
  try {
    const team = await teamService.getById(teamId);
    if (!team) return null;

    const member = team.members.find((m) => m.userId.toString() === userId);

    return member ? (member.role as 'member' | 'manager') : null;
  } catch (error) {
    console.error('Get role error:', error);
    return null;
  }
}

/**
 * Check if user can manage team (admin=org owner or manager=team admin)
 */
export async function canManageTeam(
  userId: string,
  teamId: string
): Promise<boolean> {
  try {
    const team = await teamService.getById(teamId);
    if (!team) return false;

    // organizationId can be populated (object with _id) or just an ObjectId
    const orgId = (team.organizationId as any)?._id
      ? (team.organizationId as any)._id.toString()
      : team.organizationId.toString();

    // Check if user is organization owner (admin role)
    const isOwner = await isOrganizationOwner(userId, orgId);
    if (isOwner) return true;

    // Check if user is team manager
    const role = await getUserTeamRole(userId, teamId);
    return role === 'manager';
  } catch (error) {
    console.error('Can manage team error:', error);
    return false;
  }
}

/**
 * Check permission based on role hierarchy
 * admin (org owner) > manager (team admin) > member (team member)
 */
export async function hasRolePermission(
  userId: string,
  organizationId: string,
  requiredRole: 'admin' | 'manager' | 'member'
): Promise<boolean> {
  try {
    // Check if user is org owner (admin)
    const isOwner = await isOrganizationOwner(userId, organizationId);
    if (isOwner) return true; // admin has all permissions

    // Get user's teams in this organization
    const teams = await teamService.getByUser(userId);
    const orgTeams = teams.filter(
      (team) => team.organizationId.toString() === organizationId
    );

    // Check if user has required role in any team
    for (const team of orgTeams) {
      const role = await getUserTeamRole(userId, team._id.toString());

      if (requiredRole === 'member' && role) {
        return true; // Any team member
      }

      if (requiredRole === 'manager' && role === 'manager') {
        return true; // Team manager
      }
    }

    return false;
  } catch (error) {
    console.error('Role permission check error:', error);
    return false;
  }
}

/**
 * Get user's highest role in organization
 * Returns 'admin' if org owner, 'manager' if team manager, 'member' if team member, null if not in org
 */
export async function getUserOrgRole(
  userId: string,
  organizationId: string
): Promise<'admin' | 'manager' | 'member' | null> {
  try {
    // Check if user is org owner (admin)
    const isOwner = await isOrganizationOwner(userId, organizationId);
    if (isOwner) return 'admin';

    // Get user's teams in this organization
    const teams = await teamService.getByUser(userId);
    const orgTeams = teams.filter(
      (team) => team.organizationId.toString() === organizationId
    );

    if (orgTeams.length === 0) return null;

    // Check for manager role
    for (const team of orgTeams) {
      const role = await getUserTeamRole(userId, team._id.toString());
      if (role === 'manager') return 'manager';
    }

    // User is at least a member
    return 'member';
  } catch (error) {
    console.error('Get org role error:', error);
    return null;
  }
}
