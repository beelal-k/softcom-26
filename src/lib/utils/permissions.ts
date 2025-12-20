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
): Promise<string | null> {
  try {
    const team = await teamService.getById(teamId);
    if (!team) return null;

    const member = team.members.find((m) => m.userId.toString() === userId);

    return member ? member.role : null;
  } catch (error) {
    console.error('Get role error:', error);
    return null;
  }
}

/**
 * Check if user can manage team (owner or admin role)
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

    const isOwner = await isOrganizationOwner(userId, orgId);
    if (isOwner) return true;

    const role = await getUserTeamRole(userId, teamId);
    return role === 'admin' || role === 'owner';
  } catch (error) {
    console.error('Can manage team error:', error);
    return false;
  }
}
