import client from './client'

export const txApi = {
  create:    (data)   => client.post('/transactions/', data),
  list:      (params) => client.get('/transactions/', { params }),
  get:       (id)     => client.get(`/transactions/${id}`),
  verifyOtp: (id, otp_code, email) =>
    client.post(`/transactions/${id}/verify-otp`, { email, otp_code, purpose: 'transaction' }),
  cancel:    (id)     => client.post(`/transactions/${id}/cancel`),
}
