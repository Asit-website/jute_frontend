import React, { useState, useEffect } from 'react'
import {
  Box, Typography, Card, CardContent, Button, IconButton,
  TextField, InputAdornment, Dialog, DialogTitle, DialogContent,
  DialogActions, Grid, Stack, Divider, Tooltip, Avatar, MenuItem, Chip,
  Autocomplete, TablePagination
} from '@mui/material'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded'
import ShoppingCartCheckoutRoundedIcon from '@mui/icons-material/ShoppingCartCheckoutRounded'
import { getDb, saveDb, getMasters } from './mockDb'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import dayjs from 'dayjs'

const emptyItemRow = () => ({
  name: '',
  color: '',
  qty: '',
  unit: '',
  rate: ''
})

const emptyForm = () => ({
  date: '',
  poNo: '',
  supplier: '',
  items: [emptyItemRow()]
})

const COL = '120px 140px 1.5fr 1.5fr 1fr 120px 100px'
const HEADS = ['PO Date', 'PO No.', 'Supplier', 'Material', 'Color', 'Qty', 'Actions']

export default function PORawMaterial() {
  const [db, setDb] = useState({ pos: [] })
  const [supplierOptions, setSupplierOptions] = useState([])
  const [materialCatalog, setMaterialCatalog] = useState({})
  const [materialOptions, setMaterialOptions] = useState([])
  const [unitOptions, setUnitOptions] = useState([])
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
    getDb(['pos']).then(data => setDb(data)).catch(err => console.error(err))
  }

  useEffect(() => {
    loadData()
    getMasters('suppliers')
      .then(data => setSupplierOptions(data.filter(s => s.status === 'Active').map(s => s.name)))
      .catch(err => console.error(err))
    getMasters('materials')
      .then(data => {
        const cat = {}
        data.filter(m => m.status === 'Active').forEach(m => {
          // Each color variant becomes a separate selectable option
          const key = m.color ? `${m.name} (${m.color})` : m.name
          cat[key] = { name: m.name, color: m.color || '', unit: m.uom || '' }
        })
        setMaterialCatalog(cat)
        setMaterialOptions(Object.keys(cat).sort())
      })
      .catch(err => console.error(err))
    getMasters('units')
      .then(data => setUnitOptions(data.filter(u => u.status === 'Active').map(u => ({ name: u.name, unitName: u.unitName || u.name }))))
      .catch(err => console.error(err))
  }, [])

  const filtered = (db.pos || []).filter(p =>
    p.poNo?.toLowerCase().includes(search.toLowerCase()) ||
    p.supplier?.toLowerCase().includes(search.toLowerCase())
  )

  const paginated = search.trim() ? filtered : filtered.slice(page * rowsPerPage, (page + 1) * rowsPerPage)

  const openAdd = () => {
    setSubmitted(false)
    setEditId(null)
    setForm(emptyForm())
    setDialog(true)
  }
  
  const openEdit = (po) => {
    setSubmitted(false)
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
    setSubmitted(true)
    if (!form.date || !form.poNo || !form.supplier) return
    const hasInvalidItem = form.items.some(item => 
      !item.name || !item.unit || !item.qty || Number(item.qty) <= 0 || !item.rate || Number(item.rate) <= 0
    )
    if (hasInvalidItem) return
    const newDb = { ...db }
    if (editId) {
      newDb.pos = newDb.pos.map(p => p.id === editId ? { ...form, id: editId } : p)
    } else {
      const newId = 'PO-' + Date.now().toString().slice(-4)
      newDb.pos.push({ ...form, id: newId })
    }
    saveDb({ pos: newDb.pos })
      .then(() => {
        loadData()
        setDialog(false)
      })
      .catch(err => alert(err.message))
  }

  const handleDelete = () => {
    const newDb = { ...db, pos: db.pos.filter(p => p.id !== deleteId) }
    saveDb({ pos: newDb.pos })
      .then(() => {
        loadData()
        setDeleteId(null)
      })
      .catch(err => alert(err.message))
  }

  const handleRMSelect = (idx, value) => {
    const items = [...form.items]
    const defaults = materialCatalog[value] || { name: value || '', color: '', unit: '' }
    items[idx] = {
      ...items[idx],
      name: defaults.name || value || '',
      color: defaults.color,
      unit: defaults.unit || items[idx].unit,
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

  const unitLabel = (code) => {
    if (!code) return '—'
    const found = unitOptions.find(u => u.name === code)
    return found ? found.unitName : code
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

      {/* Search */}
      <Card sx={{ mb: 2.5 }}>
        <CardContent sx={{ p: 2 }}>
          <TextField fullWidth size="small" placeholder="Search by PO No, Supplier Name..."
            value={search} onChange={e => setSearch(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchRoundedIcon sx={{ color: '#9CA3AF', fontSize: 18 }} /></InputAdornment> }} />
        </CardContent>
      </Card>

      {/* Table */}
      <Card sx={{ overflowX: 'auto' }}>
        <Box className="grid-table-row" sx={{ display: 'grid', gridTemplateColumns: COL, px: 2, py: 1.25, bgcolor: '#F8F9FC', borderBottom: '1px solid', borderColor: 'divider', minWidth: '950px' }}>
          {HEADS.map(h => (
            <Typography key={h} variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: '0.05em', textAlign: h === 'Qty' ? 'right' : 'left', pr: h === 'Qty' ? 3 : 0 }}>{h}</Typography>
          ))}
        </Box>

        {filtered.length === 0 ? (
          <Box sx={{ py: 6, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>No POs found.</Typography>
          </Box>
        ) : (
          <Stack divider={<Divider />}>
            {paginated.map(p => (
              <Box key={p.id} className="grid-table-row" sx={{ display: 'grid', gridTemplateColumns: COL, px: 2, py: 1.5, alignItems: 'center', '&:hover': { bgcolor: 'rgba(108,99,255,0.03)' }, transition: 'background 0.15s', minWidth: '950px' }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>{p.date ? dayjs(p.date).format('DD/MM/YYYY') : '—'}</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>{p.poNo || '—'}</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>{p.supplier}</Typography>
                
                {/* Material Name Only */}
                <Box>
                  {p.items.map((it, idx) => (
                    <Typography key={idx} variant="body2" sx={{ display: 'block', height: '24px', lineHeight: '24px', color: 'text.primary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {it.name}
                    </Typography>
                  ))}
                </Box>

                {/* Color Column */}
                <Box>
                  {p.items.map((it, idx) => (
                    <Typography key={idx} variant="caption" sx={{ display: 'block', height: '24px', lineHeight: '24px', color: 'text.secondary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {it.color || '—'}
                    </Typography>
                  ))}
                </Box>

                {/* Qty Column */}
                <Box sx={{ textAlign: 'right', pr: 3 }}>
                  {p.items.map((it, idx) => (
                    <Typography key={idx} variant="body2" sx={{ display: 'block', height: '24px', lineHeight: '24px', fontWeight: 600 }}>
                      {Number(it.qty || 0).toLocaleString()} {unitLabel(it.unit)}
                    </Typography>
                  ))}
                </Box>

                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <Tooltip title="Edit"><IconButton size="small" sx={{ color: 'primary.main' }} onClick={() => openEdit(p)}><EditRoundedIcon fontSize="small" /></IconButton></Tooltip>
                  <Tooltip title="Delete"><IconButton size="small" sx={{ color: 'error.main' }} onClick={() => setDeleteId(p.id)}><DeleteRoundedIcon fontSize="small" /></IconButton></Tooltip>
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
        <DialogTitle sx={{ fontWeight: 800 }}>{editId ? 'Edit Raw Material PO' : 'Create Raw Material PO'}</DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2.5 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#374151', mb: 0.5, display: 'block' }}>PO Date *</Typography>
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
            <Grid size={{ xs: 12, sm: 4 }}>
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#374151', mb: 0.5, display: 'block' }}>PO No. *</Typography>
              <TextField
                fullWidth
                size="small"
                value={form.poNo}
                onChange={e => setForm({ ...form, poNo: e.target.value })}
                placeholder="e.g. PO-2026-90"
                error={submitted && !form.poNo}
                helperText={submitted && !form.poNo ? 'Required' : ''}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#374151', mb: 0.5, display: 'block' }}>Supplier Party *</Typography>
              <Autocomplete
                size="small"
                options={supplierOptions}
                value={form.supplier || null}
                onChange={(e, val) => setForm({ ...form, supplier: val || '' })}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Select Supplier"
                    error={submitted && !form.supplier}
                    helperText={submitted && !form.supplier ? 'Required' : ''}
                  />
                )}
              />
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
                      options={materialOptions}
                      value={row.name && row.color
                        ? (materialOptions.find(o => o === `${row.name} (${row.color})`) || row.name)
                        : (materialOptions.find(o => o === row.name) || row.name)}
                      onChange={(e, newVal) => {
                        // User selected an option from dropdown — full catalog lookup
                        if (newVal) handleRMSelect(idx, newVal)
                      }}
                      onInputChange={(e, newInput, reason) => {
                        // Only update raw name when user clears or types freely (not on option selection)
                        if (reason === 'input' || reason === 'clear') {
                          const items = [...form.items]
                          items[idx] = { ...items[idx], name: newInput || '', color: '', unit: items[idx].unit }
                          setForm({ ...form, items })
                        }
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          size="small"
                          placeholder="Select or type material..."
                          error={submitted && !row.name}
                          helperText={submitted && !row.name ? 'Required' : ''}
                        />
                      )}
                    />
                    <TextField size="small" value={row.color} onChange={setRow(idx, 'color')} placeholder="e.g. Natural" />
                    <Autocomplete
                      size="small"
                      options={unitOptions}
                      getOptionLabel={(opt) => opt.unitName || opt.name || ''}
                      isOptionEqualToValue={(opt, val) => opt.name === (val?.name ?? val)}
                      value={unitOptions.find(u => u.name === row.unit) || null}
                      onChange={(e, val) => {
                        const items = [...form.items]
                        items[idx] = { ...items[idx], unit: val ? val.name : '' }
                        setForm({ ...form, items })
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder="Unit"
                          error={submitted && !row.unit}
                          helperText={submitted && !row.unit ? 'Required' : ''}
                        />
                      )}
                    />
                    <TextField
                      size="small"
                      type="number"
                      value={row.qty}
                      onChange={setRow(idx, 'qty')}
                      placeholder="0"
                      error={submitted && (!row.qty || Number(row.qty) <= 0)}
                      helperText={submitted && (!row.qty || Number(row.qty) <= 0) ? 'Required' : ''}
                    />
                    <TextField
                      size="small"
                      type="number"
                      value={row.rate}
                      onChange={setRow(idx, 'rate')}
                      placeholder="0.00"
                      error={submitted && (!row.rate || Number(row.rate) <= 0)}
                      helperText={submitted && (!row.rate || Number(row.rate) <= 0) ? 'Required' : ''}
                    />
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
