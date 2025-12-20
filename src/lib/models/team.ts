import mongoose, { Schema, Model, Document } from 'mongoose';

export interface ITeamMember {
  userId: mongoose.Types.ObjectId;
  role: string;
  addedAt: Date;
  addedBy: mongoose.Types.ObjectId;
}

export interface ITeam extends Document {
  name: string;
  description: string;
  organizationId: mongoose.Types.ObjectId;
  permissions: string[];
  members: ITeamMember[];
  membersCount: number;
  createdAt: Date;
  createdBy: mongoose.Types.ObjectId;
}

const teamMemberSchema = new Schema<ITeamMember>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      required: true,
      trim: true
    },
    addedAt: {
      type: Date,
      default: Date.now
    },
    addedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    _id: false
  }
);

const teamSchema = new Schema<ITeam>(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true
    },
    permissions: {
      type: [String],
      default: []
    },
    members: {
      type: [teamMemberSchema],
      default: []
    },
    membersCount: {
      type: Number,
      default: 0
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: false,
    versionKey: false
  }
);

teamSchema.index({ organizationId: 1 });
teamSchema.index({ 'members.userId': 1 });
teamSchema.index({ createdAt: -1 });

const TeamModel: Model<ITeam> =
  mongoose.models.Team || mongoose.model<ITeam>('Team', teamSchema);

export default TeamModel;
