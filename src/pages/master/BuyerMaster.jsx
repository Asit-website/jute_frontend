import React, { useState, useEffect } from 'react'
import {
  Box, Typography, Card, CardContent, Button, Chip, IconButton,
  TextField, InputAdornment, Dialog, DialogTitle, DialogContent,
  DialogActions, Grid, Stack, Divider, Tooltip, Avatar, TablePagination, Alert
} from '@mui/material'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded'
import PhoneRoundedIcon from '@mui/icons-material/PhoneRounded'
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded'
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded'
import { getMasters, saveMaster, deleteMaster } from '../workflow/mockDb'

const statusColor = { Active: 'success', Inactive: 'error' }

const emptyForm = {
  name: '',
  taxRegNo: '',
  address: '',
  contactDetails: '',
  status: 'Active',
}

const COL = '1.8fr 160px 2fr 160px 100px 100px'
const HEADS = ['Buyer Name', 'Tax reg No', 'Address', 'Contact Details', 'Status', 'Actions']

export default function BuyerMaster() {
  const [buyers, setBuyers] = useState([])
  const [search, setSearch] = useState('')
  const [dialog, setDialog] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [deleteId, setDeleteId] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(20)
  const [validationError, setValidationError] = useState('')

  useEffect(() => {
    getMasters('buyers').then(data => setBuyers(data)).catch(err => console.error(err))
  }, [])

  useEffect(() => {
    setPage(0)
  }, [search])

  const filtered = buyers.filter(b =>
    (b.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (b.taxRegNo || '').toLowerCase().includes(search.toLowerCase()) ||
    (b.contactDetails || '').toLowerCase().includes(search.toLowerCase())
  ).sort((a, b) => (a.name || '').localeCompare(b.name || ''))

  const openAdd = () => { setSubmitted(false); setEditId(null); setValidationError(''); setForm(emptyForm); setDialog(true) }
  const openEdit = (b) => { setSubmitted(false); setEditId(b.id); setValidationError(''); setForm({ ...b }); setDialog(true) }

  const handleSave = () => {
    setSubmitted(true)
    setValidationError('')
    if (!form.name || !form.contactDetails) return

    // Normalize and check for duplicate (ignoring spaces and dots)
    const normalize = (str) => (str || '').replace(/[\s\.]+/g, '').toLowerCase();
    const normName = normalize(form.name);
    const normTaxReg = normalize(form.taxRegNo);

    for (const b of buyers) {
      if (b.id === editId) continue;
      if (normalize(b.name) === normName) {
        setValidationError('Buyer Name can not be same.');
        return;
      }
      if (normTaxReg && normalize(b.taxRegNo) === normTaxReg) {
        setValidationError('Tax reg No can not be same.');
        return;
      }
    }

    saveMaster('buyers', form)
      .then(() => getMasters('buyers'))
      .then(data => {
        setBuyers(data)
        setDialog(false)
      })
      .catch(err => setValidationError(err.message))
  }

  const handleDelete = () => {
    if (!deleteId) return
    deleteMaster('buyers', deleteId)
      .then(() => getMasters('buyers'))
      .then(data => {
        setBuyers(data)
        setDeleteId(null)
      })
      .catch(err => alert(err.message))
  }
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

      {/* Search */}
      <Card sx={{ mb: 2.5 }}>
        <CardContent sx={{ p: 2 }}>
          <TextField fullWidth size="small" placeholder="Search by buyer name, tax reg no, contact details..."
            value={search} onChange={e => setSearch(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchRoundedIcon sx={{ color: '#9CA3AF', fontSize: 18 }} /></InputAdornment> }} />
        </CardContent>
      </Card>

      {/* Table */}
      <Card sx={{ overflowX: 'auto' }}>
        {/* Table Head */}
        <Box className="grid-table-row" sx={{ display: 'grid', gridTemplateColumns: COL, px: 2, py: 1.25, bgcolor: '#F8F9FC', borderBottom: '1px solid', borderColor: 'divider', minWidth: '950px' }}>
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
            {filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(b => (
              <Box key={b.id} className="grid-table-row" sx={{ display: 'grid', gridTemplateColumns: COL, px: 2, py: 1.5, alignItems: 'center', '&:hover': { bgcolor: 'rgba(108,99,255,0.03)' }, transition: 'background 0.15s', minWidth: '950px' }}>
                <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>{b.name}</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, fontFamily: 'monospace' }}>{b.taxRegNo || '—'}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <LocationOnRoundedIcon sx={{ fontSize: 13, color: '#9CA3AF' }} />
                  <Typography variant="caption" sx={{ color: 'text.secondary' }} noWrap>{b.address}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <PhoneRoundedIcon sx={{ fontSize: 13, color: '#9CA3AF' }} />
                  <Typography variant="caption" sx={{ color: 'text.secondary' }} noWrap>{b.contactDetails}</Typography>
                </Box>
                <Chip label={b.status} size="small" color={statusColor[b.status]} variant="outlined" sx={{ fontWeight: 600, fontSize: '0.65rem', height: 22, width: 'fit-content' }} />
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <Tooltip title="Edit"><IconButton size="small" sx={{ color: 'primary.main' }} onClick={() => openEdit(b)}><EditRoundedIcon fontSize="small" /></IconButton></Tooltip>
                  <Tooltip title="Delete"><IconButton size="small" sx={{ color: 'error.main' }} onClick={() => setDeleteId(b.id)}><DeleteRoundedIcon fontSize="small" /></IconButton></Tooltip>
                </Box>
              </Box>
            ))}
          </Stack>
        )}
        {filtered.length > 20 && (
          <TablePagination
            component="div"
            count={filtered.length}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10))
              setPage(0)
            }}
            rowsPerPageOptions={[10, 20, 50]}
          />
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
          {validationError && (
            <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>
              {validationError}
            </Alert>
          )}
          <Grid container spacing={2}>
            <Grid size={12}>
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#374151', mb: 0.5, display: 'block' }}>Buyer Name / Company Name *</Typography>
              <TextField fullWidth size="small" value={form.name} onChange={f('name')} placeholder="e.g. Ramesh Traders"
                error={submitted && !form.name} helperText={submitted && !form.name ? 'Required' : ''} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#374151', mb: 0.5, display: 'block' }}>Tax reg No</Typography>
              <TextField fullWidth size="small" value={form.taxRegNo} onChange={f('taxRegNo')} placeholder="e.g. 19AAACR1234A1Z1" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#374151', mb: 0.5, display: 'block' }}>Contact Details *</Typography>
              <TextField fullWidth size="small" value={form.contactDetails} onChange={f('contactDetails')} placeholder="e.g. Phone / Email"
                error={submitted && !form.contactDetails} helperText={submitted && !form.contactDetails ? 'Required' : ''} />
            </Grid>
            <Grid size={12}>
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#374151', mb: 0.5, display: 'block' }}>Address</Typography>
              <TextField fullWidth size="small" multiline rows={2} value={form.address} onChange={f('address')} placeholder="e.g. 12 Bara Bazar St, Kolkata" />
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
