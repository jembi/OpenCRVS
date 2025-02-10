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
import React, { useState, useRef, useEffect } from 'react'
import styled from 'styled-components'
import {
  IColumn,
  IDynamicValues,
  IFooterFColumn,
  ColumnContentAlignment
} from '../Workqueue'
import { Pagination } from '../Pagination'
import { Text } from '@opencrvs/components/src/Text'

const Wrapper = styled.div<{
  fixedWidth: number | undefined
}>`
  ${({ fixedWidth }) =>
    fixedWidth ? `width: ${fixedWidth}px;` : `width: 100%`}

  @media (max-width: ${({ fixedWidth }) => fixedWidth}px) {
    width: 100%;
  }
  background: ${({ theme }) => theme.colors.white};
`
const TableHeader = styled.div<{
  totalWidth?: number
  fixedWidth?: number
}>`
  ${({ fixedWidth, totalWidth }) =>
    fixedWidth ? `width: ${fixedWidth}px;` : `width: ${totalWidth || 100}%;`}
  background: ${({ theme }) => theme.colors.grey100};
  padding: 10px 0px;
  display: flex;
  align-items: top;
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey300};
  border-radius: 2px 2px 0 0;

  & span:first-child {
    padding-left: 8px;
  }

  & span:last-child {
    padding-right: 8px;
  }
`

const TableHeaderText = styled.div`
  ${({ theme }) => theme.fonts.bold14};
  color: ${({ theme }) => theme.colors.grey600};
`

const TableBody = styled.div<{
  footerColumns: boolean
  columns: IColumn[]
}>`
  color: ${({ theme }) => theme.colors.copy};
  ${({ theme, columns }) =>
    columns.length > 3 && columns.length <= 5
      ? theme.fonts.reg14
      : theme.fonts.reg16};

  & div:last-of-type {
    ${({ footerColumns }) => (footerColumns ? 'border-bottom: none;' : '')};
  }
  & span:first-child {
    padding-left: 8px;
  }

  & span:last-child {
    padding-right: 8px;
  }
`
const RowWrapper = styled.div<{
  totalWidth: number
  highlight?: boolean
  height?: IBreakpoint
  horizontalPadding?: IBreakpoint
  hideTableBottomBorder?: boolean
  columns: IColumn[]
}>`
  display: flex;
  width: 100%;
  min-height: 48px;
  padding-top: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey200};

  &:last-child {
    ${({ hideTableBottomBorder }) =>
      hideTableBottomBorder && `border-bottom: 0`};
  }

  ${({ height }) => height && `min-height: ${height.lg}px;`};

  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    ${({ height }) => height && `min-height: ${height.md}px;`};
  }
`
const TableFooter = styled(RowWrapper)<{
  totalWidth?: number
  fixedWidth?: number
}>`
  ${({ fixedWidth, totalWidth }) =>
    fixedWidth ? `width: ${fixedWidth}px;` : `width: ${totalWidth || 100}%;`}
  display: flex;
  align-items: top;
  background: ${({ theme }) => theme.colors.grey100};
  border-top: 2px solid ${({ theme }) => theme.colors.grey300};
  border-bottom: none;
  & span {
    color: ${({ theme }) => theme.colors.copy};
    ${({ theme }) => theme.fonts.bold14};
  }
  & span:first-child {
    padding-left: 8px;
  }
  & span:last-child {
    padding-right: 8px;
  }
`

const ContentWrapper = styled.span<{
  width: number
  alignment?: string
  sortable?: boolean
  totalWidth?: number
}>`
  width: ${({ width, totalWidth }) =>
    totalWidth && totalWidth > 100 ? (width * 100) / totalWidth : width}%;
  flex-shrink: 0;
  text-align: ${({ alignment }) => (alignment ? alignment.toString() : 'left')};
  cursor: ${({ sortable }) => (sortable ? 'pointer' : 'default')};
  color: ${({ theme }) => theme.colors.tertiary};
  padding: 0 4px;
`
const ValueWrapper = styled.span<{
  width: number
  totalWidth: number
  alignment?: string
  color?: string
  // TODO: The children can be passed a `IDynamicValues` value, which is a very flexible / any-like type.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  children?: any
}>`
  width: ${({ width, totalWidth }) =>
    totalWidth > 100 ? (width * 100) / totalWidth : width}%;

  justify-content: ${({ alignment }) =>
    alignment === ColumnContentAlignment.RIGHT ? 'flex-end' : 'flex-start'};
  text-align: ${({ alignment }) => (alignment ? alignment.toString() : 'left')};
  padding: 0 4px;
  align-self: center;
  white-space: pre-wrap;
  ${({ color }) => color && `color: ${color};`}
`
const Error = styled.span`
  color: ${({ theme }) => theme.colors.negative};
`
const ErrorText = styled(Text)<{ isFullPage?: boolean }>`
  text-align: left;
  margin-left: ${({ isFullPage }) => (isFullPage ? `40px` : `10px`)};
`

