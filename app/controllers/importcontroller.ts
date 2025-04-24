import type { Context } from "hono"
import ImportService, { ImportError } from "../services/importservice.js"
import type { TestResultRepo } from "../repos/testresultrepo.js"

class ImportController {

  private importService: ImportService

  constructor(resultsRepo: TestResultRepo) {
    this.importService = new ImportService(resultsRepo)
  }

  /**
   * Handles the import of XML data.
   */
  import = async (c: Context): Promise<Response> => {
    // Check that the content type is the XML thing we expect
    const contentType = c.req.header('Content-Type')
    if (contentType && contentType !== 'text/xml+markr') {
      c.res.headers.set('Accept', 'text/xml+markr')
      return c.text('Unsupported content type, must be text/xml+markr', 415)
    }

    const body = await c.req.text()

    try {
      await this.importService.importXml(body)
    } catch (error) {
      if (error instanceof ImportError) {
        console.error('Error importing XML:', error)
        return c.text(`Error importing XML: ${error.message}`, 400)
      } else {
        console.error('Unexpected error:', error)
        return c.text('Unexpected error occurred during import', 500)
      }
    }
  
    const requestBody = await c.req.text()
    return c.text(requestBody, 200)
  }
}

export default ImportController
