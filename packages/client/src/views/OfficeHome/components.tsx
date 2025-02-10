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
import { DeclarationIcon } from '@opencrvs/components/lib/icons/DeclarationIcon'
import { STATUSTOCOLOR } from '@client/views/RecordAudit/RecordAudit'
import { Duplicate } from '@opencrvs/components/lib/icons'
import { Link } from '@opencrvs/components/lib/Link'
import { Text } from '@opencrvs/components/lib/Text'

const Flex = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  @media (max-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    align-items: flex-start;
  }
`

export const NameContainer = styled(Link)``
export const NoNameContainer = styled(Link).attrs({
  color: 'negative'
})``

const Event = styled(Text)``

const NameEventContainer = styled.div`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const Icon = styled.div`
  flex-shrink: 0;
  display: flex;
  @media (min-width: ${({ theme }) => theme.grid.breakpoints.lg}px) {
    align-items: flex-end;
  }
  width: 24px;
`
interface IIconWith {
  status?: string
  name: React.ReactNode
  event?: string
  isDuplicate?: boolean
  isValidatedOnReview?: boolean
  isArchived?: boolean
}

const IconComp = ({
  status,
  isDuplicateIcon,
  isValidatedOnReview,
  isArchived
}: {
  status: string
  isDuplicateIcon?: boolean
  isValidatedOnReview?: boolean
  isArchived?: boolean
}) => {
  return (
    <Icon>
      {isDuplicateIcon ? (
        <Duplicate />
      ) : (
        <DeclarationIcon
          color={STATUSTOCOLOR[status]}
          isValidatedOnReview={isValidatedOnReview}
          isArchive={isArchived}
        />
      )}
    </Icon>
  )
}

export const IconWithName = ({
  status,
  name,
  isDuplicate,
  isValidatedOnReview,
  isArchived
}: IIconWith) => {
  return (
    <Flex id="flex">
      {status && (
        <IconComp
          status={status}
          isDuplicateIcon={isDuplicate}
          isValidatedOnReview={isValidatedOnReview}
          isArchived={isArchived}
        />
      )}
      {name}
    </Flex>
  )
}

export const IconWithNameEvent = ({
  status,
  name,
  event,
  isDuplicate,
  isValidatedOnReview,
  isArchived
}: IIconWith) => {
  return (
    <Flex id="flex">
      {status && (
        <IconComp
          status={status}
          isDuplicateIcon={isDuplicate}
          isValidatedOnReview={isValidatedOnReview}
          isArchived={isArchived}
        />
      )}
      <NameEventContainer id="nameEvent">
        {name}
        {event && (
          <Event variant="reg16" color="grey500" element="span">
            {event}
          </Event>
        )}
      </NameEventContainer>
    </Flex>
  )
}
