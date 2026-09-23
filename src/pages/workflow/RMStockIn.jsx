import React, { useState, useEffect } from 'react'
import {
  Box, Typography, Card, CardContent, Button, IconButton, Alert,
  TextField, InputAdornment, Dialog, DialogTitle, DialogContent,
  DialogActions, Grid, Stack, Divider, Tooltip, Avatar, MenuItem, Chip,
  LinearProgress, Autocomplete, TablePagination
} from '@mui/material'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded'
import WarehouseRoundedIcon from '@mui/icons-material/WarehouseRounded'
import AssessmentRoundedIcon from '@mui/icons-material/AssessmentRounded'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import PendingRoundedIcon from '@mui/icons-material/PendingRounded'
import { getDb, saveDb, getMasters } from './mockDb'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import dayjs from 'dayjs'

const emptyReceiveRow = () => ({
  name: '',
  color: '',
  qty: '',
  unit: '',
  rate: '',
  poQty: 0
})

const emptyForm = () => ({
  date: '',
  supplier: '',
  items: [emptyReceiveRow()]
})

const COL = '120px 1.8fr 2.5fr 100px'
const HEADS = ['Receipt Date', 'Supplier', 'Received Materials', 'Actions']

export default function RMStockIn() {
  const [db, setDb] = useState({ pos: [], receipts: [] })
  const [supplierOptions, setSupplierOptions] = useState([])
  const [unitOptions, setUnitOptions] = useState([])
  const [search, setSearch] = useState('')
  const [dialog, setDialog] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(emptyForm())
  const [deleteId, setDeleteId] = useState(null)
  const [validationError, setValidationError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(20)

  useEffect(() => {
    setPage(0)
  }, [search])

  const loadData = () => {
    getDb(['receipts', 'pos']).then(data => setDb(data)).catch(err => console.error(err))
  }

  useEffect(() => {
    loadData()
    getMasters('suppliers')
      .then(data => setSupplierOptions(data.filter(s => s.status === 'Active').map(s => s.name)))
      .catch(err => console.error(err))
    getMasters('units')
      .then(data => setUnitOptions(data.filter(u => u.status === 'Active').map(u => ({ name: u.name, unitName: u.unitName || u.name }))))
      .catch(err => console.error(err))
  }, [])

  const filtered = (db.receipts || []).filter(r =>
    r.supplier?.toLowerCase().includes(search.toLowerCase()) ||
    (r.items || []).some(it => it.name?.toLowerCase().includes(search.toLowerCase()))
  )

  const paginated = search.trim() ? filtered : filtered.slice(page * rowsPerPage, (page + 1) * rowsPerPage)

  // Get POs of selected supplier
  const supplierPOs = (db.pos || []).filter(p => p.supplier === form.supplier)

  // Materials from selected supplier's POs only
  const supplierRMItems = supplierPOs.flatMap(po => (po.items || []).map(it => ({
    name: it.name,
    color: it.color || '',
    unit: it.unit || '',
    displayKey: it.color ? `${it.name} (${it.color})` : it.name
  })))

  // Deduplicate by name+color so each color variant is separate
  const supplierRMOptions = [...new Map(supplierRMItems.map(it => [`${it.name}|${it.color}`, it])).values()]

  const openAdd = () => {
    setSubmitted(false)
    setValidationError('')
    setEditId(null)
    setForm(emptyForm())
    setDialog(true)
  }

  const openEdit = (rec) => {
    setSubmitted(false)
    setValidationError('')
    setEditId(rec.id)
    setForm({
      date: rec.date,
      supplier: rec.supplier,
      items: rec.items || [emptyReceiveRow()]
    })
    setDialog(true)
  }

  const handlePOSelect = (poNoOrId) => {
    const po = db.pos.find(p => p.id === poNoOrId || p.poNo === poNoOrId)
    if (!po) return

    // Auto load PO items into receiving form with validation mapping
    const receiveItems = po.items.map(it => ({
      name: it.name,
      color: it.color,
      qty: it.qty, // pre-populate with PO qty
      unit: it.unit,
      rate: it.rate,
      poQty: it.qty // remember original PO qty
    }))

    setForm({
      ...form,
      poId: po.poNo || po.id,
      items: receiveItems
    })
    setValidationError('')
  }

  const unitLabel = (code) => {
    if (!code) return '—'
    const found = unitOptions.find(u => u.name === code)
    return found ? found.unitName : code
  }

  const handleSave = () => {
    setSubmitted(true)
    if (!form.date || !form.supplier) return

    // Date Validation: Receipt Date cannot be before PO Date
    const po = db.pos.find(p => p.poNo === form.poId || p.id === form.poId)
    if (po && po.date && dayjs(form.date).isBefore(dayjs(po.date))) {
      setValidationError(`VALIDATION ERROR: Receipt Date (${dayjs(form.date).format('DD/MM/YYYY')}) cannot be before PO Date (${dayjs(po.date).format('DD/MM/YYYY')})!`)
      return
    }

    const hasInvalid = form.items.some(it => !it.name || !it.qty || Number(it.qty) <= 0 || !it.unit)
    if (hasInvalid) return

    const hasItems = form.items.some(it => it.name && it.qty)
    if (!hasItems) {
      setValidationError('Please add at least one material with name and received quantity.')
      return
    }

    // Validation: received qty should not exceed PO available balance
    for (let idx = 0; idx < form.items.length; idx++) {
      const row = form.items[idx]
      if (!row.name || !row.qty) continue
      const { available, orderedQty } = getPoBalance(row.name, row.color, form.supplier)
      if (orderedQty > 0 && Number(row.qty) > available) {
        const label = row.color ? `${row.name} (${row.color})` : row.name
        setValidationError(`Row ${idx + 1}: Received qty (${row.qty}) exceeds available PO balance (${available}) for "${label}".`)
        return
      }
    }

    const newDb = { ...db }
    if (editId) {
      newDb.receipts = newDb.receipts.map(r => r.id === editId ? { ...form, id: editId } : r)
    } else {
      const newId = 'REC-' + Date.now().toString().slice(-4)
      newDb.receipts.push({ ...form, id: newId })
    }
    saveDb({ receipts: newDb.receipts })
      .then(() => {
        loadData()
        setDialog(false)
      })
      .catch(err => setValidationError(err.message))
  }

  const handleDelete = () => {
    const newDb = { ...db, receipts: db.receipts.filter(r => r.id !== deleteId) }
    saveDb({ receipts: newDb.receipts })
      .then(() => {
        loadData()
        setDeleteId(null)
      })
      .catch(err => alert(err.message))
  }

  const setRowQty = (idx, value) => {
    const items = [...form.items]
    items[idx].qty = value
    setForm({ ...form, items })
  }

  const setRow = (idx, k) => (e) => {
    const items = [...form.items]
    items[idx] = { ...items[idx], [k]: e.target.value }
    setForm({ ...form, items })
  }

  const setRowField = (idx, k, value) => {
    const items = [...form.items]
    items[idx] = { ...items[idx], [k]: value }
    setForm({ ...form, items })
  }

  const addReceiveRow = () => {
    setForm({ ...form, items: [...form.items, emptyReceiveRow()] })
  }

  const removeReceiveRow = (idx) => {
    if (form.items.length === 1) return
    setForm({ ...form, items: form.items.filter((_, i) => i !== idx) })
  }

  // Compute PO ordered qty and already-received qty for a given material+color + supplier
  const getPoBalance = (materialName, materialColor, supplier) => {
    if (!materialName) return { orderedQty: 0, alreadyReceived: 0, available: 0 }
    const color = materialColor || ''

    // Total ordered in all POs for this supplier + material + color
    const orderedQty = (db.pos || [])
      .filter(po => po.supplier === supplier)
      .flatMap(po => (po.items || []).filter(it => it.name === materialName && (it.color || '') === color))
      .reduce((sum, it) => sum + Number(it.qty || 0), 0)

    // Total already received (excluding current edit) for same name+color
    const alreadyReceived = (db.receipts || [])
      .filter(r => r.id !== editId && r.supplier === supplier)
      .flatMap(r => (r.items || []).filter(it => it.name === materialName && (it.color || '') === color))
      .reduce((sum, it) => sum + Number(it.qty || 0), 0)

    return { 
      orderedQty, 
      alreadyReceived, 
      available: orderedQty - alreadyReceived 
    }
  }

  return (
    <Box className="page-enter">
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: 'rgba(108, 99, 255, 0.1)', color: '#6C63FF', borderRadius: 2, width: 46, height: 46 }}>
            <WarehouseRoundedIcon />
          </Avatar>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', lineHeight: 1.2 }}>RM Stock IN</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>Receive goods against raw material purchase orders (GRN)</Typography>
          </Box>
        </Box>
        <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={openAdd}
          sx={{ borderRadius: 2, fontWeight: 700, background: 'linear-gradient(135deg,#6C63FF,#9B94FF)', boxShadow: '0 4px 14px rgba(108,99,255,0.35)' }}>
          Receive Stock
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
            <Typography key={h} variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: '0.05em' }}>{h}</Typography>
          ))}
        </Box>

        {filtered.length === 0 ? (
          <Box sx={{ py: 6, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>No receipts logged.</Typography>
          </Box>
        ) : (
          <Stack divider={<Divider />}>
            {paginated.map(r => (
              <Box key={r.id} className="grid-table-row" sx={{ display: 'grid', gridTemplateColumns: COL, px: 2, py: 1.5, alignItems: 'center', '&:hover': { bgcolor: 'rgba(108,99,255,0.03)' }, transition: 'background 0.15s', minWidth: '950px' }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>{r.date ? dayjs(r.date).format('DD/MM/YYYY') : '—'}</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>{r.supplier}</Typography>
                <Box>
                  {r.items.map((it, idx) => (
                    <Typography key={idx} variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
                      • {it.name} ({it.color}) x {it.qty} {unitLabel(it.unit)}
                    </Typography>
                  ))}
                </Box>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <Tooltip title="Edit"><IconButton size="small" sx={{ color: 'primary.main' }} onClick={() => openEdit(r)}><EditRoundedIcon fontSize="small" /></IconButton></Tooltip>
                  <Tooltip title="Delete"><IconButton size="small" sx={{ color: 'error.main' }} onClick={() => setDeleteId(r.id)}><DeleteRoundedIcon fontSize="small" /></IconButton></Tooltip>
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

      {/* ===== PO PENDING BALANCE REPORT ===== */}
      <Box sx={{ mt: 4, mb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
          <Avatar sx={{ bgcolor: 'rgba(245,158,11,0.1)', color: '#F59E0B', borderRadius: 2, width: 38, height: 38 }}>
            <AssessmentRoundedIcon fontSize="small" />
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary', lineHeight: 1.2 }}>PO Pending Balance Report</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Order Given vs Received vs Balance Pending — per PO per Material</Typography>
          </Box>
        </Box>

        {(db.pos || []).length === 0 ? (
          <Card><Box sx={{ py: 5, textAlign: 'center' }}><Typography variant="body2" sx={{ color: 'text.secondary' }}>No Purchase Orders found.</Typography></Box></Card>
        ) : (
          <Stack spacing={2}>
            {(db.pos || []).map(po => {
              // Collect all receipts for this supplier
              const poReceipts = (db.receipts || []).filter(r => r.supplier === po.supplier)

              return (
                <Card key={po.id} sx={{ border: '1px solid', borderColor: 'divider', overflowX: 'auto' }}>
                  {/* PO Header */}
                  <Box sx={{ px: 2.5, py: 1.5, bgcolor: '#F8F9FC', borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 800, color: 'primary.main' }}>{po.poNo || po.id}</Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>Supplier: <strong>{po.supplier}</strong> &nbsp;|&nbsp; PO Date: {po.date ? dayjs(po.date).format('DD/MM/YYYY') : '—'}</Typography>
                    </Box>
                    <Chip
                      label={poReceipts.length === 0 ? 'Not Received' : 'Partially / Fully Received'}
                      size="small"
                      icon={poReceipts.length === 0 ? <PendingRoundedIcon style={{ fontSize: 13 }} /> : <CheckCircleRoundedIcon style={{ fontSize: 13 }} />}
                      sx={{
                        fontWeight: 700,
                        fontSize: '0.65rem',
                        bgcolor: poReceipts.length === 0 ? 'rgba(239,68,68,0.1)' : 'rgba(0,192,127,0.1)',
                        color: poReceipts.length === 0 ? '#EF4444' : '#00C07F',
                      }}
                    />
                  </Box>

                  {/* Material Rows */}
                  <Box sx={{ px: 2.5, py: 1 }}>
                    {/* Column Headers */}
                    <Box className="grid-table-row" sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 160px', gap: 2, pb: 1, borderBottom: '1px solid', borderColor: 'divider', mb: 1, minWidth: '950px' }}>
                      {['Material', 'Color', 'Unit', 'Ordered Qty', 'Received Qty', 'Balance Pending'].map(h => (
                        <Typography key={h} variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.62rem', textTransform: 'uppercase' }}>{h}</Typography>
                      ))}
                    </Box>

                    {(po.items || []).map((item, idx) => {
                      const orderedQty = Number(item.qty || 0)
                      const receivedQty = poReceipts.reduce((sum, rec) => {
                        const matchedItem = (rec.items || []).find(it => it.name === item.name && it.color === item.color)
                        return sum + Number(matchedItem?.qty || 0)
                      }, 0)

                      const balance = orderedQty - receivedQty
                      const pct = orderedQty > 0 ? Math.min((receivedQty / orderedQty) * 100, 100) : 0
                      const fullyReceived = balance <= 0

                      return (
                        <Box key={idx} className="grid-table-row" sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 160px', gap: 2, alignItems: 'center', py: 1, borderBottom: idx < (po.items || []).length - 1 ? '1px dashed' : 'none', borderColor: 'divider', minWidth: '950px' }}>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>{item.name}</Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>{item.color || '—'}</Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>{unitLabel(item.unit)}</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>{orderedQty.toLocaleString()}</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#00C07F' }}>{receivedQty.toLocaleString()}</Typography>
                          <Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                              <Typography variant="caption" sx={{ fontWeight: 800, color: fullyReceived ? '#00C07F' : '#EF4444', fontSize: '0.7rem' }}>
                                {fullyReceived ? '✓ Done' : `${balance.toLocaleString()} pending`}
                              </Typography>
                              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem' }}>{Math.round(pct)}%</Typography>
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={pct}
                              sx={{
                                height: 6,
                                borderRadius: 4,
                                bgcolor: 'rgba(0,0,0,0.06)',
                                '& .MuiLinearProgress-bar': {
                                  borderRadius: 4,
                                  bgcolor: fullyReceived ? '#00C07F' : pct > 50 ? '#F59E0B' : '#EF4444'
                                }
                              }}
                            />
                          </Box>
                        </Box>
                      )
                    })}
                  </Box>
                </Card>
              )
            })}
          </Stack>
        )}
      </Box>

      {/* Add/Edit Dialog */}
      <Dialog open={dialog} onClose={() => setDialog(false)} maxWidth="lg" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>{editId ? 'Edit Stock IN' : 'Receive PO Stock'}</DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2.5 }}>
          <Stack spacing={2}>
            {validationError && <Alert severity="error" sx={{ borderRadius: 2 }}>{validationError}</Alert>}
            
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" sx={{ fontWeight: 600, color: '#374151', mb: 0.5, display: 'block' }}>Supplier Party *</Typography>
                <Autocomplete
                  size="small"
                  options={supplierOptions}
                  value={form.supplier || null}
                  onChange={(e, val) => setForm({ ...form, supplier: val || '', items: [emptyReceiveRow()] })}
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
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" sx={{ fontWeight: 600, color: '#374151', mb: 0.5, display: 'block' }}>Stock IN Date *</Typography>
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

              {/* Items details table */}
              <Grid size={12}>
                <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 2, mt: 1 }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#6C63FF', mb: 1.5, display: 'block', textTransform: 'uppercase' }}>Items to Receive</Typography>

                  {/* Headers */}
                  <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 120px 120px 36px', gap: 1.5, pb: 1, borderBottom: '1px solid', borderColor: 'divider', mb: 1.5 }}>
                    {['Name of Raw Material *', 'Colour', 'Unit', 'PO Available', 'Received Qty *', ''].map(h => (
                      <Typography key={h} variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.62rem', textTransform: 'uppercase' }}>{h}</Typography>
                    ))}
                  </Box>

                  {/* Rows */}
                  {form.items.map((row, idx) => {
                    const { orderedQty, alreadyReceived, available } = getPoBalance(row.name, row.color, form.supplier)
                    const receivedNum = Number(row.qty || 0)
                    const exceeded = orderedQty > 0 && receivedNum > available
                    const hasPoData = orderedQty > 0

                    return (
                    <Box key={idx} sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 120px 120px 36px', gap: 1.5, alignItems: 'start', mb: 1.5 }}>
                      {/* Material name+color — show as "fgg (green)" variants */}
                      <Autocomplete
                        size="small"
                        options={supplierRMOptions.map(it => it.displayKey)}
                        value={row.name ? (row.color ? `${row.name} (${row.color})` : row.name) : null}
                        onChange={(e, val) => {
                          const selected = supplierRMOptions.find(it => it.displayKey === val)
                          const items = [...form.items]
                          items[idx] = {
                            ...items[idx],
                            name: selected?.name || val || '',
                            color: selected?.color ?? items[idx].color,
                            unit: selected?.unit || items[idx].unit
                          }
                          setForm({ ...form, items })
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            placeholder="Select PO material..."
                            error={submitted && !row.name}
                            helperText={submitted && !row.name ? 'Required' : ''}
                          />
                        )}
                      />
                      {/* Color read-only from catalog, but still editable */}
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

                      {/* PO Available Balance display */}
                      <Box sx={{ pt: 0.5 }}>
                        {hasPoData ? (
                          <>
                            <Typography variant="caption" sx={{ fontWeight: 800, color: available > 0 ? '#00C07F' : '#EF4444', display: 'block', fontSize: '0.75rem' }}>
                              {available > 0 ? `${available} available` : 'No stock left'}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem', display: 'block' }}>
                              PO: {orderedQty} | Recd: {alreadyReceived}
                            </Typography>
                          </>
                        ) : (
                          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem' }}>
                            {row.name ? 'No PO stock' : '—'}
                          </Typography>
                        )}
                      </Box>

                      <Box>
                        <TextField
                          size="small"
                          type="number"
                          value={row.qty}
                          onChange={e => setRowQty(idx, e.target.value)}
                          placeholder="0"
                          error={exceeded || (submitted && (!row.qty || Number(row.qty) <= 0))}
                          helperText={submitted && (!row.qty || Number(row.qty) <= 0) ? 'Required & > 0' : ''}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              '& fieldset': { borderColor: (exceeded || (submitted && (!row.qty || Number(row.qty) <= 0))) ? '#EF4444' : undefined }
                            }
                          }}
                        />
                        {exceeded && (
                          <Typography variant="caption" sx={{ color: '#EF4444', fontSize: '0.65rem', display: 'block', mt: 0.3 }}>
                            Max: {available}
                          </Typography>
                        )}
                      </Box>

                      <IconButton size="small" onClick={() => removeReceiveRow(idx)} disabled={form.items.length === 1} sx={{ color: 'error.main', mt: 0.5 }}>
                        <DeleteRoundedIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  )})}

                  <Button startIcon={<AddRoundedIcon />} onClick={addReceiveRow} size="small" variant="outlined"
                    sx={{ borderStyle: 'dashed', borderRadius: 2, fontWeight: 700, mt: 0.5 }}>
                    Add Item
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Stack>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button onClick={() => setDialog(false)} variant="outlined" sx={{ borderRadius: 2, fontWeight: 600 }}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" sx={{ borderRadius: 2, fontWeight: 700, background: 'linear-gradient(135deg,#6C63FF,#9B94FF)', boxShadow: 'none' }}>
            Receive GRN
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete dialog */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Delete Receipt?</DialogTitle>
        <DialogContent><Typography variant="body2" sx={{ color: 'text.secondary' }}>This action cannot be undone.</Typography></DialogContent>
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button onClick={() => setDeleteId(null)} variant="outlined" sx={{ borderRadius: 2, fontWeight: 600 }}>Cancel</Button>
          <Button onClick={handleDelete} variant="contained" color="error" sx={{ borderRadius: 2, fontWeight: 700 }}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
