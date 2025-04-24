import { pool } from "../db.js"

import TestResult from "../models/testresult.js"

export interface TestResultRepo {
  upsertTestResults(results: TestResult[]): Promise<void>
  getTestResultsByTestId(testId: string): Promise<TestResult[]>
}

export class PostgresTestResultRepo implements TestResultRepo {
  async upsertTestResults(results: TestResult[]): Promise<void> {
    if (results.length === 0) return
  
    const client = await pool.connect()
    try {
      await client.query("BEGIN")
  
      const values: any[] = []
      const placeholders: string[] = []
  
      results.forEach((result, i) => {
        const idx = i * 4
        placeholders.push(`($${idx + 1}, $${idx + 2}, $${idx + 3}, $${idx + 4})`)
        values.push(result.testId, result.studentNumber, result.marksAvailable, result.marksObtained)
      })
  
      const query = `
        INSERT INTO test_results (test_id, student_number, marks_available, marks_obtained)
        VALUES ${placeholders.join(", ")}
        ON CONFLICT (test_id, student_number) DO UPDATE
        SET
          marks_available = EXCLUDED.marks_available,
          marks_obtained = GREATEST(test_results.marks_obtained, EXCLUDED.marks_obtained)
      `
  
      await client.query(query, values)
      await client.query("COMMIT")
    } catch (error) {
      await client.query("ROLLBACK")
      throw error
    } finally {
      client.release()
    }
  }
  

  async getTestResultsByTestId(testId: string): Promise<TestResult[]> {
    const client = await pool.connect()
    try {
      const res = await client.query(
        `SELECT * FROM test_results WHERE test_id = $1`,
        [testId]
      )
      return res.rows.map((row) => {
        return TestResult.create(
          row.test_id,
          row.student_number,
          row.marks_available,
          row.marks_obtained
        )
      })
    } finally {
      client.release()
    }
  }
}


