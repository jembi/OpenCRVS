import {
  EventConfig,
  FieldConfig,
  FieldValue,
  findPageFields,
  isFileFieldType,
  isFileFieldWithOptionType
} from '@opencrvs/commons/client'
import { precacheFile } from './useFileUpload'

export async function cacheFiles(
  data: Record<string, FieldValue>,
  eventConfig: EventConfig
) {
  const fieldTypeMapping = findPageFields(eventConfig).reduce((acc, field) => {
    acc[field.id] = field
    return acc
  }, {} as Record<string, FieldConfig>)

  const promises: Promise<void>[] = []

  Object.entries(data).forEach(([key, value]) => {
    const field = { config: fieldTypeMapping[key], value }

    if (isFileFieldType(field)) {
      promises.push(precacheFile(field.value.filename))
    }
    if (isFileFieldWithOptionType(field)) {
      field.value.forEach((val) => promises.push(precacheFile(val.filename)))
    }
  })

  await Promise.all(promises)
}
