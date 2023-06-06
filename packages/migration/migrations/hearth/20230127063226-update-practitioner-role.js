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
import lodash from 'lodash'
const { capitalize } = lodash

export const up = async (db, client) => {
  const session = client.startSession()
  const limit = 10
  let skip = 0
  let processedDocCount = 0
  const usersLabels = {
    FIELD_AGENT: [
      { label: 'Field Agent', lang: 'en' },
      { label: 'Agent de terrain', lang: 'fr' }
    ],
    REGISTRATION_AGENT: [
      { label: 'Registration Agent', lang: 'en' },
      { label: "Agent d'enregistrement", lang: 'fr' }
    ],
    LOCAL_REGISTRAR: [
      { label: 'Local Registrar', lang: 'en' },
      { label: 'Registraire local', lang: 'fr' }
    ],
    LOCAL_SYSTEM_ADMIN: [
      { label: 'Local System Admin', lang: 'en' },
      { label: 'Administrateur système local', lang: 'fr' }
    ],
    NATIONAL_SYSTEM_ADMIN: [
      { label: 'National System Admin', lang: 'en' },
      { label: 'Administrateur système national', lang: 'fr' }
    ],
    PERFORMANCE_MANAGEMENT: [
      { label: 'Performance Management', lang: 'en' },
      { label: 'Gestion des performances', lang: 'fr' }
    ],
    NATIONAL_REGISTRAR: [
      { label: 'National Registrar', lang: 'en' },
      { label: 'Registraire national', lang: 'fr' }
    ]
  }

  try {
    await session.withTransaction(async () => {
      const totalPractitionerRoleCount = await getTotalDocCountByCollectionName(
        db,
        'PractitionerRole'
      )
      while (totalPractitionerRoleCount > processedDocCount) {
        const practitionerRoleCursor = await getPractitionerRoleCursor(
          db,
          limit,
          skip
        )
        const count = await practitionerRoleCursor.count()
        // eslint-disable-next-line no-console
        console.log(
          `Migration Up - PractitionerRole :: Processing ${
            processedDocCount + 1
          } - ${
            processedDocCount + count
          } of ${totalPractitionerRoleCount} documents...`
        )
        while (await practitionerRoleCursor.hasNext()) {
          const practitionerRole = await practitionerRoleCursor.next()
          const systemRoles = 'http://opencrvs.org/specs/roles'
          const systemTypes = 'http://opencrvs.org/specs/types'
          const automatedCode = 'AUTOMATED'
          const fieldAgentCode = 'FIELD_AGENT'

          const roleCode = practitionerRole.code.filter(
            (c) => c.coding[0].system === systemRoles
          )[0].coding[0].code

          const titleCase = (code = '') =>
            code
              .replace(/_/g, ' ')
              .split(' ')
              .map((s) => capitalize(s))
              .join(' ')

          const hasSystemTypes = practitionerRole.code.some((item) => {
            return item.coding.some((coding) => {
              return coding.system === systemTypes
            })
          })

          const isAutomated = practitionerRole.code.some((item) => {
            return item.coding.some((coding) => {
              return (
                coding.system === systemRoles && coding.code === automatedCode
              )
            })
          })

          const isFieldAgent = practitionerRole.code.some((item) => {
            return item.coding.some((coding) => {
              return (
                coding.system === systemRoles && coding.code === fieldAgentCode
              )
            })
          })

          if (isAutomated) continue

          if (hasSystemTypes) {
            const typeCode = practitionerRole.code.filter(
              (c) => c.coding[0].system === systemTypes
            )[0].coding[0].code
            await db
              .collection('PractitionerRole')
              .updateOne(
                { id: practitionerRole.id },
                { $set: { 'code.1.coding.0.code': titleCase(typeCode) } }
              )
          } else {
            await db.collection('PractitionerRole').updateOne(
              { id: practitionerRole.id },
              {
                $push: {
                  code: {
                    coding: [
                      {
                        system: 'http://opencrvs.org/specs/types',
                        code: JSON.stringify(usersLabels[roleCode])
                      }
                    ]
                  }
                }
              }
            )
          }
        }
        skip += limit
        processedDocCount += count
        const percentage = (
          (processedDocCount / totalPractitionerRoleCount) *
          100
        ).toFixed(2)
        // eslint-disable-next-line no-console
        console.log(
          `Migration Up - PractitionerRole :: Processing done ${percentage}%`
        )
      }
    })
  } finally {
    await session.endSession()
  }
}

export const down = async (db, client) => {
  const session = client.startSession()
  const limit = 10
  let skip = 0
  let processedDocCount = 0
  try {
    await session.withTransaction(async () => {
      const totalPractitionerRoleCount = await getTotalDocCountByCollectionName(
        db,
        'PractitionerRole'
      )
      while (totalPractitionerRoleCount > processedDocCount) {
        const practitionerRoleCursor = await getPractitionerRoleCursor(
          db,
          limit,
          skip
        )
        const count = await practitionerRoleCursor.count()
        // eslint-disable-next-line no-console
        console.log(
          `Migration Down - PractitionerRole :: Processing ${
            processedDocCount + 1
          } - ${
            processedDocCount + count
          } of ${totalPractitionerRoleCount} documents...`
        )
        while (await practitionerRoleCursor.hasNext()) {
          const practitionerRole = await practitionerRoleCursor.next()
          const systemRoles = 'http://opencrvs.org/specs/roles'
          const automatedCode = 'AUTOMATED'
          const fieldAgentCode = 'FIELD_AGENT'

          const isAutomated = practitionerRole.code.some((item) => {
            return item.coding.some((coding) => {
              return (
                coding.system === systemRoles && coding.code === automatedCode
              )
            })
          })

          const isFieldAgent = practitionerRole.code.some((item) => {
            return item.coding.some((coding) => {
              return (
                coding.system === systemRoles && coding.code === fieldAgentCode
              )
            })
          })

          const roleCode = isFieldAgent ? 'SOCIAL_WORKER' : ''

          if (!isAutomated) {
            await db
              .collection('PractitionerRole')
              .updateOne(
                { id: practitionerRole.id },
                { $set: { 'code.1.coding.0.code': roleCode } }
              )
          }
        }
        skip += limit
        processedDocCount += count
        const percentage = (
          (processedDocCount / totalPractitionerRoleCount) *
          100
        ).toFixed(2)
        // eslint-disable-next-line no-console
        console.log(
          `Migration Down - PractitionerRole :: Processing done ${percentage}%`
        )
      }
    })
  } finally {
    await session.endSession()
  }
}

export async function getPractitionerRoleCursor(db, limit = 50, skip = 0) {
  return db.collection('PractitionerRole').find({}, { limit, skip })
}

export async function getTotalDocCountByCollectionName(db, collectionName) {
  return await db.collection(collectionName).count()
}
