import * as Hapi from 'hapi'
import {
  createRegistrationHandler,
  markEventAsRegisteredHandler,
  markEventAsCertifiedHandler
} from '@workflow/features/registration/handler'
import {
  hasBirthRegistrationNumber,
  hasDeathRegistrationNumber
} from '@workflow/features/registration/fhir/fhir-utils'
import updateTaskHandler from '@workflow/features/task/handler'
import { HEARTH_URL, OPENHIM_URL } from '@workflow/constants'
import fetch, { RequestInit } from 'node-fetch'
import { logger } from '@workflow/logger'
import { isUserAuthorized } from '@workflow/features/events/auth'
import { EVENT_TYPE } from '@workflow/features/registration/fhir/constants'
import { getEventType } from '@workflow/features/registration/utils'
import { hasRegisterScope } from '@workflow/utils/authUtils'

export enum Events {
  BIRTH_NEW_DEC = '/events/birth/new-declaration',
  BIRTH_UPDATE_DEC = '/events/birth/update-declaration',
  BIRTH_NEW_REG = '/events/birth/new-registration',
  BIRTH_REG = '/events/birth/registration',
  BIRTH_MARK_REG = '/events/birth/mark-registered',
  BIRTH_MARK_CERT = '/events/birth/mark-certified',
  BIRTH_MARK_VOID = '/events/birth/mark-voided',
  DEATH_NEW_DEC = '/events/death/new-declaration',
  DEATH_UPDATE_DEC = '/events/death/update-declaration',
  DEATH_NEW_REG = '/events/death/new-registration',
  DEATH_REG = '/events/death/registration',
  DEATH_MARK_REG = '/events/death/mark-registered',
  DEATH_MARK_CERT = '/events/death/mark-certified',
  DEATH_MARK_VOID = '/events/death/mark-voided',
  UNKNOWN = 'unknown'
}

function detectEvent(request: Hapi.Request): Events {
  if (
    request.method === 'post' &&
    (request.path === '/fhir' || request.path === '/fhir/')
  ) {
    const fhirBundle = request.payload as fhir.Bundle
    if (
      fhirBundle.entry &&
      fhirBundle.entry[0] &&
      fhirBundle.entry[0].resource
    ) {
      const firstEntry = fhirBundle.entry[0].resource
      if (firstEntry.resourceType === 'Composition') {
        const eventType = getEventType(fhirBundle)
        if (eventType === EVENT_TYPE.BIRTH) {
          if (firstEntry.id) {
            if (!hasBirthRegistrationNumber(fhirBundle)) {
              return Events.BIRTH_MARK_REG
            } else {
              return Events.BIRTH_MARK_CERT
            }
          } else {
            if (hasRegisterScope(request)) {
              return Events.BIRTH_NEW_REG
            }
            return Events.BIRTH_NEW_DEC
          }
        } else if (eventType === EVENT_TYPE.DEATH) {
          if (firstEntry.id) {
            if (!hasDeathRegistrationNumber(fhirBundle)) {
              return Events.DEATH_MARK_REG
            } else {
              return Events.DEATH_MARK_CERT
            }
          } else {
            if (hasRegisterScope(request)) {
              return Events.DEATH_NEW_REG
            }
            return Events.DEATH_NEW_DEC
          }
        }
      }
      if (firstEntry.resourceType === 'Task' && firstEntry.id) {
        const eventType = getEventType(fhirBundle)
        if (eventType === EVENT_TYPE.BIRTH) {
          return Events.BIRTH_MARK_REG
        } else if (eventType === EVENT_TYPE.DEATH) {
          return Events.DEATH_MARK_REG
        }
      }
    }
  }

  if (request.method === 'put' && request.path.includes('/fhir/Task')) {
    const eventType = getEventType(request.payload as fhir.Bundle)
    if (eventType === EVENT_TYPE.BIRTH) {
      return Events.BIRTH_MARK_VOID
    } else if (eventType === EVENT_TYPE.DEATH) {
      return Events.DEATH_MARK_VOID
    }
  }

  return Events.UNKNOWN
}

