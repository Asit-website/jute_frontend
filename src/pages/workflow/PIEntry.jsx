import React, { useState, useEffect } from 'react'
import {
  Box, Typography, Card, CardContent, Button, Chip, IconButton,
  TextField, InputAdornment, Dialog, DialogTitle, DialogContent,
  DialogActions, Grid, Stack, Divider, Tooltip, Avatar, MenuItem,
} from '@mui/material'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded'
import CategoryRoundedIcon from '@mui/icons-material/CategoryRounded'
import { getDb, saveDb } from './mockDb'

const BUYER_OPTIONS = ['Ramesh Traders', 'Bengal Jute Co.', 'Kolkata Mills', 'Agro Fibers Ltd.', 'Sona Traders', 'A.B. Co', 'Y.Z. Co']

const emptyProductRow = () => ({
  itemNo: '',
  buyerName: 'A.B. Co',
  qty: '',
  deliveryDate: '',
  printing: 'No'
})

const emptyForm = () => ({
  date: '',
  piNo: '',
  products: [emptyProductRow()]
})

const COL = '120px 140px 100px 1.5fr 110px 120px 90px 100px'
const HEADS = ['PI Date', 'PI No.', 'Item No', 'Buyer Name', 'PI Qty', 'Delivery Date', 'Printing', 'Actions']

