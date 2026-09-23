import React, { useState, useEffect } from 'react'
import {
  Box, Typography, Card, CardContent, Button, IconButton, Alert, Tabs, Tab,
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
import HandymanRoundedIcon from '@mui/icons-material/HandymanRounded'
import FileUploadRoundedIcon from '@mui/icons-material/FileUploadRounded'
import CloudDoneRoundedIcon from '@mui/icons-material/CloudDoneRounded'
import { getDb, saveDb, getMasters, uploadBillFile } from './mockDb'

const COL_ISSUE = '110px 1.4fr 120px 90px 100px 110px 90px 90px 95px'
const HEADS_ISSUE = ['Issue Date', 'Stitcher Name', 'PI No.', 'Item Name', 'Qty Issued', 'Accessories', 'Acc Qty', 'Acc Color', 'Actions']
const MIN_W_ISSUE = '960px'

const COL_RECEIVE = '100px 1.4fr 110px 90px 90px 160px 1.2fr 120px 80px'
const HEADS_RECEIVE = ['Rec Date', 'Stitcher Name', 'PI No.', 'Item Name', 'Qty Rec', 'Rejections (Fab/Fac)', 'Bill Details', 'QC Checked', 'Actions']
const MIN_W_RECEIVE = '1100px'

const emptyAccessoryRow = () => ({
  name: '',
  qty: '',
  color: ''
})

const emptyIssueRow = (defaultItemNo = '') => ({
  fabricatorName: '',
  itemNo: defaultItemNo,
  qty: '',
  accessoriesList: [emptyAccessoryRow()],
  remarks: ''
})

const emptyReceiveRow = (defaultItemNo = '') => ({
  fabricatorName: '',
  itemNo: defaultItemNo,
  qty: '',
  rejectionFabricator: '0',
  rejectionFactory: '0',
  rejectionRemarks: '',
  billRec: 'No',
  billNo: '',
  billDate: '',
  billFile: '',
  qcCheckedBy: '',
  remarks: ''
})

export default function StitcherJob() {
  const [tab, setTab] = useState(0) // 0: Issue, 1: Receive
  const [db, setDb] = useState({ stitcherJobs: { issues: [], receives: [] }, printerJobs: { receives: [] }, cuttings: [], pis: [], receipts: [] })
  const [fabricatorOptions, setFabricatorOptions] = useState([])
  const [materialMasterOptions, setMaterialMasterOptions] = useState([])
  const [search, setSearch] = useState('')
  const [dialog, setDialog] = useState(false)
  const [editId, setEditId] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [validationError, setValidationError] = useState('')
  const [editIds, setEditIds] = useState([])
  const [previewUrl, setPreviewUrl] = useState(null)
  const [submitted, setSubmitted] = useState(false)

  const [pageIssues, setPageIssues] = useState(0)
  const [rowsPerPageIssues, setRowsPerPageIssues] = useState(20)
  const [pageReceives, setPageReceives] = useState(0)
  const [rowsPerPageReceives, setRowsPerPageReceives] = useState(20)

  useEffect(() => {
    setPageIssues(0)
  }, [search])

  useEffect(() => {
    setPageReceives(0)
  }, [search])

  // Batch header states (outside table)
  const [batchDate, setBatchDate] = useState('')
  const [batchPiNo, setBatchPiNo] = useState('')
  const [batchItems, setBatchItems] = useState([])

  const loadData = () => {
    getDb(['stitcherJobs', 'printerJobs', 'cuttings', 'pis', 'receipts', 'pos']).then(data => setDb(data)).catch(err => console.error(err))
  }

  useEffect(() => {
    loadData()
    getMasters('fabricators')
      .then(data => setFabricatorOptions(data.filter(f => f.status === 'Active').map(f => f.name)))
      .catch(err => console.error(err))
    getMasters('materials')
      .then(data => setMaterialMasterOptions(data.filter(m => m.status === 'Active')))
      .catch(err => console.error(err))
  }, [])

  const receivedMaterials = [...new Set([
    ...(db.receipts || []).flatMap(r => r.items || []).map(it => it.name).filter(Boolean),
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

    // 2. Consumed in cutting
    const cutConsumed = (db.cuttings || [])
      .flatMap(c => c.items || [])
      .filter(it => it.rawMaterial === materialName && (it.rawMaterialColor || '') === col)
      .reduce((sum, it) => sum + Number(it.rawMaterialUsed || 0) + Number(it.rawMaterialRejection || 0), 0)

    // 3. Issued in printing
    const printIssued = (db.printerJobs?.issues || [])
      .filter(it => it.accessories === materialName && (it.accessoriesColor || '') === col)
      .reduce((sum, it) => sum + Number(it.accessoriesQty || 0), 0)

    // 4. Issued in stitching (excluding current issue batch that we are editing/adding)
    const stitchIssuedOther = (db.stitcherJobs?.issues || [])
      .filter(it => it.id !== editId && it.accessories === materialName && (it.accessoriesColor || '') === col)
      .reduce((sum, it) => sum + Number(it.accessoriesQty || 0), 0)

    // 5. Deduct quantities entered in the CURRENT batch dialog in other rows
    const currentBatchDeduction = batchItems
      .slice(0, currentRowIdx === -1 ? batchItems.length : currentRowIdx)
      .flatMap(row => row.accessoriesList || [])
      .filter(acc => acc.name === materialName && (acc.color || '') === col)
      .reduce((sum, acc) => sum + Number(acc.qty || 0), 0)

    return (openingQty + received) - cutConsumed - printIssued - stitchIssuedOther - currentBatchDeduction
  }

  const getPanelsAvailableToIssue = (itemNo, currentRowIdx = -1) => {
    if (!batchPiNo || !itemNo) return 0

    // Check if the item requires printing
    const selectedPi = db.pis?.find(p => p.piNo === batchPiNo)
    const matchingPiProduct = selectedPi?.products?.find(pr => pr.itemNo === itemNo)
    const needsPrinting = matchingPiProduct?.printing === 'Yes'

    let totalAvailableSource = 0
    if (needsPrinting) {
      // 1. Total Printed Panels received from printers
      totalAvailableSource = (db.printerJobs?.receives || [])
        .filter(r => r.piNo === batchPiNo && r.itemNo === itemNo)
        .reduce((sum, r) => sum + Number(r.qty || 0), 0)
    } else {
      // 1. Total Cut Panels directly from cutting
      totalAvailableSource = (db.cuttings || [])
        .filter(c => c.piNo === batchPiNo)
        .flatMap(c => c.items || [])
        .filter(it => it.itemNo === itemNo)
        .reduce((sum, it) => sum + Number(it.qty || 0), 0)
    }

    // 2. Already Issued to Stitching (excluding current lot)
    const totalIssuedOther = (db.stitcherJobs?.issues || [])
      .filter(i => i.id !== editId && i.piNo === batchPiNo && i.itemNo === itemNo)
      .reduce((sum, i) => sum + Number(i.qty || 0), 0)

    // 3. Deduct entered in current batch dialog
    const currentBatchDeduction = batchItems
      .slice(0, currentRowIdx === -1 ? batchItems.length : currentRowIdx)
      .filter(it => it.itemNo === itemNo)
      .reduce((sum, it) => sum + Number(it.qty || 0), 0)

    return totalAvailableSource - totalIssuedOther - currentBatchDeduction
  }

  const updateAccessory = (rowIdx, accIdx, k, value) => {
    const items = [...batchItems]
    const list = [...items[rowIdx].accessoriesList]
    list[accIdx] = { ...list[accIdx], [k]: value }
    items[rowIdx] = { ...items[rowIdx], accessoriesList: list }
    setBatchItems(items)
  }

  const addAccessory = (rowIdx) => {
    const items = [...batchItems]
    const list = [...items[rowIdx].accessoriesList, emptyAccessoryRow()]
    items[rowIdx] = { ...items[rowIdx], accessoriesList: list }
    setBatchItems(items)
  }

  const removeAccessory = (rowIdx, accIdx) => {
    const items = [...batchItems]
    const list = items[rowIdx].accessoriesList.filter((_, i) => i !== accIdx)
    items[rowIdx] = { ...items[rowIdx], accessoriesList: list.length > 0 ? list : [emptyAccessoryRow()] }
    setBatchItems(items)
  }

  const handleSaveIssue = () => {
    setSubmitted(true)
    if (!batchDate || !batchPiNo || batchItems.length === 0) return

    // Date Validation: Stitching Issue Date cannot be before latest Printing Receive Date or Cutting Date
    const selectedPi = db.pis.find(p => p.piNo === batchPiNo)
    for (let idx = 0; idx < batchItems.length; idx++) {
      const row = batchItems[idx]
      const matchingPiProduct = selectedPi?.products.find(pr => pr.itemNo === row.itemNo)
      const needsPrinting = matchingPiProduct?.printing === 'Yes'

      if (needsPrinting) {
        const printReceives = (db.printerJobs?.receives || []).filter(r => r.piNo === batchPiNo && r.itemNo === row.itemNo)
        const latestPrintDate = printReceives.reduce((latest, r) => {
          if (!latest) return r.date
          return dayjs(r.date).isAfter(dayjs(latest)) ? r.date : latest
        }, null)

        if (latestPrintDate && dayjs(batchDate).isBefore(dayjs(latestPrintDate))) {
          setValidationError(`VALIDATION ERROR at row ${idx + 1}: Stitching Issue Date (${dayjs(batchDate).format('DD/MM/YYYY')}) cannot be before latest Printing Receive Date (${dayjs(latestPrintDate).format('DD/MM/YYYY')})!`)
          return
        }
      } else {
        const cuttings = (db.cuttings || []).filter(c => c.piNo === batchPiNo && (c.items || []).some(it => it.itemNo === row.itemNo))
        const latestCuttingDate = cuttings.reduce((latest, c) => {
          if (!latest) return c.date
          return dayjs(c.date).isAfter(dayjs(latest)) ? c.date : latest
        }, null)

        if (latestCuttingDate && dayjs(batchDate).isBefore(dayjs(latestCuttingDate))) {
          setValidationError(`VALIDATION ERROR at row ${idx + 1}: Stitching Issue Date (${dayjs(batchDate).format('DD/MM/YYYY')}) cannot be before latest Cutting Date (${dayjs(latestCuttingDate).format('DD/MM/YYYY')})!`)
          return
        }
      }
    }

    const itemTotals = {}
    batchItems.forEach(item => {
      if (item.itemNo) {
        itemTotals[item.itemNo] = (itemTotals[item.itemNo] || 0) + Number(item.qty || 0)
      }
    })

    // Validate accessories stock
    const accTotals = {}
    batchItems.forEach(row => {
      (row.accessoriesList || []).forEach(acc => {
        if (acc.name) {
          const key = `${acc.name}||${acc.color || ''}`
          accTotals[key] = (accTotals[key] || 0) + Number(acc.qty || 0)
        }
      })
    })

    for (let idx = 0; idx < batchItems.length; idx++) {
      const row = batchItems[idx]
      for (let accIdx = 0; accIdx < (row.accessoriesList || []).length; accIdx++) {
        const acc = row.accessoriesList[accIdx]
        if (!acc.name) continue

        if (Number(acc.qty || 0) < 0) {
          setValidationError(`VALIDATION ERROR: Accessory quantity cannot be negative!`);
          return
        }

        const key = `${acc.name}||${acc.color || ''}`
        const totalRequested = accTotals[key]

        const masterOpt = materialMasterOptions.find(m => m.name === acc.name && (m.color || '') === (acc.color || ''))
        const openingQty = masterOpt ? Number(masterOpt.openingQty || 0) : 0

        const col = acc.color || ''
        const received = (db.receipts || [])
          .flatMap(r => r.items || [])
          .filter(it => it.name === acc.name && (it.color || '') === col)
          .reduce((sum, it) => sum + Number(it.qty || 0), 0)

        const cutConsumed = (db.cuttings || [])
          .flatMap(c => c.items || [])
          .filter(it => it.rawMaterial === acc.name && (it.rawMaterialColor || '') === col)
          .reduce((sum, it) => sum + Number(it.rawMaterialUsed || 0) + Number(it.rawMaterialRejection || 0), 0)

        const printIssuedOther = (db.printerJobs?.issues || [])
          .filter(it => it.accessories === acc.name && (it.accessoriesColor || '') === col)
          .reduce((sum, it) => sum + Number(it.accessoriesQty || 0), 0)

        const stitchIssuedOther = (db.stitcherJobs?.issues || [])
          .filter(it => !editIds.includes(it.id) && it.accessories === acc.name && (it.accessoriesColor || '') === col)
          .reduce((sum, it) => sum + Number(it.accessoriesQty || 0), 0)

        const netAvailable = (openingQty + received) - cutConsumed - printIssuedOther - stitchIssuedOther

        if (totalRequested > netAvailable) {
          setValidationError(`VALIDATION ERROR at row ${idx + 1}: Accessory "${acc.name}" (${acc.color || 'Natural'}) quantity ${totalRequested} exceeds available stock of ${netAvailable}!`);
          return
        }
      }
    }

    for (let idx = 0; idx < batchItems.length; idx++) {
      const item = batchItems[idx]
      if (!item.itemNo) continue

      if (item.qty && Number(item.qty) > 0) {
        const totalPrinted = db.printerJobs?.receives
          .filter(r => r.piNo === batchPiNo)
          .reduce((sum, r) => sum + Number(r.qty || 0), 0) || 0

        const totalCut = db.cuttings
          .filter(c => c.piNo === batchPiNo)
          .reduce((sum, c) => sum + c.items.filter(it => it.itemNo === item.itemNo).reduce((s, it) => s + Number(it.qty || 0), 0), 0)

        const selectedPi = db.pis.find(p => p.piNo === batchPiNo)
        const matchingProduct = selectedPi?.products.find(pr => pr.itemNo === item.itemNo)
        const isPrintingReq = matchingProduct ? matchingProduct.printing === 'Yes' : false

        const stockAvailable = isPrintingReq ? totalPrinted : totalCut
        const totalIssuedStitchOther = db.stitcherJobs.issues
          .filter(s => s.id !== editId && s.piNo === batchPiNo && s.itemNo === item.itemNo)
          .reduce((sum, s) => sum + Number(s.qty || 0), 0)

        const currentDialogQty = itemTotals[item.itemNo]
        const available = stockAvailable - totalIssuedStitchOther

        if (currentDialogQty > available) {
          setValidationError(`VALIDATION ERROR at row ${idx + 1}: Qty exceeds available panels! Max available for item "${item.itemNo}": ${available} pcs. (Current dialog total: ${currentDialogQty} pcs)`);
          return
        }
      }
    }

    // Flatten batchItems for saving stitcher issues to database
    const flatIssues = []
    batchItems.forEach(row => {
      row.accessoriesList.forEach((acc, aIdx) => {
        flatIssues.push({
          fabricatorName: row.fabricatorName,
          itemNo: row.itemNo,
          qty: aIdx === 0 ? (Number(row.qty) || 0) : 0,
          accessories: acc.name,
          accessoriesQty: Number(acc.qty || 0),
          accessoriesColor: acc.color,
          remarks: row.remarks,
          date: batchDate,
          piNo: batchPiNo
        })
      })
    })

    const newDb = { ...db }
    if (editId) {
      newDb.stitcherJobs.issues = newDb.stitcherJobs.issues.filter(i => !editIds.includes(i.id))
      flatIssues.forEach(item => {
        const newId = 'ST-I-' + Date.now().toString().slice(-4) + Math.random().toString().slice(-4)
        newDb.stitcherJobs.issues.push({ ...item, id: newId })
      })
    } else {
      flatIssues.forEach(item => {
        const newId = 'ST-I-' + Date.now().toString().slice(-4) + Math.random().toString().slice(-4)
        newDb.stitcherJobs.issues.push({ ...item, id: newId })
      })
    }
    saveDb({ stitcherJobs: newDb.stitcherJobs })
      .then(() => {
        loadData()
        setDialog(false)
      })
      .catch(err => setValidationError(err.message))
  }

  const handleSaveReceive = () => {
    setSubmitted(true)
    if (!batchDate || !batchPiNo || batchItems.length === 0) return

    // Date Validation: Receive Date cannot be before latest Stitching Issue Date for the selected items
    const matchingIssues = (db.stitcherJobs?.issues || [])
      .filter(i => i.piNo === batchPiNo && (batchItems || []).some(item => item.itemNo === i.itemNo && item.fabricatorName === i.fabricatorName))
    const latestIssueDate = matchingIssues.reduce((latest, i) => {
      if (!latest) return i.date
      return dayjs(i.date).isAfter(dayjs(latest)) ? i.date : latest
    }, null)

    if (latestIssueDate && dayjs(batchDate).isBefore(dayjs(latestIssueDate))) {
      setValidationError(`VALIDATION ERROR: Receive Date (${dayjs(batchDate).format('DD/MM/YYYY')}) cannot be before latest Stitching Issue Date (${dayjs(latestIssueDate).format('DD/MM/YYYY')})!`)
      return
    }

    for (let idx = 0; idx < batchItems.length; idx++) {
      const item = batchItems[idx]
      if (!item.itemNo || !item.qty) continue

      const totalIssued = db.stitcherJobs.issues
        .filter(i => i.piNo === batchPiNo && i.itemNo === item.itemNo)
        .reduce((sum, i) => sum + Number(i.qty || 0), 0)

      const totalReceived = db.stitcherJobs.receives
        .filter(r => r.id !== editId && r.piNo === batchPiNo && r.itemNo === item.itemNo)
        .reduce((sum, r) => sum + Number(r.qty || 0), 0)

      const maxAllowed = totalIssued - totalReceived
      if (Number(item.qty) > maxAllowed) {
        setValidationError(`VALIDATION ERROR at row ${idx + 1}: Received qty exceeds pending stitch issued qty! Max allowed: ${maxAllowed} pcs.`);
        return
      }
    }

    const newDb = { ...db }
    const savedItems = batchItems.map(item => ({ ...item, date: batchDate, piNo: batchPiNo }))

    if (editId) {
      newDb.stitcherJobs.receives = newDb.stitcherJobs.receives.map(r => r.id === editId ? { ...savedItems[0], id: editId } : r)
    } else {
      savedItems.forEach(item => {
        const newId = 'ST-R-' + Date.now().toString().slice(-4) + Math.random().toString().slice(-2)
        newDb.stitcherJobs.receives.push({ ...item, id: newId })
      })
    }
    saveDb({ stitcherJobs: newDb.stitcherJobs })
      .then(() => {
        loadData()
        setDialog(false)
      })
      .catch(err => setValidationError(err.message))
  }

  const handleDelete = () => {
    const newDb = { ...db }
    if (tab === 0) {
      newDb.stitcherJobs.issues = newDb.stitcherJobs.issues.filter(i => i.id !== deleteId)
    } else {
      newDb.stitcherJobs.receives = newDb.stitcherJobs.receives.filter(r => r.id !== deleteId)
    }
    saveDb({ stitcherJobs: newDb.stitcherJobs })
      .then(() => {
        loadData()
        setDeleteId(null)
      })
      .catch(err => alert(err.message))
  }

  const openAdd = () => {
    setSubmitted(false)
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
    setSubmitted(false)
    setValidationError('')
    setEditId(item.id)
    setBatchDate(item.date)
    setBatchPiNo(item.piNo)

    if (tab === 0) {
      const matchingIssues = (db.stitcherJobs?.issues || []).filter(i => i.date === item.date && i.piNo === item.piNo && i.fabricatorName === item.fabricatorName)
      const idsToReplace = matchingIssues.map(i => i.id)
      setEditIds(idsToReplace)

      const groupedMap = new Map()
      matchingIssues.forEach(it => {
        const key = it.itemNo
        if (!groupedMap.has(key)) {
          groupedMap.set(key, {
            fabricatorName: it.fabricatorName,
            itemNo: it.itemNo,
            qty: '',
            accessoriesList: [],
            remarks: it.remarks || ''
          })
        }

        const group = groupedMap.get(key)
        if (Number(it.qty) > 0) {
          group.qty = it.qty
        }

        if (it.accessories || it.accessoriesQty || it.accessoriesColor) {
          group.accessoriesList.push({
            name: it.accessories || '',
            qty: it.accessoriesQty || '',
            color: it.accessoriesColor || ''
          })
        }
      })

      const items = Array.from(groupedMap.values()).map(group => {
        if (group.accessoriesList.length === 0) {
          group.accessoriesList.push(emptyAccessoryRow())
        }
        return group
      })

      setBatchItems(items.length > 0 ? items : [emptyIssueRow()])
    } else {
      setBatchItems([{ ...item }])
    }
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
      uploadBillFile(file)
        .then(res => {
          const items = [...batchItems]
          items[idx] = { ...items[idx], billFile: res.url }
          setBatchItems(items)
        })
        .catch(err => alert(err.message))
    }
  }

  const matchesSearch = (record, searchString) => {
    if (!searchString || !searchString.trim()) return true
    const q = searchString.trim().toLowerCase()

    const fields = [
      record.piNo,
      record.itemNo,
      record.fabricatorName,
      record.printerName,
      record.supplier,
      record.buyerName,
      record.remarks,
      record.billNo,
      record.qcCheckedBy,
      record.accessories,
      record.accessoriesColor
    ].filter(Boolean).map(v => String(v).toLowerCase())

    // Exact phrase match — field must contain the full query as a substring
    return fields.some(f => f.includes(q))
  }

  const filteredIssues = (db.stitcherJobs?.issues || []).filter(i => matchesSearch(i, search))
  const filteredReceives = (db.stitcherJobs?.receives || []).filter(r => matchesSearch(r, search))

  const selectedPi = db.pis.find(p => p.piNo === batchPiNo)
  const activeItemNos = selectedPi
    ? selectedPi.products
        .map(pr => pr.itemNo)
        .filter(itemNo => (db.cuttings || []).some(c => c.piNo === batchPiNo && (c.items || []).some(it => it.itemNo === itemNo)))
    : []

  return (
    <Box className="page-enter">
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: 'rgba(108, 99, 255, 0.1)', color: '#6C63FF', borderRadius: 2, width: 46, height: 46 }}>
            <HandymanRoundedIcon />
          </Avatar>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', lineHeight: 1.2 }}>Stitcher Job</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>Issue printed/panel panels to stitching tailors and receive completed bags</Typography>
          </Box>
        </Box>
        <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={openAdd}
          sx={{ borderRadius: 2, fontWeight: 700, background: 'linear-gradient(135deg,#6C63FF,#9B94FF)', boxShadow: '0 4px 14px rgba(108,99,255,0.35)' }}>
          {tab === 0 ? 'Issue Job' : 'Receive Job'}
        </Button>
      </Box>

      {/* Tabs Layout */}
      <Tabs value={tab} onChange={(e, nv) => { setTab(nv); setSearch('') }} sx={{ mb: 3 }}>
        <Tab label="Issue to Stitcher" sx={{ fontWeight: 700 }} />
        <Tab label="Receive from Stitcher" sx={{ fontWeight: 700 }} />
      </Tabs>

      {/* Search */}
      <Card sx={{ mb: 2.5 }}>
        <CardContent sx={{ p: 2 }}>
          <TextField fullWidth size="small" placeholder={tab === 0 ? "Search by Stitcher Name, PI No, Item..." : "Search by Stitcher Name, PI No, Item..."}
            value={search} onChange={e => setSearch(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchRoundedIcon sx={{ color: '#9CA3AF', fontSize: 18 }} /></InputAdornment> }} />
          {search.trim() && (
            <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip
                label={`Showing all ${tab === 0 ? filteredIssues.length : filteredReceives.length} matching records for "${search.trim()}"`}
                size="small"
                color="primary"
                variant="outlined"
                sx={{ fontWeight: 600, fontSize: '0.75rem' }}
              />
            </Box>
          )}
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
                {(search.trim() ? filteredIssues : filteredIssues.slice(pageIssues * rowsPerPageIssues, pageIssues * rowsPerPageIssues + rowsPerPageIssues)).map(i => (
                  <Box key={i.id} sx={{ display: 'grid', gridTemplateColumns: COL_ISSUE, px: 2, py: 1.5, alignItems: 'center', '&:hover': { bgcolor: 'rgba(108,99,255,0.03)' } }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>{i.date ? dayjs(i.date).format('DD/MM/YYYY') : '—'}</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{i.fabricatorName}</Typography>
                    <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 700 }}>{i.piNo}</Typography>
                    <Chip label={i.itemNo || '—'} size="small" sx={{ fontWeight: 700, fontSize: '0.7rem', width: 'fit-content' }} />
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{i.qty} pcs</Typography>
                    <Typography variant="body2">{i.accessories || '—'}</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{i.accessoriesQty || '—'}</Typography>
                    <Typography variant="body2">{i.accessoriesColor || '—'}</Typography>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Tooltip title="Edit"><IconButton size="small" sx={{ color: 'primary.main' }} onClick={() => openEdit(i)}><EditRoundedIcon fontSize="small" /></IconButton></Tooltip>
                      <Tooltip title="Delete"><IconButton size="small" sx={{ color: 'error.main' }} onClick={() => setDeleteId(i.id)}><DeleteRoundedIcon fontSize="small" /></IconButton></Tooltip>
                    </Box>
                  </Box>
                ))}
              </Stack>
            )}
          </Box>
          {!search.trim() && filteredIssues.length > rowsPerPageIssues && (
            <TablePagination
              component="div"
              count={filteredIssues.length}
              page={pageIssues}
              onPageChange={(e, newPage) => setPageIssues(newPage)}
              rowsPerPage={rowsPerPageIssues}
              onRowsPerPageChange={(e) => {
                setRowsPerPageIssues(parseInt(e.target.value, 10))
                setPageIssues(0)
              }}
              rowsPerPageOptions={[10, 20, 50, 100, 500]}
            />
          )}
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
                {(search.trim() ? filteredReceives : filteredReceives.slice(pageReceives * rowsPerPageReceives, pageReceives * rowsPerPageReceives + rowsPerPageReceives)).map(r => (
                  <Box key={r.id} sx={{ display: 'grid', gridTemplateColumns: COL_RECEIVE, px: 2, py: 1.5, alignItems: 'center', '&:hover': { bgcolor: 'rgba(108,99,255,0.03)' } }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>{r.date ? dayjs(r.date).format('DD/MM/YYYY') : '—'}</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{r.fabricatorName}</Typography>
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
          {!search.trim() && filteredReceives.length > rowsPerPageReceives && (
            <TablePagination
              component="div"
              count={filteredReceives.length}
              page={pageReceives}
              onPageChange={(e, newPage) => setPageReceives(newPage)}
              rowsPerPage={rowsPerPageReceives}
              onRowsPerPageChange={(e) => {
                setRowsPerPageReceives(parseInt(e.target.value, 10))
                setPageReceives(0)
              }}
              rowsPerPageOptions={[10, 20, 50, 100, 500]}
            />
          )}
        </Card>
      )}

      {/* Add / Edit Dialog */}
      <Dialog open={dialog} onClose={() => setDialog(false)} maxWidth={false} fullWidth PaperProps={{ sx: { borderRadius: 3, width: '1500px', maxWidth: '95%' } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>
          {editId ? 'Edit Record' : tab === 0 ? 'Issue to Stitcher' : 'Receive from Stitcher'}
        </DialogTitle>
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
                <Typography variant="caption" sx={{ fontWeight: 600, color: '#374151', mb: 0.5, display: 'block' }}>Date *</Typography>
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

            {tab === 0 ? (
              <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 2, overflowX: 'auto' }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#6C63FF', mb: 1.5, display: 'block', textTransform: 'uppercase' }}>Issue Items</Typography>
                
                <Box sx={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr 1fr 480px 1.5fr 36px', gap: 1.5, pb: 1, borderBottom: '1px solid', borderColor: 'divider', mb: 1.5, minWidth: '950px' }}>
                  {['Stitcher Name *', 'Item Name *', 'Qty Issued *', 'Accessories Issued (Name, Color, Qty) *', 'Remarks', ''].map(h => (
                    <Typography key={h} variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.62rem', textTransform: 'uppercase' }}>{h}</Typography>
                  ))}
                </Box>

                <Stack spacing={2} sx={{ minWidth: '950px' }}>
                  {batchItems.map((row, idx) => (
                    <Box key={idx} sx={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr 1fr 480px 1.5fr 36px', gap: 1.5, alignItems: 'start' }}>
                      <Autocomplete
                        size="small"
                        options={fabricatorOptions}
                        value={row.fabricatorName || null}
                        onChange={(e, val) => {
                          const items = [...batchItems]
                          items[idx] = { ...items[idx], fabricatorName: val || '' }
                          setBatchItems(items)
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            placeholder="Stitcher"
                            error={submitted && !row.fabricatorName}
                            helperText={submitted && !row.fabricatorName ? 'Required' : ''}
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

                      <Box>
                        <TextField
                          size="small"
                          type="number"
                          value={row.qty}
                          onChange={setRow(idx, 'qty')}
                          placeholder="0"
                          fullWidth
                          error={(submitted && (!row.qty || Number(row.qty) < 0)) || (row.itemNo && Number(row.qty || 0) > getPanelsAvailableToIssue(row.itemNo, idx))}
                          helperText={submitted && (!row.qty || Number(row.qty) < 0) ? 'Required' : ''}
                        />
                        {row.itemNo && (
                          <Typography variant="caption" sx={{ display: 'block', fontSize: '0.65rem', color: Number(row.qty || 0) > getPanelsAvailableToIssue(row.itemNo, idx) ? 'error.main' : 'text.secondary', mt: 0.5, fontWeight: 600 }}>
                            Avail: {getPanelsAvailableToIssue(row.itemNo, idx)}
                          </Typography>
                        )}
                      </Box>

                      {/* Nested Accessories Stack */}
                      <Box sx={{ bgcolor: 'rgba(0,0,0,0.015)', p: 1, borderRadius: 2, border: '1px dashed rgba(0,0,0,0.08)' }}>
                        <Stack spacing={1}>
                          {row.accessoriesList.map((acc, accIdx) => {
                            const availStock = getMaterialAvailableStock(acc.name, acc.color, idx)
                            const colors = getMaterialColors(acc.name)

                            return (
                              <Box key={accIdx} sx={{ display: 'grid', gridTemplateColumns: '150px 100px 90px 30px', gap: 1, alignItems: 'center' }}>
                                <Autocomplete
                                  size="small"
                                  options={receivedMaterials}
                                  value={acc.name || null}
                                  onChange={(e, val) => updateAccessory(idx, accIdx, 'name', val || '')}
                                  renderInput={(params) => (
                                    <TextField
                                      {...params}
                                      placeholder="Accessory"
                                    />
                                  )}
                                />

                                <TextField
                                  size="small"
                                  select
                                  value={acc.color}
                                  onChange={e => updateAccessory(idx, accIdx, 'color', e.target.value)}
                                  disabled={!acc.name}
                                  displayEmpty
                                >
                                  <MenuItem value="" disabled><em>Color...</em></MenuItem>
                                  {colors.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                                </TextField>

                                <Box>
                                  <TextField
                                    size="small"
                                    type="number"
                                    value={acc.qty}
                                    onChange={e => updateAccessory(idx, accIdx, 'qty', e.target.value)}
                                    placeholder="Qty"
                                    fullWidth
                                    error={acc.name && Number(acc.qty || 0) > availStock}
                                  />
                                  {acc.name && (
                                    <Typography variant="caption" sx={{ display: 'block', fontSize: '0.6rem', color: Number(acc.qty || 0) > availStock ? 'error.main' : 'text.secondary', mt: 0.5, fontWeight: 600 }}>
                                      Avail: {availStock}
                                    </Typography>
                                  )}
                                </Box>

                                <IconButton
                                  size="small"
                                  onClick={() => removeAccessory(idx, accIdx)}
                                  disabled={row.accessoriesList.length === 1}
                                  sx={{ color: 'error.main' }}
                                >
                                  <DeleteRoundedIcon fontSize="inherit" />
                                </IconButton>
                              </Box>
                            )
                          })}
                        </Stack>
                        <Button
                          size="small"
                          startIcon={<AddRoundedIcon sx={{ fontSize: '0.8rem !important' }} />}
                          onClick={() => addAccessory(idx)}
                          sx={{ mt: 1, py: 0.25, fontSize: '0.65rem', fontWeight: 700 }}
                        >
                          Add Accessory
                        </Button>
                      </Box>

                      <TextField size="small" value={row.remarks} onChange={setRow(idx, 'remarks')} placeholder="Remarks" multiline rows={3} />

                      <IconButton size="small" onClick={() => removeRow(idx)} disabled={batchItems.length === 1} sx={{ color: 'error.main', mt: 0.5 }}>
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
                
                <Box sx={{ display: 'grid', gridTemplateColumns: '200px 140px 110px 90px 90px 130px 110px 90px 110px 100px 120px 130px 36px', gap: 1.5, pb: 1, borderBottom: '1px solid', borderColor: 'divider', mb: 1.5, minWidth: '1450px' }}>
                  {['Stitcher Name *', 'Item Name *', 'Qty Rec *', 'Rej Fab', 'Rej Fac', 'Rej Remarks', 'QC Checked', 'Bill Rec', 'Bill No', 'Bill Date', 'Bill Upload', 'Remarks', ''].map(h => (
                    <Typography key={h} variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.62rem', textTransform: 'uppercase' }}>{h}</Typography>
                  ))}
                </Box>

                <Stack spacing={1.5} sx={{ minWidth: '1450px' }}>
                  {batchItems.map((row, idx) => (
                    <Box key={idx} sx={{ display: 'grid', gridTemplateColumns: '200px 140px 110px 90px 90px 130px 110px 90px 110px 100px 120px 130px 36px', gap: 1.5, alignItems: 'center' }}>
                      <Autocomplete
                        size="small"
                        options={fabricatorOptions}
                        value={row.fabricatorName || null}
                        onChange={(e, val) => {
                          const items = [...batchItems]
                          items[idx] = { ...items[idx], fabricatorName: val || '' }
                          setBatchItems(items)
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            placeholder="Stitcher"
                            error={submitted && !row.fabricatorName}
                            helperText={submitted && !row.fabricatorName ? 'Required' : ''}
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
                        error={submitted && (!row.qty || Number(row.qty) < 0)}
                        helperText={submitted && (!row.qty || Number(row.qty) < 0) ? 'Required' : ''} />

                      <TextField size="small" type="number" value={row.rejectionFabricator} onChange={setRow(idx, 'rejectionFabricator')} placeholder="0"
                        error={submitted && (row.rejectionFabricator === '' || Number(row.rejectionFabricator) < 0)}
                        helperText={submitted && (row.rejectionFabricator === '' || Number(row.rejectionFabricator) < 0) ? 'Required' : ''} />

                      <TextField size="small" type="number" value={row.rejectionFactory} onChange={setRow(idx, 'rejectionFactory')} placeholder="0"
                        error={submitted && (row.rejectionFactory === '' || Number(row.rejectionFactory) < 0)}
                        helperText={submitted && (row.rejectionFactory === '' || Number(row.rejectionFactory) < 0) ? 'Required' : ''} />

                      <TextField size="small" value={row.rejectionRemarks} onChange={setRow(idx, 'rejectionRemarks')} placeholder="Rejection remarks..." multiline rows={3} />

                      <TextField size="small" value={row.qcCheckedBy} onChange={setRow(idx, 'qcCheckedBy')} placeholder="Name" />

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

                      <TextField size="small" value={row.remarks} onChange={setRow(idx, 'remarks')} placeholder="General remarks..." multiline rows={3} />

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
