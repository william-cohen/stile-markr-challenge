import { Pool } from 'pg'
import * as dotenv from 'dotenv'

dotenv.config()

const DOCKER_COMPOSE_DATABASE_URL = 'postgres://user:password@localhost:5432/postgres'

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL || DOCKER_COMPOSE_DATABASE_URL,
})

// Run migrations
// XXX This is a placeholder for the migration logic.
// In a real application, you would use a migration tool or something less cooked than this.
const migrations = async () => {
  const client = await pool.connect()
  await client.query('DROP TABLE IF EXISTS test_results')
  // Add table
  await client.query('CREATE TABLE IF NOT EXISTS test_results (id SERIAL PRIMARY KEY, test_id VARCHAR(255), student_number VARCHAR(255), marks_available INT, marks_obtained INT)')
  
  // Add constraint
  await client.query('ALTER TABLE test_results ADD CONSTRAINT unique_test_student UNIQUE (test_id, student_number)')
  
  // Add index on test_id
  await client.query('CREATE INDEX IF NOT EXISTS idx_test_id ON test_results (test_id)')
  console.log('Migrations completed')
}

await pool.connect()
await migrations()
