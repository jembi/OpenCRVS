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
  IFormField,
  IFormData,
  IFormFieldValue,
  IAttachment,
  TransformedData,
  IFormSectionData,
  IFormFieldMutationMapFunction
} from '@client/forms'
import { IdentityType } from '@client/utils/gateway'
import { set } from 'lodash'
import { convertToMSISDN } from '@client/forms/utils'

interface IPersonName {
  [key: string]: string
}

export const fieldToNameTransformer =
  (language: string, transformedFieldName?: string, toSectionId?: string) =>
  (
    transformedData: TransformedData,
    draftData: IFormData,
    sectionId: string,
    field: IFormField
  ) => {
    if (toSectionId && !transformedData[toSectionId]) {
      transformedData[toSectionId] = {}
    }
    const sectionData = transformedData[toSectionId ? toSectionId : sectionId]
    if (!sectionData.name) {
      sectionData.name = [
        {
          use: language
        }
      ]
    }
    let personName: IPersonName | undefined = (
      sectionData.name as [{ use: string }]
    ).find((name) => name.use === language)
    if (!personName) {
      personName = { use: language }
      sectionData.name.push(personName)
    }
    personName[!transformedFieldName ? field.name : transformedFieldName] =
      draftData[sectionId][field.name] as string

    return transformedData
  }

export function ignoreFieldTransformer(
  transformedData: TransformedData,
  draftData: IFormData,
  sectionId: string,
  field: IFormField
) {
  /* do nothing */
  return transformedData
}

export function fieldToArrayTransformer(
  transformedData: TransformedData,
  draftData: IFormData,
  sectionId: string,
  field: IFormField
) {
  transformedData[sectionId][field.name] = [draftData[sectionId][field.name]]
  return transformedData
}

export const fieldToIdentifierTransformer =
  (identifierField: string) =>
  (
    transformedData: TransformedData,
    draftData: IFormData,
    sectionId: string,
    field: IFormField
  ) => {
    const sectionData = transformedData[sectionId]
    if (!sectionData.identifier) {
      sectionData.identifier = [{}]
    }
    sectionData.identifier[0][identifierField] =
      draftData[sectionId][field.name]
    return transformedData
  }

export const fieldToIdentityTransformer =
  (identifierField: string, identityType: string) =>
  (
    transformedData: TransformedData,
    draftData: IFormData,
    sectionId: string,
    field: IFormField
  ) => {
    const sectionData = transformedData[sectionId]
    if (!sectionData.identifier) {
      sectionData.identifier = []
    }

    const existingIdentity = sectionData.identifier.find(
      (identifier: IdentityType) =>
        identifier.type && identifier.type === identityType
    )
    if (!existingIdentity) {
      sectionData.identifier.push({
        [identifierField]: draftData[sectionId][field.name],
        type: identityType
      })
    } else {
      existingIdentity[identifierField] = draftData[sectionId][field.name]
      existingIdentity.type = identityType
    }
    return transformedData
  }

export const nidVerificationFieldToIdentityTransformer = (
  transformedData: TransformedData,
  draftData: IFormData,
  sectionId: string,
  field: IFormField
) => {
  fieldToIdentityTransformer('id', 'MOSIP_PSUT_TOKEN_ID')(
    transformedData,
    draftData,
    sectionId,
    field
  )
  const sectionData = transformedData[sectionId]
  const existingIdentity = sectionData.identifier.find(
    (identifier: IdentityType) =>
      identifier.type && identifier.type === 'MOSIP_PSUT_TOKEN_ID'
  )
  if (existingIdentity) {
    const modifiedFields = draftData[sectionId][
      'fieldsModifiedByNidUserInfo'
    ] as string[] | undefined
    existingIdentity['fieldsModifiedByIdentity'] =
      modifiedFields?.join(',') ?? ''
  }
  return transformedData
}

interface IAddress {
  [key: string]: any
}

const getDefaultAddressLines = (): string[] =>
  Array.from({ length: 30 }, () => '')
