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
import * as React from 'react'
import { userMessages as messages, buttonMessages } from '@client/i18n/messages'
import { useIntl } from 'react-intl'
import { ResponsiveModal } from '@opencrvs/components/lib/ResponsiveModal'
import { TertiaryButton, PrimaryButton } from '@opencrvs/components/lib/buttons'
import { Mutation } from '@apollo/client/react/components'
import { changePhoneMutation } from '@client/views/Settings/mutations'
import { convertToMSISDN } from '@client/forms/utils'
import { InputField } from '@opencrvs/components/lib/InputField'
import { TextInput } from '@opencrvs/components/lib/TextInput'
import { useSelector, useDispatch } from 'react-redux'
import { getUserNonce, getUserDetails } from '@client/profile/profileSelectors'
import { EMPTY_STRING } from '@client/utils/constants'
import { modifyUserDetails } from '@client/profile/profileActions'
import { Message } from '@client/views/Settings/items/components'
import {
  ChangePhoneMutationVariables,
  ChangePasswordMutation
} from '@client/utils/gateway'

interface IProps {
  show: boolean
  onSuccess: () => void
  onClose: () => void
  data: {
    phoneNumber: string
  }
}

export function VerifyCodeView({ show, onSuccess, onClose, data }: IProps) {
  const intl = useIntl()
  const { phoneNumber } = data
  const userDetails = useSelector(getUserDetails)
  const nonce = useSelector(getUserNonce)
  const [verifyCode, setVerifyCode] = React.useState(EMPTY_STRING)
  const [isInvalidLength, setIsInvalidLength] = React.useState(false)
  const [errorOccured, setErrorOccured] = React.useState(false)
  const dispatch = useDispatch()
  const onChangeVerifyCode = (event: React.ChangeEvent<HTMLInputElement>) => {
    const verifyCode = event.target.value
    setVerifyCode(verifyCode)
    setIsInvalidLength(verifyCode.length === 6)
  }
  const restoreState = () => {
    setVerifyCode(EMPTY_STRING)
    setIsInvalidLength(false)
    setErrorOccured(false)
  }
  const phoneChangeCompleted = () => {
    if (userDetails) {
      dispatch(
        modifyUserDetails({
          ...userDetails,
          mobile: convertToMSISDN(phoneNumber, window.config.COUNTRY)
        })
      )
    }
    onSuccess()
  }
  React.useEffect(() => {
    if (!show) {
      restoreState()
    }
  }, [show])

  return (
    <ResponsiveModal
      id="VerifyCodeModal"
      show={show}
      title={intl.formatMessage(messages.verifyPhoneLabel)}
      actions={[
        <TertiaryButton key="cancel" id="modal_cancel" onClick={onClose}>
          {intl.formatMessage(buttonMessages.cancel)}
        </TertiaryButton>,
        <Mutation<ChangePasswordMutation, ChangePhoneMutationVariables>
          key="change-phone-mutation"
          mutation={changePhoneMutation}
          onCompleted={phoneChangeCompleted}
          onError={() => setErrorOccured(true)}
        >
          {(changePhone) => {
            return (
              <PrimaryButton
                id="verify-button"
                key="verify"
                onClick={() => {
                  if (userDetails?.userMgntUserID) {
                    changePhone({
                      variables: {
                        userId: userDetails.userMgntUserID,
                        phoneNumber: convertToMSISDN(
                          phoneNumber,
                          window.config.COUNTRY
                        ),
                        nonce: nonce,
                        verifyCode: verifyCode
                      }
                    })
                  }
                }}
                disabled={!Boolean(verifyCode.length) || !isInvalidLength}
              >
                {intl.formatMessage(buttonMessages.verify)}
              </PrimaryButton>
            )
          }}
        </Mutation>
      ]}
      handleClose={onClose}
      contentHeight={150}
      contentScrollableY={true}
    >
      <Message>
        {intl.formatMessage(messages.confirmationPhoneMsg, {
          num: phoneNumber
        })}
      </Message>
      <InputField
        id="verifyCode"
        touched={true}
        required={false}
        optionalLabel=""
        error={
          errorOccured ? intl.formatMessage(messages.incorrectVerifyCode) : ''
        }
      >
        <TextInput
          id="VerifyCode"
          type="number"
          touched={true}
          error={errorOccured}
          value={verifyCode}
          onChange={onChangeVerifyCode}
        />
      </InputField>
    </ResponsiveModal>
  )
}
