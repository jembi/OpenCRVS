import * as React from 'react'

import { Provider } from 'react-redux'
import { graphql, print } from 'graphql'
import ApolloClient from 'apollo-client'

import { MockedProvider } from 'react-apollo/test-utils'
import { ApolloLink, Observable } from 'apollo-link'
import { IStoreState, createStore, AppStore } from '../store'
import { InMemoryCache } from 'apollo-cache-inmemory'
import * as en from 'react-intl/locale-data/en'
import { mount, configure, shallow, ReactWrapper } from 'enzyme'
import * as Adapter from 'enzyme-adapter-react-16'
import { addLocaleData, IntlProvider, intlShape } from 'react-intl'
import { App } from '../App'
import { getSchema } from './graphql-schema-mock'
import { ThemeProvider } from 'styled-components'
import { ENGLISH_STATE } from '../i18n/locales/en'
import { getTheme } from '@opencrvs/components/lib/theme'
import { I18nContainer } from '@opencrvs/register/src/i18n/components/I18nContainer'

configure({ adapter: new Adapter() })

function createGraphQLClient() {
  const schema = getSchema()

  return new ApolloClient({
    cache: new InMemoryCache(),
    link: new ApolloLink(operation => {
      return new Observable(observer => {
        const { query, operationName, variables } = operation

        graphql(schema, print(query), null, null, variables, operationName)
          .then(result => {
            observer.next(result)
            observer.complete()
          })
          .catch(observer.error.bind(observer))
      })
    })
  })
}

addLocaleData([...en])

export function getInitialState(): IStoreState {
  const { store: mockStore } = createStore()

  mockStore.dispatch({ type: 'NOOP' })

  return mockStore.getState()
}

export function createTestApp() {
  const { store, history } = createStore()
  const app = mount(
    <App store={store} history={history} client={createGraphQLClient()} />
  )

  return { history, app, store }
}

interface ITestView {
  intl: ReactIntl.InjectedIntl
}

const intlProvider = new IntlProvider(
  { locale: 'en', messages: ENGLISH_STATE.messages },
  {}
)
export const { intl } = intlProvider.getChildContext()

function nodeWithIntlProp(node: React.ReactElement<ITestView>) {
  return React.cloneElement(node, { intl })
}

export function createTestComponent(
  node: React.ReactElement<ITestView>,
  store: AppStore,
  graphqlMocks: any = null
) {
  const component = mount(
    <MockedProvider mocks={graphqlMocks} addTypename={false}>
      <Provider store={store}>
        <I18nContainer>
          <ThemeProvider theme={getTheme(window.config.COUNTRY)}>
            {nodeWithIntlProp(node)}
          </ThemeProvider>
        </I18nContainer>
      </Provider>
    </MockedProvider>,
    {
      context: { intl },
      childContextTypes: { intl: intlShape }
    }
  )

  return { component, store }
}

export function createShallowRenderedComponent(
  node: React.ReactElement<ITestView>
) {
  return shallow(node)
}

export const wait = () => new Promise(res => process.nextTick(res))

export const selectOption = (
  wrapper: ReactWrapper<{}, {}, React.Component<{}, {}, any>>,
  selector: string,
  option: string
): string => {
  const input = wrapper
    .find(`${selector} input`)
    .instance() as React.InputHTMLAttributes<HTMLInputElement>
  input.value = option.charAt(0)
  wrapper.find(`${selector} input`).simulate('change', {
    target: { value: option.charAt(0) }
  })
  wrapper
    .find(`${selector} .react-select__menu div[children="${option}"]`)
    .simulate('click')
  return `${selector} .react-select__single-value`
}

