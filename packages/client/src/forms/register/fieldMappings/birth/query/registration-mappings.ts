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
  IFormData,
  TransformedData,
  IFormField,
  IFormFieldQueryMapFunction,
  IQuestionnaireQuestion
} from '@client/forms'
import { REGISTRATION_SECTION } from '@client/forms/mappings/query'
import { userMessages } from '@client/i18n/messages'
import { IOfflineData } from '@client/offline/reducer'
import { getUserName } from '@client/pdfRenderer/transformer/userTransformer'
import format from '@client/utils/date-formatting'
import {
  BirthRegistration,
  ContactPointInput,
  Event,
  History,
  RegStatus
} from '@client/utils/gateway'
import { IUserDetails } from '@client/utils/userUtils'
import {
  GQLRegStatus,
  GQLRegWorkflow
} from '@opencrvs/gateway/src/graphql/schema'
import { callingCountries } from 'country-data'
import { cloneDeep, get } from 'lodash'
import { MessageDescriptor } from 'react-intl'

import QRCode from 'qrcode'
import { formatUrl } from '@client/navigation'
import { DECLARATION_RECORD_AUDIT } from '@client/navigation/routes'

export function transformStatusData(
  transformedData: IFormData,
  statusData: GQLRegWorkflow[],
  sectionId: string
) {
  const registrationStatus =
    statusData &&
    statusData.find((status) => {
      return status.type && (status.type as GQLRegStatus) === 'REGISTERED'
    })
  transformedData[sectionId] = {
    ...transformedData[sectionId],
    commentsOrNotes:
      (statusData &&
        statusData[0] &&
        statusData[0].comments &&
        statusData[0].comments[0] &&
        statusData[0].comments[0].comment) ||
      ''
  }

  if (!registrationStatus) {
    return transformedData
  }
  transformedData[sectionId] = {
    ...transformedData[sectionId],
    regStatus: {
      type: registrationStatus.type || '',
      statusDate: registrationStatus.timestamp,
      officeName:
        (registrationStatus.office && registrationStatus.office.name) || '',
      officeAlias:
        (registrationStatus.office &&
          registrationStatus.office.alias &&
          registrationStatus.office.alias.join(' ')) ||
        '',
      officeAddressLevel3:
        (registrationStatus.office &&
          registrationStatus.office.address &&
          registrationStatus.office.address.district) ||
        '',
      officeAddressLevel4:
        (registrationStatus.office &&
          registrationStatus.office.address &&
          registrationStatus.office.address.state) ||
        ''
    }
  }
  return transformedData
}

export function getBirthRegistrationSectionTransformer(
  transformedData: IFormData,
  queryData: any,
  sectionId: string
) {
  if (queryData[sectionId].trackingId) {
    transformedData[sectionId].trackingId = queryData[sectionId].trackingId
  }

  if (queryData[sectionId].registrationNumber) {
    transformedData[sectionId].registrationNumber =
      queryData[sectionId].registrationNumber
  }

  if (queryData[sectionId].type && queryData[sectionId].type === 'BIRTH') {
    transformedData[sectionId].type = Event.Birth
  }

  if (queryData[sectionId].status) {
    transformStatusData(
      transformedData,
      queryData[sectionId].status as GQLRegWorkflow[],
      sectionId
    )
  }
}

export function registrationNumberTransformer(
  transformedData: IFormData,
  queryData: any,
  sectionId: string,
  targetSectionId?: string,
  targetFieldName?: string
) {
  if (queryData[sectionId].registrationNumber) {
    transformedData[targetSectionId || sectionId][
      targetFieldName || 'registrationNumber'
    ] = queryData[sectionId].registrationNumber
  }
}

export const certificateDateTransformer =
  (locale: string, dateFormat: string) =>
  (
    transformedData: IFormData,
    _: any,
    sectionId: string,
    targetSectionId?: string,
    targetFieldName?: string
  ) => {
    const prevLocale = window.__localeId__
    window.__localeId__ = locale
    transformedData[targetSectionId || sectionId][
      targetFieldName || 'certificateDate'
    ] = format(new Date(), dateFormat)
    window.__localeId__ = prevLocale
  }

