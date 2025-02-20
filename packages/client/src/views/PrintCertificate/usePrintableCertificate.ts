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
import { WORKQUEUE_TABS } from '@client/components/interface/WorkQueueTabs'
import {
  IPrintableDeclaration,
  modifyDeclaration,
  SUBMISSION_STATUS,
  writeDeclaration
} from '@client/declarations'
import { useDeclaration } from '@client/declarations/selectors'
import {
  CorrectionSection,
  IFormSectionData,
  SubmissionAction
} from '@client/forms'
import {
  generateCertificateCorrectionUrl,
  generateGoToHomeTabUrl
} from '@client/navigation'
import { AdminStructure, IOfflineData } from '@client/offline/reducer'
import { getOfflineData } from '@client/offline/selectors'
import { printPDF } from '@client/pdfRenderer'
import { getUserDetails } from '@client/profile/profileSelectors'
import { IStoreState } from '@client/store'
import { formatLongDate } from '@client/utils/date-formatting'
import { SCOPES, isMinioUrl } from '@opencrvs/commons/client'
import { EventType } from '@client/utils/gateway'
import { getLocationHierarchy } from '@client/utils/locationUtils'
import { getUserName, UserDetails } from '@client/utils/userUtils'
import { cloneDeep } from 'lodash'
import { useDispatch, useSelector } from 'react-redux'
import { addFontsToSvg, compileSvg, svgToPdfTemplate } from './PDFUtils'
import {
  calculatePrice,
  getEventDate,
  getRegisteredDate,
  isCertificateForPrintInAdvance
} from './utils'
import { usePermissions } from '@client/hooks/useAuthorization'
import { useNavigate } from 'react-router-dom'
import { ICertificateData } from '@client/utils/referenceApi'
import { fetchImageAsBase64 } from '@client/utils/imageUtils'

async function replaceMinioUrlWithBase64(template: Record<string, any>) {
  async function recursiveTransform(obj: any) {
    if (typeof obj !== 'object' || obj === null) {
      return obj
    }

    const transformedObject = Array.isArray(obj) ? [...obj] : { ...obj }

    for (const key in obj) {
      const value = obj[key]
      if (typeof value === 'string' && isMinioUrl(value)) {
        transformedObject[key] = await fetchImageAsBase64(value)
      } else if (typeof value === 'object') {
        transformedObject[key] = await recursiveTransform(value)
      } else {
        transformedObject[key] = value
      }
    }

    return transformedObject
  }
  return recursiveTransform(template)
}

const withEnhancedTemplateVariables = (
  declaration: IPrintableDeclaration | undefined,
  userDetails: UserDetails | null,
  offlineData: IOfflineData
) => {
  if (!declaration) {
    return
  }

  const registeredDate = getRegisteredDate(declaration.data)
  const eventDate = getEventDate(declaration.data, declaration.event)
  const registrationFees = calculatePrice(
    declaration.event,
    eventDate,
    registeredDate,
    offlineData,
    declaration.data.registration.certificates[0]
  )

  const locationKey = userDetails?.primaryOffice?.id
    ? offlineData.offices[userDetails.primaryOffice.id].partOf.split('/')[1]
    : ''
  const { country, ...locationHierarchyIds } = getLocationHierarchy(
    locationKey,
    offlineData.locations
  )

  const locationHierarchy: Record<string, string | AdminStructure | undefined> =
    { country }

  for (const [key, value] of Object.entries(locationHierarchyIds)) {
    locationHierarchy[`${key}Id`] = value
  }

  return {
    ...declaration,
    data: {
      ...declaration.data,
      template: {
        ...declaration.data.template,
        printInAdvance: isCertificateForPrintInAdvance(declaration),
        certificateDate: formatLongDate(new Date().toISOString()),
        registrationFees,
        ...(userDetails && {
          loggedInUser: {
            name: getUserName(userDetails),
            officeId: userDetails.primaryOffice?.id,
            signature: userDetails.localRegistrar?.signature,
            ...locationHierarchy
          }
        })
      } as IFormSectionData
    }
  }
}

