import React from 'react'
import {
  Box, Grid, Card, CardContent, Typography, Avatar,
  Chip, Stack, Divider,
} from '@mui/material'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'

import ShoppingCartRoundedIcon from '@mui/icons-material/ShoppingCartRounded'
import PrecisionManufacturingRoundedIcon from '@mui/icons-material/PrecisionManufacturingRounded'
import LocalShippingRoundedIcon from '@mui/icons-material/LocalShippingRounded'
import ContentCutRoundedIcon from '@mui/icons-material/ContentCutRounded'
import PrintRoundedIcon from '@mui/icons-material/PrintRounded'
import HandymanRoundedIcon from '@mui/icons-material/HandymanRounded'
import CancelRoundedIcon from '@mui/icons-material/CancelRounded'
import InventoryRoundedIcon from '@mui/icons-material/InventoryRounded'
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded'
import TrendingDownRoundedIcon from '@mui/icons-material/TrendingDownRounded'

const stats = [
  { label: 'Total Orders',             value: '1,248', change: '+12%', up: true,  icon: <ShoppingCartRoundedIcon />,          color: '#6C63FF', bg: 'rgba(108,99,255,0.1)' },
  { label: 'Orders in Production',     value: '384',   change: '+8%',  up: true,  icon: <PrecisionManufacturingRoundedIcon />, color: '#3B82F6', bg: 'rgba(59,130,246,0.1)' },
  { label: 'Ready for Dispatch',       value: '96',    change: '+5%',  up: true,  icon: <LocalShippingRoundedIcon />,          color: '#00C07F', bg: 'rgba(0,192,127,0.1)'  },
  { label: 'Material at Cutting',      value: '210',   change: '-3%',  up: false, icon: <ContentCutRoundedIcon />,             color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
  { label: 'Material with Printer',    value: '148',   change: '+2%',  up: true,  icon: <PrintRoundedIcon />,                  color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)' },
  { label: 'Material with Fabricator', value: '176',   change: '+6%',  up: true,  icon: <HandymanRoundedIcon />,               color: '#EC4899', bg: 'rgba(236,72,153,0.1)' },
  { label: 'Total Rejected Qty',       value: '34',    change: '-18%', up: false, icon: <CancelRoundedIcon />,                 color: '#EF4444', bg: 'rgba(239,68,68,0.1)'  },
  { label: 'Finished Goods Stock',     value: '620',   change: '+10%', up: true,  icon: <InventoryRoundedIcon />,              color: '#14B8A6', bg: 'rgba(20,184,166,0.1)' },
]

const orderTrend = [
  { month: 'Feb', orders: 820,  dispatched: 680  },
  { month: 'Mar', orders: 932,  dispatched: 750  },
  { month: 'Apr', orders: 901,  dispatched: 820  },
  { month: 'May', orders: 1054, dispatched: 900  },
  { month: 'Jun', orders: 1180, dispatched: 1020 },
  { month: 'Jul', orders: 1248, dispatched: 1100 },
]

const materialStatus = [
  { name: 'At Cutting',      value: 210, fill: '#F59E0B' },
  { name: 'With Printer',    value: 148, fill: '#8B5CF6' },
  { name: 'With Fabricator', value: 176, fill: '#EC4899' },
  { name: 'Ready Dispatch',  value: 96,  fill: '#00C07F' },
  { name: 'Finished Stock',  value: 620, fill: '#14B8A6' },
]

const weeklyOrders = [
  { day: 'Mon', new: 42, completed: 38, rejected: 2 },
  { day: 'Tue', new: 58, completed: 50, rejected: 4 },
  { day: 'Wed', new: 35, completed: 30, rejected: 1 },
  { day: 'Thu', new: 67, completed: 60, rejected: 3 },
  { day: 'Fri', new: 72, completed: 65, rejected: 5 },
  { day: 'Sat', new: 48, completed: 44, rejected: 2 },
  { day: 'Sun', new: 20, completed: 18, rejected: 1 },
]

const recentOrders = [
  { id: '#ORD-1248', customer: 'Ramesh Traders',  stage: 'Dispatch Ready',  status: 'success', qty: 500 },
  { id: '#ORD-1247', customer: 'Bengal Jute Co.', stage: 'With Fabricator', status: 'warning', qty: 320 },
  { id: '#ORD-1246', customer: 'Kolkata Mills',   stage: 'In Production',   status: 'info',    qty: 750 },
  { id: '#ORD-1245', customer: 'Agro Fibers Ltd.',stage: 'At Cutting',      status: 'warning', qty: 200 },
  { id: '#ORD-1244', customer: 'Sona Traders',    stage: 'Completed',       status: 'success', qty: 600 },
  { id: '#ORD-1243', customer: 'Delta Jute Works',stage: 'Rejected',        status: 'error',   qty: 40  },
]

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Box sx={{ bgcolor: '#1F2937', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 2, p: 1.5, minWidth: 140 }}>
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', display: 'block', mb: 0.5 }}>{label}</Typography>
        {payload.map((p) => (
          <Box key={p.name} sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
            <Typography variant="caption" sx={{ color: p.color }}>{p.name}</Typography>
            <Typography variant="caption" sx={{ color: '#fff', fontWeight: 700 }}>{p.value}</Typography>
          </Box>
        ))}
      </Box>
    )
  }
  return null
}

