import gql from 'graphql-tag'
import { Action } from 'src/forms'

export const GET_BIRTH_REGISTRATION_FOR_REVIEW = gql`
  query data($id: ID!) {
    fetchBirthRegistration(id: $id) {
      _fhirIDMap
      id
      child {
        id
        name {
          use
          firstNames
          familyName
        }
        birthDate
        gender
      }
      mother {
        id
        name {
          use
          firstNames
          familyName
        }
        birthDate
        maritalStatus
        dateOfMarriage
        educationalAttainment
        nationality
        multipleBirth
        identifier {
          id
          type
          otherType
        }
        address {
          type
          line
          district
          state
          postalCode
          country
        }
        telecom {
          system
          value
        }
      }
      father {
        id
        name {
          use
          firstNames
          familyName
        }
        birthDate
        maritalStatus
        dateOfMarriage
        educationalAttainment
        nationality
        identifier {
          id
          type
          otherType
        }
        address {
          type
          line
          district
          state
          postalCode
          country
        }
        telecom {
          system
          value
        }
      }
      registration {
        id
        contact
        contactPhoneNumber
        attachments {
          data
          type
          contentType
          subject
        }
        status {
          comments {
            comment
          }
        }
        type
        trackingId
        registrationNumber
      }
      attendantAtBirth
      weightAtBirth
      birthType
      eventLocation {
        type
        address {
          line
          district
          state
          postalCode
          country
        }
      }
      presentAtBirthRegistration
    }
  }
`

export const GET_BIRTH_REGISTRATION_FOR_CERTIFICATE = gql`
  query data($id: ID!) {
    fetchBirthRegistration(id: $id) {
      _fhirIDMap
      id
      child {
        id
        name {
          use
          firstNames
          familyName
        }
        birthDate
        gender
      }
      mother {
        id
        name {
          use
          firstNames
          familyName
        }
        birthDate
        maritalStatus
        dateOfMarriage
        educationalAttainment
        nationality
        multipleBirth
        identifier {
          id
          type
          otherType
        }
        address {
          type
          line
          district
          state
          postalCode
          country
        }
        telecom {
          system
          value
        }
      }
      father {
        id
        name {
          use
          firstNames
          familyName
        }
        birthDate
        maritalStatus
        dateOfMarriage
        educationalAttainment
        nationality
        identifier {
          id
          type
          otherType
        }
        address {
          type
          line
          district
          state
          postalCode
          country
        }
        telecom {
          system
          value
        }
      }
      registration {
        id
        contact
        contactPhoneNumber
        attachments {
          data
          type
          contentType
          subject
        }
        status {
          comments {
            comment
          }

          location {
            name
            alias
          }
          office {
            name
            alias
            address {
              district
              state
            }
          }
        }

        trackingId
        registrationNumber
      }
      attendantAtBirth
      weightAtBirth
      birthType
      eventLocation {
        type
        address {
          line
          district
          state
          postalCode
          country
        }
      }
      presentAtBirthRegistration
    }
  }
`
export const COUNT_REGISTRATION_QUERY = gql`
  query data($locationIds: [String]) {
    countEventRegistrations(locationIds: $locationIds) {
      declared
      rejected
    }
  }
`
export function getBirthQueryMappings(action: Action) {
  switch (action) {
    case Action.LOAD_REVIEW_APPLICATION:
      return {
        query: GET_BIRTH_REGISTRATION_FOR_REVIEW,
        dataKey: 'fetchBirthRegistration'
      }
    case Action.LOAD_CERTIFICATE_APPLICATION:
      return {
        query: GET_BIRTH_REGISTRATION_FOR_CERTIFICATE,
        dataKey: 'fetchBirthRegistration'
      }
    default:
      return null
  }
}
