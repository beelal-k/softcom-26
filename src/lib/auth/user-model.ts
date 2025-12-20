import mongoose, { Schema, Model, Document } from 'mongoose';

export interface IProfile {
  avatar?: string;
  bio?: string;
}

export interface IAuthUser extends Document {
  username: string;
  email: string;
  password: string;
  role: string;
  name?: string;
  profile?: IProfile;
  createdAt: Date;
}

const userSchema = new Schema<IAuthUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ['admin', 'user'],
      default: 'user',
      required: true
    },
    name: {
      type: String,
      trim: true
    },
    profile: {
      avatar: {
        type: String,
        default: ''
      },
      bio: {
        type: String,
        default: ''
      }
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

userSchema.index({ createdAt: -1 });

const UserModel: Model<IAuthUser> =
  mongoose.models.User || mongoose.model<IAuthUser>('User', userSchema);

export default UserModel;
