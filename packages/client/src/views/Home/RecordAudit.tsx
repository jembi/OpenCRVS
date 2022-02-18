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

import React from 'react'
import { Header } from '@client/components/interface/Header/Header'
import {
  Content,
  ContentSize
} from '@opencrvs/components/lib/interface/Content'
import { Navigation } from '@client/components/interface/Navigation'
import styled, { ITheme, withTheme } from '@client/styledComponents'
import { ApplicationIcon, Edit } from '@opencrvs/components/lib/icons'
import { connect } from 'react-redux'
import {
  goToApplicationDetails,
  goBack as goBackAction,
  goToRegistrarHomeTab,
  goToCertificateCorrection
} from '@client/navigation'
import { RouteComponentProps } from 'react-router'
import { injectIntl, WrappedComponentProps as IntlShapeProps } from 'react-intl'
import {
  IWorkqueue,
  IApplication,
  SUBMISSION_STATUS,
  clearCorrectionChange
} from '@client/applications'
import { IStoreState } from '@client/store'
import {
  GQLEventSearchSet,
  GQLBirthEventSearchSet,
  GQLDeathEventSearchSet,
  GQLHumanName
} from '@opencrvs/gateway/src/graphql/schema'
import moment from 'moment'
import { getOfflineData } from '@client/offline/selectors'
import { IOfflineData } from '@client/offline/reducer'
import {
  IFormSectionData,
  IContactPoint,
  CorrectionSection
} from '@client/forms'
import { Spinner } from '@opencrvs/components/lib/interface'
import {
  ICON_ALIGNMENT,
  TertiaryButton
} from '@opencrvs/components/lib/buttons'
import { messages as correctionMessages } from '@client/i18n/messages/views/correction'

const BodyContainer = styled.div`
  margin-left: 0px;
  margin-top: 0px;
  @media (min-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    margin-left: 265px;
    margin-top: 28px;
  }
`

const StyledSpinner = styled(Spinner)`
  margin: 20% auto;
`

const InfoContainer = styled.div`
  display: flex;
  margin-bottom: 16px;
  &:last-child {
    margin-bottom: 0px;
  }
`

const KeyContainer = styled.div`
  width: 190px;
  color: ${({ theme }) => theme.colors.grey};
  ${({ theme }) => theme.fonts.bodyBoldStyle}
`

const ValueContainer = styled.div<{ value: undefined | string }>`
  width: 325px;
  color: ${({ theme, value }) =>
    value ? theme.colors.grey : theme.colors.grey600};
  ${({ theme }) => theme.fonts.captionBigger};
`

const GreyedInfo = styled.div`
  height: 26px;
  background-color: ${({ theme }) => theme.colors.greyInfo};
  max-width: 330px;
`

interface IStateProps {
  workqueue: IWorkqueue
  resources: IOfflineData
  savedApplications: IApplication[]
}

interface IDispatchProps {
  goToApplicationDetails: typeof goToApplicationDetails
  goBack: typeof goBackAction
  goToRegistrarHomeTab: typeof goToRegistrarHomeTab
  clearCorrectionChange: typeof clearCorrectionChange
  goToCertificateCorrection: typeof goToCertificateCorrection
}

type IFullProps = IDispatchProps &
  IStateProps &
  IDispatchProps &
  IntlShapeProps & { theme: ITheme } & RouteComponentProps<
    {
      applicationId: string
    },
    {},
    { isNavigatedInsideApp: boolean }
  >

interface ILabel {
  [key: string]: string | undefined
}

interface IApplicationData {
  id: string
  name?: string
  status?: string
  trackingId?: string
  type?: string
  dateOfBirth?: string
  dateOfDeath?: string
  placeOfBirth?: string
  placeOfDeath?: string
  informant?: string
  informantContact?: string
  brnDrn?: string
}

interface IGQLApplication {
  id: string
  child?: { name: GQLHumanName[] }
  deceased?: { name: GQLHumanName[] }
  registration?: {
    trackingId: string
    type: string
    status: { type: string }[]
  }
}

