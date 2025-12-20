import connectDB from '@/lib/db/mongodb';
import TeamModel, { ITeam, ITeamMember } from '@/lib/models/team';
import mongoose from 'mongoose';

// Valid team roles: member (team member), manager (team admin)
export const VALID_TEAM_ROLES = ['member', 'manager'] as const;
export type TeamRole = (typeof VALID_TEAM_ROLES)[number];

export const teamService = {
  /**
   * Create a new team
   */
  async create(data: {
    name: string;
    description: string;
    organizationId: string;
    permissions?: string[];
    createdBy: string;
  }): Promise<ITeam> {
    await connectDB();
    const team = await TeamModel.create({
      ...data,
      organizationId: new mongoose.Types.ObjectId(data.organizationId),
      createdBy: new mongoose.Types.ObjectId(data.createdBy),
      members: [],
      membersCount: 0
    });
    return team;
  },

  /**
   * Get team by ID
   */
  async getById(id: string): Promise<ITeam | null> {
    await connectDB();
    const team = await TeamModel.findById(id)
      .populate('organizationId', 'name description')
      .populate('createdBy', 'name email')
      .populate('members.userId', 'name email')
      .populate('members.addedBy', 'name email')
      .lean();
    return team as ITeam | null;
  },

  /**
   * Get all teams
   */
  async getAll(filters?: {
    organizationId?: string;
    limit?: number;
    skip?: number;
  }): Promise<ITeam[]> {
    await connectDB();
    const query = filters?.organizationId
      ? { organizationId: new mongoose.Types.ObjectId(filters.organizationId) }
      : {};

    const teams = await TeamModel.find(query)
      .populate('organizationId', 'name description')
      .populate('createdBy', 'name email')
      .limit(filters?.limit || 100)
      .skip(filters?.skip || 0)
      .sort({ createdAt: -1 })
      .lean();

    return teams as ITeam[];
  },

  /**
   * Get teams by organization
   */
  async getByOrganization(organizationId: string): Promise<ITeam[]> {
    await connectDB();
    const teams = await TeamModel.find({
      organizationId: new mongoose.Types.ObjectId(organizationId)
    })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    return teams as ITeam[];
  },

  /**
   * Get teams by user
   */
  async getByUser(userId: string): Promise<ITeam[]> {
    await connectDB();
    const teams = await TeamModel.find({
      'members.userId': new mongoose.Types.ObjectId(userId)
    })
      .populate('organizationId', 'name description')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    return teams as ITeam[];
  },

  /**
   * Update team
   */
  async update(
    id: string,
    data: Partial<{
      name: string;
      description: string;
      permissions: string[];
    }>
  ): Promise<ITeam | null> {
    await connectDB();
    const team = await TeamModel.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    ).lean();

    return team as ITeam | null;
  },

  /**
   * Add member to team
   */
  async addMember(
    teamId: string,
    member: {
      userId: string;
      role: string;
      addedBy: string;
    }
  ): Promise<ITeam | null> {
    await connectDB();

    // Validate role
    if (!VALID_TEAM_ROLES.includes(member.role as TeamRole)) {
      throw new Error(
        `Invalid role. Must be one of: ${VALID_TEAM_ROLES.join(', ')}`
      );
    }

    console.log('member', member);
    console.log('teamId', teamId);

    const team = await TeamModel.findByIdAndUpdate(
      teamId,
      {
        $push: {
          members: {
            userId: new mongoose.Types.ObjectId(member.userId),
            role: member.role,
            addedBy: new mongoose.Types.ObjectId(member.addedBy),
            addedAt: new Date()
          }
        },
        $inc: { membersCount: 1 }
      },
      { new: true }
    ).lean();

    console.log('team', team);

    return team as ITeam | null;
  },

  /**
   * Remove member from team
   */
  async removeMember(teamId: string, userId: string): Promise<ITeam | null> {
    await connectDB();
    const team = await TeamModel.findByIdAndUpdate(
      teamId,
      {
        $pull: { members: { userId: new mongoose.Types.ObjectId(userId) } },
        $inc: { membersCount: -1 }
      },
      { new: true }
    ).lean();

    return team as ITeam | null;
  },

  /**
   * Update member role
   */
  async updateMemberRole(
    teamId: string,
    userId: string,
    role: string
  ): Promise<ITeam | null> {
    await connectDB();

    // Validate role
    if (!VALID_TEAM_ROLES.includes(role as TeamRole)) {
      throw new Error(
        `Invalid role. Must be one of: ${VALID_TEAM_ROLES.join(', ')}`
      );
    }

    const team = await TeamModel.findOneAndUpdate(
      { _id: teamId, 'members.userId': new mongoose.Types.ObjectId(userId) },
      { $set: { 'members.$.role': role } },
      { new: true }
    ).lean();

    return team as ITeam | null;
  },

  /**
   * Add permission to team
   */
  async addPermission(
    teamId: string,
    permission: string
  ): Promise<ITeam | null> {
    await connectDB();
    const team = await TeamModel.findByIdAndUpdate(
      teamId,
      { $addToSet: { permissions: permission } },
      { new: true }
    ).lean();

    return team as ITeam | null;
  },

  /**
   * Remove permission from team
   */
  async removePermission(
    teamId: string,
    permission: string
  ): Promise<ITeam | null> {
    await connectDB();
    const team = await TeamModel.findByIdAndUpdate(
      teamId,
      { $pull: { permissions: permission } },
      { new: true }
    ).lean();

    return team as ITeam | null;
  },

  /**
   * Delete team
   */
  async delete(id: string): Promise<boolean> {
    await connectDB();
    const result = await TeamModel.findByIdAndDelete(id);
    return !!result;
  },

  /**
   * Count teams
   */
  async count(filters?: { organizationId?: string }): Promise<number> {
    await connectDB();
    const query = filters?.organizationId
      ? { organizationId: new mongoose.Types.ObjectId(filters.organizationId) }
      : {};
    return await TeamModel.countDocuments(query);
  },

  /**
   * Check if user is member of team
   */
  async isMember(teamId: string, userId: string): Promise<boolean> {
    await connectDB();
    const team = await TeamModel.findOne({
      _id: teamId,
      'members.userId': new mongoose.Types.ObjectId(userId)
    });
    return !!team;
  }
};
