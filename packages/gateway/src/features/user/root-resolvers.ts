import { COUNTRY } from 'src/constants'
import { GQLResolver } from 'src/graphql/schema'
import { getFromFhir } from 'src/features/fhir/utils'
import { getUserMobile, convertToLocal } from './utils'

export const resolvers: GQLResolver = {
  Query: {
    async getUser(_, { userId }, authHeader) {
      const userMgntUserID = userId as string
      const userMobileResponse = await getUserMobile(userMgntUserID, authHeader)
      const localMobile = convertToLocal(userMobileResponse.mobile, COUNTRY)
      const practitionerBundle = await getFromFhir(
        `/Practitioner?telecom=phone|${localMobile}`
      )
      const practitionerResource = practitionerBundle.entry[0].resource
      const practitionerRoleResponse = await getFromFhir(
        `/PractitionerRole?practitioner=${practitionerResource.id}`
      )
      const roleEntry = practitionerRoleResponse.entry[0].resource
      if (
        !roleEntry ||
        !roleEntry.code ||
        !roleEntry.code[0] ||
        !roleEntry.code[0].coding ||
        !roleEntry.code[0].coding[0] ||
        !roleEntry.code[0].coding[0].code
      ) {
        throw new Error('PractitionerRole has no role code')
      }
      const role = roleEntry.code[0].coding[0].code
      if (!roleEntry.location) {
        throw new Error('PractitionerRole has no locations associated')
      }

      const locations = roleEntry.location

      practitionerResource.catchmentArea = []
      practitionerResource.role = role
      for (const location of locations) {
        const splitRef = location.reference.split('/')
        const locationResponse: fhir.Location = await getFromFhir(
          `/Location/${splitRef[1]}`
        )
        if (
          !locationResponse ||
          !locationResponse.physicalType ||
          !locationResponse.physicalType.coding ||
          !locationResponse.physicalType.coding[0] ||
          !locationResponse.physicalType.coding[0].display
        ) {
          throw new Error('PractitionerRole has no physicalType')
        }
        if (locationResponse.physicalType.coding[0].display === 'Building') {
          practitionerResource.primaryOffice = locationResponse
        } else {
          practitionerResource.catchmentArea.push(locationResponse)
        }
      }

      return practitionerResource
    }
  }
}
