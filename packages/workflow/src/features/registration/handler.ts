import * as Hapi from 'hapi'
import fetch from 'node-fetch'
import { fhirUrl } from 'src/constants'
import {
  modifyRegistrationBundle,
  markBundleAsRegistered,
  setTrackingId
} from './fhir/fhir-bundle-modifier'
import { sendBirthNotification } from './utils'
import { getTrackingId, getBirthRegistrationNumber } from './fhir/fhir-utils'
import { EVENT_TYPE } from './fhir/constants'
import { getTaskResource } from './fhir/fhir-template'
import { getToken } from 'src/utils/authUtils'
import { logger } from 'src/logger'

async function sendBundleToHearth(payload: fhir.Bundle, count = 1) {
  const res = await fetch(fhirUrl, {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/fhir+json'
    }
  })
  if (!res.ok) {
    if (res.status === 409 && count < 5) {
      setTrackingId(payload)
      await sendBundleToHearth(payload, count + 1)
      return
    }

    throw new Error(
      `FHIR post to /fhir failed with [${res.status}] body: ${await res.text()}`
    )
  }
}

export async function createBirthRegistrationHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  try {
    const payload = await modifyRegistrationBundle(
      request.payload as fhir.Bundle,
      EVENT_TYPE.BIRTH,
      getToken(request)
    )

    await sendBundleToHearth(payload)

    /* sending notification to the contact */
    sendBirthNotification(payload, {
      Authorization: request.headers.authorization
    })
    /* returning the newly created tracking id */
    return { trackingid: getTrackingId(payload) }
  } catch (error) {
    logger.error(`Workflow/createBirthRegistrationHandler: error: ${error}`)
    throw new Error(error)
  }
}

export async function markBirthAsRegisteredHandler(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  try {
    const payload = await markBundleAsRegistered(
      request.payload as fhir.Bundle & fhir.BundleEntry,
      getToken(request)
    )
    /* hearth will do put calls if it finds id on the bundle */
    const res = await fetch(fhirUrl, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: {
        'Content-Type': 'application/fhir+json'
      }
    })
    if (!res.ok) {
      throw new Error(
        `FHIR post to /fhir failed with [${
          res.status
        }] body: ${await res.text()}`
      )
    }
    // TODO: need to send notification here

    /* returning the newly created birth registration number */
    return {
      BirthRegistrationNumber: getBirthRegistrationNumber(getTaskResource(
        payload
      ) as fhir.Task)
    }
  } catch (error) {
    logger.error(`Workflow/markBirthAsRegisteredHandler: error: ${error}`)
    throw new Error(error)
  }
}
