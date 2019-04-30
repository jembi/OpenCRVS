export const REDIS_HOST = process.env.REDIS_HOST || 'localhost'
export const AUTH_HOST = process.env.AUTH_HOST || 'localhost'
export const AUTH_PORT = process.env.AUTH_PORT || 4040
export const USER_MANAGEMENT_URL =
  process.env.USER_MANAGEMENT_URL || 'http://localhost:3030/'

export const NOTIFICATION_SERVICE_URL =
  process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:2020/'

export const CERT_PRIVATE_KEY_PATH =
  (process.env.CERT_PRIVATE_KEY_PATH as string) ||
  '../../.secrets/private-key.pem'
export const CERT_PUBLIC_KEY_PATH =
  (process.env.CERT_PUBLIC_KEY_PATH as string) ||
  '../../.secrets/public-key.pem'

export const PRODUCTION = process.env.NODE_ENV === 'production'

export const CONFIG_TOKEN_EXPIRY_SECONDS = process.env
  .CONFIG_TOKEN_EXPIRY_SECONDS
  ? parseInt(process.env.CONFIG_TOKEN_EXPIRY_SECONDS, 10)
  : 604800 // 1 week

export const CONFIG_SMS_CODE_EXPIRY_SECONDS = process.env
  .CONFIG_SMS_CODE_EXPIRY_SECONDS
  ? parseInt(process.env.CONFIG_SMS_CODE_EXPIRY_SECONDS, 10)
  : 600

export const WEB_USER_JWT_AUDIENCES = [
  'opencrvs:auth-user',
  'opencrvs:user-mgnt-user',
  'opencrvs:hearth-user',
  'opencrvs:gateway-user',
  'opencrvs:notification-user',
  'opencrvs:workflow-user',
  'opencrvs:search-user',
  'opencrvs:metrics-user',
  'opencrvs:resources-user'
]
export const JWT_ISSUER = 'opencrvs:auth-service'