export const userDetails = {
  name: [
    {
      use: 'en',
      firstNames: 'Shakib',
      familyName: 'Al Hasan',
      __typename: 'HumanName'
    },
    { use: 'bn', firstNames: '', familyName: '', __typename: 'HumanName' }
  ],
  role: 'FIELD_AGENT',
  primaryOffice: {
    id: '6327dbd9-e118-4dbe-9246-cb0f7649a666',
    name: 'Kaliganj Union Sub Center',
    status: 'active'
  },
  catchmentArea: [
    {
      id: '850f50f3-2ed4-4ae6-b427-2d894d4a3329',
      name: 'Dhaka',
      status: 'active',
      identifier: [
        {
          system: 'http://opencrvs.org/specs/id/a2i-internal-id',
          value: '3'
        },
        { system: 'http://opencrvs.org/specs/id/bbs-code', value: '30' },
        {
          system: 'http://opencrvs.org/specs/id/jurisdiction-type',
          value: 'DIVISION'
        }
      ]
    },
    {
      id: '812ed387-f8d5-4d55-ad05-936292385990',
      name: 'GAZIPUR',
      status: 'active',
      identifier: [
        {
          system: 'http://opencrvs.org/specs/id/a2i-internal-id',
          value: '20'
        },
        { system: 'http://opencrvs.org/specs/id/bbs-code', value: '33' },
        {
          system: 'http://opencrvs.org/specs/id/jurisdiction-type',
          value: 'DISTRICT'
        }
      ]
    },
    {
      id: '90d39759-7f02-4646-aca3-9272b4b5ce5a',
      name: 'KALIGANJ',
      status: 'active',
      identifier: [
        {
          system: 'http://opencrvs.org/specs/id/a2i-internal-id',
          value: '165'
        },
        { system: 'http://opencrvs.org/specs/id/bbs-code', value: '34' },
        {
          system: 'http://opencrvs.org/specs/id/jurisdiction-type',
          value: 'UPAZILA'
        }
      ]
    },
    {
      id: '43c17986-62cf-4551-877c-be095fb6e5d0',
      name: 'BAKTARPUR',
      status: 'active',
      identifier: [
        {
          system: 'http://opencrvs.org/specs/id/a2i-internal-id',
          value: '3473'
        },
        { system: 'http://opencrvs.org/specs/id/bbs-code', value: '17' },
        {
          system: 'http://opencrvs.org/specs/id/jurisdiction-type',
          value: 'UNION'
        }
      ]
    }
  ]
}

export const mockUserResponseWithName = {
  data: {
    getUser: userDetails
  }
}

export const mockUserResponse = {
  data: {
    getUser: {
      catchmentArea: [
        {
          id: 'ddab090d-040e-4bef-9475-314a448a576a',
          name: 'Dhaka',
          status: 'active',
          identifier: [
            {
              system: 'http://opencrvs.org/specs/id/a2i-internal-id',
              value: '3'
            },
            { system: 'http://opencrvs.org/specs/id/bbs-code', value: '30' },
            {
              system: 'http://opencrvs.org/specs/id/jurisdiction-type',
              value: 'DIVISION'
            }
          ],
          __typename: 'Location'
        },
        {
          id: 'f9ec1fdb-086c-4b3d-ba9f-5257f3638286',
          name: 'GAZIPUR',
          status: 'active',
          identifier: [
            {
              system: 'http://opencrvs.org/specs/id/a2i-internal-id',
              value: '20'
            },
            { system: 'http://opencrvs.org/specs/id/bbs-code', value: '33' },
            {
              system: 'http://opencrvs.org/specs/id/jurisdiction-type',
              value: 'DISTRICT'
            }
          ],
          __typename: 'Location'
        },
        {
          id: '825b17fb-4308-48cb-b77c-2f2cee4f14b9',
          name: 'KALIGANJ',
          status: 'active',
          identifier: [
            {
              system: 'http://opencrvs.org/specs/id/a2i-internal-id',
              value: '165'
            },
            { system: 'http://opencrvs.org/specs/id/bbs-code', value: '34' },
            {
              system: 'http://opencrvs.org/specs/id/jurisdiction-type',
              value: 'UPAZILA'
            }
          ],
          __typename: 'Location'
        },
        {
          id: '123456789',
          name: 'BAKTARPUR',
          status: 'active',
          identifier: [
            {
              system: 'http://opencrvs.org/specs/id/a2i-internal-id',
              value: '3473'
            },
            { system: 'http://opencrvs.org/specs/id/bbs-code', value: '17' },
            {
              system: 'http://opencrvs.org/specs/id/jurisdiction-type',
              value: 'UNION'
            }
          ],
          __typename: 'Location'
        }
      ],
      primaryOffice: {
        id: '2a83cf14-b959-47f4-8097-f75a75d1867f',
        name: 'Kaliganj Union Sub Center',
        status: 'active',
        __typename: 'Location'
      },
      __typename: 'User'
    }
  }
}

