import { Pool, QueryResult } from "pg";

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  database: process.env.DB_NAME || "skitt",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Initialize database schema
export async function initializeDatabase() {
  const client = await pool.connect();
  try {
    // Enable UUID extension
    await client.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // Feature Flags table
    await client.query(`
      CREATE TABLE IF NOT EXISTS feature_flags (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        key VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        enabled BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID UNIQUE NOT NULL DEFAULT uuid_generate_v4(),
        email VARCHAR(255),
        name VARCHAR(255),
        attributes JSONB, -- JSON for custom attributes
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // User-Flag assignments (for targeting specific users)
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_flag_assignments (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL,
        flag_id UUID NOT NULL,
        enabled BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (flag_id) REFERENCES feature_flags(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
        UNIQUE(user_id, flag_id)
      )
    `);

    // Experiments table
    await client.query(`
      CREATE TABLE IF NOT EXISTS experiments (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        flag_id UUID NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        variant_a_percentage INTEGER DEFAULT 50,
        variant_b_percentage INTEGER DEFAULT 50,
        status VARCHAR(50) DEFAULT 'draft', -- draft, running, paused, completed
        start_date TIMESTAMP,
        end_date TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (flag_id) REFERENCES feature_flags(id) ON DELETE CASCADE
      )
    `);

    // Experiment assignments (which users are in which variant)
    await client.query(`
      CREATE TABLE IF NOT EXISTS experiment_assignments (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        experiment_id UUID NOT NULL,
        user_id UUID NOT NULL,
        variant VARCHAR(10) NOT NULL, -- 'A' or 'B'
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (experiment_id) REFERENCES experiments(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
        UNIQUE(experiment_id, user_id)
      )
    `);

    // Metrics/Events table (for tracking flag usage)
    await client.query(`
      CREATE TABLE IF NOT EXISTS flag_events (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        flag_id UUID NOT NULL,
        user_id UUID,
        event_type VARCHAR(50) NOT NULL, -- 'enabled', 'disabled', 'viewed', 'clicked', etc.
        metadata JSONB, -- JSON for additional data
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (flag_id) REFERENCES feature_flags(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
      )
    `);

    // Create indexes for better query performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_user_flag_assignments_user ON user_flag_assignments(user_id);
      CREATE INDEX IF NOT EXISTS idx_user_flag_assignments_flag ON user_flag_assignments(flag_id);
      CREATE INDEX IF NOT EXISTS idx_experiment_assignments_experiment ON experiment_assignments(experiment_id);
      CREATE INDEX IF NOT EXISTS idx_experiment_assignments_user ON experiment_assignments(user_id);
      CREATE INDEX IF NOT EXISTS idx_flag_events_flag ON flag_events(flag_id);
      CREATE INDEX IF NOT EXISTS idx_flag_events_user ON flag_events(user_id);
      CREATE INDEX IF NOT EXISTS idx_flag_events_created ON flag_events(created_at);
    `);
  } finally {
    client.release();
  }
}

// Helper function to execute queries
export async function query(
  text: string,
  params?: any[]
): Promise<QueryResult> {
  return pool.query(text, params);
}

export default pool;
