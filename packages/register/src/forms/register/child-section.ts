import { defineMessages } from 'react-intl'
import { ViewType } from 'src/forms'
import { bengaliNameFormat, englishNameFormat } from 'src/utils/validate'

export interface IChildSectionFormData {
  firstName: string
  foo: string
  bar: string
  baz: string
}
import { IFormSection } from '../index'

const messages = defineMessages({
  childTab: {
    id: 'register.form.tabs.childTab',
    defaultMessage: 'Child',
    description: 'Tab title for Child'
  },
  childTitle: {
    id: 'register.form.section.childTitle',
    defaultMessage: "Child's details",
    description: 'Form section title for Child'
  },
  childGivenName: {
    id: 'formFields.childGivenName',
    defaultMessage: 'Given name',
    description: 'Label for form field: Given name'
  },
  childMiddleNames: {
    id: 'formFields.childMiddleNames',
    defaultMessage: 'Middle name(s)',
    description: 'Label for form field: Middle names'
  },
  childFamilyName: {
    id: 'formFields.childFamilyName',
    defaultMessage: 'Family name',
    description: 'Label for form field: Family name'
  },
  childGivenNameEng: {
    id: 'formFields.childGivenNameEng',
    defaultMessage: 'Given name (in english)',
    description: 'Label for form field: Given name in english'
  },
  childMiddleNamesEng: {
    id: 'formFields.childMiddleNamesEng',
    defaultMessage: 'Middle name(s) (in english)',
    description: 'Label for form field: Middle names in english'
  },
  childFamilyNameEng: {
    id: 'formFields.childFamilyNameEng',
    defaultMessage: 'Family name (in english)',
    description: 'Label for form field: Family name in english'
  },
  childSex: {
    id: 'formFields.childSex',
    defaultMessage: 'Sex',
    description: 'Label for form field: Sex name'
  },
  childSexMale: {
    id: 'formFields.childSexMale',
    defaultMessage: 'Male',
    description: 'Option for form field: Sex name'
  },
  childSexFemale: {
    id: 'formFields.childSexFemale',
    defaultMessage: 'Female',
    description: 'Option for form field: Sex name'
  },
  childSexOther: {
    id: 'formFields.childSexOther',
    defaultMessage: 'Other',
    description: 'Option for form field: Sex name'
  },
  childSexUnknown: {
    id: 'formFields.childSexUnknown',
    defaultMessage: 'Unknown',
    description: 'Option for form field: Sex name'
  },
  childDateOfBirth: {
    id: 'formFields.childDateOfBirth',
    defaultMessage: 'Date of birth',
    description: 'Label for form field: Date of birth'
  },
  attendantAtBirth: {
    id: 'formFields.attendantAtBirth',
    defaultMessage: 'Attendant at birth',
    description: 'Label for form field: Attendant at birth'
  },
  attendantAtBirthPhysician: {
    id: 'formFields.attendantAtBirthPhysician',
    defaultMessage: 'Physician',
    description: 'Label for form field: Attendant at birth'
  },
  attendantAtBirthNurse: {
    id: 'formFields.attendantAtBirthNurse',
    defaultMessage: 'Nurse',
    description: 'Label for form field: Attendant at birth'
  },
  attendantAtBirthMidwife: {
    id: 'formFields.attendantAtBirthMidwife',
    defaultMessage: 'Midwife',
    description: 'Label for form field: Attendant at birth'
  },
  attendantAtBirthOtherParamedicalPersonnel: {
    id: 'formFields.attendantAtBirthOtherParamedicalPersonnel',
    defaultMessage: 'Other paramedical personnel',
    description: 'Label for form field: Attendant at birth'
  },
  attendantAtBirthLayperson: {
    id: 'formFields.attendantAtBirthLayperson',
    defaultMessage: 'Layperson',
    description: 'Label for form field: Attendant at birth'
  },
  attendantAtBirthNone: {
    id: 'formFields.attendantAtBirthNone',
    defaultMessage: 'None',
    description: 'Label for form field: Attendant at birth'
  },
  attendantAtBirthOther: {
    id: 'formFields.attendantAtBirthOther',
    defaultMessage: 'Other',
    description: 'Label for form field: Attendant at birth'
  },
  typeOfBirth: {
    id: 'formFields.typeOfBirth',
    defaultMessage: 'Type of birth',
    description: 'Label for form field: Type of birth'
  },
  typeOfBirthSingle: {
    id: 'formFields.typeOfBirthSingle',
    defaultMessage: 'Single',
    description: 'Label for form field: Type of birth'
  },
  typeOfBirthTwin: {
    id: 'formFields.typeOfBirthTwin',
    defaultMessage: 'Twin',
    description: 'Label for form field: Type of birth'
  },
  typeOfBirthTriplet: {
    id: 'formFields.typeOfBirthTriplet',
    defaultMessage: 'Triplet',
    description: 'Label for form field: Type of birth'
  },
  typeOfBirthQuadruplet: {
    id: 'formFields.typeOfBirthQuadruplet',
    defaultMessage: 'Quadruplet',
    description: 'Label for form field: Type of birth'
  },
  typeOfBirthHigherMultipleDelivery: {
    id: 'formFields.typeOfBirthHigherMultipleDelivery',
    defaultMessage: 'Higher multiple delivery',
    description: 'Label for form field: Type of birth'
  },
  orderOfBirth: {
    id: 'formFields.orderOfBirth',
    defaultMessage: 'Order of birth (number)',
    description: 'Label for form field: Order of birth'
  },
  weightAtBirth: {
    id: 'formFields.weightAtBirth',
    defaultMessage: 'Weight at birth',
    description: 'Label for form field: Weight at birth'
  },
  placeOfDelivery: {
    id: 'formFields.placeOfDelivery',
    defaultMessage: 'Place of delivery',
    description: 'Label for form field: Place of delivery'
  },
  deliveryInstitution: {
    id: 'formFields.deliveryInstitution',
    defaultMessage: 'Type or select institution',
    description: 'Label for form field: Type or select institution'
  },
  deliveryAddress: {
    id: 'formFields.deliveryAddress',
    defaultMessage: 'Address of place of delivery',
    description: 'Label for form field: Address of place of delivery'
  },
  hospital: {
    id: 'formFields.hospital',
    defaultMessage: 'Hospital',
    description: 'Select item for hospital'
  },
  otherHealthInstitution: {
    id: 'formFields.otherHealthInstitution',
    defaultMessage: 'Other Health Institution',
    description: 'Select item for Other Health Institution'
  },
  privateHome: {
    id: 'formFields.privateHome',
    defaultMessage: 'Private Home',
    description: 'Select item for Private Home'
  },
  otherInstitution: {
    id: 'formFields.otherInstitution',
    defaultMessage: 'Other Institution',
    description: 'Select item for Other Institution'
  },
  optionalLabel: {
    id: 'formFields.optionalLabel',
    defaultMessage: 'Optional',
    description: 'Optional label'
  }
})

