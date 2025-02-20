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
import activateUser, {
  requestSchema as activateUserRequestSchema
} from '@user-mgnt/features/activateUser/handler'
import changePasswordHandler, {
  changePasswordRequestSchema
} from '@user-mgnt/features/changePassword/handler'
import changeAvatarHandler, {
  changeAvatarRequestSchema
} from '@user-mgnt/features/changeAvatar/handler'
import createUser from '@user-mgnt/features/createUser/handler'
import getUser, {
  getUserRequestSchema
} from '@user-mgnt/features/getUser/handler'
import getUserMobile, {
  requestSchema as userIdSchema,
  responseSchema as resMobileSchema
} from '@user-mgnt/features/getUserMobile/handler'
import searchUsers, {
  searchSchema
} from '@user-mgnt/features/searchUsers/handler'
import updateUser from '@user-mgnt/features/updateUser/handler'
import {
  requestSchema as userAuditSchema,
  userAuditHandler
} from '@user-mgnt/features/userAudit/handler'
import verifyPassHandler, {
  requestSchema as reqAuthSchema,
  responseSchema as resAuthSchema
} from '@user-mgnt/features/verifyPassword/handler'
import verifyPassByIdHandler, {
  requestSchema as verifyPassByIdRequestSchema,
  responseSchema as verifyPassByIdResponseSchema
} from '@user-mgnt/features/verifyPasswordById/handler'
import verifySecurityAnswer, {
  verifySecurityRequestSchema,
  verifySecurityResponseSchema
} from '@user-mgnt/features/verifySecurityAnswer/handler'
import {
  registerSystem,
  reqRegisterSystemSchema,
  deactivateSystem,
  reactivateSystem,
  clientIdSchema,
  verifySystemHandler,
  verifySystemReqSchema,
  verifySystemResSchema,
  getSystemRequestSchema,
  getSystemResponseSchema,
  getSystemHandler,
  updatePermissions,
  reqUpdateSystemSchema,
  refreshSystemSecretHandler,
  systemSecretRequestSchema,
  resSystemSchema,
  SystemSchema,
  deleteSystem
} from '@user-mgnt/features/system/handler'
import verifyUserHandler, {
  requestSchema as reqVerifyUserSchema,
  responseSchema as resVerifyUserSchema
} from '@user-mgnt/features/verifyUser/handler'
import * as Hapi from '@hapi/hapi'
import resendInviteHandler, {
  requestSchema as resendInviteRequestSchema
} from '@user-mgnt/features/resendInvite/handler'
import usernameReminderHandler, {
  requestSchema as usernameReminderRequestSchema
} from '@user-mgnt/features/usernameSMSReminderInvite/handler'
import changePhoneHandler, {
  changePhoneRequestSchema
} from '@user-mgnt/features/changePhone/handler'
import * as Joi from 'joi'
import { countUsersByLocationHandler } from '@user-mgnt/features/countUsersByLocation/handler'
import {
  createSearchHandler,
  removeSearchHandler,
  createSearchrequestSchema,
  removeSearchrequestSchema
} from '@user-mgnt/features/userSearchRecord/handler'
import resetPasswordInviteHandler, {
  requestSchema as resetPasswordRequestSchema
} from '@user-mgnt/features/resetPassword/handler'

import changeEmailHandler, {
  changeEmailRequestSchema
} from '@user-mgnt/features/changeEmail/handler'
import { getAllSystemsHandler } from '@user-mgnt/features/getAllSystems/handler'
import { SCOPES } from '@opencrvs/commons/authentication'
import mongoose from 'mongoose'

