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
  Bundle,
  BundleEntry,
  DocumentReference,
  Extension,
  PaymentReconciliation,
  Practitioner,
  Task,
  URNReference,
  URLReference,
  SavedTask,
  Composition,
  SavedComposition,
  isURLReference,
  isComposition,
  SavedBundle,
  Resource,
  urlReferenceToUUID,
  ValidRecord,
  resourceIdentifierToUUID,
  Location,
  urlReferenceToResourceIdentifier,
  isEncounter,
  isRelatedPerson,
  Encounter,
  RelatedPerson
} from '@opencrvs/commons/types'
import { HEARTH_URL } from '@workflow/constants'
import fetch from 'node-fetch'
import { getUUID, UUID } from '@opencrvs/commons'
import { MAKE_CORRECTION_EXTENSION_URL } from '@workflow/features/task/fhir/constants'
import {
  ApproveRequestInput,
  CorrectionRequestInput,
  CorrectionRequestPaymentInput,
  ChangedValuesInput
} from '@workflow/records/correction-request'
import { isSystem, ISystemModelData, IUserModelData } from './user'
import { getPractitionerOffice } from '@workflow/features/user/utils'

function getFHIRValueField(value: unknown) {
  if (typeof value === 'string') {
    return { valueString: value }
  }

  if (typeof value === 'number') {
    return { valueInteger: value }
  }

  if (typeof value === 'boolean') {
    return { valueBoolean: value }
  }

  throw new Error('Invalid value type')
}

export function createCorrectionProofOfLegalCorrectionDocument(
  subjectReference: URNReference,
  attachmentURL: string,
  attachmentType: string
): BundleEntry<DocumentReference> {
  const temporaryDocumentReferenceId = getUUID()
  return {
    fullUrl: `urn:uuid:${temporaryDocumentReferenceId}`,
    resource: {
      resourceType: 'DocumentReference',
      masterIdentifier: {
        value: temporaryDocumentReferenceId,
        system: 'urn:ietf:rfc:3986'
      },
      status: 'current',
      subject: {
        reference: subjectReference
      },
      type: {
        coding: [
          {
            system: 'http://opencrvs.org/specs/documentType',
            code: attachmentType
          }
        ]
      },
      content: [
        {
          attachment: {
            contentType: 'image/jpg',
            data: attachmentURL
          }
        }
      ],
      identifier: []
    }
  }
}

export function createCorrectionPaymentResources(
  paymentDetails: CorrectionRequestPaymentInput
): [BundleEntry<PaymentReconciliation>]

export function createCorrectionPaymentResources(
  paymentDetails: CorrectionRequestPaymentInput,
  attachmentURL?: string
): [BundleEntry<PaymentReconciliation>, BundleEntry<DocumentReference>]

export function createCorrectionPaymentResources(
  paymentDetails: CorrectionRequestPaymentInput,
  attachmentURL?: string
):
  | [BundleEntry<PaymentReconciliation>, BundleEntry<DocumentReference>]
  | [BundleEntry<PaymentReconciliation>] {
  const temporaryPaymentId = getUUID()
  const temporaryDocumentReferenceId = getUUID()

  const paymentBundleEntry = {
    fullUrl: `urn:uuid:${temporaryPaymentId}`,
    resource: {
      resourceType: 'PaymentReconciliation',
      status: 'active',
      detail: [
        {
          type: {
            coding: [
              {
                code: paymentDetails.type
              }
            ]
          },
          amount: {
            value: paymentDetails.amount
          },
          date: paymentDetails.date
        }
      ],
      outcome: {
        coding: [
          {
            code: paymentDetails.outcome
          }
        ]
      }
    }
  } satisfies BundleEntry<PaymentReconciliation>

  if (!attachmentURL) {
    return [paymentBundleEntry]
  }

  return [
    paymentBundleEntry,
    {
      fullUrl: `urn:uuid:${temporaryDocumentReferenceId}`,
      resource: {
        resourceType: 'DocumentReference',
        masterIdentifier: {
          value: temporaryDocumentReferenceId,
          system: 'urn:ietf:rfc:3986'
        },
        status: 'current',
        subject: {
          reference: `urn:uuid:${temporaryPaymentId}`
        },
        extension: [
          {
            url: 'http://opencrvs.org/specs/extension/payment',
            valueReference: {
              reference: `urn:uuid:${temporaryPaymentId}`
            }
          }
        ],
        type: {
          coding: [
            {
              system: 'http://opencrvs.org/specs/documentType',
              code: 'PROOF_OF_PAYMENT'
            }
          ]
        },
        content: [
          {
            attachment: {
              contentType: 'image/jpg',
              data: attachmentURL
            }
          }
        ],
        identifier: []
      }
    }
  ]
}

