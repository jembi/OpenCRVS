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
import styled from 'styled-components'
import { Content, ContentSize } from '@opencrvs/components/lib/Content'
import { NoResultText } from '@opencrvs/components/lib/Workqueue'
import { Pagination } from '@opencrvs/components/lib/Pagination'
import {
  LoadingIndicator,
  withOnlineStatus,
  IOnlineStatusProps
} from '@client/v2-events/components/LoadingIndicator'

/**
 * Based on packages/client/src/views/OfficeHome/WQContentWrapper.tsx
 */

interface BodyProps {
  isShowPagination?: boolean
  paginationId?: number
  totalPages?: number
  onPageChange?: (newPageNumber: number) => void
  noResultText?: string
  noContent?: boolean
  loading?: boolean
  error?: boolean
  children: React.ReactNode | React.ReactNode[]
}

interface IContentWrapper extends BodyProps {
  isMobileSize: boolean
  title: string
  tabBarContent?: React.ReactNode

  topActionButtons?: React.ReactElement[]
  showTitleOnMobile?: boolean
}

type IProps = IContentWrapper & IOnlineStatusProps

const TabBarContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.white};
  padding-left: 20px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey300};
`

const MobileChildrenContainer = styled.div`
  margin: 20px 16px 0;
`

const PaginationLoaderContainer = styled.div<{ isShowPagination?: boolean }>`
  height: auto;
`

function Body({
  isShowPagination,
  paginationId,
  totalPages,
  onPageChange,
  loading,
  error,
  isOnline,
  noContent,
  noResultText,
  children
}: IProps) {
  return (
    <>
      {children}
      <PaginationLoaderContainer isShowPagination={isShowPagination}>
        {noContent && !loading && (
          <NoResultText id="no-record" variant="h4" element="p">
            {noResultText}
          </NoResultText>
        )}
        {isShowPagination &&
          !!paginationId &&
          !!totalPages &&
          onPageChange &&
          isOnline && (
            <Pagination
              currentPage={paginationId}
              totalPages={totalPages}
              onPageChange={onPageChange}
            />
          )}
        <LoadingIndicator
          hasError={!!error}
          loading={!!loading}
          noDeclaration={noContent}
        />
      </PaginationLoaderContainer>
    </>
  )
}

function WQContentWrapperComp({
  isMobileSize,
  tabBarContent,
  title,
  topActionButtons,
  showTitleOnMobile,
  error,
  loading,
  noContent,
  isShowPagination,
  isOnline,
  onPageChange,
  paginationId,
  totalPages,
  noResultText,
  children
}: IProps) {
  return (
    <>
      {isMobileSize ? (
        <>
          {tabBarContent && <TabBarContainer>{tabBarContent}</TabBarContainer>}
          <MobileChildrenContainer>
            <Body
              error={error}
              isMobileSize={isMobileSize}
              isOnline={isOnline}
              isShowPagination={isShowPagination}
              loading={loading}
              noContent={noContent}
              noResultText={noResultText}
              paginationId={paginationId}
              title={title}
              totalPages={totalPages}
              onPageChange={onPageChange}
            >
              {children}
            </Body>
          </MobileChildrenContainer>
        </>
      ) : (
        <Content
          showTitleOnMobile={showTitleOnMobile}
          size={ContentSize.LARGE}
          tabBarContent={tabBarContent}
          title={title}
          topActionButtons={topActionButtons}
        >
          <Body
            error={error}
            isMobileSize={isMobileSize}
            isOnline={isOnline}
            isShowPagination={isShowPagination}
            loading={loading}
            noContent={noContent}
            noResultText={noResultText}
            paginationId={paginationId}
            title={title}
            totalPages={totalPages}
            onPageChange={onPageChange}
          >
            {children}
          </Body>
        </Content>
      )}
    </>
  )
}

export const WQContentWrapper = withOnlineStatus(WQContentWrapperComp)