const STATUSTOCOLOR: { [key: string]: string } = {
  DRAFT: 'violet',
  DECLARED: 'orange',
  REJECTED: 'red',
  VALIDATED: 'grey',
  REGISTERED: 'green',
  CERTIFIED: 'green',
  WAITING_VALIDATION: 'teal'
}

const KEY_LABEL: ILabel = {
  status: 'Status',
  type: 'Event',
  trackingId: 'Tracking ID',
  dateOfBirth: 'Date of birth',
  dateOfDeath: 'Date of death',
  placeOfBirth: 'Place of birth',
  placeOfDeath: 'Place of death',
  informant: 'Informant',
  brn: 'BRN',
  drn: 'DRN'
}

const NO_DATA_LABEL: ILabel = {
  status: 'No status',
  type: 'No event',
  trackingId: 'No tracking id',
  dateOfBirth: 'No date of birth',
  dateOfDeath: 'No date of death',
  placeOfBirth: 'No place of birth',
  placeOfDeath: 'No place of death',
  informant: 'No informant'
}

const getCaptitalizedWord = (word: string | undefined): string => {
  if (!word) return ''
  return word.toUpperCase()[0] + word.toLowerCase().slice(1)
}

const isBirthApplication = (
  application: GQLEventSearchSet | null
): application is GQLBirthEventSearchSet => {
  return (application && application.type === 'Birth') || false
}

const isDeathApplication = (
  application: GQLEventSearchSet | null
): application is GQLDeathEventSearchSet => {
  return (application && application.type === 'Death') || false
}

const goBack = (props: IFullProps) => {
  const historyState = props.location.state
  const navigatedFromInsideApp = Boolean(
    historyState && historyState.isNavigatedInsideApp
  )

  if (navigatedFromInsideApp) {
    props.goBack()
  } else {
    props.goToRegistrarHomeTab('review')
  }
}

const getDraftApplicationName = (application: IApplication): string => {
  let name = ''
  let applicationName
  if (application.event === 'birth') {
    applicationName = application.data?.child
  } else {
    applicationName = application.data?.deceased
  }

  if (applicationName) {
    name = [applicationName.firstNamesEng, applicationName.familyNameEng]
      .filter((part) => Boolean(part))
      .join(' ')
  }
  return name
}

const getWQApplicationName = (application: GQLEventSearchSet): string => {
  let name = ''
  const applicationName =
    (isBirthApplication(application) &&
      application.childName &&
      application.childName[0]) ||
    (isDeathApplication(application) &&
      application.deceasedName &&
      application.deceasedName[0])

  if (applicationName) {
    name = [applicationName.firstNames, applicationName.familyName]
      .filter((part) => Boolean(part))
      .join(' ')
  }
  return name
}

const getLocation = (application: IApplication, props: IFullProps) => {
  let locationType = ''
  let locationId = ''
  let locationDistrict = ''
  let locationPermanent = ''
  if (application.event === 'death') {
    locationType =
      application.data?.deathEvent?.deathPlaceAddress?.toString() || ''
    locationId = application.data?.deathEvent?.deathLocation?.toString() || ''
    locationDistrict = application.data?.deathEvent?.district?.toString() || ''
    locationPermanent =
      application.data?.deceased?.districtPermanent?.toString() || ''
  } else {
    locationType = application.data?.child?.placeOfBirth?.toString() || ''
    locationId = application.data?.child?.birthLocation?.toString() || ''
    locationDistrict = application.data?.child?.district?.toString() || ''
  }

  if (locationType === 'HEALTH_FACILITY') {
    const facility = props.resources.facilities[locationId] || ''
    return facility?.alias + ' District'
  }
  if (locationType === 'OTHER' || locationType === 'PRIVATE_HOME') {
    const location = props.resources.locations[locationDistrict] || ''
    return location?.alias + ' District'
  }
  if (locationType === 'PERMANENT') {
    const district = props.resources.locations[locationPermanent] || ''
    return district?.alias + ' District'
  }
  return ''
}