export function createCorrectionEncounter() {
  const encounter = {
    fullUrl: `urn:uuid:${getUUID()}` as const,
    resource: {
      resourceType: 'Encounter' as const,
      status: 'finished' as const
    }
  } satisfies BundleEntry<fhir3.Encounter>

  return encounter
}

export function createCorrectedTask(
  previousTask: Task, // @todo do not require previous task, pass values from outside
  correctionDetails: CorrectionRequestInput | ApproveRequestInput,
  correctionEncounter:
    | BundleEntry<fhir3.Encounter>
    | BundleEntry<fhir3.Encounter>,
  paymentReconciliation?:
    | BundleEntry<PaymentReconciliation>
    | BundleEntry<PaymentReconciliation>
): Task {
  const conditionalExtensions: Extension[] = []

  if (paymentReconciliation?.fullUrl) {
    conditionalExtensions.push({
      url: 'http://opencrvs.org/specs/extension/paymentDetails',
      valueReference: {
        reference: paymentReconciliation.fullUrl
      }
    })
  }

  if (correctionDetails.requesterOther) {
    conditionalExtensions.push({
      url: 'http://opencrvs.org/specs/extension/requestingIndividualOther',
      valueString: correctionDetails.requesterOther
    })
  }

  return {
    resourceType: 'Task',
    status: 'ready',
    intent: 'order',
    code: previousTask.code,
    focus: previousTask.focus,
    id: previousTask.id,
    encounter: { reference: correctionEncounter.fullUrl },
    identifier: previousTask.identifier,
    extension: [
      ...previousTask.extension.filter((extension) =>
        [
          'http://opencrvs.org/specs/extension/contact-person-phone-number',
          'http://opencrvs.org/specs/extension/informants-signature',
          'http://opencrvs.org/specs/extension/contact-person-email'
        ].includes(extension.url)
      ),
      ...conditionalExtensions,
      {
        url: 'http://opencrvs.org/specs/extension/timeLoggedMS',
        valueInteger: 0
      },
      {
        url: 'http://opencrvs.org/specs/extension/noSupportingDocumentationRequired',
        valueBoolean: correctionDetails.noSupportingDocumentationRequired
      },
      {
        url: 'http://opencrvs.org/specs/extension/requestingIndividual',
        valueString: correctionDetails.requester
      },
      {
        url: 'http://opencrvs.org/specs/extension/hasShowedVerifiedDocument',
        valueBoolean: correctionDetails.hasShowedVerifiedDocument
      },
      {
        url: MAKE_CORRECTION_EXTENSION_URL,
        valueString: 'REGISTERED'
      }
    ],
    input: correctionDetails.values.map((update) => ({
      valueCode: update.section,
      valueId: update.fieldName,
      type: {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/action-type',
            code: 'update'
          }
        ]
      },
      ...getFHIRValueField(update.newValue)
    })),
    reason: {
      text: correctionDetails.reason,
      extension: [
        {
          url: 'http://opencrvs.org/specs/extension/otherReason',
          valueString: correctionDetails.otherReason
        }
      ]
    },
    note: [
      {
        text: correctionDetails.note
      }
    ],
    lastModified: new Date().toISOString(),
    businessStatus: {
      coding: [
        {
          system: 'http://opencrvs.org/specs/reg-status',
          code: 'REGISTERED'
        }
      ]
    }
  }
}

