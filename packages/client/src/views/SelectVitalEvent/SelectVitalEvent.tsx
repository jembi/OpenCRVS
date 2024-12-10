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
import React, { useState } from 'react'
import { WrappedComponentProps as IntlShapeProps, injectIntl } from 'react-intl'
import { connect } from 'react-redux'
import { ErrorText } from '@opencrvs/components/lib/ErrorText'
import { RadioButton } from '@opencrvs/components/lib/Radio'
import { Frame } from '@opencrvs/components/lib/Frame'
import { AppBar } from '@opencrvs/components/lib/AppBar'
import { Content, ContentSize } from '@opencrvs/components/lib/Content'
import { Stack } from '@opencrvs/components/lib/Stack'
import { Button } from '@opencrvs/components/lib/Button'
import { Icon } from '@opencrvs/components/lib/Icon'
import { EventType } from '@client/utils/gateway'
import {
  goBack,
  goToHome,
  goToDeathInformant,
  goToBirthRegistrationAsParent,
  goToMarriageInformant
} from '@client/navigation'
import { messages } from '@client/i18n/messages/views/selectVitalEvent'
import { constantsMessages, buttonMessages } from '@client/i18n/messages'

import {
  storeDeclaration,
  IDeclaration,
  createDeclaration
} from '@client/declarations'

type GoToType = '' | EventType

const SelectVitalEventView = (
  props: IntlShapeProps & {
    goBack: typeof goBack
    goToHome: typeof goToHome
    storeDeclaration: typeof storeDeclaration
    goToBirthRegistrationAsParent: typeof goToBirthRegistrationAsParent
    goToDeathInformant: typeof goToDeathInformant
    goToMarriageInformant: typeof goToMarriageInformant
  }
) => {
  const {
    intl,
    goToHome,
    storeDeclaration,
    goToBirthRegistrationAsParent,
    goToDeathInformant,
    goToMarriageInformant
  } = props

  const [goTo, setGoTo] = useState<GoToType>('')
  const [noEventSelectedError, setNoEventSelectedError] = useState(false)

  const handleContinue = () => {
    if (goTo === '') {
      return setNoEventSelectedError(true)
    }
    let declaration: IDeclaration
    switch (goTo as EventType) {
      case EventType.Birth:
        declaration = createDeclaration(EventType.Birth)
        storeDeclaration(declaration)
        goToBirthRegistrationAsParent(declaration.id)
        break
      case EventType.Death:
        declaration = createDeclaration(EventType.Death)
        storeDeclaration(declaration)
        goToDeathInformant(declaration.id)
        break
      case EventType.Marriage:
        declaration = createDeclaration(EventType.Marriage)
        storeDeclaration(declaration)
        goToMarriageInformant(declaration.id)
        break
      default:
        throw new Error(`Unknown eventType ${goTo}`)
    }
  }

  return (
    <Frame
      header={
        <AppBar
          desktopLeft={<Icon name="Draft" size="large" />}
          desktopTitle={intl.formatMessage(messages.registerNewEventTitle)}
          desktopRight={
            <Button
              id="goBack"
              type="secondary"
              size="small"
              onClick={goToHome}
            >
              <Icon name="X" />
              {intl.formatMessage(buttonMessages.exitButton)}
            </Button>
          }
          mobileLeft={<Icon name="Draft" size="large" />}
          mobileTitle={intl.formatMessage(messages.registerNewEventTitle)}
          mobileRight={
            <Button type="icon" size="medium" onClick={goToHome}>
              <Icon name="X" />
            </Button>
          }
        />
      }
      skipToContentText={intl.formatMessage(
        constantsMessages.skipToMainContent
      )}
    >
      <Content
        size={ContentSize.SMALL}
        title={intl.formatMessage(messages.registerNewEventHeading)}
        bottomActionButtons={[
          <Button
            key="select-vital-event-continue"
            id="continue"
            type="primary"
            size="large"
            fullWidth
            onClick={handleContinue}
          >
            {intl.formatMessage(buttonMessages.continueButton)}
          </Button>
        ]}
      >
        {noEventSelectedError && (
          <ErrorText id="require-error">
            {intl.formatMessage(messages.errorMessage)}
          </ErrorText>
        )}
        <Stack
          id="select_vital_event_view"
          direction="column"
          alignItems="left"
          gap={0}
        >
          <RadioButton
            size="large"
            key="birthevent"
            name="birthevent"
            label={intl.formatMessage(constantsMessages.birth)}
            value={EventType.Birth}
            id="select_birth_event"
            selected={goTo === EventType.Birth ? EventType.Birth : ''}
            onChange={() => {
              setGoTo(EventType.Birth)
              setNoEventSelectedError(false)
            }}
          />
          {window.config.FEATURES.DEATH_REGISTRATION && (
            <RadioButton
              size="large"
              key="deathevent"
              name="deathevent"
              label={intl.formatMessage(constantsMessages.death)}
              value={EventType.Death}
              id="select_death_event"
              selected={goTo === EventType.Death ? EventType.Death : ''}
              onChange={() => {
                setGoTo(EventType.Death)
                setNoEventSelectedError(false)
              }}
            />
          )}
          {window.config.FEATURES.MARRIAGE_REGISTRATION && (
            <RadioButton
              size="large"
              key="marriagevent"
              name="marriageevent"
              label={intl.formatMessage(constantsMessages.marriage)}
              value={EventType.Marriage}
              id="select_marriage_event"
              selected={goTo === EventType.Marriage ? EventType.Marriage : ''}
              onChange={() => {
                setGoTo(EventType.Marriage)
                setNoEventSelectedError(false)
              }}
            />
          )}
        </Stack>
      </Content>
    </Frame>
  )
}

export const SelectVitalEvent = connect(null, {
  goBack,
  goToHome,
  storeDeclaration,
  goToBirthRegistrationAsParent,
  goToDeathInformant,
  goToMarriageInformant
})(injectIntl(SelectVitalEventView))