export const getRoutes = () => {
  return [
    // add ping route by default for health check
    {
      method: 'GET',
      path: '/ping',
      handler: async (request: any, h: any) => {
        try {
          return {
            success: mongoose.connection.readyState === 1
          }
        } catch (error) {
          return {
            success: false
          }
        }
      },
      options: {
        auth: false,
        tags: ['api'],
        description: 'Health check endpoint'
      }
    },
    {
      method: 'POST',
      path: '/verifyPassword',
      handler: verifyPassHandler,
      options: {
        auth: false,
        tags: ['api'],
        description: 'Verify user password',
        notes: 'Verify account exist and password is correct',
        validate: {
          payload: reqAuthSchema
        },
        response: {
          schema: resAuthSchema
        }
      }
    },
    {
      method: 'POST',
      path: '/verifyPasswordById',
      handler: verifyPassByIdHandler,
      options: {
        auth: false,
        tags: ['api'],
        description: 'Verify user password',
        notes: 'Verify account exist by id and password is correct',
        validate: {
          payload: verifyPassByIdRequestSchema
        },
        response: {
          schema: verifyPassByIdResponseSchema
        }
      }
    },
    {
      method: 'POST',
      path: '/verifySecurityAnswer',
      handler: verifySecurityAnswer,
      options: {
        auth: false,
        tags: ['api'],
        description:
          'Verifies sent security question answer is correct' +
          'Responses with a new question key for wrong answer',
        validate: {
          payload: verifySecurityRequestSchema
        },
        response: {
          schema: verifySecurityResponseSchema
        }
      }
    },
    {
      method: 'POST',
      path: '/changePassword',
      handler: changePasswordHandler,
      options: {
        auth: false,
        tags: ['api'],
        description: 'Change user password',
        notes: 'Verify account exist and change password',
        validate: {
          payload: changePasswordRequestSchema
        },
        response: {
          schema: false
        }
      }
    },
    {
      method: 'GET',
      path: '/check-token',
      handler: (request: Hapi.Request) => request.auth.credentials
    },
    {
      method: 'POST',
      path: '/changeUserPassword',
      handler: changePasswordHandler,
      options: {
        tags: ['api'],
        description: 'Changes password for logged-in user',
        validate: {
          payload: changePasswordRequestSchema
        },
        response: {
          schema: false
        }
      }
    },
    {
      method: 'POST',
      path: '/changeUserPhone',
      handler: changePhoneHandler,
      options: {
        tags: ['api'],
        description: 'Changes password for logged-in user',
        validate: {
          payload: changePhoneRequestSchema
        },
        response: {
          schema: false
        }
      }
    },
    {
      method: 'POST',
      path: '/changeUserEmail',
      handler: changeEmailHandler,
      options: {
        tags: ['api'],
        description: 'Changes email for logged-in user',
        validate: {
          payload: changeEmailRequestSchema
        },
        response: {
          schema: false
        }
      }
    },
    {
      method: 'POST',
      path: '/changeUserAvatar',
      handler: changeAvatarHandler,
      options: {
        tags: ['api'],
        description: 'Changes avatar for logged-in user',
        validate: {
          payload: changeAvatarRequestSchema
        },
        response: {
          schema: false
        }
      }
    },
    {
      method: 'POST',
      path: '/getUserMobile',
      handler: getUserMobile,
      options: {
        tags: ['api'],
        description: 'Retrieves a user mobile number',
        auth: {
          scope: [
            SCOPES.USER_READ,
            SCOPES.USER_READ_MY_JURISDICTION,
            SCOPES.USER_READ_MY_OFFICE
          ]
        },
        validate: {
          payload: userIdSchema
        },
        response: {
          schema: resMobileSchema
        }
      }
    },
    {
      method: 'POST',
      path: '/searchUsers',
      handler: searchUsers,
      options: {
        auth: {
          scope: [
            SCOPES.ORGANISATION_READ_LOCATIONS,
            SCOPES.ORGANISATION_READ_LOCATIONS_MY_OFFICE,
            SCOPES.ORGANISATION_READ_LOCATIONS_MY_JURISDICTION,
            SCOPES.USER_DATA_SEEDING
          ]
        },
        validate: {
          payload: searchSchema
        },
        tags: ['api']
      }
    },
    {
      method: 'POST',
      path: '/getUser',
      handler: getUser,
      options: {
        tags: ['api'],
        description: 'Retrieves a user',
        validate: {
          payload: getUserRequestSchema
        }
      }
    },
    {
      method: 'POST',
      path: '/createUser',
      handler: createUser,
      options: {
        tags: ['api'],
        description: 'Creates a new user',
        auth: {
          scope: [
            SCOPES.USER_CREATE,
            SCOPES.USER_CREATE_MY_JURISDICTION,
            SCOPES.USER_DATA_SEEDING
          ]
        }
      }
    },
    {
      method: 'POST',
      path: '/updateUser',
      handler: updateUser,
      options: {
        tags: ['api'],
        description: 'Updates an existing user',
        auth: {
          scope: [
            SCOPES.USER_UPDATE,
            SCOPES.USER_UPDATE_MY_JURISDICTION,
            SCOPES.USER_DATA_SEEDING
          ]
        }
      }
    },
    {
      method: 'POST',
      path: '/activateUser',
      handler: activateUser,
      options: {
        tags: ['api'],
        description: 'Activate an existing pending user',
        validate: {
          payload: activateUserRequestSchema
        }
      }
    },
    {
      method: 'POST',
      path: '/verifyUser',
      handler: verifyUserHandler,
      options: {
        auth: false,
        tags: ['api'],
        description:
          'Verify user for given mobile number. Used for password reset flow.',
        notes:
          'As it is a public api, please take necessary caution before using it.',
        validate: {
          payload: reqVerifyUserSchema
        },
        response: {
          schema: resVerifyUserSchema
        }
      }
    },
    {
      method: 'POST',
      path: '/auditUser',
      handler: userAuditHandler,
      options: {
        auth: {
          scope: [
            SCOPES.USER_UPDATE,
            SCOPES.USER_UPDATE_MY_JURISDICTION,
            SCOPES.USER_DATA_SEEDING
          ]
        },
        validate: {
          payload: userAuditSchema
        },
        tags: ['api']
      }
    },
    {
      method: 'POST',
      path: '/searches',
      handler: createSearchHandler,
      options: {
        auth: {
          scope: [
            SCOPES.SEARCH_BIRTH,
            SCOPES.SEARCH_DEATH,
            SCOPES.SEARCH_MARRIAGE,
            SCOPES.SEARCH_BIRTH_MY_JURISDICTION,
            SCOPES.SEARCH_DEATH_MY_JURISDICTION,
            SCOPES.SEARCH_MARRIAGE_MY_JURISDICTION
          ]
        },
        validate: {
          payload: createSearchrequestSchema
        },
        tags: ['api']
      }
    },
    {
      method: 'DELETE',
      path: '/searches',
      handler: removeSearchHandler,
      options: {
        auth: {
          scope: [
            SCOPES.SEARCH_BIRTH,
            SCOPES.SEARCH_DEATH,
            SCOPES.SEARCH_MARRIAGE,
            SCOPES.SEARCH_BIRTH_MY_JURISDICTION,
            SCOPES.SEARCH_DEATH_MY_JURISDICTION,
            SCOPES.SEARCH_MARRIAGE_MY_JURISDICTION
          ]
        },
        validate: {
          payload: removeSearchrequestSchema
        },
        tags: ['api']
      }
    },
    {
      method: 'POST',
      path: '/resendInvite',
      handler: resendInviteHandler,
      options: {
        auth: {
          scope: [SCOPES.USER_UPDATE, SCOPES.USER_UPDATE_MY_JURISDICTION]
        },
        validate: {
          payload: resendInviteRequestSchema
        },
        description:
          'Resend sms for given mobile number and make the corresponding user pending'
      }
    },
    {
      method: 'POST',
      path: '/usernameReminder',
      handler: usernameReminderHandler,
      options: {
        auth: {
          scope: [SCOPES.USER_UPDATE, SCOPES.USER_UPDATE_MY_JURISDICTION]
        },
        validate: {
          payload: usernameReminderRequestSchema
        },
        description:
          'Resend sms for given username and make the corresponding user pending'
      }
    },
    {
      method: 'POST',
      path: '/resetPasswordInvite',
      handler: resetPasswordInviteHandler,
      options: {
        auth: {
          scope: [SCOPES.USER_UPDATE, SCOPES.USER_UPDATE_MY_JURISDICTION]
        },
        validate: {
          payload: resetPasswordRequestSchema
        },
        description:
          'Reset password via sms for given userid and make the corresponding user pending'
      }
    },
    {
      method: 'POST',
      path: '/registerSystem',
      handler: registerSystem,
      options: {
        tags: ['api'],
        description: 'Creates a new system client',
        auth: {
          scope: [SCOPES.CONFIG_UPDATE_ALL]
        },
        validate: {
          payload: reqRegisterSystemSchema
        },
        response: {
          schema: resSystemSchema
        }
      }
    },
    {
      method: 'POST',
      path: '/updatePermissions',
      handler: updatePermissions,
      options: {
        tags: ['api'],
        description: 'Update system permissions',
        auth: {
          scope: [SCOPES.CONFIG_UPDATE_ALL]
        },
        validate: {
          payload: reqUpdateSystemSchema
        }
      }
    },
    {
      method: 'POST',
      path: '/deactivateSystem',
      handler: deactivateSystem,
      options: {
        tags: ['api'],
        description: 'Deactivates a new system client',
        auth: {
          scope: [SCOPES.CONFIG_UPDATE_ALL]
        },
        validate: {
          payload: clientIdSchema
        },
        response: {
          schema: SystemSchema
        }
      }
    },
    {
      method: 'POST',
      path: '/reactivateSystem',
      handler: reactivateSystem,
      options: {
        tags: ['api'],
        description: 'Reactivates a new system client',
        auth: {
          scope: [SCOPES.CONFIG_UPDATE_ALL]
        },
        validate: {
          payload: clientIdSchema
        },
        response: {
          schema: SystemSchema
        }
      }
    },
    {
      method: 'POST',
      path: '/verifySystem',
      handler: verifySystemHandler,
      options: {
        auth: false,
        tags: ['api'],
        description: 'Verify system',
        notes: 'Verify system exist and access details are correct',
        validate: {
          payload: verifySystemReqSchema
        },
        response: {
          schema: verifySystemResSchema
        }
      }
    },

    {
      method: 'POST',
      path: '/getSystem',
      handler: getSystemHandler,
      options: {
        tags: ['api'],
        description: 'Verify system',
        notes: 'Verify system exist and access details are correct',
        validate: {
          payload: getSystemRequestSchema
        },
        response: {
          schema: getSystemResponseSchema
        }
      }
    },
    {
      method: 'GET',
      path: '/getAllSystems',
      handler: getAllSystemsHandler,
      options: {
        tags: ['api'],
        description: 'Returns all systems'
      }
    },

    {
      method: 'POST',
      path: '/countUsersByLocation',
      handler: countUsersByLocationHandler,
      options: {
        tags: ['api'],
        description: 'Gets count of users group by office ids',
        auth: {
          scope: [
            SCOPES.USER_READ,
            SCOPES.USER_READ_MY_JURISDICTION,
            SCOPES.USER_READ_MY_OFFICE,
            SCOPES.PERFORMANCE_READ
          ]
        },
        validate: {
          payload: Joi.object({
            locationId: Joi.string()
          })
        }
      }
    },
    {
      method: 'POST',
      path: '/refreshSystemSecret',
      handler: refreshSystemSecretHandler,
      options: {
        tags: ['api'],
        description: 'Refresh client secret ',
        notes: 'Refresh client secret',
        auth: {
          scope: [SCOPES.CONFIG_UPDATE_ALL]
        },
        validate: {
          payload: systemSecretRequestSchema
        },
        response: {
          schema: resSystemSchema
        }
      }
    },
    {
      method: 'POST',
      path: '/deleteSystem',
      handler: deleteSystem,
      options: {
        tags: ['api'],
        description: 'Delete system ',
        notes: 'This is responsible for system deletion',
        auth: {
          scope: [SCOPES.CONFIG_UPDATE_ALL]
        },
        validate: {
          payload: clientIdSchema
        },
        response: {
          schema: SystemSchema
        }
      }
    }
  ] satisfies Hapi.ServerRoute[]
}
