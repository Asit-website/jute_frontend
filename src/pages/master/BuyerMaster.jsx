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
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded'

const statusColor = { Active: 'success', Inactive: 'error' }

const emptyForm = {
  name: '',
  contactPerson: '',
  phone: '',
  email: '',
  address: '',
  city: '',
  state: '',
  gstin: '',
  pan: '',
  status: 'Active',
}

const initialData = [
  { id: 1, name: 'Ramesh Traders', contactPerson: 'Ramesh Shah', phone: '9830012345', email: 'ramesh@trades.com', address: '12 Bara Bazar St', city: 'Kolkata', state: 'West Bengal', gstin: '19AAACR1234A1Z1', pan: 'AAACR1234A', status: 'Active' },
  { id: 2, name: 'Bengal Jute Co.', contactPerson: 'Subhas Bose', phone: '9831122334', email: 'subhas@bengaljute.com', address: '45 Salt Lake Sec V', city: 'Kolkata', state: 'West Bengal', gstin: '19AAACB4567B1Z2', pan: 'AAACB4567B', status: 'Active' },
  { id: 3, name: 'Kolkata Mills', contactPerson: 'Amit Sen', phone: '9832233445', email: 'amit@kolkatamills.co.in', address: '78 Gariahat Rd', city: 'Kolkata', state: 'West Bengal', gstin: '19AAACK7890C1Z3', pan: 'AAACK7890C', status: 'Active' },
  { id: 4, name: 'Agro Fibers Ltd.', contactPerson: 'Pradip Roy', phone: '9833344556', email: 'pradip@agrofibers.com', address: '121 Belgharia Rd', city: 'Howrah', state: 'West Bengal', gstin: '19AAACA1122D1Z4', pan: 'AAACA1122D', status: 'Active' },
  { id: 5, name: 'Sona Traders', contactPerson: 'Sanjay Dutt', phone: '9834455667', email: 'sanjay@sonatraders.com', address: '56 Liluah Chowk', city: 'Howrah', state: 'West Bengal', gstin: '19AAACS3344E1Z5', pan: 'AAACS3344E', status: 'Inactive' },
]

const COL = '1.2fr 120px 110px 150px 1.5fr 150px 85px 100px'
const HEADS = ['Buyer Name', 'Contact Person', 'Phone', 'Email', 'Address', 'GSTIN', 'Status', 'Actions']

