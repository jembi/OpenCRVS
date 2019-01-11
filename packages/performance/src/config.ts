export const config = {
  API_GATEWAY_URL:
    process.env.REACT_APP_API_GATEWAY_URL || 'http://localhost:7070/',
  LANGUAGE: process.env.REACT_APP_LANGUAGE || 'en',
  COUNTRY: process.env.REACT_APP_COUNTRY || 'bgd',
  LOGIN_URL: process.env.REACT_APP_LOGIN_URL || 'http://localhost:3020',
  REGISTER_URL:
    process.env.REACT_APP_REGISTER_APP_URL || 'http://localhost:3000'
}
