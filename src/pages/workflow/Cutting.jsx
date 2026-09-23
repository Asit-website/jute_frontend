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
import ContentCutRoundedIcon from '@mui/icons-material/ContentCutRounded'
import FileUploadRoundedIcon from '@mui/icons-material/FileUploadRounded'
import CloudDoneRoundedIcon from '@mui/icons-material/CloudDoneRounded'
import { getDb, saveDb, getMasters, uploadBillFile } from './mockDb'

const emptyMaterialRow = () => ({
  name: '',
  color: '',
  used: '',
  rejection: ''
})

const emptyItemRow = (defaultItemNo = '') => ({
  cutterName: '',
  itemNo: defaultItemNo,
  qty: '',
  materials: [emptyMaterialRow()],
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
const HEADS = ['PI No.', 'Date', 'Cutter Name', 'Item Name', 'Qty', 'Raw Material', 'Used Qty', 'Bill No', 'Actions']

export default function Cutting() {
  const [db, setDb] = useState({ pis: [], cuttings: [], receipts: [] })
  const [cutterOptions, setCutterOptions] = useState([])
  const [materialMasterOptions, setMaterialMasterOptions] = useState([])
  const [search, setSearch] = useState('')
  const [dialog, setDialog] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(emptyForm())
  const [deleteId, setDeleteId] = useState(null)
  const [validationError, setValidationError] = useState('')
  const [previewUrl, setPreviewUrl] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(20)

  useEffect(() => {
    setPage(0)
  }, [search])

  const loadData = () => {
    getDb(['cuttings', 'pis', 'receipts', 'pos', 'printerJobs', 'stitcherJobs']).then(data => setDb(data)).catch(err => console.error(err))
  }

  useEffect(() => {
    loadData()
    getMasters('cutters')
      .then(data => setCutterOptions(data.filter(c => c.status === 'Active').map(c => c.name)))
      .catch(err => console.error(err))
    getMasters('materials')
      .then(data => setMaterialMasterOptions(data.filter(m => m.status === 'Active')))
      .catch(err => console.error(err))
  }, [])

  const receivedItems = (db.receipts || []).flatMap(r => r.items || [])
  const materialOptions = [...new Set([
    ...receivedItems.map(it => it.name).filter(Boolean),
    ...materialMasterOptions.filter(m => Number(m.openingQty || 0) > 0).map(m => m.name)
  ])]

  const getMaterialColors = (materialName) => {
    if (!materialName) return []
    // Show colors that have been received in RM Stock IN OR have openingQty > 0 in Master
    const receivedColors = (db.receipts || [])
      .flatMap(r => r.items || [])
      .filter(it => it.name === materialName && it.color)
      .map(it => it.color)
    const masterColors = materialMasterOptions
      .filter(m => m.name === materialName && Number(m.openingQty || 0) > 0 && m.color)
      .map(m => m.color)
    return [...new Set([...receivedColors, ...masterColors])]
  }

  const getMaterialAvailableStock = (materialName, color, currentRowIdx = -1) => {
    if (!materialName) return 0
    const col = color || ''

    // 0. Opening stock from Master
    const masterOpt = materialMasterOptions.find(m => m.name === materialName && (m.color || '') === col)
    const openingQty = masterOpt ? Number(masterOpt.openingQty || 0) : 0

    // 1. Total received
    const received = (db.receipts || [])
      .flatMap(r => r.items || [])
      .filter(it => it.name === materialName && (it.color || '') === col)
      .reduce((sum, it) => sum + Number(it.qty || 0), 0)

    // 2. Consumed in cutting (excluding current edit session if applicable)
    const cutConsumedOther = (db.cuttings || [])
      .filter(c => c.id !== editId)
      .flatMap(c => c.items || [])
      .filter(it => it.rawMaterial === materialName && (it.rawMaterialColor || '') === col)
      .reduce((sum, it) => sum + Number(it.rawMaterialUsed || 0) + Number(it.rawMaterialRejection || 0), 0)

    // 3. Issued in printing
    const printIssued = (db.printerJobs?.issues || [])
      .filter(it => it.accessories === materialName && (it.accessoriesColor || '') === col)
      .reduce((sum, it) => sum + Number(it.accessoriesQty || 0), 0)

    // 4. Issued in stitching
    const stitchIssued = (db.stitcherJobs?.issues || [])
      .filter(it => it.accessories === materialName && (it.accessoriesColor || '') === col)
      .reduce((sum, it) => sum + Number(it.accessoriesQty || 0), 0)

    // 5. Deduct quantities entered in the CURRENT batch dialog in other rows
    const currentBatchDeduction = form.items
      .slice(0, currentRowIdx === -1 ? form.items.length : currentRowIdx)
      .flatMap(row => row.materials || [])
      .filter(mat => mat.name === materialName && (mat.color || '') === col)
      .reduce((sum, mat) => sum + Number(mat.used || 0) + Number(mat.rejection || 0), 0)

    return (openingQty + received) - cutConsumedOther - printIssued - stitchIssued - currentBatchDeduction
  }

  const q = search.trim().toLowerCase()

  const filtered = (db.cuttings || []).filter(c => {
    if (!q) return true
    // Match at cutting-record level (piNo, date)
    if (c.piNo?.toLowerCase().includes(q) || c.date?.toLowerCase().includes(q)) return true
    // Match at item level (cutterName or itemNo)
    return c.items.some(it =>
      it.cutterName?.toLowerCase().includes(q) ||
      it.itemNo?.toLowerCase().includes(q)
    )
  })

  const openAdd = () => {
    setSubmitted(false)
    setValidationError('')
    setEditId(null)
    setForm(emptyForm())
    setDialog(true)
  }

  const openEdit = (cut) => {
    setSubmitted(false)
    setValidationError('')
    setEditId(cut.id)
    
    // Group flat database items by itemNo
    const groupedMap = new Map()
    ;(cut.items || []).forEach(it => {
      const key = it.itemNo
      if (!groupedMap.has(key)) {
        groupedMap.set(key, {
          cutterName: it.cutterName || '',
          itemNo: it.itemNo,
          qty: '',
          materials: [],
          billRec: it.billRec || 'No',
          billNo: it.billNo || '',
          billDate: it.billDate || '',
          billFile: it.billFile || '',
          remarks: it.remarks || ''
        })
      }

      const group = groupedMap.get(key)
      if (Number(it.qty) > 0) {
        group.qty = it.qty
      }

      if (it.rawMaterial || it.rawMaterialUsed || it.rawMaterialRejection) {
        group.materials.push({
          name: it.rawMaterial || '',
          color: it.rawMaterialColor || '',
          used: it.rawMaterialUsed || '',
          rejection: it.rawMaterialRejection || ''
        })
      }
    })

    const items = Array.from(groupedMap.values()).map(group => {
      if (group.materials.length === 0) {
        group.materials.push(emptyMaterialRow())
      }
      return group
    })

    setForm({
      piNo: cut.piNo,
      date: cut.date,
      items: items.length > 0 ? items : [emptyItemRow()]
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
    if (!form.piNo || !form.date) return

    // Date Validation: Cutting Date cannot be before PI Date
    const selectedPi = db.pis.find(p => p.piNo === form.piNo)
    if (selectedPi && selectedPi.date && dayjs(form.date).isBefore(dayjs(selectedPi.date))) {
      setValidationError(`VALIDATION ERROR: Cutting Date (${dayjs(form.date).format('DD/MM/YYYY')}) cannot be before PI Date (${dayjs(selectedPi.date).format('DD/MM/YYYY')})!`)
      return
    }

    // Date Validation: Cutting Date cannot be before Raw Material Receipt Date of any consumed materials
    for (let idx = 0; idx < form.items.length; idx++) {
      const row = form.items[idx]
      for (let matIdx = 0; matIdx < (row.materials || []).length; matIdx++) {
        const mat = row.materials[matIdx]
        if (!mat.name) continue

        const matReceipts = (db.receipts || [])
          .filter(r => (r.items || []).some(it => it.name === mat.name && (!mat.color || it.color === mat.color)))
        
        if (matReceipts.length > 0) {
          const latestReceiptDate = matReceipts.reduce((latest, r) => {
            if (!latest) return r.date
            return dayjs(r.date).isAfter(dayjs(latest)) ? r.date : latest
          }, null)

          if (latestReceiptDate && dayjs(form.date).isBefore(dayjs(latestReceiptDate))) {
            setValidationError(`VALIDATION ERROR at row ${idx + 1}: Cutting Date (${dayjs(form.date).format('DD/MM/YYYY')}) cannot be before Raw Material Receipt Date (${dayjs(latestReceiptDate).format('DD/MM/YYYY')}) for "${mat.name}" (${mat.color || 'Natural'})!`)
            return
          }
        }
      }
    }

    // Validate raw material stock in cutting
    const matTotals = {}
    form.items.forEach(row => {
      (row.materials || []).forEach(mat => {
        if (mat.name) {
          const key = `${mat.name}||${mat.color || ''}`
          matTotals[key] = (matTotals[key] || 0) + Number(mat.used || 0) + Number(mat.rejection || 0)
        }
      })
    })

    for (let idx = 0; idx < form.items.length; idx++) {
      const row = form.items[idx]
      for (let matIdx = 0; matIdx < (row.materials || []).length; matIdx++) {
        const mat = row.materials[matIdx]
        if (!mat.name) continue

        if (Number(mat.used || 0) < 0 || Number(mat.rejection || 0) < 0) {
          setValidationError(`VALIDATION ERROR: Material quantities cannot be negative!`)
          return
        }

        const key = `${mat.name}||${mat.color || ''}`
        const totalRequested = matTotals[key]

        const masterOpt = materialMasterOptions.find(m => m.name === mat.name && (m.color || '') === (mat.color || ''))
        const openingQty = masterOpt ? Number(masterOpt.openingQty || 0) : 0

        const col = mat.color || ''
        const received = (db.receipts || [])
          .flatMap(r => r.items || [])
          .filter(it => it.name === mat.name && (it.color || '') === col)
          .reduce((sum, it) => sum + Number(it.qty || 0), 0)

        const cutConsumedOther = (db.cuttings || [])
          .filter(c => c.id !== editId)
          .flatMap(c => c.items || [])
          .filter(it => it.rawMaterial === mat.name && (it.rawMaterialColor || '') === col)
          .reduce((sum, it) => sum + Number(it.rawMaterialUsed || 0) + Number(it.rawMaterialRejection || 0), 0)

        const printIssued = (db.printerJobs?.issues || [])
          .filter(it => it.accessories === mat.name && (it.accessoriesColor || '') === col)
          .reduce((sum, it) => sum + Number(it.accessoriesQty || 0), 0)

        const stitchIssued = (db.stitcherJobs?.issues || [])
          .filter(it => it.accessories === mat.name && (it.accessoriesColor || '') === col)
          .reduce((sum, it) => sum + Number(it.accessoriesQty || 0), 0)

        const netAvailable = (openingQty + received) - cutConsumedOther - printIssued - stitchIssued

        if (totalRequested > netAvailable) {
          setValidationError(`VALIDATION ERROR at row ${idx + 1}: Raw Material "${mat.name}" (${mat.color || 'Natural'}) quantity ${totalRequested} exceeds available stock of ${netAvailable}!`)
          return
        }
      }
    }

    // VALIDATION: if cutting qty is greater than order qty. only 2 % allowance is allowed.
    if (selectedPi) {
      const itemTotals = {}
      form.items.forEach(item => {
        if (item.itemNo) {
          itemTotals[item.itemNo] = (itemTotals[item.itemNo] || 0) + Number(item.qty || 0)
        }
      })

      let isOverCut = false
      for (const itemNo of Object.keys(itemTotals)) {
        const matchingPiProduct = selectedPi.products.find(p => p.itemNo === itemNo)
        if (matchingPiProduct) {
          const maxAllowed = Number(matchingPiProduct.qty) * 1.02
          const totalCutOther = (db.cuttings || [])
            .filter(c => c.id !== editId && c.piNo === form.piNo)
            .flatMap(c => (c.items || []).filter(it => it.itemNo === itemNo))
            .reduce((sum, it) => sum + Number(it.qty || 0), 0)

          if (itemTotals[itemNo] + totalCutOther > maxAllowed) {
            isOverCut = true
            break
          }
        }
      }

      if (isOverCut) {
        setValidationError('VALIDATION ERROR: Cutting output quantity exceeds PI ordered quantity by more than the 2% allowance!')
        return
      }
    }

    // Flatten form.items for saving to database
    const flatItems = []
    form.items.forEach(row => {
      row.materials.forEach((mat, mIdx) => {
        flatItems.push({
          cutterName: row.cutterName,
          itemNo: row.itemNo,
          qty: mIdx === 0 ? (Number(row.qty) || 0) : 0,
          rawMaterial: mat.name,
          rawMaterialColor: mat.color,
          rawMaterialUsed: Number(mat.used || 0),
          rawMaterialRejection: Number(mat.rejection || 0),
          billRec: row.billRec,
          billNo: row.billNo,
          billDate: row.billDate,
          billFile: row.billFile,
          remarks: row.remarks
        })
      })
    })

    const payload = {
      piNo: form.piNo,
      date: form.date,
      items: flatItems
    }

    const newDb = { ...db }
    if (editId) {
      newDb.cuttings = newDb.cuttings.map(c => c.id === editId ? { ...payload, id: editId } : c)
    } else {
      const newId = 'CUT-' + Date.now().toString().slice(-4)
      newDb.cuttings.push({ ...payload, id: newId })
    }
    saveDb({ cuttings: newDb.cuttings })
      .then(() => {
        loadData()
        setDialog(false)
      })
      .catch(err => setValidationError(err.message))
  }

  const handleDelete = () => {
    const newDb = { ...db, cuttings: db.cuttings.filter(c => c.id !== deleteId) }
    saveDb({ cuttings: newDb.cuttings })
      .then(() => {
        loadData()
        setDeleteId(null)
      })
      .catch(err => alert(err.message))
  }

  const setRow = (idx, k) => (e) => {
    const items = [...form.items]
    items[idx] = { ...items[idx], [k]: e.target.value }
    setForm({ ...form, items })
  }

  const updateMaterial = (rowIdx, matIdx, k, value) => {
    const items = [...form.items]
    const materials = [...items[rowIdx].materials]
    materials[matIdx] = { ...materials[matIdx], [k]: value }
    items[rowIdx] = { ...items[rowIdx], materials }
    setForm({ ...form, items })
  }

  const addMaterial = (rowIdx) => {
    const items = [...form.items]
    const materials = [...items[rowIdx].materials, emptyMaterialRow()]
    items[rowIdx] = { ...items[rowIdx], materials }
    setForm({ ...form, items })
  }

  const removeMaterial = (rowIdx, matIdx) => {
    const items = [...form.items]
    const materials = items[rowIdx].materials.filter((_, i) => i !== matIdx)
    items[rowIdx] = { ...items[rowIdx], materials: materials.length > 0 ? materials : [emptyMaterialRow()] }
    setForm({ ...form, items })
  }

  const handleFileUpload = (idx) => (e) => {
    const file = e.target.files[0]
    if (file) {
      uploadBillFile(file)
        .then(res => {
          const items = [...form.items]
          items[idx] = { ...items[idx], billFile: res.url }
          setForm({ ...form, items })
        })
        .catch(err => alert(err.message))
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
    cut.items.forEach((it) => {
      // When searching, only include items that directly match — skip items from other cutters
      if (q) {
        const itemMatches =
          it.cutterName?.toLowerCase().includes(q) ||
          it.itemNo?.toLowerCase().includes(q)
        const recordMatches =
          cut.piNo?.toLowerCase().includes(q) ||
          cut.date?.toLowerCase().includes(q)
        // If match is via cutter/itemNo, only show matching items
        // If match is via piNo/date, show all items of that record
        if (!recordMatches && !itemMatches) return
        if (recordMatches && !itemMatches) {
          // piNo/date matched — include all items of this cutting record
        } else if (!recordMatches && itemMatches) {
          // cutter/item matched — only include this item
        }
        // if both match, include anyway
      }
      flatRows.push({
        ...it,
        cutId: cut.id,
        piNo: cut.piNo,
        date: cut.date,
        parentCut: cut
      })
    })
  })

  const paginated = search.trim() ? flatRows : flatRows.slice(page * rowsPerPage, (page + 1) * rowsPerPage)

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

      {/* Search */}
      <Card sx={{ mb: 2.5 }}>
        <CardContent sx={{ p: 2 }}>
          <TextField fullWidth size="small" placeholder="Search by PI No, Cutter Name, Item Name..."
            value={search} onChange={e => setSearch(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchRoundedIcon sx={{ color: '#9CA3AF', fontSize: 18 }} /></InputAdornment> }} />
          {search.trim() && (
            <Box sx={{ mt: 1 }}>
              <Chip
                label={`Showing all ${flatRows.length} matching records for "${search.trim()}"`}
                size="small" color="primary" variant="outlined"
                sx={{ fontWeight: 600, fontSize: '0.75rem' }}
              />
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Table */}
      <Card sx={{ overflowX: 'auto' }}>
        <Box className="grid-table-row" sx={{ display: 'grid', gridTemplateColumns: COL, px: 2, py: 1.25, bgcolor: '#F8F9FC', borderBottom: '1px solid', borderColor: 'divider', minWidth: '980px' }}>
          {HEADS.map(h => (
            <Typography key={h} variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: '0.05em' }}>{h}</Typography>
          ))}
        </Box>

        {flatRows.length === 0 ? (
          <Box sx={{ py: 6, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>No cutting entries logged.</Typography>
          </Box>
        ) : (
          <Stack divider={<Divider />} sx={{ minWidth: '980px' }}>
            {paginated.map((row, rIdx) => (
              <Box key={`${row.cutId}-${rIdx}`} className="grid-table-row" sx={{ display: 'grid', gridTemplateColumns: COL, px: 2, py: 1.5, alignItems: 'center', '&:hover': { bgcolor: 'rgba(108,99,255,0.03)' }, transition: 'background 0.15s' }}>
                <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>{row.piNo}</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>{row.date ? dayjs(row.date).format('DD/MM/YYYY') : '—'}</Typography>
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
        {flatRows.length > 20 && (
          <TablePagination
            component="div"
            count={flatRows.length}
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
      <Dialog open={dialog} onClose={() => setDialog(false)} maxWidth={false} fullWidth PaperProps={{ sx: { borderRadius: 3, width: '1500px', maxWidth: '95%' } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>{editId ? 'Edit Cutting Entry' : 'Log Cutting Batch'}</DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2.5, maxHeight: '80vh', overflowY: 'auto' }}>
          <Stack spacing={2}>
            {validationError && <Alert severity="error" sx={{ borderRadius: 2 }}>{validationError}</Alert>}
            
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" sx={{ fontWeight: 600, color: '#374151', mb: 0.5, display: 'block' }}>PI No *</Typography>
                <Autocomplete
                  size="small"
                  options={db.pis.map(p => p.piNo)}
                  value={form.piNo || null}
                  onChange={(e, val) => handlePIChange(val || '')}
                  disabled={!!editId}
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
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" sx={{ fontWeight: 600, color: '#374151', mb: 0.5, display: 'block' }}>Date *</Typography>
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
            </Grid>

            {/* Dynamic Items Table */}
            <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 2, overflowX: 'auto' }}>
              <Typography variant="caption" sx={{ fontWeight: 800, color: '#6C63FF', mb: 1.5, display: 'block', textTransform: 'uppercase' }}>Cutting Items</Typography>
              
              {/* Table Header */}
              <Box sx={{ display: 'grid', gridTemplateColumns: '140px 100px 90px 480px 90px 110px 100px 110px 120px 36px', gap: 1.5, pb: 1, borderBottom: '1px solid', borderColor: 'divider', mb: 1.5, minWidth: '1380px' }}>
                {['Cutter Name *', 'Item Name *', 'Qty *', 'Raw Materials (Name, Color, Used, Rej) *', 'Bill Rec', 'Bill No', 'Bill Date', 'Bill Upload', 'Remarks', ''].map(h => (
                  <Typography key={h} variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.62rem', textTransform: 'uppercase' }}>{h}</Typography>
                ))}
              </Box>

              {/* Rows */}
              <Stack spacing={2} sx={{ minWidth: '1380px' }}>
                {form.items.map((row, idx) => (
                  <Box key={idx} sx={{ display: 'grid', gridTemplateColumns: '140px 100px 90px 480px 90px 110px 100px 110px 120px 36px', gap: 1.5, alignItems: 'start' }}>
                    
                    <Autocomplete
                      size="small"
                      options={cutterOptions}
                      value={row.cutterName || null}
                      onChange={(e, val) => {
                        const items = [...form.items]
                        items[idx] = { ...items[idx], cutterName: val || '' }
                        setForm({ ...form, items })
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder="Cutter"
                          error={submitted && !row.cutterName}
                          helperText={submitted && !row.cutterName ? 'Required' : ''}
                        />
                      )}
                    />

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

                    <TextField size="small" type="number" value={row.qty} onChange={setRow(idx, 'qty')} placeholder="0" error={submitted && (!row.qty || Number(row.qty) <= 0)} helperText={submitted && (!row.qty || Number(row.qty) <= 0) ? 'Required' : ''} />

                    {/* Nested Materials Stack */}
                    <Box sx={{ bgcolor: 'rgba(0,0,0,0.015)', p: 1, borderRadius: 2, border: '1px dashed rgba(0,0,0,0.08)' }}>
                      <Stack spacing={1}>
                        {row.materials.map((mat, matIdx) => (
                          <Box key={matIdx} sx={{ display: 'grid', gridTemplateColumns: '150px 100px 90px 90px 30px', gap: 1, alignItems: 'center' }}>
                            <Autocomplete
                              size="small"
                              options={materialOptions}
                              value={mat.name || null}
                              onChange={(e, val) => updateMaterial(idx, matIdx, 'name', val || '')}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  placeholder="Material"
                                />
                              )}
                            />

                            <TextField
                              size="small"
                              select
                              value={mat.color}
                              onChange={e => updateMaterial(idx, matIdx, 'color', e.target.value)}
                              disabled={!mat.name}
                              displayEmpty
                            >
                              <MenuItem value="" disabled><em>Select...</em></MenuItem>
                              {getMaterialColors(mat.name).map(col => <MenuItem key={col} value={col}>{col}</MenuItem>)}
                            </TextField>

                            <Box>
                              <TextField
                                size="small"
                                type="number"
                                value={mat.used}
                                onChange={e => updateMaterial(idx, matIdx, 'used', e.target.value)}
                                placeholder="Used"
                                error={mat.name && (Number(mat.used || 0) + Number(mat.rejection || 0)) > getMaterialAvailableStock(mat.name, mat.color, idx)}
                              />
                              {mat.name && (
                                <Typography variant="caption" sx={{ display: 'block', fontSize: '0.6rem', color: (Number(mat.used || 0) + Number(mat.rejection || 0)) > getMaterialAvailableStock(mat.name, mat.color, idx) ? 'error.main' : 'text.secondary', mt: 0.5, fontWeight: 600 }}>
                                  Avail: {getMaterialAvailableStock(mat.name, mat.color, idx)}
                                </Typography>
                              )}
                            </Box>

                            <TextField
                              size="small"
                              type="number"
                              value={mat.rejection}
                              onChange={e => updateMaterial(idx, matIdx, 'rejection', e.target.value)}
                              placeholder="Rej"
                            />

                            <IconButton
                              size="small"
                              onClick={() => removeMaterial(idx, matIdx)}
                              disabled={row.materials.length === 1}
                              sx={{ color: 'error.main' }}
                            >
                              <DeleteRoundedIcon fontSize="inherit" />
                            </IconButton>
                          </Box>
                        ))}
                      </Stack>
                      <Button
                        size="small"
                        startIcon={<AddRoundedIcon sx={{ fontSize: '0.8rem !important' }} />}
                        onClick={() => addMaterial(idx)}
                        sx={{ mt: 1, py: 0.25, fontSize: '0.65rem', fontWeight: 700 }}
                      >
                        Add Raw Material
                      </Button>
                    </Box>

                    <TextField size="small" select value={row.billRec} onChange={setRow(idx, 'billRec')}>
                      {['Yes', 'No'].map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                    </TextField>

                    <TextField size="small" value={row.billNo} onChange={setRow(idx, 'billNo')} disabled={row.billRec === 'No'} placeholder="No" />

                    <DatePicker
                      format="DD/MM/YYYY"
                      value={row.billDate ? dayjs(row.billDate) : null}
                      onChange={val => {
                        const items = [...form.items]
                        items[idx] = { ...items[idx], billDate: val ? val.format('YYYY-MM-DD') : '' }
                        setForm({ ...form, items })
                      }}
                      slotProps={{
                        textField: {
                          size: 'small',
                          error: submitted && row.billRec === 'Yes' && !row.billDate,
                          helperText: submitted && row.billRec === 'Yes' && !row.billDate ? 'Required' : '',
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

                    <TextField size="small" value={row.remarks} onChange={setRow(idx, 'remarks')} placeholder="Remarks" multiline rows={3} />

                    <IconButton size="small" onClick={() => removeRow(idx)} disabled={form.items.length === 1} sx={{ color: 'error.main', mt: 0.5 }}>
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