export default function BuyerMaster() {
  const [buyers, setBuyers] = useState(initialData)
  const [search, setSearch] = useState('')
  const [dialog, setDialog] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [deleteId, setDeleteId] = useState(null)

  const filtered = buyers.filter(b =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.city.toLowerCase().includes(search.toLowerCase()) ||
    b.contactPerson.toLowerCase().includes(search.toLowerCase()) ||
    b.gstin.toLowerCase().includes(search.toLowerCase())
  )

  const openAdd = () => { setEditId(null); setForm(emptyForm); setDialog(true) }
  const openEdit = (b) => { setEditId(b.id); setForm({ ...b }); setDialog(true) }
  const handleSave = () => {
    if (!form.name || !form.phone) return
    if (editId) {
      setBuyers(prev => prev.map(b => b.id === editId ? { ...form, id: editId } : b))
    } else {
      setBuyers(prev => [...prev, { ...form, id: Date.now() }])
    }
    setDialog(false)
  }
  const handleDelete = () => { setBuyers(prev => prev.filter(b => b.id !== deleteId)); setDeleteId(null) }
  const f = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  return (
    <Box className="page-enter">
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: 'rgba(108, 99, 255, 0.1)', color: '#6C63FF', borderRadius: 2, width: 46, height: 46 }}>
            <PeopleAltRoundedIcon />
          </Avatar>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', lineHeight: 1.2 }}>Buyer Master</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>Manage system buyers and clients details</Typography>
          </Box>
        </Box>
        <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={openAdd}
          sx={{ borderRadius: 2, fontWeight: 700, background: 'linear-gradient(135deg,#6C63FF,#9B94FF)', boxShadow: '0 4px 14px rgba(108,99,255,0.35)' }}>
          Add Buyer
        </Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Total Buyers', value: buyers.length, c: '#6C63FF', b: 'rgba(108,99,255,0.08)' },
          { label: 'Active Buyers', value: buyers.filter(b => b.status === 'Active').length, c: '#00C07F', b: 'rgba(0,192,127,0.08)' },
          { label: 'Inactive Buyers', value: buyers.filter(b => b.status === 'Inactive').length, c: '#EF4444', b: 'rgba(239,68,68,0.08)' },
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
          <TextField fullWidth size="small" placeholder="Search by buyer name, contact, city, gstin..."
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
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>No buyers found.</Typography>
          </Box>
        ) : (
          <Stack divider={<Divider />}>
            {filtered.map(b => (
              <Box key={b.id} sx={{ display: 'grid', gridTemplateColumns: COL, px: 2, py: 1.5, alignItems: 'center', '&:hover': { bgcolor: 'rgba(108,99,255,0.03)' }, transition: 'background 0.15s' }}>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>{b.name}</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>{b.city}, {b.state}</Typography>
                </Box>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>{b.contactPerson}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <PhoneRoundedIcon sx={{ fontSize: 13, color: '#9CA3AF' }} />
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>{b.phone}</Typography>
                </Box>
                <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 600 }} noWrap>{b.email}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <LocationOnRoundedIcon sx={{ fontSize: 13, color: '#9CA3AF' }} />
                  <Typography variant="caption" sx={{ color: 'text.secondary' }} noWrap>{b.address}</Typography>
                </Box>
                <Typography variant="caption" sx={{ color: 'text.primary', fontWeight: 600 }}>{b.gstin || '—'}</Typography>
                <Chip label={b.status} size="small" color={statusColor[b.status]} variant="outlined" sx={{ fontWeight: 600, fontSize: '0.65rem', height: 22, width: 'fit-content' }} />
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <Tooltip title="Edit"><IconButton size="small" sx={{ color: 'primary.main' }} onClick={() => openEdit(b)}><EditRoundedIcon fontSize="small" /></IconButton></Tooltip>
                  <Tooltip title="Delete"><IconButton size="small" sx={{ color: 'error.main' }} onClick={() => setDeleteId(b.id)}><DeleteRoundedIcon fontSize="small" /></IconButton></Tooltip>
                </Box>
              </Box>
            ))}
          </Stack>
        )}
        <Box sx={{ px: 2, py: 1.5, bgcolor: '#F8F9FC', borderTop: '1px solid', borderColor: 'divider' }}>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>Showing {filtered.length} of {buyers.length} buyers</Typography>
        </Box>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialog} onClose={() => setDialog(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>{editId ? 'Edit Buyer' : 'Add Buyer'}</DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2.5 }}>
          <Grid container spacing={2}>
            <Grid size={12}>
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#374151', mb: 0.5, display: 'block' }}>Buyer Name / Company Name *</Typography>
              <TextField fullWidth size="small" value={form.name} onChange={f('name')} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#374151', mb: 0.5, display: 'block' }}>Contact Person</Typography>
              <TextField fullWidth size="small" value={form.contactPerson} onChange={f('contactPerson')} />
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
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#374151', mb: 0.5, display: 'block' }}>GSTIN</Typography>
              <TextField fullWidth size="small" value={form.gstin} onChange={f('gstin')} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#374151', mb: 0.5, display: 'block' }}>PAN No</Typography>
              <TextField fullWidth size="small" value={form.pan} onChange={f('pan')} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#374151', mb: 0.5, display: 'block' }}>City</Typography>
              <TextField fullWidth size="small" value={form.city} onChange={f('city')} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#374151', mb: 0.5, display: 'block' }}>State</Typography>
              <TextField fullWidth size="small" value={form.state} onChange={f('state')} />
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
            {editId ? 'Save Changes' : 'Add Buyer'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Delete Buyer?</DialogTitle>
        <DialogContent><Typography variant="body2" sx={{ color: 'text.secondary' }}>This action cannot be undone.</Typography></DialogContent>
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button onClick={() => setDeleteId(null)} variant="outlined" sx={{ borderRadius: 2, fontWeight: 600 }}>Cancel</Button>
          <Button onClick={handleDelete} variant="contained" color="error" sx={{ borderRadius: 2, fontWeight: 700 }}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