export const mockApplicationData = {
  child: {
    firstNames: 'গায়ত্রী',
    familyName: 'স্পিভক',
    firstNamesEng: 'Mike',
    familyNameEng: 'Test',
    childBirthDate: '1977-09-20',
    gender: 'male',
    weightAtBirth: '3.5',
    attendantAtBirth: 'MIDWIFE',
    birthType: 'SINGLE',
    multipleBirth: 1
  },
  mother: {
    firstNames: 'স্পিভক',
    familyName: 'গায়ত্রী',
    firstNamesEng: 'Liz',
    familyNameEng: 'Test',
    iD: '6546511876932',
    iDType: 'NATIONAL_ID',
    motherBirthDate: '1949-05-31',
    dateOfMarriage: '1972-09-19',
    maritalStatus: 'MARRIED',
    educationalAttainment: 'SECOND_STAGE_TERTIARY_ISCED_6',
    nationality: 'BGD',
    countryPermanent: 'BGD',
    statePermanent: 'state2',
    districtPermanent: 'district2',
    addressLine1Permanent: 'some road',
    addressLine2Permanent: 'some more',
    addressLine3Permanent: 'some more',
    addressLine4Permanent: 'upazila1',
    postalCodePermanent: '',
    country: 'BGD',
    state: 'state2',
    district: 'district2',
    addressLine1: '',
    addressLine2: '',
    addressLine3: '',
    addressLine4: 'upazila2',
    postalCode: '',
    currentAddressSameAsPermanent: true
  },
  father: {
    fathersDetailsExist: true,
    firstNames: 'গায়ত্রী',
    familyName: 'স্পিভক',
    firstNamesEng: 'Jeff',
    familyNameEng: 'Test',
    iD: '43A8ZU817',
    iDType: 'PASSPORT',
    fatherBirthDate: '1950-05-19',
    dateOfMarriage: '1972-09-19',
    maritalStatus: 'MARRIED',
    educationalAttainment: 'SECOND_STAGE_TERTIARY_ISCED_6',
    nationality: 'BGD',
    countryPermanent: 'BGD',
    statePermanent: 'state2',
    districtPermanent: 'district2',
    addressLine1Permanent: '',
    addressLine2Permanent: '',
    addressLine3Permanent: '',
    addressLine4Permanent: 'upazila1',
    postalCodePermanent: '',
    country: 'BGD',
    state: 'state2',
    district: 'district2',
    addressLine1: '',
    addressLine2: '',
    addressLine3: '',
    addressLine4: 'upazila2',
    postalCode: '',
    permanentAddressSameAsMother: true,
    addressSameAsMother: true
  },
  registration: {
    whoseContactDetails: 'MOTHER',
    presentAtBirthRegistration: 'BOTH_PARENTS',
    registrationPhone: '01557394986'
  }
}