export async function createViewTask(
  previousTask: SavedTask,
  user: IUserModelData,
  office: Location
): Promise<SavedTask> {
  return {
    resourceType: 'Task',
    status: 'accepted',
    intent: 'proposal',
    code: previousTask.code,
    focus: previousTask.focus,
    id: previousTask.id,
    requester: {
      agent: { reference: `Practitioner/${user.practitionerId}` }
    },
    identifier: previousTask.identifier,
    extension: [
      ...previousTask.extension.filter((extension) =>
        [
          'http://opencrvs.org/specs/extension/contact-person-phone-number',
          'http://opencrvs.org/specs/extension/informants-signature',
          'http://opencrvs.org/specs/extension/contact-person-email',
          'http://opencrvs.org/specs/extension/bride-signature',
          'http://opencrvs.org/specs/extension/groom-signature',
          'http://opencrvs.org/specs/extension/witness-one-signature',
          'http://opencrvs.org/specs/extension/witness-two-signature'
        ].includes(extension.url)
      ),
      {
        url: 'http://opencrvs.org/specs/extension/regLastUser',
        valueReference: {
          reference: `Practitioner/${user.practitionerId as UUID}`
        }
      },
      {
        url: 'http://opencrvs.org/specs/extension/regLastLocation',
        valueReference: {
          reference: `Location/${resourceIdentifierToUUID(
            office!.partOf!.reference
          )}`
        }
      },
      {
        url: 'http://opencrvs.org/specs/extension/regLastOffice',
        valueReference: {
          reference: `Location/${user.primaryOfficeId}`
        }
      },
      { url: 'http://opencrvs.org/specs/extension/regViewed' }
    ],
    lastModified: new Date().toISOString(),
    businessStatus: previousTask.businessStatus,
    meta: {
      ...previousTask.meta,
      lastUpdated: new Date().toISOString()
    }
  }
}

export async function createDownloadTask(
  previousTask: SavedTask,
  user: IUserModelData | ISystemModelData,
  extensionUrl:
    | 'http://opencrvs.org/specs/extension/regDownloaded'
    | 'http://opencrvs.org/specs/extension/regAssigned'
): Promise<SavedTask> {
  const office = (await getPractitionerOffice(user.practitionerId)) as Location
  const identifiers = previousTask.identifier.filter(
    ({ system }) =>
      // Clear old system identifier task if it happens that the last task was made
      // by an intergration but this one is by a real user
      system !== 'http://opencrvs.org/specs/id/system_identifier'
  )

  if (isSystem(user)) {
    identifiers.push({
      system: 'http://opencrvs.org/specs/id/system_identifier',
      value: JSON.stringify({
        name: user.name,
        username: user.username,
        type: user.type
      })
    })
  }

  const extensions: Extension[] = isSystem(user)
    ? []
    : [
        {
          url: 'http://opencrvs.org/specs/extension/regLastUser',
          valueReference: {
            reference: `Practitioner/${user.practitionerId as UUID}`
          }
        },
        {
          url: 'http://opencrvs.org/specs/extension/regLastLocation',
          valueReference: {
            reference: `Location/${resourceIdentifierToUUID(
              office!.partOf!.reference
            )}`
          }
        },
        {
          url: 'http://opencrvs.org/specs/extension/regLastOffice',
          valueReference: {
            reference: `Location/${user.primaryOfficeId}`
          }
        }
      ]

  const downloadedTask: SavedTask = {
    resourceType: 'Task',
    status: 'accepted',
    intent: 'proposal',
    code: previousTask.code,
    focus: previousTask.focus,
    id: previousTask.id,
    requester: {
      agent: { reference: `Practitioner/${user.practitionerId}` }
    },
    identifier: identifiers,
    extension: [
      ...previousTask.extension.filter((extension) =>
        [
          'http://opencrvs.org/specs/extension/contact-person-phone-number',
          'http://opencrvs.org/specs/extension/informants-signature',
          'http://opencrvs.org/specs/extension/contact-person-email',
          'http://opencrvs.org/specs/extension/bride-signature',
          'http://opencrvs.org/specs/extension/groom-signature',
          'http://opencrvs.org/specs/extension/witness-one-signature',
          'http://opencrvs.org/specs/extension/witness-two-signature'
        ].includes(extension.url)
      ),
      { url: extensionUrl },
      ...extensions
    ],
    lastModified: new Date().toISOString(),
    businessStatus: previousTask.businessStatus,
    meta: {
      ...previousTask.meta,
      lastUpdated: new Date().toISOString()
    }
  }

  return downloadedTask
}

