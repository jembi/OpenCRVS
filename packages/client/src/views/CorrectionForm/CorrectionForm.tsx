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
import { connect } from 'react-redux'
import { IStoreState } from '@client/store'
import { Navigate } from 'react-router-dom'
import {
  RouteComponentProps,
  withRouter
} from '@client/components/WithRouterProps'
import { IDeclaration, modifyDeclaration } from '@client/declarations'
import {
  CorrectorForm,
  SupportingDocumentsForm
} from '@client/views/CorrectionForm'
import { CorrectionSection } from '@client/forms'
import { CorrectionReasonForm } from './CorrectionReasonForm'
import { CorrectionSummary } from './CorrectionSummary'
import { TimeMounted } from '@client/components/TimeMounted'
import { HOME } from '@client/navigation/routes'
import { LoadingSpinner } from '@client/components/DraftLoadingSpinner'

type IProps = IStateProps & IDispatchProps

function CorrectionFormComponent({ sectionId, declaration, ...props }: IProps) {
  const { modifyDeclaration } = props
  if (!declaration) {
    return <Navigate to={HOME} />
  }

  const logTime = (timeMs: number) => {
    modifyDeclaration({
      timeLoggedMS: declaration.timeLoggedMS ?? 0 + timeMs
    })
  }

  if (declaration.writingDraft) {
    return <LoadingSpinner />
  }

  return (
    <TimeMounted onUnmount={logTime}>
      <FormSection sectionId={sectionId} declaration={declaration} {...props} />
    </TimeMounted>
  )
}

function FormSection({
  sectionId,
  ...props
}: IProps & { declaration: IDeclaration }) {
  switch (sectionId) {
    case CorrectionSection.Corrector:
      return <CorrectorForm {...props} />
    case CorrectionSection.Reason:
      return <CorrectionReasonForm {...props} />
    case CorrectionSection.SupportingDocuments:
      return <SupportingDocumentsForm {...props} />
    case CorrectionSection.Summary:
      return <CorrectionSummary {...props} />
    default:
      return <></>
  }
}

function mapStateToProps(state: IStoreState, props: RouteComponentProps) {
  const { declarationId, pageId: sectionId } = props.router.match.params
  const declaration = state.declarationsState.declarations.find(
    ({ id }) => id === declarationId
  )

  return {
    declaration,
    sectionId
  }
}

type IStateProps = ReturnType<typeof mapStateToProps>

type IDispatchProps = {
  modifyDeclaration: typeof modifyDeclaration
}

export const CorrectionForm = withRouter(
  connect<IStateProps, IDispatchProps, RouteComponentProps, IStoreState>(
    mapStateToProps,
    { modifyDeclaration }
  )(CorrectionFormComponent)
)
