import React, { useState } from 'react'
import {
  Box, Typography, Card, CardContent, Button, Chip, IconButton,
  TextField, InputAdornment, Dialog, DialogTitle, DialogContent,
  DialogActions, Grid, Stack, Divider, Tooltip, Avatar, MenuItem,
} from '@mui/material'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded'
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded'

const emptyForm = {
  sku: '',
  name: '',
  color: '',
  uom: 'MTR',
  description: '',
}

const initialData = [
  { id: 1, sku: 'JUT-HES-NAT', name: 'Hessian Cloth', color: 'Natural', uom: 'MTR', description: 'Natural Hessian Cloth 270 GSM' },
  { id: 2, sku: 'JUT-CLO-GLD', name: 'Jute Cloth', color: 'Golden', uom: 'MTR', description: 'Golden premium quality jute cloth' },
  { id: 3, sku: 'COT-SHT-WHT', name: 'Cotton Sheet', color: 'White', uom: 'MTR', description: 'White 420 GSM cotton sheet' },
  { id: 4, sku: 'COT-FAB-BLU', name: 'Cotton Fabric', color: 'Blue', uom: 'MTR', description: 'Dyed Blue cotton fabric 60"' },
  { id: 5, sku: 'JUT-FIB-AGR', name: 'Raw Jute Fiber', color: 'Brown', uom: 'KG', description: 'High strength raw jute fiber grade A' },
  { id: 6, sku: 'JUT-BAG-4060', name: 'Jute Bags 40x60cm', color: 'Natural', uom: 'PCS', description: 'Standard stitched jute sack 40x60cm' },
]

const UOMS = ['MTR', 'KG', 'PCS', 'ROLL', 'BAG']

const COL = '150px 1.5fr 120px 100px 2fr 100px'
const HEADS = ['Product No', 'Product Name', 'Color', 'Unit', 'Description', 'Actions']

export default function ItemMaster() {
  const [items, setItems] = useState(initialData)
  const [search, setSearch] = useState('')
  const [dialog, setDialog] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [deleteId, setDeleteId] = useState(null)

  const filtered = items.filter(i =>
    i.sku.toLowerCase().includes(search.toLowerCase()) ||
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    (i.color || '').toLowerCase().includes(search.toLowerCase()) ||
    (i.description || '').toLowerCase().includes(search.toLowerCase())
  )

  const openAdd = () => { setEditId(null); setForm(emptyForm); setDialog(true) }
  const openEdit = (item) => { setEditId(item.id); setForm({ ...item }); setDialog(true) }
  const handleSave = () => {
    if (!form.sku || !form.name) return
    if (editId) {
      setItems(prev => prev.map(i => i.id === editId ? { ...form, id: editId } : i))
    } else {
      setItems(prev => [...prev, { ...form, id: Date.now() }])
    }
    setDialog(false)
  }
  const handleDelete = () => { setItems(prev => prev.filter(i => i.id !== deleteId)); setDeleteId(null) }
  const f = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  return (
    <Box className="page-enter">
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: 'rgba(108, 99, 255, 0.1)', color: '#6C63FF', borderRadius: 2, width: 46, height: 46 }}>
            <Inventory2RoundedIcon />
          </Avatar>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', lineHeight: 1.2 }}>Product Master</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>Maintain product catalog details</Typography>
          </Box>
        </Box>
        <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={openAdd}
          sx={{ borderRadius: 2, fontWeight: 700, background: 'linear-gradient(135deg,#6C63FF,#9B94FF)', boxShadow: '0 4px 14px rgba(108,99,255,0.35)' }}>
          Add Product
        </Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Total Products', value: items.length, c: '#6C63FF', b: 'rgba(108,99,255,0.08)' },
          { label: 'Jute Products', value: items.filter(i => i.sku.startsWith('JUT')).length, c: '#F59E0B', b: 'rgba(245,158,11,0.08)' },
          { label: 'Cotton Products', value: items.filter(i => i.sku.startsWith('COT')).length, c: '#EC4899', b: 'rgba(236,72,153,0.08)' },
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
          <TextField fullWidth size="small" placeholder="Search by Product No, Product Name, color, description..."
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
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>No products found.</Typography>
          </Box>
        ) : (
          <Stack divider={<Divider />}>
            {filtered.map(i => (
              <Box key={i.id} sx={{ display: 'grid', gridTemplateColumns: COL, px: 2, py: 1.5, alignItems: 'center', '&:hover': { bgcolor: 'rgba(108,99,255,0.03)' }, transition: 'background 0.15s' }}>
                <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>{i.sku}</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>{i.name}</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>{i.color || '—'}</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>{i.uom}</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }} noWrap>{i.description || '—'}</Typography>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <Tooltip title="Edit"><IconButton size="small" sx={{ color: 'primary.main' }} onClick={() => openEdit(i)}><EditRoundedIcon fontSize="small" /></IconButton></Tooltip>
                  <Tooltip title="Delete"><IconButton size="small" sx={{ color: 'error.main' }} onClick={() => setDeleteId(i.id)}><DeleteRoundedIcon fontSize="small" /></IconButton></Tooltip>
                </Box>
              </Box>
            ))}
          </Stack>
        )}
        <Box sx={{ px: 2, py: 1.5, bgcolor: '#F8F9FC', borderTop: '1px solid', borderColor: 'divider' }}>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>Showing {filtered.length} of {items.length} products</Typography>
        </Box>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialog} onClose={() => setDialog(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>{editId ? 'Edit Product' : 'Add Product'}</DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2.5 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#374151', mb: 0.5, display: 'block' }}>Product No *</Typography>
              <TextField fullWidth size="small" value={form.sku} onChange={f('sku')} placeholder="e.g. JUT-BAG-4060" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#374151', mb: 0.5, display: 'block' }}>Product Name *</Typography>
              <TextField fullWidth size="small" value={form.name} onChange={f('name')} placeholder="e.g. Jute Bags 40x60cm" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#374151', mb: 0.5, display: 'block' }}>Color</Typography>
              <TextField fullWidth size="small" value={form.color} onChange={f('color')} placeholder="e.g. Natural" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#374151', mb: 0.5, display: 'block' }}>Unit *</Typography>
              <TextField fullWidth size="small" select value={form.uom} onChange={f('uom')}>
                {UOMS.map(u => <MenuItem key={u} value={u}>{u}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid size={12}>
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#374151', mb: 0.5, display: 'block' }}>Description</Typography>
              <TextField fullWidth size="small" multiline rows={2} value={form.description} onChange={f('description')} />
            </Grid>
          </Grid>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button onClick={() => setDialog(false)} variant="outlined" sx={{ borderRadius: 2, fontWeight: 600 }}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" sx={{ borderRadius: 2, fontWeight: 700, background: 'linear-gradient(135deg,#6C63FF,#9B94FF)', boxShadow: 'none' }}>
            {editId ? 'Save Changes' : 'Add Product'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Delete Product?</DialogTitle>
        <DialogContent><Typography variant="body2" sx={{ color: 'text.secondary' }}>This action cannot be undone.</Typography></DialogContent>
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button onClick={() => setDeleteId(null)} variant="outlined" sx={{ borderRadius: 2, fontWeight: 600 }}>Cancel</Button>
          <Button onClick={handleDelete} variant="contained" color="error" sx={{ borderRadius: 2, fontWeight: 700 }}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
