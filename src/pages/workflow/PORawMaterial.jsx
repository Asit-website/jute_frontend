import React, { useState, useEffect } from 'react'
import {
  Box, Typography, Card, CardContent, Button, IconButton,
  TextField, InputAdornment, Dialog, DialogTitle, DialogContent,
  DialogActions, Grid, Stack, Divider, Tooltip, Avatar, MenuItem, Chip,
  Autocomplete
} from '@mui/material'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded'
import ShoppingCartCheckoutRoundedIcon from '@mui/icons-material/ShoppingCartCheckoutRounded'
import { getDb, saveDb } from './mockDb'

const SUPPLIER_OPTIONS = ['Bengal Jute Suppliers', 'Green Fibre Works', 'Eastern Jute Traders', 'Sunrise Raw Materials']

const RM_CATALOG = {
  'Raw Jute Fibre A-Grade':      { color: 'Natural', unit: 'KG'   },
  'Raw Cotton Yarn 40s':         { color: 'White',   unit: 'KG'   },
  'Lamination Film Transparent': { color: 'Clear',   unit: 'ROLL' },
  'Printing Ink - Jet Black':    { color: 'Black',   unit: 'KG'   },
  'Hessian Cloth':               { color: 'Natural', unit: 'MTR'  },
  'Jute Cloth':                  { color: 'Golden',  unit: 'MTR'  },
}

const RM_OPTIONS = Object.keys(RM_CATALOG)
const UOMS = ['MTR', 'KG', 'PCS', 'ROLL', 'BAG', 'TON']

const emptyItemRow = () => ({
  name: 'Raw Jute Fibre A-Grade',
  color: 'Natural',
  qty: '',
  unit: 'KG',
  rate: ''
})

const emptyForm = () => ({
  date: '',
  poNo: '',
  supplier: 'Bengal Jute Suppliers',
  items: [emptyItemRow()]
})

const COL = '120px 140px 1.5fr 2fr 120px 100px'
const HEADS = ['PO Date', 'PO No.', 'Supplier', 'Ordered Materials', 'Total Value', 'Actions']

