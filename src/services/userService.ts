import {
  UserModel,
  CreateUserInput,
  UpdateUserInput,
  User,
} from "../models/User";
import {
  UserFlagAssignmentModel,
  CreateUserFlagAssignmentInput,
  UserFlagAssignment,
} from "../models/UserFlagAssignment";
import { createUserSchema, updateUserSchema } from "../schemas/userSchemas";
import { AppError } from "../middleware/errorHandler";
import { validateUUID } from "../utils/uuid";

export class UserService {
  async getAllUsers(): Promise<User[]> {
    return await UserModel.getAll();
  }

  async getUserById(id: string): Promise<User> {
    validateUUID(id, "User ID");
    const user = await UserModel.getById(id);
    if (!user) {
      throw new AppError("User not found", 404);
    }
    return user;
  }

  async getUserByUserId(userId: string): Promise<User | null> {
    validateUUID(userId, "User ID");
    return await UserModel.getByUserId(userId);
  }

  async createUser(input: unknown): Promise<User> {
    const validated = createUserSchema.parse(input);

    // Check if user with user_id already exists (if provided)
    if (validated.user_id) {
      const existing = await UserModel.getByUserId(validated.user_id);
      if (existing) {
        throw new AppError("User with this user_id already exists", 409);
      }
    }
    return await UserModel.create(validated);
  }

  async updateUser(id: string, input: unknown): Promise<User> {
    validateUUID(id, "User ID");

    const validated = updateUserSchema.parse(input);
    const user = await UserModel.getById(id);
    if (!user) {
      throw new AppError("User not found", 404);
    }
    const updated = await UserModel.update(id, validated);
    if (!updated) {
      throw new AppError("Failed to update user", 500);
    }
    return updated;
  }

  async deleteUser(id: string): Promise<void> {
    validateUUID(id, "User ID");
    const deleted = await UserModel.delete(id);
    if (!deleted) {
      throw new AppError("User not found", 404);
    }
  }

  async assignFlagToUser(
    userId: string,
    flagId: string,
    enabled: boolean = true
  ): Promise<UserFlagAssignment> {
    validateUUID(userId, "User ID");
    validateUUID(flagId, "Flag ID");
    return await UserFlagAssignmentModel.create({
      user_id: userId,
      flag_id: flagId,
      enabled,
    });
  }

  async removeFlagFromUser(userId: string, flagId: string): Promise<void> {
    validateUUID(userId, "User ID");
    validateUUID(flagId, "Flag ID");
    const deleted = await UserFlagAssignmentModel.delete(userId, flagId);
    if (!deleted) {
      throw new AppError("Assignment not found", 404);
    }
  }

  async getUserFlags(userId: string): Promise<UserFlagAssignment[]> {
    validateUUID(userId, "User ID");
    return await UserFlagAssignmentModel.getByUserId(userId);
  }
}
