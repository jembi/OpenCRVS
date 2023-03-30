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
import {
  GQLBirthEventSearchSet,
  GQLDeathEventSearchSet,
  GQLEventSearchSet,
  GQLHumanName,
  GQLMarriageEventSearchSet,
  GQLRegStatus
} from '@opencrvs/gateway/src/graphql/schema'
import { IntlShape } from 'react-intl'
import { createNamesMap } from '@client/utils/data-formatting'
import { formatLongDate } from '@client/utils/date-formatting'
import { HumanName, SearchEventsQuery } from '@client/utils/gateway'
import { EMPTY_STRING, LANG_EN } from '@client/utils/constants'
import { ITaskHistory } from '@client/declarations'

export const transformData = (
  data: SearchEventsQuery['searchEvents'],
  intl: IntlShape
) => {
  const { locale } = intl
  if (!data || !data.results) {
    return []
  }

  return data.results
    .filter((req): req is GQLEventSearchSet => req !== null)
    .map((reg: GQLEventSearchSet) => {
      let birthReg
      let deathReg
      let marriageReg
      let names
      let groomNames
      let brideNames
      let mergedMarriageName
      let dateOfEvent
      const assignedReg = reg as GQLEventSearchSet
      if (assignedReg.registration && assignedReg.type === 'Birth') {
        birthReg = reg as GQLBirthEventSearchSet
        names = (birthReg && (birthReg.childName as GQLHumanName[])) || []
        dateOfEvent = birthReg && birthReg.dateOfBirth
      } else if (assignedReg.registration && assignedReg.type === 'Death') {
        deathReg = reg as GQLDeathEventSearchSet
        names = (deathReg && (deathReg.deceasedName as GQLHumanName[])) || []
        dateOfEvent = deathReg && deathReg.dateOfDeath
      } else {
        marriageReg = reg as GQLMarriageEventSearchSet
        groomNames =
          (marriageReg && (marriageReg.groomName as GQLHumanName[])) || []
        brideNames =
          (marriageReg && (marriageReg.brideName as GQLHumanName[])) || []

        const groomName =
          (createNamesMap(groomNames as HumanName[])[locale] as string) ||
          (createNamesMap(groomNames as HumanName[])[LANG_EN] as string)
        const brideName =
          (createNamesMap(brideNames as HumanName[])[locale] as string) ||
          (createNamesMap(brideNames as HumanName[])[LANG_EN] as string)

        mergedMarriageName =
          brideName && groomName
            ? `${groomName} & ${brideName}`
            : brideName || groomName || EMPTY_STRING

        dateOfEvent = marriageReg && marriageReg.dateOfMarriage
      }
      const status =
        assignedReg.registration &&
        (assignedReg.registration.status as GQLRegStatus)

      return {
        id: assignedReg.id,
        name:
          assignedReg.type === 'Marriage'
            ? mergedMarriageName
            : (createNamesMap(names as HumanName[])[locale] as string) ||
              (createNamesMap(names as HumanName[])[LANG_EN] as string) ||
              '',
        dob:
          (birthReg?.dateOfBirth?.length &&
            formatLongDate(birthReg.dateOfBirth, locale)) ||
          '',
        dod:
          (deathReg?.dateOfDeath?.length &&
            formatLongDate(deathReg.dateOfDeath, locale)) ||
          '',
        dateOfEvent,
        registrationNumber:
          (assignedReg.registration &&
            assignedReg.registration.registrationNumber) ||
          '',
        trackingId:
          (assignedReg.registration && assignedReg.registration.trackingId) ||
          '',
        event: assignedReg.type || '',
        declarationStatus: status || '',
        contactNumber:
          (assignedReg.registration &&
            assignedReg.registration.contactNumber) ||
          '',
        duplicates:
          (assignedReg.registration && assignedReg.registration.duplicates) ||
          [],
        rejectionReasons:
          (status === 'REJECTED' &&
            assignedReg.registration &&
            assignedReg.registration.reason) ||
          '',
        rejectionComment:
          (status === 'REJECTED' &&
            assignedReg.registration &&
            assignedReg.registration.comment) ||
          '',
        createdAt: assignedReg?.registration?.createdAt,
        assignment: assignedReg?.registration?.assignment as Record<
          string,
          unknown
        >,
        modifiedAt:
          assignedReg.registration &&
          (assignedReg.registration.modifiedAt ||
            assignedReg.registration.createdAt),
        operationHistories: assignedReg.operationHistories as ITaskHistory[]
      }
    })
}
