import {
  FlagEventModel,
  CreateFlagEventInput,
  FlagEvent,
} from "../models/FlagEvent";
import { FeatureFlagModel } from "../models/FeatureFlag";
import { query } from "../database/db";
import { createFlagEventSchema } from "../schemas/metricsSchemas";
import { validateUUID } from "../utils/uuid";

export interface DashboardSummary {
  summary: {
    totalFlags: number;
    enabledFlags: number;
    totalUsers: number;
    totalAssignments: number;
    totalExperiments: number;
    eventsLast7Days: number;
  };
  topFlags: any[];
}

export class MetricsService {
  async trackEvent(input: unknown): Promise<FlagEvent> {
    const validated = createFlagEventSchema.parse(input);
    return await FlagEventModel.create(validated);
  }

  async getMetrics(flagId?: string): Promise<any[]> {
    if (flagId) {
      validateUUID(flagId, "Flag ID");
    }
    return await FlagEventModel.getMetrics(flagId);
  }

  async getDashboardSummary(): Promise<DashboardSummary> {
    const flags = await FeatureFlagModel.getAll();

    // Get total flags count
    const totalFlags = flags.length;
    const enabledFlags = flags.filter((f) => f.enabled).length;

    // Get total users
    const usersResult = await query("SELECT COUNT(*) as count FROM users");
    const totalUsers = parseInt(usersResult.rows[0].count);

    // Get total assignments
    const assignmentsResult = await query(
      "SELECT COUNT(*) as count FROM user_flag_assignments"
    );
    const totalAssignments = parseInt(assignmentsResult.rows[0].count);

    // Get total experiments
    const experimentsResult = await query(
      "SELECT COUNT(*) as count FROM experiments"
    );
    const totalExperiments = parseInt(experimentsResult.rows[0].count);

    // Get events in last 7 days
    const eventsResult = await query(`
      SELECT COUNT(*) as count 
      FROM flag_events 
      WHERE created_at >= NOW() - INTERVAL '7 days'
    `);
    const eventsLast7Days = parseInt(eventsResult.rows[0].count);

    // Get flag usage stats
    const flagUsageResult = await query(`
      SELECT 
        f.id,
        f.key,
        f.name,
        COUNT(e.id) as event_count,
        COUNT(DISTINCT e.user_id) as unique_users
      FROM feature_flags f
      LEFT JOIN flag_events e ON f.id = e.flag_id
      GROUP BY f.id, f.key, f.name
      ORDER BY event_count DESC
      LIMIT 10
    `);

    return {
      summary: {
        totalFlags,
        enabledFlags,
        totalUsers,
        totalAssignments,
        totalExperiments,
        eventsLast7Days,
      },
      topFlags: flagUsageResult.rows,
    };
  }
}
