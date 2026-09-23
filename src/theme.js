import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#6C63FF',
      light: '#9B94FF',
      dark: '#4B43CC',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#FF6584',
      light: '#FF8FA3',
      dark: '#CC4E67',
      contrastText: '#ffffff',
    },
    success: {
      main: '#00C07F',
      light: '#33CC99',
      dark: '#009966',
    },
    warning: {
      main: '#F59E0B',
      light: '#FBC34A',
      dark: '#CC7A08',
    },
    error: {
      main: '#EF4444',
      light: '#F87171',
      dark: '#B91C1C',
    },
    background: {
      default: '#F4F6FB',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1A1A2E',
      // secondary: '#6B7280',
      secondary:'#181818'
    },
    divider: 'rgba(0, 0, 0, 0.08)',
  },
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    h1: { fontWeight: 800, letterSpacing: '-0.02em' },
    h2: { fontWeight: 700, letterSpacing: '-0.01em' },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { fontWeight: 600, textTransform: 'none', letterSpacing: '0.01em' },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: '10px 24px',
          fontSize: '0.875rem',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 20px rgba(108, 99, 255, 0.25)',
            transform: 'translateY(-1px)',
            transition: 'all 0.2s ease',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #6C63FF 0%, #9B94FF 100%)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: '1px solid rgba(0, 0, 0, 0.07)',
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
          transition: 'all 0.3s ease',
          '&:hover': {
            border: '1px solid rgba(108, 99, 255, 0.25)',
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 28px rgba(108, 99, 255, 0.12)',
          },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundImage: 'none',
          backgroundColor: '#111827',
          borderRight: 'none',
          boxShadow: '4px 0 24px rgba(0,0,0,0.15)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid rgba(0,0,0,0.07)',
          boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
            backgroundColor: '#F9FAFB',
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#6C63FF',
            },
          },
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          borderRadius: 8,
          fontSize: '0.75rem',
          backgroundColor: '#1A1A2E',
        },
      },
    },
  },
})

export default theme
