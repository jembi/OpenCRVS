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

import React, { useEffect } from 'react'
import { defineMessages } from 'react-intl'
import { useNavigate } from 'react-router-dom'
import { v4 as uuid } from 'uuid'
import { useTypedParams } from 'react-router-typesafe-routes/dom'
import {
  getCurrentEventState,
  ActionType,
  findActiveActionForm
} from '@opencrvs/commons/client'
import { ROUTES } from '@client/v2-events/routes'
import { useEvents } from '@client/v2-events/features/events/useEvents/useEvents'
import { Review as ReviewComponent } from '@client/v2-events/features/events/components/Review'
import { useModal } from '@client/v2-events/hooks/useModal'
import { useEventFormNavigation } from '@client/v2-events/features/events/useEventFormNavigation'
import { useEventConfiguration } from '@client/v2-events/features/events/useEventConfiguration'
import { useEventFormData } from '@client/v2-events/features/events/useEventFormData'
import { useEventMetadata } from '@client/v2-events/features/events/useEventMeta'
import { FormLayout } from '@client/v2-events/layouts/form'

const messages = defineMessages({
  registerActionTitle: {
    id: 'v2.registerAction.title',
    defaultMessage: 'Register member',
    description: 'The title for register action'
  },
  registerActionDescription: {
    id: 'v2.registerAction.description',
    defaultMessage:
      'By clicking register, you confirm that the information entered is correct and the member can be registered.',
    description: 'The description for register action'
  },
  registerActionDeclare: {
    id: 'v2.registerAction.Declare',
    defaultMessage: 'Register',
    description: 'The label for declare button of register action'
  }
})

/**
 *
 * Preview of event to be registered.
 */
export function Review() {
  const { eventId } = useTypedParams(ROUTES.V2.EVENTS.REGISTER)
  const events = useEvents()
  const [modal, openModal] = useModal()
  const navigate = useNavigate()
  const { goToHome } = useEventFormNavigation()
  const registerMutation = events.actions.register

  const [event] = events.getEvent.useSuspenseQuery(eventId)

  const { setMetadata, getMetadata } = useEventMetadata()
  const metadata = getMetadata(
    eventId,
    event.actions.find((a) => a.type === 'DECLARE')?.metadata
  )
  const { eventConfiguration: config } = useEventConfiguration(event.type)

  const formConfig = findActiveActionForm(config, ActionType.REGISTER)
  if (!formConfig) {
    throw new Error('No active form configuration found for declare action')
  }

  const setFormValues = useEventFormData((state) => state.setFormValuesIfEmpty)
  const getFormValues = useEventFormData((state) => state.getFormValues)
  const previousFormValues = getCurrentEventState(event).data

  useEffect(() => {
    setFormValues(eventId, getCurrentEventState(event).data)
  }, [event, eventId, setFormValues])

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
        ROUTES.V2.EVENTS.REGISTER.PAGES.buildPath(
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

  async function handleRegistration() {
    const confirmedRegistration = await openModal<boolean | null>((close) => (
      <ReviewComponent.ActionModal action="Register" close={close} />
    ))
    if (confirmedRegistration) {
      registerMutation.mutate({
        eventId: event.id,
        data: form,
        transactionId: uuid(),
        metadata
      })

      goToHome()
    }
  }

  return (
    <FormLayout
      route={ROUTES.V2.EVENTS.REGISTER}
      onSaveAndExit={() => {
        events.actions.register.mutate({
          eventId: event.id,
          data: form,
          transactionId: uuid(),
          draft: true,
          metadata
        })
        goToHome()
      }}
    >
      <ReviewComponent.Body
        eventConfig={config}
        form={form}
        formConfig={formConfig}
        isUploadButtonVisible={true}
        metadata={metadata}
        previousFormValues={previousFormValues}
        title=""
        onEdit={handleEdit}
        onMetadataChange={(values) => setMetadata(eventId, values)}
      >
        <ReviewComponent.Actions
          form={form}
          formConfig={formConfig}
          messages={{
            title: messages.registerActionTitle,
            description: messages.registerActionDescription,
            onConfirm: messages.registerActionDeclare
          }}
          metadata={metadata}
          onConfirm={handleRegistration}
        />
        {modal}
      </ReviewComponent.Body>
    </FormLayout>
  )
}