export function createRejectTask(
  previousTask: SavedTask,
  practitioner: Practitioner,
  comment: fhir3.CodeableConcept,
  reason?: string
): SavedTask {
  return {
    resourceType: 'Task',
    status: 'accepted',
    intent: 'proposal',
    code: previousTask.code,
    statusReason: comment,
    focus: previousTask.focus,
    id: previousTask.id,
    requester: {
      agent: { reference: `Practitioner/${practitioner.id}` }
    },
    identifier: previousTask.identifier,
    extension: [
      ...previousTask.extension.filter((extension) =>
        [
          'http://opencrvs.org/specs/extension/contact-person-phone-number',
          'http://opencrvs.org/specs/extension/informants-signature',
          'http://opencrvs.org/specs/extension/contact-person-email',
          'http://opencrvs.org/specs/extension/bride-signature',
          'http://opencrvs.org/specs/extension/groom-signature',
          'http://opencrvs.org/specs/extension/witness-one-signature',
          'http://opencrvs.org/specs/extension/witness-two-signature'
        ].includes(extension.url)
      ),
      {
        url: 'http://opencrvs.org/specs/extension/timeLoggedMS',
        valueInteger: 0
      }
    ],
    reason: {
      text: reason ?? ''
    },
    lastModified: new Date().toISOString(),
    businessStatus: {
      coding: [
        {
          system: 'http://opencrvs.org/specs/reg-status',
          code: 'REJECTED'
        }
      ]
    }
  }
}

export function createValidateTask(
  previousTask: Task,
  practitioner: Practitioner
): Task {
  return {
    resourceType: 'Task',
    status: 'accepted',
    intent: 'proposal',
    code: previousTask.code,
    focus: previousTask.focus,
    id: previousTask.id,
    requester: {
      agent: { reference: `Practitioner/${practitioner.id}` }
    },
    identifier: previousTask.identifier,
    extension: [
      ...previousTask.extension.filter((extension) =>
        [
          'http://opencrvs.org/specs/extension/contact-person-phone-number',
          'http://opencrvs.org/specs/extension/informants-signature',
          'http://opencrvs.org/specs/extension/contact-person-email',
          'http://opencrvs.org/specs/extension/bride-signature',
          'http://opencrvs.org/specs/extension/groom-signature',
          'http://opencrvs.org/specs/extension/witness-one-signature',
          'http://opencrvs.org/specs/extension/witness-two-signature'
        ].includes(extension.url)
      ),
      {
        url: 'http://opencrvs.org/specs/extension/timeLoggedMS',
        valueInteger: 0
      }
    ],
    lastModified: new Date().toISOString(),
    businessStatus: {
      coding: [
        {
          system: 'http://opencrvs.org/specs/reg-status',
          code: 'VALIDATED'
        }
      ]
    }
  }
}

export function createWaitingForValidationTask(
  previousTask: Task,
  practitioner: Practitioner
): Task {
  return {
    resourceType: 'Task',
    status: 'accepted',
    intent: 'proposal',
    code: previousTask.code,
    focus: previousTask.focus,
    id: previousTask.id,
    requester: {
      agent: { reference: `Practitioner/${practitioner.id}` }
    },
    identifier: previousTask.identifier,
    extension: [
      ...previousTask.extension.filter((extension) =>
        [
          'http://opencrvs.org/specs/extension/contact-person-phone-number',
          'http://opencrvs.org/specs/extension/informants-signature',
          'http://opencrvs.org/specs/extension/contact-person-email',
          'http://opencrvs.org/specs/extension/bride-signature',
          'http://opencrvs.org/specs/extension/groom-signature',
          'http://opencrvs.org/specs/extension/witness-one-signature',
          'http://opencrvs.org/specs/extension/witness-two-signature'
        ].includes(extension.url)
      ),
      {
        url: 'http://opencrvs.org/specs/extension/timeLoggedMS',
        valueInteger: 0
      }
    ],
    lastModified: new Date().toISOString(),
    businessStatus: {
      coding: [
        {
          system: 'http://opencrvs.org/specs/reg-status',
          code: 'WAITING_VALIDATION'
        }
      ]
    }
  }
}

