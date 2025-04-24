import { Hono } from 'hono'
import ImportController from './controllers/importcontroller.js'
import { PostgresTestResultRepo } from './repos/testresultrepo.js'
import AggregateController from './controllers/aggregatecontroller.js'

const testResultsRepo = new PostgresTestResultRepo()
const importController = new ImportController(testResultsRepo)
const aggregateController = new AggregateController(testResultsRepo)


const routes = new Hono()

routes.get('/', (c) => {
  return c.text('Hello from Markr!')
})

routes.post('/import', importController.import)

routes.get('/results/:testId/aggregate', aggregateController.aggregate)

export default routes
