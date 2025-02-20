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
import { ResponsiveModal } from '@opencrvs/components/lib/ResponsiveModal'
import {
  TertiaryButton,
  DangerButton,
  SuccessButton
} from '@opencrvs/components/lib/buttons'
import { injectIntl, WrappedComponentProps } from 'react-intl'
import { buttonMessages } from '@client/i18n/messages'
import { messages } from '@client/i18n/messages/views/sysAdmin'
import { createNamesMap } from '@client/utils/data-formatting'
import { LANG_EN } from '@client/utils/constants'
import { IUserAuditForm } from '@client/user/user-audit'
import { IStoreState } from '@client/store'
import { connect, useSelector } from 'react-redux'
import { FormFieldGenerator } from '@client/components/form'
import styled from 'styled-components'
import { IFormSectionData } from '@client/forms'
import { hasFormError } from '@client/forms/utils'
import { ErrorText } from '@opencrvs/components/lib/ErrorText'
import { GET_USER, USER_AUDIT_ACTION } from '@client/user/queries'
import { Dispatch } from 'redux'
import {
  showUserAuditSuccessToast,
  showSubmitFormErrorToast
} from '@client/notification/actions'
import { TOAST_MESSAGES } from '@client/user/userReducer'
import {
  ApolloClient,
  InternalRefetchQueriesInclude,
  useQuery
} from '@apollo/client'
import { withApollo, WithApolloClient } from '@apollo/client/react/hoc'
import { getOfflineData } from '@client/offline/selectors'
import { Text } from '@opencrvs/components'
import { GetUserQuery, GetUserQueryVariables } from '@client/utils/gateway'

const { useState, useEffect } = React

interface ConnectProps {
  form: IUserAuditForm | null
}

interface DispatchProps {
  showSuccessToast: typeof showUserAuditSuccessToast
  showErrorToast: () => void
}

interface ToggleUserActivationModalProps
  extends WrappedComponentProps,
    ConnectProps,
    DispatchProps {
  userId: string
  show: boolean
  onConfirmRefetchQueries?: InternalRefetchQueriesInclude
  onClose: () => void
}

interface IUserAuditVariables {
  userId: string
  action: string
  reason: string
  comment: string
}

const Subtitle = styled(Text)`
  padding-bottom: 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey200};
`

export enum AUDIT_ACTION {
  DEACTIVATE = 'DEACTIVATE',
  REACTIVATE = 'REACTIVATE'
}
const statusActionMap = {
  active: AUDIT_ACTION.DEACTIVATE,
  deactivated: AUDIT_ACTION.REACTIVATE
}

type AuditStatus = keyof typeof statusActionMap

function isValidAuditStatus(status: string): status is AuditStatus {
  return Object.keys(statusActionMap).includes(status)
}

let makeAllFieldsDirty: (touched: {}) => void

