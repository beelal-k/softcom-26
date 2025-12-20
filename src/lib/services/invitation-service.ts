import connectDB from '@/lib/db/mongodb';
import InvitationModel, { IInvitation } from '@/lib/models/invitation';
import mongoose from 'mongoose';
import { randomBytes } from 'crypto';
import { sendInvitationEmail } from './email-service';
import { teamService, organizationService, userService } from './index';
import { ITeam } from '../models/team';
import { VALID_TEAM_ROLES, TeamRole } from './team-service';

export const invitationService = {
  /**
   * Create invitation and send email
   */
  async create(data: {
    email: string;
    teamId: string;
    organizationId: string;
    role: string;
    invitedBy: string;
  }): Promise<IInvitation> {
    await connectDB();

    // Validate role
    if (!VALID_TEAM_ROLES.includes(data.role as TeamRole)) {
      throw new Error(
        `Invalid role. Must be one of: ${VALID_TEAM_ROLES.join(', ')}`
      );
    }

    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invitation = await InvitationModel.create({
      ...data,
      teamId: new mongoose.Types.ObjectId(data.teamId),
      organizationId: new mongoose.Types.ObjectId(data.organizationId),
      invitedBy: new mongoose.Types.ObjectId(data.invitedBy),
      token,
      expiresAt,
      status: 'pending'
    });

    // Send email
    try {
      const team = await teamService.getById(data.teamId);
      const org = await organizationService.getById(data.organizationId);
      const inviter = await userService.getById(data.invitedBy);

      if (team && org && inviter) {
        await sendInvitationEmail(data.email, {
          token,
          teamName: team.name,
          organizationName: org.name,
          inviterName: inviter.name || inviter.username || 'Someone',
          role: data.role
        });
        console.log('✅ Invitation email sent successfully to:', data.email);
      } else {
        console.error('❌ Missing data for email:', {
          team: !!team,
          org: !!org,
          inviter: !!inviter
        });
      }
    } catch (emailError) {
      console.error('❌ Failed to send invitation email:', emailError);
      console.error('Email error details:', {
        message:
          emailError instanceof Error ? emailError.message : 'Unknown error',
        stack: emailError instanceof Error ? emailError.stack : undefined
      });
      // Continue even if email fails
    }

    return invitation;
  },

  /**
   * Get invitation by token
   */
  async getByToken(token: string): Promise<IInvitation | null> {
    await connectDB();
    const invitation = await InvitationModel.findOne({ token })
      .populate('teamId', 'name description')
      .populate('organizationId', 'name description')
      .populate('invitedBy', 'name email')
      .lean();
    return invitation as IInvitation | null;
  },

  /**
   * Get invitations by email
   */
  async getByEmail(email: string): Promise<IInvitation[]> {
    await connectDB();
    const invitations = await InvitationModel.find({ email, status: 'pending' })
      .populate('teamId', 'name description')
      .populate('organizationId', 'name description')
      .populate('invitedBy', 'name email')
      .sort({ createdAt: -1 })
      .lean();
    return invitations as IInvitation[];
  },

  /**
   * Get invitations by team
   */
  async getByTeam(teamId: string): Promise<IInvitation[]> {
    await connectDB();
    const invitations = await InvitationModel.find({
      teamId: new mongoose.Types.ObjectId(teamId)
    })
      .populate('invitedBy', 'name email')
      .sort({ createdAt: -1 })
      .lean();
    return invitations as IInvitation[];
  },

  /**
   * Accept invitation (mark as accepted)
   */
  async accept(token: string): Promise<IInvitation | null> {
    await connectDB();
    const invitation = await InvitationModel.findOneAndUpdate(
      { token, status: 'pending' },
      { $set: { status: 'accepted' } },
      { new: true }
    ).lean();

    return invitation as IInvitation | null;
  },

  /**
   * Reject invitation
   */
  async reject(token: string): Promise<IInvitation | null> {
    await connectDB();
    const invitation = await InvitationModel.findOneAndUpdate(
      { token, status: 'pending' },
      { $set: { status: 'rejected' } },
      { new: true }
    ).lean();
    return invitation as IInvitation | null;
  },

  /**
   * Delete invitation
   */
  async delete(id: string): Promise<boolean> {
    await connectDB();
    const result = await InvitationModel.findByIdAndDelete(id);
    return !!result;
  },

  /**
   * Check if invitation is valid
   */
  async isValid(token: string): Promise<boolean> {
    await connectDB();
    const invitation = await InvitationModel.findOne({
      token,
      status: 'pending'
    });

    if (!invitation) return false;

    if (new Date() > invitation.expiresAt) {
      await InvitationModel.updateOne(
        { _id: invitation._id },
        { $set: { status: 'expired' } }
      );
      return false;
    }

    return true;
  },

  /**
   * Expire old invitations
   */
  async expireOld(): Promise<number> {
    await connectDB();
    const result = await InvitationModel.updateMany(
      {
        status: 'pending',
        expiresAt: { $lt: new Date() }
      },
      { $set: { status: 'expired' } }
    );
    return result.modifiedCount;
  }
};
