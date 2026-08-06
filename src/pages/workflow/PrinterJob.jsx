import React, { useState, useEffect } from 'react'
import {
  Box, Typography, Card, CardContent, Button, IconButton, Alert, Tabs, Tab,
  TextField, InputAdornment, Dialog, DialogTitle, DialogContent,
  DialogActions, Grid, Stack, Divider, Tooltip, Avatar, MenuItem, Chip
} from '@mui/material'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded'
import PrintRoundedIcon from '@mui/icons-material/PrintRounded'
import FileUploadRoundedIcon from '@mui/icons-material/FileUploadRounded'
import CloudDoneRoundedIcon from '@mui/icons-material/CloudDoneRounded'
import { getDb, saveDb } from './mockDb'

const PRINTER_OPTIONS = ['Kolkata Color Press', 'PrintMaster India', 'Flex & Print Works', 'Digital Ink Studio']
const ACCESSORIES_OPTIONS = ['Ink & Thread', 'Color Paste', 'Solvent Only', 'Pigment Mix']

const COL_ISSUE = '110px 1.8fr 120px 100px 110px 160px 90px'
const HEADS_ISSUE = ['Issue Date', 'Printer Name', 'PI No.', 'Item No', 'Qty Issued', 'Accessories', 'Actions']
const MIN_W_ISSUE = '860px'

const COL_RECEIVE = '100px 1.4fr 110px 90px 90px 160px 1.2fr 120px 80px'
const HEADS_RECEIVE = ['Rec Date', 'Printer Name', 'PI No.', 'Item No', 'Qty Rec', 'Rejections (Fab/Fac)', 'Bill Details', 'QC Checked', 'Actions']
const MIN_W_RECEIVE = '1100px'

const emptyIssueRow = (defaultItemNo = '') => ({
  printerName: 'Kolkata Color Press',
  itemNo: defaultItemNo,
  qty: '',
  accessories: 'Ink & Thread',
  remarks: ''
})

const emptyReceiveRow = (defaultItemNo = '') => ({
  printerName: 'Kolkata Color Press',
  itemNo: defaultItemNo,
  qty: '',
  rejectionFabricator: '0',
  rejectionFactory: '0',
  rejectionRemarks: '',
  billRec: 'No',
  billNo: '',
  billDate: '',
  billFile: '',
  qcCheckedBy: ''
})

