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
import { z } from 'zod'
import {
  messageDescriptor,
  field,
  handlebarTemplate,
  isButtonField,
  conditional
} from '@config/handlers/forms/field'

const previewGroup = z.object({
  id: z.string(),
  label: messageDescriptor,
  fieldToRedirect: z.string().optional(),
  delimiter: z.string().optional(),
  required: z.boolean().optional(),
  initialValue: z.string().optional()
})

/*
 * TODO: The field validation needs to be made stricter
 */

const group = z.object({
  id: z.string(),
  title: messageDescriptor.optional(),
  fields: z.array(field),
  previewGroups: z.array(previewGroup).optional(),
  conditionals: z.array(conditional).optional(),
  preventContinueIfError: z.boolean().optional()
})

const section = z.object({
  id: z.string(),
  viewType: z.enum(['form', 'hidden', 'preview', 'review']),
  name: messageDescriptor,
  title: messageDescriptor.optional(),
  groups: z.array(group),
  mapping: z
    .object({ template: z.array(handlebarTemplate).optional() })
    .passthrough()
    .optional()
})

function findDuplicates(arr: string[]): string[] {
  const freqCount = arr.reduce((counter, str) => {
    if (counter.has(str)) {
      counter.set(str, counter.get(str)! + 1)
    } else {
      counter.set(str, 1)
    }
    return counter
  }, new Map<string, number>())
  return [...freqCount.entries()]
    .filter(([_, count]) => count > 1)
    .map(([name, _]) => name)
}

const DECORATIVE_TYPES = ['DIVIDER', 'HEADING3', 'SUBSECTION_HEADER']

const REQUIRED_SECTIONS = ['registration', 'documents'] as const

const REQUIRED_EVENT_ADDRESS_FIELDS = ['country', 'state']

const REQUIRED_PRIMARY_ADDRESS_FIELDS = ['countryPrimary', 'statePrimary']

const OPTIONAL_EVENT_ADDRESS_FIELDS = [
  'district',
  'locationLevel{x}',
  'ruralOrUrban',
  'city',
  'addressLine3UrbanOption',
  'addressLine2UrbanOption',
  'addressLine1UrbanOption',
  'addressLine3',
  'addressLine2',
  'addressLine1',
  'postalCode',
  'addressLine1RuralOption',
  'addressLine1',
  'internationalState',
  'internationalDistrict',
  'internationalCity',
  'internationalAddressLine1',
  'internationalAddressLine2',
  'internationalAddressLine3',
  'internationalPostalCode'
]

const OPTIONAL_PRIMARY_ADDRESS_FIELDS = [
  'districtPrimary',
  'locationLevel{x}Primary',
  'ruralOrUrbanPrimary',
  'cityPrimary',
  'addressLine3UrbanOptionPrimary',
  'addressLine2UrbanOptionPrimary',
  'addressLine1UrbanOptionPrimary',
  'addressLine3Primary',
  'addressLine2Primary',
  'addressLine1Primary',
  'postalCodePrimary',
  'addressLine1RuralOptionPrimary',
  'addressLine1Primary',
  'internationalStatePrimary',
  'internationalDistrictPrimary',
  'internationalCityPrimary',
  'internationalAddressLine1Primary',
  'internationalAddressLine2Primary',
  'internationalAddressLine3Primary',
  'internationalPostalCodePrimary'
]

