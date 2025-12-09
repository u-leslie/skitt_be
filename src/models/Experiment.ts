import { query } from "../database/db";

export interface Experiment {
  id: string; // UUID
  flag_id: string; // UUID
  name: string;
  description: string | null;
  variant_a_percentage: number;
  variant_b_percentage: number;
  status: "draft" | "running" | "paused" | "completed";
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateExperimentInput {
  flag_id: string; // UUID
  name: string;
  description?: string;
  variant_a_percentage?: number;
  variant_b_percentage?: number;
  status?: "draft" | "running" | "paused" | "completed";
  start_date?: string;
  end_date?: string;
}

export interface UpdateExperimentInput {
  name?: string;
  description?: string;
  variant_a_percentage?: number;
  variant_b_percentage?: number;
  status?: "draft" | "running" | "paused" | "completed";
  start_date?: string;
  end_date?: string;
}

export class ExperimentModel {
  static async getAll(): Promise<Experiment[]> {
    const result = await query(
      "SELECT * FROM experiments ORDER BY created_at DESC"
    );
    return result.rows as Experiment[];
  }

  static async getById(id: string): Promise<Experiment | null> {
    const result = await query("SELECT * FROM experiments WHERE id = $1", [
      id,
    ]);
    return (result.rows[0] as Experiment) || null;
  }

  static async getByFlagId(flagId: string): Promise<Experiment[]> {
    const result = await query("SELECT * FROM experiments WHERE flag_id = $1", [
      flagId,
    ]);
    return result.rows as Experiment[];
  }

  static async create(input: CreateExperimentInput): Promise<Experiment> {
    const result = await query(
      `
      INSERT INTO experiments (flag_id, name, description, variant_a_percentage, variant_b_percentage, status, start_date, end_date)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `,
      [
        input.flag_id,
        input.name,
        input.description || null,
        input.variant_a_percentage || 50,
        input.variant_b_percentage || 50,
        input.status || "draft",
        input.start_date || null,
        input.end_date || null,
      ]
    );
    return result.rows[0] as Experiment;
  }

  static async update(
    id: string,
    input: UpdateExperimentInput
  ): Promise<Experiment | null> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (input.name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      values.push(input.name);
    }
    if (input.description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      values.push(input.description);
    }
    if (input.variant_a_percentage !== undefined) {
      updates.push(`variant_a_percentage = $${paramIndex++}`);
      values.push(input.variant_a_percentage);
    }
    if (input.variant_b_percentage !== undefined) {
      updates.push(`variant_b_percentage = $${paramIndex++}`);
      values.push(input.variant_b_percentage);
    }
    if (input.status !== undefined) {
      updates.push(`status = $${paramIndex++}`);
      values.push(input.status);
    }
    if (input.start_date !== undefined) {
      updates.push(`start_date = $${paramIndex++}`);
      values.push(input.start_date);
    }
    if (input.end_date !== undefined) {
      updates.push(`end_date = $${paramIndex++}`);
      values.push(input.end_date);
    }

    if (updates.length === 0) {
      return this.getById(id);
    }

    updates.push("updated_at = CURRENT_TIMESTAMP");
    values.push(id);

    const result = await query(
      `
      UPDATE experiments
      SET ${updates.join(", ")}
      WHERE id = $${paramIndex}
      RETURNING *
    `,
      values
    );
    return (result.rows[0] as Experiment) || null;
  }

  static async delete(id: string): Promise<boolean> {
    const result = await query("DELETE FROM experiments WHERE id = $1", [id]);
    return (result.rowCount ?? 0) > 0;
  }
}
