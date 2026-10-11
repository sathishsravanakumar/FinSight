import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || '/api'

const client = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Attach Bearer token if present
client.interceptors.request.use(config => {
  const token = localStorage.getItem('vf_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Unwrap data; surface error detail from FastAPI
client.interceptors.response.use(
  res => res.data,
  err => {
    const detail = err.response?.data?.detail
    const message = Array.isArray(detail)
      ? detail.map(d => d.msg).join('; ')
      : detail || err.message || 'Something went wrong'
    return Promise.reject(new Error(message))
  }
)

export default client
