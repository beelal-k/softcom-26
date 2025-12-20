import { User, SafeUser } from './types';
import connectDB from '@/lib/db/mongodb';
import UserModel, { IAuthUser } from './user-model';

export const userStorage = {
  /**
   * Get all users
   */
  async getAll(): Promise<User[]> {
    await connectDB();
    const users = await UserModel.find({}).lean();
    return users.map((u) => ({ ...u, id: u._id.toString() })) as User[];
  },

  /**
   * Find a user by ID
   */
  async findById(id: string): Promise<User | null> {
    await connectDB();
    const user = await UserModel.findById(id).lean();
    if (!user) return null;
    return { ...user, id: user._id.toString() } as User;
  },

  /**
   * Find a user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    await connectDB();
    const user = await UserModel.findOne({ email }).lean();
    if (!user) return null;
    return { ...user, id: user._id.toString() } as User;
  },

  /**
   * Find a user by username
   */
  async findByUsername(username: string): Promise<User | null> {
    await connectDB();
    const user = await UserModel.findOne({ username }).lean();
    if (!user) return null;
    return { ...user, id: user._id.toString() } as User;
  },

  /**
   * Create a new user
   */
  async create(user: Omit<User, 'id'>): Promise<User> {
    await connectDB();
    const newUser = await UserModel.create(user);
    const obj = newUser.toObject();
    return { ...obj, id: obj._id.toString() } as User;
  },

  /**
   * Update a user
   */
  async update(id: string, updates: Partial<User>): Promise<User | null> {
    await connectDB();
    const updatedUser = await UserModel.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true }
    ).lean();
    if (!updatedUser) return null;
    return { ...updatedUser, id: updatedUser._id.toString() } as User;
  },

  /**
   * Delete a user
   */
  async delete(id: string): Promise<boolean> {
    await connectDB();
    const result = await UserModel.findByIdAndDelete(id);
    return !!result;
  },

  /**
   * Remove password from user object for safe return
   */
  toSafeUser(user: User): SafeUser {
    const { password, ...safeUser } = user;
    return safeUser;
  }
};
