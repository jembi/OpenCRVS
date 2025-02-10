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
import { FieldValue, FileFieldValue } from '@opencrvs/commons/client'
import { Button } from '@opencrvs/components/lib/Button/Button'
import { Icon } from '@opencrvs/components/lib/Icon/Icon'
import { Link } from '@opencrvs/components/lib/Link/Link'
import { ISelectOption } from '@opencrvs/components/lib/Select'

const Wrapper = styled.div`
  max-width: 100%;
  & > *:last-child {
    margin-bottom: 8px;
    border-bottom: 1.5px solid ${({ theme }) => theme.colors.grey100};
  }
`
const Container = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
  border-top: 1.5px solid ${({ theme }) => theme.colors.grey100};
  height: 48px;
  padding: 0px 10px;
`

const Label = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  svg {
    flex-shrink: 0;
  }
`

interface Props {
  id?: string
  attachment?: FileFieldValue
  label?: string
  onSelect: (document: FieldValue | FileFieldValue) => void
  dropdownOptions?: ISelectOption[]
  onDelete?: (image: FieldValue | FileFieldValue) => void
}

export function SingleDocumentPreview({
  id,
  attachment,
  label,
  onSelect,
  dropdownOptions,
  onDelete
}: Props) {
  function getFormattedLabelForDocType(docType: string) {
    const matchingOptionForDocType =
      dropdownOptions &&
      dropdownOptions.find((option) => option.value === docType)
    return matchingOptionForDocType && matchingOptionForDocType.label
  }
  return (
    <Wrapper id={`preview-list-${id}`}>
      {attachment && label && (
        <Container>
          <Label>
            <Icon color="grey600" name="Paperclip" size="medium" />
            <Link onClick={(_) => onSelect(attachment)}>
              <span>{getFormattedLabelForDocType(label) || label}</span>
            </Link>
          </Label>
          <Button
            aria-label="Delete attachment"
            id="preview_delete"
            size="small"
            type="icon"
            onClick={() => onDelete && onDelete(attachment)}
          >
            <Icon color="red" name="Trash" size="small" />
          </Button>
        </Container>
      )}
    </Wrapper>
  )
}
