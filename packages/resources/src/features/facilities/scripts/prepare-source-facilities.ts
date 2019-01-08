import * as fs from 'fs'
import { FACILITIES_SOURCE } from '../../../constants'
import * as csv2json from 'csv2json'
const sourceJSON = `${FACILITIES_SOURCE}crvs-facilities.json`
import chalk from 'chalk'

export default async function prepareSourceJSON() {
  // tslint:disable-next-line:no-console
  console.log(
    `${chalk.blueBright(
      '/////////////////////////// CONVERTING FACILITIES CSV TO JSON ///////////////////////////'
    )}`
  )
  fs.createReadStream(`${FACILITIES_SOURCE}crvs-facilities.csv`)
    .pipe(csv2json())
    .pipe(fs.createWriteStream(sourceJSON))

  return true
}

prepareSourceJSON()