export const usePrintableCertificate = (declarationId?: string) => {
  const navigate = useNavigate()
  const declarationWithoutAllTemplateVariables = useDeclaration<
    IPrintableDeclaration | undefined
  >(declarationId)
  const userDetails = useSelector(getUserDetails)
  const offlineData = useSelector(getOfflineData)
  const declaration = withEnhancedTemplateVariables(
    declarationWithoutAllTemplateVariables,
    userDetails,
    offlineData
  )

  const state = useSelector((store: IStoreState) => store)
  const isPrintInAdvance = isCertificateForPrintInAdvance(declaration)
  const dispatch = useDispatch()
  const { hasAnyScope } = usePermissions()
  const canUserCorrectRecord =
    declaration?.event !== EventType.Marriage &&
    hasAnyScope([
      SCOPES.RECORD_REGISTRATION_CORRECT,
      SCOPES.RECORD_REGISTRATION_REQUEST_CORRECTION
    ])

  const certificateTemplateConfig: ICertificateData | undefined =
    offlineData.templates.certificates.find(
      (x) =>
        x.id ===
        declaration?.data.registration.certificates[0].certificateTemplateId
    )
  if (!certificateTemplateConfig) return { svgCode: null }

  const certificateFonts = certificateTemplateConfig?.fonts ?? {}
  const svgTemplate = certificateTemplateConfig?.svg

  if (!svgTemplate) return { svgCode: null }

  const svgWithoutFonts = compileSvg(
    svgTemplate,
    { ...declaration?.data.template, preview: true },
    state
  )
  const svgCode = addFontsToSvg(svgWithoutFonts, certificateFonts)

  const handleCertify = async () => {
    if (!declaration || !certificateTemplateConfig) {
      return
    }
    const draft = cloneDeep(declaration)

    draft.submissionStatus = SUBMISSION_STATUS.READY_TO_CERTIFY
    draft.action = isPrintInAdvance
      ? SubmissionAction.CERTIFY_DECLARATION
      : SubmissionAction.CERTIFY_AND_ISSUE_DECLARATION

    const registeredDate = getRegisteredDate(draft.data)
    const certificate = draft.data.registration.certificates[0]
    const eventDate = getEventDate(draft.data, draft.event)
    if (!isPrintInAdvance) {
      const paymentAmount = calculatePrice(
        draft.event,
        eventDate,
        registeredDate,
        offlineData,
        declaration.data.registration.certificates[0]
      )
      certificate.payments = {
        type: 'MANUAL' as const,
        amount: Number(paymentAmount),
        outcome: 'COMPLETED' as const,
        date: new Date().toISOString()
      }
    }

    const base64ReplacedTemplate = await replaceMinioUrlWithBase64(
      draft.data.template
    )

    const svg = compileSvg(
      svgTemplate,
      { ...base64ReplacedTemplate, preview: false },
      state
    )
    draft.data.registration = {
      ...draft.data.registration,
      certificates: [
        {
          ...certificate
        }
      ]
    }

    const pdfTemplate = svgToPdfTemplate(svg, certificateFonts)

    printPDF(pdfTemplate, draft.id)

    dispatch(modifyDeclaration(draft))
    dispatch(writeDeclaration(draft))

    navigate(
      generateGoToHomeTabUrl({
        tabId: WORKQUEUE_TABS.readyToPrint
      })
    )
  }

  const handleEdit = () => {
    if (!declarationId) {
      // eslint-disable-next-line no-console
      console.error('No declaration id provided')
      return
    }

    navigate(
      generateCertificateCorrectionUrl({
        declarationId,
        pageId: CorrectionSection.Corrector
      })
    )
  }

  return {
    svgCode,
    handleCertify,
    isPrintInAdvance,
    canUserCorrectRecord,
    handleEdit
  }
}
