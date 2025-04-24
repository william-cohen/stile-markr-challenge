import { describe, it, beforeEach, afterAll, expect } from "vitest"
import routes from "../router.js"
import { pool } from "../db.js"

const singleTestResultXml = `
<mcq-test-results>
    <mcq-test-result scanned-on="2017-12-04T12:12:10+11:00">
        <first-name>Jane</first-name>
        <last-name>Austen</last-name>
        <student-number>521585128</student-number>
        <test-id>1234</test-id>
        <summary-marks available="20" obtained="13" />
    </mcq-test-result>
</mcq-test-results>
`

describe("Test Results API", () => {
  beforeEach(async () => {
    // Clear & seed the DB before each test
    await pool.query("DELETE FROM test_results")
  })

  it("should accept a test result", async () => {
    const res = await routes.request("/import", {
      method: "POST",
      body: singleTestResultXml,
      headers: {
        "Content-Type": "text/xml+markr",
      },
    })

    expect(res.status).toBe(201)
    expect(await res.text()).toEqual("Imported 1 results")
  })

  it("should return correct statistics", async () => {
    await routes.request("/import", {
      method: "POST",
      body: singleTestResultXml,
      headers: {
        "Content-Type": "text/xml+markr",
      },
    })

    const res = await routes.request("/results/1234/aggregate")
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json).toEqual({
      mean: 65.0,
      stddev: 0.0,
      min: 65.0,
      max: 65.0,
      p25: 65.0,
      p50: 65.0,
      p75: 65.0,
      count: 1,
    })
  })
})