export function createRegisterTask(
  previousTask: Task,
  practitioner: Practitioner
): Task {
  return {
    resourceType: 'Task',
    status: 'accepted',
    intent: 'proposal',
    code: previousTask.code,
    focus: previousTask.focus,
    id: previousTask.id,
    requester: {
      agent: { reference: `Practitioner/${practitioner.id}` }
    },
    identifier: previousTask.identifier,
    extension: [
      ...previousTask.extension.filter((extension) =>
        [
          'http://opencrvs.org/specs/extension/contact-person-phone-number',
          'http://opencrvs.org/specs/extension/informants-signature',
          'http://opencrvs.org/specs/extension/contact-person-email',
          'http://opencrvs.org/specs/extension/bride-signature',
          'http://opencrvs.org/specs/extension/groom-signature',
          'http://opencrvs.org/specs/extension/witness-one-signature',
          'http://opencrvs.org/specs/extension/witness-two-signature'
        ].includes(extension.url)
      ),
      {
        url: 'http://opencrvs.org/specs/extension/timeLoggedMS',
        valueInteger: 0
      }
    ],
    lastModified: new Date().toISOString(),
    businessStatus: {
      coding: [
        {
          system: 'http://opencrvs.org/specs/reg-status',
          code: 'REGISTERED'
        }
      ]
    }
  }
}

export function createArchiveTask(
  previousTask: SavedTask,
  practitioner: Practitioner,
  reason?: string,
  comment?: string,
  duplicateTrackingId?: string
): SavedTask {
  const extension: Extension[] = [
    ...previousTask.extension.filter((extension) =>
      [
        'http://opencrvs.org/specs/extension/contact-person-phone-number',
        'http://opencrvs.org/specs/extension/informants-signature',
        'http://opencrvs.org/specs/extension/contact-person-email'
      ].includes(extension.url)
    )
  ]

  if (duplicateTrackingId)
    extension.push({
      url: `http://opencrvs.org/specs/extension/duplicateTrackingId`,
      valueString: duplicateTrackingId
    })

  return {
    resourceType: 'Task',
    status: 'accepted',
    intent: 'proposal',
    code: previousTask.code,
    focus: previousTask.focus,
    id: previousTask.id,
    requester: {
      agent: { reference: `Practitioner/${practitioner.id}` }
    },
    identifier: previousTask.identifier,
    extension,
    // Reason example - "duplicate"
    reason: { text: reason ?? '' },
    // Status reason is comments which is added in the UI
    statusReason: { text: comment ?? '' },
    lastModified: new Date().toISOString(),
    businessStatus: {
      coding: [
        {
          system: 'http://opencrvs.org/specs/reg-status',
          code: 'ARCHIVED'
        }
      ]
    },
    meta: {
      ...previousTask.meta,
      lastUpdated: new Date().toISOString()
    }
  }
}

