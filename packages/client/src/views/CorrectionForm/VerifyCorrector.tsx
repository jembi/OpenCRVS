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
import { ActionPageLight } from '@opencrvs/components/lib/ActionPageLight'
import {
  modifyDeclaration,
  IDeclaration,
  writeDeclaration,
  IPrintableDeclaration
} from '@client/declarations'
import { IForm, ReviewSection } from '@client/forms'
import { messages } from '@client/i18n/messages/views/correction'
import {
  formatUrl,
  generateGoToHomeTabUrl,
  generateGoToPageGroupUrl
} from '@client/navigation'
import { IStoreState } from '@client/store'
import {
  IDVerifier,
  ICorrectorInfo
} from '@client/views/CorrectionForm/IDVerifier'
import * as React from 'react'
import { WrappedComponentProps as IntlShapeProps, injectIntl } from 'react-intl'
import { connect } from 'react-redux'
import { Navigate } from 'react-router-dom'
import {
  RouteComponentProps,
  withRouter
} from '@client/components/WithRouterProps'
import {
  CERTIFICATE_CORRECTION_REVIEW,
  REGISTRAR_HOME_TAB
} from '@client/navigation/routes'
import { getVerifyCorrectorDefinition } from '@client/forms/correction/verifyCorrector'
import { TimeMounted } from '@client/components/TimeMounted'
import { WORKQUEUE_TABS } from '@client/components/interface/WorkQueueTabs'
import { draftToGqlTransformer } from '@client/transformer'
import { getEventRegisterForm } from '@client/forms/register/declaration-selectors'
import { getOfflineData } from '@client/offline/selectors'
import { getUserDetails } from '@client/profile/profileSelectors'
import { IOfflineData } from '@client/offline/reducer'
import { UserDetails } from '@client/utils/userUtils'
import { LoadingSpinner } from '@client/components/DraftLoadingSpinner'

interface INameField {
  firstNamesField: string
  familyNameField: string
}
interface INameFields {
  [language: string]: INameField
}

interface ICertificateCorrectorField {
  identifierTypeField: string
  identifierOtherTypeField: string
  identifierField: string
  nameFields: INameFields
  birthDateField?: string
  ageOfPerson?: string
  nationalityField?: string
}

export interface ICertificateCorrectorDefinition {
  [corrector: string]: ICertificateCorrectorField
}

interface IStateProps {
  declaration: IDeclaration
  form: ICertificateCorrectorDefinition
  registerForm: IForm
  config: IOfflineData
  user: UserDetails | null
}
interface IDispatchProps {
  modifyDeclaration: typeof modifyDeclaration
  writeDeclaration: typeof writeDeclaration
}

type IOwnProps = RouteComponentProps

type IFullProps = IStateProps & IDispatchProps & IOwnProps & IntlShapeProps

const CHILD = 'child'
const FATHER = 'father'
const INFORMANT = 'informant'
const MOTHER = 'mother'

