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
import { Content, ContentSize } from '@opencrvs/components/lib'
import {
  ICertificate,
  IPrintableDeclaration,
  modifyDeclaration
} from '@client/declarations'
import { IFormField } from '@client/forms'
import React from 'react'
import { buttonMessages } from '@client/i18n/messages'
import { useIntl } from 'react-intl'
import { Button } from '@opencrvs/components/lib/Button'
import { groupHasError } from '@client/views/CorrectionForm/utils'
import { FormFieldGenerator } from '@client/components/form'
import { useDispatch, useSelector } from 'react-redux'
import {
  formatUrl,
  generateIssueCertificatePaymentUrl
} from '@client/navigation'
import { replaceInitialValues } from '@client/views/RegisterForm/RegisterForm'
import { issueMessages } from '@client/i18n/messages/issueCertificate'
import {
  collectBirthCertificateFormSection,
  collectDeathCertificateFormSection,
  collectMarriageCertificateFormSection
} from '@client/forms/certificate/fieldDefinitions/collectorSection'
import { Navigate, useNavigate } from 'react-router-dom'
import { EventType } from '@client/utils/gateway'
import { REGISTRAR_HOME_TAB } from '@client/navigation/routes'
import { WORKQUEUE_TABS } from '@client/components/interface/WorkQueueTabs'
import { getOfflineData } from '@client/offline/selectors'
import { getUserDetails } from '@client/profile/profileSelectors'

function collectorFormFieldsForOthers(event: EventType) {
  const collectCertFormSection =
    event === EventType.Birth
      ? collectBirthCertificateFormSection
      : event === EventType.Death
      ? collectDeathCertificateFormSection
      : collectMarriageCertificateFormSection

  return collectCertFormSection.groups.find(
    (group) => group.id === 'otherCertCollector'
  )!.fields
}

export const IssueCollectorFormForOthers = ({
  declaration
}: {
  declaration: IPrintableDeclaration
}) => {
  const intl = useIntl()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const config = useSelector(getOfflineData)
  const user = useSelector(getUserDetails)
  const form =
    (declaration &&
      declaration.data.registration.certificates &&
      declaration.data.registration.certificates[0].collector) ||
    {}
  const fields: IFormField[] = collectorFormFieldsForOthers(declaration.event)
  const handleChange = (
    sectionData: ICertificate['collector'],
    declaration: IPrintableDeclaration
  ) => {
    const certificates = declaration.data.registration.certificates
    const certificate = (certificates && certificates[0]) || {}
    const collector = { ...(certificate.collector || {}), ...sectionData }

    dispatch(
      modifyDeclaration({
        ...declaration,
        data: {
          ...declaration.data,
          registration: {
            ...declaration.data.registration,
            certificates: [
              {
                collector: collector,
                hasShowedVerifiedDocument: false,
                certificateTemplateId: certificate.certificateTemplateId
              }
            ]
          }
        }
      })
    )
  }

  if (!declaration) {
    return (
      <Navigate
        to={formatUrl(REGISTRAR_HOME_TAB, {
          tabId: WORKQUEUE_TABS.readyToIssue,
          selectorId: ''
        })}
      />
    )
  }

  function continueButtonHandler() {
    const event = declaration.event

    navigate(
      generateIssueCertificatePaymentUrl({
        registrationId: declaration.id,
        event
      })
    )
  }

  return (
    <Content
      title={intl.formatMessage(issueMessages.collectorDetails)}
      size={ContentSize.SMALL}
      bottomActionButtons={[
        <Button
          key="continue-button"
          id="continue-button"
          type="primary"
          size="large"
          fullWidth
          onClick={continueButtonHandler}
          disabled={groupHasError(
            { id: 'otherCollector', fields },
            declaration.data.registration.certificates?.[0]?.collector ?? {},
            config,
            declaration.data,
            user
          )}
        >
          {intl.formatMessage(buttonMessages.continueButton)}
        </Button>
      ]}
      showTitleOnMobile
    >
      <FormFieldGenerator
        id="otherCollector"
        key="otherCollector"
        onChange={(values) => {
          handleChange(values, declaration)
        }}
        setAllFieldsDirty={false}
        fields={replaceInitialValues(
          fields,
          form,
          declaration && declaration.data,
          config,
          user
        )}
        draftData={declaration.data}
      />
    </Content>
  )
}
