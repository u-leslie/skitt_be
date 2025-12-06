import {
  FeatureFlagModel,
  CreateFeatureFlagInput,
  UpdateFeatureFlagInput,
  FeatureFlag,
} from "../models/FeatureFlag";
import {
  createFeatureFlagSchema,
  updateFeatureFlagSchema,
} from "../schemas/featureFlagSchemas";
import { AppError } from "../middleware/errorHandler";
import { validateUUID } from "../utils/uuid";

export class FeatureFlagService {
  async getAllFlags(): Promise<FeatureFlag[]> {
    return await FeatureFlagModel.getAll();
  }

  async getFlagById(id: string): Promise<FeatureFlag> {
    validateUUID(id, "Flag ID");
    const flag = await FeatureFlagModel.getById(id);
    if (!flag) {
      throw new AppError("Feature flag not found", 404);
    }
    return flag;
  }

  async getFlagByKey(key: string): Promise<FeatureFlag | null> {
    return await FeatureFlagModel.getByKey(key);
  }

  async createFlag(input: unknown): Promise<FeatureFlag> {
    const validated = createFeatureFlagSchema.parse(input);

    // Check if flag with key already exists
    const existing = await FeatureFlagModel.getByKey(validated.key);
    if (existing) {
      throw new AppError("Feature flag with this key already exists", 409);
    }
    return await FeatureFlagModel.create(validated);
  }

  async updateFlag(id: string, input: unknown): Promise<FeatureFlag> {
    validateUUID(id, "Flag ID");

    const validated = updateFeatureFlagSchema.parse(input);
    const flag = await FeatureFlagModel.getById(id);
    if (!flag) {
      throw new AppError("Feature flag not found", 404);
    }
    const updated = await FeatureFlagModel.update(id, validated);
    if (!updated) {
      throw new AppError("Failed to update feature flag", 500);
    }
    return updated;
  }

  async deleteFlag(id: string): Promise<void> {
    validateUUID(id, "Flag ID");
    const deleted = await FeatureFlagModel.delete(id);
    if (!deleted) {
      throw new AppError("Feature flag not found", 404);
    }
  }
}
