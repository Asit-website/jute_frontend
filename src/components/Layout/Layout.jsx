import React, { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  Box, Drawer, AppBar, Toolbar, List, ListItem, ListItemButton,
  ListItemIcon, ListItemText, Typography, IconButton, Avatar,
  Badge, Tooltip, Divider, Collapse, useMediaQuery, useTheme,
} from '@mui/material'
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded'
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded'
import ShoppingCartRoundedIcon from '@mui/icons-material/ShoppingCartRounded'
import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded'
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded'
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded'
import MenuRoundedIcon from '@mui/icons-material/MenuRounded'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import GrassRoundedIcon from '@mui/icons-material/GrassRounded'
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded'
import CategoryRoundedIcon from '@mui/icons-material/CategoryRounded'
import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded'
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded'
import AgricultureRoundedIcon from '@mui/icons-material/AgricultureRounded'
import PrintRoundedIcon from '@mui/icons-material/PrintRounded'
import HandymanRoundedIcon from '@mui/icons-material/HandymanRounded'
import WarehouseRoundedIcon from '@mui/icons-material/WarehouseRounded'
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded'
import ScaleRoundedIcon from '@mui/icons-material/ScaleRounded'
import ShoppingCartCheckoutRoundedIcon from '@mui/icons-material/ShoppingCartCheckoutRounded'
import ContentCutRoundedIcon from '@mui/icons-material/ContentCutRounded'
import DoneAllRoundedIcon from '@mui/icons-material/DoneAllRounded'
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded'
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded'

const navItems = [
  { label: 'Dashboard',              icon: <DashboardRoundedIcon />,   path: '/dashboard'        },
  { label: 'Customer Order',         icon: <PeopleAltRoundedIcon />,   path: '/customer-order'   },
  { label: 'Raw Material Inventory', icon: <WarehouseRoundedIcon />,   path: '/raw-material'     },
  {
    label: 'Master',
    icon: <CategoryRoundedIcon />,
    children: [
      { label: 'Unit Master',         icon: <ScaleRoundedIcon />,        path: '/master/unit'          },
      { label: 'Product Master',      icon: <Inventory2RoundedIcon />,   path: '/master/item'          },
      { label: 'Purchase Item Master', icon: <ShoppingCartCheckoutRoundedIcon />, path: '/master/purchase-item' },
      { label: 'Buyer Master',        icon: <PeopleAltRoundedIcon />,    path: '/master/buyer'         },
      { label: 'Jute Sheet Supplier', icon: <AgricultureRoundedIcon />, path: '/master/jute-supplier' },
      { label: 'Cutters',             icon: <ContentCutRoundedIcon />,   path: '/master/cutters'       },
      { label: 'Printers',            icon: <PrintRoundedIcon />,        path: '/master/printers'      },
      { label: 'Fabricators',         icon: <HandymanRoundedIcon />,     path: '/master/fabricators'   },
      { label: 'Finishers',           icon: <DoneAllRoundedIcon />,      path: '/master/finishers'     },
    ],
  },
  { label: 'Reports',  icon: <BarChartRoundedIcon />,  path: '/reports'  },
  { label: 'Settings', icon: <SettingsRoundedIcon />,  path: '/settings' },
]

// ── Nav item styles ────────────────────────────────────────
const itemSx = (active, collapsed) => ({
  borderRadius: 2, py: 1.25, px: collapsed ? 1.5 : 2,
  justifyContent: collapsed ? 'center' : 'flex-start',
  background: active ? 'rgba(108,99,255,0.22)' : 'transparent',
  border: active ? '1px solid rgba(108,99,255,0.4)' : '1px solid transparent',
  '&:hover': { background: 'rgba(255,255,255,0.07)' },
})
const iconSx = (active, collapsed) => ({
  minWidth: collapsed ? 0 : 38,
  color: active ? '#9B94FF' : 'rgba(255,255,255,0.5)',
  justifyContent: 'center',
})
const textSx = (active) => ({
  '& .MuiListItemText-primary': {
    fontWeight: active ? 700 : 500, fontSize: '0.875rem',
    color: active ? '#FFFFFF' : 'rgba(255,255,255,0.6)',
  },
})

