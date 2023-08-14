/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors. OpenCRVS and the OpenCRVS
 * graphic logo are (registered/a) trademark(s) of Plan International.
 */
/* eslint-disable */
import * as fs from 'fs'
import glob from 'glob'
import main, { Message } from 'typescript-react-intl'
import chalk from 'chalk'
import { ILanguage } from '@login/i18n/reducer'

interface IReactIntlDescriptions {
  [key: string]: string
}

function existsInContentful(obj: any, value: string): boolean {
  if (Object.values(obj).indexOf(value) > -1) {
    return true
  }
  return false
}

async function extractMessages() {
  const COUNTRY_CONFIG_PATH = process.argv[2]

  let login: {
    data: Array<{
      lang: string
      displayName: string
      messages: Record<string, string>
    }>
  }
  try {
    login = JSON.parse(
      fs
        .readFileSync(`${COUNTRY_CONFIG_PATH}/src/api/content/login/login.json`)
        .toString()
    )
  } catch (err) {
    console.error(
      `Please add valid COUNTRY_CONFIG_PATH as an environment variable`
    )
    process.exit(1)
  }
  let results: any[] = []
  const pattern = 'src/**/*.@(tsx|ts)'
  try {
    // eslint-disable-line no-console
    console.log(`${chalk.yellow('Checking translations in application ...')}`)
    glob(pattern, (err: any, files) => {
      if (err) {
        throw new Error(err)
      }
      let res: Message[]
      files.forEach((f) => {
        const contents = fs.readFileSync(f).toString()
        var res = main(contents)
        results = results.concat(res)
      })
      const reactIntlDescriptions: IReactIntlDescriptions = {}
      results.forEach((r) => {
        reactIntlDescriptions[r.id] = r.description
      })
      const englishTranslations = login.data.find(
        (obj: ILanguage) => obj.lang === 'en-US' || obj.lang === 'en'
      )?.messages
      let missingKeys = false

      Object.keys(reactIntlDescriptions).forEach((key) => {
        if (!englishTranslations?.hasOwnProperty(key)) {
          missingKeys = true
          // eslint-disable-line no-console
          console.log(
            `${chalk.red(
              `No English translation key exists for message id.  Remeber to translate and add for all locales!!!: ${chalk.white(
                key
              )} in ${chalk.white(
                `${COUNTRY_CONFIG_PATH}/src/api/content/login/login.json`
              )}`
            )}`
          )
        }
      })

      if (missingKeys) {
        // eslint-disable-line no-console
        console.log(
          `${chalk.red('WARNING: ')}${chalk.yellow(
            'Fix missing keys in locale files first.'
          )}`
        )
        process.exit(1)
        return
      }

      fs.writeFileSync(
        `${COUNTRY_CONFIG_PATH}/src/api/content/login/descriptions.json`,
        JSON.stringify({ data: reactIntlDescriptions }, null, 2)
      )
    })
  } catch (err) {
    // eslint-disable-line no-console
    console.log(err)
    process.exit(1)
    return
  }
}

extractMessages()