export const LoadingTableGrey = styled.span<{
  width?: number
}>`
  background: ${({ theme }) => theme.colors.background};
  display: inline-block;
  height: 24px;
  width: ${({ width }) => (width ? `${width}%` : '100%')};
`
const TableScrollerHorizontal = styled.div<{
  disableScrollOnOverflow?: boolean
}>`
  ${({ disableScrollOnOverflow }) =>
    !disableScrollOnOverflow && `overflow: auto`};
  padding-bottom: 8px;
  &::-webkit-scrollbar {
    border-radius: 8px;
    width: 8px;
    height: 8px;
    background: ${({ theme }) => theme.colors.grey200};
  }

  &::-webkit-scrollbar-thumb {
    border-radius: 8px;
    background: ${({ theme }) => theme.colors.grey400};
  }
`
const TableScroller = styled.div<{
  height?: number
  totalWidth: number
  isFullPage?: boolean
  offsetTop: number
  fixedWidth: number | undefined
}>`
  display: block;
  max-height: ${({ height, isFullPage, offsetTop }) =>
    isFullPage
      ? `calc(100vh - ${offsetTop}px - 180px)`
      : height
      ? `${height}px`
      : 'auto'};

  ${({ fixedWidth, totalWidth }) =>
    fixedWidth
      ? `width: ${fixedWidth}px;`
      : `width: ${(totalWidth >= 100 && totalWidth) || 100}%;`}
`

const TableHeaderWrapper = styled.div`
  padding-right: 0;
`
const ToggleSortIcon = styled.div<{
  toggle?: boolean
}>`
  margin-left: 6px;
  display: inline;
  svg {
    transform: ${({ toggle }) => (toggle ? 'rotate(180deg)' : 'none')};
  }
`
const LoadingContainer = styled.div<{
  totalWidth: number
  fixedWidth: number | undefined
}>`
  ${({ fixedWidth, totalWidth }) =>
    fixedWidth
      ? `width: ${fixedWidth}px;`
      : `width: ${(totalWidth >= 100 && totalWidth) || 100}%;`}
  overflow: hidden;
`
const defaultConfiguration = {
  pageSize: 10,
  currentPage: 1
}

export interface ITableProps {
  id?: string
  content: IDynamicValues[]
  columns: IColumn[]
  footerColumns?: IFooterFColumn[]
  noResultText?: string
  tableHeight?: number
  rowStyle?: {
    height: IBreakpoint
    horizontalPadding: IBreakpoint
  }
  onPageChange?: (currentPage: number) => void
  disableScrollOnOverflow?: boolean
  pageSize?: number
  totalItems?: number
  currentPage?: number
  isLoading?: boolean
  hideTableHeader?: boolean
  hideTableBottomBorder?: boolean
  highlightRowOnMouseOver?: boolean
  isFullPage?: boolean
  fixedWidth?: number
  noPagination?: boolean
}

interface IBreakpoint {
  lg: number
  md: number
}

