import { User, SafeUser } from './types';
import connectDB from '@/lib/db/mongodb';
import UserModel from './user-model';

export const userStorage = {
  /**
   * Get all users
   */
  async getAll(): Promise<User[]> {
    await connectDB();
    const users = await UserModel.find({}).lean();
    return users as User[];
  },

  /**
   * Find a user by ID
   */
  async findById(id: string): Promise<User | null> {
    await connectDB();
    const user = await UserModel.findOne({ id }).lean();
    return user as User | null;
  },

  /**
   * Find a user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    await connectDB();
    const user = await UserModel.findOne({ email }).lean();
    return user as User | null;
  },

  /**
   * Find a user by username
   */
  async findByUsername(username: string): Promise<User | null> {
    await connectDB();
    const user = await UserModel.findOne({ username }).lean();
    return user as User | null;
  },

  /**
   * Create a new user
   */
  async create(user: User): Promise<User> {
    await connectDB();
    const newUser = await UserModel.create(user);
    return newUser.toObject() as User;
  },

  /**
   * Update a user
   */
  async update(id: string, updates: Partial<User>): Promise<User | null> {
    await connectDB();
    const updatedUser = await UserModel.findOneAndUpdate(
      { id },
      { $set: updates },
      { new: true }
    ).lean();
    return updatedUser as User | null;
  },

  /**
   * Delete a user
   */
  async delete(id: string): Promise<boolean> {
    await connectDB();
    const result = await UserModel.deleteOne({ id });
    return result.deletedCount > 0;
  },

  /**
   * Remove password from user object for safe return
   */
  toSafeUser(user: User): SafeUser {
    const { password, ...safeUser } = user;
    return safeUser;
  }
};
