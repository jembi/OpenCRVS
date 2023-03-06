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
  declarationsStartedHandler,
  declarationStartedMetricsByPractitionersHandler
} from '@metrics/features/declarationsStarted/handler'
import {
  exportHandler,
  monthlyExportHandler
} from '@metrics/features/export/handler'
import { getEventDurationHandler } from '@metrics/features/getEventDuration/handler'
import { getTimeLoggedHandler } from '@metrics/features/getTimeLogged/handler'
import { locationWiseEventEstimationsHandler } from '@metrics/features/locationWiseEventEstimations/handler'
import {
  metricsDeleteMeasurementHandler,
  metricsHandler
} from '@metrics/features/metrics/handler'
import { monthWiseEventEstimationsHandler } from '@metrics/features/monthWiseEventEstimations/handler'

import {
  inProgressHandler,
  markBirthRegisteredHandler,
  markCertifiedHandler,
  markDeathRegisteredHandler,
  markRejectedHandler,
  markValidatedHandler,
  newBirthRegistrationHandler,
  newDeathRegistrationHandler,
  newDeclarationHandler,
  registrarRegistrationWaitingExternalValidationHandler,
  requestCorrectionHandler,
  requestForRegistrarValidationHandler,
  declarationAssignedHandler,
  declarationUnassignedHandler,
  waitingExternalValidationHandler,
  declarationViewedHandler,
  declarationDownloadedHandler,
  birthDeclarationArchivedHandler,
  deathDeclarationArchivedHandler,
  birthDeclarationReinstatedHandler,
  deathDeclarationReinstatedHandler,
  declarationUpdatedHandler,
  markIssuedHandler
} from '@metrics/features/registration/handler'
import {
  getAdvancedSearchByClient,
  postAdvancedSearchByClient,
  responseSchema
} from '@metrics/features/searchMetrics/handler'
import {
  totalMetricsByLocation,
  totalMetricsByRegistrar,
  totalMetricsByTime,
  totalMetricsHandler
} from '@metrics/features/totalMetrics/handler'
import { totalPaymentsHandler } from '@metrics/features/payments/handler'
import { totalCorrectionsHandler } from '@metrics/features/corrections/handler'
import { locationStatisticsHandler } from '@metrics/features/locationStatistics/handler'
import { totalCertificationsHandler } from '@metrics/features/certifications/handler'
import {
  getUserAuditsHandler,
  newAuditHandler
} from '@metrics/features/audit/handler'
import * as Joi from 'joi'
import {
  getAllVSExport,
  vsExportHandler
} from '@metrics/features/vsExport/handler'

const enum RouteScope {
  NATLSYSADMIN = 'natlsysadmin'
}

