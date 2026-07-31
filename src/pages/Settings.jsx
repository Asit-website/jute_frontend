import React from 'react'
import { Box, Typography } from '@mui/material'
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded'

export default function Settings() {
  return (
    <Box className="page-enter">
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <SettingsRoundedIcon sx={{ color: 'secondary.main', fontSize: 32 }} />
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>Settings</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>Configure your CRM preferences</Typography>
        </Box>
      </Box>
      <Box sx={{ p: 4, border: '2px dashed', borderColor: 'divider', borderRadius: 3, textAlign: 'center' }}>
        <Typography variant="h6" sx={{ color: 'text.secondary' }}>Settings panel coming soon...</Typography>
      </Box>
    </Box>
  )
}
