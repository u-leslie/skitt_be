import { query } from "../database/db";

export interface User {
  id: string; // UUID
  user_id: string; // UUID
  email: string | null;
  name: string | null;
  attributes: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

export interface CreateUserInput {
  user_id?: string; // Optional, will be auto-generated if not provided
  email?: string;
  name?: string;
  attributes?: Record<string, any>;
}

export interface UpdateUserInput {
  email?: string;
  name?: string;
  attributes?: Record<string, any>;
}

export class UserModel {
  static async getAll(): Promise<User[]> {
    const result = await query("SELECT * FROM users ORDER BY created_at DESC");
    return result.rows as User[];
  }

  static async getById(id: string): Promise<User | null> {
    const result = await query("SELECT * FROM users WHERE id = $1", [id]);
    return (result.rows[0] as User) || null;
  }

  static async getByUserId(userId: string): Promise<User | null> {
    const result = await query("SELECT * FROM users WHERE user_id = $1", [
      userId,
    ]);
    return (result.rows[0] as User) || null;
  }

  static async create(input: CreateUserInput): Promise<User> {
    const result = await query(
      `
      INSERT INTO users (user_id, email, name, attributes)
      VALUES (COALESCE($1::uuid, uuid_generate_v4()), $2, $3, $4)
      RETURNING *
    `,
      [
        input.user_id || null,
        input.email || null,
        input.name || null,
        input.attributes ? JSON.stringify(input.attributes) : null,
      ]
    );
    const user = result.rows[0] as User;
    if (user.attributes && typeof user.attributes === "string") {
      user.attributes = JSON.parse(user.attributes);
    }
    return user;
  }

  static async update(
    id: string,
    input: UpdateUserInput
  ): Promise<User | null> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (input.email !== undefined) {
      updates.push(`email = $${paramIndex++}`);
      values.push(input.email);
    }
    if (input.name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      values.push(input.name);
    }
    if (input.attributes !== undefined) {
      updates.push(`attributes = $${paramIndex++}`);
      values.push(JSON.stringify(input.attributes));
    }

    if (updates.length === 0) {
      return this.getById(id);
    }

    updates.push("updated_at = CURRENT_TIMESTAMP");
    values.push(id);

    const result = await query(
      `
      UPDATE users
      SET ${updates.join(", ")}
      WHERE id = $${paramIndex}
      RETURNING *
    `,
      values
    );
    const user = (result.rows[0] as User) || null;
    if (user && user.attributes && typeof user.attributes === "string") {
      user.attributes = JSON.parse(user.attributes);
    }
    return user;
  }

  static async delete(id: string): Promise<boolean> {
    const result = await query("DELETE FROM users WHERE id = $1", [id]);
    return result.rowCount > 0;
  }
}
