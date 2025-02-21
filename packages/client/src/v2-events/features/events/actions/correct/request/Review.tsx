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

import React from 'react'
import { useIntl } from 'react-intl'
import { useNavigate } from 'react-router-dom'
import { useTypedParams } from 'react-router-typesafe-routes/dom'
import {
  ActionType,
  findActiveActionForm,
  getAllFields,
  getCurrentEventState
} from '@opencrvs/commons/client'
import { PrimaryButton } from '@opencrvs/components/lib/buttons'
import { buttonMessages } from '@client/i18n/messages'
import { setEmptyValuesForFields } from '@client/v2-events/components/forms/utils'
import { Review as ReviewComponent } from '@client/v2-events/features/events/components/Review'
import { useEventConfiguration } from '@client/v2-events/features/events/useEventConfiguration'
import { useEventFormData } from '@client/v2-events/features/events/useEventFormData'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'
import { useIntlFormatMessageWithFlattenedParams } from '@client/v2-events/features/workqueues/utils'
import { useModal } from '@client/v2-events/hooks/useModal'
import { FormLayout } from '@client/v2-events/layouts/form'
import { ROUTES } from '@client/v2-events/routes'

export function Review() {
  const { eventId } = useTypedParams(ROUTES.V2.EVENTS.REQUEST_CORRECTION.REVIEW)
  const events = useEvents()
  const intl = useIntl()
  const [modal, openModal] = useModal()
  const navigate = useNavigate()

  const [event] = events.getEvent.useSuspenseQuery(eventId)

  const { eventConfiguration: config } = useEventConfiguration(event.type)
  const formConfig = findActiveActionForm(config, ActionType.REQUEST_CORRECTION)

  if (!formConfig) {
    throw new Error(
      `An active form config not found for action type ${ActionType.REQUEST_CORRECTION}`
    )
  }

  const getFormValues = useEventFormData((state) => state.getFormValues)

  const form = getFormValues(eventId)

  async function handleEdit({
    pageId,
    fieldId,
    confirmation
  }: {
    pageId: string
    fieldId?: string
    confirmation?: boolean
  }) {
    const confirmedEdit =
      confirmation ||
      (await openModal<boolean | null>((close) => (
        <ReviewComponent.EditModal close={close} />
      )))

    if (confirmedEdit) {
      navigate(
        ROUTES.V2.EVENTS.REQUEST_CORRECTION.PAGES.buildPath(
          { pageId, eventId },
          {
            from: 'review'
          },
          fieldId
        )
      )
    }
    return
  }

  const previousFormValues = getCurrentEventState(event).data
  const valuesHaveChanged = Object.entries(form).some(
    ([key, value]) => previousFormValues[key] !== value
  )
  const intlWithData = useIntlFormatMessageWithFlattenedParams()
  const initialValues = setEmptyValuesForFields(getAllFields(config))
  const actionConfig = config.actions.find(
    (action) => action.type === ActionType.REQUEST_CORRECTION
  )

  if (!actionConfig) {
    throw new Error(
      `Action config for ${ActionType.REQUEST_CORRECTION} was not found. This should never happen`
    )
  }

  return (
    <FormLayout route={ROUTES.V2.EVENTS.REGISTER}>
      <ReviewComponent.Body
        eventConfig={config}
        form={form}
        formConfig={formConfig}
        isUploadButtonVisible={true}
        previousFormValues={previousFormValues}
        title={intlWithData.formatMessage(actionConfig.label, {
          ...initialValues,
          ...previousFormValues
        })}
        onEdit={handleEdit}
      >
        <PrimaryButton
          key="continue_button"
          disabled={!valuesHaveChanged}
          id="continue_button"
          onClick={() => {
            navigate(
              ROUTES.V2.EVENTS.REQUEST_CORRECTION.ADDITIONAL_DETAILS_INDEX.buildPath(
                {
                  eventId
                }
              )
            )
          }}
        >
          {intl.formatMessage(buttonMessages.continueButton)}
        </PrimaryButton>
        {modal}
      </ReviewComponent.Body>
    </FormLayout>
  )
}
