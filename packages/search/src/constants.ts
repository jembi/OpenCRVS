export const HOST = process.env.HOST || '0.0.0.0'
export const PORT = process.env.PORT || 9090
export const ES_HOST = process.env.ES_HOST || 'localhost:9200'
export const HEARTH_URL = process.env.HEARTH_URL || 'http://localhost:3447/fhir'
export const CERT_PUBLIC_KEY_PATH =
  (process.env.CERT_PUBLIC_KEY_PATH as string) ||
  '../../.secrets/public-key.pem'
export const USER_MANAGEMENT_URL =
  process.env.USER_MANAGEMENT_URL || 'http://localhost:3030/'
// tslint:disable-next-line
export const MATCH_SCORE_THRESHOLD = 1.0
export const AUTH_URL = process.env.AUTH_URL || 'http://localhost:4040'
// Check if the token has been invalided in the auth service before it has expired
// This needs to be a string to make it easy to pass as an ENV var.
export const CHECK_INVALID_TOKEN = process.env.CHECK_INVALID_TOKEN || 'false'
