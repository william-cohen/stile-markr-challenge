import type TestResult from "../models/testresult.js"
import type { TestResultRepo } from "../repos/testresultrepo.js"

export type AggregateResult = {
  mean: number
  stddev: number
  min: number
  max: number
  p25: number
  p50: number
  p75: number
  count: number
}

class AggregateService {
  private resultRepo: TestResultRepo
  constructor(resultsRepo: TestResultRepo) {
    this.resultRepo = resultsRepo
  }

  /**
   * Aggregates the test results for a given test ID.
   * @param testId The ID of the test to aggregate results for.
   * @returns An object containing the aggregated results.
   */
  aggregateTestResults = async (testId: string): Promise<AggregateResult | undefined> => {
    const repo = this.resultRepo
    const results = await repo.getTestResultsByTestId(testId)

    if (results.length === 0) {
      return undefined
    }

    console.log("Results: ", results)

    const resultPercentages = this.testResultsToPercentages(results)

    console.log("Result Percentages: ", resultPercentages)

    const mean = calculateMean(resultPercentages)
    const stddev = calculateStdDev(resultPercentages, mean)
    const min = calculateMin(resultPercentages)
    const max = calculateMax(resultPercentages)
    const p25 = calculatePercentile(resultPercentages, 25)
    const p50 = calculatePercentile(resultPercentages, 50)
    const p75 = calculatePercentile(resultPercentages, 75)
    const count = calculateCount(resultPercentages)

    return {
      mean,
      stddev,
      min,
      max,
      p25,
      p50,
      p75,
      count
    }
  }

  private testResultsToPercentages(
    results: TestResult[]
  ): number[] {
    const probablyCorrectTotalMarksAvailable = pickMostFrequent(results.map((result) => result.marksAvailable))

    console.log("Probably Correct Total Marks Available: ", probablyCorrectTotalMarksAvailable)

    return results.map((result) => {
      const percentage = (result.marksObtained / probablyCorrectTotalMarksAvailable) * 100
      return percentage
    })

  }
}

const calculatePercentile = (
  data: number[],
  percentile: number
): number => {
  if (data.length === 0) return 0

  const sortedData = [...data].sort((a, b) => a - b)
  const index = Math.floor((percentile / 100) * sortedData.length) 
  return sortedData[Math.min(index, sortedData.length - 1)]
}

const calculateMean = (data: number[]): number =>  {
  if (data.length === 0) return 0
  const sum = data.reduce((acc, val) => acc + val, 0)
  return sum / data.length + 0.0
}

const calculateStdDev = (data: number[], mean: number): number => {
  if (data.length === 0) return 0
  const variance = data.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / data.length
  return Math.sqrt(variance)
}

const calculateMin = (data: number[]): number => {
  if (data.length === 0) return 0
  return Math.min(...data)
}

const calculateMax = (data: number[]): number => {
  if (data.length === 0) return 0
  return Math.max(...data)
}

const calculateCount = (data: number[]): number => {
  return data.length
}

const pickMostFrequent = (data: number[]): number => {
  const frequencyMap = new Map<number, number>()
  let maxFrequency = 0
  let mostFrequentValue = -1

  for (const item of data) {
    const frequency = (frequencyMap.get(item) || 0) + 1
    frequencyMap.set(item, frequency)

    if (frequency > maxFrequency) {
      maxFrequency = frequency
      mostFrequentValue = item
    }
  }

  console.log(data)
  console.log("Most Frequent Value: ", mostFrequentValue)
  console.log("freuencyMap: ", frequencyMap)

  return mostFrequentValue
}

export default AggregateService
