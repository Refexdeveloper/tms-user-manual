import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { api, getToken, setToken } from './api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function boot() {
      try {
        const list = await api('/auth/users')
        setUsers(list.users || [])
        if (getToken()) {
          const me = await api('/auth/me')
          setUser(me.user)
        }
      } catch {
        setToken(null)
      } finally {
        setLoading(false)
      }
    }
    boot()
  }, [])

  async function login(userId) {
    const data = await api('/auth/login', { method: 'POST', body: { userId } })
    setToken(data.token)
    setUser(data.user)
    return data.user
  }

  function logout() {
    setToken(null)
    setUser(null)
  }

  const value = useMemo(
    () => ({ user, users, loading, login, logout }),
    [user, users, loading]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
