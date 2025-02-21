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
import { z } from 'zod'
import { Conditional, ActionConditional } from './Conditional'
import { TranslationConfig } from './TranslationConfig'

import { FieldType } from './FieldType'
import {
  AddressFieldValue,
  CheckboxFieldValue,
  DateValue,
  NumberFieldValue,
  RequiredTextValue,
  TextValue
} from './FieldValue'

const FieldId = z.string()

const DependencyExpression = z.object({
  dependsOn: z.array(FieldId).default([]),
  expression: z.string()
})

const BaseField = z.object({
  id: FieldId,
  defaultValue: z
    .union([
      // These are the currently supported default values types
      z.union([
        TextValue,
        RequiredTextValue,
        DateValue,
        NumberFieldValue,
        CheckboxFieldValue
      ]),
      DependencyExpression
    ])
    .optional(),
  conditionals: z.array(ActionConditional).default([]).optional(),
  required: z.boolean().default(false).optional(),
  disabled: z.boolean().default(false).optional(),
  hidden: z.boolean().default(false).optional(),
  placeholder: TranslationConfig.optional(),
  validation: z
    .array(
      z.object({
        validator: Conditional(),
        message: TranslationConfig
      })
    )
    .default([])
    .optional(),
  dependsOn: z.array(FieldId).default([]).optional(),
  label: TranslationConfig,
  hideLabel: z.boolean().default(false).optional()
})

export type BaseField = z.infer<typeof BaseField>

const Divider = BaseField.extend({
  type: z.literal(FieldType.DIVIDER)
})
export type Divider = z.infer<typeof Divider>

const TextField = BaseField.extend({
  type: z.literal(FieldType.TEXT),
  defaultValue: z.union([RequiredTextValue, DependencyExpression]).optional(),
  configuration: z
    .object({
      maxLength: z.number().optional().describe('Maximum length of the text'),
      type: z.enum(['text', 'password']).optional(),
      prefix: TranslationConfig.optional(),
      postfix: TranslationConfig.optional()
    })
    .default({ type: 'text' })
    .optional()
}).describe('Text input')

export type TextField = z.infer<typeof TextField>

const NumberField = BaseField.extend({
  type: z.literal(FieldType.NUMBER),
  defaultValue: z.union([NumberFieldValue, DependencyExpression]).optional(),
  configuration: z
    .object({
      min: z.number().optional().describe('Minimum value'),
      max: z.number().optional().describe('Maximum value'),
      prefix: TranslationConfig.optional(),
      postfix: TranslationConfig.optional()
    })
    .optional()
}).describe('Number input')

const TextAreaField = BaseField.extend({
  type: z.literal(FieldType.TEXTAREA),
  defaultValue: z.union([RequiredTextValue, DependencyExpression]).optional(),
  configuration: z
    .object({
      maxLength: z.number().optional().describe('Maximum length of the text'),
      rows: z.number().optional().describe('Number of visible text lines'),
      cols: z.number().optional().describe('Number of visible columns'),
      prefix: TranslationConfig.optional(),
      postfix: TranslationConfig.optional()
    })
    .default({ rows: 4 })
    .optional()
}).describe('Multiline text input')

export type TextAreaField = z.infer<typeof TextAreaField>

const SignatureField = BaseField.extend({
  type: z.literal(FieldType.SIGNATURE),
  signaturePromptLabel: TranslationConfig.describe(
    'Title of the signature modal'
  ),
  configuration: z
    .object({
      maxSizeMb: z.number().optional().describe('Maximum file size in MB'),
      allowedFileFormats: z
        .array(z.string())
        .optional()
        .describe('List of allowed file formats for the signature')
    })
    .default({})
    .optional()
}).describe('Signature input field')

export type SignatureField = z.infer<typeof SignatureField>

export const EmailField = BaseField.extend({
  type: z.literal(FieldType.EMAIL),
  configuration: z
    .object({
      maxLength: z.number().optional().describe('Maximum length of the text')
    })
    .default({ maxLength: 10 })
    .optional(),
  defaultValue: z.union([RequiredTextValue, DependencyExpression]).optional()
})

