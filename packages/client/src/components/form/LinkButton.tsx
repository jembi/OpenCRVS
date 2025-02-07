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
  IFormData,
  IFormField,
  IFormFieldValue,
  IFormSectionData,
  IHttpFormField,
  Ii18nLinkButtonFormField
} from '@client/forms'
import { evalExpressionInFieldDefinition } from '@client/forms/utils'
import { getOfflineData } from '@client/offline/selectors'
import { getUserDetails } from '@client/profile/profileSelectors'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useHttp } from './http'
import { Button, getTheme, Icon } from '@opencrvs/components'
import { useWindowSize } from '@opencrvs/components/src/hooks'

export const LinkButtonField = ({
  fields,
  form,
  draft,
  draftId,
  fieldDefinition,
  setFieldValue,
  isDisabled
}: {
  fields: IFormField[]
  form: IFormSectionData
  draft: IFormData
  draftId: string
  fieldDefinition: Ii18nLinkButtonFormField
  setFieldValue: (name: string, value: IFormFieldValue) => void
  isDisabled?: boolean
}) => {
  const config = useSelector(getOfflineData)
  const user = useSelector(getUserDetails)
  const windowSize = useWindowSize()
  const theme = getTheme()
  const {
    options: {
      url: to,
      callback: { params }
    }
  } = fieldDefinition
  const trigger = fields.find(
    (f) => f.name === fieldDefinition.options.callback.trigger
  )!
  const onChange: Parameters<typeof useHttp>[1] = ({ data, error, loading }) =>
    setFieldValue(trigger.name, { loading, data, error } as IFormFieldValue)
  const [hasCallbackRequestBeenMade, setCallbackRequestBeenMade] =
    useState(false)

  const { call } = useHttp<string>(
    trigger as IHttpFormField,
    onChange,
    form,
    config,
    draft,
    user
  )

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    function checkParamsPresentInURL() {
      for (const [key, value] of Object.entries(params)) {
        if (urlParams.get(key) !== value) {
          return false
        }
      }
      return true
    }
    if (checkParamsPresentInURL() && !hasCallbackRequestBeenMade) {
      call({
        // forward params which are received after redirection to the callback request
        params: Object.fromEntries(urlParams)
      })
      setCallbackRequestBeenMade(true)
    }
  }, [call, params, form, trigger, hasCallbackRequestBeenMade])
  return (
    <Button
      type="secondary"
      size="large"
      element="a"
      fullWidth
      disabled={isDisabled}
      onClick={() => {
        window.location.href = evalExpressionInFieldDefinition(
          '`' + decodeURIComponent(to) + '`',
          form,
          config,
          draft,
          draftId,
          user
        )
      }}
    >
      {fieldDefinition.icon &&
        (windowSize.width <= theme.grid.breakpoints.md ? (
          <Icon name={fieldDefinition.icon.mobile} size="medium" />
        ) : (
          <Icon name={fieldDefinition.icon.desktop} size="medium" />
        ))}
      {fieldDefinition.label}
    </Button>
  )
}
