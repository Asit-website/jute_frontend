import React from 'react'
import { Box, Typography } from '@mui/material'
import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded'

export default function Reports() {
  return (
    <Box className="page-enter">
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <BarChartRoundedIcon sx={{ color: 'success.main', fontSize: 32 }} />
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>Reports</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>Analytics and business insights</Typography>
        </Box>
      </Box>
      <Box sx={{ p: 4, border: '2px dashed', borderColor: 'divider', borderRadius: 3, textAlign: 'center' }}>
        <Typography variant="h6" sx={{ color: 'text.secondary' }}>Reports & analytics coming soon...</Typography>
      </Box>
    </Box>
  )
}