// lines must be available as empty strings for GraphQL to parse all options
// TODO Putting 30 as the max for now until I have a better idea

export const addressMutationTransformer =
  (config: {
    useCase?: string
    lineNumber?: number
    transformedFieldName?: string
    isLowestAdministrativeLevel?: boolean
  }) =>
  (
    transformedData: TransformedData,
    draftData: IFormData,
    sectionId: string,
    field: IFormField
  ) => {
    const sectionData = transformedData[sectionId]

    if (!sectionData.address) {
      sectionData.address = []
    }
    let address: IAddress | undefined = (
      sectionData.address as [{ type: string; line: IFormFieldValue[] }]
    ).find((addr) => addr.type === config.useCase)
    if (!address) {
      address = {
        type: config.useCase,
        line: getDefaultAddressLines()
      }
      sectionData.address.push(address)
    }
    if (config.isLowestAdministrativeLevel) {
      address.partOf = draftData[sectionId][field.name]
    }
    if (config.lineNumber || config.lineNumber === 0) {
      address.line[config.lineNumber] = `${draftData[sectionId][field.name]}`
    } else if (config.transformedFieldName) {
      address[
        !config.transformedFieldName ? field.name : config.transformedFieldName
      ] = `${draftData[sectionId][field.name]}`
    }

    return transformedData
  }

export const eventLocationMutationTransformer =
  (config: {
    useCase?: string
    lineNumber?: number
    transformedFieldName?: string
    isLowestAdministrativeLevel?: boolean
  }) =>
  (
    transformedData: TransformedData,
    draftData: IFormData,
    sectionId: string,
    field: IFormField
  ) => {
    let defaultLocation: fhir.Location = {}
    if (
      (transformedData.eventLocation &&
        !transformedData.eventLocation.address) ||
      !transformedData.eventLocation
    ) {
      defaultLocation = {
        address: {
          country: '',
          state: '',
          district: '',
          city: '',
          postalCode: '',
          line: getDefaultAddressLines()
        }
      } as fhir.Location
      if (transformedData.eventLocation && transformedData.eventLocation.type) {
        defaultLocation['type'] = transformedData.eventLocation.type
      }
      transformedData.eventLocation = defaultLocation
    }
    if (config.isLowestAdministrativeLevel) {
      transformedData.eventLocation.address.partOf =
        draftData[sectionId][field.name]
    }
    if (config.lineNumber || config.lineNumber === 0) {
      transformedData.eventLocation.address.line[config.lineNumber] = `${
        draftData[sectionId][field.name]
      }`
    } else if (
      config.useCase &&
      field.name === config.useCase &&
      transformedData.eventLocation
    ) {
      transformedData.eventLocation.type = `${draftData[sectionId][field.name]}`
      if (
        transformedData.eventLocation.type === 'DECEASED_USUAL_RESIDENCE' &&
        transformedData.deceased.address &&
        transformedData.deceased.address[0]
      ) {
        transformedData.eventLocation.address =
          transformedData.deceased.address[0]
      }
    } else if (
      field.name === 'birthLocation' ||
      field.name === 'deathLocation'
    ) {
      transformedData.eventLocation._fhirID = draftData[sectionId][field.name]
      if (transformedData.eventLocation.address) {
        delete transformedData.eventLocation.address
      }
      if (transformedData.eventLocation.type) {
        delete transformedData.eventLocation.type
      }
    } else if (config.transformedFieldName) {
      transformedData.eventLocation.address[config.transformedFieldName] = `${
        draftData[sectionId][field.name]
      }`
    }
    return transformedData
  }

export const fieldNameTransformer =
  (transformedFieldName: string) =>
  (
    transformedData: TransformedData,
    draftData: IFormData,
    sectionId: string,
    field: IFormField
  ) => {
    transformedData[sectionId][transformedFieldName] =
      draftData[sectionId][field.name]
    return transformedData
  }

