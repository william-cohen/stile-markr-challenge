import { serve } from '@hono/node-server'
import routes from './router.js'

import { pool } from './db.js'

serve({
  fetch: routes.fetch,
  port: 4567
}, (info) => {
  console.log(`Markr is running on http://localhost:${info.port}`)
})
