
import { XMLParser } from 'fast-xml-parser'
import { z } from 'zod'
import TestResult, { TestResultCreationError } from '../models/testresult.js'
import type { TestResultRepo } from '../repos/testresultrepo.js'

class ImportService {

  private parser: XMLParser
  private repo: TestResultRepo

  constructor(repo: TestResultRepo) {
    this.repo = repo
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '',
      allowBooleanAttributes: true, // XXX Probably not needed
      isArray: (name) => name === 'mcq-test-result' || name === "answer"
    })
    this.parser = parser
  }

  /**
   * Imports XML test result data into the system.
   * @param xml The XML string to be parsed and imported.
   * @returns The number of test results imported.
   * @throws ImportError if the XML is invalid or if there are errors during import.
   */
  async importXml(xml: string): Promise<number> {
    const repo = this.repo
    const parser = this.parser
    const xmlSchema = this.createZodSchema()

    try {
      const raw = parser.parse(xml)
      const parsed = xmlSchema.parse(raw) 
      const rawResults = parsed['mcq-test-results']['mcq-test-result']
      const entries = Array.isArray(rawResults) ? rawResults : [rawResults]
  
      const results: TestResult[] = []
      const errors: string[] = []
  
      entries.forEach((entry) => {
        try {
          const result = TestResult.create(
            entry['test-id'],
            entry['student-number'],
            entry['summary-marks'].available,
            entry['summary-marks'].obtained
          )
          results.push(result)
        }
        catch (error) {
          if (error instanceof TestResultCreationError) {
            errors.push(`Test result creation error: ${error.message}`)
          }
        }
      })

      if (errors.length > 0) {
        throw new ImportError('Errors occurred during XML import: ' + errors.join('\n '))
      }

      repo.upsertTestResults(results)

      return results.length

    } catch (error) {
      if (error instanceof z.ZodError) {
        
        throw new ImportError('XML validation error: ' + error.issues.map(issue => `(${issue.path}): ${issue.message}`).join('\n '))
      } else {
        throw error
      }
    }
  }

  private createZodSchema() {
    const stringOrNumber = z.union([
      z.string().min(1),
      z.number().transform((val) => val.toString())
    ])
    
    const testResultSchema = z.object({
      'test-id': stringOrNumber,
      'student-number': stringOrNumber,
      'summary-marks': z.object({
        available: stringOrNumber.transform((val) => parseFloat(val)),
        obtained: stringOrNumber.transform((val) => parseFloat(val)),
      }),
    })
    
    const xmlSchema = z.object({
      'mcq-test-results': z.object({
        'mcq-test-result': z.union([
          testResultSchema,
          z.array(testResultSchema)
        ]),
      }),
    })

    return xmlSchema
  }
}

export class ImportError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "ImportError"
  }
}

export default ImportService