const getSavedApplications = (props: IFullProps): IApplicationData => {
  const savedApplications = props.savedApplications
  const applicationId = props.match.params.applicationId

  const applications = savedApplications
    .filter((application: IApplication) => {
      return (
        application.id === applicationId ||
        application.compositionId === applicationId
      )
    })
    .map((application) => {
      const name = getDraftApplicationName(application)
      return {
        id: application.id,
        name: name,
        status:
          application.submissionStatus?.toString() ||
          application.registrationStatus?.toString() ||
          '',
        type: application.event || '',
        brnDrn:
          application.data?.registration?.registrationNumber?.toString() || '',
        trackingId:
          application.data?.registration?.trackingId?.toString() || '',
        dateOfBirth: application.data?.child?.childBirthDate?.toString() || '',
        dateOfDeath: application.data?.deathEvent?.deathDate?.toString() || '',
        placeOfBirth: getLocation(application, props) || '',
        placeOfDeath: getLocation(application, props) || '',
        informant:
          (
            application.data?.registration?.contactPoint as IFormSectionData
          )?.value.toString() || '',
        informantContact:
          (
            (application.data?.registration?.contactPoint as IFormSectionData)
              ?.nestedFields as IContactPoint
          )?.registrationPhone.toString() || ''
      }
    })
  return applications[0]
}

const getWQApplication = (props: IFullProps): IApplicationData | null => {
  const applicationId = props.match.params.applicationId

  const workqueue = props.workqueue.data

  let applications: Array<
    GQLBirthEventSearchSet | GQLDeathEventSearchSet | null
  > = []

  if (workqueue.approvalTab.results) {
    applications = applications.concat(workqueue.approvalTab.results)
  }
  if (workqueue.printTab.results) {
    applications = applications.concat(workqueue.printTab.results)
  }
  if (workqueue.inProgressTab.results) {
    applications = applications.concat(workqueue.inProgressTab.results)
  }
  if (workqueue.externalValidationTab.results) {
    applications = applications.concat(workqueue.externalValidationTab.results)
  }
  if (workqueue.rejectTab.results) {
    applications = applications.concat(workqueue.rejectTab.results)
  }
  if (workqueue.reviewTab.results) {
    applications = applications.concat(workqueue.reviewTab.results)
  }
  if (workqueue.notificationTab.results) {
    applications = applications.concat(workqueue.notificationTab.results)
  }

  const specificApplication = applications.find((application) => {
    return application && application.id === applicationId
  })

  let applicationData: IApplicationData | null = null
  if (specificApplication) {
    const name = getWQApplicationName(specificApplication)

    applicationData = {
      id: specificApplication.id,
      name: name,
      type: (specificApplication.type && specificApplication.type) || '',
      status: specificApplication.registration?.status || '',
      trackingId: specificApplication.registration?.trackingId || '',
      dateOfBirth: '',
      placeOfBirth: '',
      informant: ''
    }
  }

  return applicationData
}

