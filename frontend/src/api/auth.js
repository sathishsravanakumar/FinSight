import client from './client'

export const authApi = {
  register:   (data)           => client.post('/auth/register', data),
  login:      (email, password) => client.post('/auth/login', { email, password }),
  me:         ()               => client.get('/auth/me'),
  sendOtp:    (email, purpose) => client.post('/auth/otp/send', { email, purpose }),
  verifyOtp:  (email, otp_code, purpose) =>
    client.post('/auth/otp/verify', { email, otp_code, purpose }),
}
