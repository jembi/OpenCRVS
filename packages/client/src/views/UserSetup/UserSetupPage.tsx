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
import * as React from 'react'
import styled from 'styled-components'
import { useIntl } from 'react-intl'
import { getUserDetails } from '@client/profile/profileSelectors'
import { IStoreState } from '@client/store'
import { buttonMessages } from '@client/i18n/messages'
import { Frame } from '@opencrvs/components/lib/Frame'
import { AppBar } from '@opencrvs/components/lib/AppBar'
import { Button } from '@opencrvs/components/lib/Button'
import {
  ProtectedAccoutStep,
  IProtectedAccountSetupData
} from '@client/components/ProtectedAccount'
import { messages } from '@client/i18n/messages/views/userSetup'
import { getOfflineData } from '@client/offline/selectors'
import { CountryLogo } from '@opencrvs/components/lib/icons'
import { Box } from '@opencrvs/components/lib/Box'
import { useSelector } from 'react-redux'
import { Text } from '@opencrvs/components'

export const Page = styled.div`
  color: ${({ theme }) => theme.colors.copy};
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  text-align: center;
`
export const Container = styled.div`
  position: relative;
  height: auto;
  padding: 0px;
  margin: 125px auto 0px auto;
  max-width: auto;
`
export const LogoContainer = styled.div`
  flex-direction: row;
  display: flex;
  justify-content: center;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    & svg {
      transform: scale(0.8);
    }
  }
`

const TitleHolder = styled(Text)`
  text-align: center;
  padding-top: 20px;
`
const InstructionHolder = styled(Text)`
  margin: 0;
  text-align: center;
  padding: 20px 8px 40px 8px;
`
interface IOwnProps {
  setupData: IProtectedAccountSetupData
  goToStep: (
    step: ProtectedAccoutStep,
    data: IProtectedAccountSetupData
  ) => void
}

export function UserSetupPage({ setupData, goToStep }: IOwnProps) {
  const intl = useIntl()
  const userDetails = useSelector((store: IStoreState) => getUserDetails(store))
  const offlineCountryConfig = useSelector((store: IStoreState) =>
    getOfflineData(store)
  )

  return (
    <Frame
      header={<AppBar title="OpenCRVS" />}
      skipToContentText="Skip to main content"
    >
      <Frame.LayoutCentered id="user-setup-landing-page">
        <Box>
          <LogoContainer>
            <CountryLogo src={offlineCountryConfig.config.COUNTRY_LOGO.file} />
          </LogoContainer>
          <TitleHolder variant="h1" element="h1">
            {intl.formatMessage(messages.userSetupWelcomeTitle, {
              applicationName: offlineCountryConfig.config.APPLICATION_NAME
            })}
          </TitleHolder>
          <InstructionHolder variant="reg16" element="span">
            {intl.formatMessage(messages.userSetupIntroduction)}
          </InstructionHolder>
          <Button
            id="user-setup-start-button"
            type="primary"
            size="large"
            fullWidth
            onClick={() =>
              goToStep(ProtectedAccoutStep.PASSWORD, {
                ...setupData,
                userId: (userDetails && userDetails.userMgntUserID) || ''
              })
            }
          >
            {intl.formatMessage(buttonMessages.start)}
          </Button>
        </Box>
      </Frame.LayoutCentered>
    </Frame>
  )
}
