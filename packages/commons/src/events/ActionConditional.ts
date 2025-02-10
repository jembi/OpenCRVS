import { z } from 'zod'
import {
  ShowConditional,
  HideConditional,
  EnableConditional
} from './Conditional'

export const ActionConditional = z.discriminatedUnion('type', [
  // Action can be shown / hidden
  ShowConditional,
  HideConditional,
  // Action can be shown to the user in the list but as disabled
  EnableConditional
])