export const mockDeathApplicationData = {
  deceased: {
    iDType: 'NATIONAL_ID',
    iD: '1230000000000',
    firstNames: 'মকবুল',
    familyName: 'ইসলাম',
    firstNamesEng: 'Mokbul',
    familyNameEng: 'Islam',
    nationality: 'BGD',
    gender: 'male',
    maritalStatus: 'MARRIED',
    birthDate: '1987-02-16',
    permanentAddress: '',
    countryPermanent: 'BGD',
    statePermanent: '6d190887-c8a6-4818-a914-9cdbd36a1d70',
    districtPermanent: '22244d72-a10e-4edc-a5c4-4ffaed00f854',
    addressLine4Permanent: '7b9c37e3-8d04-45f9-88be-1f0fe481018a',
    addressLine3Permanent: '59c55c4c-fb7d-4334-b0ba-d1020ca5b549',
    addressLine2Permanent: '193 Kalibari Road',
    addressLine1Permanent: '193 Kalibari Road',
    postCodePermanent: '2200',
    currentAddress: '',
    currentAddressSameAsPermanent: true,
    country: 'BGD',
    state: '',
    district: '',
    addressLine4: '',
    addressLine3: '',
    addressLine2: '',
    addressLine1: '',
    postCode: ''
  },
  informant: {
    applicantIdType: 'NATIONAL_ID',
    iDType: 'NATIONAL_ID',
    applicantID: '1230000000000',
    applicantFirstNames: '',
    applicantFamilyName: 'ইসলাম',
    applicantFirstNamesEng: 'Islam',
    applicantFamilyNameEng: '',
    nationality: 'BGD',
    applicantBirthDate: '',
    applicantsRelationToDeceased: 'MOTHER',
    applicantPhone: '',
    currentAddress: '',
    country: 'BGD',
    state: '6d190887-c8a6-4818-a914-9cdbd36a1d70',
    district: '22244d72-a10e-4edc-a5c4-4ffaed00f854',
    addressLine4: '7b9c37e3-8d04-45f9-88be-1f0fe481018a',
    addressLine3: '59c55c4c-fb7d-4334-b0ba-d1020ca5b549',
    addressLine2: '',
    addressLine1: '193 Kalibari Road',
    postCode: '2200',
    permanentAddress: '',
    applicantPermanentAddressSameAsCurrent: true,
    countryPermanent: 'BGD',
    statePermanent: '',
    districtPermanent: '',
    addressLine4Permanent: '',
    addressLine3Permanent: '',
    addressLine2Permanent: '',
    addressLine1Permanent: '',
    postCodePermanent: ''
  },
  deathEvent: {
    deathDate: '1987-02-16',
    manner: 'ACCIDENT',
    deathPlace: '',
    deathPlaceAddress: 'OTHER',
    placeOfDeath: 'OTHER',
    deathLocation: '',
    addressType: '',
    country: 'BGD',
    state: 'state',
    district: 'district',
    addressLine4: 'upazila',
    addressLine3: 'union',
    addressLine2: '',
    addressLine1: '',
    postCode: ''
  },
  causeOfDeath: {
    causeOfDeathEstablished: false,
    methodOfCauseOfDeath: '',
    causeOfDeathCode: ''
  },
  documents: {
    image_uploader: [
      {
        data: 'base64-data',
        type: 'image/jpeg',
        optionValues: ["Proof of Deceased's ID", 'National ID (front)'],
        title: "Proof of Deceased's ID",
        description: 'National ID (front)'
      }
    ]
  }
}

