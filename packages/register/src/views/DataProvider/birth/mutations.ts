import gql from 'graphql-tag'
import { IForm, Action } from 'src/forms'
import { IDraft } from 'src/drafts'
import { draftToGqlTransformer } from 'src/transformer'

const SUBMIT_BIRTH_APPLICATION = gql`
  mutation submitMutation($details: BirthRegistrationInput!) {
    createBirthRegistration(details: $details)
  }
`
const REGISTER_BIRTH_APPLICATION = gql`
  mutation submitMutation($id: ID!, $details: BirthRegistrationInput) {
    markBirthAsRegistered(id: $id, details: $details)
  }
`
const REJECT_BIRTH_APPLICATION = gql`
  mutation submitMutation($id: String!, $reason: String!, $comment: String!) {
    markEventAsVoided(id: $id, reason: $reason, comment: $comment)
  }
`
const COLLECT_BIRTH_CERTIFICATE = gql`
  mutation submitMutation($id: ID!, $details: BirthRegistrationInput!) {
    markBirthAsCertified(id: $id, details: $details)
  }
`

export function getBirthMutationMappings(
  action: Action,
  payload?: any,
  form?: IForm,
  draft?: IDraft
) {
  switch (action) {
    case Action.SUBMIT_FOR_REVIEW:
      return {
        mutation: SUBMIT_BIRTH_APPLICATION,
        variables:
          form && draft
            ? {
                details: draftToGqlTransformer(form, draft.data)
              }
            : {},
        dataKey: 'createBirthRegistration'
      }
    case Action.REGISTER_APPLICATION:
      return {
        mutation: REGISTER_BIRTH_APPLICATION,
        variables:
          form && draft
            ? {
                id: draft.id,
                details: draftToGqlTransformer(form, draft.data)
              }
            : {},
        dataKey: 'markBirthAsRegistered'
      }
    case Action.REJECT_APPLICATION:
      return {
        mutation: REJECT_BIRTH_APPLICATION,
        variables: {
          ...payload
        },
        dataKey: 'markEventAsVoided'
      }
    case Action.COLLECT_CERTIFICATE:
      return {
        mutation: COLLECT_BIRTH_CERTIFICATE,
        variables: {
          ...payload
        },
        dataKey: 'markBirthAsCertified'
      }
    default:
      return null
  }
}