export default function PrinterJob() {
  const [tab, setTab] = useState(0) // 0: Issue, 1: Receive
  const [db, setDb] = useState({ printerJobs: { issues: [], receives: [] }, cuttings: [], pis: [] })
  const [search, setSearch] = useState('')
  const [dialog, setDialog] = useState(false)
  const [editId, setEditId] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [validationError, setValidationError] = useState('')

  // Batch header states (outside table)
  const [batchDate, setBatchDate] = useState('')
  const [batchPiNo, setBatchPiNo] = useState('')
  const [batchItems, setBatchItems] = useState([])

  useEffect(() => {
    const currentDb = getDb()
    setDb(currentDb)
  }, [])

  const handleSaveIssue = () => {
    if (!batchDate || !batchPiNo || batchItems.length === 0) return

    for (let idx = 0; idx < batchItems.length; idx++) {
      const item = batchItems[idx]
      if (!item.itemNo || !item.qty) continue

      const selectedPi = db.pis.find(p => p.piNo === batchPiNo)
      if (selectedPi) {
        const matchingProduct = selectedPi.products.find(pr => pr.itemNo === item.itemNo)
        if (matchingProduct && matchingProduct.printing !== 'Yes') {
          setValidationError(`VALIDATION ERROR at row ${idx + 1}: Item "${item.itemNo}" does not require printing in PI!`);
          return
        }
      }

      const totalCut = db.cuttings
        .filter(c => c.piNo === batchPiNo)
        .reduce((sum, c) => sum + c.items.filter(it => it.itemNo === item.itemNo).reduce((s, it) => s + Number(it.qty || 0), 0), 0)

      const totalIssued = db.printerJobs.issues
        .filter(i => i.id !== editId && i.piNo === batchPiNo && i.itemNo === item.itemNo)
        .reduce((sum, i) => sum + Number(i.qty || 0), 0)

      const availableStock = totalCut - totalIssued
      if (Number(item.qty) > availableStock) {
        setValidationError(`VALIDATION ERROR at row ${idx + 1}: Max available panels from cutting: ${availableStock} pcs.`);
        return
      }
    }

    const newDb = { ...db }
    const savedItems = batchItems.map(item => ({ ...item, date: batchDate, piNo: batchPiNo }))

    if (editId) {
      newDb.printerJobs.issues = newDb.printerJobs.issues.map(i => i.id === editId ? { ...savedItems[0], id: editId } : i)
    } else {
      savedItems.forEach(item => {
        const newId = 'PRT-I-' + Date.now().toString().slice(-4) + Math.random().toString().slice(-2)
        newDb.printerJobs.issues.push({ ...item, id: newId })
      })
    }
    saveDb(newDb)
    setDb(newDb)
    setDialog(false)
  }

  const handleSaveReceive = () => {
    if (!batchDate || !batchPiNo || batchItems.length === 0) return

    for (let idx = 0; idx < batchItems.length; idx++) {
      const item = batchItems[idx]
      if (!item.itemNo || !item.qty) continue

      const totalIssued = db.printerJobs.issues
        .filter(i => i.piNo === batchPiNo && i.itemNo === item.itemNo)
        .reduce((sum, i) => sum + Number(i.qty || 0), 0)

      const totalReceived = db.printerJobs.receives
        .filter(r => r.id !== editId && r.piNo === batchPiNo && r.itemNo === item.itemNo)
        .reduce((sum, r) => sum + Number(r.qty || 0), 0)

      const maxAllowed = totalIssued - totalReceived
      if (Number(item.qty) > maxAllowed) {
        setValidationError(`VALIDATION ERROR at row ${idx + 1}: Receive quantity cannot exceed print issued qty! Max allowed: ${maxAllowed} pcs.`);
        return
      }
    }

    const newDb = { ...db }
    const savedItems = batchItems.map(item => ({ ...item, date: batchDate, piNo: batchPiNo }))

    if (editId) {
      newDb.printerJobs.receives = newDb.printerJobs.receives.map(r => r.id === editId ? { ...savedItems[0], id: editId } : r)
    } else {
      savedItems.forEach(item => {
        const newId = 'PRT-R-' + Date.now().toString().slice(-4) + Math.random().toString().slice(-2)
        newDb.printerJobs.receives.push({ ...item, id: newId })
      })
    }
    saveDb(newDb)
    setDb(newDb)
    setDialog(false)
  }

  const handleDelete = () => {
    const newDb = { ...db }
    if (tab === 0) {
      newDb.printerJobs.issues = newDb.printerJobs.issues.filter(i => i.id !== deleteId)
    } else {
      newDb.printerJobs.receives = newDb.printerJobs.receives.filter(r => r.id !== deleteId)
    }
    saveDb(newDb)
    setDb(newDb)
    setDeleteId(null)
  }

  const openAdd = () => {
    setValidationError('')
    setEditId(null)
    setBatchDate('')
    const defaultPi = db.pis[0]?.piNo || ''
    setBatchPiNo(defaultPi)
    
    const selectedPi = db.pis.find(p => p.piNo === defaultPi)
    const defaultItemNo = selectedPi && selectedPi.products.length > 0 ? selectedPi.products[0].itemNo : ''

    if (tab === 0) {
      setBatchItems([emptyIssueRow(defaultItemNo)])
    } else {
      setBatchItems([emptyReceiveRow(defaultItemNo)])
    }
    setDialog(true)
  }

  const openEdit = (item) => {
    setValidationError('')
    setEditId(item.id)
    setBatchDate(item.date)
    setBatchPiNo(item.piNo)
    setBatchItems([{ ...item }])
    setDialog(true)
  }

  const handlePIChange = (piNoValue) => {
    setBatchPiNo(piNoValue)
    const selectedPi = db.pis.find(p => p.piNo === piNoValue)
    const defaultItemNo = selectedPi && selectedPi.products.length > 0 ? selectedPi.products[0].itemNo : ''
    
    if (tab === 0) {
      setBatchItems([emptyIssueRow(defaultItemNo)])
    } else {
      setBatchItems([emptyReceiveRow(defaultItemNo)])
    }
  }

  const addRow = () => {
    const selectedPi = db.pis.find(p => p.piNo === batchPiNo)
    const defaultItemNo = selectedPi && selectedPi.products.length > 0 ? selectedPi.products[0].itemNo : ''

    if (tab === 0) {
      setBatchItems([...batchItems, emptyIssueRow(defaultItemNo)])
    } else {
      setBatchItems([...batchItems, emptyReceiveRow(defaultItemNo)])
    }
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

  const filteredIssues = (db.printerJobs?.issues || []).filter(i =>
    i.printerName?.toLowerCase().includes(search.toLowerCase()) ||
    i.piNo?.toLowerCase().includes(search.toLowerCase()) ||
    i.itemNo?.toLowerCase().includes(search.toLowerCase())
  )

  const filteredReceives = (db.printerJobs?.receives || []).filter(r =>
    r.printerName?.toLowerCase().includes(search.toLowerCase()) ||
    r.piNo?.toLowerCase().includes(search.toLowerCase()) ||
    r.itemNo?.toLowerCase().includes(search.toLowerCase())
  )

  const selectedPi = db.pis.find(p => p.piNo === batchPiNo)
  const activeItemNos = selectedPi ? selectedPi.products.map(pr => pr.itemNo) : []

  return (
    <Box className="page-enter">
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: 'rgba(108, 99, 255, 0.1)', color: '#6C63FF', borderRadius: 2, width: 46, height: 46 }}>
            <PrintRoundedIcon />
          </Avatar>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', lineHeight: 1.2 }}>Printer Job</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>Issue panels to printing vendors and log printed panels receipts</Typography>
          </Box>
        </Box>
        <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={openAdd}
          sx={{ borderRadius: 2, fontWeight: 700, background: 'linear-gradient(135deg,#6C63FF,#9B94FF)', boxShadow: '0 4px 14px rgba(108,99,255,0.35)' }}>
          {tab === 0 ? 'Issue Job' : 'Receive Job'}
        </Button>
      </Box>

      {/* Tabs Layout */}
      <Tabs value={tab} onChange={(e, nv) => { setTab(nv); setSearch('') }} sx={{ mb: 3 }}>
        <Tab label="Issue to Printer" sx={{ fontWeight: 700 }} />
        <Tab label="Receive from Printer" sx={{ fontWeight: 700 }} />
      </Tabs>

      {/* Search */}
      <Card sx={{ mb: 2.5 }}>
        <CardContent sx={{ p: 2 }}>
          <TextField fullWidth size="small" placeholder={tab === 0 ? "Search by Printer, PI No, Item..." : "Search by Printer, PI No, Item..."}
            value={search} onChange={e => setSearch(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchRoundedIcon sx={{ color: '#9CA3AF', fontSize: 18 }} /></InputAdornment> }} />
        </CardContent>
      </Card>

      {/* Table Container */}
      {tab === 0 ? (
        <Card sx={{ overflowX: 'auto' }}>
          <Box sx={{ minWidth: MIN_W_ISSUE, width: '100%' }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: COL_ISSUE, px: 2, py: 1.25, bgcolor: '#F8F9FC', borderBottom: '1px solid', borderColor: 'divider' }}>
              {HEADS_ISSUE.map(h => (
                <Typography key={h} variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.65rem' }}>{h}</Typography>
              ))}
            </Box>
            {filteredIssues.length === 0 ? (
              <Box sx={{ py: 6, textAlign: 'center' }}><Typography variant="body2" sx={{ color: 'text.secondary' }}>No issue records logged.</Typography></Box>
            ) : (
              <Stack divider={<Divider />}>
                {filteredIssues.map(i => (
                  <Box key={i.id} sx={{ display: 'grid', gridTemplateColumns: COL_ISSUE, px: 2, py: 1.5, alignItems: 'center', '&:hover': { bgcolor: 'rgba(108,99,255,0.03)' } }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>{i.date}</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{i.printerName}</Typography>
                    <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 700 }}>{i.piNo}</Typography>
                    <Chip label={i.itemNo || '—'} size="small" sx={{ fontWeight: 700, fontSize: '0.7rem', width: 'fit-content' }} />
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{i.qty} pcs</Typography>
                    <Chip label={i.accessories} size="small" sx={{ width: 'fit-content', fontWeight: 700, fontSize: '0.65rem' }} />
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Tooltip title="Edit"><IconButton size="small" sx={{ color: 'primary.main' }} onClick={() => openEdit(i)}><EditRoundedIcon fontSize="small" /></IconButton></Tooltip>
                      <Tooltip title="Delete"><IconButton size="small" sx={{ color: 'error.main' }} onClick={() => setDeleteId(i.id)}><DeleteRoundedIcon fontSize="small" /></IconButton></Tooltip>
                    </Box>
                  </Box>
                ))}
              </Stack>
            )}
          </Box>
        </Card>
      ) : (
        <Card sx={{ overflowX: 'auto' }}>
          <Box sx={{ minWidth: MIN_W_RECEIVE, width: '100%' }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: COL_RECEIVE, px: 2, py: 1.25, bgcolor: '#F8F9FC', borderBottom: '1px solid', borderColor: 'divider' }}>
              {HEADS_RECEIVE.map(h => (
                <Typography key={h} variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.65rem' }}>{h}</Typography>
              ))}
            </Box>
            {filteredReceives.length === 0 ? (
              <Box sx={{ py: 6, textAlign: 'center' }}><Typography variant="body2" sx={{ color: 'text.secondary' }}>No receive records logged.</Typography></Box>
            ) : (
              <Stack divider={<Divider />}>
                {filteredReceives.map(r => (
                  <Box key={r.id} sx={{ display: 'grid', gridTemplateColumns: COL_RECEIVE, px: 2, py: 1.5, alignItems: 'center', '&:hover': { bgcolor: 'rgba(108,99,255,0.03)' } }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>{r.date}</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{r.printerName}</Typography>
                    <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 700 }}>{r.piNo}</Typography>
                    <Chip label={r.itemNo || '—'} size="small" sx={{ fontWeight: 700, fontSize: '0.7rem', width: 'fit-content' }} />
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{r.qty} pcs</Typography>
                    <Typography variant="caption" sx={{ color: 'error.main', fontWeight: 700 }}>
                      Fab: {r.rejectionFabricator} / Fac: {r.rejectionFactory}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {r.billRec === 'Yes' ? `Rec: ${r.billNo} ${r.billFile ? '📎' : ''}` : 'Pending'}
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>{r.qcCheckedBy || '—'}</Typography>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Tooltip title="Edit"><IconButton size="small" sx={{ color: 'primary.main' }} onClick={() => openEdit(r)}><EditRoundedIcon fontSize="small" /></IconButton></Tooltip>
                      <Tooltip title="Delete"><IconButton size="small" sx={{ color: 'error.main' }} onClick={() => setDeleteId(r.id)}><DeleteRoundedIcon fontSize="small" /></IconButton></Tooltip>
                    </Box>
                  </Box>
                ))}
              </Stack>
            )}
          </Box>
        </Card>
      )}

      {/* Add / Edit Dialog */}
      <Dialog open={dialog} onClose={() => setDialog(false)} maxWidth={false} fullWidth PaperProps={{ sx: { borderRadius: 3, width: '1500px', maxWidth: '95%' } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>
          {editId ? 'Edit Record' : tab === 0 ? 'Issue to Printer' : 'Receive from Printer'}
        </DialogTitle>
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
                <Typography variant="caption" sx={{ fontWeight: 600, color: '#374151', mb: 0.5, display: 'block' }}>Date *</Typography>
                <TextField fullWidth size="small" type="date" value={batchDate} onChange={e => setBatchDate(e.target.value)} />
              </Grid>
            </Grid>

            {tab === 0 ? (
              // Dynamic Issue Table
              <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 2, overflowX: 'auto' }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#6C63FF', mb: 1.5, display: 'block', textTransform: 'uppercase' }}>Issue Items</Typography>
                
                <Box sx={{ display: 'grid', gridTemplateColumns: '200px 140px 120px 180px 1.5fr 36px', gap: 1.5, pb: 1, borderBottom: '1px solid', borderColor: 'divider', mb: 1.5, minWidth: '750px' }}>
                  {['Printer Name *', 'Item No *', 'Qty Issued *', 'Accessories *', 'Remarks', ''].map(h => (
                    <Typography key={h} variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.62rem', textTransform: 'uppercase' }}>{h}</Typography>
                  ))}
                </Box>

                <Stack spacing={1.5} sx={{ minWidth: '750px' }}>
                  {batchItems.map((row, idx) => (
                    <Box key={idx} sx={{ display: 'grid', gridTemplateColumns: '200px 140px 120px 180px 1.5fr 36px', gap: 1.5, alignItems: 'center' }}>
                      <TextField size="small" select value={row.printerName} onChange={setRow(idx, 'printerName')}>
                        {PRINTER_OPTIONS.map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
                      </TextField>

                      <TextField size="small" select value={row.itemNo} onChange={setRow(idx, 'itemNo')} disabled={!batchPiNo}>
                        {activeItemNos.map(itemNo => <MenuItem key={itemNo} value={itemNo}>{itemNo}</MenuItem>)}
                      </TextField>

                      <TextField size="small" type="number" value={row.qty} onChange={setRow(idx, 'qty')} placeholder="0" />

                      <TextField size="small" select value={row.accessories} onChange={setRow(idx, 'accessories')}>
                        {ACCESSORIES_OPTIONS.map(a => <MenuItem key={a} value={a}>{a}</MenuItem>)}
                      </TextField>

                      <TextField size="small" value={row.remarks} onChange={setRow(idx, 'remarks')} placeholder="Remarks" />

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
            ) : (
              // Dynamic Receive Table
              <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 2, overflowX: 'auto' }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#6C63FF', mb: 1.5, display: 'block', textTransform: 'uppercase' }}>Receive Items</Typography>
                
                <Box sx={{ display: 'grid', gridTemplateColumns: '200px 140px 110px 90px 90px 110px 90px 110px 100px 120px 100px 36px', gap: 1.5, pb: 1, borderBottom: '1px solid', borderColor: 'divider', mb: 1.5, minWidth: '1300px' }}>
                  {['Printer Name *', 'Item No *', 'Qty Rec *', 'Rej Fab', 'Rej Fac', 'QC Checked', 'Bill Rec', 'Bill No', 'Bill Date', 'Bill Upload', 'Rej Remarks', ''].map(h => (
                    <Typography key={h} variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.62rem', textTransform: 'uppercase' }}>{h}</Typography>
                  ))}
                </Box>

                <Stack spacing={1.5} sx={{ minWidth: '1300px' }}>
                  {batchItems.map((row, idx) => (
                    <Box key={idx} sx={{ display: 'grid', gridTemplateColumns: '200px 140px 110px 90px 90px 110px 90px 110px 100px 120px 100px 36px', gap: 1.5, alignItems: 'center' }}>
                      <TextField size="small" select value={row.printerName} onChange={setRow(idx, 'printerName')}>
                        {PRINTER_OPTIONS.map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
                      </TextField>

                      <TextField size="small" select value={row.itemNo} onChange={setRow(idx, 'itemNo')} disabled={!batchPiNo}>
                        {activeItemNos.map(itemNo => <MenuItem key={itemNo} value={itemNo}>{itemNo}</MenuItem>)}
                      </TextField>

                      <TextField size="small" type="number" value={row.qty} onChange={setRow(idx, 'qty')} placeholder="0" />

                      <TextField size="small" type="number" value={row.rejectionFabricator} onChange={setRow(idx, 'rejectionFabricator')} placeholder="0" />

                      <TextField size="small" type="number" value={row.rejectionFactory} onChange={setRow(idx, 'rejectionFactory')} placeholder="0" />

                      <TextField size="small" value={row.qcCheckedBy} onChange={setRow(idx, 'qcCheckedBy')} placeholder="Name" />

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

                      <TextField size="small" value={row.rejectionRemarks} onChange={setRow(idx, 'rejectionRemarks')} placeholder="Remarks" />

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
            )}
          </Stack>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button onClick={() => setDialog(false)} variant="outlined" sx={{ borderRadius: 2, fontWeight: 600 }}>Cancel</Button>
          <Button onClick={tab === 0 ? handleSaveIssue : handleSaveReceive} variant="contained" sx={{ borderRadius: 2, fontWeight: 700, background: 'linear-gradient(135deg,#6C63FF,#9B94FF)', boxShadow: 'none' }}>
            Save Entry
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
