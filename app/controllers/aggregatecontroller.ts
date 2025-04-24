import type { Context } from "hono"
import type { TestResultRepo } from "../repos/testresultrepo.js"
import AggregateService from "../services/aggregateservice.js"

class AggregateController {

  private aggregateService: AggregateService

  constructor(resultsRepo: TestResultRepo) {
    this.aggregateService = new AggregateService(resultsRepo)
  }

  /**
   * Handles the aggregation of test results.
   */
  aggregate = async (c: Context): Promise<Response> => {
    const testId = c.req.param('testId')
    if (!testId) {
      return c.text('Test ID is required', 400)
    }

    try {
      const result = await this.aggregateService.aggregateTestResults(testId)
      if (!result) {
        return c.text(`No results found for test ID ${testId}`, 404)
      }
      return c.json(result, 200)
    } catch (error) {
      console.error('Error aggregating test results:', error)
      return c.text('Unexpected error occurred during aggregation', 500)
    }
  }
}

export default AggregateController
