import { IFormField, IFormData } from '@register/forms'
import {
  cloneDeep,
  keys,
  omit,
  merge,
  mergeWith,
  isArray,
  first,
  findIndex
} from 'lodash'

export enum OBJECT_TYPE {
  NAME = 'name',
  ADDRESS = 'address'
}

const nameObjectProcessor = (
  objValue: Array<{ [key: string]: string }>,
  srcValue: Array<{ [key: string]: string }>
) => {
  if (isArray(objValue)) {
    const nameObj = first(srcValue)
    const language = nameObj && nameObj.use ? nameObj.use : ''
    const objIndex = findIndex(objValue, { use: language })
    if (objIndex < 0) {
      return objValue.concat(srcValue)
    }
    merge(objValue[objIndex], nameObj)
  }
  return objValue
}

const addressObjectProcessor = (
  objValues: Array<{ [key: string]: string | string[] }>,
  srcValues: Array<{ [key: string]: string | string[] }>
) => {
  srcValues.forEach(srcValue => {
    let index = findIndex(objValues, { type: srcValue.type })
    if (index < 0) {
      objValues.push({
        type: srcValue.type,
        line: ['', '', '', '', '', '']
      })
      index = findIndex(objValues, { type: srcValue.type })
    }
    for (const key of Object.keys(srcValue)) {
      if (isArray(srcValue[key])) {
        ;(srcValue[key] as string[]).forEach((item, arrayIndex) => {
          if (item) {
            // @ts-ignore
            objValues[index][key][arrayIndex] = item
          }
        })
      } else {
        objValues[index][key] = srcValue[key]
      }
    }
  })
  return objValues
}

export const fieldValueNestingTransformer = (
  transformedFieldName: string,
  transformerMethod?: any,
  objectType?: string
) => (
  transformedData: any,
  draftData: IFormData,
  sectionId: string,
  field: IFormField
) => {
  if (transformerMethod) {
    transformedData[sectionId][transformedFieldName] =
      transformedData[sectionId][transformedFieldName] || {}
    const newTransformedData = cloneDeep(transformedData)
    const oldTransformedDataKeys = keys(transformedData[sectionId])
    transformerMethod(newTransformedData, draftData, sectionId, field)
    if (objectType === OBJECT_TYPE.NAME) {
      mergeWith(
        transformedData[sectionId][transformedFieldName],
        omit(newTransformedData[sectionId], oldTransformedDataKeys),
        nameObjectProcessor
      )
    } else if (objectType === OBJECT_TYPE.ADDRESS) {
      mergeWith(
        transformedData[sectionId][transformedFieldName],
        omit(newTransformedData[sectionId], oldTransformedDataKeys),
        addressObjectProcessor
      )
    } else {
      merge(
        transformedData[sectionId][transformedFieldName],
        omit(newTransformedData[sectionId], oldTransformedDataKeys)
      )
    }
  } else {
    transformedData[sectionId][transformedFieldName] =
      transformedData[sectionId][transformedFieldName] || {}
    transformedData[sectionId][transformedFieldName][field.name] =
      draftData[sectionId][field.name]
  }
  return transformedData
}

export function setInformantSectionTransformer(
  transformedData: any,
  draftData: IFormData,
  sectionId: string
) {
  if (
    draftData[sectionId]._fhirIDMap &&
    transformedData[sectionId].individual
  ) {
    transformedData[sectionId].individual._fhirID =
      // @ts-ignore
      draftData[sectionId]._fhirIDMap.individual
  }
  return transformedData
}
