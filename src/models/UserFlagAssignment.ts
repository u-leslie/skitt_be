import { query } from "../database/db";

export interface UserFlagAssignment {
  id: string; // UUID
  user_id: string; // UUID
  flag_id: string; // UUID
  enabled: boolean;
  created_at: string;
}

export interface CreateUserFlagAssignmentInput {
  user_id: string; // UUID
  flag_id: string; // UUID
  enabled?: boolean;
}

export class UserFlagAssignmentModel {
  static async getByUserId(userId: string): Promise<UserFlagAssignment[]> {
    const result = await query(
      "SELECT * FROM user_flag_assignments WHERE user_id = $1",
      [userId]
    );
    return result.rows as UserFlagAssignment[];
  }

  static async getByFlagId(flagId: string): Promise<UserFlagAssignment[]> {
    const result = await query(
      "SELECT * FROM user_flag_assignments WHERE flag_id = $1",
      [flagId]
    );
    return result.rows as UserFlagAssignment[];
  }

  static async getByUserAndFlag(
    userId: string,
    flagId: string
  ): Promise<UserFlagAssignment | null> {
    const result = await query(
      "SELECT * FROM user_flag_assignments WHERE user_id = $1 AND flag_id = $2",
      [userId, flagId]
    );
    return (result.rows[0] as UserFlagAssignment) || null;
  }

  static async create(
    input: CreateUserFlagAssignmentInput
  ): Promise<UserFlagAssignment> {
    const result = await query(
      `
      INSERT INTO user_flag_assignments (user_id, flag_id, enabled)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id, flag_id) 
      DO UPDATE SET enabled = $3
      RETURNING *
    `,
      [input.user_id, input.flag_id, input.enabled !== undefined ? input.enabled : true]
    );
    return result.rows[0] as UserFlagAssignment;
  }

  static async delete(userId: string, flagId: string): Promise<boolean> {
    const result = await query(
      "DELETE FROM user_flag_assignments WHERE user_id = $1 AND flag_id = $2",
      [userId, flagId]
    );
    return (result.rowCount ?? 0) > 0;
  }
}
