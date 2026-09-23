import React, { useState, useEffect } from 'react'
import {
  Box, Typography, Card, CardContent, Button, Chip, IconButton,
  TextField, InputAdornment, Dialog, DialogTitle, DialogContent,
  DialogActions, Grid, Stack, Divider, Tooltip, Avatar, TablePagination,
  FormControlLabel, Checkbox, MenuItem, Select
} from '@mui/material'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded'
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded'
import EmailRoundedIcon from '@mui/icons-material/EmailRounded'
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded'
import { getMasters, saveMaster, deleteMaster } from './workflow/mockDb'

const roleColor = { admin: 'error', user: 'primary' }

const availablePermissions = [
  'Dashboard',
  'PI Entry',
  'PO Raw Material',
  'RM Stock IN',
  'Cutting',
  'Printer Job',
  'Stitcher Job',
  'Finishing',
  'Shipment',
  'Master',
  'Reports'
]

const emptyForm = {
  name: '',
  email: '',
  password: '',
  role: 'user',
  permissions: []
}

const COL = '2.5fr 4.5fr 1fr'
const HEADS = ['User Email', 'Sidebar Access (Permissions)', 'Actions']

export default function UserManagement() {
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [dialog, setDialog] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [deleteId, setDeleteId] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(20)

  const loadUsers = () => {
    getMasters('users')
      .then(data => setUsers(data))
      .catch(err => console.error(err))
  }

  useEffect(() => {
    loadUsers()
  }, [])

  useEffect(() => {
    setPage(0)
  }, [search])

  const filtered = users.filter(u =>
    (u.email || '').toLowerCase().includes(search.toLowerCase())
  )

  const openAdd = () => {
    setSubmitted(false)
    setEditId(null)
    setForm(emptyForm)
    setDialog(true)
  }

  const openEdit = (u) => {
    setSubmitted(false)
    setEditId(u.id)
    setForm({
      id: u.id,
      name: u.name || '',
      email: u.email,
      role: u.role,
      permissions: u.permissions || [],
      password: ''
    })
    setDialog(true)
  }

  const handleSave = () => {
    setSubmitted(true)
    if (!form.email || (!editId && !form.password)) return

    saveMaster('users', form)
      .then(() => {
        loadUsers()
        setDialog(false)
      })
      .catch(err => alert(err.message))
  }

  const handleDelete = () => {
    if (!deleteId) return
    deleteMaster('users', deleteId)
      .then(() => {
        loadUsers()
        setDeleteId(null)
      })
      .catch(err => alert(err.message))
  }

  const handlePermissionChange = (perm) => {
    const current = form.permissions || []
    if (current.includes(perm)) {
      setForm({ ...form, permissions: current.filter(p => p !== perm) })
    } else {
      setForm({ ...form, permissions: [...current, perm] })
    }
  }

  const handleSelectAllPermissions = () => {
    const current = form.permissions || []
    if (current.length === availablePermissions.length) {
      setForm({ ...form, permissions: [] })
    } else {
      setForm({ ...form, permissions: [...availablePermissions] })
    }
  }

  return (
    <Box className="page-enter">
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: 'rgba(108, 99, 255, 0.1)', color: '#6C63FF', borderRadius: 2, width: 46, height: 46 }}>
            <PeopleAltRoundedIcon />
          </Avatar>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', lineHeight: 1.2 }}>User Management</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>Create sub-users and configure sidebar access permissions</Typography>
          </Box>
        </Box>
        <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={openAdd}
          sx={{ borderRadius: 2, fontWeight: 700, background: 'linear-gradient(135deg,#6C63FF,#9B94FF)', boxShadow: '0 4px 14px rgba(108,99,255,0.35)' }}>
          Create User
        </Button>
      </Box>

      {/* Search */}
      <Card sx={{ mb: 2.5 }}>
        <CardContent sx={{ p: 2 }}>
          <TextField fullWidth size="small" placeholder="Search by email..."
            value={search} onChange={e => setSearch(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchRoundedIcon sx={{ color: '#9CA3AF', fontSize: 18 }} /></InputAdornment> }} />
        </CardContent>
      </Card>

      {/* Table */}
      <Card sx={{ overflowX: 'auto' }}>
        <Box className="grid-table-row" sx={{ display: 'grid', gridTemplateColumns: COL, px: 2, py: 1.25, bgcolor: '#F8F9FC', borderBottom: '1px solid', borderColor: 'divider', minWidth: '800px' }}>
          {HEADS.map(h => (
            <Typography key={h} variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: '0.05em' }}>{h}</Typography>
          ))}
        </Box>

        {filtered.length === 0 ? (
          <Box sx={{ py: 6, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>No users found.</Typography>
          </Box>
        ) : (
          <Stack divider={<Divider />}>
            {filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(u => (
              <Box key={u.id} className="grid-table-row" sx={{ display: 'grid', gridTemplateColumns: COL, px: 2, py: 1.5, alignItems: 'center', '&:hover': { bgcolor: 'rgba(108,99,255,0.03)' }, transition: 'background 0.15s', minWidth: '800px' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EmailRoundedIcon sx={{ fontSize: 15, color: '#9CA3AF' }} />
                  <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>{u.email}</Typography>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {u.permissions && u.permissions.length > 0 ? (
                    u.permissions.map(p => (
                      <Chip key={p} label={p} size="small" variant="outlined" sx={{ fontWeight: 600, fontSize: '0.62rem', height: 22 }} />
                    ))
                  ) : (
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>No sidebar access</Typography>
                  )}
                </Box>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <Tooltip title="Edit Permissions & Details">
                    <IconButton size="small" sx={{ color: 'primary.main' }} onClick={() => openEdit(u)}>
                      <EditRoundedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete User">
                    <IconButton size="small" sx={{ color: 'error.main' }} onClick={() => setDeleteId(u.id)}>
                      <DeleteRoundedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
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
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>Showing {filtered.length} of {users.length} users</Typography>
        </Box>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialog} onClose={() => setDialog(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 800, pb: 1.5 }}>
          {editId ? 'Edit User & Permissions' : 'Create Sub-User'}
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2.5, pb: 1.5 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#374151', mb: 0.5, display: 'block' }}>User Name</Typography>
              <TextField fullWidth size="small" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. John Doe" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#374151', mb: 0.5, display: 'block' }}>Email Address *</Typography>
              <TextField fullWidth size="small" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="e.g. operator@company.com"
                error={submitted && !form.email} helperText={submitted && !form.email ? 'Required' : ''} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#374151', mb: 0.5, display: 'block' }}>
                Password {editId ? '(Leave blank to keep same)' : '*'}
              </Typography>
              <TextField fullWidth size="small" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="••••••"
                error={submitted && !editId && !form.password} helperText={submitted && !editId && !form.password ? 'Required' : ''} />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, mt: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <ShieldRoundedIcon sx={{ fontSize: 18, color: '#6C63FF' }} />
                  Configure Sidebar Access
                </Typography>
                <Button size="small" onClick={handleSelectAllPermissions} sx={{ fontWeight: 700, textTransform: 'none' }}>
                  {(form.permissions || []).length === availablePermissions.length ? 'Clear All' : 'Select All'}
                </Button>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={1}>
                {availablePermissions.map(perm => {
                  const isChecked = (form.permissions || []).includes(perm)
                  return (
                    <Grid item xs={6} key={perm}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={isChecked}
                            onChange={() => handlePermissionChange(perm)}
                            size="small"
                            sx={{ color: 'rgba(108,99,255,0.4)', '&.Mui-checked': { color: '#6C63FF' } }}
                          />
                        }
                        label={<Typography variant="body2" sx={{ fontWeight: isChecked ? 600 : 400, fontSize: '0.85rem' }}>{perm}</Typography>}
                      />
                    </Grid>
                  )
                })}
              </Grid>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 0.5 }}>
          <Button onClick={() => setDialog(false)} sx={{ fontWeight: 700, color: 'text.secondary' }}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} sx={{ borderRadius: 2, fontWeight: 700, bgcolor: '#6C63FF', '&:hover': { bgcolor: '#5b52e0' } }}>Save User</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteId !== null} onClose={() => setDeleteId(null)} PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography variant="body2">Are you sure you want to delete this sub-user? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteId(null)} sx={{ fontWeight: 700, color: 'text.secondary' }}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDelete} sx={{ borderRadius: 2, fontWeight: 700 }}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
