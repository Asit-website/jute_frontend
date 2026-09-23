import React, { useState, useEffect } from 'react'
import {
  Box, Typography, Card, CardContent, Button, Chip, IconButton,
  TextField, InputAdornment, Dialog, DialogTitle, DialogContent,
  DialogActions, Grid, Stack, Divider, Tooltip, Avatar, MenuItem,
  TablePagination, Autocomplete
} from '@mui/material'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded'
import CategoryRoundedIcon from '@mui/icons-material/CategoryRounded'
import { getDb, saveDb, getMasters } from './mockDb'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import dayjs from 'dayjs'

const emptyProductRow = () => ({
  itemNo: '',
  buyerName: '',
  qty: '',
  deliveryDate: '',
  printing: 'No',
  description: ''
})

const emptyForm = () => ({
  date: '',
  piNo: '',
  products: [emptyProductRow()]
})

const COL = '100px 110px 1.5fr 1.5fr 1.5fr 80px 110px 80px 80px'
const HEADS = ['PI Date', 'PI No.', 'Item Name', 'Description', 'Buyer Name', 'PI Qty', 'Delivery Date', 'Printing', 'Actions']

export default function PIEntry() {
  const [db, setDb] = useState({ pis: [] })
  const [buyerOptions, setBuyerOptions] = useState([])
  const [search, setSearch] = useState('')
  const [dialog, setDialog] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(emptyForm())
  const [deleteId, setDeleteId] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(20)

  useEffect(() => {
    setPage(0)
  }, [search])

  const loadData = () => {
    getDb(['pis']).then(data => setDb(data)).catch(err => console.error(err))
  };

  useEffect(() => {
    loadData()
    getMasters('buyers')
      .then(data => setBuyerOptions(data.filter(b => b.status === 'Active').map(b => b.name)))
      .catch(err => console.error(err))
  }, [])

  const filtered = (db.pis || []).filter(p =>
    p.piNo.toLowerCase().includes(search.toLowerCase()) ||
    p.products.some(pr => (pr.buyerName || '').toLowerCase().includes(search.toLowerCase()) || (pr.itemNo || '').toLowerCase().includes(search.toLowerCase()))
  )

  const openAdd = () => { setSubmitted(false); setEditId(null); setForm(emptyForm()); setDialog(true) }
  
  const openEdit = (pi) => {
    setSubmitted(false)
    setEditId(pi.id)
    setForm({
      date: pi.date,
      piNo: pi.piNo,
      products: pi.products || [emptyProductRow()]
    })
    setDialog(true)
  }

  const handleSave = () => {
    setSubmitted(true)
    if (!form.piNo || !form.date) return
    const newDb = { ...db }
    if (editId) {
      newDb.pis = newDb.pis.map(p => p.id === editId ? { ...form, id: editId } : p)
    } else {
      const newId = 'PI-' + Date.now().toString().slice(-4)
      newDb.pis.push({ ...form, id: newId })
    }
    saveDb({ pis: newDb.pis })
      .then(() => {
        loadData()
        setDialog(false)
      })
      .catch(err => alert(err.message))
  }

  const handleDelete = () => {
    if (!deleteId) return
    const newDb = { ...db, pis: db.pis.filter(p => p.id !== deleteId) }
    saveDb({ pis: newDb.pis })
      .then(() => {
        loadData()
        setDeleteId(null)
      })
      .catch(err => alert(err.message))
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

  const paginated = search.trim() ? filtered : filtered.slice(page * rowsPerPage, (page + 1) * rowsPerPage)

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
      {/* Search */}
      <Card sx={{ mb: 2.5 }}>
        <CardContent sx={{ p: 2 }}>
          <TextField fullWidth size="small" placeholder="Search by PI No, Item Name, Buyer Name..."
            value={search} onChange={e => setSearch(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchRoundedIcon sx={{ color: '#9CA3AF', fontSize: 18 }} /></InputAdornment> }} />
        </CardContent>
      </Card>

      {/* Table */}
      <Card sx={{ overflowX: 'auto' }}>
        <Box className="grid-table-row" sx={{ display: 'grid', gridTemplateColumns: COL, px: 2, py: 1.25, bgcolor: '#F8F9FC', borderBottom: '1px solid', borderColor: 'divider', minWidth: '1060px' }}>
          {HEADS.map(h => (
            <Typography key={h} variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: '0.05em' }}>{h}</Typography>
          ))}
        </Box>

        {filtered.length === 0 ? (
          <Box sx={{ py: 6, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>No PIs found.</Typography>
          </Box>
        ) : (
          <Stack divider={<Divider />} sx={{ minWidth: '1060px' }}>
            {paginated.map(row => (
              <Box key={row.id} className="grid-table-row" sx={{ display: 'grid', gridTemplateColumns: COL, px: 2, py: 1.5, alignItems: 'center', '&:hover': { bgcolor: 'rgba(108,99,255,0.03)' }, transition: 'background 0.15s' }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>{row.date ? dayjs(row.date).format('DD/MM/YYYY') : '—'}</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>{row.piNo}</Typography>
                
                {/* Item Name */}
                <Box>
                  {(row.products || []).map((pr, idx) => (
                    <Typography key={idx} variant="body2" sx={{ display: 'block', height: '24px', lineHeight: '24px', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {pr.itemNo || '—'}
                    </Typography>
                  ))}
                </Box>

                {/* Description */}
                <Box>
                  {(row.products || []).map((pr, idx) => (
                    <Typography key={idx} variant="body2" sx={{ display: 'block', height: '24px', lineHeight: '24px', color: 'text.secondary', fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {pr.description || '—'}
                    </Typography>
                  ))}
                </Box>

                {/* Buyer Name */}
                <Typography variant="body2" sx={{ fontWeight: 700 }}>{row.products?.[0]?.buyerName || '—'}</Typography>

                {/* PI Qty */}
                <Box>
                  {(row.products || []).map((pr, idx) => (
                    <Typography key={idx} variant="body2" sx={{ display: 'block', height: '24px', lineHeight: '24px', fontWeight: 600 }}>
                      {Number(pr.qty || 0).toLocaleString()}
                    </Typography>
                  ))}
                </Box>

                {/* Delivery Date */}
                <Box>
                  {(row.products || []).map((pr, idx) => (
                    <Typography key={idx} variant="caption" sx={{ display: 'block', height: '24px', lineHeight: '24px', color: 'text.secondary', fontWeight: 600 }}>
                      {pr.deliveryDate ? dayjs(pr.deliveryDate).format('DD/MM/YYYY') : '—'}
                    </Typography>
                  ))}
                </Box>

                {/* Printing Yes/No */}
                <Box>
                  {(row.products || []).map((pr, idx) => (
                    <Box key={idx} sx={{ display: 'flex', alignItems: 'center', height: '24px' }}>
                      <Chip
                        label={pr.printing === 'Yes' ? 'Yes' : 'No'}
                        size="small"
                        color={pr.printing === 'Yes' ? 'secondary' : 'default'}
                        variant="outlined"
                        sx={{ fontSize: '0.65rem', height: 18, fontWeight: 700 }}
                      />
                    </Box>
                  ))}
                </Box>

                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <Tooltip title="Edit PI"><IconButton size="small" sx={{ color: 'primary.main' }} onClick={() => openEdit(row)}><EditRoundedIcon fontSize="small" /></IconButton></Tooltip>
                  <Tooltip title="Delete PI"><IconButton size="small" sx={{ color: 'error.main' }} onClick={() => setDeleteId(row.id)}><DeleteRoundedIcon fontSize="small" /></IconButton></Tooltip>
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
            rowsPerPageOptions={[20, 50, 100]}
          />
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
              <DatePicker
                format="DD/MM/YYYY"
                value={form.date ? dayjs(form.date) : null}
                onChange={newValue => setForm({ ...form, date: newValue ? newValue.format('YYYY-MM-DD') : '' })}
                slotProps={{
                  textField: {
                    size: 'small',
                    fullWidth: true,
                    error: submitted && !form.date,
                    helperText: submitted && !form.date ? 'Required' : ''
                  }
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#374151', mb: 0.5, display: 'block' }}>PI No *</Typography>
              <TextField fullWidth size="small" value={form.piNo} onChange={e => setForm({ ...form, piNo: e.target.value })} placeholder="e.g. PI-26-27-001" error={submitted && !form.piNo} helperText={submitted && !form.piNo ? 'Required' : ''} />
            </Grid>

            {/* Products grid */}
            <Grid size={12}>
              <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 2, mt: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#6C63FF', mb: 1.5, display: 'block', textTransform: 'uppercase' }}>Product Items</Typography>
                
                {/* Headers */}
                <Box sx={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr 1.8fr 1fr 1.2fr 0.8fr 36px', gap: 1.5, pb: 1, borderBottom: '1px solid', borderColor: 'divider', mb: 1.5 }}>
                  {['Item Name *', 'Description', 'Buyer Name *', 'PI QTY *', 'Delivery Date *', 'printing *', ''].map(h => (
                    <Typography key={h} variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.62rem', textTransform: 'uppercase' }}>{h}</Typography>
                  ))}
                </Box>

                {/* Rows */}
                {form.products.map((row, idx) => (
                  <Box key={idx} sx={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr 1.8fr 1fr 1.2fr 0.8fr 36px', gap: 1.5, alignItems: 'center', mb: 1 }}>
                    <TextField size="small" value={row.itemNo} onChange={setRow(idx, 'itemNo')} placeholder="e.g. Plain Jute Bag" error={submitted && !row.itemNo} helperText={submitted && !row.itemNo ? 'Required' : ''} />
                    
                    <TextField size="small" value={row.description || ''} onChange={setRow(idx, 'description')} placeholder="e.g. Plain double warp bags" error={submitted && !row.description} helperText={submitted && !row.description ? 'Required' : ''} />

                    <Autocomplete
                      size="small"
                      options={buyerOptions}
                      value={row.buyerName || null}
                      onChange={(e, val) => {
                        const products = [...form.products]
                        products[idx] = { ...products[idx], buyerName: val || '' }
                        setForm({ ...form, products })
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder="Select Buyer"
                          error={submitted && !row.buyerName}
                          helperText={submitted && !row.buyerName ? 'Required' : ''}
                        />
                      )}
                    />

                    <TextField size="small" type="number" value={row.qty} onChange={setRow(idx, 'qty')} placeholder="0" error={submitted && (!row.qty || Number(row.qty) <= 0)} helperText={submitted && (!row.qty || Number(row.qty) <= 0) ? 'Required' : ''} />
                    
                    <DatePicker
                      format="DD/MM/YYYY"
                      value={row.deliveryDate ? dayjs(row.deliveryDate) : null}
                      onChange={val => { const products = [...form.products]; products[idx] = { ...products[idx], deliveryDate: val ? val.format('YYYY-MM-DD') : '' }; setForm({ ...form, products }) }}
                      slotProps={{
                        textField: {
                          size: 'small',
                          error: submitted && !row.deliveryDate,
                          helperText: submitted && !row.deliveryDate ? 'Required' : ''
                        }
                      }}
                    />
                    
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
