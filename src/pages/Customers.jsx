import React from 'react'
import { Box, Typography, Chip } from '@mui/material'
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded'

export default function Customers() {
  return (
    <Box className="page-enter">
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <PeopleAltRoundedIcon sx={{ color: 'primary.main', fontSize: 32 }} />
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>Customers</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>Manage your customer database</Typography>
        </Box>
        <Chip label="1,284 Total" sx={{ ml: 'auto', bgcolor: 'rgba(108,99,255,0.15)', color: 'primary.light', fontWeight: 700 }} />
      </Box>
      <Box sx={{ p: 4, border: '2px dashed', borderColor: 'divider', borderRadius: 3, textAlign: 'center' }}>
        <Typography variant="h6" sx={{ color: 'text.secondary' }}>Customer list coming soon...</Typography>
      </Box>
    </Box>
  )
}
