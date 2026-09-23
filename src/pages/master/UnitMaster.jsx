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
import ScaleRoundedIcon from '@mui/icons-material/ScaleRounded'
import { getMasters, saveMaster, deleteMaster } from '../workflow/mockDb'

const statusColor = { Active: 'success', Inactive: 'error' }

const emptyForm = {
  name: '',
  unitName: '',
  description: '',
  status: 'Active',
}

const COL = '150px 180px 2fr 120px 100px'
const HEADS = ['Unit Code', 'Unit Name', 'Description', 'Status', 'Actions']

export default function UnitMaster() {
  const [units, setUnits] = useState([])
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
    getMasters('units').then(data => setUnits(data)).catch(err => console.error(err))
  }, [])

  useEffect(() => {
    setPage(0)
  }, [search])

  const filtered = units.filter(u =>
    (u.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.unitName || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.description || '').toLowerCase().includes(search.toLowerCase())
  ).sort((a, b) => (a.name || '').localeCompare(b.name || ''))

  const openAdd = () => { setSubmitted(false); setEditId(null); setValidationError(''); setForm(emptyForm); setDialog(true) }
  const openEdit = (u) => { setSubmitted(false); setEditId(u.id); setValidationError(''); setForm({ ...u }); setDialog(true) }

  const handleSave = () => {
    setSubmitted(true)
    setValidationError('')
    if (!form.name || !form.unitName) return

    // Normalize and check for duplicate (ignoring spaces and dots)
    const normalize = (str) => (str || '').replace(/[\s\.]+/g, '').toLowerCase();
    const normName = normalize(form.name);
    const normUnitName = normalize(form.unitName);

    for (const u of units) {
      if (u.id === editId) continue;
      if (normalize(u.name) === normName) {
        setValidationError('Unit Code can not be same.');
        return;
      }
      if (normalize(u.unitName) === normUnitName) {
        setValidationError('Unit Name can not be same.');
        return;
      }
    }

    const rowData = { ...form, name: form.name.toUpperCase() }
    saveMaster('units', rowData)
      .then(() => getMasters('units'))
      .then(data => {
        setUnits(data)
        setDialog(false)
      })
      .catch(err => setValidationError(err.message))
  }

  const handleDelete = () => {
    if (!deleteId) return
    deleteMaster('units', deleteId)
      .then(() => getMasters('units'))
      .then(data => {
        setUnits(data)
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
            <ScaleRoundedIcon />
          </Avatar>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', lineHeight: 1.2 }}>Unit Master</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>Manage units of measurement (UOM)</Typography>
          </Box>
        </Box>
        <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={openAdd}
          sx={{ borderRadius: 2, fontWeight: 700, background: 'linear-gradient(135deg,#6C63FF,#9B94FF)', boxShadow: '0 4px 14px rgba(108,99,255,0.35)' }}>
          Add Unit
        </Button>
      </Box>

      {/* Search */}
      <Card sx={{ mb: 2.5 }}>
        <CardContent sx={{ p: 2 }}>
          <TextField fullWidth size="small" placeholder="Search by Unit Code, Unit Name, or description..."
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
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>No units found.</Typography>
          </Box>
        ) : (
          <Stack divider={<Divider />}>
            {filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(u => (
              <Box key={u.id} className="grid-table-row" sx={{ display: 'grid', gridTemplateColumns: COL, px: 2, py: 1.5, alignItems: 'center', '&:hover': { bgcolor: 'rgba(108,99,255,0.03)' }, transition: 'background 0.15s', minWidth: '950px' }}>
                <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>{u.name}</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>{u.unitName}</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>{u.description || '—'}</Typography>
                <Chip label={u.status} size="small" color={statusColor[u.status]} variant="outlined" sx={{ fontWeight: 600, fontSize: '0.65rem', height: 22, width: 'fit-content' }} />
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <Tooltip title="Edit"><IconButton size="small" sx={{ color: 'primary.main' }} onClick={() => openEdit(u)}><EditRoundedIcon fontSize="small" /></IconButton></Tooltip>
                  <Tooltip title="Delete"><IconButton size="small" sx={{ color: 'error.main' }} onClick={() => setDeleteId(u.id)}><DeleteRoundedIcon fontSize="small" /></IconButton></Tooltip>
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
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>Showing {filtered.length} of {units.length} units</Typography>
        </Box>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialog} onClose={() => setDialog(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>{editId ? 'Edit Unit' : 'Add Unit'}</DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2.5 }}>
          {validationError && (
            <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>
              {validationError}
            </Alert>
          )}
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#374151', mb: 0.5, display: 'block' }}>Unit Code *</Typography>
              <TextField fullWidth size="small" value={form.name} onChange={f('name')} placeholder="e.g. MTR"
                error={submitted && !form.name}
                helperText={submitted && !form.name ? 'Required' : ''} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#374151', mb: 0.5, display: 'block' }}>Unit Name *</Typography>
              <TextField fullWidth size="small" value={form.unitName} onChange={f('unitName')} placeholder="e.g. Meters"
                error={submitted && !form.unitName}
                helperText={submitted && !form.unitName ? 'Required' : ''} />
            </Grid>
            <Grid size={12}>
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#374151', mb: 0.5, display: 'block' }}>Description</Typography>
              <TextField fullWidth size="small" multiline rows={2} value={form.description} onChange={f('description')} placeholder="e.g. Length measurement unit" />
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
            {editId ? 'Save Changes' : 'Add Unit'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Delete Unit?</DialogTitle>
        <DialogContent><Typography variant="body2" sx={{ color: 'text.secondary' }}>This action cannot be undone.</Typography></DialogContent>
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button onClick={() => setDeleteId(null)} variant="outlined" sx={{ borderRadius: 2, fontWeight: 600 }}>Cancel</Button>
          <Button onClick={handleDelete} variant="contained" color="error" sx={{ borderRadius: 2, fontWeight: 700 }}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
