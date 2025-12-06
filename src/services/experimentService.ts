import {
  ExperimentModel,
  CreateExperimentInput,
  UpdateExperimentInput,
  Experiment,
} from "../models/Experiment";
import {
  createExperimentSchema,
  updateExperimentSchema,
} from "../schemas/experimentSchemas";
import { AppError } from "../middleware/errorHandler";
import { validateUUID } from "../utils/uuid";

export class ExperimentService {
  async getAllExperiments(): Promise<Experiment[]> {
    return await ExperimentModel.getAll();
  }

  async getExperimentById(id: string): Promise<Experiment> {
    validateUUID(id, "Experiment ID");
    const experiment = await ExperimentModel.getById(id);
    if (!experiment) {
      throw new AppError("Experiment not found", 404);
    }
    return experiment;
  }

  async getExperimentsByFlagId(flagId: string): Promise<Experiment[]> {
    validateUUID(flagId, "Flag ID");
    return await ExperimentModel.getByFlagId(flagId);
  }

  async createExperiment(input: unknown): Promise<Experiment> {
    const validated = createExperimentSchema.parse(input);
    return await ExperimentModel.create(validated);
  }

  async updateExperiment(id: string, input: unknown): Promise<Experiment> {
    validateUUID(id, "Experiment ID");

    const validated = updateExperimentSchema.parse(input);
    const experiment = await ExperimentModel.getById(id);
    if (!experiment) {
      throw new AppError("Experiment not found", 404);
    }
    const updated = await ExperimentModel.update(id, validated);
    if (!updated) {
      throw new AppError("Failed to update experiment", 500);
    }
    return updated;
  }

  async deleteExperiment(id: string): Promise<void> {
    validateUUID(id, "Experiment ID");
    const deleted = await ExperimentModel.delete(id);
    if (!deleted) {
      throw new AppError("Experiment not found", 404);
    }
  }
}
