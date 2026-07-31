import React, { useState } from 'react'
import {
  Box, Typography, Card, CardContent, Button, Chip, IconButton,
  TextField, InputAdornment, Dialog, DialogTitle, DialogContent,
  DialogActions, Grid, MenuItem, Stack, Divider, Tooltip, Avatar,
} from '@mui/material'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded'
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded'
import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded'
import ShoppingBagRoundedIcon from '@mui/icons-material/ShoppingBagRounded'

// ── Dropdown Options & Catalog ────────────────────────────────
const BUYER_OPTIONS = ['Ramesh Traders', 'Bengal Jute Co.', 'Kolkata Mills', 'Agro Fibers Ltd.', 'Sona Traders', 'Delta Jute Works', 'Green Fibre Co.', 'Sunrise Exports']
const STATUS_OPTIONS = ['In Production', 'At Cutting', 'With Printer', 'With Fabricator', 'Dispatch Ready', 'Completed', 'Rejected']
const PRIORITY_OPTIONS = ['High', 'Medium', 'Low']
const UOMS = ['', 'MTR', 'KG', 'PCS', 'ROLL', 'BAG']

// Product Catalog mapping name to standard UOM and standard Color
const PRODUCT_CATALOG = {
  'Hessian Cloth':     { color: 'Natural', unit: 'MTR' },
  'Jute Cloth':        { color: 'Golden',  unit: 'MTR' },
  'Cotton Sheet':      { color: 'White',   unit: 'MTR' },
  'Cotton Fabric':     { color: 'Blue',    unit: 'MTR' },
  'Raw Jute Fiber':    { color: 'Brown',   unit: 'KG'  },
  'Jute Bags 40x60cm': { color: 'Natural', unit: 'PCS' },
  'Jute Yarn 200 GSM': { color: 'Brown',   unit: 'KG'  },
  'Jute Twine 3-ply':  { color: 'Brown',   unit: 'KG'  },
}

const PRODUCT_OPTIONS = Object.keys(PRODUCT_CATALOG)

const statusColor = {
  'In Production':  'info',
  'At Cutting':     'warning',
  'With Printer':   'secondary',
  'With Fabricator':'warning',
  'Dispatch Ready': 'success',
  'Completed':      'success',
  'Rejected':       'error',
}
const priorityColor = { High: '#EF4444', Medium: '#F59E0B', Low: '#6B7280' }
const priorityBg    = { High: 'rgba(239,68,68,0.1)', Medium: 'rgba(245,158,11,0.1)', Low: 'rgba(107,114,128,0.1)' }

// ── Initial Orders Data ──────────────────────────────────────
const initialOrders = [
  {
    id: 'ORD-1001',
    customerName: 'Ramesh Traders',
    orderNumber: 'ON-2026-001',
    deliveryDate: '2026-08-05',
    status: 'Dispatch Ready',
    priority: 'High',
    products: [
      { productName: 'Raw Jute Fiber', color: 'Natural', unit: 'KG', qty: 500 },
      { productName: 'Hessian Cloth', color: 'Golden', unit: 'MTR', qty: 200 },
    ],
  },
  {
    id: 'ORD-1002',
    customerName: 'Bengal Jute Co.',
    orderNumber: 'ON-2026-002',
    deliveryDate: '2026-08-12',
    status: 'With Fabricator',
    priority: 'Medium',
    products: [
      { productName: 'Jute Bags 40x60cm', color: 'Natural', unit: 'PCS', qty: 1200 },
    ],
  },
]

const emptyRow = () => ({ productName: '', color: '', unit: 'MTR', qty: '' })

const emptyForm = {
  customerName: 'Ramesh Traders',
  orderNumber: '',
  deliveryDate: '',
  status: 'In Production',
  priority: 'Medium',
  products: [emptyRow()],
}

// ── Table Header ─────────────────────────────────────────────
const COL = '1.2fr 110px 2.2fr 110px 120px 80px 100px'

function TableHead() {
  const cols = ['Customer Name', 'Order No.', 'Products (Name, Color, Qty)', 'Delivery Date', 'Status', 'Priority', 'Actions']
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: COL, px: 2, py: 1.25, bgcolor: '#F8F9FC', borderBottom: '1px solid', borderColor: 'divider' }}>
      {cols.map((c) => (
        <Typography key={c} variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: '0.05em' }}>
          {c}
        </Typography>
      ))}
    </Box>
  )
}