const REQUIRED_FIELDS_IN_SECTION: Record<string, string[] | undefined> = {
  child: [
    'firstNamesEng',
    'familyNameEng',
    'gender',
    'childBirthDate',
    'placeOfBirth',
    'birthLocation',
    ...REQUIRED_EVENT_ADDRESS_FIELDS.map((field) => `${field}Placeofbirth`)
  ],
  mother: [
    'firstNamesEng',
    'familyNameEng',
    'detailsExist',
    'reasonNotApplying',
    'motherBirthDate',
    ...REQUIRED_PRIMARY_ADDRESS_FIELDS.map((field) => `${field}Mother`)
  ],
  father: [
    'firstNamesEng',
    'familyNameEng',
    'detailsExist',
    'reasonNotApplying',
    'fatherBirthDate',
    ...REQUIRED_PRIMARY_ADDRESS_FIELDS.map((field) => `${field}Father`)
  ],
  deceased: [
    'firstNamesEng',
    'familyNameEng',
    'gender',
    'deceasedBirthDate',
    ...REQUIRED_PRIMARY_ADDRESS_FIELDS.map((field) => `${field}Deceased`)
  ],
  spouse: [
    'firstNamesEng',
    'familyNameEng',
    'detailsExist',
    'reasonNotApplying',
    'spouseBirthDate',
    ...REQUIRED_PRIMARY_ADDRESS_FIELDS.map((field) => `${field}Spouse`)
  ],
  deathEvent: [
    'deathDate',
    'placeOfDeath',
    'deathLocation',
    ...REQUIRED_EVENT_ADDRESS_FIELDS.map((field) => `${field}Placeofdeath`)
  ],
  marriageEvent: [
    'marriageDate',
    ...REQUIRED_EVENT_ADDRESS_FIELDS.map((field) => `${field}Placeofmarriage`)
  ],
  groom: [
    'firstNamesEng',
    'familyNameEng',
    'groomBirthDate',
    ...REQUIRED_PRIMARY_ADDRESS_FIELDS.map((field) => `${field}Groom`)
  ],
  bride: [
    'firstNamesEng',
    'familyNameEng',
    'brideBirthDate',
    ...REQUIRED_PRIMARY_ADDRESS_FIELDS.map((field) => `${field}Bride`)
  ],
  informant: [
    'informantType',
    'otherInformantType',
    'firstNamesEng',
    'familyNameEng',
    ...REQUIRED_PRIMARY_ADDRESS_FIELDS.map((field) => `${field}Informant`)
  ],
  witnessOne: [
    'firstNamesEng',
    'familyNameEng',
    'relationship',
    'otherRelationship'
  ],
  witnessTwo: [
    'firstNamesEng',
    'familyNameEng',
    'relationship',
    'otherRelationship'
  ],
  review: [],
  preview: []
}

const OPTIONAL_FIELDS_IN_SECTION: Record<string, string[] | undefined> = {
  child: [
    'middleNameEng',
    'attendantAtBirth',
    'birthType',
    'weightAtBirth',
    ...OPTIONAL_EVENT_ADDRESS_FIELDS.map((field) => `${field}Placeofbirth`)
  ],
  mother: [
    'middleNameEng',
    'primaryAddress',
    'exactDateOfBirthUnknown',
    'ageOfIndividualInYears',
    'iD',
    'motherNidVerification',
    'maritalStatus',
    'multipleBirth',
    'occupation',
    'educationalAttainment',
    'nationality',
    ...OPTIONAL_PRIMARY_ADDRESS_FIELDS.map((field) => `${field}Mother`)
  ],
  father: [
    'middleNameEng',
    'primaryAddress',
    'exactDateOfBirthUnknown',
    'ageOfIndividualInYears',
    'iD',
    'fatherNidVerification',
    'maritalStatus',
    'occupation',
    'educationalAttainment',
    'nationality',
    'primaryAddressSameAsOtherPrimary',
    ...OPTIONAL_PRIMARY_ADDRESS_FIELDS.map((field) => `${field}Father`)
  ],
  deceased: [
    'middleNameEng',
    'primaryAddress',
    'exactDateOfBirthUnknown',
    'ageOfIndividualInYears',
    'deceasedID',
    'maritalStatus',
    'occupation',
    'nationality',
    ...OPTIONAL_PRIMARY_ADDRESS_FIELDS.map((field) => `${field}Deceased`)
  ],
  spouse: [
    'middleNameEng',
    'primaryAddress',
    'exactDateOfBirthUnknown',
    'ageOfIndividualInYears',
    'iD',
    'spouseNidVerification',
    'maritalStatus',
    'occupation',
    'educationalAttainment',
    'nationality',
    'primaryAddressSameAsOtherPrimary',
    ...OPTIONAL_PRIMARY_ADDRESS_FIELDS.map((field) => `${field}Spouse`)
  ],
  deathEvent: [
    'mannerOfDeath',
    'causeOfDeathEstablished',
    'causeOfDeathMethod',
    'deathDescription',
    'placeOfDeathTitle',
    ...OPTIONAL_EVENT_ADDRESS_FIELDS.map((field) => `${field}Placeofdeath`)
  ],
  marriageEvent: [
    'typeOfMarriage',
    'placeOfMarriageTitle',
    ...OPTIONAL_EVENT_ADDRESS_FIELDS.map((field) => `${field}Placeofmarriage`)
  ],
  groom: [
    'middleNameEng',
    'primaryAddress',
    'exactDateOfBirthUnknown',
    'ageOfIndividualInYears',
    'iD',
    'marriedLastNameEng',
    'nationality',
    ...OPTIONAL_PRIMARY_ADDRESS_FIELDS.map((field) => `${field}Groom`)
  ],
  bride: [
    'middleNameEng',
    'primaryAddress',
    'exactDateOfBirthUnknown',
    'ageOfIndividualInYears',
    'iD',
    'marriedLastNameEng',
    'nationality',
    ...OPTIONAL_PRIMARY_ADDRESS_FIELDS.map((field) => `${field}Bride`)
  ],
  informant: [
    'middleNameEng',
    'primaryAddress',
    'registrationPhone',
    'registrationEmail',
    'exactDateOfBirthUnknown',
    'ageOfIndividualInYears',
    'informantID',
    'informantNidVerification',
    'primaryAddressSameAsOtherPrimary',
    'informantBirthDate',
    'occupation',
    'nationality',
    ...OPTIONAL_PRIMARY_ADDRESS_FIELDS.map((field) => `${field}Informant`)
  ],
  witnessOne: ['middleNameEng'],
  witnessTwo: ['middleNameEng'],
  review: [
    'informantSignature',
    'groomSignature',
    'brideSignature',
    'witnessOneSignature',
    'witnessTwoSignature'
  ],
  preview: [
    'informantSignature',
    'groomSignature',
    'brideSignature',
    'witnessOneSignature',
    'witnessTwoSignature'
  ]
}

