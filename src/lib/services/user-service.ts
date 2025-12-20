import connectDB from '@/lib/db/mongodb';
import UserModel, { IAuthUser, IProfile } from '@/lib/auth/user-model';

export const userService = {
  /**
   * Get user by ID
   */
  async getById(id: string): Promise<IAuthUser | null> {
    await connectDB();
    const user = await UserModel.findById(id).select('-password').lean();
    return user as IAuthUser | null;
  },

  /**
   * Get user by email
   */
  async getByEmail(email: string): Promise<IAuthUser | null> {
    await connectDB();
    const user = await UserModel.findOne({ email }).select('-password').lean();
    return user as IAuthUser | null;
  },

  /**
   * Get all users
   */
  async getAll(filters?: {
    search?: string;
    limit?: number;
    skip?: number;
  }): Promise<IAuthUser[]> {
    await connectDB();
    const query = filters?.search
      ? {
          $or: [
            { name: { $regex: filters.search, $options: 'i' } },
            { username: { $regex: filters.search, $options: 'i' } },
            { email: { $regex: filters.search, $options: 'i' } }
          ]
        }
      : {};

    const users = await UserModel.find(query)
      .select('-password')
      .limit(filters?.limit || 100)
      .skip(filters?.skip || 0)
      .sort({ createdAt: -1 })
      .lean();

    return users as IAuthUser[];
  },

  /**
   * Update user
   */
  async update(
    id: string,
    data: Partial<{
      name: string;
      email: string;
      profile: IProfile;
    }>
  ): Promise<IAuthUser | null> {
    await connectDB();
    const user = await UserModel.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    )
      .select('-password')
      .lean();

    return user as IAuthUser | null;
  },

  /**
   * Update user profile
   */
  async updateProfile(
    id: string,
    profile: Partial<IProfile>
  ): Promise<IAuthUser | null> {
    await connectDB();
    const user = await UserModel.findByIdAndUpdate(
      id,
      { $set: { profile } },
      { new: true }
    )
      .select('-password')
      .lean();

    return user as IAuthUser | null;
  },

  /**
   * Delete user
   */
  async delete(id: string): Promise<boolean> {
    await connectDB();
    const result = await UserModel.findByIdAndDelete(id);
    return !!result;
  },

  /**
   * Check if email exists
   */
  async emailExists(email: string): Promise<boolean> {
    await connectDB();
    const count = await UserModel.countDocuments({ email });
    return count > 0;
  },

  /**
   * Count users
   */
  async count(): Promise<number> {
    await connectDB();
    return await UserModel.countDocuments();
  }
};

