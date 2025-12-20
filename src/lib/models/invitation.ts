import mongoose, { Schema, Model, Document } from 'mongoose';

export interface IInvitation extends Document {
  email: string;
  teamId: mongoose.Types.ObjectId;
  organizationId: mongoose.Types.ObjectId;
  role: string;
  invitedBy: mongoose.Types.ObjectId;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

const invitationSchema = new Schema<IInvitation>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    teamId: {
      type: Schema.Types.ObjectId,
      ref: 'Team',
      required: true
    },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true
    },
    role: {
      type: String,
      required: true,
      default: 'member'
    },
    invitedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'expired'],
      default: 'pending'
    },
    token: {
      type: String,
      required: true,
      unique: true
    },
    expiresAt: {
      type: Date,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: false,
    versionKey: false
  }
);

// token index is automatically created by unique: true
invitationSchema.index({ email: 1, teamId: 1 });
invitationSchema.index({ status: 1 });
invitationSchema.index({ expiresAt: 1 });

const InvitationModel: Model<IInvitation> =
  mongoose.models.Invitation ||
  mongoose.model<IInvitation>('Invitation', invitationSchema);

export default InvitationModel;
