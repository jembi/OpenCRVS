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
// eslint-disable-next-line no-restricted-imports
import * as Sentry from '@sentry/react'
import styled from 'styled-components'
import { Text } from '@opencrvs/components/lib/Text'
import { injectIntl, WrappedComponentProps as IntlShapeProps } from 'react-intl'
import { PageWrapper } from '@opencrvs/components/lib/PageWrapper'
import { TertiaryButton } from '@opencrvs/components/lib/buttons'
import { Box } from '@opencrvs/components/lib/Box'
import { errorMessages, buttonMessages } from '@client/i18n/messages'

const ErrorContainer = styled(Box)`
  display: flex;
  width: 400px;
  flex-direction: column;
  align-items: center;
  margin-top: -80px;
`
const ErrorTitle = styled(Text)`
  margin-bottom: 16px;
`

const ErrorMessage = styled(Text)`
  margin-bottom: 32px;
`

type IFullProps = React.PropsWithChildren<IntlShapeProps>

const development = ['127.0.0.1', 'localhost'].includes(
  window.location.hostname
)

const StyledErrorBoundaryComponent = ({ intl, children }: IFullProps) => {
  const [authError, setAuthError] = useState(false)

  const onError = (error: Error) => {
    if (import.meta.env.MODE === 'test') {
      // eslint-disable-next-line no-console
      console.log(error)
    }
    setAuthError(error.message === '401')
  }

  return (
    <Sentry.ErrorBoundary
      showDialog={!development}
      onError={onError}
      fallback={
        <PageWrapper>
          <ErrorContainer>
            <ErrorTitle variant="h1" color="copy" element="span">
              {authError &&
                intl.formatMessage(errorMessages.errorCodeUnauthorized)}
              {authError
                ? intl.formatMessage(errorMessages.errorTitleUnauthorized)
                : intl.formatMessage(errorMessages.errorTitle)}
            </ErrorTitle>
            <ErrorMessage variant="reg18" color="copy" element="span">
              {intl.formatMessage(errorMessages.unknownErrorDescription)}
            </ErrorMessage>
            <TertiaryButton
              id="GoToHomepage"
              onClick={() => (window.location.href = '/')}
            >
              {intl.formatMessage(buttonMessages.goToHomepage)}
            </TertiaryButton>
          </ErrorContainer>
        </PageWrapper>
      }
    >
      {children}
    </Sentry.ErrorBoundary>
  )
}

export const StyledErrorBoundary = injectIntl(StyledErrorBoundaryComponent)
