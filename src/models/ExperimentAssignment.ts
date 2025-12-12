import { query } from "../database/db";

export interface ExperimentAssignment {
  id: string; // UUID
  experiment_id: string; // UUID
  user_id: string; // UUID
  variant: "A" | "B";
  created_at: string;
}

export class ExperimentAssignmentModel {
  static async getByExperimentId(
    experimentId: string
  ): Promise<ExperimentAssignment[]> {
    const result = await query(
      "SELECT * FROM experiment_assignments WHERE experiment_id = $1 ORDER BY created_at DESC",
      [experimentId]
    );
    return result.rows as ExperimentAssignment[];
  }

  static async getByUserId(userId: string): Promise<ExperimentAssignment[]> {
    const result = await query(
      "SELECT * FROM experiment_assignments WHERE user_id = $1",
      [userId]
    );
    return result.rows as ExperimentAssignment[];
  }

  static async getByUserAndExperiment(
    userId: string,
    experimentId: string
  ): Promise<ExperimentAssignment | null> {
    const result = await query(
      "SELECT * FROM experiment_assignments WHERE user_id = $1 AND experiment_id = $2",
      [userId, experimentId]
    );
    return (result.rows[0] as ExperimentAssignment) || null;
  }

  static async create(
    experimentId: string,
    userId: string,
    variant: "A" | "B"
  ): Promise<ExperimentAssignment> {
    const result = await query(
      `
      INSERT INTO experiment_assignments (experiment_id, user_id, variant)
      VALUES ($1, $2, $3)
      ON CONFLICT (experiment_id, user_id) 
      DO UPDATE SET variant = $3
      RETURNING *
    `,
      [experimentId, userId, variant]
    );
    return result.rows[0] as ExperimentAssignment;
  }

  static async delete(experimentId: string, userId: string): Promise<boolean> {
    const result = await query(
      "DELETE FROM experiment_assignments WHERE experiment_id = $1 AND user_id = $2",
      [experimentId, userId]
    );
    return result.rowCount !== null && result.rowCount > 0;
  }
}