export const fieldValueSectionExchangeTransformer =
  (toSectionId: string, toSectionField?: string) =>
  (
    transformedData: TransformedData,
    draftData: IFormData,
    sectionId: string,
    field: IFormField
  ) => {
    if (!transformedData[toSectionId]) {
      transformedData[toSectionId] = {}
    }
    transformedData[toSectionId][toSectionField ? toSectionField : field.name] =
      draftData[sectionId][field.name]
    return transformedData
  }

export const sectionFieldToBundleFieldTransformer =
  (
    transformedFieldName?: string,
    transformerMethod?: IFormFieldMutationMapFunction
  ) =>
  (
    transformedData: TransformedData,
    draftData: IFormData,
    sectionId: string,
    field: IFormField
  ) => {
    const nestedFieldNames = transformedFieldName?.split('.') || []

    let currentData = transformedData
    for (let i = 0; i < nestedFieldNames.length - 1; i++) {
      const nestedFieldName = nestedFieldNames[i]
      if (!currentData[nestedFieldName]) {
        currentData[nestedFieldName] = {}
      }
      currentData = currentData[nestedFieldName]
    }

    const finalFieldName =
      nestedFieldNames?.[nestedFieldNames.length - 1] || field.name

    if (transformerMethod) {
      transformerMethod(transformedData, draftData, sectionId, field)
    } else {
      currentData[finalFieldName] = draftData[sectionId][field.name]
    }

    return transformedData
  }

export const nestedRadioFieldToBundleFieldTransformer =
  (transformedFieldName?: string) =>
  (
    transformedData: TransformedData,
    draftData: IFormData,
    sectionId: string,
    field: IFormField
  ) => {
    if (transformedFieldName) {
      set(
        transformedData,
        transformedFieldName,
        (draftData[sectionId][field.name] as IFormSectionData).value
      )
    } else {
      transformedData[field.name] = (
        draftData[sectionId][field.name] as IFormSectionData
      ).value
    }
    return transformedData
  }

export const copyEventAddressTransformer =
  (fromSection: string) =>
  (
    transformedData: TransformedData,
    draftData: IFormData,
    sectionId: string,
    field: IFormField
  ) => {
    if (
      draftData[sectionId][field.name] === 'OTHER' ||
      draftData[sectionId][field.name] === 'PRIVATE_HOME' ||
      draftData[sectionId][field.name] === 'HEALTH_FACILITY'
    ) {
      transformedData.eventLocation = { type: draftData[sectionId][field.name] }
      return transformedData
    }
    const fromSectionData = transformedData[fromSection]
    if (!fromSectionData.address) {
      return transformedData
    }
    const address = (fromSectionData.address as [fhir.Address]).find(
      (addr) => addr.type === draftData[sectionId][field.name]
    )
    if (!address) {
      return transformedData
    }

    transformedData.eventLocation = {
      address: {
        ...address
      } as fhir.Address
    } as fhir.Location

    transformedData.eventLocation.type = draftData[sectionId][field.name]
    if (address && address.line && address.line[5]) {
      transformedData.eventLocation.partOf = `Location/${address.line[5]}`
    }

    return transformedData
  }

export const copyAddressTransformer =
  (
    fromAddressType: string,
    fromSection: string,
    toAddressType: string,
    toSection: string,
    triggerValue = true,
    nodeName?: string
  ) =>
  (
    transformedData: TransformedData,
    draftData: IFormData,
    sectionId: string,
    field: IFormField
  ) => {
    if (draftData[sectionId][field.name] !== triggerValue) {
      return transformedData
    }

    let fromSectionData = transformedData[fromSection]
    if (nodeName) {
      fromSectionData = transformedData[fromSection][nodeName]
    }
    if (!fromSectionData.address) {
      throw new Error(
        `Address data not found on section copying from ${fromSection}`
      )
    }

    const fromAddress = fromSectionData.address
    const address = (fromAddress as [{ type: string }]).find(
      (addr) => addr.type === fromAddressType
    )
    if (!address) {
      throw new Error(
        `Address not found for given type: ${fromAddressType} on section ${fromSection}`
      )
    }
    const toSectionData = transformedData[toSection]
    if (!toSectionData.address) {
      toSectionData.address = []
    }
    let toAddress = (toSectionData.address as [{ type: string }]).find(
      (addr) => addr.type === toAddressType
    )
    if (toAddress) {
      toAddress = { ...address, type: toAddressType }
    } else {
      toAddress = {
        ...address,
        type: toAddressType
      }
      toSectionData.address.push(toAddress)
    }
    return transformedData
  }