export const mockOfflineData = {
  facilities: [
    {
      id: '627fc0cc-e0e2-4c09-804d-38a9fa1807ee',
      name: 'Shaheed Taj Uddin Ahmad Medical College',
      nameBn: 'শহীদ তাজউদ্দিন আহমেদ মেডিকেল কলেজ হাসপাতাল',
      physicalType: 'Building',
      type: 'HEALTH_FACILITY',
      partOf: 'Location/3a5358d0-1bcd-4ea9-b0b7-7cfb7cbcbf0f'
    },
    {
      id: 'ae5b4462-d1b2-4b22-b289-a66f912dce73',
      name: 'Kaliganj Union Sub Center',
      nameBn: 'কালীগঞ্জ ইউনিয়ন উপ-স্বাস্থ্য কেন্দ্র',
      physicalType: 'Building',
      type: 'HEALTH_FACILITY',
      partOf: 'Location/50c5a9c4-3cc1-4c8c-9a1b-a37ddaf85987'
    },
    {
      id: '6abbb7b8-d02e-41cf-8a3e-5039776c1eb0',
      name: 'Kaliganj Upazila Health Complex',
      nameBn: 'কালীগঞ্জ উপজেলা স্বাস্থ্য কমপ্লেক্স',
      physicalType: 'Building',
      type: 'HEALTH_FACILITY',
      partOf: 'Location/50c5a9c4-3cc1-4c8c-9a1b-a37ddaf85987'
    },
    {
      id: '0d8474da-0361-4d32-979e-af91f020309e',
      name: 'Dholashadhukhan Cc',
      nameBn: 'ধলাশাধুখান সিসি - কালিগঞ্জ',
      physicalType: 'Building',
      type: 'HEALTH_FACILITY',
      partOf: 'Location/50c5a9c4-3cc1-4c8c-9a1b-a37ddaf85987'
    }
  ],
  healthFacilityFilterLocation: '50c5a9c4-3cc1-4c8c-9a1b-a37ddaf85987',
  locations: [
    {
      id: '65cf62cb-864c-45e3-9c0d-5c70f0074cb4',
      name: 'Barisal',
      nameBn: 'বরিশাল',
      physicalType: 'Jurisdiction',
      jurisdictionType: 'DIVISION',
      type: 'ADMIN_STRUCTURE',
      partOf: 'Location/0'
    },
    {
      id: '8cbc862a-b817-4c29-a490-4a8767ff023c',
      name: 'Chittagong',
      nameBn: 'চট্টগ্রাম',
      physicalType: 'Jurisdiction',
      jurisdictionType: 'DIVISION',
      type: 'ADMIN_STRUCTURE',
      partOf: 'Location/0'
    },
    {
      id: '6e1f3bce-7bcb-4bf6-8e35-0d9facdf158b',
      name: 'Dhaka',
      nameBn: 'ঢাকা',
      physicalType: 'Jurisdiction',
      jurisdictionType: 'DIVISION',
      type: 'ADMIN_STRUCTURE',
      partOf: 'Location/0'
    },
    {
      id: '7304b306-1b0d-4640-b668-5bf39bc78f48',
      name: 'Khulna',
      nameBn: 'খুলনা',
      physicalType: 'Jurisdiction',
      jurisdictionType: 'DIVISION',
      type: 'ADMIN_STRUCTURE',
      partOf: 'Location/0'
    },
    {
      id: '75fdf3dc-0dd2-4b65-9c59-3afe5f49fc3a',
      name: 'Rajshahi',
      nameBn: 'রাজশাহী',
      physicalType: 'Jurisdiction',
      jurisdictionType: 'DIVISION',
      type: 'ADMIN_STRUCTURE',
      partOf: 'Location/0'
    },
    {
      id: '2b55d13f-f700-4373-8255-c0febd4733b6',
      name: 'Rangpur',
      nameBn: 'রংপুর',
      physicalType: 'Jurisdiction',
      jurisdictionType: 'DIVISION',
      type: 'ADMIN_STRUCTURE',
      partOf: 'Location/0'
    },
    {
      id: '59f7f044-84b8-4a6c-955d-271aa3e5af46',
      name: 'Sylhet',
      nameBn: 'সিলেট',
      physicalType: 'Jurisdiction',
      jurisdictionType: 'DIVISION',
      type: 'ADMIN_STRUCTURE',
      partOf: 'Location/0'
    },
    {
      id: '237f3404-d417-41fe-9130-3d049800a1e5',
      name: 'Mymensingh',
      nameBn: 'ময়মনসিংহ',
      physicalType: 'Jurisdiction',
      jurisdictionType: 'DIVISION',
      type: 'ADMIN_STRUCTURE',
      partOf: 'Location/0'
    },
    {
      id: 'bc4b9f99-0db3-4815-926d-89fd56889407',
      name: 'BARGUNA',
      nameBn: 'বরগুনা',
      physicalType: 'Jurisdiction',
      jurisdictionType: 'DISTRICT',
      type: 'ADMIN_STRUCTURE',
      partOf: 'Location/65cf62cb-864c-45e3-9c0d-5c70f0074cb4'
    },
    {
      id: 'dabffdf7-c174-4450-b306-5a3c2c0e2c0e',
      name: 'BARISAL',
      nameBn: 'বরিশাল',
      physicalType: 'Jurisdiction',
      jurisdictionType: 'DISTRICT',
      type: 'ADMIN_STRUCTURE',
      partOf: 'Location/65cf62cb-864c-45e3-9c0d-5c70f0074cb4'
    },
    {
      id: 'a5b61fc5-f0c9-4f54-a934-eba18f9110c2',
      name: 'BHOLA',
      nameBn: 'ভোলা',
      physicalType: 'Jurisdiction',
      jurisdictionType: 'DISTRICT',
      type: 'ADMIN_STRUCTURE',
      partOf: 'Location/65cf62cb-864c-45e3-9c0d-5c70f0074cb4'
    },
    {
      id: '5ffa5780-5ddf-4549-a391-7ad3ba2334d4',
      name: 'JHALOKATI',
      nameBn: 'ঝালকাঠি',
      physicalType: 'Jurisdiction',
      jurisdictionType: 'DISTRICT',
      type: 'ADMIN_STRUCTURE',
      partOf: 'Location/65cf62cb-864c-45e3-9c0d-5c70f0074cb4'
    },
    {
      id: 'c8dcf1fe-bf92-404b-81c0-31d6802a1a68',
      name: 'PATUAKHALI',
      nameBn: 'পটুয়াখালী ',
      physicalType: 'Jurisdiction',
      jurisdictionType: 'DISTRICT',
      type: 'ADMIN_STRUCTURE',
      partOf: 'Location/65cf62cb-864c-45e3-9c0d-5c70f0074cb4'
    },
    {
      id: '9c86160a-f704-464a-8b7d-9eae2b4cf1f9',
      name: 'PIROJPUR',
      nameBn: 'পিরোজপুর ',
      physicalType: 'Jurisdiction',
      jurisdictionType: 'DISTRICT',
      type: 'ADMIN_STRUCTURE',
      partOf: 'Location/65cf62cb-864c-45e3-9c0d-5c70f0074cb4'
    },
    {
      id: '1846f07e-6f5c-4507-b5d6-126716b0856b',
      name: 'BANDARBAN',
      nameBn: 'বান্দরবান',
      physicalType: 'Jurisdiction',
      jurisdictionType: 'DISTRICT',
      type: 'ADMIN_STRUCTURE',
      partOf: 'Location/8cbc862a-b817-4c29-a490-4a8767ff023c'
    },
    {
      id: 'cf141982-36a1-4308-9090-0445c311f5ae',
      name: 'BRAHMANBARIA',
      nameBn: 'ব্রাহ্মণবাড়িয়া',
      physicalType: 'Jurisdiction',
      jurisdictionType: 'DISTRICT',
      type: 'ADMIN_STRUCTURE',
      partOf: 'Location/8cbc862a-b817-4c29-a490-4a8767ff023c'
    },
    {
      id: '478f518e-8d86-439d-8618-5cfa8d3bf5dd',
      name: 'CHANDPUR',
      nameBn: 'চাঁদপুর',
      physicalType: 'Jurisdiction',
      jurisdictionType: 'DISTRICT',
      type: 'ADMIN_STRUCTURE',
      partOf: 'Location/8cbc862a-b817-4c29-a490-4a8767ff023c'
    },
    {
      id: 'db5faba3-8143-4924-a44a-8562ed5e0437',
      name: 'CHITTAGONG',
      nameBn: 'চট্টগ্রাম',
      physicalType: 'Jurisdiction',
      jurisdictionType: 'DISTRICT',
      type: 'ADMIN_STRUCTURE',
      partOf: 'Location/8cbc862a-b817-4c29-a490-4a8767ff023c'
    },
    {
      id: '5926982b-845c-4463-80aa-cbfb86762e0a',
      name: 'COMILLA',
      nameBn: 'কুমিল্লা',
      physicalType: 'Jurisdiction',
      jurisdictionType: 'DISTRICT',
      type: 'ADMIN_STRUCTURE',
      partOf: 'Location/8cbc862a-b817-4c29-a490-4a8767ff023c'
    },
    {
      id: 'a3455e64-164c-4bf4-b834-16640a85efd8',
      name: "COX'S BAZAR",
      nameBn: 'কক্সবাজার ',
      physicalType: 'Jurisdiction',
      jurisdictionType: 'DISTRICT',
      type: 'ADMIN_STRUCTURE',
      partOf: 'Location/8cbc862a-b817-4c29-a490-4a8767ff023c'
    },
    {
      id: '1dfc716a-c5f7-4d39-ad71-71d2a359210c',
      name: 'FENI',
      nameBn: 'ফেনী',
      physicalType: 'Jurisdiction',
      jurisdictionType: 'DISTRICT',
      type: 'ADMIN_STRUCTURE',
      partOf: 'Location/8cbc862a-b817-4c29-a490-4a8767ff023c'
    }
  ]
}

