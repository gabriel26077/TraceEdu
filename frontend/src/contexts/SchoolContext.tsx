"use client"

import React, { createContext, useContext, useState, useEffect } from "react"

interface School {
  uid: string
  name: string
}

// Simple representation of user roles
type GlobalRole = "platform_admin" | "user"
type SchoolRole = "admin" | "teacher" | "student" | "clerk"

interface UserProfile {
  uid: string
  name: string
  email: string
  globalRoles: GlobalRole[]
}

interface SchoolContextType {
  user: UserProfile | null
  currentSchool: School | null
  currentRole: SchoolRole | null
  setSchool: (school: School, role: SchoolRole) => void
  isLoading: boolean
  isSuperAdmin: boolean
}

const SchoolContext = createContext<SchoolContextType | undefined>(undefined)

import { useAuth } from "./AuthContext"

export function SchoolProvider({ children }: { children: React.ReactNode }) {
  const { user: authUser } = useAuth()
  
  // Map Auth user to UserProfile if needed, or just use authUser
  const user = authUser ? {
    uid: authUser.id,
    name: authUser.name,
    email: authUser.email,
    globalRoles: authUser.roles as GlobalRole[]
  } : null
  
  const [currentSchool, setCurrentSchool] = useState<School | null>(null)
  const [currentRole, setCurrentRole] = useState<SchoolRole | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const savedSchool = localStorage.getItem("selected_school")
    const savedRole = localStorage.getItem("selected_role")
    if (savedSchool && savedRole) {
      setCurrentSchool(JSON.parse(savedSchool))
      setCurrentRole(savedRole as SchoolRole)
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    if (!authUser) {
      setCurrentSchool(null)
      setCurrentRole(null)
    }
  }, [authUser])

  const setSchool = (school: School, role: SchoolRole) => {
    setCurrentSchool(school)
    setCurrentRole(role)
    localStorage.setItem("selected_school", JSON.stringify(school))
    localStorage.setItem("selected_role", role)
  }

  const isSuperAdmin = user?.globalRoles.includes("platform_admin") || false

  return (
    <SchoolContext.Provider value={{ 
      user, 
      currentSchool, 
      currentRole, 
      setSchool, 
      isLoading,
      isSuperAdmin 
    }}>
      {children}
    </SchoolContext.Provider>
  )
}

export function useSchool() {
  const context = useContext(SchoolContext)
  if (context === undefined) {
    throw new Error("useSchool must be used within a SchoolProvider")
  }
  return context
}
