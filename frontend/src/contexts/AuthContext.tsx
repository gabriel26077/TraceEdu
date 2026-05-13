"use client"
import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import api, { setAuthToken } from '@/lib/api'

interface User {
  id: string
  name: string
  email: string
  roles: string[]
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (token: string, userData: any) => void
  logout: () => void
  isAuthenticated: boolean
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const savedToken = localStorage.getItem('traceedu_token')
    const savedUser = localStorage.getItem('traceedu_user')
    if (savedToken && savedUser) {
      setToken(savedToken)
      setUser(JSON.parse(savedUser))
      setAuthToken(savedToken)
    }
    setIsLoading(false)
  }, [])

  const login = (newToken: string, userData: any) => {
    setToken(newToken)
    const formattedUser = {
      id: userData.user_id,
      name: userData.name,
      email: userData.email || "", 
      roles: userData.global_roles || []
    }
    setUser(formattedUser)
    localStorage.setItem('traceedu_token', newToken)
    localStorage.setItem('traceedu_user', JSON.stringify(formattedUser))
    setAuthToken(newToken)
    router.push('/')
  }

  const logout = () => {
    try {
      // 1. Clear local storage first
      localStorage.removeItem('traceedu_token')
      localStorage.removeItem('traceedu_user')
      localStorage.removeItem('selected_school')
      localStorage.removeItem('selected_role')
      
      // 2. Clear API token
      setAuthToken(null)
      
      // 3. Update state
      setToken(null)
      setUser(null)
      
      // 4. Force a hard redirect to ensure everything is reset
      window.location.href = '/login'
    } catch (error) {
      console.error("Error during logout:", error)
      // Fallback redirect
      window.location.href = '/login'
    }
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