const matchField = (fields: string[], nonCustomField: string) => {
  if (fields.includes(nonCustomField)) {
    return true
  }
  const match = nonCustomField.match(/locationLevel(\d+)/)
  if (match) {
    return fields.some(
      (field) =>
        field.includes('{x}') &&
        field.replace('{x}', match[1]) === nonCustomField
    )
  }
  return false
}

const form = z.object({
  sections: z
    .array(
      section
        .refine(
          (sec) =>
            findDuplicates(
              sec.groups.flatMap(({ fields }) => fields.map(({ name }) => name))
            ).length === 0,
          (sec) => ({
            message: `Field names in a section should all be unique. Duplicate field(s): ${findDuplicates(
              sec.groups.flatMap(({ fields }) => fields.map(({ name }) => name))
            ).join(', ')} found`
          })
        )
        .refine(
          (sec) => {
            const fieldsInSection = sec.groups.flatMap((group) =>
              group.fields.map(({ name }) => name)
            )
            return (
              (REQUIRED_FIELDS_IN_SECTION[sec.id]?.filter(
                (reqField) => !fieldsInSection.includes(reqField)
              ).length ?? 0) === 0
            )
          },
          (sec) => {
            const fieldsInSection = sec.groups.flatMap((group) =>
              group.fields.map(({ name }) => name)
            )
            const notIncludedRequiredFields = (
              REQUIRED_FIELDS_IN_SECTION[sec.id] ?? []
            ).filter((reqField) => !fieldsInSection.includes(reqField))
            return {
              message: `Missing required fields "${notIncludedRequiredFields.join(
                ', '
              )}" found`
            }
          }
        )
        .refine(
          (sec) => {
            const fieldsInSection = sec.groups.flatMap((group) => group.fields)
            const buttonFields = fieldsInSection.filter(isButtonField)
            return buttonFields.every((button) =>
              fieldsInSection.some(
                (field) => button.options.trigger === field.name
              )
            )
          },
          (sec) => {
            const fieldsInSection = sec.groups.flatMap((group) => group.fields)
            const buttonFields = fieldsInSection.filter(isButtonField)
            const buttonFieldsMissingTrigger = buttonFields
              .filter(
                (button) =>
                  !fieldsInSection.some(
                    (field) => button.options.trigger === field.name
                  )
              )
              .map(({ name }) => name)
            return {
              message: `Missing trigger for button fields ${buttonFieldsMissingTrigger.join(
                ','
              )}`
            }
          }
        )
        .refine(
          (sec) => {
            if (!REQUIRED_FIELDS_IN_SECTION[sec.id]) {
              return true
            }
            const nonCustomfieldsInSection = sec.groups.flatMap((group) =>
              group.fields
                .filter(({ custom }) => !Boolean(custom))
                .filter(({ type }) => !DECORATIVE_TYPES.includes(type))
                .filter(
                  ({ name }) =>
                    !(REQUIRED_FIELDS_IN_SECTION[sec.id] ?? []).includes(name)
                )
                .map(({ name }) => name)
            )
            return (
              nonCustomfieldsInSection.filter(
                (nonCustomField) =>
                  !matchField(
                    OPTIONAL_FIELDS_IN_SECTION[sec.id] ?? [],
                    nonCustomField
                  )
              ).length === 0
            )
          },
          (sec) => {
            const nonCustomfieldsInSection = sec.groups.flatMap((group) =>
              group.fields
                .filter(({ custom }) => !Boolean(custom))
                .filter(({ type }) => !DECORATIVE_TYPES.includes(type))
                .filter(
                  ({ name }) =>
                    !(REQUIRED_FIELDS_IN_SECTION[sec.id] ?? []).includes(name)
                )
                .map(({ name }) => name)
            )
            const unrecognizedFields = nonCustomfieldsInSection.filter(
              (nonCustomField) =>
                !matchField(
                  OPTIONAL_FIELDS_IN_SECTION[sec.id] ?? [],
                  nonCustomField
                )
            )
            return {
              message: `Use "custom" property to make a field custom. Unrecognized non custom fields "${unrecognizedFields.join(
                ', '
              )}" found`
            }
          }
        )
    )
    .refine(
      (sections) => {
        const fieldMap = new Map()
        sections.forEach((section) => {
          section.groups.forEach((group) => {
            group.fields.forEach((field) => {
              if (
                field.initialValue &&
                typeof field.initialValue === 'object' &&
                'dependsOn' in field.initialValue
              ) {
                fieldMap.set(field.name, field.initialValue.dependsOn)
              } else {
                fieldMap.set(field.name, [])
              }
            })
          })
        })

        const hasCycle = (
          fieldName: string,
          visited: Set<string>,
          stack: Set<string>
        ) => {
          if (!visited.has(fieldName)) {
            visited.add(fieldName)
            stack.add(fieldName)

            const dependencies = fieldMap.get(fieldName) || []
            for (const dep of dependencies) {
              if (!visited.has(dep) && hasCycle(dep, visited, stack)) {
                return true
              } else if (stack.has(dep)) {
                return true
              }
            }
          }
          stack.delete(fieldName)
          return false
        }
        const visited: Set<string> = new Set()
        const stack: Set<string> = new Set()
        for (const section of sections) {
          for (const group of section.groups) {
            for (const field of group.fields) {
              if (hasCycle(field.name, visited, stack)) {
                return false
              }
            }
          }
        }

        return true
      },
      {
        message: 'Circular dependency detected among fields'
      }
    )

    .refine(
      (sections) =>
        sections
          .find(({ id }) => id === 'review')
          ?.groups.some(({ id }) => id === 'review-view-group'),
      `A "review" section is required in form configuration. It can optionally include SIGNATURE fields. An example configuration can be found in our Farajaland reference implementation.`
    )
    .refine(
      (sections) =>
        sections
          .find(({ id }) => id === 'preview')
          ?.groups.some(({ id }) => id === 'preview-view-group'),
      `A "preview" section is required in form configuration. It can optionally include SIGNATURE fields. An example configuration can be found in our Farajaland reference implementation.`
    )
    .refine(
      (sections) =>
        sections.filter(({ id }) =>
          REQUIRED_SECTIONS.includes(id as (typeof REQUIRED_SECTIONS)[number])
        ).length >= 2,
      {
        message: `${REQUIRED_SECTIONS.map((sec) => `"${sec}"`).join(
          ' & '
        )} sections are required`
      }
    )
    .refine(
      (sections) =>
        findDuplicates(
          sections
            .flatMap((sec) => [
              ...(sec.mapping?.template ?? []).map(({ fieldName }) => {
                // Log the following to observe all available handlebars
                // console.log('section handlebar: ', fieldName)
                return fieldName
              }),
              ...sec.groups
                .flatMap((group) => group.fields)
                .map(({ mapping }) => {
                  // Log the following to observe all available handlebars
                  // console.log('field handlebar: ', mapping?.template?.fieldName)
                  return mapping?.template?.fieldName
                })
            ])
            .filter((maybeName): maybeName is string => Boolean(maybeName))
        ).length === 0,
      (sections) => {
        const duplicateCertificateHandlebars = findDuplicates(
          sections
            .flatMap((sec) => [
              ...(sec.mapping?.template ?? []).map(
                ({ fieldName }) => fieldName
              ),
              ...sec.groups
                .flatMap((group) => group.fields)
                .map(({ mapping }) => mapping?.template?.fieldName)
            ])
            .filter((maybeName): maybeName is string => Boolean(maybeName))
        )
        return {
          message: `All the certificate handlebars should be unique for an event. Duplicate handlebars for "${duplicateCertificateHandlebars.join(
            ', '
          )}"`
        }
      }
    )
})

export const registrationForms = z.object({
  version: z.string(),
  birth: form,
  death: form,
  marriage: form
})
