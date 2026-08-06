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
import ContentCutRoundedIcon from '@mui/icons-material/ContentCutRounded'
import FileUploadRoundedIcon from '@mui/icons-material/FileUploadRounded'
import CloudDoneRoundedIcon from '@mui/icons-material/CloudDoneRounded'
import { getDb, saveDb } from './mockDb'

const CUTTER_OPTIONS = ['AB', 'Apex Cutting Services', 'Precision Die Cutters', 'Quality Slitting Works']
const RM_OPTIONS = ['Raw Jute Fibre A-Grade', 'Raw Cotton Yarn 40s', 'Lamination Film Transparent', 'Printing Ink - Jet Black', 'Fabric 10 Oz']
const COLOR_OPTIONS = ['Black', 'Natural', 'White', 'Clear', 'Golden']

const emptyItemRow = (defaultItemNo = '') => ({
  cutterName: 'AB',
  itemNo: defaultItemNo,
  qty: '',
  rawMaterial: 'Fabric 10 Oz',
  rawMaterialColor: 'Black',
  rawMaterialUsed: '',
  rawMaterialRejection: '',
  billRec: 'No',
  billNo: '',
  billDate: '',
  billFile: '',
  remarks: ''
})

const emptyForm = () => ({
  date: '',
  piNo: '',
  items: [emptyItemRow()]
})

const COL = '130px 110px 1.2fr 90px 90px 1.5fr 100px 100px 100px'
const HEADS = ['PI No.', 'Date', 'Cutter Name', 'Item No', 'Qty', 'Raw Material', 'Used Qty', 'Bill No', 'Actions']

