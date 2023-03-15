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
import { defineMessages, MessageDescriptor } from 'react-intl'
import { Message } from 'typescript-react-intl'

interface IFormMessages
  extends Record<string | number | symbol, MessageDescriptor> {
  name: MessageDescriptor
  title: MessageDescriptor
  whoIsBirthInformant: MessageDescriptor
  whoIsDeathInformant: Message
  grandfather: MessageDescriptor
  grandmother: MessageDescriptor
  brother: MessageDescriptor
  sister: MessageDescriptor
  legalGuardian: MessageDescriptor
  informantError: MessageDescriptor
  spouse: MessageDescriptor
  son: MessageDescriptor
  sonInLaw: MessageDescriptor
  grandson: MessageDescriptor
  daughter: MessageDescriptor
  daughterInLaw: MessageDescriptor
  granddaughter: MessageDescriptor
  birthErrorMessage: MessageDescriptor
  deathErrorMessage: MessageDescriptor
  otherFamilyMember: MessageDescriptor
  birthInformantTitle: MessageDescriptor
  deathInformantTitle: MessageDescriptor
  marriageInformantTitle: MessageDescriptor
}

const messagesToDefine: IFormMessages = {
  name: {
    id: 'informant.name',
    defaultMessage: 'Informant',
    description: 'Informant section name'
  },
  title: {
    id: 'informant.title',
    defaultMessage: 'Select Informant',
    description: 'Informant section title'
  },
  whoIsBirthInformant: {
    defaultMessage: 'Who is informant',
    description: 'Label for option birth informant',
    id: 'form.field.label.informantRelation.whoIsBirthInformant'
  },
  whoIsDeathInformant: {
    defaultMessage: 'Who is informant',
    description: 'Label for option death informant',
    id: 'form.field.label.informantRelation.whoIsDeathInformant'
  },
  informantError: {
    id: 'correction.informant.error',
    defaultMessage: 'Please select who is informant',
    description: 'Error for corrector form'
  },
  mother: {
    defaultMessage: 'Mother',
    description: 'Label for option mother',
    id: 'form.field.label.informantRelation.mother'
  },
  father: {
    defaultMessage: 'Father',
    description: 'Label for option father',
    id: 'form.field.label.informantRelation.father'
  },
  groom: {
    defaultMessage: 'Groom',
    description: 'Label for option groom',
    id: 'form.field.label.informantRelation.groom'
  },
  bride: {
    defaultMessage: 'Bride',
    description: 'Label for option bride',
    id: 'form.field.label.informantRelation.bride'
  },
  groomAndBride: {
    defaultMessage: 'Groom & Bride',
    description: 'Label for option Groom & Bride',
    id: 'form.field.label.informantRelation.groomAndBride'
  },
  grandfather: {
    defaultMessage: 'Grandfather',
    description: 'Label for option Grandfather',
    id: 'form.field.label.informantRelation.grandfather'
  },
  grandmother: {
    defaultMessage: 'Grandmother',
    description: 'Label for option Grandmother',
    id: 'form.field.label.informantRelation.grandmother'
  },
  brother: {
    defaultMessage: 'Brother',
    description: 'Label for option brother',
    id: 'form.field.label.informantRelation.brother'
  },
  sister: {
    defaultMessage: 'Sister',
    description: 'Label for option Sister',
    id: 'form.field.label.informantRelation.sister'
  },
  legalGuardian: {
    defaultMessage: 'Legal guardian',
    description: 'Label for option Legal Guardian',
    id: 'form.field.label.informantRelation.legalGuardian'
  },
  others: {
    defaultMessage: 'Someone else',
    description: 'Label for option someone else',
    id: 'form.field.label.informantRelation.others'
  },
  birthInformantTitle: {
    defaultMessage: 'Who is applying for birth registration?',
    description: 'Who is applying for birth registration',
    id: 'register.selectInformant.birthInformantTitle'
  },
  deathInformantTitle: {
    defaultMessage: 'Who is applying for death registration?',
    description: 'Who is applying for death registration',
    id: 'register.selectInformant.deathInformantTitle'
  },
  marriageInformantTitle: {
    defaultMessage: 'Who is applying for marriage registration?',
    description: 'Who is applying for marriage registration',
    id: 'register.selectInformant.marriageInformantTitle'
  },
  spouse: {
    defaultMessage: 'Spouse',
    description: 'Label for option Spouse',
    id: 'form.field.label.informantRelation.spouse'
  },
  son: {
    defaultMessage: 'Son',
    description: 'Label for option Son',
    id: 'form.field.label.informantRelation.son'
  },
  sonInLaw: {
    defaultMessage: 'Son in law',
    description: 'Label for option Son in law',
    id: 'form.field.label.informantRelation.sonInLaw'
  },
  grandson: {
    defaultMessage: 'Grandson',
    description: 'Label for option Grandson',
    id: 'form.field.label.informantRelation.grandson'
  },
  daughter: {
    defaultMessage: 'Daughter',
    description: 'Label for option Daughter',
    id: 'form.field.label.informantRelation.daughter'
  },
  daughterInLaw: {
    defaultMessage: 'Daughter in law',
    description: 'Label for option Daughter in law',
    id: 'form.field.label.informantRelation.daughterInLaw'
  },
  granddaughter: {
    defaultMessage: 'Granddaughter',
    description: 'Label for option Granddaughter',
    id: 'form.field.label.informantRelation.granddaughter'
  },
  birthErrorMessage: {
    defaultMessage: 'Please select who is present and applying',
    description: 'Label for birth error message',
    id: 'register.selectInformant.birthErrorMessage'
  },
  deathErrorMessage: {
    defaultMessage: 'Please select the relationship to the deceased.',
    description: 'Label for death error message',
    id: 'register.selectInformant.deathErrorMessage'
  },
  otherFamilyMember: {
    defaultMessage: 'Other family member',
    description: 'Label for other family member relation',
    id: 'form.field.label.relationOtherFamilyMember'
  }
}

export const messages: IFormMessages = defineMessages(messagesToDefine)