export default function Layout() {
  const theme    = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed]   = useState(false)
  const navigate  = useNavigate()
  const location  = useLocation()
  const { user, logout } = useAuth()

  const masterPaths = navItems.find(i => i.label === 'Master')?.children?.map(c => c.path) || []

  // Initialize open if already on a master child route
  const [masterOpen, setMasterOpen] = useState(() => masterPaths.includes(location.pathname))

  // Auto-open Master when navigating to a child route via URL
  React.useEffect(() => {
    if (masterPaths.includes(location.pathname) && !collapsed) {
      setMasterOpen(true)
    }
  }, [location.pathname, collapsed])

  const handleNavClick = (path) => {
    navigate(path)
    if (isMobile) setMobileOpen(false)
  }
  const handleLogout = () => { logout(); navigate('/login') }

  const drawerWidth = collapsed ? 72 : 260

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', py: 2 }}>
      {/* Logo Section */}
      <Box sx={{ px: collapsed ? 1.5 : 3, pb: 3, display: 'flex', alignItems: 'center', gap: 1.5, justifyContent: collapsed ? 'center' : 'flex-start' }}>
        <Box sx={{
          width: 40, height: 40, borderRadius: 2,
          background: 'linear-gradient(135deg, #6C63FF, #FF6584)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <GrassRoundedIcon sx={{ color: '#fff', fontSize: 22 }} />
        </Box>
        {!collapsed && (
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1, color: '#FFFFFF' }}>JuteCRM</Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.65rem' }}>Industry Management</Typography>
          </Box>
        )}
      </Box>

      <Divider sx={{ mb: 2, borderColor: 'rgba(255,255,255,0.08)' }} />

      {/* Nav Items */}
      <List sx={{ px: 1.5, flex: 1, overflow: 'auto' }}>
        {navItems.map((item) => {
          // ── Parent with children (Master) ──
          if (item.children) {
            const isGroupActive = item.children.some(c => location.pathname === c.path)
            return (
              <Box key={item.label}>
                <ListItem disablePadding sx={{ mb: 0.5 }}>
                  <Tooltip title={collapsed ? item.label : ""} placement="right">
                    <ListItemButton
                      onClick={() => setMasterOpen(o => !o)}
                      sx={itemSx(isGroupActive, collapsed)}
                    >
                      <ListItemIcon sx={iconSx(isGroupActive, collapsed)}>{item.icon}</ListItemIcon>
                      {!collapsed && <ListItemText primary={item.label} sx={textSx(isGroupActive)} />}
                      {!collapsed && (masterOpen
                        ? <ExpandLessRoundedIcon sx={{ color: 'rgba(255,255,255,0.4)', fontSize: 18 }} />
                        : <ExpandMoreRoundedIcon sx={{ color: 'rgba(255,255,255,0.4)', fontSize: 18 }} />
                      )}
                    </ListItemButton>
                  </Tooltip>
                </ListItem>

                {/* Sub-items */}
                <Collapse in={masterOpen && !collapsed} timeout="auto" unmountOnExit>
                  <List disablePadding sx={{ pl: 1.5, mb: 0.5 }}>
                    {item.children.map((child) => {
                      const childActive = location.pathname === child.path
                      return (
                        <ListItem key={child.label} disablePadding sx={{ mb: 0.5 }}>
                          {/* Left accent line */}
                          <Box sx={{
                            width: 2, height: 36, borderRadius: 1, mr: 1, flexShrink: 0,
                            bgcolor: childActive ? '#6C63FF' : 'rgba(255,255,255,0.1)',
                          }} />
                          <ListItemButton
                            onClick={() => handleNavClick(child.path)}
                            sx={{
                              borderRadius: 2, py: 1, px: 1.5,
                              background: childActive ? 'rgba(108,99,255,0.18)' : 'transparent',
                              border: childActive ? '1px solid rgba(108,99,255,0.35)' : '1px solid transparent',
                              '&:hover': { background: 'rgba(255,255,255,0.06)' },
                            }}
                          >
                            <ListItemIcon sx={{ minWidth: 32, color: childActive ? '#9B94FF' : 'rgba(255,255,255,0.4)' }}>
                              {React.cloneElement(child.icon, { sx: { fontSize: 18 } })}
                            </ListItemIcon>
                            <ListItemText
                              primary={child.label}
                              sx={{
                                '& .MuiListItemText-primary': {
                                  fontWeight: childActive ? 700 : 400,
                                  fontSize: '0.8rem',
                                  color: childActive ? '#FFFFFF' : 'rgba(255,255,255,0.55)',
                                },
                              }}
                            />
                          </ListItemButton>
                        </ListItem>
                      )
                    })}
                  </List>
                </Collapse>
              </Box>
            )
          }

          // ── Regular item ──
          const active = location.pathname === item.path
          return (
            <ListItem key={item.label} disablePadding sx={{ mb: 0.5 }}>
              <Tooltip title={collapsed ? item.label : ""} placement="right">
                <ListItemButton onClick={() => handleNavClick(item.path)} sx={itemSx(active, collapsed)}>
                  <ListItemIcon sx={iconSx(active, collapsed)}>{item.icon}</ListItemIcon>
                  {!collapsed && <ListItemText primary={item.label} sx={textSx(active)} />}
                  {active && !collapsed && <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#6C63FF' }} />}
                </ListItemButton>
              </Tooltip>
            </ListItem>
          )
        })}
      </List>

      <Divider sx={{ mx: 2, mb: 2, borderColor: 'rgba(255,255,255,0.08)' }} />

      {/* User Profile */}
      {collapsed ? (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Tooltip title={`${user?.name || 'Admin'} - Logout`} placement="right">
            <IconButton onClick={handleLogout} sx={{ p: 0.5 }}>
              <Avatar sx={{ width: 38, height: 38, background: 'linear-gradient(135deg, #6C63FF, #FF6584)', fontSize: '0.875rem', fontWeight: 700 }}>
                {user?.name?.charAt(0) || 'J'}
              </Avatar>
            </IconButton>
          </Tooltip>
        </Box>
      ) : (
        <Box sx={{ px: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ width: 38, height: 38, background: 'linear-gradient(135deg, #6C63FF, #FF6584)', fontSize: '0.875rem', fontWeight: 700 }}>
            {user?.name?.charAt(0) || 'J'}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#FFFFFF' }} noWrap>{user?.name || 'Admin'}</Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.45)' }} noWrap>{user?.email || ''}</Typography>
          </Box>
          <Tooltip title="Logout">
            <IconButton onClick={handleLogout} size="small" sx={{ color: 'rgba(255,255,255,0.4)', '&:hover': { color: '#FF6584', bgcolor: 'rgba(255,101,132,0.12)' } }}>
              <LogoutRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      )}
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: 'background.default' }}>
      {/* Sidebar — Desktop */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          width: drawerWidth,
          flexShrink: 0,
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            bgcolor: '#111827',
            overflowX: 'hidden',
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          }
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Sidebar — Mobile */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: 260,
            bgcolor: '#111827',
          }
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Main Content Area */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* AppBar */}
        <AppBar position="static" elevation={0} sx={{ bgcolor: '#FFFFFF', borderBottom: '1px solid', borderColor: 'divider' }}>
          <Toolbar sx={{ gap: 1 }}>
            {/* Mobile Sidebar Hamburger */}
            <IconButton sx={{ display: { md: 'none' }, color: 'text.secondary' }} onClick={() => setMobileOpen(true)}>
              <MenuRoundedIcon />
            </IconButton>
            
            {/* Desktop Sidebar Collapse Toggle */}
            <IconButton
              sx={{ display: { xs: 'none', md: 'inline-flex' }, color: 'text.secondary' }}
              onClick={() => setCollapsed(!collapsed)}
            >
              {collapsed ? <ChevronRightRoundedIcon /> : <ChevronLeftRoundedIcon />}
            </IconButton>

            <Box sx={{ flex: 1 }} />
            
            <Tooltip title="Search">
              <IconButton sx={{ color: 'text.secondary' }}><SearchRoundedIcon /></IconButton>
            </Tooltip>
            <Tooltip title="Notifications">
              <IconButton sx={{ color: 'text.secondary' }}>
                <Badge badgeContent={3} color="error"><NotificationsRoundedIcon /></Badge>
              </IconButton>
            </Tooltip>
            <Avatar sx={{ width: 34, height: 34, ml: 0.5, background: 'linear-gradient(135deg, #6C63FF, #FF6584)', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>
              {user?.name?.charAt(0) || 'J'}
            </Avatar>
          </Toolbar>
        </AppBar>

        {/* Page Content */}
        <Box component="main" sx={{ flex: 1, overflow: 'auto', p: { xs: 2, md: 3 } }} className="page-enter">
          <Outlet />
        </Box>
      </Box>
    </Box>
  )
}