export function createUpdatedTask(
  previousTask: SavedTask,
  updatedDetails: ChangedValuesInput,
  practitioner: Practitioner
): SavedTask {
  return {
    resourceType: 'Task',
    status: 'accepted',
    intent: 'proposal',
    code: previousTask.code,
    focus: previousTask.focus,
    id: previousTask.id,
    requester: {
      agent: { reference: `Practitioner/${practitioner.id}` }
    },
    identifier: previousTask.identifier,
    extension: [
      ...previousTask.extension.filter((extension) =>
        [
          'http://opencrvs.org/specs/extension/contact-person-phone-number',
          'http://opencrvs.org/specs/extension/informants-signature',
          'http://opencrvs.org/specs/extension/contact-person-email',
          'http://opencrvs.org/specs/extension/bride-signature',
          'http://opencrvs.org/specs/extension/groom-signature',
          'http://opencrvs.org/specs/extension/witness-one-signature',
          'http://opencrvs.org/specs/extension/witness-two-signature'
        ].includes(extension.url)
      )
    ],
    input: updatedDetails.map((update) => ({
      valueCode: update.section,
      valueId: update.fieldName,
      type: {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/action-type',
            code: 'update'
          }
        ]
      },
      ...getFHIRValueField(update.oldValue)
    })),
    output: updatedDetails.map((update) => ({
      valueCode: update.section,
      valueId: update.fieldName,
      type: {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/action-type',
            code: 'update'
          }
        ]
      },
      ...getFHIRValueField(update.newValue)
    })),
    lastModified: new Date().toISOString(),
    businessStatus: {
      coding: [
        {
          system: 'http://opencrvs.org/specs/reg-status',
          code: 'DECLARATION_UPDATED'
        }
      ]
    }
  }
}

export function createUnassignedTask(
  previousTask: SavedTask,
  practitioner: Practitioner
) {
  const unassignedTask: SavedTask = {
    resourceType: 'Task',
    status: 'accepted',
    intent: 'proposal',
    code: previousTask.code,
    focus: previousTask.focus,
    id: previousTask.id,
    requester: {
      agent: { reference: `Practitioner/${practitioner.id}` }
    },
    identifier: previousTask.identifier,
    extension: [
      ...previousTask.extension.filter((extension) =>
        [
          'http://opencrvs.org/specs/extension/contact-person-phone-number',
          'http://opencrvs.org/specs/extension/informants-signature',
          'http://opencrvs.org/specs/extension/contact-person-email',
          'http://opencrvs.org/specs/extension/bride-signature',
          'http://opencrvs.org/specs/extension/groom-signature',
          'http://opencrvs.org/specs/extension/witness-one-signature',
          'http://opencrvs.org/specs/extension/witness-two-signature'
        ].includes(extension.url)
      ),
      { url: 'http://opencrvs.org/specs/extension/regUnassigned' }
    ],
    lastModified: new Date().toISOString(),
    businessStatus: previousTask.businessStatus,
    meta: {
      ...previousTask.meta,
      lastUpdated: new Date().toISOString()
    }
  }

  return unassignedTask
}

export function createCorrectionRequestTask(
  previousTask: Task,
  correctionDetails: CorrectionRequestInput,
  correctionEncounter: BundleEntry<fhir3.Encounter>,
  practitioner: Practitioner,
  paymentReconciliation?: BundleEntry<PaymentReconciliation>
): Task {
  const conditionalExtensions: Extension[] = []

  if (paymentReconciliation) {
    conditionalExtensions.push({
      url: 'http://opencrvs.org/specs/extension/paymentDetails',
      valueReference: {
        // @todo implement URLReference and URNReference types for Extensions
        reference: paymentReconciliation.fullUrl as string
      }
    })
  }

  if (correctionDetails.requesterOther) {
    conditionalExtensions.push({
      url: 'http://opencrvs.org/specs/extension/requestingIndividualOther',
      valueString: correctionDetails.requesterOther
    })
  }

  return {
    resourceType: 'Task',
    status: 'requested',
    intent: 'proposal',
    code: previousTask.code,
    focus: previousTask.focus,
    id: previousTask.id,
    requester: {
      agent: { reference: `Practitioner/${practitioner.id}` }
    },
    encounter: { reference: correctionEncounter.fullUrl },
    identifier: previousTask.identifier,
    extension: [
      ...previousTask.extension.filter((extension) =>
        [
          'http://opencrvs.org/specs/extension/contact-person-phone-number',
          'http://opencrvs.org/specs/extension/informants-signature',
          'http://opencrvs.org/specs/extension/contact-person-email',
          'http://opencrvs.org/specs/extension/bride-signature',
          'http://opencrvs.org/specs/extension/groom-signature',
          'http://opencrvs.org/specs/extension/witness-one-signature',
          'http://opencrvs.org/specs/extension/witness-two-signature'
        ].includes(extension.url)
      ),
      {
        url: 'http://opencrvs.org/specs/extension/timeLoggedMS',
        valueInteger: 0
      },
      ...conditionalExtensions,
      {
        url: 'http://opencrvs.org/specs/extension/noSupportingDocumentationRequired',
        valueBoolean: correctionDetails.noSupportingDocumentationRequired
      },
      {
        url: 'http://opencrvs.org/specs/extension/requestingIndividual',
        valueString: correctionDetails.requester
      },
      {
        url: `http://opencrvs.org/specs/extension/hasShowedVerifiedDocument` as const,
        valueBoolean: correctionDetails.hasShowedVerifiedDocument
      }
    ],
    input: correctionDetails.values.map((update) => ({
      valueCode: update.section,
      valueId: update.fieldName,
      type: {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/action-type',
            code: 'update'
          }
        ]
      },
      ...getFHIRValueField(update.newValue)
    })),
    reason: {
      text: correctionDetails.reason,
      extension: [
        {
          url: 'http://opencrvs.org/specs/extension/otherReason',
          valueString: correctionDetails.otherReason
        }
      ]
    },
    note: [
      {
        text: correctionDetails.note
      }
    ],
    lastModified: new Date().toISOString(),
    businessStatus: {
      coding: [
        {
          system: 'http://opencrvs.org/specs/reg-status',
          code: 'CORRECTION_REQUESTED'
        }
      ]
    }
  }
}

