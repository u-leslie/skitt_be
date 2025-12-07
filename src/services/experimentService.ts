import {
  ExperimentModel,
  CreateExperimentInput,
  UpdateExperimentInput,
  Experiment,
} from "../models/Experiment";
import { ExperimentAssignmentModel } from "../models/ExperimentAssignment";
import {
  createExperimentSchema,
  updateExperimentSchema,
} from "../schemas/experimentSchemas";
import { AppError } from "../middleware/errorHandler";
import { validateUUID } from "../utils/uuid";
import crypto from "crypto";

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

  async updateExperiment(
    id: string,
    input: unknown
  ): Promise<Experiment> {
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

  /**
   * Assign a user to a variant in an experiment
   * Uses deterministic hashing to ensure same user always gets same variant
   */
  async assignUserToVariant(
    experimentId: string,
    userId: string
  ): Promise<{ variant: "A" | "B"; assignment: any }> {
    validateUUID(experimentId, "Experiment ID");
    validateUUID(userId, "User ID");

    // Check if user is already assigned
    const existing = await ExperimentAssignmentModel.getByUserAndExperiment(
      userId,
      experimentId
    );
    if (existing) {
      return { variant: existing.variant, assignment: existing };
    }

    // Get experiment details
    const experiment = await ExperimentModel.getById(experimentId);
    if (!experiment) {
      throw new AppError("Experiment not found", 404);
    }

    // Check if experiment is running
    if (experiment.status !== "running") {
      throw new AppError("Experiment is not running", 400);
    }

    // Deterministic assignment based on user_id hash
    const hash = crypto
      .createHash("md5")
      .update(`${experimentId}-${userId}`)
      .digest("hex");
    const hashValue = parseInt(hash.substring(0, 8), 16);
    const percentage = hashValue % 100;

    // Assign based on percentages
    const variant: "A" | "B" =
      percentage < experiment.variant_a_percentage ? "A" : "B";

    // Create assignment
    const assignment = await ExperimentAssignmentModel.create(
      experimentId,
      userId,
      variant
    );

    return { variant, assignment };
  }

  /**
   * Get which variant a user should see for a flag
   * Checks for active experiments and returns the variant
   */
  async evaluateFlagForUser(
    flagId: string,
    userId: string
  ): Promise<{
    flagEnabled: boolean;
    variant?: "A" | "B";
    experimentId?: string;
    experimentName?: string;
  }> {
    validateUUID(flagId, "Flag ID");
    validateUUID(userId, "User ID");

    // Get active experiments for this flag
    const experiments = await ExperimentModel.getByFlagId(flagId);
    const activeExperiment = experiments.find(
      (exp) =>
        exp.status === "running" &&
        (!exp.start_date || new Date(exp.start_date) <= new Date()) &&
        (!exp.end_date || new Date(exp.end_date) >= new Date())
    );

    if (activeExperiment) {
      // Assign user to variant if not already assigned
      const { variant } = await this.assignUserToVariant(
        activeExperiment.id,
        userId
      );
      return {
        flagEnabled: true,
        variant,
        experimentId: activeExperiment.id,
        experimentName: activeExperiment.name,
      };
    }

    // No active experiment, check if flag is enabled
    const { FeatureFlagModel } = await import("../models/FeatureFlag");
    const flag = await FeatureFlagModel.getById(flagId);
    if (!flag) {
      throw new AppError("Feature flag not found", 404);
    }

    return {
      flagEnabled: flag.enabled,
    };
  }

  /**
   * Get all user assignments for an experiment
   */
  async getExperimentAssignments(experimentId: string): Promise<any[]> {
    validateUUID(experimentId, "Experiment ID");
    const assignments = await ExperimentAssignmentModel.getByExperimentId(
      experimentId
    );

    // Get user details
    const { UserModel } = await import("../models/User");
    const assignmentsWithUsers = await Promise.all(
      assignments.map(async (assignment) => {
        const user = await UserModel.getByUserId(assignment.user_id);
        return {
          ...assignment,
          user: user
            ? {
                id: user.id,
                user_id: user.user_id,
                name: user.name,
                email: user.email,
              }
            : null,
        };
      })
    );

    return assignmentsWithUsers;
  }

  /**
   * Get all experiments a user is assigned to
   */
  async getUserAssignments(userId: string): Promise<any[]> {
    validateUUID(userId, "User ID");
    const assignments = await ExperimentAssignmentModel.getByUserId(userId);

    // Get experiment details
    const assignmentsWithExperiments = await Promise.all(
      assignments.map(async (assignment) => {
        const experiment = await ExperimentModel.getById(
          assignment.experiment_id
        );
        return {
          ...assignment,
          experiment: experiment
            ? {
                id: experiment.id,
                name: experiment.name,
                flag_id: experiment.flag_id,
                status: experiment.status,
              }
            : null,
        };
      })
    );

    return assignmentsWithExperiments;
  }
}
