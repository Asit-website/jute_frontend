import React, { createContext, useContext, useState } from 'react'
import { Snackbar, Alert } from '@mui/material'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    // 1. Check if there are query parameters for impersonation
    const params = new URLSearchParams(window.location.search);
    const impEmail = params.get('companyEmail');
    const impName = params.get('companyName');
    const impId = params.get('companyId');

    if (impEmail && impName && impId) {
      const name = impEmail.split('@')[0];
      const displayName = name.charAt(0).toUpperCase() + name.slice(1);
      const impersonatedUser = {
        name: displayName,
        email: impEmail,
        role: 'admin',
        companyId: Number(impId),
        companyName: impName,
        isImpersonating: true
      };
      sessionStorage.setItem('jutecrm_user', JSON.stringify(impersonatedUser));
      return impersonatedUser;
    }

    // 2. Check sessionStorage
    const sessionSaved = sessionStorage.getItem('jutecrm_user');
    if (sessionSaved) return JSON.parse(sessionSaved);

    // 3. Check localStorage
    const saved = localStorage.getItem('jutecrm_user');
    if (saved) {
      sessionStorage.setItem('jutecrm_user', saved);
      return JSON.parse(saved);
    }
    return null;
  })

  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  })

  const showNotification = (message, severity = 'success') => {
    setNotification({ open: true, message, severity })
  }
  window.showNotification = showNotification;

  const handleClose = () => {
    setNotification(prev => ({ ...prev, open: false }))
  }

  const login = async (email, password) => {
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })

      if (!res.ok) {
        const err = await res.json()
        showNotification(err.error || 'Invalid credentials', 'error')
        return { success: false, message: err.error || 'Invalid credentials' }
      }

      const data = await res.json()
      localStorage.setItem('jutecrm_user', JSON.stringify(data.user))
      sessionStorage.setItem('jutecrm_user', JSON.stringify(data.user))
      setUser(data.user)
      showNotification('Logged in successfully!', 'success')
      return { success: true }
    } catch (err) {
      showNotification(err.message || 'Server connection error.', 'error')
      return { success: false, message: err.message || 'Server connection error.' }
    }
  }

  const logout = () => {
    localStorage.removeItem('jutecrm_user')
    sessionStorage.removeItem('jutecrm_user')
    setUser(null)
    showNotification('Logged out successfully.', 'info')
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, showNotification }}>
      {children}
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={handleClose}
          severity={notification.severity}
          sx={{ width: '100%', borderRadius: 2, fontWeight: 700 }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
