/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * OpenCRVS is also distributed under the terms of the Civil Registration
 * & Healthcare Disclaimer located at http://opencrvs.org/license.
 *
 * Copyright (C) The OpenCRVS Authors located at https://github.com/opencrvs/opencrvs-core/blob/master/AUTHORS.
 */
/* eslint-disable */
import * as fs from 'fs'
import glob from 'glob'
import chalk from 'chalk'
import csv2json from 'csv2json'
import { stringify } from 'csv-stringify'
import { promisify } from 'util'
import { sortBy } from 'lodash'
import ts from 'typescript'
import { MessageDescriptor } from 'react-intl'

const translate = async (text: string, targetLanguage: string) => {
  try {
    const baseUrl = 'https://translate.googleapis.com/translate_a/single'
    const url = `${baseUrl}?client=gtx&sl=auto&tl=${targetLanguage}&dt=t&q=${encodeURIComponent(
      text
    )}`

    const response = await fetch(url)
    const result = await response.json()

    return result[0][0][0]
  } catch (error) {
    return text
  }
}

export async function writeJSONToCSV(
  filename: string,
  data: Array<Record<string, any>>
) {
  const csv = stringify(data, {
    header: true
  })
  return fs.promises.writeFile(filename, csv, 'utf8')
}

export async function readCSVToJSON<T>(filename: string) {
  return new Promise<T>((resolve, reject) => {
    const chunks: string[] = []
    fs.createReadStream(filename)
      .on('error', reject)
      .pipe(
        csv2json({
          separator: ','
        })
      )
      .on('data', (chunk: string) => chunks.push(chunk))
      .on('error', reject)
      .on('end', () => {
        resolve(JSON.parse(chunks.join('')))
      })
  })
}

type CSVRow = { id: string; description: string } & Record<string, string>

const write = process.argv.includes('--write')
const outdated = process.argv.includes('--outdated')

const COUNTRY_CONFIG_PATH = process.argv[2]

type LocalisationFile = CSVRow[]

function writeTranslations(data: LocalisationFile) {
  return writeJSONToCSV(
    `${COUNTRY_CONFIG_PATH}/src/translations/login.csv`,
    data
  )
}

function readTranslations() {
  return readCSVToJSON<CSVRow[]>(
    `${COUNTRY_CONFIG_PATH}/src/translations/login.csv`
  )
}

function findObjectLiteralsWithIdAndDefaultMessage(
  filePath: string,
  sourceCode: string
): MessageDescriptor[] {
  const sourceFile = ts.createSourceFile(
    'temp.ts',
    sourceCode,
    ts.ScriptTarget.Latest,
    true
  )
  const matches: MessageDescriptor[] = []

  function visit(node: ts.Node) {
    if (!ts.isObjectLiteralExpression(node)) {
      ts.forEachChild(node, visit)
      return
    }
    const idProperty = node.properties.find(
      (p) => ts.isPropertyAssignment(p) && p.name.getText() === 'id'
    )
    const defaultMessageProperty = node.properties.find(
      (p) => ts.isPropertyAssignment(p) && p.name.getText() === 'defaultMessage'
    )

    if (!(idProperty && defaultMessageProperty)) {
      ts.forEachChild(node, visit)
      return
    }

    const objectText = node.getText(sourceFile) // The source code representation of the object

    try {
      const func = new Function(`return (${objectText});`)
      const objectValue = func()
      matches.push(objectValue)
    } catch (error) {
      console.log(chalk.yellow.bold('Warning'))
      console.error(
        `Found a dynamic message identifier in file ${filePath}.`,
        'Message identifiers should never be dynamic and should always be hardcoded instead.',
        'This enables us to confidently verify that a country configuration has all required keys.',
        '\n',
        objectText,
        '\n'
      )
    }

    ts.forEachChild(node, visit)
  }

  visit(sourceFile)

  return matches
}

