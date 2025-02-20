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

export function createServerWithEnvironment() {
  jest.resetModules()
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  return require('../server').createServer()
}
export const translationsMock = {
  languages: [
    {
      lang: 'en',
      displayName: 'English',
      messages: {
        birthInProgressNotification:
          'Birth registration tracking ID is {{trackingId}}. You must visit {{crvsOffice}} to complete the declaration',
        birthDeclarationNotification:
          'Birth registration tracking ID for {{name}} is {{trackingId}}. You will get an SMS within 2 days with progress and next steps.',
        birthRegistrationNotification:
          'Congratulations, the birth of {{name}} has been registered. Visit your local registration office in 5 days with your ID to collect the certificate. Your tracking ID is {{trackingId}}.',
        birthRejectionNotification:
          'Birth registration declaration for {{name}} ( Tracking ID: {{trackingId}} ) has been rejected. Please visit your local registration office for more information.',
        deathInProgressNotification:
          'Death registration tracking ID is {{trackingId}}. You must visit {{crvsOffice}} to complete the declaration',
        deathDeclarationNotification:
          'Death registration tracking ID for {{name}} is {{trackingId}}. You will get an SMS within 2 days with progress and next steps.',
        deathRegistrationNotification:
          'The death of {{name}} has been registered. Visit your local registration office in 5 days with your ID to collect the certificate. Your tracking ID is {{trackingId}}.',
        deathRejectionNotification:
          'Death registration declaration for {{name}} ( Tracking ID: {{trackingId}} ) has been rejected. Please visit your local registration office for more information.',
        authenticationCodeNotification:
          'Your OpenCRVS authentication code is: {{authCode}}',
        userCredentialsNotification:
          'You can login to OpenCRVS with this temporary username: {{username}} and password: {{password}}',
        retieveUserNameNotification:
          'Your username for OpenCRVS is: {{username}}',
        updateUserNameNotification:
          'Your OpenCRVS username has been updated to: {{username}}. Your password has not changed.',
        resetUserPasswordNotification:
          'Your password has been reset. Please login to {{applicationName}} with the temporary password: {{password}}.'
      }
    },
    {
      lang: 'bn',
      displayName: 'বাংলা',
      messages: {
        birthInProgressNotification:
          'জন্ম নিবন্ধন ট্র্যাকিং আইডি {{trackingId}}। আবেদনটি সম্পূর্ণ করতে {{crvsOffice}} এ আসুন।',
        birthDeclarationNotification:
          '{{name}} এর জন্য জন্ম নিবন্ধন ট্র্যাকিং আইডি {{trackingId}}। অগ্রগতি এবং পরবর্তী পদক্ষেপের সাথে আপনি 2 দিনের মধ্যে একটি এসএমএস পাবেন।',
        birthRegistrationNotification:
          'অভিনন্দন, {{name}} এর জন্ম নিবন্ধিত হয়েছে। সার্টিফিকেট সংগ্রহ করতে আপনার আইডি নিয়ে ৫ দিন পরে স্থানীয় নিবন্ধন অফিসে যান। আপনার ট্র্যাকিং আইডি হল {{trackingId}}।',
        birthRejectionNotification:
          '{{name}} এর জন্ম নিবন্ধন আবেদনটি (ট্র্যাকিং আইডি: {{trackingId}}) বাতিল করা হয়েছে। পরবর্তী পদক্ষেপের জন্য আপনার স্থানীয় নিবন্ধন অফিসে যান।',
        deathInProgressNotification:
          'মৃত্যু নিবন্ধন ট্র্যাকিং আইডি {{trackingId}}। আবেদনটি সম্পূর্ণ করতে {{crvsOffice}} এ আসুন।',
        deathDeclarationNotification:
          '{{name}} এর জন্য মৃত্যু নিবন্ধন ট্র্যাকিং আইডি {{trackingId}}। অগ্রগতি এবং পরবর্তী পদক্ষেপের সাথে আপনি 2 দিনের মধ্যে একটি এসএমএস পাবেন।',
        deathRegistrationNotification:
          '{{name}} এর মৃত্যু নিবন্ধিত হয়েছে। সার্টিফিকেট সংগ্রহ করতে আপনার আইডি নিয়ে ৫ দিন পরে স্থানীয় নিবন্ধন অফিসে যান। আপনার ট্র্যাকিং আইডি হল {{trackingId}}।',
        deathRejectionNotification:
          '{{name}} এর মৃত্যু নিবন্ধন আবেদনটি (ট্র্যাকিং আইডি: {{trackingId}}) বাতিল করা হয়েছে। পরবর্তী পদক্ষেপের জন্য আপনার স্থানীয় নিবন্ধন অফিসে যান।',
        authenticationCodeNotification:
          'আপনার OpenCRVS এর authentication code হল: {{authCode}}',
        userCredentialsNotification:
          'OpenCRVS এ লগইন করতে ব্যাবহার করুন, username: {{username}} এবং password: {{password}}',
        retieveUserNameNotification:
          'আপনার OpenCRVS এর username হল: {{username}}',
        updateUserNameNotification:
          'আপনার OpenCRVS এর বদলকৃত username হল: {{username}}। আপনার password এখনো অপরিবর্তিত রয়েছে।',
        resetUserPasswordNotification:
          'আপনার পাসওয়ার্ড পুনরায় সেট করা হয়েছে. অনুগ্রহ করে {{applicationName}} এ লগইন করুন আপনার অস্থায়ী পাসওয়ার্ড দিয়ে: {{password}}.'
      }
    }
  ]
}

export const emailUserMock = {
  _id: '6798f378533ac9f3188f1de9',
  name: [{ use: 'en', given: [Array], family: 'Campbell' }],
  username: 'j.campbell',
  email: '',
  emailForNotification: 'kalushabwaly.a17@gmail.com',
  mobile: '+260921111111',
  passwordHash: '$2a$10$p4wMIAAIKTOfr60FiQc8I.ailfW5.L4wsG3fvCsezSyfplQsLkSX6',
  salt: '$2a$10$p4wMIAAIKTOfr60FiQc8I.',
  role: 'NATIONAL_SYSTEM_ADMIN',
  practitionerId: '13940481-08e1-494d-a2a1-438f8de785b6',
  primaryOfficeId: 'eda436df-99af-42d9-a6a2-cd6adf56483a',
  status: 'active',
  identifiers: [],
  securityQuestionAnswers: [],
  creationDate: 1738077048363,
  auditHistory: [],
  searches: []
}