export const sectionRemoveTransformer =
  (triggerValue = false) =>
  (
    transformedData: TransformedData,
    draftData: IFormData,
    sectionId: string,
    field: IFormField
  ) => {
    if (draftData[sectionId][field.name] !== triggerValue) {
      return transformedData
    }
    delete transformedData[sectionId]
    return transformedData
  }

export function fieldToCommentTransformer(
  transformedData: TransformedData,
  draftData: IFormData,
  sectionId: string,
  field: IFormField
) {
  transformedData[sectionId].status = [
    {
      comments: [
        {
          comment: draftData[sectionId][field.name] || '',
          createdAt: new Date()
        }
      ],
      timestamp: new Date()
    }
  ]
  return transformedData
}

export function fieldToAttachmentTransformer(
  transformedData: TransformedData,
  draftData: IFormData,
  sectionId: string,
  field: IFormField,
  alternateSectionId?: string
) {
  const attachments = (draftData[sectionId][field.name] as IAttachment[]).map(
    (attachment) => {
      return {
        ...(attachment.uri
          ? {
              uri: attachment.uri
            }
          : { data: attachment.data }),
        subject: attachment.optionValues[0],
        type: attachment.optionValues[1],
        contentType: attachment.type
      }
    }
  )
  if (attachments.length > 0) {
    const selectedSectionId = alternateSectionId
      ? alternateSectionId
      : sectionId
    if (!transformedData[selectedSectionId]) {
      transformedData[selectedSectionId] = {}
    }
    transformedData[selectedSectionId].attachments = transformedData[
      selectedSectionId
    ].attachments
      ? transformedData[selectedSectionId].attachments.concat(attachments)
      : attachments
  }
  return transformedData
}

export const fieldToPhoneNumberTransformer =
  (transformedSectionId?: string) =>
  (
    transformedData: TransformedData,
    draftData: IFormData,
    sectionId: string,
    field: IFormField
  ) => {
    transformedData[
      transformedSectionId ? transformedSectionId : sectionId
    ].telecom = [{ system: 'phone', value: draftData[sectionId][field.name] }]
    return transformedData
  }

export const fieldToIdentifierWithTypeTransformer =
  (identifierType: string) =>
  (
    transformedData: TransformedData,
    draftData: IFormData,
    sectionId: string,
    field: IFormField
  ) => {
    const sectionData = transformedData[sectionId]
    if (!sectionData.identifier) {
      sectionData.identifier = [{}]
    }
    sectionData.identifier[0].system = identifierType
    sectionData.identifier[0].value = draftData[sectionId][field.name]
    return transformedData
  }

export const nestedRadioFieldTransformer =
  (nestedTransformer: IFormFieldMutationMapFunction) =>
  (
    transformedData: TransformedData,
    draftData: IFormData,
    sectionId: string,
    field: IFormField,
    nestedField?: IFormField
  ) => {
    const fieldValueObj = draftData[sectionId][field.name] as IFormSectionData
    const partialDraftData: IFormData = {}

    if (!nestedField) {
      const parentData: IFormSectionData = {}
      parentData[field.name] = fieldValueObj.value as IFormSectionData
      partialDraftData[sectionId] = parentData
    } else {
      if (
        nestedField.extraValue &&
        nestedField.extraValue !== fieldValueObj.value
      ) {
        return
      }
      partialDraftData[sectionId] =
        fieldValueObj.nestedFields as IFormSectionData
    }
    nestedTransformer(
      transformedData,
      partialDraftData,
      sectionId,
      nestedField || field
    )
  }