async function extractMessages() {
  let translations: LocalisationFile
  try {
    translations = await readTranslations()
  } catch (error: unknown) {
    const err = error as Error & { code: string }
    if (err.code === 'ENOENT') {
      console.error(err.message)
      console.error(
        `Your environment variables may not be set.
        Please add valid COUNTRY_CONFIG_PATH, as an environment variable.
        If they are set correctly, then something is wrong with
        this file: ${COUNTRY_CONFIG_PATH}/src/translations/login.csv`
      )
    } else {
      console.error(err)
    }
    process.exit(1)
  }

  const knownLanguages =
    translations.length > 0
      ? Object.keys(translations[0]).filter(
          (key) => !['id', 'description'].includes(key)
        )
      : ['en']

  console.log('Checking translations in application...')
  console.log()

  const files = await promisify(glob)('src/**/*.@(tsx|ts)', {
    ignore: ['**/*.test.@(tsx|ts)', 'src/tests/**/*.*']
  })

  const messagesParsedFromApp: MessageDescriptor[] = files
    .map((f) => {
      const contents = fs.readFileSync(f).toString()
      return findObjectLiteralsWithIdAndDefaultMessage(f, contents)
    })
    .flat()

  const reactIntlDescriptions: Record<string, string> = Object.fromEntries(
    messagesParsedFromApp.map(({ id, description }) => [id, description || ''])
  )

  const missingKeys = Object.keys(reactIntlDescriptions).filter(
    (key) => !translations.find(({ id }) => id === key)
  )

  if (outdated) {
    const extraKeys = translations
      .map(({ id }) => id)
      .filter((key) => !reactIntlDescriptions[key])

    console.log(chalk.yellow.bold('Potentially outdated translations'))
    console.log(
      'The following keys were not found in the code, but are part of the copy file:',
      '\n'
    )
    console.log(extraKeys.join('\n'))
  }

  if (missingKeys.length > 0) {
    // eslint-disable-line no-console
    console.log(chalk.red.bold('Missing translations'))
    console.log(`You are missing the following content keys from your country configuration package:\n
${chalk.white(missingKeys.join('\n'))}\n
Translate the keys and add them to this file:
${chalk.white(`${COUNTRY_CONFIG_PATH}/src/translations/login.csv`)}`)

    if (write) {
      console.log(
        `${chalk.yellow('Warning ⚠️:')} ${chalk.white(
          'The --write command is experimental and only adds new translations for English.'
        )}`
      )

      // This is just to ensure that all languages stay in the CVS file
      const emptyLanguages = Object.fromEntries(
        knownLanguages.map((lang) => [lang, ''])
      )

      const defaultsToBeAdded = await Promise.all(
        missingKeys.map(
          async (key): Promise<CSVRow> => ({
            id: key,
            description: reactIntlDescriptions[key],
            ...emptyLanguages,
            en:
              messagesParsedFromApp
                .find(({ id }) => id === key)
                ?.defaultMessage?.toString() || '',
            fr: await translate(
              messagesParsedFromApp
                .find(({ id }) => id === key)
                ?.defaultMessage?.toString() || '',
              'fr'
            )
          })
        )
      )

      const allIds = Array.from(
        new Set(
          defaultsToBeAdded
            .map(({ id }) => id)
            .concat(translations.map(({ id }) => id))
        )
      )

      const allTranslations = allIds.map((id) => {
        const existingTranslation = translations.find(
          (translation) => translation.id === id
        )

        return (
          existingTranslation ||
          defaultsToBeAdded.find((translation) => translation.id === id)!
        )
      })

      await writeTranslations(sortBy(allTranslations, (row) => row.id))
    } else {
      console.log(`
${chalk.green('Tip 🪄')}: ${chalk.white(
        `If you want this command to add the missing English keys for you, run it with the ${chalk.bold(
          '--write'
        )} flag. Note that you still need to add non-English translations to the file.`
      )}`)
    }

    process.exit(1)
  }
}

extractMessages()
