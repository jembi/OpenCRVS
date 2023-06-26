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
import Question, { IQuestion, validFieldType } from '@config/models/question'
import * as Hapi from '@hapi/hapi'
import * as Joi from 'joi'
import { internal } from '@hapi/boom'

export default async function createQuestion(
  request: Hapi.Request,
  h: Hapi.ResponseToolkit
) {
  const questionDto = request.payload as IQuestion
  let question: IQuestion
  try {
    question = await Question.create(questionDto)
  } catch (e) {
    throw internal(e.message)
  }

  return h.response(question).code(201)
}

export const messageSchema = Joi.array().items({
  lang: Joi.string().required(),
  descriptor: Joi.object({
    id: Joi.string().required(),
    defaultMessage: Joi.string().required(),
    description: Joi.string()
  })
})

export const conditionalSchema = Joi.array().items({
  fieldId: Joi.string(),
  regexp: Joi.string()
})

export const optionSchema = Joi.array().items({
  value: Joi.string().required(),
  label: Joi.object({
    id: Joi.string().required(),
    defaultMessage: Joi.string().required()
  })
})

export const requestSchema = Joi.object({
  fieldId: Joi.string().required(),
  label: messageSchema,
  placeholder: messageSchema,
  description: messageSchema,
  tooltip: messageSchema,
  unit: messageSchema,
  errorMessage: messageSchema,
  maxLength: Joi.number(),
  inputWidth: Joi.number(),
  fieldName: Joi.string(),
  fieldType: Joi.string().valid(...validFieldType),
  precedingFieldId: Joi.string().required(),
  required: Joi.boolean(),
  enabled: Joi.string().allow(''),
  custom: Joi.boolean(),
  conditionals: conditionalSchema,
  datasetId: Joi.string().optional(),
  options: optionSchema.optional()
})

export const formDatasetSchema = Joi.object({
  fileName: Joi.string().required(),
  base64Data: Joi.string().required()
})

export const responseSchema = Joi.object({})