export const fieldToReasonsNotApplyingTransformer =
  (
    transformedArrayName: string,
    transformedFieldName?: string,
    extraField?: string,
    transformeValueArrayToBoolean?: boolean,
    isCaregiver?: boolean
  ) =>
  (
    transformedData: TransformedData,
    draftData: IFormData,
    sectionId: string,
    field: IFormField
  ) => {
    let fieldValue = draftData[sectionId][field.name]
    const transFieldName = transformedFieldName
      ? transformedFieldName
      : field.name

    if (!fieldValue) {
      return
    } else {
      if (transformeValueArrayToBoolean) {
        const valueArray = fieldValue as IFormFieldValue[]
        fieldValue = valueArray.length > 0
      }

      if (!transformedData[sectionId][transformedArrayName]) {
        transformedData[sectionId][transformedArrayName] = []
      }

      const transformedArray: TransformedData[] =
        transformedData[sectionId][transformedArrayName]

      let transformedField = transformedArray.find((transField) => {
        if (extraField) {
          return (
            transField[extraField] &&
            transField[extraField] === field.extraValue
          )
        }
        return (
          !isCaregiver &&
          transField[transFieldName] &&
          transField[transFieldName] === fieldValue
        )
      })

      if (!transformedField) {
        transformedField = {}
        transformedField[transFieldName] = fieldValue

        if (extraField) {
          transformedField[extraField] = field.extraValue
        }

        transformedArray.push(transformedField)
      } else {
        transformedField[transFieldName] = fieldValue
      }
    }
  }

function formatDate(dateString: string) {
  const [year, month, day] = dateString.split('-')
  const date = new Date(
    Number.parseInt(year),
    Number.parseInt(month) - 1,
    Number.parseInt(day)
  )

  if (date instanceof Date && !isNaN(date.getTime())) {
    return [year, month.padStart(2, '0'), day.padStart(2, '0')].join('-')
  } else return null
}

export const longDateTransformer =
  (transformedFieldName?: string) =>
  (
    transformedData: TransformedData,
    draftData: IFormData,
    sectionId: string,
    field: IFormField
  ) => {
    const fieldName = transformedFieldName || field.name
    const sectionData = draftData[sectionId][field.name] as string

    if (sectionData) {
      transformedData[sectionId][fieldName] = formatDate(sectionData)
    }

    return transformedData
  }

export const childFieldToIdentityTransformer =
  (idTypes: string[]) =>
  (
    transformedData: TransformedData,
    draftData: IFormData,
    sectionId: 'child'
  ) => {
    const transformedSection = transformedData[sectionId]
    if (!transformedSection.identifier) {
      transformedSection.identifier = []
    }

    idTypes.forEach((idType) => {
      if (!draftData[sectionId][idType]) {
        return
      }

      transformedSection.identifier.push({
        id: draftData[sectionId][idType],
        type: idType
      })
    })
  }
export function eventFieldToAttachmentTransformer(
  transformedData: TransformedData,
  draftData: IFormData,
  sectionId: string,
  field: IFormField
) {
  return fieldToAttachmentTransformer(
    transformedData,
    draftData,
    sectionId,
    field,
    'registration'
  )
}
export const customFieldToQuestionnaireTransformer = (
  transformedData: TransformedData,
  draftData: IFormData,
  sectionId: string,
  field: IFormField
) => {
  const value: IFormSectionData = draftData[sectionId][
    field.name
  ] as IFormSectionData
  if (!transformedData.questionnaire) {
    transformedData.questionnaire = []
  }
  transformedData.questionnaire.push({
    fieldId: field.customQuestionMappingId,
    value: String(value)
  })

  return transformedData
}

export const msisdnTransformer =
  (transformedFieldName?: string) =>
  (
    transformedData: TransformedData,
    draftData: IFormData,
    sectionId: string,
    field: IFormField
  ) => {
    const fieldName = transformedFieldName ? transformedFieldName : field.name

    set(
      transformedData,
      fieldName,
      convertToMSISDN(
        draftData[sectionId][field.name] as string,
        window.config.COUNTRY
      )
    )

    return transformedData
  }
