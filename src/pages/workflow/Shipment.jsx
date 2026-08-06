import React, { useState, useEffect } from 'react'
import {
  Box, Typography, Card, CardContent, Button, IconButton,
  TextField, InputAdornment, Dialog, DialogTitle, DialogContent,
  DialogActions, Grid, Stack, Divider, Tooltip, Avatar, MenuItem, Chip
} from '@mui/material'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded'
import LocalShippingRoundedIcon from '@mui/icons-material/LocalShippingRounded'
import { getDb, saveDb } from './mockDb'

const PARTY_OPTIONS = ['Ramesh Traders', 'Bengal Jute Co.', 'Kolkata Mills', 'Agro Fibers Ltd.', 'Sona Traders']

const COL = '110px 130px 1.5fr 100px 100px 100px 100px'
const HEADS = ['Ship Date', 'Invoice No.', 'Party / Client', 'PI No.', 'Item No', 'Qty Shipped', 'Actions']

const emptyForm = () => ({
  date: '',
  invNo: '',
  party: 'Ramesh Traders',
  piNo: '',
  itemNo: '',
  qty: ''
})

export default function Shipment() {
  const [db, setDb] = useState({ pis: [], shipments: [] })
  const [search, setSearch] = useState('')
  const [dialog, setDialog] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(emptyForm())
  const [deleteId, setDeleteId] = useState(null)

  useEffect(() => {
    const currentDb = getDb()
    
    // Safety check schema adjustment for Shipments
    if (currentDb.shipments && currentDb.shipments.length > 0 && !currentDb.shipments[0].hasOwnProperty('itemNo')) {
      currentDb.shipments = [
        {
          id: 'SHIP-8001',
          date: '2026-08-08',
          invNo: 'INV-JUT-1002',
          party: 'Ramesh Traders',
          piNo: 'PI/26-27/001',
          itemNo: 'P01',
          qty: 2800
        }
      ]
      saveDb(currentDb)
    }
    setDb(currentDb)
  }, [])

  const filtered = (db.shipments || []).filter(s =>
    s.invNo?.toLowerCase().includes(search.toLowerCase()) ||
    s.party?.toLowerCase().includes(search.toLowerCase()) ||
    s.piNo?.toLowerCase().includes(search.toLowerCase()) ||
    s.itemNo?.toLowerCase().includes(search.toLowerCase())
  )

  const openAdd = () => {
    setEditId(null)
    const defaultPi = db.pis[0]?.piNo || ''
    const selectedPi = db.pis.find(p => p.piNo === defaultPi)
    const defaultItemNo = selectedPi && selectedPi.products.length > 0 ? selectedPi.products[0].itemNo : ''
    
    setForm({
      ...emptyForm(),
      piNo: defaultPi,
      itemNo: defaultItemNo
    })
    setDialog(true)
  }

  const openEdit = (ship) => {
    setEditId(ship.id)
    setForm({ ...ship })
    setDialog(true)
  }

  const handlePIChange = (piNoValue) => {
    const selectedPi = db.pis.find(p => p.piNo === piNoValue)
    const defaultItemNo = selectedPi && selectedPi.products.length > 0 ? selectedPi.products[0].itemNo : ''
    setForm({
      ...form,
      piNo: piNoValue,
      itemNo: defaultItemNo
    })
  }

  const handleSave = () => {
    if (!form.date || !form.invNo || !form.qty || !form.piNo || !form.itemNo) return
    const newDb = { ...db }
    if (editId) {
      newDb.shipments = newDb.shipments.map(s => s.id === editId ? { ...form, id: editId } : s)
    } else {
      const newId = 'SHIP-' + Date.now().toString().slice(-4)
      newDb.shipments.push({ ...form, id: newId })
    }
    saveDb(newDb)
    setDb(newDb)
    setDialog(false)
  }

  const handleDelete = () => {
    const newDb = { ...db, shipments: db.shipments.filter(s => s.id !== deleteId) }
    saveDb(newDb)
    setDb(newDb)
    setDeleteId(null)
  }

  const f = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  // Active products list for selected PI
  const selectedPi = db.pis.find(p => p.piNo === form.piNo)
  const activeItemNos = selectedPi ? selectedPi.products.map(pr => pr.itemNo) : []

  return (
    <Box className="page-enter">
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: 'rgba(108, 99, 255, 0.1)', color: '#6C63FF', borderRadius: 2, width: 46, height: 46 }}>
            <LocalShippingRoundedIcon />
          </Avatar>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', lineHeight: 1.2 }}>Shipment Details</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>Log final shipments, invoices, and quantities dispatched to parties</Typography>
          </Box>
        </Box>
        <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={openAdd}
          sx={{ borderRadius: 2, fontWeight: 700, background: 'linear-gradient(135deg,#6C63FF,#9B94FF)', boxShadow: '0 4px 14px rgba(108,99,255,0.35)' }}>
          Create Shipment
        </Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Total Shipments Logged', value: db.shipments.length, c: '#6C63FF', b: 'rgba(108,99,255,0.08)' },
          { label: 'Total Shipped Quantity', value: `${db.shipments.reduce((sum, s) => sum + Number(s.qty || 0), 0).toLocaleString()} pcs`, c: '#00C07F', b: 'rgba(0,192,127,0.08)' },
          { label: 'Active Invoices cleared', value: db.shipments.filter(s => s.invNo).length, c: '#F59E0B', b: 'rgba(245,158,11,0.08)' },
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
          <TextField fullWidth size="small" placeholder="Search by Invoice No, PI No, Item No, Party..."
            value={search} onChange={e => setSearch(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchRoundedIcon sx={{ color: '#9CA3AF', fontSize: 18 }} /></InputAdornment> }} />
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <Box sx={{ display: 'grid', gridTemplateColumns: COL, px: 2, py: 1.25, bgcolor: '#F8F9FC', borderBottom: '1px solid', borderColor: 'divider' }}>
          {HEADS.map(h => (
            <Typography key={h} variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.65rem' }}>{h}</Typography>
          ))}
        </Box>

        {filtered.length === 0 ? (
          <Box sx={{ py: 6, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>No shipments logged.</Typography>
          </Box>
        ) : (
          <Stack divider={<Divider />}>
            {filtered.map(s => (
              <Box key={s.id} sx={{ display: 'grid', gridTemplateColumns: COL, px: 2, py: 1.5, alignItems: 'center', '&:hover': { bgcolor: 'rgba(108,99,255,0.03)' } }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>{s.date}</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>{s.invNo}</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>{s.party}</Typography>
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>{s.piNo}</Typography>
                <Chip label={s.itemNo || '—'} size="small" sx={{ fontWeight: 700, fontSize: '0.7rem', width: 'fit-content' }} />
                <Typography variant="body2" sx={{ fontWeight: 700 }}>{Number(s.qty || 0).toLocaleString()} pcs</Typography>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <Tooltip title="Edit"><IconButton size="small" sx={{ color: 'primary.main' }} onClick={() => openEdit(s)}><EditRoundedIcon fontSize="small" /></IconButton></Tooltip>
                  <Tooltip title="Delete"><IconButton size="small" sx={{ color: 'error.main' }} onClick={() => setDeleteId(s.id)}><DeleteRoundedIcon fontSize="small" /></IconButton></Tooltip>
                </Box>
              </Box>
            ))}
          </Stack>
        )}
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialog} onClose={() => setDialog(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>{editId ? 'Edit Shipment Details' : 'Log Shipment'}</DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2.5 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#374151', mb: 0.5, display: 'block' }}>Shipment Date *</Typography>
              <TextField fullWidth size="small" type="date" value={form.date} onChange={f('date')} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#374151', mb: 0.5, display: 'block' }}>Invoice No *</Typography>
              <TextField fullWidth size="small" value={form.invNo} onChange={f('invNo')} placeholder="e.g. INV-JUT-1002" />
            </Grid>
            <Grid size={12}>
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#374151', mb: 0.5, display: 'block' }}>Party / Client Name *</Typography>
              <TextField fullWidth size="small" select value={form.party} onChange={f('party')}>
                {PARTY_OPTIONS.map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#374151', mb: 0.5, display: 'block' }}>PI No *</Typography>
              <TextField fullWidth size="small" select value={form.piNo} onChange={e => handlePIChange(e.target.value)}>
                {db.pis.map(p => <MenuItem key={p.id} value={p.piNo}>{p.piNo}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#374151', mb: 0.5, display: 'block' }}>Item No *</Typography>
              <TextField fullWidth size="small" select value={form.itemNo} onChange={f('itemNo')} disabled={!form.piNo}>
                {activeItemNos.map(itemNo => <MenuItem key={itemNo} value={itemNo}>{itemNo}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid size={12}>
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#374151', mb: 0.5, display: 'block' }}>Qty Shipped *</Typography>
              <TextField fullWidth size="small" type="number" value={form.qty} onChange={f('qty')} placeholder="0" />
            </Grid>
          </Grid>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button onClick={() => setDialog(false)} variant="outlined" sx={{ borderRadius: 2, fontWeight: 600 }}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" sx={{ borderRadius: 2, fontWeight: 700, background: 'linear-gradient(135deg,#6C63FF,#9B94FF)', boxShadow: 'none' }}>
            Save Dispatch
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete dialog */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Delete Shipment?</DialogTitle>
        <DialogContent><Typography variant="body2" sx={{ color: 'text.secondary' }}>This action cannot be undone.</Typography></DialogContent>
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button onClick={() => setDeleteId(null)} variant="outlined" sx={{ borderRadius: 2, fontWeight: 600 }}>Cancel</Button>
          <Button onClick={handleDelete} variant="contained" color="error" sx={{ borderRadius: 2, fontWeight: 700 }}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