export default function PIEntry() {
  const [db, setDb] = useState({ pis: [] })
  const [search, setSearch] = useState('')
  const [dialog, setDialog] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(emptyForm())
  const [deleteId, setDeleteId] = useState(null)

  useEffect(() => {
    const currentDb = getDb()
    if (currentDb.pis && currentDb.pis.length > 0 && !currentDb.pis[0].products[0].hasOwnProperty('itemNo')) {
      currentDb.pis = [
        {
          id: 'PI-1001',
          date: '2026-08-01',
          piNo: 'PI/26-27/001',
          products: [
            { itemNo: 'P01', buyerName: 'A.B. Co', qty: 15000, deliveryDate: '2026-08-25', printing: 'Yes' },
            { itemNo: 'P02', buyerName: 'Y.Z. Co', qty: 12000, deliveryDate: '2026-08-30', printing: 'No' },
          ]
        }
      ]
      saveDb(currentDb)
    }
    setDb(currentDb)
  }, [])

  const filtered = (db.pis || []).filter(p =>
    p.piNo.toLowerCase().includes(search.toLowerCase()) ||
    p.products.some(pr => pr.buyerName.toLowerCase().includes(search.toLowerCase()) || pr.itemNo.toLowerCase().includes(search.toLowerCase()))
  )

  const openAdd = () => { setEditId(null); setForm(emptyForm()); setDialog(true) }
  
  const openEdit = (pi) => {
    setEditId(pi.id)
    setForm({
      date: pi.date,
      piNo: pi.piNo,
      products: pi.products || [emptyProductRow()]
    })
    setDialog(true)
  }

  const handleSave = () => {
    if (!form.piNo || !form.date) return
    const newDb = { ...db }
    if (editId) {
      newDb.pis = newDb.pis.map(p => p.id === editId ? { ...form, id: editId } : p)
    } else {
      const newId = 'PI-' + Date.now().toString().slice(-4)
      newDb.pis.push({ ...form, id: newId })
    }
    saveDb(newDb)
    setDb(newDb)
    setDialog(false)
  }

  const handleDelete = () => {
    const newDb = { ...db, pis: db.pis.filter(p => p.id !== deleteId) }
    saveDb(newDb)
    setDb(newDb)
    setDeleteId(null)
  }

  const setRow = (idx, k) => (e) => {
    const products = [...form.products]
    products[idx] = { ...products[idx], [k]: e.target.value }
    setForm({ ...form, products })
  }

  const addRow = () => setForm({ ...form, products: [...form.products, emptyProductRow()] })
  const removeRow = (idx) => {
    if (form.products.length === 1) return
    setForm({ ...form, products: form.products.filter((_, i) => i !== idx) })
  }

  // Flat-map nested products to rows for clean table view
  const flatRows = []
  filtered.forEach(pi => {
    pi.products.forEach((pr, index) => {
      flatRows.push({
        ...pr,
        piId: pi.id,
        date: pi.date,
        piNo: pi.piNo,
        parentPi: pi,
        isFirst: index === 0,
        rowCount: pi.products.length
      })
    })
  })

  return (
    <Box className="page-enter">
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: 'rgba(108, 99, 255, 0.1)', color: '#6C63FF', borderRadius: 2, width: 46, height: 46 }}>
            <CategoryRoundedIcon />
          </Avatar>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', lineHeight: 1.2 }}>PI Entry</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>Create Proforma Invoice as per order received from Party</Typography>
          </Box>
        </Box>
        <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={openAdd}
          sx={{ borderRadius: 2, fontWeight: 700, background: 'linear-gradient(135deg,#6C63FF,#9B94FF)', boxShadow: '0 4px 14px rgba(108,99,255,0.35)' }}>
          Create PI
        </Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Total PIs Created', value: db.pis.length, c: '#6C63FF', b: 'rgba(108,99,255,0.08)' },
          { label: 'Total Qty Booked', value: db.pis.reduce((sum, p) => sum + p.products.reduce((s, pr) => s + Number(pr.qty || 0), 0), 0).toLocaleString(), c: '#00C07F', b: 'rgba(0,192,127,0.08)' },
          { label: 'Bags to Print', value: db.pis.reduce((sum, p) => sum + p.products.filter(pr => pr.printing === 'Yes').reduce((s, pr) => s + Number(pr.qty || 0), 0), 0).toLocaleString(), c: '#F59E0B', b: 'rgba(245,158,11,0.08)' },
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
          <TextField fullWidth size="small" placeholder="Search by PI No, Item No, Buyer Name..."
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

        {flatRows.length === 0 ? (
          <Box sx={{ py: 6, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>No PIs found.</Typography>
          </Box>
        ) : (
          <Stack divider={<Divider />}>
            {flatRows.map((row, rIdx) => (
              <Box key={`${row.piId}-${rIdx}`} sx={{ display: 'grid', gridTemplateColumns: COL, px: 2, py: 1.5, alignItems: 'center', '&:hover': { bgcolor: 'rgba(108,99,255,0.03)' }, transition: 'background 0.15s' }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>{row.date}</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>{row.piNo}</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>{row.itemNo || '—'}</Typography>
                <Typography variant="body2">{row.buyerName}</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>{Number(row.qty || 0).toLocaleString()}</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>{row.deliveryDate || '—'}</Typography>
                <Chip
                  label={row.printing === 'Yes' ? 'Yes' : 'No'}
                  size="small"
                  color={row.printing === 'Yes' ? 'secondary' : 'default'}
                  variant="outlined"
                  sx={{ fontSize: '0.65rem', height: 20, fontWeight: 700, width: 'fit-content' }}
                />
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <Tooltip title="Edit PI"><IconButton size="small" sx={{ color: 'primary.main' }} onClick={() => openEdit(row.parentPi)}><EditRoundedIcon fontSize="small" /></IconButton></Tooltip>
                  <Tooltip title="Delete PI"><IconButton size="small" sx={{ color: 'error.main' }} onClick={() => setDeleteId(row.piId)}><DeleteRoundedIcon fontSize="small" /></IconButton></Tooltip>
                </Box>
              </Box>
            ))}
          </Stack>
        )}
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialog} onClose={() => setDialog(false)} maxWidth="lg" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>{editId ? 'Edit PI Entry' : 'Create PI Entry'}</DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2.5 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#374151', mb: 0.5, display: 'block' }}>PI Date *</Typography>
              <TextField fullWidth size="small" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#374151', mb: 0.5, display: 'block' }}>PI No *</Typography>
              <TextField fullWidth size="small" value={form.piNo} onChange={e => setForm({ ...form, piNo: e.target.value })} placeholder="e.g. PI-26-27-001" />
            </Grid>

            {/* Products grid */}
            <Grid size={12}>
              <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 2, mt: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#6C63FF', mb: 1.5, display: 'block', textTransform: 'uppercase' }}>Product Items</Typography>
                
                {/* Headers */}
                <Box sx={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr 1.2fr 1.5fr 1fr 36px', gap: 1.5, pb: 1, borderBottom: '1px solid', borderColor: 'divider', mb: 1.5 }}>
                  {['ITEM No *', 'Buyer Name *', 'PI QTY *', 'Delivery Date *', 'printing *', ''].map(h => (
                    <Typography key={h} variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.62rem', textTransform: 'uppercase' }}>{h}</Typography>
                  ))}
                </Box>

                {/* Rows */}
                {form.products.map((row, idx) => (
                  <Box key={idx} sx={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr 1.2fr 1.5fr 1fr 36px', gap: 1.5, alignItems: 'center', mb: 1 }}>
                    <TextField size="small" value={row.itemNo} onChange={setRow(idx, 'itemNo')} placeholder="e.g. P01" />
                    
                    <TextField size="small" select value={row.buyerName} onChange={setRow(idx, 'buyerName')}>
                      {BUYER_OPTIONS.map(b => <MenuItem key={b} value={b}>{b}</MenuItem>)}
                    </TextField>

                    <TextField size="small" type="number" value={row.qty} onChange={setRow(idx, 'qty')} placeholder="0" />
                    
                    <TextField size="small" type="date" value={row.deliveryDate} onChange={setRow(idx, 'deliveryDate')} />
                    
                    <TextField size="small" select value={row.printing} onChange={setRow(idx, 'printing')}>
                      {['Yes', 'No'].map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                    </TextField>
                    
                    <IconButton size="small" onClick={() => removeRow(idx)} disabled={form.products.length === 1} sx={{ color: 'error.main' }}>
                      <DeleteRoundedIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}

                <Button startIcon={<AddRoundedIcon />} onClick={addRow} size="small" variant="outlined" sx={{ borderStyle: 'dashed', borderRadius: 2, fontWeight: 700, mt: 1 }}>
                  Add Multiple Item
                </Button>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button onClick={() => setDialog(false)} variant="outlined" sx={{ borderRadius: 2, fontWeight: 600 }}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" sx={{ borderRadius: 2, fontWeight: 700, background: 'linear-gradient(135deg,#6C63FF,#9B94FF)', boxShadow: 'none' }}>
            Save Entry
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete dialog */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Delete PI Entry?</DialogTitle>
        <DialogContent><Typography variant="body2" sx={{ color: 'text.secondary' }}>This action cannot be undone.</Typography></DialogContent>
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button onClick={() => setDeleteId(null)} variant="outlined" sx={{ borderRadius: 2, fontWeight: 600 }}>Cancel</Button>
          <Button onClick={handleDelete} variant="contained" color="error" sx={{ borderRadius: 2, fontWeight: 700 }}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
