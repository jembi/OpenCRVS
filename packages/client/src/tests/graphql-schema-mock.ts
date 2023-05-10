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
import { readFileSync } from 'fs'
import { addMockFunctionsToSchema, makeExecutableSchema } from 'graphql-tools'

const graphQLSchemaPath = `${process.cwd()}/src/tests/schema.graphql`
const schemaString = readFileSync(graphQLSchemaPath).toString()

export function getSchema() {
  const schema = makeExecutableSchema({
    typeDefs: schemaString,
    /*
     * This disables the following warnings:
     *
     * Type "EventSearchSet" is missing a "resolveType" resolver.
     * Pass false into "resolverValidationOptions.requireResolversForResolveType" to disable this warning.
     */
    resolverValidationOptions: {
      requireResolversForResolveType: false
    }
  })

  addMockFunctionsToSchema({
    schema,
    mocks: {
      Date: () => {
        return new Date()
      }
    }
  })

  return schema
}