export default function Cutting() {
  const [db, setDb] = useState({ pis: [], cuttings: [] })
  const [search, setSearch] = useState('')
  const [dialog, setDialog] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(emptyForm())
  const [deleteId, setDeleteId] = useState(null)
  const [validationError, setValidationError] = useState('')

  useEffect(() => {
    const currentDb = getDb()
    setDb(currentDb)
  }, [])

  const filtered = (db.cuttings || []).filter(c =>
    c.piNo?.toLowerCase().includes(search.toLowerCase()) ||
    c.date?.toLowerCase().includes(search.toLowerCase()) ||
    c.items.some(it => it.cutterName?.toLowerCase().includes(search.toLowerCase()) || it.itemNo?.toLowerCase().includes(search.toLowerCase()))
  )

  const openAdd = () => {
    setValidationError('')
    setEditId(null)
    setForm(emptyForm())
    setDialog(true)
  }

  const openEdit = (cut) => {
    setValidationError('')
    setEditId(cut.id)
    setForm({
      piNo: cut.piNo,
      date: cut.date,
      items: cut.items || [emptyItemRow()]
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
    if (!form.piNo || !form.date) return

    // VALIDATION: if cutting qty is greater than order qty. only 2 % allowance is allowed.
    const selectedPi = db.pis.find(p => p.piNo === form.piNo)
    if (selectedPi) {
      let isOverCut = false
      form.items.forEach(item => {
        const matchingPiProduct = selectedPi.products.find(p => p.itemNo === item.itemNo)
        if (matchingPiProduct) {
          const maxAllowed = Number(matchingPiProduct.qty) * 1.02
          if (Number(item.qty) > maxAllowed) {
            isOverCut = true
          }
        }
      })

      if (isOverCut) {
        setValidationError('VALIDATION ERROR: Cutting output quantity exceeds PI ordered quantity by more than the 2% allowance!')
        return
      }
    }

    const newDb = { ...db }
    if (editId) {
      newDb.cuttings = newDb.cuttings.map(c => c.id === editId ? { ...form, id: editId } : c)
    } else {
      const newId = 'CUT-' + Date.now().toString().slice(-4)
      newDb.cuttings.push({ ...form, id: newId })
    }
    saveDb(newDb)
    setDb(newDb)
    setDialog(false)
  }

  const handleDelete = () => {
    const newDb = { ...db, cuttings: db.cuttings.filter(c => c.id !== deleteId) }
    saveDb(newDb)
    setDb(newDb)
    setDeleteId(null)
  }

  const setRow = (idx, k) => (e) => {
    const items = [...form.items]
    items[idx] = { ...items[idx], [k]: e.target.value }
    setForm({ ...form, items })
  }

  const handleFileUpload = (idx) => (e) => {
    const file = e.target.files[0]
    if (file) {
      const items = [...form.items]
      items[idx] = { ...items[idx], billFile: file.name }
      setForm({ ...form, items })
    }
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

  const selectedPi = db.pis.find(p => p.piNo === form.piNo)
  const activeItemNos = selectedPi ? selectedPi.products.map(pr => pr.itemNo) : []

  const flatRows = []
  filtered.forEach(cut => {
    cut.items.forEach((it, index) => {
      flatRows.push({
        ...it,
        cutId: cut.id,
        piNo: cut.piNo,
        date: cut.date,
        parentCut: cut
      })
    })
  })

  return (
    <Box className="page-enter">
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: 'rgba(108, 99, 255, 0.1)', color: '#6C63FF', borderRadius: 2, width: 46, height: 46 }}>
            <ContentCutRoundedIcon />
          </Avatar>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', lineHeight: 1.2 }}>Cutting</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>Issue raw materials to cutters and log output panel sheets</Typography>
          </Box>
        </Box>
        <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={openAdd}
          sx={{ borderRadius: 2, fontWeight: 700, background: 'linear-gradient(135deg,#6C63FF,#9B94FF)', boxShadow: '0 4px 14px rgba(108,99,255,0.35)' }}>
          Log Cutting
        </Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Total Cutting Batches', value: db.cuttings.length, c: '#6C63FF', b: 'rgba(108,99,255,0.08)' },
          { label: 'Total Output Cut Panels', value: `${flatRows.reduce((sum, r) => sum + Number(r.qty || 0), 0).toLocaleString()} pcs`, c: '#00C07F', b: 'rgba(0,192,127,0.08)' },
          { label: 'Total Raw Material Used', value: `${flatRows.reduce((sum, r) => sum + Number(r.rawMaterialUsed || 0), 0).toLocaleString()} units`, c: '#F59E0B', b: 'rgba(245,158,11,0.08)' },
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
          <TextField fullWidth size="small" placeholder="Search by PI No, Cutter Name, Item No..."
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
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>No cutting entries logged.</Typography>
          </Box>
        ) : (
          <Stack divider={<Divider />}>
            {flatRows.map((row, rIdx) => (
              <Box key={`${row.cutId}-${rIdx}`} sx={{ display: 'grid', gridTemplateColumns: COL, px: 2, py: 1.5, alignItems: 'center', '&:hover': { bgcolor: 'rgba(108,99,255,0.03)' }, transition: 'background 0.15s' }}>
                <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>{row.piNo}</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>{row.date}</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>{row.cutterName}</Typography>
                <Chip label={row.itemNo || '—'} size="small" sx={{ fontWeight: 700, fontSize: '0.7rem', width: 'fit-content' }} />
                <Typography variant="body2" sx={{ fontWeight: 700 }}>{Number(row.qty || 0).toLocaleString()}</Typography>
                <Typography variant="body2">{row.rawMaterial} ({row.rawMaterialColor})</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{row.rawMaterialUsed} units</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  {row.billRec === 'Yes' ? `${row.billNo} ${row.billFile ? '📎' : ''}` : '—'}
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <Tooltip title="Edit Batch"><IconButton size="small" sx={{ color: 'primary.main' }} onClick={() => openEdit(row.parentCut)}><EditRoundedIcon fontSize="small" /></IconButton></Tooltip>
                  <Tooltip title="Delete Batch"><IconButton size="small" sx={{ color: 'error.main' }} onClick={() => setDeleteId(row.cutId)}><DeleteRoundedIcon fontSize="small" /></IconButton></Tooltip>
                </Box>
              </Box>
            ))}
          </Stack>
        )}
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialog} onClose={() => setDialog(false)} maxWidth={false} fullWidth PaperProps={{ sx: { borderRadius: 3, width: '1500px', maxWidth: '95%' } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>{editId ? 'Edit Cutting Entry' : 'Log Cutting Batch'}</DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2.5, maxHeight: '80vh', overflowY: 'auto' }}>
          <Stack spacing={2}>
            {validationError && <Alert severity="error" sx={{ borderRadius: 2 }}>{validationError}</Alert>}
            
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" sx={{ fontWeight: 600, color: '#374151', mb: 0.5, display: 'block' }}>PI No *</Typography>
                <TextField fullWidth size="small" select value={form.piNo} onChange={e => handlePIChange(e.target.value)} disabled={!!editId}>
                  {db.pis.map(p => <MenuItem key={p.id} value={p.piNo}>{p.piNo}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" sx={{ fontWeight: 600, color: '#374151', mb: 0.5, display: 'block' }}>Date *</Typography>
                <TextField fullWidth size="small" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
              </Grid>
            </Grid>

            {/* Dynamic Items Table */}
            <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 2, overflowX: 'auto' }}>
              <Typography variant="caption" sx={{ fontWeight: 800, color: '#6C63FF', mb: 1.5, display: 'block', textTransform: 'uppercase' }}>Cutting Items</Typography>
              
              {/* Table Header */}
              <Box sx={{ display: 'grid', gridTemplateColumns: '140px 100px 90px 150px 100px 90px 90px 90px 110px 100px 110px 120px 36px', gap: 1.5, pb: 1, borderBottom: '1px solid', borderColor: 'divider', mb: 1.5, minWidth: '1200px' }}>
                {['Cutter Name *', 'item no. *', 'Qty *', 'RM Name *', 'RM Colour', 'RM Used *', 'RM Rej', 'Bill Rec', 'Bill No', 'Bill Date', 'Bill Upload', 'Remarks', ''].map(h => (
                  <Typography key={h} variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.62rem', textTransform: 'uppercase' }}>{h}</Typography>
                ))}
              </Box>

              {/* Rows */}
              <Stack spacing={1.5} sx={{ minWidth: '1200px' }}>
                {form.items.map((row, idx) => (
                  <Box key={idx} sx={{ display: 'grid', gridTemplateColumns: '140px 100px 90px 150px 100px 90px 90px 90px 110px 100px 110px 120px 36px', gap: 1.5, alignItems: 'center' }}>
                    
                    <TextField size="small" select value={row.cutterName} onChange={setRow(idx, 'cutterName')}>
                      {CUTTER_OPTIONS.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                    </TextField>

                    <TextField size="small" select value={row.itemNo} onChange={setRow(idx, 'itemNo')} disabled={!form.piNo}>
                      {activeItemNos.map(itemNo => <MenuItem key={itemNo} value={itemNo}>{itemNo}</MenuItem>)}
                    </TextField>

                    <TextField size="small" type="number" value={row.qty} onChange={setRow(idx, 'qty')} placeholder="0" />

                    <TextField size="small" select value={row.rawMaterial} onChange={setRow(idx, 'rawMaterial')}>
                      {RM_OPTIONS.map(rm => <MenuItem key={rm} value={rm}>{rm}</MenuItem>)}
                    </TextField>

                    <TextField size="small" select value={row.rawMaterialColor} onChange={setRow(idx, 'rawMaterialColor')}>
                      {COLOR_OPTIONS.map(col => <MenuItem key={col} value={col}>{col}</MenuItem>)}
                    </TextField>

                    <TextField size="small" type="number" value={row.rawMaterialUsed} onChange={setRow(idx, 'rawMaterialUsed')} placeholder="Qty" />

                    <TextField size="small" type="number" value={row.rawMaterialRejection} onChange={setRow(idx, 'rawMaterialRejection')} placeholder="Rej" />

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

                    <TextField size="small" value={row.remarks} onChange={setRow(idx, 'remarks')} placeholder="Remarks" />

                    <IconButton size="small" onClick={() => removeRow(idx)} disabled={form.items.length === 1} sx={{ color: 'error.main' }}>
                      <DeleteRoundedIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
              </Stack>

              <Button startIcon={<AddRoundedIcon />} onClick={addRow} size="small" variant="outlined" sx={{ borderStyle: 'dashed', borderRadius: 2, fontWeight: 700, mt: 1.5 }} disabled={!form.piNo}>
                Add Multiple Item
              </Button>
            </Box>
          </Stack>
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
        <DialogTitle sx={{ fontWeight: 800 }}>Delete Cutting Entry?</DialogTitle>
        <DialogContent><Typography variant="body2" sx={{ color: 'text.secondary' }}>This action cannot be undone.</Typography></DialogContent>
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button onClick={() => setDeleteId(null)} variant="outlined" sx={{ borderRadius: 2, fontWeight: 600 }}>Cancel</Button>
          <Button onClick={handleDelete} variant="contained" color="error" sx={{ borderRadius: 2, fontWeight: 700 }}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
