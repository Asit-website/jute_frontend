import React, { useState, useEffect } from 'react'
import {
  Box, Typography, Card, CardContent, Button, IconButton, Alert,
  TextField, InputAdornment, Dialog, DialogTitle, DialogContent,
  DialogActions, Grid, Stack, Divider, Tooltip, Avatar, MenuItem, Chip
} from '@mui/material'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded'
import DoneAllRoundedIcon from '@mui/icons-material/DoneAllRounded'
import FileUploadRoundedIcon from '@mui/icons-material/FileUploadRounded'
import CloudDoneRoundedIcon from '@mui/icons-material/CloudDoneRounded'
import { getDb, saveDb } from './mockDb'

const FINISHER_OPTIONS = ['Standard Finishing Unit', 'Royal Jute Finishers', 'Perfect Glazing & Packing', 'Elite Coating Services']

const COL = '110px 1.5fr 100px 90px 90px 100px 140px 100px 100px'
const HEADS = ['Date', 'Finisher Name', 'PI No.', 'Item No', 'Qty Pack', 'Rej.', 'Ctn Dims (Pcs/Ctn)', 'QC Check', 'Actions']

const emptyFinishingRow = (defaultItemNo = '') => ({
  jobworkerName: 'Standard Finishing Unit',
  itemNo: defaultItemNo,
  qty: '',
  rejection: '0',
  ctnDims: '24x18x18',
  netWt: '',
  grossWt: '',
  pcsPerCtn: '100',
  billRec: 'No',
  billNo: '',
  billDate: '',
  billFile: '',
  remarks: '',
  qcCheckedBy: ''
})

const emptyForm = () => ({
  date: '',
  piNo: '',
  items: []
})

