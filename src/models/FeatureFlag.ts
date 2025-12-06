import { query } from "../database/db";

export interface FeatureFlag {
  id: string; // UUID
  key: string;
  name: string;
  description: string | null;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateFeatureFlagInput {
  key: string;
  name: string;
  description?: string;
  enabled?: boolean;
}

export interface UpdateFeatureFlagInput {
  name?: string;
  description?: string;
  enabled?: boolean;
}

export class FeatureFlagModel {
  static async getAll(): Promise<FeatureFlag[]> {
    const result = await query(
      "SELECT * FROM feature_flags ORDER BY created_at DESC"
    );
    return result.rows as FeatureFlag[];
  }

  static async getById(id: string): Promise<FeatureFlag | null> {
    const result = await query("SELECT * FROM feature_flags WHERE id = $1", [
      id,
    ]);
    return (result.rows[0] as FeatureFlag) || null;
  }

  static async getByKey(key: string): Promise<FeatureFlag | null> {
    const result = await query("SELECT * FROM feature_flags WHERE key = $1", [
      key,
    ]);
    return (result.rows[0] as FeatureFlag) || null;
  }

  static async create(input: CreateFeatureFlagInput): Promise<FeatureFlag> {
    const result = await query(
      `
      INSERT INTO feature_flags (key, name, description, enabled)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `,
      [input.key, input.name, input.description || null, input.enabled || false]
    );
    return result.rows[0] as FeatureFlag;
  }

  static async update(
    id: string,
    input: UpdateFeatureFlagInput
  ): Promise<FeatureFlag | null> {
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
    if (input.enabled !== undefined) {
      updates.push(`enabled = $${paramIndex++}`);
      values.push(input.enabled);
    }

    if (updates.length === 0) {
      return this.getById(id);
    }

    updates.push("updated_at = CURRENT_TIMESTAMP");
    values.push(id);

    const result = await query(
      `
      UPDATE feature_flags
      SET ${updates.join(", ")}
      WHERE id = $${paramIndex}
      RETURNING *
    `,
      values
    );
    return (result.rows[0] as FeatureFlag) || null;
  }

  static async delete(id: string): Promise<boolean> {
    const result = await query("DELETE FROM feature_flags WHERE id = $1", [id]);
    return result.rowCount !== null && result.rowCount > 0;
  }
}