const getApplicationInfo = (
  props: IFullProps,
  application: IApplicationData,
  isDownloaded: boolean
) => {
  let informant = getCaptitalizedWord(application?.informant)

  const status = getCaptitalizedWord(application?.status).split('_')
  let finalStatus = status[0]
  if (status[1]) finalStatus += ' ' + status[1]

  if (application?.informantContact) {
    informant =
      informant + ' . ' + getCaptitalizedWord(application.informantContact)
  }

  let info: ILabel = {
    status: application?.status && finalStatus,
    type: getCaptitalizedWord(application?.type),
    trackingId: application?.trackingId
  }

  if (info.type === 'Birth') {
    if (application?.brnDrn) {
      info = {
        ...info,
        brn: application.brnDrn
      }
    }
    info = {
      ...info,
      dateOfBirth: application?.dateOfBirth,
      placeOfBirth: application?.placeOfBirth,
      informant: informant
    }
  } else if (info.type === 'Death') {
    if (application?.brnDrn) {
      info = {
        ...info,
        drn: application.brnDrn
      }
    }
    info = {
      ...info,
      dateOfDeath: application?.dateOfDeath,
      placeOfDeath: application?.placeOfDeath,
      informant: informant
    }
  }
  return (
    <>
      {Object.entries(info).map(([key, value]) => {
        return (
          <InfoContainer id={'summary'} key={key}>
            <KeyContainer id={`${key}`}>{KEY_LABEL[key]}</KeyContainer>
            <ValueContainer id={`${key}_value`} value={value}>
              {value ? (
                key === 'dateOfBirth' || key === 'dateOfDeath' ? (
                  moment(new Date(value)).format('MMMM DD, YYYY')
                ) : (
                  value
                )
              ) : isDownloaded ? (
                NO_DATA_LABEL[key]
              ) : (
                <GreyedInfo id={`${key}_grey`} />
              )}
            </ValueContainer>
          </InfoContainer>
        )
      })}
    </>
  )
}

// const showActions = (application: IApplicationData, isDownloaded: boolean) => {
//   const actions = []
//   isDownloaded &&
//     application.status === SUBMISSION_STATUS.REGISTERED &&
//     actions.push(
//       <TertiaryButton
//         id="btn-correct-record"
//         align={ICON_ALIGNMENT.LEFT}
//         icon={() => <Edit />}
//         onClick={() => {
//           props.clearCorrectionChange(eventDetails.id)
//           this.props.goToCertificateCorrection(
//             eventDetails.id,
//             CorrectionSection.Corrector
//           )
//         }}
//       >
//         {intl.formatMessage(correctionMessages.title)}
//       </TertiaryButton>
//     )
//   return actions
// }

export const ShowRecordAudit = (props: IFullProps) => {
  const applicationId = props.match.params.applicationId
  let application: IApplicationData | null
  application = getSavedApplications(props)
  const isDownloaded = application ? true : false
  if (!isDownloaded) {
    application = getWQApplication(props)
  }

  return (
    <div id={'recordAudit'}>
      <Header />
      <Navigation deselectAllTabs={true} />
      <BodyContainer>
        {application && (
          <Content
            title={application.name || 'No name provided'}
            titleColor={application.name ? 'copy' : 'grey600'}
            size={ContentSize.LARGE}
            topActionButtons={[
              <TertiaryButton
                id="btn-correct-record"
                align={ICON_ALIGNMENT.LEFT}
                icon={() => <Edit />}
                onClick={() => {
                  props.clearCorrectionChange(applicationId)
                  props.goToCertificateCorrection(
                    applicationId,
                    CorrectionSection.Corrector
                  )
                }}
              >
                {props.intl.formatMessage(correctionMessages.title)}
              </TertiaryButton>
            ]}
            icon={() => (
              <ApplicationIcon
                color={
                  STATUSTOCOLOR[(application && application.status) || 'DRAFT']
                }
              />
            )}
          >
            {getApplicationInfo(props, application, isDownloaded)}
          </Content>
        )}
      </BodyContainer>
    </div>
  )
}

function mapStateToProps(state: IStoreState): IStateProps {
  return {
    workqueue: state.workqueueState.workqueue,
    resources: getOfflineData(state),
    savedApplications:
      state.applicationsState.applications &&
      state.applicationsState.applications
  }
}

export const RecordAudit = connect<
  IStateProps,
  IDispatchProps,
  RouteComponentProps<{ applicationId: string }>,
  IStoreState
>(mapStateToProps, {
  goToApplicationDetails,
  goBack: goBackAction,
  goToRegistrarHomeTab,
  clearCorrectionChange,
  goToCertificateCorrection
})(injectIntl(withTheme(ShowRecordAudit)))
