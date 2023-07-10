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
import { FormFieldGenerator } from '@client/components/form/FormFieldGenerator'
import { BirthSection, DeathSection, SELECT_WITH_OPTIONS } from '@client/forms'
import { Event } from '@client/utils/gateway'
import { FieldEnabled } from '@client/forms/configuration'
import {
  removeCustomField,
  shiftConfigFieldDown,
  shiftConfigFieldUp
} from '@client/forms/configuration/formConfig/actions'
import { selectConfigFields } from '@client/forms/configuration/formConfig/selectors'
import {
  IConfigField,
  isDefaultConfigField,
  isPreviewGroupConfigField,
  isCustomConfigField,
  IDefaultConfigField,
  ICustomConfigField
} from '@client/forms/configuration/formConfig/utils'
import { messages } from '@client/i18n/messages/views/formConfig'
import { IStoreState } from '@client/store'
import styled from 'styled-components'
import { useFieldDefinition } from '@client/views/SysAdmin/Config/Forms/hooks'
import { FormConfigElementCard } from '@opencrvs/components/lib/FormConfigElementCard'
import React from 'react'
import { useIntl } from 'react-intl'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router'
import ConfigPlaceholder from './ConfigPlaceholder'
import { Text } from '@opencrvs/components/lib/Text'
import { Stack } from '@opencrvs/components/lib/Stack'
import { Icon } from '@opencrvs/components/lib/Icon'

const CanvasBox = styled.div`
  display: flex;
  padding: 16px;
  background: ${({ theme }) => theme.colors.white};
  flex-direction: column;
  gap: 8px;
  border: 1px solid ${({ theme }) => theme.colors.grey300};
  border-radius: 4px;
`

const CardContentWrapper = styled(Stack)`
  flex-direction: column;
  align-items: normal;
`

type IRouteProps = {
  event: Event
  section: BirthSection | DeathSection
}

type ICanvasProps = {
  showHiddenFields: boolean
  selectedField: IConfigField | null
  setSelectedField: React.Dispatch<React.SetStateAction<string | null>>
  ref: React.RefObject<HTMLDivElement>
}

function useConfigFields() {
  const { event, section } = useParams<IRouteProps>()
  return useSelector((store: IStoreState) =>
    selectConfigFields(store, event, section)
  )
}

function FormField({
  configField
}: {
  configField: IDefaultConfigField | ICustomConfigField
}) {
  const formField = useFieldDefinition(configField)
  const { fieldId } = configField
  return (
    <FormFieldGenerator
      id={fieldId}
      onChange={() => {}}
      fields={[{ ...formField, ignoreMediaQuery: true }]}
      setAllFieldsDirty={false}
    />
  )
}

export const Canvas = React.forwardRef<HTMLDivElement, ICanvasProps>(
  function Canvas({ showHiddenFields, selectedField, setSelectedField }, ref) {
    const dispatch = useDispatch()
    const intl = useIntl()
    const fields = useConfigFields()

    return (
      <CanvasBox ref={ref}>
        {(showHiddenFields
          ? fields
          : fields.filter((configField) =>
              isDefaultConfigField(configField)
                ? configField.enabled !== FieldEnabled.DISABLED
                : true
            )
        ).map((configField, index, configFields) => {
          const { fieldId } = configField
          const isCustom = isCustomConfigField(configField)
          const isSelected = selectedField?.fieldId === fieldId
          const isHidden =
            isDefaultConfigField(configField) &&
            configField.enabled === FieldEnabled.DISABLED

          const conditionalField = isCustomConfigField(configField)
            ? configField.conditionals
            : undefined
          const enableInteraction =
            isCustomConfigField(configField) &&
            configField.fieldType === SELECT_WITH_OPTIONS
          return (
            <FormConfigElementCard
              id={fieldId}
              key={fieldId}
              selected={isSelected}
              enableInteraction={enableInteraction}
              onClick={() => {
                setSelectedField(fieldId)
              }}
              status={
                isHidden ? intl.formatMessage(messages.hidden) : undefined
              }
              removable={isCustom}
              isUpDisabled={!index}
              isDownDisabled={index === configFields.length - 1}
              onMoveUp={() => dispatch(shiftConfigFieldUp(fieldId))}
              onMoveDown={() => dispatch(shiftConfigFieldDown(fieldId))}
              onRemove={() => {
                selectedField &&
                  dispatch(removeCustomField(selectedField.fieldId))
              }}
            >
              {isPreviewGroupConfigField(configField) ? (
                <ConfigPlaceholder label={configField.previewGroupLabel} />
              ) : (
                <CardContentWrapper>
                  {conditionalField && conditionalField.length > 0 && (
                    <Stack>
                      <Icon name="GitBranch" size="small" color="grey400" />
                      <Text variant="reg14" element="span" color="grey400">
                        {conditionalField[0].fieldId}
                      </Text>
                    </Stack>
                  )}
                  <FormField configField={configField} />
                </CardContentWrapper>
              )}
            </FormConfigElementCard>
          )
        })}
      </CanvasBox>
    )
  }
)
