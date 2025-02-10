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

import { useEffect, useRef, useState } from 'react'
import { useIntl } from 'react-intl'
import { messages } from '@client/i18n/messages/views/review'
import {
  ImageUploader,
  InputError,
  ResponsiveModal
} from '@opencrvs/components'
import {
  buttonMessages,
  formMessages,
  validationMessages
} from '@client/i18n/messages'
import { getBase64String } from '@client/utils/imageUtils'
import { Stack } from '@opencrvs/components/lib/Stack'
import { Button } from '@opencrvs/components/lib/Button'
import { Icon } from '@opencrvs/components/lib/Icon'
import * as React from 'react'
import styled from 'styled-components'
import SignatureCanvas from 'react-signature-canvas'
import { EMPTY_STRING } from '@client/utils/constants'
import { ISignatureFormField } from '@client/forms'
import { Text } from '@opencrvs/components/lib/Text'

const SignatureContainer = styled.div`
  border: 2px solid ${({ theme }) => theme.colors.grey600};
  border-radius: 4px;
  width: 100%;
`
const SignatureInputContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`
const SignaturePreview = styled.img`
  max-width: 50%;
  display: block;
`
const SignatureDescription = styled(Text)`
  margin-top: 0;
`
export type SignatureUploaderProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'onChange' | 'value'
> & {
  name: string
  value: string
  onChange: (value: string) => void
  required?: boolean
  maxSizeMb?: number
  allowedFileFormats?: ISignatureFormField['allowedFileFormats']
  modalTitle: string
}

export function SignatureUploader({
  value: signatureData,
  onChange,
  modalTitle,
  maxSizeMb = 2,
  allowedFileFormats = ['image/png'],
  ...props
}: SignatureUploaderProps) {
  const [signatureDialogOpen, setSignatureDialogOpen] = useState(false)
  const [signatureValue, setSignatureValue] = useState(EMPTY_STRING)
  const [signatureError, setSignatureError] = useState(EMPTY_STRING)
  const intl = useIntl()

  const requiredError =
    props.required &&
    !Boolean(signatureData) &&
    intl.formatMessage(validationMessages.required)

  const error = signatureError || requiredError

  function apply() {
    setSignatureDialogOpen(false)
    setSignatureError('')
    onChange(signatureValue)
  }

  return (
    <>
      {!signatureData && (
        <>
          <Stack gap={8}>
            <Button
              type="secondary"
              size="medium"
              onClick={() => setSignatureDialogOpen(true)}
              disabled={props.disabled}
            >
              <Icon name="Pen" />
              {intl.formatMessage(messages.signatureOpenSignatureInput)}
            </Button>
            <ImageUploader
              {...props}
              onChange={async (file) => {
                const fileSizeMB = file.size / (1024 * 1024) // convert bytes to megabytes
                if (fileSizeMB > maxSizeMb) {
                  setSignatureError(
                    intl.formatMessage(formMessages.fileSizeError)
                  )
                  return
                }
                if (
                  !allowedFileFormats.some((format) =>
                    file.type.includes(format)
                  )
                ) {
                  const formattedFileTypesOfSignatures = allowedFileFormats.map(
                    (val) => val.split('/')[1]
                  )
                  setSignatureError(
                    intl.formatMessage(formMessages.fileUploadError, {
                      type: formattedFileTypesOfSignatures.join(', ')
                    })
                  )
                  return
                }
                onChange((await getBase64String(file)).toString())
                setSignatureError('')
              }}
            >
              {intl.formatMessage(buttonMessages.upload)}
            </ImageUploader>
          </Stack>
        </>
      )}
      {signatureData && (
        <SignaturePreview alt={modalTitle} src={signatureData} />
      )}
      {signatureData && (
        <Button
          type="tertiary"
          size="medium"
          onClick={() => {
            onChange('')
            setSignatureValue('')
          }}
        >
          {intl.formatMessage(messages.signatureDelete)}
        </Button>
      )}
      {error && <InputError id={`${props.name}_error`}>{error}</InputError>}
      <ResponsiveModal
        id={`${props.id}_modal`}
        title={modalTitle}
        autoHeight={true}
        titleHeightAuto={true}
        width={600}
        show={signatureDialogOpen}
        actions={[
          <Button
            key="cancel"
            id="modal_cancel"
            type="tertiary"
            onClick={() => setSignatureDialogOpen(false)}
          >
            {intl.formatMessage(buttonMessages.cancel)}
          </Button>,
          <Button
            key="apply"
            id="apply_change"
            type="positive"
            disabled={!Boolean(signatureValue)}
            onClick={apply}
          >
            {intl.formatMessage(buttonMessages.apply)}
          </Button>
        ]}
        handleClose={() => setSignatureDialogOpen(false)}
      >
        <SignatureDescription variant="reg16" color="grey500" element="p">
          {intl.formatMessage(messages.signatureInputDescription)}
        </SignatureDescription>
        <SignCanvas value={signatureData} onChange={setSignatureValue} />
      </ResponsiveModal>
    </>
  )
}

function SignCanvas({
  value,
  onChange
}: {
  value?: string
  onChange: (value: string) => void
}) {
  const [canvasWidth, setCanvasWidth] = useState(300)
  const canvasContainerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<SignatureCanvas>(null)
  const intl = useIntl()

  useEffect(() => {
    function handleResize() {
      if (canvasContainerRef.current) {
        setCanvasWidth(canvasContainerRef.current.offsetWidth)
      }
    }

    window.addEventListener('resize', handleResize)

    handleResize()

    return () => window.removeEventListener('resize', handleResize)
  }, [canvasContainerRef])

  useEffect(() => {
    if (canvasRef.current && value) {
      canvasRef.current.fromDataURL(value)
    }
  }, [value])

  function emitValueToParent() {
    const data = canvasRef.current?.toDataURL()
    if (!data) {
      return
    }
    onChange(data)
  }

  function clear() {
    canvasRef.current?.clear()
    onChange('')
  }

  return (
    <SignatureInputContainer>
      <SignatureContainer ref={canvasContainerRef}>
        <SignatureCanvas
          ref={canvasRef}
          onEnd={() => {
            emitValueToParent()
          }}
          penColor="black"
          canvasProps={{
            width: canvasWidth,
            height: 200
          }}
        />
      </SignatureContainer>
      <Button type="tertiary" size="medium" onClick={clear}>
        {intl.formatMessage(messages.clear)}
      </Button>
    </SignatureInputContainer>
  )
}
