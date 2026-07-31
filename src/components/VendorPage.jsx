import React, { useState } from 'react'
import {
  Box, Typography, Card, CardContent, Button, Chip, IconButton,
  TextField, InputAdornment, Dialog, DialogTitle, DialogContent,
  DialogActions, Grid, Stack, Divider, Tooltip, Avatar,
} from '@mui/material'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded'
import PhoneRoundedIcon from '@mui/icons-material/PhoneRounded'
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded'

const statusColor = { Active: 'success', Inactive: 'error' }

const emptyForm = { name: '', contact: '', phone: '', email: '', address: '', city: '', status: 'Active' }

const COL = '1fr 120px 130px 130px 1fr 90px 100px'
const HEADS = ['Vendor Name', 'Contact Person', 'Phone', 'Email', 'Address', 'Status', 'Actions']

export default function VendorPage({ title, subtitle, icon, color, bg, initialData }) {
  const [vendors, setVendors] = useState(initialData)
  const [search, setSearch]   = useState('')
  const [dialog, setDialog]   = useState(false)
  const [editId, setEditId]   = useState(null)
  const [form, setForm]       = useState(emptyForm)
  const [deleteId, setDeleteId] = useState(null)

  const filtered = vendors.filter(v =>
    v.name.toLowerCase().includes(search.toLowerCase()) ||
    v.city.toLowerCase().includes(search.toLowerCase()) ||
    v.contact.toLowerCase().includes(search.toLowerCase())
  )

  const openAdd  = () => { setEditId(null); setForm(emptyForm); setDialog(true) }
  const openEdit = (v) => { setEditId(v.id); setForm({ ...v }); setDialog(true) }
  const handleSave = () => {
    if (!form.name || !form.phone) return
    if (editId) {
      setVendors(prev => prev.map(v => v.id === editId ? { ...form, id: editId } : v))
    } else {
      setVendors(prev => [...prev, { ...form, id: Date.now() }])
    }
    setDialog(false)
  }
  const handleDelete = () => { setVendors(prev => prev.filter(v => v.id !== deleteId)); setDeleteId(null) }
  const f = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  return (
    <Box className="page-enter">
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: bg, color, borderRadius: 2, width: 46, height: 46 }}>{icon}</Avatar>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', lineHeight: 1.2 }}>{title}</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>{subtitle}</Typography>
          </Box>
        </Box>
        <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={openAdd}
          sx={{ borderRadius: 2, fontWeight: 700, background: 'linear-gradient(135deg,#6C63FF,#9B94FF)', boxShadow: '0 4px 14px rgba(108,99,255,0.35)' }}>
          Add Vendor
        </Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Total Vendors', value: vendors.length,                                    c: color, b: bg           },
          { label: 'Active',        value: vendors.filter(v => v.status === 'Active').length,  c: '#00C07F', b: 'rgba(0,192,127,0.08)' },
          { label: 'Inactive',      value: vendors.filter(v => v.status === 'Inactive').length,c: '#EF4444', b: 'rgba(239,68,68,0.08)' },
        ].map(s => (
          <Grid key={s.label} size={{ xs: 6, md: 4 }}>
            <Card><CardContent sx={{ p: 2.5 }}>
              <Typography variant="h4" sx={{ fontWeight: 800, color: s.c }}>{s.value}</Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>{s.label}</Typography>
            </CardContent></Card>
          </Grid>
        ))}
      </Grid>

      {/* Search */}
      <Card sx={{ mb: 2.5 }}>
        <CardContent sx={{ p: 2 }}>
          <TextField fullWidth size="small" placeholder="Search by name, city, contact..."
            value={search} onChange={e => setSearch(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchRoundedIcon sx={{ color: '#9CA3AF', fontSize: 18 }} /></InputAdornment> }} />
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        {/* Table Head */}
        <Box sx={{ display: 'grid', gridTemplateColumns: COL, px: 2, py: 1.25, bgcolor: '#F8F9FC', borderBottom: '1px solid', borderColor: 'divider' }}>
          {HEADS.map(h => (
            <Typography key={h} variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: '0.05em' }}>{h}</Typography>
          ))}
        </Box>

        {filtered.length === 0 ? (
          <Box sx={{ py: 6, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>No vendors found.</Typography>
          </Box>
        ) : (
          <Stack divider={<Divider />}>
            {filtered.map(v => (
              <Box key={v.id} sx={{ display: 'grid', gridTemplateColumns: COL, px: 2, py: 1.5, alignItems: 'center', '&:hover': { bgcolor: 'rgba(108,99,255,0.03)' }, transition: 'background 0.15s' }}>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>{v.name}</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>{v.city}</Typography>
                </Box>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>{v.contact}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <PhoneRoundedIcon sx={{ fontSize: 13, color: '#9CA3AF' }} />
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>{v.phone}</Typography>
                </Box>
                <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 600 }} noWrap>{v.email}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <LocationOnRoundedIcon sx={{ fontSize: 13, color: '#9CA3AF' }} />
                  <Typography variant="caption" sx={{ color: 'text.secondary' }} noWrap>{v.address}</Typography>
                </Box>
                <Chip label={v.status} size="small" color={statusColor[v.status]} variant="outlined" sx={{ fontWeight: 600, fontSize: '0.65rem', height: 22, width: 'fit-content' }} />
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <Tooltip title="Edit"><IconButton size="small" sx={{ color: 'primary.main' }} onClick={() => openEdit(v)}><EditRoundedIcon fontSize="small" /></IconButton></Tooltip>
                  <Tooltip title="Delete"><IconButton size="small" sx={{ color: 'error.main' }} onClick={() => setDeleteId(v.id)}><DeleteRoundedIcon fontSize="small" /></IconButton></Tooltip>
                </Box>
              </Box>
            ))}
          </Stack>
        )}
        <Box sx={{ px: 2, py: 1.5, bgcolor: '#F8F9FC', borderTop: '1px solid', borderColor: 'divider' }}>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>Showing {filtered.length} of {vendors.length} vendors</Typography>
        </Box>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialog} onClose={() => setDialog(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>{editId ? 'Edit Vendor' : `Add ${title}`}</DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2.5 }}>
          <Grid container spacing={2}>
            <Grid size={12}>
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#374151', mb: 0.5, display: 'block' }}>Vendor / Company Name *</Typography>
              <TextField fullWidth size="small" value={form.name} onChange={f('name')} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#374151', mb: 0.5, display: 'block' }}>Contact Person</Typography>
              <TextField fullWidth size="small" value={form.contact} onChange={f('contact')} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#374151', mb: 0.5, display: 'block' }}>Phone *</Typography>
              <TextField fullWidth size="small" value={form.phone} onChange={f('phone')} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#374151', mb: 0.5, display: 'block' }}>Email</Typography>
              <TextField fullWidth size="small" type="email" value={form.email} onChange={f('email')} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#374151', mb: 0.5, display: 'block' }}>City</Typography>
              <TextField fullWidth size="small" value={form.city} onChange={f('city')} />
            </Grid>
            <Grid size={12}>
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#374151', mb: 0.5, display: 'block' }}>Address</Typography>
              <TextField fullWidth size="small" multiline rows={2} value={form.address} onChange={f('address')} />
            </Grid>
            <Grid size={12}>
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#374151', mb: 0.75, display: 'block' }}>Status</Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {['Active', 'Inactive'].map(s => (
                  <Chip key={s} label={s} clickable onClick={() => setForm({ ...form, status: s })}
                    color={form.status === s ? statusColor[s] : 'default'}
                    variant={form.status === s ? 'filled' : 'outlined'}
                    sx={{ fontWeight: 700 }} />
                ))}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button onClick={() => setDialog(false)} variant="outlined" sx={{ borderRadius: 2, fontWeight: 600 }}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" sx={{ borderRadius: 2, fontWeight: 700, background: 'linear-gradient(135deg,#6C63FF,#9B94FF)', boxShadow: 'none' }}>
            {editId ? 'Save Changes' : 'Add Vendor'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Delete Vendor?</DialogTitle>
        <DialogContent><Typography variant="body2" sx={{ color: 'text.secondary' }}>This action cannot be undone.</Typography></DialogContent>
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button onClick={() => setDeleteId(null)} variant="outlined" sx={{ borderRadius: 2, fontWeight: 600 }}>Cancel</Button>
          <Button onClick={handleDelete} variant="contained" color="error" sx={{ borderRadius: 2, fontWeight: 700 }}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
