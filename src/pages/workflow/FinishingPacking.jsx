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
import DoneAllRoundedIcon from '@mui/icons-material/DoneAllRounded'
import FileUploadRoundedIcon from '@mui/icons-material/FileUploadRounded'
import CloudDoneRoundedIcon from '@mui/icons-material/CloudDoneRounded'
import { getDb, saveDb, getMasters, uploadBillFile } from './mockDb'

const COL = '110px 1.4fr 90px 80px 80px 80px 220px 100px 100px'
const HEADS = ['Date', 'Finisher Name', 'PI No.', 'Item Name', 'Qty Pack', 'Rej.', 'Ctn Details & Vol (CBM)', 'QC Check', 'Actions']

const emptyFinishingRow = (defaultItemNo = '') => ({
  jobworkerName: '',
  itemNo: defaultItemNo,
  qty: '',
  rejection: '',
  ctnDims: '',
  netWt: '',
  grossWt: '',
  pcsPerCtn: '',
  volumeCbm: '',
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
  const [finisherOptions, setFinisherOptions] = useState([])
  const [search, setSearch] = useState('')
  const [dialog, setDialog] = useState(false)
  const [editId, setEditId] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [validationError, setValidationError] = useState('')
  const [previewUrl, setPreviewUrl] = useState(null)
  const [submitted, setSubmitted] = useState(false)

  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  useEffect(() => {
    setPage(0)
  }, [search])

  // Batch header states
  const [batchDate, setBatchDate] = useState('')
  const [batchPiNo, setBatchPiNo] = useState('')
  const [batchItems, setBatchItems] = useState([])

  const loadData = () => {
    getDb(['finishing', 'stitcherJobs', 'pis']).then(data => setDb(data)).catch(err => console.error(err))
  }

  useEffect(() => {
    loadData()
    getMasters('finishers')
      .then(data => setFinisherOptions(data.filter(f => f.status === 'Active').map(f => f.name)))
      .catch(err => console.error(err))
  }, [])

  const filtered = (db.finishing || []).filter(f =>
    f.jobworkerName?.toLowerCase().includes(search.toLowerCase()) ||
    f.piNo?.toLowerCase().includes(search.toLowerCase()) ||
    f.itemNo?.toLowerCase().includes(search.toLowerCase())
  )

  const openAdd = () => {
    setSubmitted(false)
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
    setSubmitted(false)
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
    setSubmitted(true)
    if (!batchDate || !batchPiNo || batchItems.length === 0) return

    // Date Validation: Finishing Date cannot be before latest Stitching Receive Date
    const stitchReceives = (db.stitcherJobs?.receives || []).filter(r => r.piNo === batchPiNo)
    const latestStitchDate = stitchReceives.reduce((latest, r) => {
      if (!latest) return r.date
      return dayjs(r.date).isAfter(dayjs(latest)) ? r.date : latest
    }, null)

    if (latestStitchDate && dayjs(batchDate).isBefore(dayjs(latestStitchDate))) {
      setValidationError(`VALIDATION ERROR: Finishing Date (${dayjs(batchDate).format('DD/MM/YYYY')}) cannot be before latest Stitching Receive Date (${dayjs(latestStitchDate).format('DD/MM/YYYY')})!`)
      return
    }

    const hasInvalid = batchItems.some(it => !it.itemNo || !it.qty)
    if (hasInvalid) {
      setValidationError('VALIDATION ERROR: Please select item number and quantity for all rows.')
      return
    }

    // Validation: Finishing Qty cannot exceed Stitched Quantity received for each item
    for (let idx = 0; idx < batchItems.length; idx++) {
      const item = batchItems[idx]
      if (!item.itemNo || !item.qty) continue

      const totalStitched = (db.stitcherJobs?.receives || [])
        .filter(r => r.piNo === batchPiNo && r.itemNo === item.itemNo)
        .reduce((sum, r) => sum + Number(r.qty || 0), 0)

      const totalFinishedOther = (db.finishing || [])
        .filter(f => f.id !== editId && f.piNo === batchPiNo && f.itemNo === item.itemNo)
        .reduce((sum, f) => sum + Number(f.qty || 0), 0)

      const currentDialogTotal = batchItems
        .filter(it => it.itemNo === item.itemNo)
        .reduce((sum, it) => sum + Number(it.qty || 0), 0)

      const maxAllowed = totalStitched - totalFinishedOther
      if (currentDialogTotal > maxAllowed) {
        setValidationError(`VALIDATION ERROR at row ${idx + 1}: Finishing quantity (${currentDialogTotal}) exceeds available stitched bags (${maxAllowed} pcs)! Stitched Total: ${totalStitched}, Packed Already: ${totalFinishedOther}.`)
        return
      }
    }

    const newDb = { ...db }
    const savedItems = batchItems.map(item => ({
      ...item,
      date: batchDate,
      piNo: batchPiNo,
      qty: Number(item.qty || 0),
      rejection: item.rejection === '' || item.rejection === undefined ? 0 : Number(item.rejection),
      netWt: item.netWt === '' || item.netWt === undefined ? null : Number(item.netWt),
      grossWt: item.grossWt === '' || item.grossWt === undefined ? null : Number(item.grossWt),
      pcsPerCtn: item.pcsPerCtn === '' || item.pcsPerCtn === undefined ? null : Number(item.pcsPerCtn),
      volumeCbm: item.volumeCbm === '' || item.volumeCbm === undefined ? null : Number(item.volumeCbm)
    }))

    if (editId) {
      newDb.finishing = newDb.finishing.map(f => f.id === editId ? { ...savedItems[0], id: editId } : f)
    } else {
      savedItems.forEach(item => {
        const newId = 'FIN-' + Date.now().toString().slice(-4) + Math.random().toString().slice(-2)
        newDb.finishing.push({ ...item, id: newId })
      })
    }
    saveDb({ finishing: newDb.finishing })
      .then(() => {
        loadData()
        setDialog(false)
      })
      .catch(err => setValidationError(err.message))
  }

  const handleDelete = () => {
    const newDb = { ...db, finishing: db.finishing.filter(f => f.id !== deleteId) }
    saveDb({ finishing: newDb.finishing })
      .then(() => {
        loadData()
        setDeleteId(null)
      })
      .catch(err => alert(err.message))
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
      uploadBillFile(file)
        .then(res => {
          const items = [...batchItems]
          items[idx] = { ...items[idx], billFile: res.url }
          setBatchItems(items)
        })
        .catch(err => alert(err.message))
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

      {/* Search */}
      <Card sx={{ mb: 2.5 }}>
        <CardContent sx={{ p: 2 }}>
          <TextField fullWidth size="small" placeholder="Search by PI No, Item Name, Finisher Name..."
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
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>No finishing entries logged.</Typography>
          </Box>
        ) : (
          <Stack divider={<Divider />}>
            {(search.trim() ? filtered : filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)).map(f => (
              <Box key={f.id} className="grid-table-row" sx={{ display: 'grid', gridTemplateColumns: COL, px: 2, py: 1.5, alignItems: 'center', '&:hover': { bgcolor: 'rgba(108,99,255,0.03)' }, minWidth: '950px' }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>{f.date ? dayjs(f.date).format('DD/MM/YYYY') : '—'}</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>{f.jobworkerName}</Typography>
                <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 700 }}>{f.piNo}</Typography>
                <Chip label={f.itemNo || '—'} size="small" sx={{ fontWeight: 700, fontSize: '0.7rem', width: 'fit-content' }} />
                <Typography variant="body2" sx={{ fontWeight: 700 }}>{f.qty} pcs</Typography>
                <Typography variant="body2" sx={{ color: 'error.main', fontWeight: 700 }}>{f.rejection || 0}</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {f.ctnDims} ({f.pcsPerCtn} / Ctn) {f.volumeCbm ? `| Vol: ${f.volumeCbm} CBM` : ''}
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
      <Dialog open={dialog} onClose={() => setDialog(false)} maxWidth={false} fullWidth PaperProps={{ sx: { borderRadius: 3, width: '1600px', maxWidth: '95%' } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>{editId ? 'Edit Finishing & Packing' : 'Log Finishing & Packing Lot'}</DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2.5, maxHeight: '80vh', overflowY: 'auto' }}>
          <Stack spacing={2.5}>
            {validationError && <Alert severity="error" sx={{ borderRadius: 2 }}>{validationError}</Alert>}

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" sx={{ fontWeight: 600, color: '#374151', mb: 0.5, display: 'block' }}>PI No. *</Typography>
                <Autocomplete
                  size="small"
                  options={db.pis.map(p => p.piNo)}
                  value={batchPiNo || null}
                  onChange={(e, val) => handlePIChange(val || '')}
                  disabled={!!editId}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Select PI No"
                      error={submitted && !batchPiNo}
                      helperText={submitted && !batchPiNo ? 'Required' : ''}
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" sx={{ fontWeight: 600, color: '#374151', mb: 0.5, display: 'block' }}>Finishing Date *</Typography>
                <DatePicker
                  format="DD/MM/YYYY"
                  value={batchDate ? dayjs(batchDate) : null}
                  onChange={newValue => setBatchDate(newValue ? newValue.format('YYYY-MM-DD') : '')}
                  slotProps={{
                    textField: {
                      size: 'small',
                      fullWidth: true,
                      error: submitted && !batchDate,
                      helperText: submitted && !batchDate ? 'Required' : ''
                    }
                  }}
                />
              </Grid>
            </Grid>

            {/* Dynamic Items Table */}
            <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 2, overflowX: 'auto' }}>
              <Typography variant="caption" sx={{ fontWeight: 800, color: '#6C63FF', mb: 1.5, display: 'block', textTransform: 'uppercase' }}>Finishing Items</Typography>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: '180px 120px 80px 70px 100px 70px 70px 70px 90px 90px 100px 90px 100px 110px 36px', gap: 1.5, pb: 1, borderBottom: '1px solid', borderColor: 'divider', mb: 1.5, minWidth: '1450px' }}>
                {['Finisher Name *', 'Item Name *', 'Qty *', 'Rej', 'Ctn Dims', 'Net Wt', 'Gross Wt', 'Pcs/Ctn', 'Vol (CBM)', 'QC Check', 'Bill Rec', 'Bill No', 'Bill Date', 'Bill Upload', ''].map(h => (
                  <Typography key={h} variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.62rem', textTransform: 'uppercase' }}>{h}</Typography>
                ))}
              </Box>

              <Stack spacing={1.5} sx={{ minWidth: '1450px' }}>
                {batchItems.map((row, idx) => (
                  <Box key={idx} sx={{ display: 'grid', gridTemplateColumns: '180px 120px 80px 70px 100px 70px 70px 70px 90px 90px 100px 90px 100px 110px 36px', gap: 1.5, alignItems: 'center' }}>
                    <Autocomplete
                      size="small"
                      options={finisherOptions}
                      value={row.jobworkerName || null}
                      onChange={(e, val) => {
                        const items = [...batchItems]
                        items[idx] = { ...items[idx], jobworkerName: val || '' }
                        setBatchItems(items)
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder="Finisher"
                          error={submitted && !row.jobworkerName}
                          helperText={submitted && !row.jobworkerName ? 'Required' : ''}
                        />
                      )}
                    />

                    <Autocomplete
                      size="small"
                      options={activeItemNos}
                      value={row.itemNo || null}
                      onChange={(e, val) => {
                        const items = [...batchItems]
                        items[idx] = { ...items[idx], itemNo: val || '' }
                        setBatchItems(items)
                      }}
                      disabled={!batchPiNo}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder="Item"
                          error={submitted && !row.itemNo}
                          helperText={submitted && !row.itemNo ? 'Required' : ''}
                        />
                      )}
                    />

                    <TextField size="small" type="number" value={row.qty} onChange={setRow(idx, 'qty')} placeholder="0"
                      error={submitted && (!row.qty || Number(row.qty) <= 0)}
                      helperText={submitted && (!row.qty || Number(row.qty) <= 0) ? 'Required' : ''} />

                    <TextField size="small" type="number" value={row.rejection} onChange={setRow(idx, 'rejection')} placeholder="0" />

                    <TextField size="small" value={row.ctnDims} onChange={setRow(idx, 'ctnDims')} placeholder="Dims" />

                    <TextField size="small" type="number" value={row.netWt} onChange={setRow(idx, 'netWt')} placeholder="Net" />

                    <TextField size="small" type="number" value={row.grossWt} onChange={setRow(idx, 'grossWt')} placeholder="Gross" />

                    <TextField size="small" type="number" value={row.pcsPerCtn} onChange={setRow(idx, 'pcsPerCtn')} placeholder="100" />

                    <TextField size="small" type="number" value={row.volumeCbm || ''} onChange={setRow(idx, 'volumeCbm')} placeholder="CBM" />

                    <TextField size="small" value={row.qcCheckedBy} onChange={setRow(idx, 'qcCheckedBy')} placeholder="QC By" />

                    <TextField size="small" select value={row.billRec} onChange={setRow(idx, 'billRec')}>
                      {['Yes', 'No'].map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                    </TextField>

                    <TextField size="small" value={row.billNo} onChange={setRow(idx, 'billNo')} disabled={row.billRec === 'No'} placeholder="No" />

                    <DatePicker
                      format="DD/MM/YYYY"
                      value={row.billDate ? dayjs(row.billDate) : null}
                      onChange={val => {
                        const items = [...batchItems]
                        items[idx] = { ...items[idx], billDate: val ? val.format('YYYY-MM-DD') : '' }
                        setBatchItems(items)
                      }}
                      slotProps={{
                        textField: {
                          size: 'small',
                          disabled: row.billRec === 'No'
                        }
                      }}
                    />

                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                        <Button
                          size="small"
                          variant="outlined"
                          component="label"
                          disabled={row.billRec === 'No'}
                          color={row.billFile ? 'success' : 'primary'}
                          startIcon={row.billFile ? <CloudDoneRoundedIcon fontSize="small" /> : <FileUploadRoundedIcon fontSize="small" />}
                          sx={{ height: 40, textTransform: 'none', fontSize: '0.7rem', fontWeight: 700, borderRadius: 2, width: '100%' }}
                        >
                          {row.billFile ? 'Uploaded' : 'Upload'}
                          <input type="file" hidden onChange={handleFileUpload(idx)} />
                        </Button>
                        {row.billFile && (
                          <Button
                            size="small"
                            onClick={() => setPreviewUrl(row.billFile)}
                            sx={{ textTransform: 'none', fontSize: '0.62rem', fontWeight: 700, mt: 0.5, py: 0 }}
                          >
                            View Uploaded
                          </Button>
                        )}
                      </Box>

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
      {/* Bill Preview Dialog */}
      <Dialog open={!!previewUrl} onClose={() => setPreviewUrl(null)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Bill Document Preview
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ p: 2, bgcolor: '#F8F9FC' }}>
          {previewUrl && (previewUrl.toLowerCase().endsWith('.pdf') ? (
            <iframe src={previewUrl} style={{ width: '100%', height: '70vh', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.08)' }} title="Bill Document Preview" />
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 1, bgcolor: '#fff', borderRadius: 2, border: '1px solid rgba(0,0,0,0.08)', minHeight: '300px' }}>
              <img src={previewUrl} alt="Bill Preview" style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain', borderRadius: '4px' }} />
            </Box>
          ))}
        </DialogContent>
        <Divider />
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button href={previewUrl} target="_blank" rel="noreferrer" variant="outlined" sx={{ borderRadius: 2, fontWeight: 600, textTransform: 'none' }}>
            Open in New Tab
          </Button>
          <Button onClick={() => setPreviewUrl(null)} variant="contained" sx={{ borderRadius: 2, fontWeight: 700, textTransform: 'none' }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
