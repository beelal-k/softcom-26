import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  username: String,
  role: {
    type: String,
    default: 'user',
  },
  qb_realm_id: String,
  qb_access_token: String,
  qb_refresh_token: String,
  qb_access_token_expires_at: Date,
  qb_refresh_token_expires_at: Date,
  google_drive_access_token: String,
  google_drive_refresh_token: String,
  google_drive_token_expires_at: Date,
}, {
  timestamps: true,
  collection: 'users' // Explicitly match the backend collection name
});

export default mongoose.models.User || mongoose.model('User', UserSchema);

