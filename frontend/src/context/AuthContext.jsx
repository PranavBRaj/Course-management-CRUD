import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)

  // Restore session from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('user')
      if (stored) setUser(JSON.parse(stored))
    } catch (_) {
      // Corrupted storage – clear it
      localStorage.removeItem('user')
      localStorage.removeItem('token')
    } finally {
      setLoading(false)
    }
  }, [])

  async function login(username, password) {
    const res = await authAPI.login({ username, password })
    const { access_token, user: userData } = res.data.data
    localStorage.setItem('token', access_token)
    localStorage.setItem('user',  JSON.stringify(userData))
    setUser(userData)
    return userData
  }

  async function register(username, email, password, role) {
    await authAPI.register({ username, email, password, role })
  }

  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
