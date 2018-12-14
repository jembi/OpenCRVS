import { findCompositionSection, findExtension } from 'src/features/fhir/utils'
import {
  MOTHER_CODE,
  FATHER_CODE,
  CHILD_CODE,
  DOCS_CODE,
  BIRTH_ENCOUNTER_CODE,
  BODY_WEIGHT_CODE,
  BIRTH_TYPE_CODE,
  BIRTH_ATTENDANT_CODE,
  BIRTH_REG_PRESENT_CODE,
  BIRTH_REG_TYPE_CODE,
  LAST_LIVE_BIRTH_CODE,
  NUMBER_BORN_ALIVE_CODE,
  NUMBER_FOEATAL_DEATH_CODE
} from 'src/features/fhir/templates'
import fetch from 'node-fetch'
import { fhirUrl } from 'src/constants'
import { GQLResolver } from 'src/graphql/schema'
import {
  ORIGINAL_FILE_NAME_SYSTEM,
  SYSTEM_FILE_NAME_SYSTEM,
  FHIR_SPECIFICATION_URL,
  OPENCRVS_SPECIFICATION_URL
} from 'src/features/fhir/constants'
import { ITemplatedComposition } from './fhir-builders'

export const typeResolvers: GQLResolver = {
  HumanName: {
    firstNames(name) {
      return name.given.join(' ')
    },
    familyName(name) {
      return name.family.join(' ')
    }
  },

  Person: {
    /* `gender` and `name` resolvers are trivial resolvers, so they don't need implementation */
    dateOfMarriage: person => {
      const marriageExtension = findExtension(
        `${OPENCRVS_SPECIFICATION_URL}extension/date-of-marriage`,
        person.extension
      )
      return (marriageExtension && marriageExtension.valueDateTime) || null
    },
    maritalStatus: person => {
      return person.maritalStatus.text
    },
    multipleBirth: person => {
      return person.multipleBirthInteger
    },
    deceased: person => {
      return person.deceasedBoolean
    },
    nationality: person => {
      const nationalityExtension = findExtension(
        `${FHIR_SPECIFICATION_URL}patient-nationality`,
        person.extension
      )
      if (!nationalityExtension || !nationalityExtension.extension) {
        return null
      }
      const countryCodeExtension = findExtension(
        'code',
        nationalityExtension.extension
      )

      const coding =
        (countryCodeExtension &&
          countryCodeExtension.valueCodeableConcept &&
          countryCodeExtension.valueCodeableConcept.coding &&
          countryCodeExtension.valueCodeableConcept.coding) ||
        []

      // Nationality could be multiple
      const nationality = coding.map(n => {
        return n.code
      })

      return nationality
    },
    educationalAttainment: person => {
      const educationalAttainmentExtension = findExtension(
        `${OPENCRVS_SPECIFICATION_URL}extension/educational-attainment`,
        person.extension
      )
      return (
        (educationalAttainmentExtension &&
          educationalAttainmentExtension.valueString) ||
        null
      )
    }
  },

  Registration: {
    async trackingId(task: fhir.Task) {
      const foundIdentifier =
        task.identifier &&
        task.identifier.find(
          (identifier: fhir.Identifier) =>
            identifier.system ===
            `${OPENCRVS_SPECIFICATION_URL}id/birth-tracking-id`
        )

      return (foundIdentifier && foundIdentifier.value) || null
    },
    async attachments(task: fhir.Task) {
      if (!task.focus) {
        throw new Error(
          'Task resource does not have a focus property necessary to lookup the composition'
        )
      }

      const res = await fetch(`${fhirUrl}/${task.focus.reference}`)
      const composition = await res.json()
      const docSection = findCompositionSection(DOCS_CODE, composition)
      if (!docSection || !docSection.entry) {
        return null
      }
      const docRefReferences = docSection.entry.map(
        (docRefEntry: fhir.Reference) => docRefEntry.reference
      )
      return docRefReferences.map(async (docRefReference: string) => {
        const docRefRes = await fetch(`${fhirUrl}/${docRefReference}`)
        return docRefRes.json()
      })
    },
    contact: task => {
      const contact = findExtension(
        `${OPENCRVS_SPECIFICATION_URL}extension/contact-person`,
        task.extension
      )
      return (contact && contact.valueString) || null
    },
    paperFormID: task => {
      const foundIdentifier =
        task.identifier &&
        task.identifier.find(
          (identifier: fhir.Identifier) =>
            identifier.system ===
            `${OPENCRVS_SPECIFICATION_URL}id/paper-form-id`
        )

      return (foundIdentifier && foundIdentifier.value) || null
    },
    page: task => {
      const foundIdentifier =
        task.identifier &&
        task.identifier.find(
          (identifier: fhir.Identifier) =>
            identifier.system ===
            `${OPENCRVS_SPECIFICATION_URL}id/paper-form-page`
        )

      return (foundIdentifier && foundIdentifier.value) || null
    },
    book: task => {
      const foundIdentifier =
        task.identifier &&
        task.identifier.find(
          (identifier: fhir.Identifier) =>
            identifier.system ===
            `${OPENCRVS_SPECIFICATION_URL}id/paper-form-book`
        )

      return (foundIdentifier && foundIdentifier.value) || null
    },
    status: async task => {
      const taskArrary = []
      taskArrary.push(task)
      return taskArrary
    },
    type: task => {
      const taskType = task.code
      const taskCode = taskType.coding.find(
        (coding: fhir.Coding) =>
          coding.system === `${OPENCRVS_SPECIFICATION_URL}types`
      )
      return (taskCode && taskCode.code) || null
    },
    duplicates: async task => {
      if (!task.focus) {
        throw new Error(
          'Task resource does not have a focus property necessary to lookup the composition'
        )
      }

      const res = await fetch(`${fhirUrl}/${task.focus.reference}`)
      const composition = await res.json()
      return composition.relatesTo.map(
        (duplicate: fhir.CompositionRelatesTo) =>
          duplicate.targetReference && duplicate.targetReference.reference
      )
    }
  },
  RegWorkflow: {
    type: (task: fhir.Task) => {
      const taskStatus = task.businessStatus
      const taskStatusCoding = taskStatus && taskStatus.coding
      const statusType =
        taskStatusCoding &&
        taskStatusCoding.find(
          (coding: fhir.Coding) =>
            coding.system === `${OPENCRVS_SPECIFICATION_URL}reg-status`
        )

      return (statusType && statusType.code) || null
    },
    user: async task => {
      const user = findExtension(
        `${OPENCRVS_SPECIFICATION_URL}extension/regLastUser`,
        task.extension
      )
      if (!user) {
        return null
      }

      const res = await fetch(`${fhirUrl}/${user.valueString}`)
      return res.json()
    },

    timestamp: task => task.lastModified,
    comments: task => task.note,
    location: async task => {
      const taskLocation = findExtension(
        `${OPENCRVS_SPECIFICATION_URL}extension/regLastLocation`,
        task.extension
      )
      if (!taskLocation) {
        return null
      }
      const res = await fetch(`${fhirUrl}/${taskLocation.valueString}`)
      return res.json()
    }
  },
  User: {
    role: async user => {
      const practitionerRoleResponse = await fetch(
        `${fhirUrl}/PractitionerRole?practitioner=${user.id}`
      )
      const practitionerRole = await practitionerRoleResponse.json()
      const roleEntry = practitionerRole.entry[0].resource
      if (
        !roleEntry ||
        !roleEntry.code ||
        !roleEntry.code[0] ||
        !roleEntry.code[0].coding ||
        !roleEntry.code[0].coding[0] ||
        !roleEntry.code[0].coding[0].code
      ) {
        throw new Error('PractitionerRole has no role code')
      }
      const role = roleEntry.code[0].coding[0].code

      return role
    }
  },
  Comment: {
    user: comment => comment.authorString,
    comment: comment => comment.text,
    createdAt: comment => comment.time
  },
  Attachment: {
    id(docRef: fhir.DocumentReference) {
      return (docRef.masterIdentifier && docRef.masterIdentifier.value) || null
    },
    data(docRef: fhir.DocumentReference) {
      return docRef.content[0].attachment.data
    },
    contentType(docRef: fhir.DocumentReference) {
      return docRef.content[0].attachment.contentType
    },
    originalFileName(docRef: fhir.DocumentReference) {
      const foundIdentifier =
        docRef.identifier &&
        docRef.identifier.find(
          (identifier: fhir.Identifier) =>
            identifier.system === ORIGINAL_FILE_NAME_SYSTEM
        )
      return (foundIdentifier && foundIdentifier.value) || null
    },
    systemFileName(docRef: fhir.DocumentReference) {
      const foundIdentifier =
        docRef.identifier &&
        docRef.identifier.find(
          (identifier: fhir.Identifier) =>
            identifier.system === SYSTEM_FILE_NAME_SYSTEM
        )
      return (foundIdentifier && foundIdentifier.value) || null
    },
    type(docRef: fhir.DocumentReference) {
      return (
        (docRef.type && docRef.type.coding && docRef.type.coding[0].code) ||
        null
      )
    },
    subject(docRef: fhir.DocumentReference) {
      return (docRef.subject && docRef.subject.display) || null
    },
    createdAt(docRef: fhir.DocumentReference) {
      return docRef.created
    }
  },

  Identifier: {
    system: identifier => identifier.system,
    value: identifier => identifier.value
  },

  Location: {
    name: location => location.name,
    status: location => location.status,
    identifier: location => location.identifier,
    longitude: location => location.position.longitude,
    latitude: location => location.position.latitude
  },

  BirthRegistration: {
    createdAt(composition: ITemplatedComposition) {
      return composition.date
    },
    async mother(composition: ITemplatedComposition) {
      const patientSection = findCompositionSection(MOTHER_CODE, composition)
      if (!patientSection || !patientSection.entry) {
        return null
      }
      const res = await fetch(`${fhirUrl}/${patientSection.entry[0].reference}`)
      return res.json()
    },
    async father(composition: ITemplatedComposition) {
      const patientSection = findCompositionSection(FATHER_CODE, composition)
      if (!patientSection || !patientSection.entry) {
        return null
      }
      const res = await fetch(`${fhirUrl}/${patientSection.entry[0].reference}`)
      return res.json()
    },
    async child(composition: ITemplatedComposition) {
      const patientSection = findCompositionSection(CHILD_CODE, composition)
      if (!patientSection || !patientSection.entry) {
        return null
      }
      const res = await fetch(`${fhirUrl}/${patientSection.entry[0].reference}`)
      return res.json()
    },
    async registration(composition: ITemplatedComposition) {
      const res = await fetch(
        `${fhirUrl}/Task?focus=Composition/${composition.id}`
      ) // TODO this is returning all tasks no matter what
      const taskBundle = await res.json()

      if (!taskBundle.entry[0] || !taskBundle.entry[0].resource) {
        return null
      }
      return taskBundle.entry[0].resource
    },
    async weightAtBirth(composition: ITemplatedComposition) {
      const encounterSection = findCompositionSection(
        BIRTH_ENCOUNTER_CODE,
        composition
      )
      if (!encounterSection || !encounterSection.entry) {
        return null
      }
      const res = await fetch(
        `${fhirUrl}/Observation?encounter=${
          encounterSection.entry[0].reference
        }&code=${BODY_WEIGHT_CODE}`
      )
      const data = await res.json()
      return data.entry[0].resource.valueQuantity.value
    },
    async birthType(composition: ITemplatedComposition) {
      const encounterSection = findCompositionSection(
        BIRTH_ENCOUNTER_CODE,
        composition
      )
      if (!encounterSection || !encounterSection.entry) {
        return null
      }
      const res = await fetch(
        `${fhirUrl}/Observation?encounter=${
          encounterSection.entry[0].reference
        }&code=${BIRTH_TYPE_CODE}`
      )
      const data = await res.json()
      return data.entry[0].resource.valueQuantity.value
    },
    async attendantAtBirth(composition: ITemplatedComposition) {
      const encounterSection = findCompositionSection(
        BIRTH_ENCOUNTER_CODE,
        composition
      )
      if (!encounterSection || !encounterSection.entry) {
        return null
      }
      const res = await fetch(
        `${fhirUrl}/Observation?encounter=${
          encounterSection.entry[0].reference
        }&code=${BIRTH_ATTENDANT_CODE}`
      )
      const data = await res.json()
      return data.entry[0].resource.valueString
    },
    async birthRegistrationType(composition: ITemplatedComposition) {
      const encounterSection = findCompositionSection(
        BIRTH_ENCOUNTER_CODE,
        composition
      )
      if (!encounterSection || !encounterSection.entry) {
        return null
      }
      const res = await fetch(
        `${fhirUrl}/Observation?encounter=${
          encounterSection.entry[0].reference
        }&code=${BIRTH_REG_TYPE_CODE}`
      )
      const data = await res.json()
      return data.entry[0].resource.valueString
    },
    async presentAtBirthRegistration(composition: ITemplatedComposition) {
      const encounterSection = findCompositionSection(
        BIRTH_ENCOUNTER_CODE,
        composition
      )
      if (!encounterSection || !encounterSection.entry) {
        return null
      }
      const res = await fetch(
        `${fhirUrl}/Observation?encounter=${
          encounterSection.entry[0].reference
        }&code=${BIRTH_REG_PRESENT_CODE}`
      )
      const data = await res.json()
      return data.entry[0].resource.valueString
    },
    async childrenBornAliveToMother(composition: ITemplatedComposition) {
      const encounterSection = findCompositionSection(
        BIRTH_ENCOUNTER_CODE,
        composition
      )
      if (!encounterSection || !encounterSection.entry) {
        return null
      }
      const res = await fetch(
        `${fhirUrl}/Observation?encounter=${
          encounterSection.entry[0].reference
        }&code=${NUMBER_BORN_ALIVE_CODE}`
      )
      const data = await res.json()
      return data.resource.valueInteger
    },
    async foetalDeathsToMother(composition: ITemplatedComposition) {
      const encounterSection = findCompositionSection(
        BIRTH_ENCOUNTER_CODE,
        composition
      )
      if (!encounterSection || !encounterSection.entry) {
        return null
      }
      const res = await fetch(
        `${fhirUrl}/Observation?encounter=${
          encounterSection.entry[0].reference
        }&code=${NUMBER_FOEATAL_DEATH_CODE}`
      )
      const data = await res.json()
      return data.resource.valueInteger
    },
    async lastPreviousLiveBirth(composition: ITemplatedComposition) {
      const encounterSection = findCompositionSection(
        BIRTH_ENCOUNTER_CODE,
        composition
      )
      if (!encounterSection || !encounterSection.entry) {
        return null
      }
      const res = await fetch(
        `${fhirUrl}/Observation?encounter=${
          encounterSection.entry[0].reference
        }&code=${LAST_LIVE_BIRTH_CODE}`
      )
      const data = await res.json()
      return data.resource.valueDateTime
    },
    async birthLocation(composition: ITemplatedComposition) {
      const encounterSection = findCompositionSection(
        BIRTH_ENCOUNTER_CODE,
        composition
      )
      if (!encounterSection || !encounterSection.entry) {
        return null
      }
      const res = await fetch(
        `${fhirUrl}/${encounterSection.entry[0].reference}`
      )
      const data = await res.json()

      if (!data || !data.location || !data.location[0].location) {
        return null
      }

      const locationRes = await fetch(
        `${fhirUrl}/${data.location[0].location.reference}`
      )
      return locationRes.json()
    }
  }
}