export default function PORawMaterial() {
  const [db, setDb] = useState({ pos: [] })
  const [search, setSearch] = useState('')
  const [dialog, setDialog] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(emptyForm())
  const [deleteId, setDeleteId] = useState(null)

  useEffect(() => {
    setDb(getDb())
  }, [])

  const filtered = (db.pos || []).filter(p =>
    p.poNo?.toLowerCase().includes(search.toLowerCase()) ||
    p.supplier?.toLowerCase().includes(search.toLowerCase())
  )

  const openAdd = () => { setEditId(null); setForm(emptyForm()); setDialog(true) }
  
  const openEdit = (po) => {
    setEditId(po.id)
    setForm({
      date: po.date,
      poNo: po.poNo || '',
      supplier: po.supplier,
      items: po.items || [emptyItemRow()]
    })
    setDialog(true)
  }

  const handleSave = () => {
    if (!form.poNo || !form.date) return
    const newDb = { ...db }
    if (editId) {
      newDb.pos = newDb.pos.map(p => p.id === editId ? { ...form, id: editId } : p)
    } else {
      const newId = 'PO-' + Date.now().toString().slice(-4)
      newDb.pos.push({ ...form, id: newId })
    }
    saveDb(newDb)
    setDb(newDb)
    setDialog(false)
  }

  const handleDelete = () => {
    const newDb = { ...db, pos: db.pos.filter(p => p.id !== deleteId) }
    saveDb(newDb)
    setDb(newDb)
    setDeleteId(null)
  }

  const handleRMSelect = (idx, value) => {
    const items = [...form.items]
    // value can be a catalog key (selected from list) or a custom typed string
    const defaults = RM_CATALOG[value] || { color: '', unit: 'MTR' }
    const isKnown = !!RM_CATALOG[value]
    items[idx] = {
      ...items[idx],
      name: value || '',
      // Only auto-fill color/unit if it's a known catalog item
      color: isKnown ? defaults.color : items[idx].color,
      unit: isKnown ? defaults.unit : items[idx].unit
    }
    setForm({ ...form, items })
  }

  const setRow = (idx, k) => (e) => {
    const items = [...form.items]
    items[idx] = { ...items[idx], [k]: e.target.value }
    setForm({ ...form, items })
  }

  const addRow = () => setForm({ ...form, items: [...form.items, emptyItemRow()] })
  const removeRow = (idx) => {
    if (form.items.length === 1) return
    setForm({ ...form, items: form.items.filter((_, i) => i !== idx) })
  }

  const calcTotal = (itemsList) => {
    return (itemsList || []).reduce((sum, item) => sum + (Number(item.qty || 0) * Number(item.rate || 0)), 0)
  }

  return (
    <Box className="page-enter">
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: 'rgba(108, 99, 255, 0.1)', color: '#6C63FF', borderRadius: 2, width: 46, height: 46 }}>
            <ShoppingCartCheckoutRoundedIcon />
          </Avatar>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', lineHeight: 1.2 }}>PO Raw Material</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>Create Purchase Order of Raw Material (Fabric, Jute, Fittings etc.)</Typography>
          </Box>
        </Box>
        <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={openAdd}
          sx={{ borderRadius: 2, fontWeight: 700, background: 'linear-gradient(135deg,#6C63FF,#9B94FF)', boxShadow: '0 4px 14px rgba(108,99,255,0.35)' }}>
          Create PO
        </Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Total POs Raised', value: db.pos.length, c: '#6C63FF', b: 'rgba(108,99,255,0.08)' },
          { label: 'Active Suppliers linked', value: [...new Set(db.pos.map(p => p.supplier))].length, c: '#00C07F', b: 'rgba(0,192,127,0.08)' },
          { label: 'Total Value Ordered', value: `₹${db.pos.reduce((sum, p) => sum + calcTotal(p.items), 0).toLocaleString('en-IN')}`, c: '#F59E0B', b: 'rgba(245,158,11,0.08)' },
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
          <TextField fullWidth size="small" placeholder="Search by PO No, Supplier Name..."
            value={search} onChange={e => setSearch(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchRoundedIcon sx={{ color: '#9CA3AF', fontSize: 18 }} /></InputAdornment> }} />
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <Box sx={{ display: 'grid', gridTemplateColumns: COL, px: 2, py: 1.25, bgcolor: '#F8F9FC', borderBottom: '1px solid', borderColor: 'divider' }}>
          {HEADS.map(h => (
            <Typography key={h} variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: '0.05em' }}>{h}</Typography>
          ))}
        </Box>

        {filtered.length === 0 ? (
          <Box sx={{ py: 6, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>No POs found.</Typography>
          </Box>
        ) : (
          <Stack divider={<Divider />}>
            {filtered.map(p => (
              <Box key={p.id} sx={{ display: 'grid', gridTemplateColumns: COL, px: 2, py: 1.5, alignItems: 'center', '&:hover': { bgcolor: 'rgba(108,99,255,0.03)' }, transition: 'background 0.15s' }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>{p.date}</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>{p.poNo || '—'}</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>{p.supplier}</Typography>
                <Box>
                  {p.items.map((it, idx) => (
                    <Typography key={idx} variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
                      • {it.name} ({it.color}) x {it.qty} {it.unit}
                    </Typography>
                  ))}
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#374151' }}>
                  ₹{calcTotal(p.items).toLocaleString('en-IN')}
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <Tooltip title="Edit"><IconButton size="small" sx={{ color: 'primary.main' }} onClick={() => openEdit(p)}><EditRoundedIcon fontSize="small" /></IconButton></Tooltip>
                  <Tooltip title="Delete"><IconButton size="small" sx={{ color: 'error.main' }} onClick={() => setDeleteId(p.id)}><DeleteRoundedIcon fontSize="small" /></IconButton></Tooltip>
                </Box>
              </Box>
            ))}
          </Stack>
        )}
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialog} onClose={() => setDialog(false)} maxWidth="lg" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>{editId ? 'Edit Raw Material PO' : 'Create Raw Material PO'}</DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2.5 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#374151', mb: 0.5, display: 'block' }}>PO Date *</Typography>
              <TextField fullWidth size="small" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#374151', mb: 0.5, display: 'block' }}>PO No. *</Typography>
              <TextField fullWidth size="small" value={form.poNo} onChange={e => setForm({ ...form, poNo: e.target.value })} placeholder="e.g. PO-2026-90" />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#374151', mb: 0.5, display: 'block' }}>Supplier Party *</Typography>
              <TextField fullWidth size="small" select value={form.supplier} onChange={e => setForm({ ...form, supplier: e.target.value })}>
                {SUPPLIER_OPTIONS.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </TextField>
            </Grid>

            {/* Product items sub-table */}
            <Grid size={12}>
              <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 2, mt: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#6C63FF', mb: 1.5, display: 'block', textTransform: 'uppercase' }}>Purchase Items</Typography>
                
                {/* Headers */}
                <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 1.2fr 1fr 1fr 36px', gap: 1.5, pb: 1, borderBottom: '1px solid', borderColor: 'divider', mb: 1.5 }}>
                  {['Name of Raw Material *', 'Colour', 'Unit *', 'Qty *', 'Rate *', ''].map(h => (
                    <Typography key={h} variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.62rem', textTransform: 'uppercase' }}>{h}</Typography>
                  ))}
                </Box>

                {/* Rows */}
                {form.items.map((row, idx) => (
                  <Box key={idx} sx={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 1.2fr 1fr 1fr 36px', gap: 1.5, alignItems: 'center', mb: 1 }}>
                    <Autocomplete
                      freeSolo
                      size="small"
                      options={RM_OPTIONS}
                      value={row.name}
                      onChange={(e, newVal) => handleRMSelect(idx, newVal || '')}
                      onInputChange={(e, newInput) => handleRMSelect(idx, newInput)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          size="small"
                          placeholder="Select or type material..."
                        />
                      )}
                    />
                    <TextField size="small" value={row.color} onChange={setRow(idx, 'color')} placeholder="e.g. Natural" />
                    <TextField size="small" select value={row.unit} onChange={setRow(idx, 'unit')}>
                      {UOMS.map(u => <MenuItem key={u} value={u}>{u}</MenuItem>)}
                    </TextField>
                    <TextField size="small" type="number" value={row.qty} onChange={setRow(idx, 'qty')} placeholder="0" />
                    <TextField size="small" type="number" value={row.rate} onChange={setRow(idx, 'rate')} placeholder="0.00" />
                    <IconButton size="small" onClick={() => removeRow(idx)} disabled={form.items.length === 1} sx={{ color: 'error.main' }}>
                      <DeleteRoundedIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}

                <Button startIcon={<AddRoundedIcon />} onClick={addRow} size="small" variant="outlined" sx={{ borderStyle: 'dashed', borderRadius: 2, fontWeight: 700, mt: 1 }}>
                  Add Item
                </Button>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button onClick={() => setDialog(false)} variant="outlined" sx={{ borderRadius: 2, fontWeight: 600 }}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" sx={{ borderRadius: 2, fontWeight: 700, background: 'linear-gradient(135deg,#6C63FF,#9B94FF)', boxShadow: 'none' }}>
            Save PO
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete dialog */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Delete PO?</DialogTitle>
        <DialogContent><Typography variant="body2" sx={{ color: 'text.secondary' }}>This action cannot be undone.</Typography></DialogContent>
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button onClick={() => setDeleteId(null)} variant="outlined" sx={{ borderRadius: 2, fontWeight: 600 }}>Cancel</Button>
          <Button onClick={handleDelete} variant="contained" color="error" sx={{ borderRadius: 2, fontWeight: 700 }}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
