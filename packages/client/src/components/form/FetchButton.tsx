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
import styled from 'styled-components'
import { ApolloError, ApolloConsumer, ApolloClient } from '@apollo/client'
// eslint-disable-next-line no-restricted-imports
import * as Sentry from '@sentry/react'
import {
  WrappedComponentProps as IntlShapeProps,
  injectIntl,
  IntlShape
} from 'react-intl'
import { buttonMessages } from '@client/i18n/messages'
import { Spinner } from '@opencrvs/components/lib/Spinner'
import { PrimaryButton } from '@opencrvs/components/lib/buttons'
import { Success, Error } from '@opencrvs/components/lib/icons'
import { IQuery } from '@opencrvs/client/src/forms'
import { isNavigatorOnline } from '@client/utils'
import { Text } from '@opencrvs/components/lib/Text'
import { useOnlineStatus } from '@client/utils'

interface IFetchButtonProps<T = unknown> {
  id: string
  queryData?: IQuery
  label: string
  className?: string
  modalTitle: string
  successTitle: string
  errorTitle: string
  onFetch?: (response: T) => void
  isDisabled?: boolean
}

type IFullProps = IFetchButtonProps & IntlShapeProps

const Container = styled.div`
  display: flex;
`
const Backdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(53, 73, 93, 0.78);
  z-index: 1;
  display: flex;
  justify-content: center;
  align-items: center;
`

const ModalContent = styled.div`
  width: 30vw;
  min-width: 305px;
  border-radius: 2px;
  background-color: ${({ theme }) => theme.colors.white};
  padding: 30px 30px 60px 30px;
  color: ${({ theme }) => theme.colors.copy};
  text-align: center;
  ${({ theme }) => theme.fonts.bold14};
  position: relative;
`

const Heading = styled(Text)`
  text-align: center;
`

const Info = styled(Text)`
  text-align: center;
`

const StyledSpinner = styled(Spinner)`
  margin: 10px auto;
`
const StyledError = styled(Error)`
  margin: 10px auto;
`
const StyledSuccess = styled(Success)`
  margin: 10px auto;
`
const ConfirmButton = styled.a`
  margin: 10px;
  display: block;
  text-decoration: underline;
  color: ${({ theme }) => theme.colors.primary};
  cursor: pointer;
`
const StyledPrimaryButton = styled(PrimaryButton)`
  display: block;
  ${({ theme }) => {
    return `@media (min-width: ${theme.grid.breakpoints.md}px) {
      width: 515px;
    }`
  }}
`

const FetchButton = (props: IFullProps) => {
  const {
    intl,
    label,
    modalTitle,
    successTitle,
    errorTitle,
    queryData,
    isDisabled,
    onFetch
  } = props
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [success, setSuccess] = useState(false)
  const [show, setShow] = useState(false)
  const [networkError, setNetworkError] = useState(false)
  const isOnline = useOnlineStatus()

  const hideModal = () => {
    setShow(false)
    setLoading(false)
    setError(false)
    setNetworkError(false)
  }

  const performQuery = async (client: ApolloClient<any>) => {
    const { query, variables, responseTransformer } = queryData as IQuery
    try {
      setShow(true)
      setLoading(true)
      setSuccess(false)
      setError(false)
      const response = await client.query({
        query,
        variables
      })
      setSuccess(true)
      setLoading(false)
      setError(false)
      if (responseTransformer && onFetch) {
        const transformedResponse = responseTransformer(response)
        onFetch(transformedResponse)
      }
    } catch (error) {
      Sentry.captureException(error)
      setError(true)
      setLoading(false)
      setSuccess(false)
      setNetworkError(
        error instanceof ApolloError && Boolean(error.networkError)
      )
    }
  }

  const getModalInfo = (intl: IntlShape) => {
    const { variables, modalInfoText } = queryData as IQuery
    return (
      <>
        {modalInfoText && (
          <Info variant="reg16" color="copy" element="span">
            {intl.formatMessage(modalInfoText)}
          </Info>
        )}
        {variables && (
          <Info variant="reg16" color="copy" element="span">
            {Object.values(variables)}
          </Info>
        )}
      </>
    )
  }

  return (
    <Container {...props}>
      <ApolloConsumer>
        {(client: ApolloClient<any>) => {
          return (
            <div>
              <StyledPrimaryButton
                type={'button'}
                disabled={isDisabled || !isOnline}
                onClick={async (event: React.MouseEvent<HTMLElement>) => {
                  performQuery(client)
                  event.preventDefault()
                }}
              >
                {label}
              </StyledPrimaryButton>
              {show && (
                <Backdrop>
                  <ModalContent>
                    {success && (
                      <>
                        <Heading element="h2" variant="h2">
                          {successTitle}
                        </Heading>
                        {getModalInfo(intl)}
                        <StyledSuccess id="loader-button-success" />
                      </>
                    )}

                    {error && (
                      <>
                        <Heading element="h2" variant="h2">
                          {errorTitle}
                        </Heading>
                        {getModalInfo(intl)}
                        <StyledError id="loader-button-error" />
                        {queryData && (
                          <Info element="p" variant="h4">
                            {!networkError
                              ? intl.formatMessage(queryData.errorText)
                              : intl.formatMessage(queryData.networkErrorText)}
                          </Info>
                        )}
                      </>
                    )}

                    {loading && (
                      <>
                        <Heading element="h2" variant="h2">
                          {modalTitle}
                        </Heading>
                        {getModalInfo(intl)}
                        <StyledSpinner id="loader-button-spinner" />
                        <ConfirmButton onClick={hideModal}>
                          {intl.formatMessage(buttonMessages.cancel)}
                        </ConfirmButton>
                      </>
                    )}

                    {!loading && (
                      <ConfirmButton onClick={hideModal}>
                        {intl.formatMessage(buttonMessages.back)}
                      </ConfirmButton>
                    )}
                  </ModalContent>
                </Backdrop>
              )}
            </div>
          )
        }}
      </ApolloConsumer>
    </Container>
  )
}

export const FetchButtonField = injectIntl<'intl', IFullProps>(FetchButton)
