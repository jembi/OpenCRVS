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
import {
  findPatientIdentifier,
  Patient,
  SUPPORTED_PATIENT_IDENTIFIER_CODES,
  CERTIFIED_STATUS,
  REGISTERED_STATUS,
  ISSUED_STATUS,
  DECLARED_STATUS,
  REJECTED_STATUS,
  VALIDATED_STATUS
} from '@opencrvs/commons/types'
import { IAdvancedSearchParam } from '@search/features/search/types'
import { transformDeprecatedParamsToSupported } from './deprecation-support'
import { resolveLocationChildren } from './location'
import { UUID } from '@opencrvs/commons'
import {
  QueryDslQueryContainer,
  SearchRequest
} from '@elastic/elasticsearch/lib/api/types'

export async function advancedQueryBuilder(
  params: IAdvancedSearchParam,
  createdBy: string,
  isExternalSearch: boolean
) {
  params = transformDeprecatedParamsToSupported(params)

  const must: QueryDslQueryContainer[] = []
  // filter is used for "pure" filtering, without caring about scores
  const filter: QueryDslQueryContainer[] = []

  if (params.name) {
    must.push({
      multi_match: {
        query: params.name,
        fields: [
          'childFirstNames',
          'childFamilyName',
          'motherFirstNames',
          'motherFamilyName',
          'fatherFirstNames',
          'fatherFamilyName',
          'informantFirstNames',
          'informantFamilyName',
          'deceasedFirstNames',
          'deceasedFamilyName',
          'spouseFirstNames',
          'spouseFamilyName',
          'brideFirstNames',
          'brideFamilyName',
          'groomFirstNames',
          'groomFamilyName',
          'witnessOneFirstNames',
          'witnessOneFamilyName',
          'witnessTwoFirstNames',
          'witnessTwoFamilyName'
        ],
        fuzziness: 'AUTO'
      }
    })
  }

  if (params.event && params.event.length > 0) {
    const shouldMatch: QueryDslQueryContainer[] = []
    for (const { eventName, jurisdictionId } of params.event) {
      if (jurisdictionId) {
        const leafLevelJurisdictionIds = await resolveLocationChildren(
          jurisdictionId as UUID
        )
        shouldMatch.push({
          bool: {
            must: [
              {
                term: {
                  'event.keyword': eventName
                }
              },
              {
                terms: {
                  'declarationJurisdictionIds.keyword': leafLevelJurisdictionIds
                }
              }
            ]
          }
        })
      } else {
        shouldMatch.push({
          term: {
            'event.keyword': eventName
          }
        })
      }
    }

    filter.push({
      bool: {
        should: shouldMatch
      }
    })
  }

  if (
    (params.registrationStatuses && params.registrationStatuses.length > 0) ||
    isExternalSearch
  ) {
    must.push({
      query_string: {
        default_field: 'type',
        query: isExternalSearch
          ? `(${REGISTERED_STATUS}) OR (${CERTIFIED_STATUS}) OR (${ISSUED_STATUS}) OR (${DECLARED_STATUS}) OR (${REJECTED_STATUS}) OR (${VALIDATED_STATUS})`
          : `(${params.registrationStatuses!.join(') OR (')})`
      }
    })
  }

  if (
    !params.dateOfEventStart &&
    !params.dateOfEventEnd &&
    params.dateOfEvent
  ) {
    must.push({
      match: {
        deathDate: params.dateOfEvent
      }
    })
  }

  if (params.dateOfEventStart || params.dateOfEventEnd) {
    if (!params.dateOfEventStart) {
      throw new Error(
        'dateOfEventStart must be provided along with dateOfEventEnd'
      )
    }
    if (!params.dateOfEventEnd) {
      throw new Error(
        'dateOfEventEnd must be provided along with dateOfEventStart'
      )
    }

    must.push({
      range: {
        deathDate: {
          gte: params.dateOfEventStart,
          lte: params.dateOfEventEnd
        }
      }
    })
  }

  if (
    !params.dateOfRegistrationStart &&
    !params.dateOfRegistrationEnd &&
    params.dateOfRegistration
  ) {
    must.push({
      match: {
        dateOfDeclaration: params.dateOfRegistration
      }
    })
  }

  if (params.dateOfRegistrationStart || params.dateOfRegistrationEnd) {
    if (!params.dateOfRegistrationStart) {
      throw new Error(
        'dateOfRegistrationStart  must be provided along with dateOfRegistrationEnd'
      )
    }

    if (!params.dateOfRegistrationEnd) {
      throw new Error(
        'dateOfRegistrationEnd  must be provided along with dateOfRegistrationStart'
      )
    }

    must.push({
      range: {
        dateOfDeclaration: {
          gte: params.dateOfRegistrationStart,
          lte: params.dateOfRegistrationEnd
        }
      }
    })
  }

  if (params.timePeriodFrom) {
    must.push({
      range: {
        lastStatusChangedAt: {
          gte: new Date(params.timePeriodFrom).getTime(),
          lte: Date.now()
        }
      }
    })
  }

  if (params.declarationLocationId) {
    must.push({
      match: {
        declarationLocationId: {
          query: params.declarationLocationId,
          boost: 2.0
        }
      }
    })
  }

  if (params.declarationJurisdictionId) {
    const leafLevelJurisdictionIds = await resolveLocationChildren(
      params.declarationJurisdictionId
    )
    must.push({
      terms: {
        'declarationJurisdictionIds.keyword': leafLevelJurisdictionIds
      }
    })
  }

  if (params.eventLocationId) {
    must.push({
      match: {
        eventLocationId: params.eventLocationId
      }
    })
  }

  if (params.eventCountry) {
    must.push({
      match: {
        eventCountry: params.eventCountry
      }
    })
  }

  if (params.eventJurisdictionId) {
    const leafLevelJurisdictionIds = await resolveLocationChildren(
      params.eventJurisdictionId
    )
    must.push({
      terms: {
        'eventJurisdictionIds.keyword': leafLevelJurisdictionIds
      }
    })
  }

  if (params.childFirstNames) {
    must.push({
      multi_match: {
        query: params.childFirstNames,
        fields: ['childFirstNames'],
        fuzziness: 'AUTO'
      }
    })
  }

  if (params.childLastName) {
    must.push({
      multi_match: {
        query: params.childLastName,
        fields: 'childFamilyName',
        fuzziness: 'AUTO'
      }
    })
  }

  if (params.groomFirstNames) {
    must.push({
      multi_match: {
        query: params.groomFirstNames,
        fields: 'groomFirstNames',
        fuzziness: 'AUTO'
      }
    })
  }

  if (params.groomFamilyName) {
    must.push({
      multi_match: {
        query: params.groomFamilyName,
        fields: 'groomFamilyName',
        fuzziness: 'AUTO'
      }
    })
  }

  if (params.brideFirstNames) {
    must.push({
      multi_match: {
        query: params.brideFirstNames,
        fields: 'brideFirstNames',
        fuzziness: 'AUTO'
      }
    })
  }

  if (params.brideFamilyName) {
    must.push({
      multi_match: {
        query: params.brideFamilyName,
        fields: 'brideFamilyName',
        fuzziness: 'AUTO'
      }
    })
  }

  if (params.brideIdentifier) {
    must.push({
      match: {
        brideIdentifier: params.brideIdentifier
      }
    })
  }

  if (params.groomIdentifier) {
    must.push({
      match: {
        groomIdentifier: params.groomIdentifier
      }
    })
  }

  if (params.dateOfMarriage) {
    must.push({
      multi_match: {
        query: params.dateOfMarriage,
        fields: 'marriageDate'
      }
    })
  }

  if (!params.brideDoBStart && !params.brideDoBEnd && params.brideDoB) {
    must.push({
      match: {
        brideDoB: params.brideDoB
      }
    })
  }

  if (params.brideDoBStart || params.brideDoBEnd) {
    if (!params.brideDoBStart) {
      throw new Error('brideDoBStart must be provided along with brideDoBEnd')
    }
    if (!params.brideDoBEnd) {
      throw new Error('brideDoBEnd must be provided along with brideDoBStart')
    }

    must.push({
      range: {
        brideDoB: {
          gte: params.brideDoBStart,
          lte: params.brideDoBEnd
        }
      }
    })
  }

  if (!params.groomDoBStart && !params.groomDoBEnd && params.groomDoB) {
    must.push({
      match: {
        groomDoB: params.groomDoB
      }
    })
  }

  if (params.groomDoBStart || params.groomDoBEnd) {
    if (!params.groomDoBStart) {
      throw new Error('groomDoBStart must be provided along with groomDoBEnd')
    }
    if (!params.groomDoBEnd) {
      throw new Error('groomDoBEnd must be provided along with groomDoBStart')
    }

    must.push({
      range: {
        groomDoB: {
          gte: params.groomDoBStart,
          lte: params.groomDoBEnd
        }
      }
    })
  }

  if (!params.childDoBStart && !params.childDoBEnd && params.childDoB) {
    must.push({
      match: {
        childDoB: params.childDoB
      }
    })
  }

  if (params.childDoBStart || params.childDoBEnd) {
    if (!params.childDoBStart) {
      throw new Error('childDoBStart must be provided along with childDoBEnd')
    }
    if (!params.childDoBEnd) {
      throw new Error('childDoBEnd must be provided along with childDoBStart')
    }

    must.push({
      range: {
        childDoB: {
          gte: params.childDoBStart,
          lte: params.childDoBEnd
        }
      }
    })
  }

  if (params.childGender) {
    must.push({
      match: {
        gender: params.childGender
      }
    })
  }

  if (params.deceasedFirstNames) {
    must.push({
      multi_match: {
        query: params.deceasedFirstNames,
        fields: 'deceasedFirstNames',
        fuzziness: 'AUTO'
      }
    })
  }

  if (params.deceasedFamilyName) {
    must.push({
      multi_match: {
        query: params.deceasedFamilyName,
        fields: 'deceasedFamilyName',
        fuzziness: 'AUTO'
      }
    })
  }

  if (params.deceasedGender) {
    must.push({
      match: {
        gender: params.deceasedGender
      }
    })
  }

  if (
    !params.deceasedDoBStart &&
    !params.deceasedDoBEnd &&
    params.deceasedDoB
  ) {
    must.push({
      match: {
        deceasedDoB: params.deceasedDoB
      }
    })
  }

  if (params.deceasedDoBStart || params.deceasedDoBEnd) {
    if (!params.deceasedDoBStart) {
      throw new Error(
        'deceasedDoBStart must be provided along with deceasedDoBEnd'
      )
    }
    if (!params.deceasedDoBEnd) {
      throw new Error(
        'deceasedDoBEnd must be provided along with deceasedDoBStart'
      )
    }

    must.push({
      range: {
        deceasedDoB: {
          gte: params.deceasedDoBStart,
          lte: params.deceasedDoBEnd
        }
      }
    })
  }

  if (params.deceasedIdentifier) {
    must.push({
      match: {
        deceasedIdentifier: params.deceasedIdentifier
      }
    })
  }

  if (params.spouseIdentifier) {
    must.push({
      match: {
        spouseIdentifier: params.spouseIdentifier
      }
    })
  }

  if (params.motherFirstNames) {
    must.push({
      multi_match: {
        query: params.motherFirstNames,
        fields: 'motherFirstNames',
        fuzziness: 'AUTO'
      }
    })
  }

  if (params.motherFamilyName) {
    must.push({
      multi_match: {
        query: params.motherFamilyName,
        fields: 'motherFamilyName',
        fuzziness: 'AUTO'
      }
    })
  }

  if (!params.motherDoBStart && !params.motherDoBEnd && params.motherDoB) {
    must.push({
      match: {
        motherDoB: params.motherDoB
      }
    })
  }

  if (params.motherDoBStart || params.motherDoBEnd) {
    if (!params.motherDoBStart) {
      throw new Error('motherDoBStart must be provided along with motherDoBEnd')
    }
    if (!params.motherDoBEnd) {
      throw new Error('motherDoBEnd must be provided along with motherDoBStart')
    }

    must.push({
      range: {
        motherDoB: {
          gte: params.motherDoBStart,
          lte: params.motherDoBEnd
        }
      }
    })
  }

  if (params.childIdentifier) {
    must.push({
      match: {
        childIdentifier: params.childIdentifier
      }
    })
  }

  if (params.motherIdentifier) {
    must.push({
      match: {
        motherIdentifier: params.motherIdentifier
      }
    })
  }

  if (params.fatherFirstNames) {
    must.push({
      multi_match: {
        query: params.fatherFirstNames,
        fields: 'fatherFirstNames',
        fuzziness: 'AUTO'
      }
    })
  }

  if (params.fatherFamilyName) {
    must.push({
      multi_match: {
        query: params.fatherFamilyName,
        fields: 'fatherFamilyName',
        fuzziness: 'AUTO'
      }
    })
  }

  if (!params.fatherDoBStart && !params.fatherDoBEnd && params.fatherDoB) {
    must.push({
      match: {
        fatherDoB: params.fatherDoB
      }
    })
  }

  if (params.fatherDoBStart || params.fatherDoBEnd) {
    if (!params.fatherDoBStart) {
      throw new Error('fatherDoBStart must be provided along with fatherDoBEnd')
    }
    if (!params.fatherDoBEnd) {
      throw new Error('fatherDoBEnd must be provided along with fatherDoBStart')
    }

    must.push({
      range: {
        fatherDoB: {
          gte: params.fatherDoBStart,
          lte: params.fatherDoBEnd
        }
      }
    })
  }

  if (params.fatherIdentifier) {
    must.push({
      match: {
        fatherIdentifier: params.fatherIdentifier
      }
    })
  }

  if (params.informantFirstNames) {
    must.push({
      multi_match: {
        query: params.informantFirstNames,
        fields: 'informantFirstNames',
        fuzziness: 'AUTO'
      }
    })
  }

  if (params.informantFamilyName) {
    must.push({
      multi_match: {
        query: params.informantFamilyName,
        fields: 'informantFamilyName',
        fuzziness: 'AUTO'
      }
    })
  }

  if (
    !params.informantDoBStart &&
    !params.informantDoBEnd &&
    params.informantDoB
  ) {
    must.push({
      match: {
        informantDoB: params.informantDoB
      }
    })
  }

  if (params.informantDoBStart || params.informantDoBEnd) {
    if (!params.informantDoBStart) {
      throw new Error(
        'informantDoBStart must be provided along with informantDoBEnd'
      )
    }
    if (!params.informantDoBEnd) {
      throw new Error(
        'informantDoBEnd must be provided along with informantDoBStart'
      )
    }

    must.push({
      range: {
        informantDoB: {
          gte: params.informantDoBStart,
          lte: params.informantDoBEnd
        }
      }
    })
  }

  if (params.informantIdentifier) {
    must.push({
      match: {
        informantIdentifier: params.informantIdentifier
      }
    })
  }

  if (params.contactNumber) {
    must.push({
      match: {
        contactNumber: params.contactNumber
      }
    })
  }

  if (params.contactEmail) {
    must.push({
      terms: {
        'contactEmail.keyword': [params.contactEmail]
      }
    })
  }

  if (params.registrationNumber) {
    must.push({
      match: {
        registrationNumber: params.registrationNumber
      }
    })
  }

  if (params.trackingId) {
    must.push({
      match: {
        trackingId: params.trackingId
      }
    })
  }

  if (params.recordId) {
    must.push({
      match: {
        _id: params.recordId
      }
    })
  }

  if (params.nationalId) {
    must.push({
      bool: {
        should: [
          {
            match: {
              childIdentifier: params.nationalId
            }
          },
          {
            match: {
              motherIdentifier: params.nationalId
            }
          },
          {
            match: {
              fatherIdentifier: params.nationalId
            }
          },
          {
            match: {
              informantIdentifier: params.nationalId
            }
          },
          {
            match: {
              deceasedIdentifier: params.nationalId
            }
          },
          {
            match: {
              brideIdentifier: params.nationalId
            }
          },
          {
            match: {
              groomIdentifier: params.nationalId
            }
          },
          {
            match: {
              spouseIdentifier: params.nationalId
            }
          }
        ]
      }
    })
  }

  if (createdBy) {
    must.push({
      term: {
        'createdBy.keyword': {
          value: createdBy
        }
      }
    })
  }

  if (params.compositionType) {
    must.push({
      terms: {
        'compositionType.keyword': params.compositionType
      }
    })
  }

  return {
    bool: {
      must,
      filter
    }
  } satisfies SearchRequest['query']
}

export const findPatientPrimaryIdentifier = (patient: Patient) =>
  findPatientIdentifier(
    patient,
    SUPPORTED_PATIENT_IDENTIFIER_CODES.filter((code) =>
      [
        'PASSPORT',
        'NATIONAL_ID',
        'DECEASED_PATIENT_ENTRY',
        'BIRTH_PATIENT_ENTRY',
        'DRIVING_LICENSE',
        'REFUGEE_NUMBER',
        'ALIEN_NUMBER',
        'OTHER',
        'SOCIAL_SECURITY_NO'
      ].includes(code)
    )
  ) ??
  // return registration numbers with a lower priority
  findPatientIdentifier(
    patient,
    SUPPORTED_PATIENT_IDENTIFIER_CODES.filter((code) =>
      [
        'BIRTH_REGISTRATION_NUMBER',
        'DEATH_REGISTRATION_NUMBER',
        'MARRIAGE_REGISTRATION_NUMBER'
      ].includes(code)
    )
  )
