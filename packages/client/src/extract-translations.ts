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
import { ILanguage } from '@client/i18n/reducer'
import chalk from 'chalk'
import * as fs from 'fs'
import glob from 'glob'
import main, { Message } from 'typescript-react-intl'

interface IReactIntlDescriptions {
  [key: string]: string
}

// unit tests use some content keys that do not need to be content managed
const testKeys = ['form.field.label.UNION', 'form.field.label.DIVISION']

function existsInContentful(obj: any, value: string): boolean {
  if (Object.values(obj).indexOf(value) > -1) {
    return true
  }
  return false
}

async function extractMessages() {
  const COUNTRY_CONFIG_PATH = process.argv[2]
  let client: {
    data: Array<{
      lang: string
      displayName: string
      messages: Record<string, string>
    }>
  }
  let contentfulIds: Record<string, string>
  try {
    client = JSON.parse(
      fs
        .readFileSync(
          `${COUNTRY_CONFIG_PATH}/src/features/languages/content/client/client.json`
        )
        .toString()
    )

    contentfulIds = JSON.parse(
      fs
        .readFileSync(
          `${COUNTRY_CONFIG_PATH}/src/features/languages/content/client/contentful-ids.json`
        )
        .toString()
    )
  } catch (err) {
    console.error(
      `Your environment variables may not be set. Please add valid COUNTRY_CONFIG_PATH, as an environment variable.  If they are set correctly, then something is wrong with this file: ${COUNTRY_CONFIG_PATH}/src/features/languages/content/client/client.json or this file: ${COUNTRY_CONFIG_PATH}/src/features/languages/content/client/contentful-ids.json`
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
      const contentfulKeysToMigrate: string[] = []
      const englishTranslations = client.data.find(
        (obj: ILanguage) => obj.lang === 'en-US' || obj.lang === 'en'
      )?.messages
      let missingKeys = false

      Object.keys(reactIntlDescriptions).forEach((key) => {
        if (
          !englishTranslations?.hasOwnProperty(key) &&
          !(testKeys.indexOf(key) > -1)
        ) {
          missingKeys = true
          // eslint-disable-line no-console
          console.log(
            `${chalk.red(
              `ERROR: Missing content key: ${chalk.white(
                key
              )}  Translate it and add it here: ${chalk.white(
                `${COUNTRY_CONFIG_PATH}/src/features/languages/content/client/client.json`
              )}`
            )}`
          )
        }

        if (contentfulIds && !existsInContentful(contentfulIds, key)) {
          console.log(
            `${chalk.yellow(
              `This country configuration is setup to optionally use the Contentful Content Management System. Preparing this content key: ${chalk.white(
                key
              )} in ${chalk.white(`${key}`)}`
            )}`
          )
          console.log(
            `${chalk.yellow(
              'When this script passes, OpenCRVS will save the new key'
            )} here ${chalk.white(
              `${COUNTRY_CONFIG_PATH}/src/features/languages/content/client/contentful-keys-to-migrate.json`
            )} and save the description into descriptions.json so that later you can import it into an existing or new Contentful installation.`
          )
          contentfulKeysToMigrate.push(key)
        }
      })

      if (missingKeys) {
        // eslint-disable-line no-console
        console.log(
          `${chalk.red(
            'ERROR: Fix the missing keys in the local files: '
          )}${chalk.white(
            `${COUNTRY_CONFIG_PATH}/src/features/languages/content/client/client.json`
          )}`
        )
        process.exit(1)
        return
      }

      fs.writeFileSync(
        `${COUNTRY_CONFIG_PATH}/src/features/languages/content/client/descriptions.json`,
        JSON.stringify({ data: reactIntlDescriptions }, null, 2)
      )
      fs.writeFileSync(
        `${COUNTRY_CONFIG_PATH}/src/features/languages/content/client/contentful-keys-to-migrate.json`,
        JSON.stringify(contentfulKeysToMigrate, null, 2)
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
