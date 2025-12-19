import mongoose, { Schema, Model } from 'mongoose';
import { User } from './types';

// Define the User schema
const userSchema = new Schema<User>(
  {
    id: {
      type: String,
      required: true,
      unique: true
    },
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

// Export the model
const UserModel: Model<User> =
  mongoose.models.User || mongoose.model<User>('User', userSchema);

export default UserModel;
