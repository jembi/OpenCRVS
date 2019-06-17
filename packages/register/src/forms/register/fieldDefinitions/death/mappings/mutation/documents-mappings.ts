import { IFormField, IFormData } from '@register/forms'
import { fieldToAttachmentTransformer } from '@register/forms/mappings/mutation/field-mappings'

export const documentForWhomFhirMapping = {
  "Proof of Deceased's ID": 'DECEASED_ID_PROOF',
  'Proof Deceased Permanent Address': 'DECEASED_PARMANENT_ADDRESS_PROOF',
  'Proof of Death of Deceased': 'DECEASED_DEATH_PROOF',
  'Proof of Date of Birth of Deceased': 'DECEASED_BIRTH_PROOF',
  "Proof of Applicant's ID": 'APPLICANT_ID_PROOF'
}

export const documentTypeFhirMapping = {
  'Birth Registration': 'BIRTH_REGISTRATION',
  'National ID (front)': 'NATIONAL_ID_FRONT',
  'National ID (back)': 'NATIONAL_ID_BACK',
  'Certified Post Mortem Report': 'POST_MORTEM_CERTIFICATE',
  'Hospital Discharge Certificate': 'HOSPITAL_DISCHARGE_CERTIFICATE',
  'Attested Letter of Death': 'ATTESTED_DEATH_LETTER',
  'Attested Certificate of Death': 'ATTESTED_DEATH_CERTIFICATE',
  'Certified Copy of Burial Receipt': 'BURIAL_RECEIPT',
  'Certified Copy of Funeral Receipt': 'FUNERAL_RECEIPT'
}

export function deathFieldToAttachmentTransformer(
  transformedData: any,
  draftData: IFormData,
  sectionId: string,
  field: IFormField
) {
  return fieldToAttachmentTransformer(
    transformedData,
    draftData,
    sectionId,
    field,
    'registration',
    documentForWhomFhirMapping,
    documentTypeFhirMapping
  )
}
