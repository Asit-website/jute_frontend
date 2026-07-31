import React, { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('jutecrm_user')
    return saved ? JSON.parse(saved) : null
  })

  const login = (email, password) => {
    // Accept any non-empty email & password — replace with real API call later
    const name = email.split('@')[0]
    const userData = {
      name: name.charAt(0).toUpperCase() + name.slice(1),
      email,
      role: 'Admin',
    }
    localStorage.setItem('jutecrm_user', JSON.stringify(userData))
    setUser(userData)
    return { success: true }
  }

  const logout = () => {
    localStorage.removeItem('jutecrm_user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