export default function Dashboard() {
  return (
    <Box className="page-enter">
      {/* Header */}
      <Box sx={{ mb: 3.5 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', mb: 0.5 }}>
          Dashboard
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Live overview of your production & order pipeline.
        </Typography>
      </Box>

      {/* ── Stat Cards — 4 per row ── */}
      <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
        {stats.map((s) => (
          <Grid key={s.label} size={{ xs: 6, md: 3 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                  <Avatar sx={{ bgcolor: s.bg, color: s.color, width: 44, height: 44, borderRadius: 2 }}>
                    {s.icon}
                  </Avatar>
                  <Chip
                    size="small"
                    icon={s.up ? <TrendingUpRoundedIcon style={{ fontSize: 13 }} /> : <TrendingDownRoundedIcon style={{ fontSize: 13 }} />}
                    label={s.change}
                    sx={{
                      bgcolor: s.up ? 'rgba(0,192,127,0.12)' : 'rgba(239,68,68,0.12)',
                      color: s.up ? '#00C07F' : '#EF4444',
                      fontWeight: 700, fontSize: '0.68rem', height: 22,
                      '& .MuiChip-icon': { color: 'inherit' },
                    }}
                  />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary', mb: 0.25 }}>
                  {s.value}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                  {s.label}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* ── Row 2: Order Trend + Material Pipeline (50-50) ── */}
      <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
        {/* Order Trend */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card sx={{ height: 340 }}>
            <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>Order Trend</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>New vs Dispatched — last 6 months</Typography>
                </Box>
                <Chip label="2026" size="small" variant="outlined" sx={{ fontWeight: 600, color: 'text.secondary', borderColor: 'divider' }} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={orderTrend} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gradOrders" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#6C63FF" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#6C63FF" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gradDispatched" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#00C07F" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#00C07F" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                    <Area type="monotone" dataKey="orders"     name="Total Orders" stroke="#6C63FF" strokeWidth={2.5} fill="url(#gradOrders)"     dot={{ r: 4, fill: '#6C63FF', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                    <Area type="monotone" dataKey="dispatched" name="Dispatched"    stroke="#00C07F" strokeWidth={2.5} fill="url(#gradDispatched)" dot={{ r: 4, fill: '#00C07F', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Material Pipeline */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card sx={{ height: 340 }}>
            <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>Material Pipeline</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>Current stage distribution</Typography>
              </Box>
              <Box sx={{ display: 'flex', flex: 1, gap: 2, alignItems: 'center' }}>
                {/* Donut */}
                <Box sx={{ flex: 1, height: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={materialStatus} cx="50%" cy="50%" innerRadius={60} outerRadius={95} paddingAngle={3} dataKey="value">
                        {materialStatus.map((entry, i) => (
                          <Cell key={i} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(val, name) => [val + ' units', name]} contentStyle={{ borderRadius: 10, border: '1px solid #E5E7EB', fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
                {/* Legend */}
                <Stack spacing={1.25} sx={{ minWidth: 160 }}>
                  {materialStatus.map((m) => (
                    <Box key={m.name} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: m.fill, flexShrink: 0 }} />
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>{m.name}</Typography>
                      </Box>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.primary' }}>{m.value}</Typography>
                    </Box>
                  ))}
                </Stack>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ── Row 3: Weekly Orders + Recent Orders (50-50) ── */}
      <Grid container spacing={2.5}>
        {/* Weekly Bar Chart */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card sx={{ height: 340 }}>
            <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ mb: 2.5 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>Weekly Orders</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>New · Completed · Rejected</Typography>
              </Box>
              <Box sx={{ flex: 1 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyOrders} margin={{ top: 4, right: 8, left: -20, bottom: 0 }} barSize={10} barGap={3}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
                    <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                    <Bar dataKey="new"       name="New"       fill="#6C63FF" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="completed" name="Completed" fill="#00C07F" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="rejected"  name="Rejected"  fill="#EF4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Orders */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card sx={{ height: 340 }}>
            <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>Recent Orders</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>Latest production pipeline</Typography>
                </Box>
                <Chip label="View All" size="small" color="primary" variant="outlined" sx={{ fontWeight: 600, cursor: 'pointer' }} />
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr 1.4fr 0.6fr', px: 1.5, mb: 1 }}>
                {['Order ID', 'Customer', 'Stage', 'Qty'].map((h) => (
                  <Typography key={h} variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: '0.05em' }}>
                    {h}
                  </Typography>
                ))}
              </Box>
              <Divider />

              <Box sx={{ flex: 1, overflow: 'auto' }}>
                <Stack divider={<Divider />}>
                  {recentOrders.map((o) => (
                    <Box
                      key={o.id}
                      sx={{
                        display: 'grid', gridTemplateColumns: '1fr 1.6fr 1.4fr 0.6fr',
                        alignItems: 'center', px: 1.5, py: 1.25,
                        '&:hover': { bgcolor: 'rgba(108,99,255,0.04)' },
                        transition: 'background 0.15s',
                      }}
                    >
                      <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>{o.id}</Typography>
                      <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.primary' }} noWrap>{o.customer}</Typography>
                      <Chip label={o.stage} size="small" color={o.status} variant="outlined" sx={{ fontWeight: 600, fontSize: '0.65rem', height: 20, width: 'fit-content' }} />
                      <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>{o.qty}</Typography>
                    </Box>
                  ))}
                </Stack>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