export type TransactionResponse = Omit<fhir3.Bundle, 'entry'> & {
  entry: Array<
    Omit<fhir3.BundleEntry, 'response'> & {
      response: Omit<fhir3.BundleEntryResponse, 'location'> & {
        location: URLReference
      }
    }
  >
}

function unresolveReferenceFullUrls(bundle: Bundle): Bundle {
  return {
    ...bundle,
    entry: bundle.entry.map((entry) => {
      const resource = entry.resource
      if (isComposition(resource)) {
        return {
          ...entry,
          resource: {
            ...resource,
            section: resource.section.map((section) => ({
              ...section,
              entry: section.entry.map((entry) => ({
                ...entry,
                reference: isURLReference(entry.reference)
                  ? (urlReferenceToResourceIdentifier(
                      entry.reference
                    ) as URLReference)
                  : entry.reference
              }))
            }))
          } satisfies Composition
        }
      }
      if (isEncounter(resource) && resource.location) {
        return {
          ...entry,
          resource: {
            ...resource,
            location: resource.location.map((location) => ({
              ...location,
              location: {
                ...location.location,
                reference: isURLReference(location.location.reference)
                  ? urlReferenceToResourceIdentifier(
                      location.location.reference
                    )
                  : location.location.reference
              }
            }))
          } satisfies Encounter
        }
      }

      if (isRelatedPerson(resource) && resource.patient) {
        return {
          ...entry,
          resource: {
            ...resource,
            patient: {
              ...resource.patient,
              reference: isURLReference(resource.patient.reference)
                ? urlReferenceToResourceIdentifier(resource.patient.reference)
                : resource.patient.reference
            }
          } satisfies RelatedPerson
        }
      }

      return entry
    })
  }
}

export async function sendBundleToHearth(
  bundle: Bundle
): Promise<TransactionResponse> {
  const res = await fetch(HEARTH_URL, {
    method: 'POST',
    body: JSON.stringify(unresolveReferenceFullUrls(bundle)),
    headers: {
      'Content-Type': 'application/fhir+json'
    }
  })

  if (!res.ok) {
    throw new Error(
      `FHIR post to /fhir failed with [${res.status}] body: ${await res.text()}`
    )
  }

  const responseBundle: TransactionResponse = await res.json()

  const ok = responseBundle.entry.every((e) =>
    e.response.status.startsWith('2')
  )
  if (!ok) {
    throw new Error(
      'Hearth was unable to create/update all the entires in the bundle'
    )
  }

  return responseBundle
}