export const childSection: IFormSection = {
  id: 'child',
  viewType: 'form' as ViewType,
  name: messages.childTab,
  title: messages.childTitle,
  fields: [
    {
      name: 'childGivenName',
      type: 'text',
      label: messages.childGivenName,
      required: true,
      initialValue: '',
      validate: [bengaliNameFormat]
    },
    {
      name: 'childMiddleNames',
      type: 'text',
      label: messages.childMiddleNames,
      required: false,
      initialValue: '',
      validate: [bengaliNameFormat]
    },
    {
      name: 'childFamilyName',
      type: 'text',
      label: messages.childFamilyName,
      initialValue: '',
      validate: [bengaliNameFormat]
    },
    {
      name: 'childGivenNameEng',
      type: 'text',
      label: messages.childGivenNameEng,
      required: true,
      initialValue: '',
      validate: [englishNameFormat]
    },
    {
      name: 'childMiddleNamesEng',
      type: 'text',
      label: messages.childMiddleNamesEng,
      required: false,
      initialValue: '',
      validate: [englishNameFormat]
    },
    {
      name: 'childFamilyNameEng',
      type: 'text',
      label: messages.childFamilyNameEng,
      initialValue: '',
      validate: [englishNameFormat]
    },
    {
      name: 'childSex',
      type: 'select',
      label: messages.childSex,
      required: true,
      initialValue: '',
      validate: [],
      options: [
        { value: 'male', label: messages.childSexMale },
        { value: 'female', label: messages.childSexFemale },
        { value: 'other', label: messages.childSexOther },
        { value: 'unknown', label: messages.childSexUnknown }
      ]
    },
    {
      name: 'dateOfBirth',
      type: 'date',
      label: messages.childDateOfBirth,
      required: true,
      initialValue: '',
      validate: []
    },
    {
      name: 'attendantAtBirth',
      type: 'select',
      label: messages.attendantAtBirth,
      required: true,
      initialValue: '',
      validate: [],
      options: [
        { value: 'PHYSICIAN', label: messages.attendantAtBirthPhysician },
        { value: 'NURSE', label: messages.attendantAtBirthNurse },
        { value: 'MIDWIFE', label: messages.attendantAtBirthMidwife },
        {
          value: 'OTHER_PARAMEDICAL_PERSONNEL',
          label: messages.attendantAtBirthOtherParamedicalPersonnel
        },
        { value: 'LAYPERSON', label: messages.attendantAtBirthLayperson },
        { value: 'NONE', label: messages.attendantAtBirthNone },
        { value: 'OTHER', label: messages.attendantAtBirthOther }
      ]
    },
    {
      name: 'typeOfBirth',
      type: 'select',
      label: messages.typeOfBirth,
      required: true,
      initialValue: '',
      validate: [],
      options: [
        { value: 'SINGLE', label: messages.typeOfBirthSingle },
        { value: 'TWIN', label: messages.typeOfBirthTwin },
        { value: 'TRIPLET', label: messages.typeOfBirthTriplet },
        { value: 'QUADRUPLET', label: messages.typeOfBirthQuadruplet },
        {
          value: 'HIGHER_MULTIPLE_DELIVERY',
          label: messages.typeOfBirthHigherMultipleDelivery
        }
      ]
    },
    {
      name: 'orderOfBirth',
      type: 'text',
      label: messages.orderOfBirth,
      required: true,
      initialValue: '',
      validate: []
    },
    {
      name: 'weightAtBirth',
      type: 'text',
      label: messages.weightAtBirth,
      required: true,
      initialValue: '',
      validate: [],
      postfix: 'Kg'
    },
    {
      name: 'placeOfDelivery',
      type: 'select',
      label: messages.placeOfDelivery,
      initialValue: '',
      validate: [],
      options: [
        { value: 'HOSPITAL', label: messages.hospital },
        {
          value: 'OTHER_HEALTH_INSTITUTION',
          label: messages.otherHealthInstitution
        },
        { value: 'PRIVATE_HOME', label: messages.privateHome },
        { value: 'OTHER', label: messages.otherInstitution }
      ]
    },
    {
      name: 'deliveryInstitution',
      type: 'select',
      label: messages.deliveryInstitution,
      initialValue: '',
      validate: [],
      options: [{ value: '?', label: messages.deliveryInstitution }]
    },
    {
      name: 'deliveryAddress',
      type: 'textarea',
      label: messages.deliveryAddress,
      initialValue: '',
      validate: [],
      disabled: true
    }
  ]
}