export const mockDeathApplicationDataWithoutFirstNames = {
  deceased: {
    iDType: 'NATIONAL_ID',
    iD: '1230000000000',
    firstNames: '',
    familyName: 'ইসলাম',
    firstNamesEng: '',
    familyNameEng: 'Islam',
    nationality: 'BGD',
    gender: 'male',
    maritalStatus: 'MARRIED',
    birthDate: '1987-02-16',
    permanentAddress: '',
    countryPermanent: 'BGD',
    statePermanent: '6d190887-c8a6-4818-a914-9cdbd36a1d70',
    districtPermanent: '22244d72-a10e-4edc-a5c4-4ffaed00f854',
    addressLine4Permanent: '7b9c37e3-8d04-45f9-88be-1f0fe481018a',
    addressLine3Permanent: '59c55c4c-fb7d-4334-b0ba-d1020ca5b549',
    addressLine2Permanent: '193 Kalibari Road',
    addressLine1Permanent: '193 Kalibari Road',
    postCodePermanent: '2200',
    currentAddress: '',
    currentAddressSameAsPermanent: true,
    country: 'BGD',
    state: '',
    district: '',
    addressLine4: '',
    addressLine3: '',
    addressLine2: '',
    addressLine1: '',
    postCode: ''
  },
  informant: {
    applicantIdType: 'NATIONAL_ID',
    iDType: 'NATIONAL_ID',
    applicantID: '1230000000000',
    applicantFirstNames: '',
    applicantFamilyName: 'ইসলাম',
    applicantFirstNamesEng: 'Islam',
    applicantFamilyNameEng: '',
    nationality: 'BGD',
    applicantBirthDate: '',
    applicantsRelationToDeceased: 'MOTHER',
    applicantPhone: '',
    currentAddress: '',
    country: 'BGD',
    state: '6d190887-c8a6-4818-a914-9cdbd36a1d70',
    district: '22244d72-a10e-4edc-a5c4-4ffaed00f854',
    addressLine4: '7b9c37e3-8d04-45f9-88be-1f0fe481018a',
    addressLine3: '59c55c4c-fb7d-4334-b0ba-d1020ca5b549',
    addressLine2: '',
    addressLine1: '193 Kalibari Road',
    postCode: '2200',
    permanentAddress: '',
    applicantPermanentAddressSameAsCurrent: true,
    countryPermanent: 'BGD',
    statePermanent: '',
    districtPermanent: '',
    addressLine4Permanent: '',
    addressLine3Permanent: '',
    addressLine2Permanent: '',
    addressLine1Permanent: '',
    postCodePermanent: ''
  },
  deathEvent: {
    deathDate: '1987-02-16',
    manner: 'ACCIDENT',
    deathPlace: '',
    deathPlaceAddress: 'OTHER',
    placeOfDeath: 'OTHER',
    deathLocation: '',
    addressType: '',
    country: 'BGD',
    state: 'state',
    district: 'district',
    addressLine4: 'upazila',
    addressLine3: 'union',
    addressLine2: '',
    addressLine1: '',
    postCode: ''
  },
  causeOfDeath: {
    causeOfDeathEstablished: false,
    methodOfCauseOfDeath: '',
    causeOfDeathCode: ''
  },
  documents: {
    image_uploader: [
      {
        data: 'base64-data',
        type: 'image/jpeg',
        optionValues: ["Proof of Deceased's ID", 'National ID (front)'],
        title: "Proof of Deceased's ID",
        description: 'National ID (front)'
      }
    ]
  }
}