export type EmailField = z.infer<typeof EmailField>

const DateField = BaseField.extend({
  type: z.literal(FieldType.DATE),
  defaultValue: z.union([DateValue, DependencyExpression]).optional(),
  configuration: z
    .object({
      notice: TranslationConfig.describe(
        'Text to display above the date input'
      ).optional()
    })
    .optional()
}).describe('A single date input (dd-mm-YYYY)')

export type DateField = z.infer<typeof DateField>

const HtmlFontVariant = z.enum([
  'reg12',
  'reg14',
  'reg16',
  'reg18',
  'h4',
  'h3',
  'h2',
  'h1'
])

const Paragraph = BaseField.extend({
  type: z.literal(FieldType.PARAGRAPH),
  defaultValue: z.union([RequiredTextValue, DependencyExpression]).optional(),
  configuration: z
    .object({
      styles: z
        .object({
          fontVariant: HtmlFontVariant.optional()
        })
        .optional()
    })
    .default({})
}).describe('A read-only HTML <p> paragraph')

export type Paragraph = z.infer<typeof Paragraph>

const PageHeader = BaseField.extend({
  type: z.literal(FieldType.PAGE_HEADER),
  defaultValue: z.union([RequiredTextValue, DependencyExpression]).optional()
}).describe('A read-only header component for form pages')

export type PageHeader = z.infer<typeof PageHeader>

const File = BaseField.extend({
  type: z.literal(FieldType.FILE),
  options: z
    .object({
      style: z.object({
        fullWidth: z
          .boolean()
          .describe(
            'Whether the file upload button should take the full width of the container or not'
          )
      })
    })
    .optional()
}).describe('File upload')

export type File = z.infer<typeof File>

const SelectOption = z.object({
  value: z.string().describe('The value of the option'),
  label: TranslationConfig.describe('The label of the option')
})

const RadioGroup = BaseField.extend({
  type: z.literal(FieldType.RADIO_GROUP),
  defaultValue: z.union([TextValue, DependencyExpression]).optional(),
  options: z.array(SelectOption).describe('A list of options'),
  configuration: z
    .object({
      styles: z
        .object({
          size: z.enum(['NORMAL', 'LARGE']).optional()
        })
        .optional()
    })
    .optional()
}).describe('Grouped radio options')

export type RadioGroup = z.infer<typeof RadioGroup>

const BulletList = BaseField.extend({
  type: z.literal(FieldType.BULLET_LIST),
  defaultValue: z.string().optional(),
  items: z.array(TranslationConfig).describe('A list of items'),
  configuration: z
    .object({
      styles: z
        .object({
          fontVariant: HtmlFontVariant.optional()
        })
        .optional()
    })
    .default({})
}).describe('A list of bullet points')

export type BulletList = z.infer<typeof BulletList>

const Select = BaseField.extend({
  type: z.literal(FieldType.SELECT),
  defaultValue: z.union([TextValue, DependencyExpression]).optional(),
  options: z.array(SelectOption).describe('A list of options')
}).describe('Select input')

const Checkbox = BaseField.extend({
  type: z.literal(FieldType.CHECKBOX),
  defaultValue: z.union([CheckboxFieldValue, DependencyExpression]).optional()
}).describe('Boolean checkbox field')

export type Checkbox = z.infer<typeof Checkbox>

const Country = BaseField.extend({
  type: z.literal(FieldType.COUNTRY),
  defaultValue: z.union([RequiredTextValue, DependencyExpression]).optional()
}).describe('Country select field')

export type Country = z.infer<typeof Country>

const AdministrativeAreaConfiguration = z
  .object({
    partOf: z
      .object({
        $data: z.string()
      })
      .optional()
      .describe('Parent location'),
    type: z.enum(['ADMIN_STRUCTURE', 'HEALTH_FACILITY', 'CRVS_OFFICE'])
  })
  .describe('Administrative area options')

const AdministrativeArea = BaseField.extend({
  type: z.literal(FieldType.ADMINISTRATIVE_AREA),
  defaultValue: z.union([RequiredTextValue, DependencyExpression]).optional(),
  configuration: AdministrativeAreaConfiguration
}).describe('Administrative area input field e.g. facility, office')

