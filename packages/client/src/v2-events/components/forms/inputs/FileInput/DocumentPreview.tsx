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
import { useState, useEffect } from 'react'
import styled from 'styled-components'
import { FileFieldValue } from '@opencrvs/commons'
import { AppBar } from '@opencrvs/components/lib/AppBar'
import { Button } from '@opencrvs/components/lib/Button'
import { DividerVertical } from '@opencrvs/components/lib/Divider'
import PanControls from '@opencrvs/components/lib/DocumentViewer/components/PanControls'
import PanViewer from '@opencrvs/components/lib/DocumentViewer/components/PanViewer'
import { Icon } from '@opencrvs/components/lib/Icon'
import { Stack } from '@opencrvs/components/lib/Stack'
import { FileFieldValueWithOption } from '@opencrvs/commons/client'
import { getFullURL } from '@client/v2-events/features/files/useFileUpload'

const ViewerWrapper = styled.div`
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 4;
  width: 100%;
  height: 100%;
  background: ${({ theme }) => theme.colors.white};
`

const ViewerContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  align-items: center;
  & img {
    max-height: 80vh;
    max-width: 80vw;
    width: auto;
  }
`

interface IProps {
  previewImage:
    | NonNullable<FileFieldValue>
    | NonNullable<FileFieldValueWithOption>
  disableDelete?: boolean
  title?: string
  goBack: () => void
  onDelete: (image: FileFieldValue) => void
  id?: string
}

export function DocumentPreview({
  previewImage,
  title,
  goBack,
  onDelete,
  disableDelete,
  id
}: IProps) {
  const [imageSrc, setImageSrc] = useState(previewImage.filename)

  useEffect(() => {
    const cacheKey = getFullURL(previewImage.filename)
    void caches.match(cacheKey).then((cachedResponse) => {
      if (cachedResponse) {
        void cachedResponse.blob().then((blob) => {
          const blobUrl = URL.createObjectURL(blob)
          setImageSrc(blobUrl)
        })
      } else {
        console.log('Image not found in cache')
      }
    })
  }, [previewImage])

  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)

  function zoomIn() {
    setZoom((prevState) => prevState + 0.2)
  }
  function zoomOut() {
    setZoom((prevState) => (prevState >= 1 ? prevState - 0.2 : prevState))
  }
  function rotateLeft() {
    setRotation((prevState) => (prevState - 90) % 360)
  }

  return (
    <ViewerWrapper id={id ?? 'preview_image_field'}>
      <AppBar
        desktopLeft={<Icon name="Paperclip" size="large" />}
        desktopRight={
          <Stack gap={8}>
            <PanControls
              rotateLeft={rotateLeft}
              zoomIn={zoomIn}
              zoomOut={zoomOut}
            />
            {!disableDelete && (
              <>
                <DividerVertical />
                <Button
                  id="preview_delete"
                  type="icon"
                  onClick={() => onDelete(previewImage)}
                >
                  <Icon color="red" name="Trash" />
                </Button>
              </>
            )}
            <DividerVertical />
            <Button
              aria-label="Go close"
              id="preview_close"
              size="medium"
              type="icon"
              onClick={goBack}
            >
              <Icon name="X" size="medium" />
            </Button>
          </Stack>
        }
        desktopTitle={title}
        mobileLeft={<Icon name="Paperclip" size="large" />}
        mobileRight={
          <Stack gap={8}>
            <PanControls
              rotateLeft={rotateLeft}
              zoomIn={zoomIn}
              zoomOut={zoomOut}
            />
            {!disableDelete && (
              <Button
                id="preview_delete"
                type="icon"
                onClick={() => onDelete(previewImage)}
              >
                <Icon color="red" name="Trash" />
              </Button>
            )}
            <Button
              aria-label="Go back"
              id="preview_close"
              size="medium"
              type="icon"
              onClick={goBack}
            >
              <Icon name="X" size="medium" />
            </Button>
          </Stack>
        }
        mobileTitle={title}
      />

      <ViewerContainer>
        <PanViewer
          key={Math.random()}
          id="document_image"
          image={imageSrc}
          rotation={rotation}
          zoom={zoom}
        />
      </ViewerContainer>
    </ViewerWrapper>
  )
}