async function forwardToHearth(request: Hapi.Request, h: Hapi.ResponseToolkit) {
  logger.info(
    `Forwarding to Hearth unchanged: ${request.method} ${request.path}`
  )

  const requestOpts: RequestInit = {
    method: request.method,
    headers: {
      'Content-Type': 'application/fhir+json'
    }
  }

  let path = request.path
  if (request.method === 'post' || request.method === 'put') {
    requestOpts.body = JSON.stringify(request.payload)
  } else if (request.method === 'get' && request.url.path) {
    path = request.url.path
  }
  const res = await fetch(HEARTH_URL + path.replace('/fhir', ''), requestOpts)
  const resBody = await res.text()
  const response = h.response(resBody)

  response.code(res.status)
  res.headers.forEach((headerVal, headerName) => {
    response.header(headerName, headerVal)
  })

  return response
}

export async function fhirWorkflowEventHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const event = detectEvent(request)
  logger.info(`Event detected: ${event}`)

  // Unknown event are allowed through to Hearth by default.
  // We can restrict what resources can be used in Hearth directly if necessary
  if (
    event !== Events.UNKNOWN &&
    !isUserAuthorized(request.auth.credentials.scope, event)
  ) {
    return h.response().code(401)
  }

  let response

  switch (event) {
    case Events.BIRTH_NEW_DEC:
      response = await createRegistrationHandler(request, h, event)
      forwardToOpenHim(Events.BIRTH_NEW_DEC, request)
      break
    case Events.BIRTH_NEW_REG:
      response = await createRegistrationHandler(request, h, event)
      forwardToOpenHim(Events.BIRTH_NEW_REG, request)
      break
    case Events.DEATH_NEW_DEC:
      response = await createRegistrationHandler(request, h, event)
      forwardToOpenHim(Events.DEATH_NEW_DEC, request)
      break
    case Events.DEATH_NEW_REG:
      response = await createRegistrationHandler(request, h, event)
      forwardToOpenHim(Events.DEATH_NEW_REG, request)
      break
    case Events.BIRTH_MARK_REG:
      response = await markEventAsRegisteredHandler(request, h, event)
      forwardToOpenHim(Events.BIRTH_REG, request)
      break
    case Events.DEATH_MARK_REG:
      response = await markEventAsRegisteredHandler(request, h, event)
      forwardToOpenHim(Events.DEATH_REG, request)
      break
    case Events.BIRTH_MARK_CERT:
      response = await markEventAsCertifiedHandler(request, h)
      forwardToOpenHim(Events.BIRTH_MARK_CERT, request)
      break
    case Events.DEATH_MARK_CERT:
      response = await markEventAsCertifiedHandler(request, h)
      forwardToOpenHim(Events.DEATH_MARK_CERT, request)
      break
    case Events.BIRTH_MARK_VOID:
      response = await updateTaskHandler(request, h)
      forwardToOpenHim(Events.BIRTH_MARK_VOID, request)
      break
    case Events.DEATH_MARK_VOID:
      response = await updateTaskHandler(request, h)
      forwardToOpenHim(Events.DEATH_MARK_VOID, request)
      break
    default:
      // forward as-is to hearth
      response = await forwardToHearth(request, h)
  }

  // TODO: send to event channels here
  return response
}

async function forwardToOpenHim(event: Events, request: Hapi.Request) {
  const fhirBundle = request.payload as fhir.Bundle
  try {
    await fetch(`${OPENHIM_URL}${event}`, {
      method: 'POST',
      body: JSON.stringify(fhirBundle),
      headers: {
        'Content-Type': 'application/json',
        Authorization: request.headers.authorization
      }
    })
  } catch (err) {
    logger.error(`Unable to forward to openhim for error : ${err}`)
  }
}