export type AdministrativeArea = z.infer<typeof AdministrativeArea>

const Location = BaseField.extend({
  type: z.literal(FieldType.LOCATION),
  defaultValue: z.union([RequiredTextValue, DependencyExpression]).optional()
}).describe('Input field for a location')

export type Location = z.infer<typeof Location>

const FileUploadWithOptions = BaseField.extend({
  type: z.literal(FieldType.FILE_WITH_OPTIONS),
  options: z.array(SelectOption).describe('A list of options')
}).describe('Select input')

export type FileUploadWithOptions = z.infer<typeof FileUploadWithOptions>

const Facility = BaseField.extend({
  type: z.literal(FieldType.FACILITY),
  defaultValue: z.union([RequiredTextValue, DependencyExpression]).optional()
}).describe('Input field for a facility')

export type Facility = z.infer<typeof Facility>

const Office = BaseField.extend({
  type: z.literal(FieldType.OFFICE),
  defaultValue: z.union([RequiredTextValue, DependencyExpression]).optional()
}).describe('Input field for an office')

export type Office = z.infer<typeof Office>

const Address = BaseField.extend({
  type: z.literal(FieldType.ADDRESS),
  defaultValue: AddressFieldValue.optional()
}).describe('Address input field – a combination of location and text fields')

/*
 * This needs to be exported so that Typescript can refer to the type in
 * the declaration output type. If it can't do that, you might start encountering
 * "The inferred type of this node exceeds the maximum length the compiler will serialize. An explicit type annotation is needed"
 * errors when compiling
 */
/** @knipignore */
export type AllFields =
  | typeof Address
  | typeof TextField
  | typeof NumberField
  | typeof TextAreaField
  | typeof DateField
  | typeof Paragraph
  | typeof RadioGroup
  | typeof BulletList
  | typeof PageHeader
  | typeof Select
  | typeof Checkbox
  | typeof File
  | typeof Country
  | typeof AdministrativeArea
  | typeof Divider
  | typeof Location
  | typeof Facility
  | typeof Office
  | typeof SignatureField
  | typeof EmailField
  | typeof FileUploadWithOptions

/** @knipignore */
export type Inferred =
  | z.infer<typeof Address>
  | z.infer<typeof TextField>
  | z.infer<typeof NumberField>
  | z.infer<typeof TextAreaField>
  | z.infer<typeof DateField>
  | z.infer<typeof Paragraph>
  | z.infer<typeof RadioGroup>
  | z.infer<typeof BulletList>
  | z.infer<typeof PageHeader>
  | z.infer<typeof Select>
  | z.infer<typeof Checkbox>
  | z.infer<typeof File>
  | z.infer<typeof FileUploadWithOptions>
  | z.infer<typeof Country>
  | z.infer<typeof AdministrativeArea>
  | z.infer<typeof Divider>
  | z.infer<typeof Location>
  | z.infer<typeof Facility>
  | z.infer<typeof Office>
  | z.infer<typeof SignatureField>
  | z.infer<typeof EmailField>

export const FieldConfig = z.discriminatedUnion('type', [
  Address,
  TextField,
  NumberField,
  TextAreaField,
  DateField,
  Paragraph,
  RadioGroup,
  BulletList,
  PageHeader,
  Select,
  Checkbox,
  File,
  Country,
  AdministrativeArea,
  Divider,
  Location,
  Facility,
  Office,
  SignatureField,
  EmailField,
  FileUploadWithOptions
]) as unknown as z.ZodType<Inferred, any, Inferred>

export type SelectField = z.infer<typeof Select>
export type LocationField = z.infer<typeof Location>
export type RadioField = z.infer<typeof RadioGroup>
export type AddressField = z.infer<typeof Address>
export type NumberField = z.infer<typeof NumberField>
export type FieldConfig = Inferred

export type FieldProps<T extends FieldType> = Extract<FieldConfig, { type: T }>
export type SelectOption = z.infer<typeof SelectOption>

export type AdministrativeAreaConfiguration = z.infer<
  typeof AdministrativeAreaConfiguration
>
