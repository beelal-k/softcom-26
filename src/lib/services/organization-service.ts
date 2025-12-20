import connectDB from '@/lib/db/mongodb';
import OrganizationModel, { IOrganization } from '@/lib/models/organization';
import mongoose from 'mongoose';

export const organizationService = {
  /**
   * Create a new organization
   */
  async create(data: {
    name: string;
    description: string;
    owner: string;
  }): Promise<IOrganization> {
    await connectDB();
    const organization = await OrganizationModel.create({
      ...data,
      owner: new mongoose.Types.ObjectId(data.owner)
    });
    return organization;
  },

  /**
   * Get organization by ID
   */
  async getById(id: string): Promise<IOrganization | null> {
    await connectDB();
    const organization = await OrganizationModel.findById(id)
      .populate('owner', 'name email')
      .lean();
    return organization as IOrganization | null;
  },

  /**
   * Get all organizations
   */
  async getAll(filters?: {
    owner?: string;
    limit?: number;
    skip?: number;
  }): Promise<IOrganization[]> {
    await connectDB();
    const query = filters?.owner
      ? { owner: new mongoose.Types.ObjectId(filters.owner) }
      : {};

    const organizations = await OrganizationModel.find(query)
      .populate('owner', 'name email')
      .limit(filters?.limit || 100)
      .skip(filters?.skip || 0)
      .sort({ createdAt: -1 })
      .lean();

    return organizations as IOrganization[];
  },

  /**
   * Get organizations by owner
   */
  async getByOwner(ownerId: string): Promise<IOrganization[]> {
    await connectDB();
    const organizations = await OrganizationModel.find({
      owner: new mongoose.Types.ObjectId(ownerId)
    })
      .sort({ createdAt: -1 })
      .lean();

    return organizations as IOrganization[];
  },

  /**
   * Update organization
   */
  async update(
    id: string,
    data: Partial<{
      name: string;
      description: string;
    }>
  ): Promise<IOrganization | null> {
    await connectDB();
    const organization = await OrganizationModel.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    ).lean();

    return organization as IOrganization | null;
  },

  /**
   * Delete organization
   */
  async delete(id: string): Promise<boolean> {
    await connectDB();
    const result = await OrganizationModel.findByIdAndDelete(id);
    return !!result;
  },

  /**
   * Count organizations
   */
  async count(filters?: { owner?: string }): Promise<number> {
    await connectDB();
    const query = filters?.owner
      ? { owner: new mongoose.Types.ObjectId(filters.owner) }
      : {};
    return await OrganizationModel.countDocuments(query);
  }
};
