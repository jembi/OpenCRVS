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
import {
  Box,
  Button,
  Frame,
  Stack,
  Content,
  Icon,
  ResponsiveModal,
  AppBar,
  Spinner
} from '@opencrvs/components'
import React from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { messages as certificateMessages } from '@client/i18n/messages/views/certificate'
import { useIntl } from 'react-intl'
import { buttonMessages } from '@client/i18n/messages/buttons'
import { generateGoToHomeTabUrl } from '@client/navigation'
import { useModal } from '@client/hooks/useModal'

import { WORKQUEUE_TABS } from '@client/components/interface/WorkQueueTabs'
import styled from 'styled-components'
import { constantsMessages } from '@client/i18n/messages'
import { usePrintableCertificate } from './usePrintableCertificate'

const CertificateContainer = styled.div`
  svg {
    /* limits the certificate overflowing on small screens */
    max-width: 100%;
  }
`

const ReviewCertificateFrame = ({
  children
}: {
  children: React.ReactNode
}) => {
  const intl = useIntl()
  const location = useLocation()
  const navigate = useNavigate()

  const back = () => {
    const historyState = location.state
    const navigatedFromInsideApp = Boolean(
      historyState && historyState.isNavigatedInsideApp
    )

    if (navigatedFromInsideApp) {
      navigate(-1)
    } else {
      navigate(
        generateGoToHomeTabUrl({
          tabId: WORKQUEUE_TABS.readyToPrint
        })
      )
    }
  }

  return (
    <Frame
      header={
        <AppBar
          desktopTitle={intl.formatMessage(
            certificateMessages.certificateCollectionTitle
          )}
          desktopLeft={
            <Button type="icon" onClick={back} id="action_page_back_button">
              <Icon name="ArrowLeft" size="large" />
            </Button>
          }
          desktopRight={
            <Button
              type="icon"
              onClick={() =>
                navigate(
                  generateGoToHomeTabUrl({
                    tabId: WORKQUEUE_TABS.readyToPrint
                  })
                )
              }
            >
              <Icon name="X" size="large" />
            </Button>
          }
          mobileTitle={intl.formatMessage(
            certificateMessages.certificateCollectionTitle
          )}
          mobileLeft={
            <Button type="icon" onClick={back} id="action_page_back_button">
              <Icon name="ArrowLeft" size="large" />
            </Button>
          }
          mobileRight={
            <Button
              type="icon"
              onClick={() =>
                navigate(
                  generateGoToHomeTabUrl({
                    tabId: WORKQUEUE_TABS.readyToPrint
                  })
                )
              }
            >
              <Icon name="X" size="large" />
            </Button>
          }
        />
      }
      skipToContentText={intl.formatMessage(
        constantsMessages.skipToMainContent
      )}
    >
      {children}
    </Frame>
  )
}

export const ReviewCertificate = () => {
  const { registrationId } = useParams<{
    registrationId: string
  }>()
  const {
    svgCode,
    handleCertify,
    isPrintInAdvance,
    canUserCorrectRecord,
    handleEdit
  } = usePrintableCertificate(registrationId)

  const intl = useIntl()
  const [modal, openModal] = useModal()

  if (!svgCode) {
    return (
      <ReviewCertificateFrame>
        <Frame.LayoutCentered>
          <Spinner id="review-certificate-loading" />
        </Frame.LayoutCentered>
      </ReviewCertificateFrame>
    )
  }

  const confirmAndPrint = async () => {
    const saveAndExitConfirm = await openModal<boolean>((close) => (
      <ResponsiveModal
        id="confirm-print-modal"
        title={
          isPrintInAdvance
            ? intl.formatMessage(certificateMessages.printModalTitle)
            : intl.formatMessage(certificateMessages.printAndIssueModalTitle)
        }
        actions={[
          <Button
            type="tertiary"
            key="close-modal"
            onClick={() => {
              close(false)
            }}
            id="close-modal"
          >
            {intl.formatMessage(buttonMessages.cancel)}
          </Button>,
          <Button
            type="primary"
            key="print-certificate"
            onClick={() => close(true)}
            id="print-certificate"
          >
            {intl.formatMessage(buttonMessages.print)}
          </Button>
        ]}
        show={true}
        handleClose={() => close(false)}
        contentHeight={100}
      >
        {isPrintInAdvance
          ? intl.formatMessage(certificateMessages.printModalBody)
          : intl.formatMessage(certificateMessages.printAndIssueModalBody)}
      </ResponsiveModal>
    ))

    if (saveAndExitConfirm) {
      handleCertify()
    }
  }

  return (
    <ReviewCertificateFrame>
      <Frame.LayoutCentered>
        <Stack direction="column">
          <Box>
            <CertificateContainer
              id="print"
              dangerouslySetInnerHTML={{ __html: svgCode }}
            />
          </Box>
          <Content
            title={intl.formatMessage(certificateMessages.reviewTitle)}
            showTitleOnMobile
            bottomActionDirection="row"
            bottomActionButtons={[
              canUserCorrectRecord ? (
                <Button
                  key="edit-record"
                  type="negative"
                  onClick={handleEdit}
                  size="large"
                  fullWidth
                >
                  <Icon name="X" size="medium" />
                  {intl.formatMessage(buttonMessages.editRecord)}
                </Button>
              ) : (
                <></>
              ),

              <Button
                key="confirm-and-print"
                type="positive"
                id="confirm-print"
                onClick={confirmAndPrint}
                size="large"
                fullWidth
              >
                <Icon name="Check" size="medium" />
                {intl.formatMessage(certificateMessages.confirmAndPrint)}
              </Button>
            ]}
          >
            {intl.formatMessage(certificateMessages.reviewDescription)}
          </Content>
        </Stack>
      </Frame.LayoutCentered>
      {modal}
    </ReviewCertificateFrame>
  )
}
