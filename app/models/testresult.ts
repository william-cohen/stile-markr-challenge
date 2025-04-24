class TestResult {
  testId: string
  studentNumber: string
  marksAvailable: number
  marksObtained: number

 private constructor(
    testId: string,
    studentNumber: string,
    marksAvailable: number,
    marksObtained: number
  ) {
    this.testId = testId
    this.studentNumber = studentNumber
    this.marksAvailable = marksAvailable
    this.marksObtained = marksObtained
  }

  static create(
    testId: string,
    studentNumber: string,
    marksAvailable: number,
    marksObtained: number
  ): TestResult {
    if (!testId || !studentNumber || marksAvailable < 0 || marksObtained < 0) {
      throw new TestResultCreationError("Invalid input data")
    }
    return new TestResult(testId, studentNumber, marksAvailable, marksObtained)
  }
}

export class TestResultCreationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "TestResultCreationError"
  }
}

export default TestResult

