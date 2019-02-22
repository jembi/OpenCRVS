import {
  buildFHIRBundle,
  updateFHIRTaskBundle
} from 'src/features/registration/fhir-builders'
import { GQLResolver } from 'src/graphql/schema'
import {
  fetchFHIR,
  getIDFromResponse,
  getTrackingIdFromResponse,
  getRegistrationNumberFromResponse,
  removeDuplicatesFromComposition
} from 'src/features/fhir/utils'
import { IAuthHeader } from 'src/common-types'
import { hasScope } from 'src/features/user/utils'
import { EVENT_TYPE } from '../fhir/constants'

export const resolvers: GQLResolver = {
  Query: {
    async fetchBirthRegistration(_, { id }, authHeader) {
      return await fetchFHIR(`/Composition/${id}`, authHeader)
    },
    async fetchDeathRegistration(_, { id }, authHeader) {
      return await fetchFHIR(`/Composition/${id}`, authHeader)
    },
    async queryRegistrationByIdentifier(_, { identifier }, authHeader) {
      const taskBundle = await fetchFHIR(
        `/Task?identifier=${identifier}`,
        authHeader
      )

      if (!taskBundle || !taskBundle.entry || !taskBundle.entry[0]) {
        throw new Error(`Task does not exist for identifer ${identifier}`)
      }
      const task = taskBundle.entry[0].resource as fhir.Task

      if (!task.focus || !task.focus.reference) {
        throw new Error(`Composition reference not found`)
      }

      return await fetchFHIR(`/${task.focus.reference}`, authHeader)
    },
    async queryPersonByIdentifier(_, { identifier }, authHeader) {
      const personBundle = await fetchFHIR(
        `/Patient?identifier=${identifier}`,
        authHeader
      )
      if (!personBundle || !personBundle.entry || !personBundle.entry[0]) {
        throw new Error(`Person does not exist for identifer ${identifier}`)
      }
      const person = personBundle.entry[0].resource as fhir.Person

      return person
    },
    async listEventRegistrations(
      _,
      { status = null, event = null, count = 0, skip = 0 },
      authHeader
    ) {
      if (event || status) {
        return getCompositions(status, event, authHeader, count, skip)
      } else {
        const bundle = await fetchFHIR(
          `/Composition?_count=${count}&_getpagesoffset=${skip}`,
          authHeader
        )
        return {
          results: bundle.entry.map(
            (entry: { resource: {} }) => entry.resource
          ),
          totalItems: bundle.total
        }
      }
    }
  },

  Mutation: {
    async createBirthRegistration(_, { details }, authHeader) {
      return await createEventRegistration(
        details,
        authHeader,
        EVENT_TYPE.BIRTH
      )
    },
    async createDeathRegistration(_, { details }, authHeader) {
      return await createEventRegistration(
        details,
        authHeader,
        EVENT_TYPE.DEATH
      )
    },
    async updateBirthRegistration(_, { details }, authHeader) {
      const doc = await buildFHIRBundle(details, EVENT_TYPE.BIRTH)

      const res = await fetchFHIR('', authHeader, 'POST', JSON.stringify(doc))
      // return composition-id
      return getIDFromResponse(res)
    },
    async markBirthAsRegistered(_, { id, details }, authHeader) {
      return await markEventAsRegistered(
        id,
        authHeader,
        EVENT_TYPE.BIRTH,
        details
      )
    },
    async markDeathAsRegistered(_, { id, details }, authHeader) {
      return await markEventAsRegistered(
        id,
        authHeader,
        EVENT_TYPE.DEATH,
        details
      )
    },
    async markEventAsVoided(_, { id, reason, comment }, authHeader) {
      const taskBundle = await fetchFHIR(
        `/Task?focus=Composition/${id}`,
        authHeader
      )
      const taskEntry = taskBundle.entry[0]
      if (!taskEntry) {
        throw new Error('Task does not exist')
      }
      const status = 'REJECTED'
      const newTaskBundle = await updateFHIRTaskBundle(
        taskEntry,
        status,
        reason,
        comment
      )
      await fetchFHIR('/Task', authHeader, 'PUT', JSON.stringify(newTaskBundle))
      // return the taskId
      return taskEntry.resource.id
    },
    async markBirthAsCertified(_, { details }, authHeader) {
      return await markEventAsCertified(details, authHeader, EVENT_TYPE.BIRTH)
    },
    async markDeathAsCertified(_, { details }, authHeader) {
      return await markEventAsCertified(details, authHeader, EVENT_TYPE.DEATH)
    },
    async notADuplicate(_, { id, duplicateId }, authHeader) {
      const composition = await fetchFHIR(
        `/Composition/${id}`,
        authHeader,
        'GET'
      )
      removeDuplicatesFromComposition(composition, id, duplicateId)
      await fetchFHIR(
        `/Composition/${id}`,
        authHeader,
        'PUT',
        JSON.stringify(composition)
      )
      return composition.id
    }
  }
}