function findSavedReference(
  temporaryReference: URNReference,
  resourceBundle: Bundle,
  responseBundle: TransactionResponse
): URLReference | null {
  const indexInResponseBundle = resourceBundle.entry.findIndex(
    (entry) => entry.fullUrl === temporaryReference
  )
  if (indexInResponseBundle === -1) {
    return null
  }
  return responseBundle.entry[indexInResponseBundle].response.location
}

function toSavedComposition(
  composition: Composition,
  id: UUID,
  resourceBundle: Bundle,
  responseBundle: TransactionResponse
): SavedComposition {
  return {
    ...composition,
    id,
    section: composition.section.map((section) => ({
      ...section,
      entry: section.entry.map((sectionEntry) => {
        if (isURLReference(sectionEntry.reference)) {
          return {
            ...sectionEntry,
            reference: sectionEntry.reference
          }
        }
        const savedReference = findSavedReference(
          sectionEntry.reference,
          resourceBundle,
          responseBundle
        )
        if (!savedReference) {
          throw Error(
            `No response found for "${`${section.title} -> ${sectionEntry.reference}`} in the following transaction: ${JSON.stringify(
              responseBundle
            )}"`
          )
        }
        return {
          ...sectionEntry,
          reference: savedReference
        }
      })
    }))
  }
}

/*
 * Only the references in Composition->section->entry->reference
 * are being resolved, the others e.g.
 * DocumentReference->extension->valueReference->reference
 * need to be added if needed
 */
export function toSavedBundle<T extends Resource>(
  resourceBundle: Bundle<T>,
  responseBundle: TransactionResponse
): SavedBundle<T> {
  return {
    ...resourceBundle,
    entry: resourceBundle.entry.map((entry, index) => {
      if (isComposition(entry.resource)) {
        return {
          fullUrl: responseBundle.entry[index].response.location,
          resource: toSavedComposition(
            entry.resource,
            urlReferenceToUUID(responseBundle.entry[index].response.location),
            resourceBundle,
            responseBundle
          )
        }
      }
      return {
        ...entry,
        fullUrl: responseBundle.entry[index].response.location,
        resource: {
          ...entry.resource,
          id: urlReferenceToUUID(responseBundle.entry[index].response.location)
        }
      }
    })
  } as SavedBundle<T>
}

export function mergeBundles(
  record: ValidRecord,
  newOrUpdatedResourcesBundle: SavedBundle
): SavedBundle {
  const existingResourceIds = record.entry.map(({ resource }) => resource.id)
  const newEntries = newOrUpdatedResourcesBundle.entry.filter(
    ({ resource }) => !existingResourceIds.includes(resource.id)
  )
  return {
    ...record,
    entry: [
      ...record.entry.map((previousEntry) => ({
        ...previousEntry,
        resource:
          newOrUpdatedResourcesBundle.entry.find(
            (newEntry) => newEntry.resource.id === previousEntry.resource.id
          )?.resource ?? previousEntry.resource
      })),
      ...newEntries
    ]
  }
}

export async function findTaskFromIdentifier(
  identifier: string
): Promise<Bundle<SavedTask>> {
  const res = await fetch(
    new URL(`/fhir/Task?identifier=${identifier}`, HEARTH_URL).href,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/fhir+json'
      }
    }
  )
  if (!res.ok) {
    throw new Error(
      `Fetching task history from Hearth failed with [${res.status}] body: ${res.statusText}`
    )
  }

  return res.json()
}

export async function getTaskHistory(taskId: string): Promise<Bundle<Task>> {
  const res = await fetch(
    new URL(`/fhir/Task/${taskId}/_history?_count=100`, HEARTH_URL).href,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/fhir+json'
      }
    }
  )
  if (!res.ok) {
    throw new Error(
      `Fetching task history from Hearth failed with [${res.status}] body: ${res.statusText}`
    )
  }

  return res.json()
}

export function sortTasksDescending(tasks: Task[]) {
  return tasks.slice().sort((a, b) => {
    return (
      new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
    )
  })
}