export const getRoutes = () => {
  const routes = [
    // In progress declaration
    {
      method: 'POST',
      path: '/events/birth/in-progress-declaration',
      handler: inProgressHandler,
      config: {
        tags: ['api']
      }
    },
    {
      method: 'POST',
      path: '/events/death/in-progress-declaration',
      handler: inProgressHandler,
      config: {
        tags: ['api']
      }
    },

    // New declaration
    {
      method: 'POST',
      path: '/events/birth/new-declaration',
      handler: newDeclarationHandler,
      config: {
        tags: ['api']
      }
    },
    {
      method: 'POST',
      path: '/events/death/new-declaration',
      handler: newDeclarationHandler,
      config: {
        tags: ['api']
      }
    },

    // Request for registrar validation
    {
      method: 'POST',
      path: '/events/birth/request-for-registrar-validation',
      handler: requestForRegistrarValidationHandler,
      config: {
        tags: ['api']
      }
    },
    {
      method: 'POST',
      path: '/events/death/request-for-registrar-validation',
      handler: requestForRegistrarValidationHandler,
      config: {
        tags: ['api']
      }
    },

    // Waiting external resource validation
    {
      method: 'POST',
      path: '/events/birth/waiting-external-resource-validation',
      handler: waitingExternalValidationHandler,
      config: {
        tags: ['api']
      }
    },
    {
      method: 'POST',
      path: '/events/death/waiting-external-resource-validation',
      handler: waitingExternalValidationHandler,
      config: {
        tags: ['api']
      }
    },
    {
      method: 'POST',
      path: '/events/birth/registrar-registration-waiting-external-resource-validation',
      handler: registrarRegistrationWaitingExternalValidationHandler,
      config: {
        tags: ['api']
      }
    },
    {
      method: 'POST',
      path: '/events/death/registrar-registration-waiting-external-resource-validation',
      handler: registrarRegistrationWaitingExternalValidationHandler,
      config: {
        tags: ['api']
      }
    },
    {
      method: 'POST',
      path: '/events/birth/new-registration',
      handler: newBirthRegistrationHandler,
      config: {
        tags: ['api']
      }
    },
    {
      method: 'POST',
      path: '/events/death/new-registration',
      handler: newDeathRegistrationHandler,
      config: {
        tags: ['api']
      }
    },

    // Mark validated
    {
      method: 'POST',
      path: '/events/birth/mark-validated',
      handler: markValidatedHandler,
      config: {
        tags: ['api']
      }
    },
    {
      method: 'POST',
      path: '/events/death/mark-validated',
      handler: markValidatedHandler,
      config: {
        tags: ['api']
      }
    },

    // Mark registered
    {
      method: 'POST',
      path: '/events/birth/mark-registered',
      handler: markBirthRegisteredHandler,
      config: {
        tags: ['api']
      }
    },
    {
      method: 'POST',
      path: '/events/death/mark-registered',
      handler: markDeathRegisteredHandler,
      config: {
        tags: ['api']
      }
    },

    // Mark certified
    {
      method: 'POST',
      path: '/events/birth/mark-certified',
      handler: markCertifiedHandler,
      config: {
        tags: ['api']
      }
    },
    {
      method: 'POST',
      path: '/events/death/mark-certified',
      handler: markCertifiedHandler,
      config: {
        tags: ['api']
      }
    },

    // Mark issued
    {
      method: 'POST',
      path: '/events/birth/mark-issued',
      handler: markIssuedHandler,
      config: {
        tags: ['api']
      }
    },
    {
      method: 'POST',
      path: '/events/death/mark-issued',
      handler: markIssuedHandler,
      config: {
        tags: ['api']
      }
    },

    // Mark rejected
    {
      method: 'POST',
      path: '/events/birth/mark-voided',
      handler: markRejectedHandler,
      config: {
        tags: ['api']
      }
    },
    {
      method: 'POST',
      path: '/events/death/mark-voided',
      handler: markRejectedHandler,
      config: {
        tags: ['api']
      }
    },

    // Advanced Search quota
    {
      method: 'GET',
      path: '/advancedSearch',
      handler: getAdvancedSearchByClient,
      config: {
        tags: ['api'],
        response: {
          schema: responseSchema
        }
      }
    },
    {
      method: 'POST',
      path: '/advancedSearch',
      handler: postAdvancedSearchByClient,
      config: {
        tags: ['api']
      }
    },

    // Request correction
    {
      method: 'POST',
      path: '/events/birth/request-correction',
      handler: requestCorrectionHandler,
      config: {
        tags: ['api']
      }
    },
    {
      method: 'POST',
      path: '/events/death/request-correction',
      handler: requestCorrectionHandler,
      config: {
        tags: ['api']
      }
    },
    // Event assigned / unassigned
    {
      method: 'POST',
      path: '/events/assigned',
      handler: declarationAssignedHandler,
      config: {
        tags: ['api']
      }
    },
    {
      method: 'POST',
      path: '/events/downloaded',
      handler: declarationDownloadedHandler,
      config: {
        tags: ['api']
      }
    },
    {
      method: 'POST',
      path: '/events/viewed',
      handler: declarationViewedHandler,
      config: {
        tags: ['api']
      }
    },
    {
      method: 'POST',
      path: '/events/birth/mark-archived',
      handler: birthDeclarationArchivedHandler,
      config: {
        tags: ['api']
      }
    },
    {
      method: 'POST',
      path: '/events/death/mark-archived',
      handler: deathDeclarationArchivedHandler,
      config: {
        tags: ['api']
      }
    },
    {
      method: 'POST',
      path: '/events/birth/mark-reinstated',
      handler: birthDeclarationReinstatedHandler,
      config: {
        tags: ['api']
      }
    },
    {
      method: 'POST',
      path: '/events/death/mark-reinstated',
      handler: deathDeclarationReinstatedHandler,
      config: {
        tags: ['api']
      }
    },
    {
      method: 'POST',
      path: '/events/unassigned',
      handler: declarationUnassignedHandler,
      config: {
        tags: ['api']
      }
    },
    {
      method: 'POST',
      path: '/events/declaration-updated',
      handler: declarationUpdatedHandler,
      config: {
        tags: ['api']
      }
    },

    // Metrics query API
    {
      method: 'GET',
      path: '/metrics',
      handler: metricsHandler,
      config: {
        validate: {
          query: Joi.object({
            timeStart: Joi.string().required(),
            timeEnd: Joi.string().required(),
            locationId: Joi.string().required(),
            event: Joi.string().required()
          })
        },
        tags: ['api']
      }
    },

    // Area wise declarations started query API
    {
      method: 'GET',
      path: '/declarationsStarted',
      handler: declarationsStartedHandler,
      config: {
        validate: {
          query: Joi.object({
            timeStart: Joi.string().required(),
            timeEnd: Joi.string().required(),
            locationId: Joi.string().required()
          })
        },
        tags: ['api']
      }
    },

    {
      method: 'GET',
      path: '/totalMetrics',
      handler: totalMetricsHandler,
      config: {
        validate: {
          query: Joi.object({
            timeStart: Joi.string().required(),
            timeEnd: Joi.string().required(),
            locationId: Joi.string(),
            event: Joi.string().required()
          })
        },
        tags: ['api']
      }
    },

    {
      method: 'GET',
      path: '/totalMetricsByRegistrar',
      handler: totalMetricsByRegistrar,
      config: {
        validate: {
          query: Joi.object({
            timeStart: Joi.string().required(),
            timeEnd: Joi.string().required(),
            locationId: Joi.string(),
            event: Joi.string().required(),
            skip: Joi.number().required(),
            size: Joi.number().required()
          })
        },
        tags: ['api']
      }
    },

    {
      method: 'GET',
      path: '/totalMetricsByLocation',
      handler: totalMetricsByLocation,
      config: {
        validate: {
          query: Joi.object({
            timeStart: Joi.string().required(),
            timeEnd: Joi.string().required(),
            event: Joi.string().required(),
            locationId: Joi.string(),
            skip: Joi.number().required(),
            size: Joi.number().required()
          })
        },
        tags: ['api']
      }
    },
    {
      method: 'GET',
      path: '/totalMetricsByTime',
      handler: totalMetricsByTime,
      config: {
        validate: {
          query: Joi.object({
            timeStart: Joi.string().required(),
            timeEnd: Joi.string().required(),
            event: Joi.string().required(),
            locationId: Joi.string(),
            skip: Joi.number().required(),
            size: Joi.number().required()
          })
        },
        tags: ['api']
      }
    },
    {
      method: 'GET',
      path: '/totalPayments',
      handler: totalPaymentsHandler,
      config: {
        validate: {
          query: Joi.object({
            timeStart: Joi.string().required(),
            timeEnd: Joi.string().required(),
            locationId: Joi.string(),
            event: Joi.string().required()
          })
        },
        tags: ['api']
      }
    },
    {
      method: 'GET',
      path: '/totalCertifications',
      handler: totalCertificationsHandler,
      config: {
        validate: {
          query: Joi.object({
            timeStart: Joi.string().required(),
            timeEnd: Joi.string().required(),
            locationId: Joi.string()
          })
        },
        tags: ['api']
      }
    },
    {
      method: 'GET',
      path: '/totalCorrections',
      handler: totalCorrectionsHandler,
      config: {
        validate: {
          query: Joi.object({
            timeStart: Joi.string().required(),
            timeEnd: Joi.string().required(),
            locationId: Joi.string(),
            event: Joi.string().required()
          })
        },
        tags: ['api']
      }
    },
    {
      method: 'GET',
      path: '/locationStatistics',
      handler: locationStatisticsHandler,
      config: {
        validate: {
          query: Joi.object({
            locationId: Joi.string(),
            populationYear: Joi.string()
          })
        },
        tags: ['api']
      }
    },

    {
      method: 'GET',
      path: '/monthWiseEventEstimations',
      handler: monthWiseEventEstimationsHandler,
      config: {
        validate: {
          query: Joi.object({
            timeStart: Joi.string().required(),
            timeEnd: Joi.string().required(),
            locationId: Joi.string(),
            event: Joi.string().required()
          })
        },
        tags: ['api']
      }
    },

    {
      method: 'GET',
      path: '/locationWiseEventEstimations',
      handler: locationWiseEventEstimationsHandler,
      config: {
        validate: {
          query: Joi.object({
            timeStart: Joi.string().required(),
            timeEnd: Joi.string().required(),
            locationId: Joi.string(),
            event: Joi.string().required()
          })
        },
        tags: ['api']
      }
    },
    // event duration query by declaration id
    {
      method: 'GET',
      path: '/eventDuration',
      handler: getEventDurationHandler,
      config: {
        validate: {
          query: Joi.object({
            compositionId: Joi.string().required()
          })
        },
        tags: ['api']
      }
    },
    // Time logged query by declaration status API
    {
      method: 'GET',
      path: '/timeLogged',
      handler: getTimeLoggedHandler,
      config: {
        validate: {
          query: Joi.object({
            compositionId: Joi.string().required(),
            status: Joi.string().optional()
          })
        },
        tags: ['api']
      }
    },

    // Time logged query by declaration status API
    {
      method: 'GET',
      path: '/timeLoggedMetricsByPractitioner',
      handler: getTimeLoggedHandler,
      config: {
        validate: {
          query: Joi.object({
            timeStart: Joi.string().required(),
            timeEnd: Joi.string().required(),
            practitionerId: Joi.string().required(),
            locationId: Joi.string().required(),
            count: Joi.number().required()
          })
        },
        tags: ['api']
      }
    },

    {
      method: 'POST',
      path: '/declarationStartedMetricsByPractitioners',
      handler: declarationStartedMetricsByPractitionersHandler,
      config: {
        validate: {
          payload: Joi.object({
            timeStart: Joi.string().required(),
            timeEnd: Joi.string().required(),
            locationId: Joi.string().required(),
            event: Joi.string().optional(),
            practitionerIds: Joi.array().required()
          })
        },
        tags: ['api']
      }
    },

    // Export all data from InfluxDB to CSV
    {
      method: 'GET',
      path: '/export',
      handler: exportHandler,
      config: {
        tags: ['api']
      }
    },
    // Export all data from InfluxDB to CSV
    {
      method: 'GET',
      path: '/monthlyExport',
      handler: monthlyExportHandler,
      config: {
        validate: {
          query: Joi.object({
            timeStart: Joi.string().required(),
            timeEnd: Joi.string().required(),
            locationId: Joi.string().required(),
            event: Joi.string().required()
          })
        },
        tags: ['api']
      }
    },
    {
      method: 'GET',
      path: '/vsExport',
      handler: vsExportHandler,
      config: {
        tags: ['api'],
        auth: false
      }
    },
    {
      method: 'GET',
      path: '/fetchVSExport',
      handler: getAllVSExport,
      config: {
        tags: ['api']
      }
    },
    // used for tests to check JWT auth
    {
      method: 'GET',
      path: '/tokenTest',
      handler: (request: any, h: any) => {
        return 'success'
      },
      config: {
        tags: ['api']
      }
    },

    // add ping route by default for health check
    {
      method: 'GET',
      path: '/ping',
      handler: (request: any, h: any) => {
        // Perform any health checks and return true or false for success prop
        return {
          success: true
        }
      },
      config: {
        auth: false,
        tags: ['api'],
        description: 'Health check endpoint'
      }
    },
    // delete all measurements ocrvs database from influx
    {
      method: 'DELETE',
      path: '/influxMeasurement',
      handler: metricsDeleteMeasurementHandler,
      config: {
        auth: {
          scope: [RouteScope.NATLSYSADMIN]
        },
        tags: ['api']
      }
    },
    // new Audit handler
    {
      method: 'POST',
      path: '/audit/events',
      handler: newAuditHandler,
      config: {
        tags: ['api'],
        auth: false
      }
    },
    // GET user audit events
    {
      method: 'GET',
      path: '/audit/events',
      handler: getUserAuditsHandler,
      config: {
        validate: {
          query: Joi.object({
            practitionerId: Joi.string().required(),
            skip: Joi.number(),
            count: Joi.number(),
            timeStart: Joi.string(),
            timeEnd: Joi.string()
          })
        },
        tags: ['api']
      }
    }
  ]
  return routes
}
