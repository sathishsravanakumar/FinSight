import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authApi } from '../api/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('vf_token'))
  const [loading, setLoading] = useState(true)

  // Fetch /auth/me on mount if token exists
  useEffect(() => {
    if (!token) { setLoading(false); return }
    authApi.me(token)
      .then(u => setUser(u))
      .catch(() => { setToken(null); localStorage.removeItem('vf_token') })
      .finally(() => setLoading(false))
  }, [token])

  const login = useCallback(async (email, password) => {
    const data = await authApi.login(email, password)
    localStorage.setItem('vf_token', data.access_token)
    setToken(data.access_token)
    setUser({ name: data.user_name, email: data.user_email, role: data.user_role })
    return data
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('vf_token')
    setToken(null)
    setUser(null)
  }, [])

  const refreshUser = useCallback(async () => {
    if (!token) return
    const u = await authApi.me(token)
    setUser(u)
  }, [token])

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
