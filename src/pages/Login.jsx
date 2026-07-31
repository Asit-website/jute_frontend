import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  Alert,
  Divider,
  CircularProgress,
} from '@mui/material'
import EmailRoundedIcon from '@mui/icons-material/EmailRounded'
import LockRoundedIcon from '@mui/icons-material/LockRounded'
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded'
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded'
import GrassRoundedIcon from '@mui/icons-material/GrassRounded'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }

    setLoading(true)
    // Simulate network delay
    await new Promise((res) => setTimeout(res, 900))

    const result = login(email, password)
    setLoading(false)

    if (result.success) {
      navigate('/dashboard')
    } else {
      setError(result.message)
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        bgcolor: '#F4F6FB',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Left Panel — Branding */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flex: 1,
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          bgcolor: '#111827',
          px: 6,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative circles */}
        <Box sx={{
          position: 'absolute', top: -80, left: -80,
          width: 320, height: 320, borderRadius: '50%',
          background: 'rgba(108,99,255,0.12)',
        }} />
        <Box sx={{
          position: 'absolute', bottom: -60, right: -60,
          width: 260, height: 260, borderRadius: '50%',
          background: 'rgba(255,101,132,0.1)',
        }} />
        <Box sx={{
          position: 'absolute', top: '40%', right: -40,
          width: 160, height: 160, borderRadius: '50%',
          background: 'rgba(108,99,255,0.08)',
        }} />

        {/* Content */}
        <Box sx={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 400 }}>
          {/* Logo */}
          <Box
            sx={{
              width: 72, height: 72, borderRadius: 3, mx: 'auto', mb: 3,
              background: 'linear-gradient(135deg, #6C63FF, #FF6584)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 32px rgba(108,99,255,0.4)',
              animation: 'pulse-glow 3s infinite',
            }}
          >
            <GrassRoundedIcon sx={{ color: '#fff', fontSize: 36 }} />
          </Box>

          <Typography variant="h3" sx={{ fontWeight: 800, color: '#FFFFFF', mb: 1.5 }}>
            JuteCRM
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}
          >
            Complete CRM solution for the Jute industry. Manage customers, orders, and grow your business.
          </Typography>
        </Box>
      </Box>

      {/* Right Panel — Login Form */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: { xs: 3, sm: 5 },
          py: 6,
          bgcolor: '#F4F6FB',
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 400 }}>
          {/* Mobile Logo */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1.5, mb: 4 }}>
            <Box
              sx={{
                width: 44, height: 44, borderRadius: 2,
                background: 'linear-gradient(135deg, #6C63FF, #FF6584)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <GrassRoundedIcon sx={{ color: '#fff', fontSize: 22 }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#1A1A2E' }}>
              JuteCRM
            </Typography>
          </Box>

          <Typography variant="h4" sx={{ fontWeight: 800, color: '#1A1A2E', mb: 0.75 }}>
            Welcome back 👋
          </Typography>
          <Typography variant="body2" sx={{ color: '#6B7280', mb: 4 }}>
            Sign in to your account to continue
          </Typography>


          {/* Form */}
          <Box component="form" onSubmit={handleSubmit}>
            {error && (
              <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            {/* Email */}
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#374151', mb: 0.75 }}>
              Email Address
            </Typography>
            <TextField
              fullWidth
              id="login-email"
              type="email"
              placeholder=""
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ mb: 2.5 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailRoundedIcon sx={{ color: '#9CA3AF', fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
            />

            {/* Password */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#374151' }}>
                Password
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: '#6C63FF', fontWeight: 600, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
              >
                Forgot password?
              </Typography>
            </Box>
            <TextField
              fullWidth
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              placeholder=""
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockRoundedIcon sx={{ color: '#9CA3AF', fontSize: 20 }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      size="small"
                      sx={{ color: '#9CA3AF' }}
                    >
                      {showPassword ? <VisibilityOffRoundedIcon fontSize="small" /> : <VisibilityRoundedIcon fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />


            {/* Submit Button */}
            <Button
              type="submit"
              id="login-submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 700,
                borderRadius: 2.5,
                background: loading ? undefined : 'linear-gradient(135deg, #6C63FF 0%, #9B94FF 100%)',
                boxShadow: '0 4px 20px rgba(108,99,255,0.35)',
                '&:hover': {
                  boxShadow: '0 6px 28px rgba(108,99,255,0.5)',
                  transform: 'translateY(-1px)',
                },
                '&:active': { transform: 'translateY(0)' },
                transition: 'all 0.2s ease',
              }}
            >
              {loading ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : 'Sign In'}
            </Button>

            <Divider sx={{ my: 3, color: '#9CA3AF', fontSize: '0.75rem' }}>
              Secure Login
            </Divider>

            <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'block', textAlign: 'center' }}>
              🔒 Your data is protected with 256-bit encryption
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
