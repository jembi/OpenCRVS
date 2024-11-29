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
  Frame,
  AppBar,
  Stack,
  Button,
  Icon,
  Content,
  FormWizard
} from '@opencrvs/components'
import React from 'react'
import { useEvent } from './useEvent'
import { useParams } from 'react-router-dom'
import { TextField, Paragraph, DateField } from './registered-fields'

export function PublishEvent() {
  const { eventType } = useParams<{ eventType: string }>()
  const { title, event, exit, saveAndExit, previous, next, page } =
    useEvent(eventType)

  return (
    <Frame
      skipToContentText="Skip to form"
      header={
        <AppBar
          mobileLeft={title}
          desktopLeft={title}
          desktopRight={
            <Stack direction="row">
              <Button type="primary" onClick={saveAndExit}>
                <Icon name="DownloadSimple" />
                Save and exit
              </Button>
              <Button type="secondary" onClick={exit}>
                <Icon name="X" />
                Exit
              </Button>
            </Stack>
          }
        />
      }
    >
      <Frame.LayoutForm>
        <Frame.SectionFormBackAction>
          {previous && (
            <Button type="tertiary" size="small" onClick={previous}>
              <Icon name="ArrowLeft" size="medium" />
              Back
            </Button>
          )}
        </Frame.SectionFormBackAction>

        <Frame.Section>
          <Content title={title}>
            <FormWizard
              currentPage={page}
              pages={event.actions[0].forms[0].pages}
              components={{
                TEXT: TextField,
                PARAGRAPH: Paragraph,
                DATE: DateField
              }}
              onNextPage={next}
              onSubmit={(values) => console.log(values)}
            />
          </Content>
        </Frame.Section>
      </Frame.LayoutForm>
    </Frame>
  )
}
