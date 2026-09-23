import React, { useState, useEffect } from 'react'
import {
  Box, Typography, Card, CardContent, Button, IconButton, Alert,
  TextField, InputAdornment, Dialog, DialogTitle, DialogContent,
  DialogActions, Grid, Stack, Divider, Tooltip, Avatar, MenuItem, Chip,
  TablePagination, Autocomplete
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import dayjs from 'dayjs'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded'
import LocalShippingRoundedIcon from '@mui/icons-material/LocalShippingRounded'
import { getDb, saveDb, getMasters } from './mockDb'

const COL = '110px 130px 1.5fr 100px 100px 100px 100px'
const HEADS = ['Ship Date', 'Invoice No.', 'Party / Client', 'PI No.', 'Item Name', 'Qty Shipped', 'Actions']

const emptyItemRow = (defaultItemNo = '') => ({
  itemNo: defaultItemNo,
  qty: ''
})

const emptyForm = () => ({
  date: '',
  invNo: '',
  party: '',
  piNo: '',
  items: []
})

export default function Shipment() {
  const [db, setDb] = useState({ pis: [], shipments: [], finishing: [] })
  const [partyOptions, setPartyOptions] = useState([])
  const [search, setSearch] = useState('')
  const [dialog, setDialog] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(emptyForm())
  const [deleteId, setDeleteId] = useState(null)
  const [validationError, setValidationError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  useEffect(() => {
    setPage(0)
  }, [search])

  const loadData = () => {
    getDb(['shipments', 'finishing', 'pis']).then(data => setDb(data)).catch(err => console.error(err))
  }

  useEffect(() => {
    loadData()
    getMasters('buyers')
      .then(data => setPartyOptions(data.map(b => b.name)))
      .catch(err => console.error(err))
  }, [])

  const filtered = (db.shipments || []).filter(s =>
    s.invNo?.toLowerCase().includes(search.toLowerCase()) ||
    s.party?.toLowerCase().includes(search.toLowerCase()) ||
    s.piNo?.toLowerCase().includes(search.toLowerCase()) ||
    s.itemNo?.toLowerCase().includes(search.toLowerCase())
  )

  const openAdd = () => {
    setValidationError('')
    setSubmitted(false)
    setEditId(null)
    setForm({
      ...emptyForm(),
      piNo: '',
      items: [emptyItemRow('')]
    })
    setDialog(true)
  }

  const openEdit = (ship) => {
    setValidationError('')
    setSubmitted(false)
    setEditId(ship.invNo) // Use invoice number as batch edit key
    
    const matching = (db.shipments || []).filter(s => s.invNo === ship.invNo)
    setForm({
      date: ship.date,
      invNo: ship.invNo,
      party: ship.party,
      piNo: ship.piNo,
      items: matching.map(m => ({ itemNo: m.itemNo, qty: m.qty }))
    })
    setDialog(true)
  }

  const handlePIChange = (piNoValue) => {
    const selectedPi = db.pis.find(p => p.piNo === piNoValue)
    const defaultItemNo = selectedPi && selectedPi.products.length > 0 ? selectedPi.products[0].itemNo : ''
    setForm({
      ...form,
      piNo: piNoValue,
      items: [emptyItemRow(defaultItemNo)]
    })
  }

  const handleSave = () => {
    setSubmitted(true)
    setValidationError('')
    if (!form.date || !form.invNo || !form.party || !form.piNo || form.items.length === 0) return

    // Validation: PI must belong to selected Party
    const selectedPi = db.pis.find(p => p.piNo === form.piNo)
    const piBuyer = selectedPi?.products?.[0]?.buyerName
    if (piBuyer && piBuyer.trim().toLowerCase() !== form.party.trim().toLowerCase()) {
      setValidationError(`VALIDATION ERROR: Selected PI No (${form.piNo}) belongs to "${piBuyer}", not the selected Party "${form.party}"!`)
      return
    }

    // Date Validation: Shipment Date cannot be before latest Finishing Date for this PI
    const finishings = (db.finishing || []).filter(f => f.piNo === form.piNo)
    const latestFinishingDate = finishings.reduce((latest, f) => {
      if (!latest) return f.date
      return dayjs(f.date).isAfter(dayjs(latest)) ? f.date : latest
    }, null)

    if (latestFinishingDate && dayjs(form.date).isBefore(dayjs(latestFinishingDate))) {
      setValidationError(`VALIDATION ERROR: Shipment Date (${dayjs(form.date).format('DD/MM/YYYY')}) cannot be before latest Finishing Date (${dayjs(latestFinishingDate).format('DD/MM/YYYY')})!`)
      return
    }

    // Validate empty values
    const hasEmpty = form.items.some(it => !it.itemNo || !it.qty || Number(it.qty) <= 0)
    if (hasEmpty) {
      setValidationError('VALIDATION ERROR: Please select item name and enter a valid quantity for all rows.')
      return
    }

    // Validate shipment qty against finished qty for each item
    for (let i = 0; i < form.items.length; i++) {
      const item = form.items[i]
      
      const totalFinished = (db.finishing || [])
        .filter(f => f.piNo === form.piNo && f.itemNo === item.itemNo)
        .reduce((sum, f) => sum + Number(f.qty || 0), 0)

      const totalShippedOther = (db.shipments || [])
        .filter(s => s.invNo !== editId && s.piNo === form.piNo && s.itemNo === item.itemNo)
        .reduce((sum, s) => sum + Number(s.qty || 0), 0)

      const currentDialogTotal = form.items
        .filter(it => it.itemNo === item.itemNo)
        .reduce((sum, it) => sum + Number(it.qty || 0), 0)

      const maxAllowed = totalFinished - totalShippedOther
      if (currentDialogTotal > maxAllowed) {
        setValidationError(`VALIDATION ERROR at row ${i + 1}: Shipped quantity for "${item.itemNo}" exceeds available finished stock. Max available to ship: ${maxAllowed} pcs. (Total finished: ${totalFinished} pcs, Already shipped in other invoices: ${totalShippedOther} pcs)`)
        return
      }
    }

    const newDb = { ...db }
    
    // If editing, remove old entries under the original invoice number
    if (editId) {
      newDb.shipments = newDb.shipments.filter(s => s.invNo !== editId)
    }

    // Add new entries
    form.items.forEach(row => {
      const newId = 'SHIP-' + Date.now().toString().slice(-4) + Math.random().toString().slice(-2)
      newDb.shipments.push({
        id: newId,
        date: form.date,
        invNo: form.invNo,
        party: form.party,
        piNo: form.piNo,
        itemNo: row.itemNo,
        qty: Number(row.qty)
      })
    })

    saveDb({ shipments: newDb.shipments })
      .then(() => {
        loadData()
        setDialog(false)
      })
      .catch(err => setValidationError(err.message))
  }

  const handleDelete = () => {
    const newDb = { ...db, shipments: db.shipments.filter(s => s.id !== deleteId) }
    saveDb({ shipments: newDb.shipments })
      .then(() => {
        loadData()
        setDeleteId(null)
      })
      .catch(err => alert(err.message))
  }

  const setRow = (idx, k, value) => {
    const items = [...form.items]
    items[idx] = { ...items[idx], [k]: value }
    setForm({ ...form, items })
  }

  const addRow = () => {
    const selectedPi = db.pis.find(p => p.piNo === form.piNo)
    const defaultItemNo = selectedPi && selectedPi.products.length > 0 ? selectedPi.products[0].itemNo : ''
    setForm({ ...form, items: [...form.items, emptyItemRow(defaultItemNo)] })
  }

  const removeRow = (idx) => {
    if (form.items.length === 1) return
    setForm({ ...form, items: form.items.filter((_, i) => i !== idx) })
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

      {/* Search */}
      <Card sx={{ mb: 2.5 }}>
        <CardContent sx={{ p: 2 }}>
          <TextField fullWidth size="small" placeholder="Search by Invoice No, PI No, Item Name, Party..."
            value={search} onChange={e => setSearch(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchRoundedIcon sx={{ color: '#9CA3AF', fontSize: 18 }} /></InputAdornment> }} />
          {search.trim() && (
            <Box sx={{ mt: 1 }}>
              <Chip
                label={`Showing all ${filtered.length} matching records for "${search.trim()}"`}
                size="small" color="primary" variant="outlined"
                sx={{ fontWeight: 600, fontSize: '0.75rem' }}
              />
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Table */}
      <Card sx={{ overflowX: 'auto' }}>
        <Box className="grid-table-row" sx={{ display: 'grid', gridTemplateColumns: COL, px: 2, py: 1.25, bgcolor: '#F8F9FC', borderBottom: '1px solid', borderColor: 'divider', minWidth: '950px' }}>
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
            {(search.trim() ? filtered : filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)).map(s => (
              <Box key={s.id} className="grid-table-row" sx={{ display: 'grid', gridTemplateColumns: COL, px: 2, py: 1.5, alignItems: 'center', '&:hover': { bgcolor: 'rgba(108,99,255,0.03)' }, minWidth: '950px' }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>{s.date ? dayjs(s.date).format('DD/MM/YYYY') : '—'}</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>{s.invNo}</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>{s.party}</Typography>
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>{s.piNo}</Typography>
                <Chip label={s.itemNo || '—'} size="small" sx={{ fontWeight: 700, fontSize: '0.7rem', width: 'fit-content' }} />
                <Typography variant="body2" sx={{ fontWeight: 700 }}>{Number(s.qty || 0).toLocaleString()} pcs</Typography>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <Tooltip title="Edit Invoice"><IconButton size="small" sx={{ color: 'primary.main' }} onClick={() => openEdit(s)}><EditRoundedIcon fontSize="small" /></IconButton></Tooltip>
                  <Tooltip title="Delete Item"><IconButton size="small" sx={{ color: 'error.main' }} onClick={() => setDeleteId(s.id)}><DeleteRoundedIcon fontSize="small" /></IconButton></Tooltip>
                </Box>
              </Box>
            ))}
          </Stack>
        )}
        {!search.trim() && filtered.length > rowsPerPage && (
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
            rowsPerPageOptions={[10, 25, 50, 100]}
          />
        )}
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialog} onClose={() => setDialog(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>{editId ? 'Edit Shipment Details' : 'Log Shipment'}</DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2.5 }}>
          {validationError && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{validationError}</Alert>}
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#374151', mb: 0.5, display: 'block' }}>Shipment Date *</Typography>
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
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#374151', mb: 0.5, display: 'block' }}>Invoice No *</Typography>
              <TextField fullWidth size="small" value={form.invNo} onChange={f('invNo')} placeholder="e.g. INV-JUT-1002"
                error={submitted && !form.invNo}
                helperText={submitted && !form.invNo ? 'Required' : ''}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#374151', mb: 0.5, display: 'block' }}>Party / Client Name *</Typography>
              <Autocomplete
                size="small"
                options={partyOptions}
                value={form.party || null}
                onChange={(e, val) => setForm({ ...form, party: val || '', piNo: '', items: [] })}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Select Party"
                    error={submitted && !form.party}
                    helperText={submitted && !form.party ? 'Required' : ''}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#374151', mb: 0.5, display: 'block' }}>PI No *</Typography>
              <Autocomplete
                size="small"
                options={form.party ? db.pis.filter(p => (p.products || []).some(pr => pr.buyerName?.trim().toLowerCase() === form.party?.trim().toLowerCase())).map(p => p.piNo) : db.pis.map(p => p.piNo)}
                value={form.piNo || null}
                onChange={(e, val) => handlePIChange(val || '')}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Select PI No"
                    error={submitted && !form.piNo}
                    helperText={submitted && !form.piNo ? 'Required' : ''}
                  />
                )}
              />
            </Grid>

            {/* Dynamic Items Table */}
            <Grid size={12}>
              <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 2, mt: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#6C63FF', mb: 1.5, display: 'block', textTransform: 'uppercase' }}>Shipment Items</Typography>
                
                {/* Headers */}
                <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr 36px', gap: 2, pb: 1, borderBottom: '1px solid', borderColor: 'divider', mb: 1.5 }}>
                  {['Item Name *', 'Qty Shipped *', ''].map(h => (
                    <Typography key={h} variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.62rem', textTransform: 'uppercase' }}>{h}</Typography>
                  ))}
                </Box>

                {/* Rows */}
                <Stack spacing={1.5}>
                  {form.items.map((row, idx) => (
                    <Box key={idx} sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr 36px', gap: 2, alignItems: 'flex-start' }}>
                      <Autocomplete
                        size="small"
                        options={activeItemNos}
                        value={row.itemNo || null}
                        onChange={(e, val) => {
                          const items = [...form.items]
                          items[idx] = { ...items[idx], itemNo: val || '' }
                          setForm({ ...form, items })
                        }}
                        disabled={!form.piNo}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            placeholder="Item"
                            error={submitted && !row.itemNo}
                            helperText={submitted && !row.itemNo ? 'Required' : ''}
                          />
                        )}
                      />

                      <TextField
                        size="small"
                        type="number"
                        value={row.qty}
                        onChange={e => setRow(idx, 'qty', e.target.value)}
                        placeholder="0"
                        error={submitted && (!row.qty || Number(row.qty) <= 0)}
                        helperText={submitted && (!row.qty || Number(row.qty) <= 0) ? 'Required' : ''}
                      />

                      <IconButton size="small" onClick={() => removeRow(idx)} disabled={form.items.length === 1} sx={{ color: 'error.main', mt: 0.5 }}>
                        <DeleteRoundedIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}
                </Stack>

                <Button startIcon={<AddRoundedIcon />} onClick={addRow} size="small" variant="outlined" sx={{ borderStyle: 'dashed', borderRadius: 2, fontWeight: 700, mt: 1.5 }} disabled={!form.piNo}>
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
