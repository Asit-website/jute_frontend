import React from 'react'
import { Box, Typography } from '@mui/material'
import ShoppingCartRoundedIcon from '@mui/icons-material/ShoppingCartRounded'

export default function Orders() {
  return (
    <Box className="page-enter">
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <ShoppingCartRoundedIcon sx={{ color: 'warning.main', fontSize: 32 }} />
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>Orders</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>Track and manage all orders</Typography>
        </Box>
      </Box>
      <Box sx={{ p: 4, border: '2px dashed', borderColor: 'divider', borderRadius: 3, textAlign: 'center' }}>
        <Typography variant="h6" sx={{ color: 'text.secondary' }}>Orders management coming soon...</Typography>
      </Box>
    </Box>
  )
}
