import React, { createContext, useContext, useEffect, useState } from 'react'
import type { User } from '../types/api'

type AuthContextType = {
  user: User | null
  token: string | null
  login: (user: User, token: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const raw = localStorage.getItem('auth_user')
      return raw ? (JSON.parse(raw) as User) : null
    } catch {
      return null
    }
  })
  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem('auth_token') || null
    } catch {
      return null
    }
  })

  useEffect(() => {
    try {
      if (user) localStorage.setItem('auth_user', JSON.stringify(user))
      else localStorage.removeItem('auth_user')
      if (token) localStorage.setItem('auth_token', token)
      else localStorage.removeItem('auth_token')
    } catch {}
  }, [user, token])

  const login = (u: User, t: string) => {
    setUser(u)
    setToken(t)
  }

  const logout = () => {
    setUser(null)
    setToken(null)
  }

  return <AuthContext.Provider value={{ user, token, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