export default function CustomerOrder() {
  const [orders, setOrders]         = useState(initialOrders)
  const [search, setSearch]         = useState('')
  const [filterStatus, setFilter]   = useState('All')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [viewOrder, setViewOrder]   = useState(null)
  const [editId, setEditId]         = useState(null)
  const [form, setForm]             = useState(emptyForm)
  const [deleteId, setDeleteId]     = useState(null)

  // ── Filtered list ──
  const filtered = orders.filter((o) => {
    const matchSearch = o.customerName.toLowerCase().includes(search.toLowerCase()) ||
                        o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
                        o.products.some(p => p.productName.toLowerCase().includes(search.toLowerCase()))
    const matchStatus = filterStatus === 'All' || o.status === filterStatus
    return matchSearch && matchStatus
  })

  // ── Handlers ──
  const openAdd = () => { setEditId(null); setForm(emptyForm); setDialogOpen(true) }
  const openEdit = (o) => {
    setEditId(o.id)
    setForm({
      customerName: o.customerName,
      orderNumber: o.orderNumber,
      deliveryDate: o.deliveryDate,
      status: o.status,
      priority: o.priority,
      products: o.products || [emptyRow()],
    })
    setDialogOpen(true)
  }
  const handleSave = () => {
    if (!form.customerName || !form.orderNumber || !form.deliveryDate) return
    const rowData = { ...form }
    if (editId) {
      setOrders((prev) => prev.map((o) => o.id === editId ? { ...rowData, id: editId } : o))
    } else {
      const newId = 'ORD-' + (1000 + orders.length + 1)
      setOrders((prev) => [...prev, { ...rowData, id: newId }])
    }
    setDialogOpen(false)
  }
  const handleDelete = () => {
    setOrders((prev) => prev.filter((o) => o.id !== deleteId))
    setDeleteId(null)
  }

  // products list management inside dialog with Autofill logic
  const handleProductSelect = (idx, value) => {
    const rows = [...form.products]
    const defaults = PRODUCT_CATALOG[value] || { color: '', unit: 'MTR' }
    rows[idx] = {
      ...rows[idx],
      productName: value,
      color: defaults.color,
      unit: defaults.unit,
    }
    setForm({ ...form, products: rows })
  }

  const setRow = (idx, k) => (e) => {
    const rows = [...form.products]
    rows[idx] = { ...rows[idx], [k]: e.target.value }
    setForm({ ...form, products: rows })
  }
  const addRow = () => setForm({ ...form, products: [...form.products, emptyRow()] })
  const removeRow = (idx) => {
    if (form.products.length === 1) return
    setForm({ ...form, products: form.products.filter((_, i) => i !== idx) })
  }

  return (
    <Box className="page-enter">
      {/* ── Header ── */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: 'rgba(108,99,255,0.1)', color: 'primary.main', borderRadius: 2, width: 46, height: 46 }}>
            <ShoppingBagRoundedIcon />
          </Avatar>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', lineHeight: 1.2 }}>Customer Order</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>Manage & track all customer orders</Typography>
          </Box>
        </Box>
        <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={openAdd}
          sx={{ borderRadius: 2, px: 2.5, fontWeight: 700, background: 'linear-gradient(135deg,#6C63FF,#9B94FF)', boxShadow: '0 4px 14px rgba(108,99,255,0.35)' }}>
          New Order
        </Button>
      </Box>

      {/* ── Summary Cards ── */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Total Orders',    value: orders.length,                                            color: '#6C63FF', bg: 'rgba(108,99,255,0.08)' },
          { label: 'In Production',   value: orders.filter(o => o.status === 'In Production').length,  color: '#3B82F6', bg: 'rgba(59,130,246,0.08)'  },
          { label: 'Dispatch Ready',  value: orders.filter(o => o.status === 'Dispatch Ready').length, color: '#00C07F', bg: 'rgba(0,192,127,0.08)'   },
          { label: 'Completed',       value: orders.filter(o => o.status === 'Completed').length,      color: '#14B8A6', bg: 'rgba(20,184,166,0.08)'  },
        ].map((s) => (
          <Grid key={s.label} size={{ xs: 6, md: 3 }}>
            <Card>
              <CardContent sx={{ p: 2.5 }}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: s.color }}>{s.value}</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>{s.label}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* ── Filters ── */}
      <Card sx={{ mb: 2.5 }}>
        <CardContent sx={{ p: 2, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            size="small"
            placeholder="Search by customer, order no, product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ flex: 1, minWidth: 240 }}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchRoundedIcon sx={{ color: '#9CA3AF', fontSize: 18 }} /></InputAdornment>,
            }}
          />
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
            <FilterListRoundedIcon sx={{ color: 'text.secondary', fontSize: 18 }} />
            {['All', ...STATUS_OPTIONS].map((s) => (
              <Chip
                key={s} label={s} size="small" clickable
                onClick={() => setFilter(s)}
                color={filterStatus === s ? 'primary' : 'default'}
                variant={filterStatus === s ? 'filled' : 'outlined'}
                sx={{ fontWeight: 600, fontSize: '0.72rem' }}
              />
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* ── Table ── */}
      <Card>
        <TableHead />
        {filtered.length === 0 ? (
          <Box sx={{ py: 6, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>No orders found.</Typography>
          </Box>
        ) : (
          <Stack divider={<Divider />}>
            {filtered.map((o) => (
              <Box
                key={o.id}
                sx={{
                  display: 'grid', gridTemplateColumns: COL,
                  px: 2, py: 1.5, alignItems: 'center',
                  '&:hover': { bgcolor: 'rgba(108,99,255,0.03)' },
                  transition: 'background 0.15s',
                }}
              >
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }} noWrap>{o.customerName}</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>{o.id}</Typography>
                </Box>
                <Typography variant="caption" sx={{ fontWeight: 600, color: 'primary.main' }}>{o.orderNumber}</Typography>
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                  {(o.products || []).map((p, idx) => (
                    <Chip
                      key={idx}
                      label={`${p.productName} (${p.color || 'Natural'}) x ${p.qty || 0} ${p.unit || ''}`}
                      size="small"
                      sx={{ fontSize: '0.7rem', height: 20, bgcolor: 'rgba(108,99,255,0.06)', border: '1px solid rgba(108,99,255,0.15)', fontWeight: 600 }}
                    />
                  ))}
                </Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  {new Date(o.deliveryDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}
                </Typography>
                <Chip label={o.status} size="small" color={statusColor[o.status] || 'default'} variant="outlined"
                  sx={{ fontWeight: 600, fontSize: '0.65rem', height: 22, width: 'fit-content' }} />
                <Chip label={o.priority} size="small"
                  sx={{ fontWeight: 700, fontSize: '0.65rem', height: 22, width: 'fit-content',
                    bgcolor: priorityBg[o.priority], color: priorityColor[o.priority] }} />
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <Tooltip title="View"><IconButton size="small" sx={{ color: 'text.secondary' }} onClick={() => setViewOrder(o)}><VisibilityRoundedIcon fontSize="small" /></IconButton></Tooltip>
                  <Tooltip title="Edit"><IconButton size="small" sx={{ color: 'primary.main' }} onClick={() => openEdit(o)}><EditRoundedIcon fontSize="small" /></IconButton></Tooltip>
                  <Tooltip title="Delete"><IconButton size="small" sx={{ color: 'error.main' }} onClick={() => setDeleteId(o.id)}><DeleteRoundedIcon fontSize="small" /></IconButton></Tooltip>
                </Box>
              </Box>
            ))}
          </Stack>
        )}
        <Box sx={{ px: 2, py: 1.5, bgcolor: '#F8F9FC', borderTop: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>Showing {filtered.length} of {orders.length} orders</Typography>
        </Box>
      </Card>

      {/* ── Add / Edit Dialog ── */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>
          {editId ? 'Edit Order' : 'New Customer Order'}
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2.5, maxHeight: '80vh', overflowY: 'auto' }}>
          <Grid container spacing={2}>
            {/* Customer Details */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#374151', mb: 0.5, display: 'block' }}>Customer Name *</Typography>
              <TextField fullWidth size="small" select value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })}>
                {BUYER_OPTIONS.map((b) => <MenuItem key={b} value={b}>{b}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#374151', mb: 0.5, display: 'block' }}>Order Number *</Typography>
              <TextField fullWidth size="small" value={form.orderNumber} onChange={(e) => setForm({ ...form, orderNumber: e.target.value })} placeholder="e.g. ON-2026-009" />
            </Grid>

            {/* Product Details Section */}
            <Grid size={12}>
              <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 2, mt: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#6C63FF', mb: 1.5, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Product Items</Typography>
                
                {/* Column Headers */}
                <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 100px 1.2fr 36px', gap: 1.5, pb: 1, borderBottom: '1px solid', borderColor: 'divider', mb: 1 }}>
                  {['Product Name *', 'Color', 'Unit', 'Quantity *', ''].map(h => (
                    <Typography key={h} variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.62rem' }}>{h}</Typography>
                  ))}
                </Box>

                {/* Rows */}
                {(form.products || [emptyRow()]).map((row, idx) => (
                  <Box key={idx} sx={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 100px 1.2fr 36px', gap: 1.5, alignItems: 'center', mb: 1 }}>
                    {/* Product Name Dropdown */}
                    <TextField size="small" select value={row.productName || ''} onChange={(e) => handleProductSelect(idx, e.target.value)}>
                      {PRODUCT_OPTIONS.map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
                    </TextField>
                    
                    {/* Color (autofilled, changeable) */}
                    <TextField size="small" value={row.color || ''} onChange={setRow(idx, 'color')} placeholder="e.g. Natural" />
                    
                    {/* Unit Dropdown (autofilled, changeable) */}
                    <TextField size="small" select value={row.unit || ''} onChange={setRow(idx, 'unit')}>
                      {UOMS.map(u => <MenuItem key={u} value={u}>{u || '—'}</MenuItem>)}
                    </TextField>

                    {/* Qty */}
                    <TextField size="small" type="number" value={row.qty || ''} onChange={setRow(idx, 'qty')} placeholder="0" />
                    
                    <IconButton size="small" onClick={() => removeRow(idx)} disabled={form.products.length === 1} sx={{ color: 'error.main' }}>
                      <DeleteRoundedIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}

                <Button size="small" startIcon={<AddRoundedIcon />} onClick={addRow} variant="outlined" sx={{ borderRadius: 2, fontWeight: 700, borderStyle: 'dashed', mt: 1 }}>
                  Add More Product
                </Button>
              </Box>
            </Grid>

            {/* Delivery & Status */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#374151', mb: 0.5, display: 'block' }}>Delivery Date *</Typography>
              <TextField fullWidth size="small" type="date" value={form.deliveryDate} onChange={(e) => setForm({ ...form, deliveryDate: e.target.value })} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#374151', mb: 0.5, display: 'block' }}>Status</Typography>
              <TextField fullWidth size="small" select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                {STATUS_OPTIONS.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid size={12}>
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#374151', mb: 0.5, display: 'block' }}>Priority</Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {PRIORITY_OPTIONS.map((p) => (
                  <Chip key={p} label={p} clickable onClick={() => setForm({ ...form, priority: p })}
                    sx={{ fontWeight: 700, bgcolor: form.priority === p ? priorityBg[p] : 'transparent',
                      color: form.priority === p ? priorityColor[p] : 'text.secondary',
                      border: '1px solid', borderColor: form.priority === p ? priorityColor[p] : 'divider' }} />
                ))}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button onClick={() => setDialogOpen(false)} variant="outlined" sx={{ borderRadius: 2, fontWeight: 600 }}>Cancel</Button>
          <Button onClick={handleSave} variant="contained"
            sx={{ borderRadius: 2, fontWeight: 700, background: 'linear-gradient(135deg,#6C63FF,#9B94FF)', boxShadow: 'none' }}>
            {editId ? 'Save Changes' : 'Create Order'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── View Dialog ── */}
      <Dialog open={!!viewOrder} onClose={() => setViewOrder(null)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>Order Details</DialogTitle>
        <Divider />
        {viewOrder && (
          <DialogContent sx={{ pt: 2, maxHeight: '70vh', overflowY: 'auto' }}>
            <Stack spacing={2}>
              {/* Order Info */}
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#6C63FF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Order Info</Typography>
                <Divider sx={{ my: 0.75 }} />
                <Grid container spacing={1.5}>
                  {[
                    ['Customer Name', viewOrder.customerName],
                    ['Order Number',  viewOrder.orderNumber],
                    ['Delivery Date', new Date(viewOrder.deliveryDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })],
                    ['Status',        viewOrder.status],
                    ['Priority',      viewOrder.priority],
                  ].map(([label, value]) => (
                    <Grid key={label} size={{ xs: 6 }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block' }}>{label}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>{value}</Typography>
                    </Grid>
                  ))}
                </Grid>
              </Box>

              {/* Products Sub-table */}
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#6C63FF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Products Ordered</Typography>
                <Divider sx={{ my: 0.75 }} />
                <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr 100px 1fr', px: 1, py: 0.5, bgcolor: '#F8F9FC', borderBottom: '1px solid', borderColor: 'divider', mb: 1 }}>
                  {['Product Name', 'Color', 'Unit', 'Quantity'].map(h => (
                    <Typography key={h} variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>{h}</Typography>
                  ))}
                </Box>
                <Stack spacing={0.5}>
                  {(viewOrder.products || []).map((p, idx) => (
                    <Box key={idx} sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr 100px 1fr', px: 1, py: 0.5, borderBottom: '1px solid', borderColor: 'rgba(0,0,0,0.03)' }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{p.productName}</Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', alignSelf: 'center' }}>{p.color || 'Natural'}</Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', alignSelf: 'center' }}>{p.unit || 'MTR'}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>{p.qty || 0}</Typography>
                    </Box>
                  ))}
                </Stack>
              </Box>
            </Stack>
          </DialogContent>
        )}
        <Divider />
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setViewOrder(null)} variant="contained"
            sx={{ borderRadius: 2, fontWeight: 700, background: 'linear-gradient(135deg,#6C63FF,#9B94FF)', boxShadow: 'none' }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Delete Confirm Dialog ── */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Delete Order?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button onClick={() => setDeleteId(null)} variant="outlined" sx={{ borderRadius: 2, fontWeight: 600 }}>Cancel</Button>
          <Button onClick={handleDelete} variant="contained" color="error" sx={{ borderRadius: 2, fontWeight: 700 }}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