const convertToLocal = (
  mobileWithCountryCode: string,
  country: string,
  codeReplacement?: string
) => {
  /*
   *  If country is the fictional demo country (Farajaland), use Zambian number format
   */
  const countryCode =
    country.toUpperCase() === 'FAR' ? 'ZMB' : country.toUpperCase()

  return (
    mobileWithCountryCode &&
    mobileWithCountryCode.replace(
      callingCountries[countryCode].countryCallingCodes[0],
      codeReplacement ? codeReplacement : '0'
    )
  )
}

export const telecomToFieldTransformer =
  () =>
  (
    transformedData: IFormData,
    queryData: any,
    sectionId: string,
    field: IFormField
  ) => {
    const telecom = queryData[sectionId]?.telecom as
      | ContactPointInput[]
      | undefined
    if (telecom && telecom[0].value) {
      transformedData[sectionId][field.name] = convertToLocal(
        telecom[0].value,
        window.config.COUNTRY
      )
    }

    return transformedData
  }

export const localPhoneTransformer =
  (transformedFieldName?: string, codeReplacement?: string) =>
  (
    transformedData: TransformedData,
    queryData: IFormData,
    sectionId: string,
    field: IFormField
  ) => {
    const fieldName = transformedFieldName || field.name
    const msisdnPhone = get(queryData, fieldName as string) as unknown as string
    const localPhone = convertToLocal(
      msisdnPhone,
      window.config.COUNTRY,
      codeReplacement
    )
    transformedData[sectionId][field.name] = localPhone
    return transformedData
  }

export const changeHirerchyQueryTransformer =
  (
    transformedFieldName?: string,
    transformerMethod?: IFormFieldQueryMapFunction
  ) =>
  (
    transformedData: TransformedData,
    queryData: IFormData,
    sectionId: string,
    field: IFormField,
    nestedField: IFormField
  ) => {
    if (!nestedField && transformedFieldName) {
      transformedData[sectionId][field.name] = get(
        queryData,
        transformedFieldName
      )

      if (transformerMethod) {
        const clonedTransformedData = cloneDeep(transformedData)
        transformerMethod(clonedTransformedData, queryData, sectionId, field)

        transformedData[sectionId][field.name] =
          clonedTransformedData[sectionId][field.name]
      }

      return transformedData
    }

    if (transformedFieldName) {
      transformedData[sectionId][field.name]['nestedFields'][nestedField.name] =
        get(queryData, transformedFieldName)

      if (transformerMethod) {
        const clonedTransformedData = cloneDeep(transformedData)
        transformerMethod(clonedTransformedData, queryData, sectionId, field)

        transformedData[sectionId][field.name]['nestedFields'][
          nestedField.name
        ] = clonedTransformedData[sectionId][field.name]
      }
    } else {
      transformedData[sectionId][field.name]['nestedFields'][nestedField.name] =
        get(queryData, `${sectionId}.${nestedField.name}`)
    }

    return transformedData
  }

export function questionnaireToCustomFieldTransformer(
  transformedData: IFormData,
  queryData: any,
  sectionId: string,
  field: IFormField
) {
  if (queryData.questionnaire) {
    const selectedQuestion: IQuestionnaireQuestion =
      queryData.questionnaire.filter(
        (question: IQuestionnaireQuestion) =>
          question.fieldId === field.customQuesstionMappingId
      )[0]
    if (selectedQuestion) {
      transformedData[sectionId][field.name] = selectedQuestion.value
    }
  }
}

export const registrationDateTransformer = (
  transformedData: IFormData,
  _: any,
  sectionId: string,
  targetSectionId?: string,
  targetFieldName?: string,
  __?: IOfflineData
) => {
  if (!_.history) {
    return
  }

  const history = _.history.find(
    (historyItem: History) => historyItem?.action === RegStatus.Registered
  )

  transformedData[targetSectionId || sectionId][
    targetFieldName || 'registrationDate'
  ] = format(new Date(history.date), 'dd MMMM yyyy')
}

export const registrarNameUserTransformer = (
  transformedData: IFormData,
  _: any,
  sectionId: string,
  targetSectionId?: string,
  targetFieldName?: string,
  __?: IOfflineData,
  userDetails?: IUserDetails
) => {
  if (!_.history) {
    return
  }

  const history = _.history.find(
    (historyItem: History) => historyItem?.action === RegStatus.Registered
  )
  transformedData[targetSectionId || sectionId][targetFieldName || 'userName'] =
    history?.user ? getUserName(history.user) : ''
}

