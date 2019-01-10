const DAY: number = 1000 * 60 * 60 * 24
const MONTH_IN_DAYS: number = 30
const YEAR_IN_DAYS: number = 365

function parseDate(dateString: string) {
  const ymdRegexString = '^\\d{4}-\\d{2}-\\d{2}$'
  const ymdRegex = new RegExp(ymdRegexString)

  if (!ymdRegex.test(dateString)) {
    throw new Error('Invalid date format')
  }

  const ymd = dateString.split('-')

  const year: number = Number(ymd[0])
  const month: number = Number(ymd[1]) - 1
  const day: number = Number(ymd[2])

  return new Date(year, month, day)
}

export function calculateDays(dob: string) {
  const currentDate = Date.now()
  const dateOfBirth = parseDate(dob)

  const differenceInDays = Math.floor(
    (Number(currentDate) - Number(dateOfBirth)) / DAY
  )

  return differenceInDays
}

export function timeElapsed(days: number) {
  const output: { unit: string; value: number } = { value: 0, unit: 'Day' }

  const year = Math.floor(days / YEAR_IN_DAYS)
  const month = Math.floor(days / MONTH_IN_DAYS)

  if (year > 0) {
    output.value = year
    output.unit = 'Year'
  } else if (month > 0) {
    output.value = month
    output.unit = 'Month'
  } else {
    output.value = days
  }

  return output
}

interface IRange {
  start: number
  end?: number
  value: number
}

const betweenRange = (range: IRange, check: number) =>
  range.end ? check >= range.start && check <= range.end : check >= range.start

export function calculatePrice(dateOfBirth: string) {
  const days = calculateDays(dateOfBirth)

  const ranges: IRange[] = []

  const between45Days: IRange = { start: 0, end: 45, value: 0 }
  const between45DaysTo5yr: IRange = {
    start: 46,
    end: 5 * YEAR_IN_DAYS,
    value: 25
  }
  const above5years: IRange = { start: 5 * YEAR_IN_DAYS + 1, value: 50 }

  ranges.push(between45Days, between45DaysTo5yr, above5years)

  let result
  result = ranges.find(range => betweenRange(range, days))

  return result && result.value.toFixed(2)
}