const VerifyCorrectorComponent = ({
  declaration,
  form,
  registerForm,
  config,
  user,
  modifyDeclaration,
  writeDeclaration,
  intl,
  router
}: IFullProps) => {
  const { corrector } = router.params
  const handleVerification = (hasShowedVerifiedDocument: boolean) => {
    const changed = {
      ...declaration,
      data: {
        ...declaration.data,
        corrector: {
          ...declaration.data.corrector,
          hasShowedVerifiedDocument
        }
      }
    }
    modifyDeclaration(changed)
    writeDeclaration(changed)

    router.navigate(
      generateGoToPageGroupUrl({
        pageRoute: CERTIFICATE_CORRECTION_REVIEW,
        declarationId: declaration.id,
        pageId: ReviewSection.Review,
        groupId: 'review-view-group',
        event: declaration.event
      })
    )
  }

  const getGenericCorrectorInfo = (corrector: string): ICorrectorInfo => {
    const info = declaration.data[corrector]
    //TODO :: we have to get form defination from new certificateCorrectorDefination
    const showInfoFor = [MOTHER, FATHER, CHILD, INFORMANT]

    const eventRegistrationInput = draftToGqlTransformer(
      registerForm,
      declaration.data,
      declaration.id,
      user,
      config
    )

    const informantType =
      eventRegistrationInput.registration.informantType.toLowerCase()

    if (showInfoFor.includes(corrector)) {
      const fields = form[corrector]
      const iD =
        (corrector === INFORMANT
          ? eventRegistrationInput[informantType]?.identifier?.[0]?.id
          : undefined) ?? eventRegistrationInput[corrector]?.identifier?.[0]?.id
      const iDType =
        (corrector === INFORMANT
          ? eventRegistrationInput[informantType]?.identifier?.[0]?.type
          : undefined) ??
        eventRegistrationInput[corrector]?.identifier?.[0]?.type

      const firstNameIndex = (
        fields.nameFields[intl.locale] || fields.nameFields[intl.defaultLocale]
      ).firstNamesField

      const familyNameIndex = (
        fields.nameFields[intl.locale] || fields.nameFields[intl.defaultLocale]
      ).familyNameField

      const firstNames = info[firstNameIndex] as string
      const familyName = info[familyNameIndex] as string

      const isExactDobUnknownForIdVerifier =
        !!declaration?.data[corrector]?.exactDateOfBirthUnknown

      const birthDate = !isExactDobUnknownForIdVerifier
        ? fields.birthDateField && (info[fields.birthDateField] as string)
        : ''
      const nationality =
        (fields.nationalityField &&
          (info[fields.nationalityField] as string)) ||
        ''
      const age = isExactDobUnknownForIdVerifier
        ? (info[fields.ageOfPerson as string] as string)
        : ''

      return {
        iD,
        iDType,
        firstNames,
        familyName,
        birthDate,
        nationality,
        age
      }
    }
    return {
      iD: '',
      iDType: '',
      firstNames: '',
      familyName: '',
      birthDate: '',
      nationality: '',
      age: ''
    }
  }

  const logTime = (timeMs: number) => {
    const updatedDeclaration = { ...declaration }

    updatedDeclaration.timeLoggedMS = updatedDeclaration.timeLoggedMS ?? 0
    updatedDeclaration.timeLoggedMS += timeMs
    modifyDeclaration(updatedDeclaration)
  }

  if (!declaration) {
    return (
      <Navigate
        to={formatUrl(REGISTRAR_HOME_TAB, {
          tabId: WORKQUEUE_TABS.readyForReview,
          selectorId: ''
        })}
      />
    )
  }

  if (declaration.writingDraft) {
    return <LoadingSpinner />
  }
  const correctorInfo = getGenericCorrectorInfo(corrector!)
  const hasNoInfo = Object.values(correctorInfo).every(
    (property) => property === undefined || property === ''
  )

  return (
    <TimeMounted onUnmount={logTime}>
      <ActionPageLight
        goBack={() => router.navigate(-1)}
        goHome={() =>
          router.navigate(
            generateGoToHomeTabUrl({
              tabId: WORKQUEUE_TABS.readyForReview
            })
          )
        }
        title={intl.formatMessage(messages.title)}
        hideBackground
      >
        {
          <IDVerifier
            id="idVerifier"
            title={intl.formatMessage(messages.idCheckTitle)}
            correctorInformation={(!hasNoInfo && correctorInfo) || undefined}
            actionProps={{
              positiveAction: {
                label: intl.formatMessage(messages.idCheckVerify),
                handler: () => {
                  handleVerification(true)
                }
              },
              negativeAction: {
                label: intl.formatMessage(messages.idCheckWithoutVerify),
                handler: () => {
                  handleVerification(false)
                }
              }
            }}
          />
        }
      </ActionPageLight>
    </TimeMounted>
  )
}

const mapStateToProps = (
  state: IStoreState,
  ownProps: IOwnProps
): IStateProps => {
  const { declarationId } = ownProps.router.match.params

  const declaration = state.declarationsState.declarations.find(
    (draft) => draft.id === declarationId
  ) as IPrintableDeclaration

  return {
    declaration: declaration,
    form: getVerifyCorrectorDefinition(declaration.event),
    registerForm: getEventRegisterForm(state, declaration.event),
    config: getOfflineData(state),
    user: getUserDetails(state)
  }
}

export const VerifyCorrector = withRouter(
  connect(mapStateToProps, {
    modifyDeclaration,
    writeDeclaration
  })(injectIntl(VerifyCorrectorComponent))
)