export const placeOfBirthLocalityTransformer = (
  transformedData: IFormData,
  registration: BirthRegistration,
  sectionId: string,
  targetSectionId?: string,
  targetFieldName?: string
) => {
  const city = registration.eventLocation?.address?.city

  if (!city) {
    return
  }

  transformedData[targetSectionId || sectionId][
    targetFieldName || 'placeOfBirthLocality'
  ] = city
}

export const placeOfBirthStateTransformer = (
  transformedData: IFormData,
  registration: BirthRegistration,
  sectionId: string,
  targetSectionId?: string,
  targetFieldName?: string,
  offlineData?: IOfflineData
) => {
  const stateId = registration.eventLocation?.address?.state
  if (!stateId) {
    return
  }

  const state = offlineData?.locations[stateId]

  if (!state) {
    return
  }
  transformedData[targetSectionId || sectionId][
    targetFieldName || 'placeOfBirthState'
  ] = state.name
}
export const placeOfBirthLGATransformer = (
  transformedData: IFormData,
  registration: BirthRegistration,
  sectionId: string,
  targetSectionId?: string,
  targetFieldName?: string,
  offlineData?: IOfflineData
) => {
  const lgaId = registration.eventLocation?.address?.district

  if (!lgaId) {
    return
  }
  const lga = offlineData?.locations[lgaId]

  if (!lga) {
    return
  }

  transformedData[targetSectionId || sectionId][
    targetFieldName || 'placeOfBirthLGAState'
  ] = lga.name
}

export const roleUserTransformer = (
  transformedData: IFormData,
  _: any,
  sectionId: string,
  targetSectionId?: string,
  targetFieldName?: string,
  __?: IOfflineData,
  userDetails?: IUserDetails
) => {
  if (!_.history) {
    return
  }

  const history = _.history.find(
    (historyItem: History) => historyItem?.action === RegStatus.Registered
  )

  transformedData[targetSectionId || sectionId][targetFieldName || 'role'] =
    history?.user?.role
      ? (userMessages[history.user.role] as MessageDescriptor &
          Record<string, string>)
      : ''
}

export const registrationLocationUserTransformer =
  (template: string) =>
  (
    transformedData: IFormData,
    queryData: any,
    sectionId: string,
    targetSectionId?: string,
    targetFieldName?: string
  ) => {
    const statusData = queryData[REGISTRATION_SECTION]
      .status as GQLRegWorkflow[]
    const registrationStatus =
      statusData &&
      statusData.find((status) => {
        return status.type && (status.type as GQLRegStatus) === 'REGISTERED'
      })
    const officeName = registrationStatus?.office?.name || ''
    const officeAddressLevel3 =
      registrationStatus?.office?.address?.district || ''
    const officeAddressLevel4 = registrationStatus?.office?.address?.state || ''
    transformedData[targetSectionId || sectionId][
      targetFieldName || 'registrationOffice'
    ] = template
      .replace(':office', officeName)
      .replace(':district', officeAddressLevel3)
      .replace(':state', officeAddressLevel4)
  }

export const registrarSignatureUserTransformer = (
  transformedData: IFormData,
  _: any,
  sectionId: string,
  targetSectionId?: string,
  targetFieldName?: string,
  __?: IOfflineData,
  userDetails?: IUserDetails
) => {
  if (!_.history) {
    return
  }

  const history = _.history.find(
    (historyItem: History) => historyItem?.action === RegStatus.Registered
  )

  transformedData[targetSectionId || sectionId][
    targetFieldName || 'registrationOffice'
  ] = history?.signature?.data as string
}
export const QRCodeTransformerTransformer = async (
  transformedData: IFormData,
  queryData: { id: string },
  sectionId: string,
  targetSectionId?: string,
  targetFieldName?: string,
  __?: IOfflineData
) => {
  transformedData[targetSectionId || sectionId][targetFieldName || 'qrCode'] =
    await QRCode.toDataURL(
      `${window.location.protocol}//${window.location.host}${formatUrl(
        DECLARATION_RECORD_AUDIT,
        {
          tab: 'printTab',
          declarationId: queryData.id
        }
      )}`
    )
}