async function createEventRegistration(
  details: any,
  authHeader: IAuthHeader,
  event: EVENT_TYPE
) {
  const doc = await buildFHIRBundle(details, event)

  const res = await fetchFHIR('', authHeader, 'POST', JSON.stringify(doc))
  if (hasScope(authHeader, 'register')) {
    // return the registrationNumber
    return await getRegistrationNumberFromResponse(res, event, authHeader)
  } else {
    // return tracking-id
    return await getTrackingIdFromResponse(res, authHeader)
  }
}

async function markEventAsRegistered(
  id: string,
  authHeader: IAuthHeader,
  event: EVENT_TYPE,
  details?: any
) {
  let doc
  if (!details) {
    const taskBundle = await fetchFHIR(
      `/Task?focus=Composition/${id}`,
      authHeader
    )
    if (!taskBundle || !taskBundle.entry || !taskBundle.entry[0]) {
      throw new Error('Task does not exist')
    }
    doc = {
      resourceType: 'Bundle',
      type: 'document',
      entry: taskBundle.entry
    }
  } else {
    doc = await buildFHIRBundle(details, event)
  }

  const res = await fetchFHIR('', authHeader, 'POST', JSON.stringify(doc))
  // return the registrationNumber
  return await getRegistrationNumberFromResponse(res, event, authHeader)
}

async function markEventAsCertified(
  details: any,
  authHeader: IAuthHeader,
  event: EVENT_TYPE
) {
  const doc = await buildFHIRBundle(details, event, authHeader)

  const res = await fetchFHIR('', authHeader, 'POST', JSON.stringify(doc))
  // return composition-id
  return getIDFromResponse(res)
}

async function getCompositions(
  status: string | null,
  event: string | null,
  authHeader: IAuthHeader,
  count: number,
  skip: number
) {
  const tasksResponse = (await fetchFHIR(
    `/Task?_count=0${event ? `&code=${event}` : ''}${
      status ? `&business-status=${status}` : ''
    }`,
    authHeader
  )) as fhir.Bundle

  const compositions =
    (tasksResponse.entry &&
      (await Promise.all(
        tasksResponse.entry.map((task: fhir.BundleEntry) => {
          const resource = task.resource as fhir.Task
          return (
            resource.focus &&
            fetchFHIR(`/${resource.focus.reference}`, authHeader)
          )
        })
      ))) ||
    []
  const flattened = compositions.reduce((a, b) => a && a.concat(b), [])

  const filteredComposition =
    flattened &&
    flattened.filter((composition: any) => composition !== undefined)

  // TODO: we should rather try do the skip and count in Hearth directly for efficiency, that would require a more complex query
  return {
    totalItems: (filteredComposition && filteredComposition.length) || 0,
    results:
      filteredComposition && filteredComposition.slice(skip, skip + count)
  }
}