export default function FinishingPacking() {
  const [db, setDb] = useState({ pis: [], finishing: [] })
  const [search, setSearch] = useState('')
  const [dialog, setDialog] = useState(false)
  const [editId, setEditId] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [validationError, setValidationError] = useState('')

  // Batch header states
  const [batchDate, setBatchDate] = useState('')
  const [batchPiNo, setBatchPiNo] = useState('')
  const [batchItems, setBatchItems] = useState([])

  useEffect(() => {
    const currentDb = getDb()
    setDb(currentDb)
  }, [])

  const filtered = (db.finishing || []).filter(f =>
    f.jobworkerName?.toLowerCase().includes(search.toLowerCase()) ||
    f.piNo?.toLowerCase().includes(search.toLowerCase()) ||
    f.itemNo?.toLowerCase().includes(search.toLowerCase())
  )

  const openAdd = () => {
    setEditId(null)
    setValidationError('')
    setBatchDate('')
    const defaultPi = db.pis[0]?.piNo || ''
    setBatchPiNo(defaultPi)

    const selectedPi = db.pis.find(p => p.piNo === defaultPi)
    const defaultItemNo = selectedPi && selectedPi.products.length > 0 ? selectedPi.products[0].itemNo : ''

    setBatchItems([emptyFinishingRow(defaultItemNo)])
    setDialog(true)
  }

  const openEdit = (fin) => {
    setValidationError('')
    setEditId(fin.id)
    setBatchDate(fin.date)
    setBatchPiNo(fin.piNo)
    setBatchItems([{ ...fin }])
    setDialog(true)
  }

  const handlePIChange = (piNoValue) => {
    setBatchPiNo(piNoValue)
    const selectedPi = db.pis.find(p => p.piNo === piNoValue)
    const defaultItemNo = selectedPi && selectedPi.products.length > 0 ? selectedPi.products[0].itemNo : ''
    setBatchItems([emptyFinishingRow(defaultItemNo)])
  }

  const handleSave = () => {
    if (!batchDate || !batchPiNo || batchItems.length === 0) return

    const hasInvalid = batchItems.some(it => !it.itemNo || !it.qty)
    if (hasInvalid) {
      setValidationError('VALIDATION ERROR: Please select item number and quantity for all rows.')
      return
    }

    const newDb = { ...db }
    const savedItems = batchItems.map(item => ({ ...item, date: batchDate, piNo: batchPiNo }))

    if (editId) {
      newDb.finishing = newDb.finishing.map(f => f.id === editId ? { ...savedItems[0], id: editId } : f)
    } else {
      savedItems.forEach(item => {
        const newId = 'FIN-' + Date.now().toString().slice(-4) + Math.random().toString().slice(-2)
        newDb.finishing.push({ ...item, id: newId })
      })
    }
    saveDb(newDb)
    setDb(newDb)
    setDialog(false)
  }

  const handleDelete = () => {
    const newDb = { ...db, finishing: db.finishing.filter(f => f.id !== deleteId) }
    saveDb(newDb)
    setDb(newDb)
    setDeleteId(null)
  }

  const addRow = () => {
    const selectedPi = db.pis.find(p => p.piNo === batchPiNo)
    const defaultItemNo = selectedPi && selectedPi.products.length > 0 ? selectedPi.products[0].itemNo : ''
    setBatchItems([...batchItems, emptyFinishingRow(defaultItemNo)])
  }

  const removeRow = (idx) => {
    if (batchItems.length === 1) return
    setBatchItems(batchItems.filter((_, i) => i !== idx))
  }

  const setRow = (idx, k) => (e) => {
    const items = [...batchItems]
    items[idx] = { ...items[idx], [k]: e.target.value }
    setBatchItems(items)
  }

  const handleFileUpload = (idx) => (e) => {
    const file = e.target.files[0]
    if (file) {
      const items = [...batchItems]
      items[idx] = { ...items[idx], billFile: file.name }
      setBatchItems(items)
    }
  }

  const selectedPi = db.pis.find(p => p.piNo === batchPiNo)
  const activeItemNos = selectedPi ? selectedPi.products.map(pr => pr.itemNo) : []

  return (
    <Box className="page-enter">
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: 'rgba(108, 99, 255, 0.1)', color: '#6C63FF', borderRadius: 2, width: 46, height: 46 }}>
            <DoneAllRoundedIcon />
          </Avatar>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', lineHeight: 1.2 }}>Finishing & Packing</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>Log quality checks, cartoon weights, packing boxes and bill clearing</Typography>
          </Box>
        </Box>
        <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={openAdd}
          sx={{ borderRadius: 2, fontWeight: 700, background: 'linear-gradient(135deg,#6C63FF,#9B94FF)', boxShadow: '0 4px 14px rgba(108,99,255,0.35)' }}>
          Log Packing
        </Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Total Finished Lots', value: db.finishing.length, c: '#6C63FF', b: 'rgba(108,99,255,0.08)' },
          { label: 'Total Pcs Packed', value: `${db.finishing.reduce((sum, f) => sum + Number(f.qty || 0), 0).toLocaleString()} pcs`, c: '#00C07F', b: 'rgba(0,192,127,0.08)' },
          { label: 'Total Rejections Recorded', value: `${db.finishing.reduce((sum, f) => sum + Number(f.rejection || 0), 0).toLocaleString()} pcs`, c: '#EF4444', b: 'rgba(239,68,68,0.08)' },
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
          <TextField fullWidth size="small" placeholder="Search by PI No, Item No, Finisher Name..."
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
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>No finishing entries logged.</Typography>
          </Box>
        ) : (
          <Stack divider={<Divider />}>
            {filtered.map(f => (
              <Box key={f.id} sx={{ display: 'grid', gridTemplateColumns: COL, px: 2, py: 1.5, alignItems: 'center', '&:hover': { bgcolor: 'rgba(108,99,255,0.03)' } }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>{f.date}</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>{f.jobworkerName}</Typography>
                <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 700 }}>{f.piNo}</Typography>
                <Chip label={f.itemNo || '—'} size="small" sx={{ fontWeight: 700, fontSize: '0.7rem', width: 'fit-content' }} />
                <Typography variant="body2" sx={{ fontWeight: 700 }}>{f.qty} pcs</Typography>
                <Typography variant="body2" sx={{ color: 'error.main', fontWeight: 700 }}>{f.rejection || 0}</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {f.ctnDims} ({f.pcsPerCtn} / Ctn)
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 600 }}>{f.qcCheckedBy || '—'}</Typography>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <Tooltip title="Edit"><IconButton size="small" sx={{ color: 'primary.main' }} onClick={() => openEdit(f)}><EditRoundedIcon fontSize="small" /></IconButton></Tooltip>
                  <Tooltip title="Delete"><IconButton size="small" sx={{ color: 'error.main' }} onClick={() => setDeleteId(f.id)}><DeleteRoundedIcon fontSize="small" /></IconButton></Tooltip>
                </Box>
              </Box>
            ))}
          </Stack>
        )}
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialog} onClose={() => setDialog(false)} maxWidth={false} fullWidth PaperProps={{ sx: { borderRadius: 3, width: '1600px', maxWidth: '95%' } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>{editId ? 'Edit Finishing & Packing' : 'Log Finishing & Packing Lot'}</DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2.5, maxHeight: '80vh', overflowY: 'auto' }}>
          <Stack spacing={2.5}>
            {validationError && <Alert severity="error" sx={{ borderRadius: 2 }}>{validationError}</Alert>}

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" sx={{ fontWeight: 600, color: '#374151', mb: 0.5, display: 'block' }}>PI No. *</Typography>
                <TextField fullWidth size="small" select value={batchPiNo} onChange={e => handlePIChange(e.target.value)} disabled={!!editId}>
                  {db.pis.map(p => <MenuItem key={p.id} value={p.piNo}>{p.piNo}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" sx={{ fontWeight: 600, color: '#374151', mb: 0.5, display: 'block' }}>Finishing Date *</Typography>
                <TextField fullWidth size="small" type="date" value={batchDate} onChange={e => setBatchDate(e.target.value)} />
              </Grid>
            </Grid>

            {/* Dynamic Items Table */}
            <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 2, overflowX: 'auto' }}>
              <Typography variant="caption" sx={{ fontWeight: 800, color: '#6C63FF', mb: 1.5, display: 'block', textTransform: 'uppercase' }}>Finishing Items</Typography>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: '200px 140px 100px 90px 100px 80px 80px 80px 90px 110px 100px 110px 120px 36px', gap: 1.5, pb: 1, borderBottom: '1px solid', borderColor: 'divider', mb: 1.5, minWidth: '1450px' }}>
                {['Finisher Name *', 'Item No *', 'Qty *', 'Rej', 'Ctn Dims', 'Net Wt', 'Gross Wt', 'Pcs/Ctn', 'QC Check', 'Bill Rec', 'Bill No', 'Bill Date', 'Bill Upload', ''].map(h => (
                  <Typography key={h} variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.62rem', textTransform: 'uppercase' }}>{h}</Typography>
                ))}
              </Box>

              <Stack spacing={1.5} sx={{ minWidth: '1450px' }}>
                {batchItems.map((row, idx) => (
                  <Box key={idx} sx={{ display: 'grid', gridTemplateColumns: '200px 140px 100px 90px 100px 80px 80px 80px 90px 110px 100px 110px 120px 36px', gap: 1.5, alignItems: 'center' }}>
                    <TextField size="small" select value={row.jobworkerName} onChange={setRow(idx, 'jobworkerName')}>
                      {FINISHER_OPTIONS.map(fi => <MenuItem key={fi} value={fi}>{fi}</MenuItem>)}
                    </TextField>

                    <TextField size="small" select value={row.itemNo} onChange={setRow(idx, 'itemNo')} disabled={!batchPiNo}>
                      {activeItemNos.map(itemNo => <MenuItem key={itemNo} value={itemNo}>{itemNo}</MenuItem>)}
                    </TextField>

                    <TextField size="small" type="number" value={row.qty} onChange={setRow(idx, 'qty')} placeholder="0" />

                    <TextField size="small" type="number" value={row.rejection} onChange={setRow(idx, 'rejection')} placeholder="0" />

                    <TextField size="small" value={row.ctnDims} onChange={setRow(idx, 'ctnDims')} placeholder="Dims" />

                    <TextField size="small" type="number" value={row.netWt} onChange={setRow(idx, 'netWt')} placeholder="Net" />

                    <TextField size="small" type="number" value={row.grossWt} onChange={setRow(idx, 'grossWt')} placeholder="Gross" />

                    <TextField size="small" type="number" value={row.pcsPerCtn} onChange={setRow(idx, 'pcsPerCtn')} placeholder="100" />

                    <TextField size="small" value={row.qcCheckedBy} onChange={setRow(idx, 'qcCheckedBy')} placeholder="QC By" />

                    <TextField size="small" select value={row.billRec} onChange={setRow(idx, 'billRec')}>
                      {['Yes', 'No'].map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                    </TextField>

                    <TextField size="small" value={row.billNo} onChange={setRow(idx, 'billNo')} disabled={row.billRec === 'No'} placeholder="No" />

                    <TextField size="small" type="date" value={row.billDate} onChange={setRow(idx, 'billDate')} disabled={row.billRec === 'No'} />

                    <Button
                      size="small"
                      variant="outlined"
                      component="label"
                      disabled={row.billRec === 'No'}
                      color={row.billFile ? 'success' : 'primary'}
                      startIcon={row.billFile ? <CloudDoneRoundedIcon fontSize="small" /> : <FileUploadRoundedIcon fontSize="small" />}
                      sx={{ height: 40, textTransform: 'none', fontSize: '0.7rem', fontWeight: 700, borderRadius: 2 }}
                    >
                      {row.billFile ? 'Uploaded' : 'Upload'}
                      <input type="file" hidden onChange={handleFileUpload(idx)} />
                    </Button>

                    <IconButton size="small" onClick={() => removeRow(idx)} disabled={batchItems.length === 1} sx={{ color: 'error.main' }}>
                      <DeleteRoundedIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
              </Stack>
              <Button startIcon={<AddRoundedIcon />} onClick={addRow} size="small" variant="outlined" sx={{ borderStyle: 'dashed', borderRadius: 2, fontWeight: 700, mt: 1.5 }} disabled={!batchPiNo}>
                Add Multiple Item
              </Button>
            </Box>
          </Stack>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button onClick={() => setDialog(false)} variant="outlined" sx={{ borderRadius: 2, fontWeight: 600 }}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" sx={{ borderRadius: 2, fontWeight: 700, background: 'linear-gradient(135deg,#6C63FF,#9B94FF)', boxShadow: 'none' }}>
            Save Packing
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete dialog */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Delete Record?</DialogTitle>
        <DialogContent><Typography variant="body2" sx={{ color: 'text.secondary' }}>This action cannot be undone.</Typography></DialogContent>
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button onClick={() => setDeleteId(null)} variant="outlined" sx={{ borderRadius: 2, fontWeight: 600 }}>Cancel</Button>
          <Button onClick={handleDelete} variant="contained" color="error" sx={{ borderRadius: 2, fontWeight: 700 }}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
