import { query } from "../database/db";

export interface FlagEvent {
  id: string; // UUID
  flag_id: string; // UUID
  user_id: string | null; // UUID
  event_type: string;
  metadata: Record<string, any> | null;
  created_at: string;
}

export interface CreateFlagEventInput {
  flag_id: string; // UUID
  user_id?: string; // UUID
  event_type: string;
  metadata?: Record<string, any>;
}

export class FlagEventModel {
  static async create(input: CreateFlagEventInput): Promise<FlagEvent> {
    const result = await query(
      `
      INSERT INTO flag_events (flag_id, user_id, event_type, metadata)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `,
      [
        input.flag_id,
        input.user_id || null,
        input.event_type,
        input.metadata ? JSON.stringify(input.metadata) : null,
      ]
    );
    const event = result.rows[0] as FlagEvent;
    if (event.metadata && typeof event.metadata === "string") {
      event.metadata = JSON.parse(event.metadata);
    }
    return event;
  }

  static async getByFlagId(flagId: string): Promise<FlagEvent[]> {
    const result = await query(
      "SELECT * FROM flag_events WHERE flag_id = $1 ORDER BY created_at DESC",
      [flagId]
    );
    return result.rows.map((row) => {
      if (row.metadata && typeof row.metadata === "string") {
        row.metadata = JSON.parse(row.metadata);
      }
      return row as FlagEvent;
    });
  }

  static async getMetrics(flagId?: string): Promise<any> {
    let queryText = `
      SELECT 
        flag_id,
        event_type,
        COUNT(*) as count,
        DATE(created_at) as date
      FROM flag_events
    `;
    const params: any[] = [];

    if (flagId) {
      queryText += " WHERE flag_id = $1";
      params.push(flagId);
    }

    queryText += `
      GROUP BY flag_id, event_type, DATE(created_at)
      ORDER BY date DESC, flag_id, event_type
    `;

    const result = await query(queryText, params);
    return result.rows;
  }
}
