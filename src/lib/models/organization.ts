import mongoose, { Schema, Model, Document } from 'mongoose';

export interface IOrganization extends Document {
  name: string;
  description: string;
  owner: mongoose.Types.ObjectId;
  industry: string;
  company_size: string;
  website: string;
  createdAt: Date;
}

const organizationSchema = new Schema<IOrganization>(
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
    industry: {
      type: String,
      required: true,
      trim: true,
      default: ''
    },
    company_size: {
      type: String,
      required: true,
      trim: true
    },
    website: {
      type: String,
      required: true,
      trim: true,
      default: ''
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
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

organizationSchema.index({ owner: 1 });
organizationSchema.index({ createdAt: -1 });

const OrganizationModel: Model<IOrganization> =
  mongoose.models.Organization ||
  mongoose.model<IOrganization>('Organization', organizationSchema);

export default OrganizationModel;
