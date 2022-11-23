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
import { SysAdminContentWrapper } from '@client/views/SysAdmin/SysAdminContentWrapper'
import { FormTabs } from '@opencrvs/components/lib/FormTabs'
import styled from 'styled-components'
import { useIntl } from 'react-intl'
import { BodyContent, Content } from '@opencrvs/components/lib/Content'
import { messages } from '@client/i18n/messages/views/config'
import {
  ListViewItemSimplified,
  ListViewSimplified
} from '@opencrvs/components/lib/ListViewSimplified'
import { Query } from '@client/components/Query'
import { GET_TOTAL_VSEXPORT } from './queries'
import {
  Label,
  Value
} from '@client/views/SysAdmin/Config/Application/Components'
import { LoadingIndicator } from '@client/views/OfficeHome/LoadingIndicator'
import { DynamicHeightLinkButton } from '@client/views/Settings/items/components'
import { GenericErrorToast } from '@client/components/GenericErrorToast'
import { Event, GetVsExportsQuery, VsExport } from '@client/utils/gateway'

const UserTable = styled(BodyContent)`
  padding: 0px;
  margin: 8px auto 0;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.md}px) {
    padding: 0px;
  }
`
type VSExportProps = {
  items: VsExport[]
}

function downloadURI(uri: string, name: string) {
  const link = document.createElement('a')
  link.href = uri
  link.download = name
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

function TabContent(props: VSExportProps) {
  const intl = useIntl()
  const items: VsExport[] = props.items
  return (
    <>
      {items.map((item: VsExport) => {
        const fileName = intl.formatMessage(messages.vitalStatisticsExport, {
          year: item.year,
          event: item.event,
          fileSize: ''
        })
        const sizeValue = intl.formatMessage(messages.vitalStatisticsExport, {
          year: item.year,
          event: item.event,
          fileSize: item.fileSize
        })

        return (
          <ListViewSimplified key={`${item.createdOn}_${item.event}`}>
            <ListViewItemSimplified
              label={<Label id={`${item.year}_label`}>{item.year}</Label>}
              value={<Value id={`${item.createdOn}_value`}>{sizeValue}</Value>}
              actions={
                <DynamicHeightLinkButton
                  id={item.url}
                  disabled={false}
                  onClick={() =>
                    downloadURI(
                      `${window.config.MINIO_URL}${item.url}`,
                      fileName
                    )
                  }
                >
                  {messages.export.defaultMessage}
                </DynamicHeightLinkButton>
              }
            />
          </ListViewSimplified>
        )
      })}
    </>
  )
}

const VSExport = () => {
  const intl = useIntl()

  const [activeTabId, setActiveTabId] = React.useState(Event.Birth)
  const tabSections = [
    {
      id: Event.Birth,
      title: intl.formatMessage(messages.birthTabTitleExport)
    },
    {
      id: Event.Death,
      title: intl.formatMessage(messages.deathTabTitleExport)
    }
  ]

  // TODO: Replace with Frame component */

  return (
    <>
      <SysAdminContentWrapper
        id="vsexport-wrapper"
        hideBackground={true}
        isCertificatesConfigPage={true}
      >
        <UserTable id="vsexport_list">
          <Content
            title={intl.formatMessage(messages.vsexport)}
            titleColor={'copy'}
            subtitle={intl.formatMessage(messages.vsEmptyStateText)}
            tabBarContent={
              <FormTabs
                sections={tabSections}
                activeTabId={activeTabId}
                onTabClick={(id) => setActiveTabId(id)}
              />
            }
          >
            <Query<GetVsExportsQuery>
              query={GET_TOTAL_VSEXPORT}
              fetchPolicy={'no-cache'}
            >
              {({ data, loading, error }) => {
                if (error) {
                  return <GenericErrorToast />
                } else if (loading) {
                  return (
                    <>
                      <LoadingIndicator loading={true} />
                    </>
                  )
                } else {
                  const vsExports = data?.getVSExports?.results || []
                  return (
                    <TabContent
                      items={vsExports.filter(
                        ({ event }) => event === activeTabId
                      )}
                    />
                  )
                }
              }}
            </Query>
          </Content>
        </UserTable>
      </SysAdminContentWrapper>
    </>
  )
}

export default VSExport