export const Table = ({
  id,
  content,
  columns,
  footerColumns,
  noResultText,
  tableHeight,
  rowStyle,
  onPageChange,
  disableScrollOnOverflow,
  pageSize: propsPageSize,
  totalItems: propsTotalItems = 0,
  currentPage: propsCurrentPage,
  isLoading = false,
  hideTableHeader,
  hideTableBottomBorder,
  highlightRowOnMouseOver,
  isFullPage,
  fixedWidth,
  noPagination
}: ITableProps) => {
  const [sortIconInverted, setSortIconInverted] = useState(false)
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [tableOffsetTop, setTableOffsetTop] = useState(0)
  const tableRef = useRef<HTMLDivElement>(null)

  const onPageChangeHandler = (currentPage: number) => {
    if (onPageChange) {
      onPageChange(currentPage)
    }
  }

  const getDisplayItems = (
    currentPage: number,
    pageSize: number,
    allItems: IDynamicValues[]
  ) => {
    if (allItems.length <= pageSize) {
      // expect that allItem is already sliced correctly externally
      return allItems
    }

    // perform internal pagination
    const offset = (currentPage - 1) * pageSize
    const displayItems = allItems.slice(offset, offset + pageSize)
    return displayItems
  }

  const invertSortIcon = (sortKeyParam: string) => {
    const shouldInvert = sortKey === sortKeyParam || sortKey === null
    if (shouldInvert) {
      setSortIconInverted(!sortIconInverted)
    } else {
      setSortIconInverted(true)
    }
    setSortKey(sortKeyParam)
    return true
  }

  useEffect(() => {
    if (!isLoading) {
      setTableOffsetTop(tableRef.current?.getBoundingClientRect().top || 0)
    }
  }, [isLoading])

  const pageSize = noPagination
    ? content.length
    : propsPageSize || defaultConfiguration.pageSize
  const currentPage = propsCurrentPage || defaultConfiguration.currentPage
  const totalWidth = columns.reduce((total, col) => (total += col.width), 0)

  return (
    <>
      {!isLoading && (
        <Wrapper id={`listTable-${id}`} fixedWidth={fixedWidth} ref={tableRef}>
          <TableScrollerHorizontal
            disableScrollOnOverflow={disableScrollOnOverflow}
          >
            {!hideTableHeader && content.length > 0 && (
              <TableHeaderWrapper>
                <TableHeader totalWidth={totalWidth} fixedWidth={fixedWidth}>
                  {columns.map((preference, index) => (
                    <ContentWrapper
                      key={index}
                      id={`${preference.key}-label`}
                      width={preference.width}
                      totalWidth={totalWidth}
                      alignment={preference.alignment}
                      sortable={preference.isSortable}
                      onClick={() =>
                        preference.isSortable &&
                        preference.sortFunction &&
                        invertSortIcon(preference.key) &&
                        preference.sortFunction(preference.key)
                      }
                    >
                      <TableHeaderText>
                        {preference.label}
                        <ToggleSortIcon
                          toggle={
                            sortIconInverted && sortKey === preference.key
                          }
                        >
                          {preference.icon}
                        </ToggleSortIcon>
                      </TableHeaderText>
                    </ContentWrapper>
                  ))}
                </TableHeader>
              </TableHeaderWrapper>
            )}
            <TableScroller
              height={tableHeight}
              isFullPage={isFullPage}
              totalWidth={totalWidth}
              fixedWidth={fixedWidth}
              offsetTop={tableOffsetTop}
            >
              <TableBody
                footerColumns={
                  (footerColumns && footerColumns.length > 0) || false
                }
                columns={columns}
              >
                {getDisplayItems(currentPage, pageSize, content).map(
                  (item, index) => {
                    return (
                      <RowWrapper
                        id={'row_' + index}
                        key={index}
                        totalWidth={totalWidth}
                        highlight={highlightRowOnMouseOver}
                        height={rowStyle?.height}
                        horizontalPadding={rowStyle?.horizontalPadding}
                        hideTableBottomBorder={hideTableBottomBorder}
                        columns={columns}
                      >
                        {columns.map((preference, indx) => {
                          return (
                            <ValueWrapper
                              key={indx}
                              width={preference.width}
                              alignment={preference.alignment}
                              color={preference.color}
                              totalWidth={totalWidth}
                            >
                              {item[preference.key] || (
                                <Error>{preference.errorValue}</Error>
                              )}
                            </ValueWrapper>
                          )
                        })}
                      </RowWrapper>
                    )
                  }
                )}
              </TableBody>
            </TableScroller>
            {footerColumns && content.length > 1 && (
              <TableFooter
                id={'Table-' + id + '-footer'}
                totalWidth={totalWidth}
                fixedWidth={fixedWidth}
                columns={columns}
              >
                {footerColumns.map((preference, index) => (
                  <ContentWrapper key={index} width={preference.width}>
                    {preference.label || ''}
                  </ContentWrapper>
                ))}
              </TableFooter>
            )}
          </TableScrollerHorizontal>
          {content.length <= 0 && noResultText && (
            <ErrorText
              id="no-record"
              isFullPage={isFullPage}
              variant="h3"
              color="copy"
              element="h3"
            >
              {noResultText}
            </ErrorText>
          )}
        </Wrapper>
      )}
      {isLoading && (
        <LoadingContainer totalWidth={totalWidth} fixedWidth={fixedWidth}>
          <TableHeader totalWidth={totalWidth} fixedWidth={fixedWidth}>
            {columns.map((preference, index) => (
              <ContentWrapper
                key={index}
                width={preference.width}
                alignment={preference.alignment}
                sortable={preference.isSortable}
              >
                <LoadingTableGrey />
              </ContentWrapper>
            ))}
          </TableHeader>
          <TableHeader totalWidth={totalWidth} fixedWidth={fixedWidth}>
            {columns.map((preference, index) => (
              <ContentWrapper
                key={index}
                width={preference.width}
                alignment={preference.alignment}
                sortable={preference.isSortable}
              >
                <LoadingTableGrey width={30} />
              </ContentWrapper>
            ))}
          </TableHeader>
        </LoadingContainer>
      )}
      {propsTotalItems > pageSize && !noPagination && (
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(propsTotalItems / pageSize)}
          onPageChange={onPageChangeHandler}
        />
      )}
    </>
  )
}