function UserAuditActionModalComponent(
  props: WithApolloClient<ToggleUserActivationModalProps>
) {
  const { intl, userId, onClose, show, form } = props
  const [formValues, setFormValues] = useState<IFormSectionData>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [isErrorVisible, makeErrorVisible] = useState<boolean>(false)
  const config = useSelector(getOfflineData)
  const { data } = useQuery<GetUserQuery, GetUserQueryVariables>(GET_USER, {
    variables: { userId },
    fetchPolicy: 'cache-first'
  })
  const user = data?.getUser ?? null

  let name = ''
  let modalTitle = ''
  let modalSubtitle = ''
  const actions = [
    <TertiaryButton key="modal-cancel" id="modal-cancel" onClick={onClose}>
      {intl.formatMessage(buttonMessages.cancel)}
    </TertiaryButton>
  ]

  if (user) {
    name =
      (createNamesMap(user.name)[intl.locale] as string) ||
      (createNamesMap(user.name)[LANG_EN] as string)
  }

  useEffect(() => {
    if (!props.form?.fields) return

    if (
      hasFormError(props.form.fields, formValues, config, { formValues }, user)
    ) {
      if (user && user.status === 'active') {
        const auditAction = 'deactivating'
        setFormError(intl.formatMessage(messages.formError, { auditAction }))
      } else if (user && user.status === 'deactivated') {
        const auditAction = 'reactivating'
        setFormError(intl.formatMessage(messages.formError, { auditAction }))
      }
    } else {
      setFormError(null)
    }
  }, [props.form?.fields, formValues, intl, user, config])

  useEffect(() => {
    function cleanUpFormState() {
      makeErrorVisible(false)
      setFormValues({})
    }

    function injectAuditActionToFormValues() {
      const action =
        user && user.status && isValidAuditStatus(user.status)
          ? statusActionMap[user.status]
          : AUDIT_ACTION.DEACTIVATE
      setFormValues({ action })
    }

    if (!props.show) {
      cleanUpFormState()
    } else {
      injectAuditActionToFormValues()
    }
  }, [props.show, user])

  function handleConfirm() {
    if (makeAllFieldsDirty) {
      const touched = props.form?.fields.reduce(
        (memo: any, field: { name: any }) => ({ ...memo, [field.name]: true }),
        {}
      )
      makeAllFieldsDirty(touched)
    }
    makeErrorVisible(true)
    if (!formError) {
      const userId = user?.id ?? ''

      ;(props.client as ApolloClient<any>)
        .mutate({
          mutation: USER_AUDIT_ACTION,
          variables: {
            userId,
            ...(formValues as {
              reason: string
              comment: string
              action: AUDIT_ACTION
            })
          } as IUserAuditVariables,
          refetchQueries: props.onConfirmRefetchQueries
        })
        .then(() =>
          props.showSuccessToast(name, formValues.action as AUDIT_ACTION)
        )
        .catch(() => props.showErrorToast())
      onClose()
    }
  }

  if (user && user.status === 'active') {
    actions.push(
      <DangerButton id="deactivate-action" onClick={handleConfirm}>
        {intl.formatMessage(buttonMessages.deactivate)}
      </DangerButton>
    )

    modalTitle = intl.formatMessage(messages.deactivateUserTitle, { name })
    modalSubtitle = intl.formatMessage(messages.deactivateUserSubtitle, {
      name
    })
  }

  if (user && user.status === 'deactivated') {
    actions.push(
      <SuccessButton id="reactivate-action" onClick={handleConfirm}>
        {intl.formatMessage(buttonMessages.reactivate)}
      </SuccessButton>
    )

    modalTitle = intl.formatMessage(messages.reactivateUserTitle, { name })
    modalSubtitle = intl.formatMessage(messages.reactivateUserSubtitle, {
      name
    })
  }

  return (
    <ResponsiveModal
      id="user-audit-modal"
      title={modalTitle}
      hideHeaderBoxShadow
      show={show}
      width={920}
      contentHeight={504}
      handleClose={onClose}
      responsive
      actions={actions}
    >
      <Subtitle id="modal-subtitle" variant="reg18" color="copy" element="span">
        {modalSubtitle}
      </Subtitle>
      {formError && isErrorVisible && (
        <ErrorText id="form-error">{formError}</ErrorText>
      )}
      <FormFieldGenerator
        id="user-audit-form"
        fields={form?.fields ?? []}
        onChange={(values) => setFormValues({ ...formValues, ...values })}
        setAllFieldsDirty={false}
        draftData={{ formValues }}
      />
    </ResponsiveModal>
  )
}

function mapStateToProps(state: IStoreState) {
  const { userAuditForm } = state.userForm
  return {
    form: userAuditForm
  }
}

function mapDispatchToProps(dispatch: Dispatch) {
  return {
    showSuccessToast: (userFullName: string, auditAction: AUDIT_ACTION) =>
      dispatch(showUserAuditSuccessToast(userFullName, auditAction)),
    showErrorToast: () =>
      dispatch(showSubmitFormErrorToast(TOAST_MESSAGES.FAIL))
  }
}

export const UserAuditActionModal = connect(
  mapStateToProps,
  mapDispatchToProps
)(
  injectIntl(
    withApollo<ToggleUserActivationModalProps>(UserAuditActionModalComponent)
  )
)
