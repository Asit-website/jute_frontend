import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import {
  Box, Typography, Card, CardContent, Button, TextField, MenuItem,
  Grid, Stack, Divider, TablePagination, Chip, Avatar, InputAdornment, Autocomplete,
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import dayjs from 'dayjs'
import * as XLSX from 'xlsx-js-style'
import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded'
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded'
import PrintRoundedIcon from '@mui/icons-material/PrintRounded'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import AssessmentRoundedIcon from '@mui/icons-material/AssessmentRounded'
import InventoryRoundedIcon from '@mui/icons-material/InventoryRounded'
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded'
import TimelineRoundedIcon from '@mui/icons-material/TimelineRounded'
import ContentCutRoundedIcon from '@mui/icons-material/ContentCutRounded'
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import { getDb, getMasters } from './workflow/mockDb'

const COL_PO_DUE = '100px 120px 1.5fr 1.5fr 1fr 90px 110px 110px 110px 140px'
const COL_STOCK = '2fr 1fr 80px 110px 110px 125px 145px 130px 130px 110px 110px'
const COL_PIPELINE = '1.5fr 1.2fr 1.2fr 1.5fr 1.2fr 90px 90px 1.5fr 100px'
const COL_CUTTING_DUE = '2fr 1.5fr 1.5fr 1.5fr 1.5fr 1.5fr 100px'
const COL_PRINTING_DUE = '2fr 1.5fr 1.5fr 1.5fr 1.5fr 100px'
const COL_BUYER_STATUS = '2.5fr 1.2fr 1.2fr 1.5fr 1.5fr 1.5fr 120px'
const COL_QC = '1.2fr 1.5fr 1.2fr 1.2fr 1.1fr 1.1fr 1.1fr 1.2fr 90px 1.5fr'

export default function Reports() {
  const { reportKey } = useParams()
  const activeReport = reportKey || 'po-due'
  const [db, setDb] = useState({ pos: [], receipts: [], cuttings: [], printerJobs: { issues: [] }, stitcherJobs: { issues: [] } })
  const [unitLookup, setUnitLookup] = useState({})
  const [materialMasterOptions, setMaterialMasterOptions] = useState([])
  
  // PO Due Report states
  const [search, setSearch] = useState('')
  const [supplierFilter, setSupplierFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(null)
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(20)

  // Closing Stock Report states
  const [stockSearch, setStockSearch] = useState('')
  const [stockStatusFilter, setStockStatusFilter] = useState('All')
  const [stockPage, setStockPage] = useState(0)
  const [stockRowsPerPage, setStockRowsPerPage] = useState(20)

  // Fabricator Stitching Report states
  const [pipelineSearch, setPipelineSearch] = useState('')
  const [pipelinePiFilter, setPipelinePiFilter] = useState('All')
  const [pipelinePage, setPipelinePage] = useState(0)
  const [pipelineRowsPerPage, setPipelineRowsPerPage] = useState(20)

  // Cutting Issue due to Fabricators Report states
  const [cutIssueSearch, setCutIssueSearch] = useState('')
  const [cutIssuePiFilter, setCutIssuePiFilter] = useState('All')
  const [cutIssueTypeFilter, setCutIssueTypeFilter] = useState('All')
  const [cutIssuePage, setCutIssuePage] = useState(0)
  const [cutIssueRowsPerPage, setCutIssueRowsPerPage] = useState(20)

  // Fabricator Printing Report states
  const [printFabSearch, setPrintFabSearch] = useState('')
  const [printFabPiFilter, setPrintFabPiFilter] = useState('All')
  const [printFabPage, setPrintFabPage] = useState(0)
  const [printFabRowsPerPage, setPrintFabRowsPerPage] = useState(20)

  // Finished Goods Report states
  const [fgSearch, setFgSearch] = useState('')
  const [fgPiFilter, setFgPiFilter] = useState('All')
  const [fgPage, setFgPage] = useState(0)
  const [fgRowsPerPage, setFgRowsPerPage] = useState(20)

  // Buyer Wise Order Status Report states
  const [buyerSearch, setBuyerSearch] = useState('')
  const [buyerPage, setBuyerPage] = useState(0)
  const [buyerRowsPerPage, setBuyerRowsPerPage] = useState(20)
  const [selectedBuyerDetails, setSelectedBuyerDetails] = useState(null)

  // Shipment Schedule Report states
  const [scheduleSearch, setScheduleSearch] = useState('')
  const [schedulePage, setSchedulePage] = useState(0)
  const [scheduleRowsPerPage, setScheduleRowsPerPage] = useState(20)
  const [scheduleStartDate, setScheduleStartDate] = useState(null)
  const [scheduleEndDate, setScheduleEndDate] = useState(null)

  // PI Wise QC Report states
  const [qcSearch, setQcSearch] = useState('')
  const [qcPage, setQcPage] = useState(0)
  const [qcRowsPerPage, setQcRowsPerPage] = useState(20)

  useEffect(() => {
    setPage(0)
  }, [search, supplierFilter, statusFilter, startDate, endDate])

  useEffect(() => {
    setStockPage(0)
  }, [stockSearch, stockStatusFilter])

  useEffect(() => {
    setPipelinePage(0)
  }, [pipelineSearch, pipelinePiFilter])

  useEffect(() => {
    setCutIssuePage(0)
  }, [cutIssueSearch, cutIssuePiFilter, cutIssueTypeFilter])

  useEffect(() => {
    setPrintFabPage(0)
  }, [printFabSearch, printFabPiFilter])

  useEffect(() => {
    setFgPage(0)
  }, [fgSearch, fgPiFilter])

  useEffect(() => {
    setBuyerPage(0)
  }, [buyerSearch])

  useEffect(() => {
    setSchedulePage(0)
  }, [scheduleSearch, scheduleStartDate, scheduleEndDate])

  useEffect(() => {
    setQcPage(0)
  }, [qcSearch])

  useEffect(() => {
    // Load all inventory transaction tables to compute exact closing stocks & PO pending balances
    getDb(['pos', 'receipts', 'cuttings', 'printerJobs', 'stitcherJobs', 'finishing', 'shipments', 'pis'])
      .then(data => setDb(data))
      .catch(err => console.error(err))
    // Load units master to map unit codes to names
    getMasters('units')
      .then(data => {
        const lookup = {}
        data.forEach(u => { lookup[u.name] = u.unitName || u.name })
        setUnitLookup(lookup)
      })
      .catch(err => console.error(err))
    getMasters('materials')
      .then(data => {
        setMaterialMasterOptions(data.filter(m => m.status === 'Active'))
      })
      .catch(err => console.error(err))
  }, [])

  const unitLabel = (code) => {
    if (!code) return '—'
    return unitLookup[code] || code
  }

  // ==========================================
  // 1. DATA PROCESSING FOR PO DUE REPORT
  // ==========================================
  const rawRows = []
  const suppliersSet = new Set(['All'])

  if (db.pos && db.receipts) {
    db.pos.forEach(po => {
      if (po.supplier) suppliersSet.add(po.supplier)
      const poReceipts = db.receipts.filter(r => r.supplier === po.supplier)

      if (po.items) {
        po.items.forEach(item => {
          const orderedQty = Number(item.qty || 0)
          const receivedQty = poReceipts.reduce((sum, rec) => {
            const matchedItem = (rec.items || []).find(it => it.name === item.name && it.color === item.color)
            return sum + Number(matchedItem?.qty || 0)
          }, 0)

          const dueQty = Math.max(0, orderedQty - receivedQty)
          const status = dueQty <= 0 ? 'Fully Received' : (receivedQty > 0 ? 'Partially Received' : 'Pending')

          rawRows.push({
            id: `${po.id}-${item.name}-${item.color}`,
            date: po.date,
            poNo: po.poNo || po.id,
            supplier: po.supplier,
            materialName: item.name,
            color: item.color,
            unit: item.unit,
            orderedQty,
            receivedQty,
            dueQty,
            status
          })
        })
      }
    })
  }

  const filteredPoDueRows = rawRows.filter(row => {
    const matchesSearch = !search ||
      row.poNo.toLowerCase().includes(search.toLowerCase()) ||
      row.supplier.toLowerCase().includes(search.toLowerCase()) ||
      row.materialName.toLowerCase().includes(search.toLowerCase())

    const matchesSupplier = supplierFilter === 'All' || row.supplier === supplierFilter

    const matchesStatus = statusFilter === 'All' ||
      (statusFilter === 'Pending' && row.dueQty > 0) ||
      (statusFilter === 'Completed' && row.dueQty <= 0)

    const matchesDate = (!startDate || dayjs(row.date).isAfter(dayjs(startDate).subtract(1, 'day'))) &&
      (!endDate || dayjs(row.date).isBefore(dayjs(endDate).add(1, 'day')))

    return matchesSearch && matchesSupplier && matchesStatus && matchesDate
  })

  const paginatedPoDueRows = filteredPoDueRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)

  const poDueUniquePOs = new Set(filteredPoDueRows.map(r => r.poNo)).size
  const poDueTotalOrdered = filteredPoDueRows.reduce((sum, r) => sum + r.orderedQty, 0)
  const poDueTotalDue = filteredPoDueRows.reduce((sum, r) => sum + r.dueQty, 0)
  const poDuePendingCount = filteredPoDueRows.filter(r => r.dueQty > 0).length

  // ==========================================
  // 2. DATA PROCESSING FOR CLOSING STOCK REPORT
  // ==========================================
  const rawStockRows = []
  const stockKeys = new Set()

  // 1. Compile active materials with opening stock from Raw Material Master first
  if (materialMasterOptions) {
    materialMasterOptions.forEach(m => {
      if (m.name && Number(m.openingQty || 0) > 0) {
        const key = `${m.name}||${m.color || ''}`
        if (!stockKeys.has(key)) {
          stockKeys.add(key)
          rawStockRows.push({ name: m.name, color: m.color || '', unit: m.uom || 'KG' })
        }
      }
    })
  }

  // 2. Compile unique material name + color combinations from receipts
  if (db.receipts) {
    db.receipts.forEach(r => {
      (r.items || []).forEach(it => {
        if (it.name) {
          const key = `${it.name}||${it.color || ''}`
          if (!stockKeys.has(key)) {
            stockKeys.add(key)
            rawStockRows.push({ name: it.name, color: it.color || '', unit: it.unit || 'KG' })
          }
        }
      })
    })
  }
  if (db.pos) {
    db.pos.forEach(p => {
      (p.items || []).forEach(it => {
        if (it.name) {
          const key = `${it.name}||${it.color || ''}`
          if (!stockKeys.has(key)) {
            stockKeys.add(key)
            rawStockRows.push({ name: it.name, color: it.color || '', unit: it.unit || 'KG' })
          }
        }
      })
    })
  }

  // Calculate stock levels per item
  const stockReportRows = rawStockRows.map(item => {
    // Find matching raw material variant from master list
    const masterOpt = materialMasterOptions.find(m => m.name === item.name && (m.color || '') === (item.color || ''))
    const openingQty = masterOpt ? Number(masterOpt.openingQty || 0) : 0

    // Find total ordered in POs
    const orderedQty = (db.pos || [])
      .flatMap(po => (po.items || []).filter(it => it.name === item.name && (it.color || '') === (item.color || '')))
      .reduce((sum, it) => sum + Number(it.qty || 0), 0)

    const received = (db.receipts || [])
      .flatMap(r => r.items || [])
      .filter(it => it.name === item.name && it.color === item.color)
      .reduce((sum, it) => sum + Number(it.qty || 0), 0)

    const cutUsed = (db.cuttings || [])
      .flatMap(c => c.items || [])
      .filter(it => it.rawMaterial === item.name && it.rawMaterialColor === item.color)
      .reduce((sum, it) => sum + Number(it.rawMaterialUsed || 0), 0)

    const cutRejection = (db.cuttings || [])
      .flatMap(c => c.items || [])
      .filter(it => it.rawMaterial === item.name && it.rawMaterialColor === item.color)
      .reduce((sum, it) => sum + Number(it.rawMaterialRejection || 0), 0)

    const cutConsumed = cutUsed + cutRejection

    const printIssued = (db.printerJobs?.issues || [])
      .filter(it => it.accessories === item.name && it.accessoriesColor === item.color)
      .reduce((sum, it) => sum + Number(it.accessoriesQty || 0), 0)

    const stitchIssued = (db.stitcherJobs?.issues || [])
      .filter(it => it.accessories === item.name && it.accessoriesColor === item.color)
      .reduce((sum, it) => sum + Number(it.accessoriesQty || 0), 0)

    const closingStock = (openingQty + received) - cutConsumed - printIssued - stitchIssued
    const status = closingStock <= 0 ? 'Out of Stock' : (closingStock <= 100 ? 'Low Stock' : 'In Stock')

    return {
      ...item,
      openingQty,
      orderedQty,
      received,
      cutUsed,
      cutRejection,
      cutConsumed,
      printIssued,
      stitchIssued,
      closingStock,
      status
    }
  })

  // Filter Stock Rows
  const filteredStockRows = stockReportRows.filter(row => {
    const matchesSearch = !stockSearch ||
      row.name.toLowerCase().includes(stockSearch.toLowerCase()) ||
      row.color.toLowerCase().includes(stockSearch.toLowerCase())

    const matchesStatus = stockStatusFilter === 'All' ||
      (stockStatusFilter === 'InStock' && row.closingStock > 100) ||
      (stockStatusFilter === 'LowStock' && row.closingStock > 0 && row.closingStock <= 100) ||
      (stockStatusFilter === 'OutOfStock' && row.closingStock <= 0)

    return matchesSearch && matchesStatus
  })

  const paginatedStockRows = filteredStockRows.slice(stockPage * stockRowsPerPage, stockPage * stockRowsPerPage + stockRowsPerPage)

  const totalStockReceived = filteredStockRows.reduce((sum, r) => sum + r.received, 0)
  const totalStockCutUsed = filteredStockRows.reduce((sum, r) => sum + r.cutUsed, 0)
  const totalStockCutRejection = filteredStockRows.reduce((sum, r) => sum + r.cutRejection, 0)
  const totalStockCutConsumed = totalStockCutUsed + totalStockCutRejection
  const totalStockPrintIssued = filteredStockRows.reduce((sum, r) => sum + r.printIssued, 0)
  const totalStockStitchIssued = filteredStockRows.reduce((sum, r) => sum + r.stitchIssued, 0)
  const totalStockClosing = filteredStockRows.reduce((sum, r) => sum + r.closingStock, 0)

  // ==========================================
  // 3. DATA PROCESSING FOR FABRICATOR STOCK & DUE REPORT
  // ==========================================
  const rawPipelineRows = []

  const stitchIssues = db.stitcherJobs?.issues || []
  const stitchReceives = db.stitcherJobs?.receives || []

  // Helper to check if a product under a PI needs printing
  const isPrintedPIProduct = (piNo, itemNo) => {
    if (!db.pis) return false
    const pi = db.pis.find(p => p.piNo === piNo)
    const prod = pi?.products?.find(pr => pr.itemNo === itemNo)
    return prod?.printing === 'Yes'
  }

  // Collect unique fabricator + item combinations
  const fabItemKeys = new Set()
  stitchIssues.forEach(i => {
    if (i.fabricatorName && i.itemNo) {
      fabItemKeys.add(JSON.stringify({ fabricatorName: i.fabricatorName, itemNo: i.itemNo }))
    }
  })
  stitchReceives.forEach(r => {
    if (r.fabricatorName && r.itemNo) {
      fabItemKeys.add(JSON.stringify({ fabricatorName: r.fabricatorName, itemNo: r.itemNo }))
    }
  })

  fabItemKeys.forEach(keyStr => {
    const { fabricatorName, itemNo } = JSON.parse(keyStr)

    // Total Issued (Cutting Issue)
    const totalIssued = stitchIssues
      .filter(i => i.fabricatorName === fabricatorName && i.itemNo === itemNo)
      .reduce((sum, i) => sum + Number(i.qty || 0), 0)

    // Total Received
    const totalReceived = stitchReceives
      .filter(r => r.fabricatorName === fabricatorName && r.itemNo === itemNo)
      .reduce((sum, r) => sum + Number(r.qty || 0), 0)

    // Rejections
    const rejFab = stitchReceives
      .filter(r => r.fabricatorName === fabricatorName && r.itemNo === itemNo)
      .reduce((sum, r) => sum + Number(r.rejectionFabricator || 0), 0)

    const rejFac = stitchReceives
      .filter(r => r.fabricatorName === fabricatorName && r.itemNo === itemNo)
      .reduce((sum, r) => sum + Number(r.rejectionFactory || 0), 0)

    // Closing Stock (due)
    const closingStock = Math.max(0, totalIssued - totalReceived - rejFab - rejFac)

    // List of PI Nos
    const piNosSet = new Set()
    stitchIssues
      .filter(i => i.fabricatorName === fabricatorName && i.itemNo === itemNo)
      .forEach(i => { if (i.piNo) piNosSet.add(i.piNo) })
    stitchReceives
      .filter(r => r.fabricatorName === fabricatorName && r.itemNo === itemNo)
      .forEach(r => { if (r.piNo) piNosSet.add(r.piNo) })

    const piNos = Array.from(piNosSet).join(', ') || '—'

    rawPipelineRows.push({
      fabricatorName,
      itemNo,
      piNo: piNos,
      totalIssued,
      totalReceived,
      rejFab,
      rejFac,
      closingStock,
      status: closingStock <= 0 ? 'Completed' : 'Pending'
    })
  })

  // Unique PI list from raw rows for the dropdown
  const pipelineAllPIs = Array.from(new Set(rawPipelineRows.flatMap(r => r.piNo.split(', ').map(p => p.trim()).filter(Boolean)))).sort()

  const filteredPipelineRows = rawPipelineRows.filter(row => {
    const matchesSearch = !pipelineSearch ||
      row.fabricatorName.toLowerCase().includes(pipelineSearch.toLowerCase()) ||
      row.itemNo.toLowerCase().includes(pipelineSearch.toLowerCase()) ||
      row.piNo.toLowerCase().includes(pipelineSearch.toLowerCase())
    const matchesPi = pipelinePiFilter === 'All' || row.piNo.split(', ').map(p => p.trim()).includes(pipelinePiFilter)
    return matchesSearch && matchesPi
  })

  const paginatedPipelineRows = filteredPipelineRows.slice(pipelinePage * pipelineRowsPerPage, pipelinePage * pipelineRowsPerPage + pipelineRowsPerPage)

  const totalPipelineIssued = filteredPipelineRows.reduce((sum, r) => sum + r.totalIssued, 0)
  const totalPipelineReceived = filteredPipelineRows.reduce((sum, r) => sum + r.totalReceived, 0)
  const totalPipelineRejFab = filteredPipelineRows.reduce((sum, r) => sum + r.rejFab, 0)
  const totalPipelineRejFac = filteredPipelineRows.reduce((sum, r) => sum + r.rejFac, 0)
  const totalPipelineClosing = filteredPipelineRows.reduce((sum, r) => sum + r.closingStock, 0)

  // ==========================================
  // 3b. CUTTING ISSUE DUE TO FABRICATORS REPORT
  //     - Cutting Qty  : from cuttings table (actual pieces cut)
  //     - Received     : from stitcherJobs.receives (returned by fabricator)
  // ==========================================

  // Group by piNo + itemNo
  const cutIssueKeySet = new Set()
  ;(db.cuttings || []).forEach(c => {
    const piNo = c.piNo
    ;(c.items || []).forEach(item => {
      if (item.itemNo && piNo) {
        cutIssueKeySet.add(JSON.stringify({ piNo, itemNo: item.itemNo }))
      }
    })
  })
  ;(db.printerJobs?.issues || []).forEach(i => {
    if (i.piNo && i.itemNo) {
      cutIssueKeySet.add(JSON.stringify({ piNo: i.piNo, itemNo: i.itemNo }))
    }
  })
  ;(db.stitcherJobs?.issues || []).forEach(i => {
    if (i.piNo && i.itemNo) {
      cutIssueKeySet.add(JSON.stringify({ piNo: i.piNo, itemNo: i.itemNo }))
    }
  })

  const rawCutIssueRows = []
  cutIssueKeySet.forEach(keyStr => {
    const { piNo, itemNo } = JSON.parse(keyStr)

    // 1. Cutting Received (total panels cut for this piNo + itemNo)
    const cuttingReceived = (db.cuttings || [])
      .filter(c => c.piNo === piNo)
      .flatMap(c => c.items || [])
      .filter(it => it.itemNo === itemNo)
      .reduce((sum, it) => sum + Number(it.qty || 0), 0)

    // 2. Printing Issue
    const printingIssue = (db.printerJobs?.issues || [])
      .filter(i => i.piNo === piNo && i.itemNo === itemNo)
      .reduce((sum, i) => sum + Number(i.qty || 0), 0)

    // 3. Fabricator Issue (stitching issue)
    const fabricatorIssue = (db.stitcherJobs?.issues || [])
      .filter(i => i.piNo === piNo && i.itemNo === itemNo)
      .reduce((sum, i) => sum + Number(i.qty || 0), 0)

    // 4. Closing Stock (Due) based on filter
    let closingStock = 0
    if (cutIssueTypeFilter === 'All') {
      closingStock = Math.max(0, cuttingReceived - Math.max(printingIssue, fabricatorIssue))
    } else if (cutIssueTypeFilter === 'Printer') {
      closingStock = Math.max(0, cuttingReceived - printingIssue)
    } else if (cutIssueTypeFilter === 'Fabricator') {
      closingStock = Math.max(0, cuttingReceived - fabricatorIssue)
    }

    rawCutIssueRows.push({
      piNo,
      itemNo,
      cuttingReceived,
      printingIssue,
      fabricatorIssue,
      closingStock,
      status: closingStock <= 0 ? 'Completed' : 'Pending'
    })
  })

  const cutIssueAllPIs = Array.from(new Set(rawCutIssueRows.map(r => r.piNo).filter(Boolean))).sort()

  const filteredCutIssueRows = rawCutIssueRows.filter(row => {
    const matchesSearch = !cutIssueSearch ||
      row.itemNo.toLowerCase().includes(cutIssueSearch.toLowerCase()) ||
      row.piNo.toLowerCase().includes(cutIssueSearch.toLowerCase())
    const matchesPi = cutIssuePiFilter === 'All' || row.piNo === cutIssuePiFilter
    return matchesSearch && matchesPi
  })

  const paginatedCutIssueRows = filteredCutIssueRows.slice(cutIssuePage * cutIssueRowsPerPage, cutIssuePage * cutIssueRowsPerPage + cutIssueRowsPerPage)

  const totalCutIssueReceived = filteredCutIssueRows.reduce((sum, r) => sum + r.cuttingReceived, 0)
  const totalCutIssuePrintingIssue = filteredCutIssueRows.reduce((sum, r) => sum + r.printingIssue, 0)
  const totalCutIssueFabricatorIssue = filteredCutIssueRows.reduce((sum, r) => sum + r.fabricatorIssue, 0)
  const totalCutIssueClosing = filteredCutIssueRows.reduce((sum, r) => sum + r.closingStock, 0)

  // ==========================================
  // 4. DATA PROCESSING FOR PRINTING FABRICATOR REPORT
  // ==========================================
  const rawPrintFabRows = []

  const printFabItemKeys = new Set()
  ;(db.printerJobs?.receives || []).forEach(r => {
    if (r.piNo && r.itemNo) {
      printFabItemKeys.add(JSON.stringify({ piNo: r.piNo, itemNo: r.itemNo }))
    }
  })
  ;(db.printerJobs?.issues || []).forEach(i => {
    if (i.piNo && i.itemNo) {
      printFabItemKeys.add(JSON.stringify({ piNo: i.piNo, itemNo: i.itemNo }))
    }
  })
  ;(db.stitcherJobs?.issues || []).forEach(i => {
    if (i.piNo && i.itemNo) {
      printFabItemKeys.add(JSON.stringify({ piNo: i.piNo, itemNo: i.itemNo }))
    }
  })

  printFabItemKeys.forEach(keyStr => {
    const { piNo, itemNo } = JSON.parse(keyStr)

    // 1. Printing Received (printed received from printers)
    const printingReceived = (db.printerJobs?.receives || [])
      .filter(r => r.piNo === piNo && r.itemNo === itemNo)
      .reduce((sum, r) => sum + Number(r.qty || 0), 0)

    // 2. Stitching Issue (panels issued to fabricators)
    const stitchingIssue = (db.stitcherJobs?.issues || [])
      .filter(i => i.piNo === piNo && i.itemNo === itemNo)
      .reduce((sum, i) => sum + Number(i.qty || 0), 0)

    // 3. Due Qty (gap between printing received and stitching issue)
    const dueQty = Math.max(0, printingReceived - stitchingIssue)

    rawPrintFabRows.push({
      piNo,
      itemNo,
      printingReceived,
      stitchingIssue,
      dueQty,
      status: dueQty <= 0 ? 'Completed' : 'Pending'
    })
  })

  const printFabAllPIs = Array.from(new Set(rawPrintFabRows.map(r => r.piNo).filter(Boolean))).sort()

  const filteredPrintFabRows = rawPrintFabRows.filter(row => {
    const matchesSearch = !printFabSearch ||
      row.itemNo.toLowerCase().includes(printFabSearch.toLowerCase()) ||
      row.piNo.toLowerCase().includes(printFabSearch.toLowerCase())
    const matchesPi = printFabPiFilter === 'All' || row.piNo === printFabPiFilter
    return matchesSearch && matchesPi
  })

  const paginatedPrintFabRows = filteredPrintFabRows.slice(printFabPage * printFabRowsPerPage, printFabPage * printFabRowsPerPage + printFabRowsPerPage)

  const totalPrintFabReceived = filteredPrintFabRows.reduce((sum, r) => sum + r.printingReceived, 0)
  const totalPrintFabStitchingIssue = filteredPrintFabRows.reduce((sum, r) => sum + r.stitchingIssue, 0)
  const totalPrintFabDue = filteredPrintFabRows.reduce((sum, r) => sum + r.dueQty, 0)

  const handleExportPrintFabExcel = () => {
    const headerAOA = [
      ["R KUMAR & COMPANY INVENTORY"],
      ["Closing Stock / Printing Issue due to Fabricator"],
      [`Generated On: ${dayjs().format('DD/MM/YYYY hh:mm A')}`],
      [],
      ["Item Name", "PI No.", "Printing Received", "Stitching Issue", "Due Qty", "Status"]
    ]
    const dataRows = filteredPrintFabRows.map(row => [
      row.itemNo, row.piNo,
      row.printingReceived, row.stitchingIssue, row.dueQty, row.status
    ])
    const totalRow = ["TOTAL", "", totalPrintFabReceived, totalPrintFabStitchingIssue, totalPrintFabDue, ""]
    const fullAOA = [...headerAOA, ...dataRows, totalRow]
    const worksheet = XLSX.utils.aoa_to_sheet(fullAOA)
    worksheet['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 5 } },
      { s: { r: 2, c: 0 }, e: { r: 2, c: 5 } },
      { s: { r: 5 + dataRows.length, c: 0 }, e: { r: 5 + dataRows.length, c: 1 } }
    ]
    const maxRow = fullAOA.length
    for (let r = 0; r < maxRow; r++) {
      for (let c = 0; c < 6; c++) {
        const address = XLSX.utils.encode_cell({ r, c })
        if (!worksheet[address]) worksheet[address] = { t: 's', v: '' }
        const cell = worksheet[address]
        cell.s = { font: { name: 'Segoe UI', sz: 10 }, border: { top: { style: 'thin', color: { rgb: 'E5E7EB' } }, bottom: { style: 'thin', color: { rgb: 'E5E7EB' } }, left: { style: 'thin', color: { rgb: 'E5E7EB' } }, right: { style: 'thin', color: { rgb: 'E5E7EB' } } } }
        if (r === 0) { cell.s.font = { name: 'Segoe UI', sz: 16, bold: true, color: { rgb: 'FFFFFF' } }; cell.s.fill = { fgColor: { rgb: '4F46E5' } }; cell.s.alignment = { horizontal: 'center', vertical: 'center' }; cell.s.border = {} }
        else if (r === 1) { cell.s.font = { name: 'Segoe UI', sz: 12, bold: true, color: { rgb: 'FFFFFF' } }; cell.s.fill = { fgColor: { rgb: '4F46E5' } }; cell.s.alignment = { horizontal: 'center', vertical: 'center' }; cell.s.border = {} }
        else if (r === 2) { cell.s.font = { name: 'Segoe UI', sz: 9, italic: true, color: { rgb: '4B5563' } }; cell.s.fill = { fgColor: { rgb: 'F3F4F6' } }; cell.s.alignment = { horizontal: 'center' }; cell.s.border = { bottom: { style: 'medium', color: { rgb: '6C63FF' } } } }
        else if (r === 3) { cell.s.border = {}; cell.s.fill = { fgColor: { rgb: 'FFFFFF' } } }
        else if (r === 4) { cell.s.font = { name: 'Segoe UI', sz: 10, bold: true, color: { rgb: 'FFFFFF' } }; cell.s.fill = { fgColor: { rgb: '374151' } }; cell.s.alignment = { horizontal: (c >= 2 && c <= 4) ? 'right' : 'left', vertical: 'center' } }
        else if (r < maxRow - 1) { cell.s.alignment = { horizontal: (c >= 2 && c <= 4) ? 'right' : 'left', vertical: 'center' }; if (r % 2 === 0) cell.s.fill = { fgColor: { rgb: 'F9FAFB' } } }
        else { cell.s.font = { name: 'Segoe UI', sz: 10, bold: true }; cell.s.fill = { fgColor: { rgb: 'E5E7EB' } }; cell.s.alignment = { horizontal: (c >= 2 && c <= 4) ? 'right' : 'center', vertical: 'center' }; cell.s.border = { top: { style: 'thin', color: { rgb: '111827' } }, bottom: { style: 'double', color: { rgb: '111827' } } } }
      }
    }
    worksheet['!cols'] = [25, 15, 20, 20, 15, 15].map(w => ({ wch: w }))
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Printer Stock & Issue")
    XLSX.writeFile(workbook, `Closing_Stock_Printing_Issue_Fabricator_Stitcher_${dayjs().format('YYYYMMDD')}.xlsx`)
  }

  const handlePrintPrintFabPDF = () => {
    const printWindow = window.open('', '_blank')
    const tableRows = filteredPrintFabRows.map(row => `
      <tr>
        <td>${row.itemNo}</td>
        <td>${row.piNo}</td>
        <td class="no-wrap text-right">${Number(row.printingReceived || 0).toLocaleString()}</td>
        <td class="no-wrap text-right">${Number(row.stitchingIssue || 0).toLocaleString()}</td>
        <td class="no-wrap text-right" style="font-weight:bold;color:${row.dueQty > 0 ? '#EF4444' : '#00C07F'}">${Number(row.dueQty || 0).toLocaleString()}</td>
        <td class="no-wrap text-center" style="font-weight:700;color:${row.status === 'Completed' ? '#00A06B' : '#DC2626'}">${row.status}</td>
      </tr>
    `).join('')
    printWindow.document.write(`
      <html><head><title>Closing Stock / Printing Issue due to Fabricator</title>
      <style>body{font-family:'Segoe UI',Arial,sans-serif;margin:15px;color:#1F2937}.header{text-align:center;margin-bottom:20px;border-bottom:3px double #6C63FF;padding-bottom:12px}.header h1{margin:0;font-size:22px;color:#111827;letter-spacing:1px}.header p{margin:5px 0 0;color:#6B7280;font-size:12px;font-weight:600;text-transform:uppercase}.meta-info{display:flex;justify-content:space-between;margin-bottom:15px;font-size:11px;color:#4B5563}table{width:100%;border-collapse:collapse;margin-top:10px;font-size:10px}th,td{border:1px solid #D1D5DB;padding:6px 8px;text-align:left;vertical-align:middle}th{background-color:#F3F4F6;font-weight:700;text-transform:uppercase;font-size:8px;color:#374151}tr:nth-child(even){background-color:#F9FAFB}.total-row{font-weight:bold;background-color:#E5E7EB!important}.no-wrap{white-space:nowrap}.text-center{text-align:center}.text-right{text-align:right}@media print{@page{size:landscape;margin:10mm}}</style>
      </head><body>
      <div class="header"><h1>R KUMAR & COMPANY INVENTORY</h1><p>Closing Stock / Printing Issue due to Fabricator</p></div>
      <div class="meta-info"><div><strong>Generated On:</strong> ${dayjs().format('DD/MM/YYYY hh:mm A')}</div></div>
      <table><thead><tr>
        <th>Item Name</th><th>PI No.</th>
        <th class="text-right">Printing Received</th>
        <th class="text-right">Stitching Issue</th>
        <th class="text-right">Due Qty</th>
        <th class="text-center">Status</th>
      </tr></thead><tbody>
        ${tableRows}
        <tr class="total-row">
          <td colspan="2" class="text-right">TOTAL:</td>
          <td class="text-right">${totalPrintFabReceived.toLocaleString()}</td>
          <td class="text-right">${totalPrintFabStitchingIssue.toLocaleString()}</td>
          <td class="text-right" style="color:${totalPrintFabDue > 0 ? '#EF4444' : '#00C07F'}">${totalPrintFabDue.toLocaleString()}</td>
          <td></td>
        </tr>
      </tbody></table>
      <script>window.onload=function(){window.print();window.close()}<\/script>
      </body></html>`)
    printWindow.document.close()
  }
  // 5. DATA PROCESSING FOR FINISHED GOODS CLOSING STOCK (PI WISE)
  // ==========================================
  const rawFgRows = []

  if (db.pis) {
    db.pis.forEach(pi => {
      const piProducts = pi.products || []
      piProducts.forEach(prod => {
        const itemNo = prod.itemNo
        const piQty = Number(prod.qty || 0)
        const buyerName = prod.buyerName || '—'

        // Total cut
        const cutQty = (db.cuttings || [])
          .filter(c => c.piNo === pi.piNo)
          .flatMap(c => c.items || [])
          .filter(it => it.itemNo === itemNo)
          .reduce((sum, it) => sum + Number(it.qty || 0), 0)

        // Total finished & packed
        const finishedQty = (db.finishing || [])
          .filter(f => f.piNo === pi.piNo && f.itemNo === itemNo)
          .reduce((sum, f) => sum + Number(f.qty || 0), 0)

        // Total rejection during finishing
        const finishRejection = (db.finishing || [])
          .filter(f => f.piNo === pi.piNo && f.itemNo === itemNo)
          .reduce((sum, f) => sum + Number(f.rejection || 0), 0)

        // Total shipped
        const shippedQty = (db.shipments || [])
          .filter(s => s.piNo === pi.piNo && s.itemNo === itemNo)
          .reduce((sum, s) => sum + Number(s.qty || 0), 0)

        // Printing Issued
        const printingIssued = (db.printerJobs?.issues || [])
          .filter(i => i.piNo === pi.piNo && i.itemNo === itemNo)
          .reduce((sum, i) => sum + Number(i.qty || 0), 0)

        // Printing Received
        const printingReceived = (db.printerJobs?.receives || [])
          .filter(r => r.piNo === pi.piNo && r.itemNo === itemNo)
          .reduce((sum, r) => sum + Number(r.qty || 0), 0)

        // Stitching Issued
        const stitchingIssued = (db.stitcherJobs?.issues || [])
          .filter(i => i.piNo === pi.piNo && i.itemNo === itemNo)
          .reduce((sum, i) => sum + Number(i.qty || 0), 0)

        // Stitching Received
        const stitchingReceived = (db.stitcherJobs?.receives || [])
          .filter(r => r.piNo === pi.piNo && r.itemNo === itemNo)
          .reduce((sum, r) => sum + Number(r.qty || 0), 0)

        // Closing stock of finished goods (not yet shipped)
        const closingStock = Math.max(0, finishedQty - shippedQty)

        // Pending to finish (cut but not yet finished)
        const pendingFinish = Math.max(0, cutQty - finishedQty - finishRejection)

        const status = closingStock > 0 ? 'In Stock' : finishedQty === 0 && cutQty > 0 ? 'Not Finished' : 'Fully Shipped'

        rawFgRows.push({
          piNo: pi.piNo,
          buyerName,
          itemNo,
          piQty,
          cutQty,
          printingIssued,
          printingReceived,
          stitchingIssued,
          stitchingReceived,
          finishedQty,
          finishRejection,
          shippedQty,
          pendingFinish,
          closingStock,
          status
        })
      })
    })
  }

  const fgAllPIs = Array.from(new Set(rawFgRows.map(r => r.piNo))).sort()

  const filteredFgRows = rawFgRows.filter(row => {
    const matchesSearch = !fgSearch ||
      row.piNo.toLowerCase().includes(fgSearch.toLowerCase()) ||
      row.buyerName.toLowerCase().includes(fgSearch.toLowerCase()) ||
      row.itemNo.toLowerCase().includes(fgSearch.toLowerCase())
    const matchesPi = fgPiFilter === 'All' || row.piNo === fgPiFilter
    return matchesSearch && matchesPi
  })

  const paginatedFgRows = filteredFgRows.slice(fgPage * fgRowsPerPage, fgPage * fgRowsPerPage + fgRowsPerPage)

  const totalFgPiQty = filteredFgRows.reduce((sum, r) => sum + r.piQty, 0)
  const totalFgCutQty = filteredFgRows.reduce((sum, r) => sum + r.cutQty, 0)
  const totalFgPrintingIssued = filteredFgRows.reduce((sum, r) => sum + r.printingIssued, 0)
  const totalFgPrintingReceived = filteredFgRows.reduce((sum, r) => sum + r.printingReceived, 0)
  const totalFgStitchingIssued = filteredFgRows.reduce((sum, r) => sum + r.stitchingIssued, 0)
  const totalFgStitchingReceived = filteredFgRows.reduce((sum, r) => sum + r.stitchingReceived, 0)
  const totalFgFinished = filteredFgRows.reduce((sum, r) => sum + r.finishedQty, 0)
  const totalFgRejection = filteredFgRows.reduce((sum, r) => sum + r.finishRejection, 0)
  const totalFgShipped = filteredFgRows.reduce((sum, r) => sum + r.shippedQty, 0)
  const totalFgPendingFinish = filteredFgRows.reduce((sum, r) => sum + r.pendingFinish, 0)
  const totalFgClosing = filteredFgRows.reduce((sum, r) => sum + r.closingStock, 0)

  // ==========================================
  // 6. DATA PROCESSING FOR BUYER WISE ORDER STATUS REPORT
  // ==========================================
  const rawBuyerRows = []
  if (db.pis) {
    const buyerGroups = {}
    db.pis.forEach(pi => {
      const piProducts = pi.products || []
      piProducts.forEach(prod => {
        const buyer = prod.buyerName || '—'
        const itemNo = prod.itemNo
        const piQty = Number(prod.qty || 0)

        // Calculate shipped for this specific item in this PI
        const shippedQty = (db.shipments || [])
          .filter(s => s.piNo === pi.piNo && s.itemNo === itemNo)
          .reduce((sum, s) => sum + Number(s.qty || 0), 0)

        if (!buyerGroups[buyer]) {
          buyerGroups[buyer] = {
            buyerName: buyer,
            totalOrderQty: 0,
            totalShippedQty: 0,
            items: new Set(),
            pis: new Set(),
            details: []
          }
        }
        buyerGroups[buyer].totalOrderQty += piQty
        buyerGroups[buyer].totalShippedQty += shippedQty
        if (itemNo) buyerGroups[buyer].items.add(itemNo)
        if (pi.piNo) buyerGroups[buyer].pis.add(pi.piNo)

        const due = Math.max(0, piQty - shippedQty)
        let itemStatus = 'Pending'
        if (shippedQty >= piQty) itemStatus = 'Completed'
        else if (shippedQty > 0) itemStatus = 'Partial'

        buyerGroups[buyer].details.push({
          piNo: pi.piNo,
          itemNo: itemNo,
          qty: piQty,
          shippedQty: shippedQty,
          dueQty: due,
          status: itemStatus
        })
      })
    })

    Object.values(buyerGroups).forEach(group => {
      const shipmentDueQty = Math.max(0, group.totalOrderQty - group.totalShippedQty)
      let status = 'Pending'
      if (group.totalShippedQty >= group.totalOrderQty) {
        status = 'Completed'
      } else if (group.totalShippedQty > 0) {
        status = 'Partial'
      }
      
      rawBuyerRows.push({
        buyerName: group.buyerName,
        itemTypesCount: group.items.size,
        piCount: group.pis.size,
        totalOrderQty: group.totalOrderQty,
        totalShippedQty: group.totalShippedQty,
        shipmentDueQty: shipmentDueQty,
        status: status,
        details: group.details
      })
    })
  }

  const filteredBuyerRows = rawBuyerRows.filter(row => {
    return !buyerSearch || row.buyerName.toLowerCase().includes(buyerSearch.toLowerCase())
  })

  const paginatedBuyerRows = filteredBuyerRows.slice(buyerPage * buyerRowsPerPage, buyerPage * buyerRowsPerPage + buyerRowsPerPage)

  const totalBuyerOrderQty = filteredBuyerRows.reduce((sum, r) => sum + r.totalOrderQty, 0)
  const totalBuyerShippedQty = filteredBuyerRows.reduce((sum, r) => sum + r.totalShippedQty, 0)
  const totalBuyerDueQty = filteredBuyerRows.reduce((sum, r) => sum + r.shipmentDueQty, 0)

  // ==========================================
  // 7. DATA PROCESSING FOR DATE-WISE SHIPMENT SCHEDULE REPORT
  // ==========================================
  const rawScheduleRows = []
  if (db.pis) {
    db.pis.forEach(pi => {
      const piProducts = pi.products || []
      piProducts.forEach(prod => {
        const deliveryDateStr = prod.deliveryDate || ''
        const piQty = Number(prod.qty || 0)
        const itemNo = prod.itemNo
        const buyerName = prod.buyerName || '—'

        // Calculate shipped for this specific item in this PI
        const shippedQty = (db.shipments || [])
          .filter(s => s.piNo === pi.piNo && s.itemNo === itemNo)
          .reduce((sum, s) => sum + Number(s.qty || 0), 0)

        const dueQty = Math.max(0, piQty - shippedQty)

        // Determine shipment schedule date (deliveryDate)
        const dateObj = deliveryDateStr ? dayjs(deliveryDateStr, 'YYYY-MM-DD') : null
        
        let status = 'Pending'
        if (shippedQty >= piQty) {
          status = 'Shipped'
        } else if (dateObj && dateObj.isBefore(dayjs(), 'day')) {
          status = 'Delayed'
        } else if (shippedQty > 0) {
          status = 'Partially Shipped'
        }

        rawScheduleRows.push({
          deliveryDate: deliveryDateStr,
          dateObj,
          piNo: pi.piNo,
          buyerName,
          itemNo,
          orderQty: piQty,
          shippedQty,
          dueQty,
          status
        })
      })
    })

    // Sort by Delivery Date ascending (empty/no date at the end)
    rawScheduleRows.sort((a, b) => {
      if (!a.deliveryDate) return 1
      if (!b.deliveryDate) return -1
      return dayjs(a.deliveryDate).unix() - dayjs(b.deliveryDate).unix()
    })
  }

  const filteredScheduleRows = rawScheduleRows.filter(row => {
    const matchesSearch = !scheduleSearch ||
      row.piNo.toLowerCase().includes(scheduleSearch.toLowerCase()) ||
      row.buyerName.toLowerCase().includes(scheduleSearch.toLowerCase()) ||
      row.itemNo.toLowerCase().includes(scheduleSearch.toLowerCase())

    let matchesDate = true
    if (scheduleStartDate && row.dateObj) {
      matchesDate = matchesDate && (row.dateObj.isSame(scheduleStartDate, 'day') || row.dateObj.isAfter(scheduleStartDate, 'day'))
    }
    if (scheduleEndDate && row.dateObj) {
      matchesDate = matchesDate && (row.dateObj.isSame(scheduleEndDate, 'day') || row.dateObj.isBefore(scheduleEndDate, 'day'))
    }
    return matchesSearch && matchesDate
  })

  const paginatedScheduleRows = filteredScheduleRows.slice(schedulePage * scheduleRowsPerPage, schedulePage * scheduleRowsPerPage + scheduleRowsPerPage)

  const totalScheduleOrderQty = filteredScheduleRows.reduce((sum, r) => sum + r.orderQty, 0)
  const totalScheduleShippedQty = filteredScheduleRows.reduce((sum, r) => sum + r.shippedQty, 0)
  const totalScheduleDueQty = filteredScheduleRows.reduce((sum, r) => sum + r.dueQty, 0)

  const handleExportScheduleExcel = () => {
    const headerAOA = [
      ["R KUMAR & COMPANY INVENTORY"],
      ["Date-wise Shipment Schedule Report"],
      [`Generated On: ${dayjs().format('DD/MM/YYYY hh:mm A')}`],
      [],
      ["Delivery Date", "PI No.", "Buyer Name", "Item Name", "Order Qty", "Qty Shipped", "Shipment Due Qty", "Status"]
    ]
    const dataRows = filteredScheduleRows.map(row => [
      row.deliveryDate ? dayjs(row.deliveryDate).format('DD/MM/YYYY') : '—',
      row.piNo, row.buyerName, row.itemNo,
      row.orderQty, row.shippedQty, row.dueQty, row.status
    ])
    const totalRow = ["TOTAL", "", "", "", totalScheduleOrderQty, totalScheduleShippedQty, totalScheduleDueQty, ""]
    const fullAOA = [...headerAOA, ...dataRows, totalRow]
    const worksheet = XLSX.utils.aoa_to_sheet(fullAOA)

    worksheet['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 7 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 7 } },
      { s: { r: 2, c: 0 }, e: { r: 2, c: 7 } },
      { s: { r: 5 + dataRows.length, c: 0 }, e: { r: 5 + dataRows.length, c: 3 } }
    ]

    const maxRow = fullAOA.length
    for (let r = 0; r < maxRow; r++) {
      for (let c = 0; c < 8; c++) {
        const address = XLSX.utils.encode_cell({ r, c })
        if (!worksheet[address]) worksheet[address] = { t: 's', v: '' }
        const cell = worksheet[address]
        cell.s = { font: { name: 'Segoe UI', sz: 10 }, border: { top: { style: 'thin', color: { rgb: 'E5E7EB' } }, bottom: { style: 'thin', color: { rgb: 'E5E7EB' } }, left: { style: 'thin', color: { rgb: 'E5E7EB' } }, right: { style: 'thin', color: { rgb: 'E5E7EB' } } } }
        if (r === 0) { cell.s.font = { name: 'Segoe UI', sz: 16, bold: true, color: { rgb: 'FFFFFF' } }; cell.s.fill = { fgColor: { rgb: '7C3AED' } }; cell.s.alignment = { horizontal: 'center', vertical: 'center' }; cell.s.border = {} }
        else if (r === 1) { cell.s.font = { name: 'Segoe UI', sz: 11, bold: true, color: { rgb: 'FFFFFF' } }; cell.s.fill = { fgColor: { rgb: '7C3AED' } }; cell.s.alignment = { horizontal: 'center', vertical: 'center' }; cell.s.border = {} }
        else if (r === 2) { cell.s.font = { name: 'Segoe UI', sz: 9, italic: true, color: { rgb: '4B5563' } }; cell.s.fill = { fgColor: { rgb: 'F3F4F6' } }; cell.s.alignment = { horizontal: 'center' }; cell.s.border = { bottom: { style: 'medium', color: { rgb: '7C3AED' } } } }
        else if (r === 3) { cell.s.border = {}; cell.s.fill = { fgColor: { rgb: 'FFFFFF' } } }
        else if (r === 4) { cell.s.font = { name: 'Segoe UI', sz: 10, bold: true, color: { rgb: 'FFFFFF' } }; cell.s.fill = { fgColor: { rgb: '374151' } }; cell.s.alignment = { horizontal: (c >= 4 && c <= 6) ? 'right' : 'left', vertical: 'center' } }
        else if (r < maxRow - 1) {
          cell.s.alignment = { horizontal: (c >= 4 && c <= 6) ? 'right' : 'left', vertical: 'center' }
          if (r % 2 === 0) cell.s.fill = { fgColor: { rgb: 'F9FAFB' } }
        } else {
          cell.s.font = { name: 'Segoe UI', sz: 10, bold: true }; cell.s.fill = { fgColor: { rgb: 'E5E7EB' } }
          cell.s.alignment = { horizontal: (c >= 4 && c <= 6) ? 'right' : 'center', vertical: 'center' }
          cell.s.border = { top: { style: 'thin', color: { rgb: '111827' } }, bottom: { style: 'double', color: { rgb: '111827' } } }
        }
      }
    }
    worksheet['!cols'] = [15, 15, 25, 20, 15, 15, 18, 15].map(w => ({ wch: w }))
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Shipment Schedule")
    XLSX.writeFile(workbook, `Date_Wise_Shipment_Schedule_${dayjs().format('YYYYMMDD')}.xlsx`)
  }

  const handlePrintSchedulePDF = () => {
    const printWindow = window.open('', '_blank')
    const tableRows = filteredScheduleRows.map(row => `
      <tr>
        <td style="font-weight:700">${row.deliveryDate ? dayjs(row.deliveryDate).format('DD/MM/YYYY') : '—'}</td>
        <td style="font-weight:700;color:#7C3AED">${row.piNo}</td>
        <td>${row.buyerName}</td>
        <td>${row.itemNo}</td>
        <td class="text-right">${row.orderQty.toLocaleString()}</td>
        <td class="text-right" style="color:#00A06B;font-weight:bold">${row.shippedQty.toLocaleString()}</td>
        <td class="text-right" style="color:${row.dueQty > 0 ? '#EF4444' : '#00C07F'};font-weight:bold">${row.dueQty.toLocaleString()}</td>
        <td class="text-center" style="font-weight:700;color:${row.status === 'Shipped' ? '#00C07F' : row.status === 'Delayed' ? '#EF4444' : '#F59E0B'}">${row.status}</td>
      </tr>
    `).join('')

    printWindow.document.write(`
      <html><head><title>Date-wise Shipment Schedule Report</title>
      <style>body{font-family:'Segoe UI',Arial,sans-serif;margin:15px;color:#1F2937}.header{text-align:center;margin-bottom:20px;border-bottom:3px double #7C3AED;padding-bottom:12px}.header h1{margin:0;font-size:22px;color:#111827;letter-spacing:1px}.header p{margin:5px 0 0;color:#6B7280;font-size:12px;font-weight:600;text-transform:uppercase}.meta-info{display:flex;justify-content:space-between;margin-bottom:15px;font-size:11px;color:#4B5563}table{width:100%;border-collapse:collapse;margin-top:10px;font-size:10px}th,td{border:1px solid #D1D5DB;padding:6px 8px;text-align:left;vertical-align:middle}th{background-color:#F3F4F6;font-weight:700;text-transform:uppercase;font-size:8px;color:#374151}tr:nth-child(even){background-color:#F9FAFB}.total-row{font-weight:bold;background-color:#E5E7EB!important}.no-wrap{white-space:nowrap}.text-center{text-align:center}.text-right{text-align:right}@media print{@page{size:landscape;margin:10mm}}</style>
      </head><body>
      <div class="header"><h1>R KUMAR & COMPANY INVENTORY</h1><p>Date-wise Shipment Schedule Report</p></div>
      <div class="meta-info"><div><strong>Generated On:</strong> ${dayjs().format('DD/MM/YYYY hh:mm A')}</div></div>
      <table><thead><tr>
        <th>Delivery Date</th><th>PI No.</th><th>Buyer Name</th><th>Item Name</th>
        <th class="text-right">Order Qty</th>
        <th class="text-right">Qty Shipped</th>
        <th class="text-right">Shipment Due Qty</th>
        <th class="text-center">Status</th>
      </tr></thead><tbody>
        ${tableRows}
        <tr class="total-row">
          <td colspan="4" class="text-right">TOTAL:</td>
          <td class="text-right">${totalScheduleOrderQty.toLocaleString()}</td>
          <td class="text-right">${totalScheduleShippedQty.toLocaleString()}</td>
          <td class="text-right" style="color:${totalScheduleDueQty > 0 ? '#EF4444' : '#00C07F'}">${totalScheduleDueQty.toLocaleString()}</td>
          <td></td>
        </tr>
      </tbody></table>
      <script>window.onload=function(){window.print();window.close()}<\/script>
      </body></html>`)
    printWindow.document.close()
  }

  // ==========================================
  // 8. DATA PROCESSING FOR PI WISE QC REPORT
  // ==========================================
  const rawQcRows = []
  if (db.pis) {
    db.pis.forEach(pi => {
      const piProducts = pi.products || []
      piProducts.forEach(prod => {
        const itemNo = prod.itemNo
        const buyerName = prod.buyerName || '—'

        // Finished Qty from finishing
        const finishedQty = (db.finishing || [])
          .filter(f => f.piNo === pi.piNo && f.itemNo === itemNo)
          .reduce((sum, f) => sum + Number(f.qty || 0), 0)

        // Finishing Rejections
        const finishRej = (db.finishing || [])
          .filter(f => f.piNo === pi.piNo && f.itemNo === itemNo)
          .reduce((sum, f) => sum + Number(f.rejection || 0), 0)

        // Printer Rejections
        const printRej = (db.printerJobs?.receives || [])
          .filter(r => r.piNo === pi.piNo && r.itemNo === itemNo)
          .reduce((sum, r) => sum + Number(r.rejectionFabricator || 0) + Number(r.rejectionFactory || 0), 0)

        // Stitcher Rejections
        const stitchRej = (db.stitcherJobs?.receives || [])
          .filter(r => r.piNo === pi.piNo && r.itemNo === itemNo)
          .reduce((sum, r) => sum + Number(r.rejectionFabricator || 0) + Number(r.rejectionFactory || 0), 0)

        const totalRej = finishRej + printRej + stitchRej
        const totalChecked = finishedQty + totalRej
        const rejPercentage = totalChecked > 0 ? (totalRej / totalChecked) * 100 : 0

        // QC Checkers list
        const checkersSet = new Set()
        ;(db.finishing || [])
          .filter(f => f.piNo === pi.piNo && f.itemNo === itemNo && f.qcCheckedBy)
          .forEach(f => checkersSet.add(f.qcCheckedBy))
        
        const qcCheckersStr = Array.from(checkersSet).join(', ') || '—'

        rawQcRows.push({
          piNo: pi.piNo,
          buyerName,
          itemNo,
          finishedQty,
          printRej,
          stitchRej,
          finishRej,
          totalRej,
          rejPercentage,
          qcCheckersStr
        })
      })
    })
  }

  const filteredQcRows = rawQcRows.filter(row => {
    return !qcSearch ||
      row.piNo.toLowerCase().includes(qcSearch.toLowerCase()) ||
      row.buyerName.toLowerCase().includes(qcSearch.toLowerCase()) ||
      row.itemNo.toLowerCase().includes(qcSearch.toLowerCase())
  })

  const paginatedQcRows = filteredQcRows.slice(qcPage * qcRowsPerPage, qcPage * qcRowsPerPage + qcRowsPerPage)

  const totalQcFinished = filteredQcRows.reduce((sum, r) => sum + r.finishedQty, 0)
  const totalQcPrintRej = filteredQcRows.reduce((sum, r) => sum + r.printRej, 0)
  const totalQcStitchRej = filteredQcRows.reduce((sum, r) => sum + r.stitchRej, 0)
  const totalQcFinishRej = filteredQcRows.reduce((sum, r) => sum + r.finishRej, 0)
  const totalQcRej = filteredQcRows.reduce((sum, r) => sum + r.totalRej, 0)
  const overallRejPercentage = (totalQcFinished + totalQcRej) > 0 ? (totalQcRej / (totalQcFinished + totalQcRej)) * 100 : 0

  const handleExportQcExcel = () => {
    const headerAOA = [
      ["R KUMAR & COMPANY INVENTORY"],
      ["PI Wise QC & Rejections Report"],
      [`Generated On: ${dayjs().format('DD/MM/YYYY hh:mm A')}`],
      [],
      ["PI No.", "Buyer Name", "Item Name", "Finished Qty", "Print Rej", "Stitch Rej", "Finishing Rej", "Total Rejections", "Rej %", "QC Checked By"]
    ]
    const dataRows = filteredQcRows.map(row => [
      row.piNo, row.buyerName, row.itemNo,
      row.finishedQty, row.printRej, row.stitchRej, row.finishRej, row.totalRej,
      Number(row.rejPercentage.toFixed(2)), row.qcCheckersStr
    ])
    const totalRow = ["TOTAL", "", "", totalQcFinished, totalQcPrintRej, totalQcStitchRej, totalQcFinishRej, totalQcRej, Number(overallRejPercentage.toFixed(2)), ""]
    const fullAOA = [...headerAOA, ...dataRows, totalRow]
    const worksheet = XLSX.utils.aoa_to_sheet(fullAOA)

    worksheet['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 9 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 9 } },
      { s: { r: 2, c: 0 }, e: { r: 2, c: 9 } },
      { s: { r: 5 + dataRows.length, c: 0 }, e: { r: 5 + dataRows.length, c: 2 } }
    ]

    const maxRow = fullAOA.length
    for (let r = 0; r < maxRow; r++) {
      for (let c = 0; c < 10; c++) {
        const address = XLSX.utils.encode_cell({ r, c })
        if (!worksheet[address]) worksheet[address] = { t: 's', v: '' }
        const cell = worksheet[address]
        cell.s = { font: { name: 'Segoe UI', sz: 10 }, border: { top: { style: 'thin', color: { rgb: 'E5E7EB' } }, bottom: { style: 'thin', color: { rgb: 'E5E7EB' } }, left: { style: 'thin', color: { rgb: 'E5E7EB' } }, right: { style: 'thin', color: { rgb: 'E5E7EB' } } } }
        if (r === 0) { cell.s.font = { name: 'Segoe UI', sz: 16, bold: true, color: { rgb: 'FFFFFF' } }; cell.s.fill = { fgColor: { rgb: 'DC2626' } }; cell.s.alignment = { horizontal: 'center', vertical: 'center' }; cell.s.border = {} }
        else if (r === 1) { cell.s.font = { name: 'Segoe UI', sz: 11, bold: true, color: { rgb: 'FFFFFF' } }; cell.s.fill = { fgColor: { rgb: 'DC2626' } }; cell.s.alignment = { horizontal: 'center', vertical: 'center' }; cell.s.border = {} }
        else if (r === 2) { cell.s.font = { name: 'Segoe UI', sz: 9, italic: true, color: { rgb: '4B5563' } }; cell.s.fill = { fgColor: { rgb: 'F3F4F6' } }; cell.s.alignment = { horizontal: 'center' }; cell.s.border = { bottom: { style: 'medium', color: { rgb: 'DC2626' } } } }
        else if (r === 3) { cell.s.border = {}; cell.s.fill = { fgColor: { rgb: 'FFFFFF' } } }
        else if (r === 4) { cell.s.font = { name: 'Segoe UI', sz: 10, bold: true, color: { rgb: 'FFFFFF' } }; cell.s.fill = { fgColor: { rgb: '374151' } }; cell.s.alignment = { horizontal: (c >= 3 && c <= 8) ? 'right' : 'left', vertical: 'center' } }
        else if (r < maxRow - 1) {
          cell.s.alignment = { horizontal: (c >= 3 && c <= 8) ? 'right' : 'left', vertical: 'center' }
          if (r % 2 === 0) cell.s.fill = { fgColor: { rgb: 'F9FAFB' } }
        } else {
          cell.s.font = { name: 'Segoe UI', sz: 10, bold: true }; cell.s.fill = { fgColor: { rgb: 'E5E7EB' } }
          cell.s.alignment = { horizontal: (c >= 3 && c <= 8) ? 'right' : 'center', vertical: 'center' }
          cell.s.border = { top: { style: 'thin', color: { rgb: '111827' } }, bottom: { style: 'double', color: { rgb: '111827' } } }
        }
      }
    }
    worksheet['!cols'] = [15, 20, 15, 15, 15, 15, 15, 18, 12, 20].map(w => ({ wch: w }))
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "PI QC Report")
    XLSX.writeFile(workbook, `PI_Wise_QC_Report_${dayjs().format('YYYYMMDD')}.xlsx`)
  }

  const handlePrintQcPDF = () => {
    const printWindow = window.open('', '_blank')
    const tableRows = filteredQcRows.map(row => `
      <tr>
        <td style="font-weight:700;color:#DC2626">${row.piNo}</td>
        <td>${row.buyerName}</td>
        <td>${row.itemNo}</td>
        <td class="text-right">${row.finishedQty.toLocaleString()}</td>
        <td class="text-right">${row.printRej.toLocaleString()}</td>
        <td class="text-right">${row.stitchRej.toLocaleString()}</td>
        <td class="text-right">${row.finishRej.toLocaleString()}</td>
        <td class="text-right" style="font-weight:700;color:${row.totalRej > 0 ? '#EF4444' : '#10B981'}">${row.totalRej.toLocaleString()}</td>
        <td class="text-right" style="font-weight:700;color:${row.rejPercentage > 5 ? '#EF4444' : '#475569'}">${row.rejPercentage.toFixed(2)}%</td>
        <td>${row.qcCheckersStr}</td>
      </tr>
    `).join('')

    printWindow.document.write(`
      <html><head><title>PI Wise QC Report</title>
      <style>body{font-family:'Segoe UI',Arial,sans-serif;margin:15px;color:#1F2937}.header{text-align:center;margin-bottom:20px;border-bottom:3px double #DC2626;padding-bottom:12px}.header h1{margin:0;font-size:22px;color:#111827;letter-spacing:1px}.header p{margin:5px 0 0;color:#6B7280;font-size:12px;font-weight:600;text-transform:uppercase}.meta-info{display:flex;justify-content:space-between;margin-bottom:15px;font-size:11px;color:#4B5563}table{width:100%;border-collapse:collapse;margin-top:10px;font-size:10px}th,td{border:1px solid #D1D5DB;padding:6px 8px;text-align:left;vertical-align:middle}th{background-color:#F3F4F6;font-weight:700;text-transform:uppercase;font-size:8px;color:#374151}tr:nth-child(even){background-color:#F9FAFB}.total-row{font-weight:bold;background-color:#E5E7EB!important}.no-wrap{white-space:nowrap}.text-center{text-align:center}.text-right{text-align:right}@media print{@page{size:landscape;margin:10mm}}</style>
      </head><body>
      <div class="header"><h1>R KUMAR & COMPANY INVENTORY</h1><p>PI Wise QC & Quality Control Report</p></div>
      <div class="meta-info"><div><strong>Generated On:</strong> ${dayjs().format('DD/MM/YYYY hh:mm A')}</div></div>
      <table><thead><tr>
        <th>PI No.</th><th>Buyer Name</th><th>Item Name</th>
        <th class="text-right">Finished Qty</th>
        <th class="text-right">Print Rejections</th>
        <th class="text-right">Stitch Rejections</th>
        <th class="text-right">Finish Rejections</th>
        <th class="text-right">Total Rejections</th>
        <th class="text-right">Rej %</th>
        <th>QC Checked By</th>
      </tr></thead><tbody>
        ${tableRows}
        <tr class="total-row">
          <td colspan="3" class="text-right">TOTAL:</td>
          <td class="text-right">${totalQcFinished.toLocaleString()}</td>
          <td class="text-right">${totalQcPrintRej.toLocaleString()}</td>
          <td class="text-right">${totalQcStitchRej.toLocaleString()}</td>
          <td class="text-right">${totalQcFinishRej.toLocaleString()}</td>
          <td class="text-right" style="color:${totalQcRej > 0 ? '#EF4444' : '#10B981'}">${totalQcRej.toLocaleString()}</td>
          <td class="text-right">${overallRejPercentage.toFixed(2)}%</td>
          <td></td>
        </tr>
      </tbody></table>
      <script>window.onload=function(){window.print();window.close()}<\/script>
      </body></html>`)
    printWindow.document.close()
  }

  const handleExportBuyerExcel = () => {
    const headerAOA = [
      ["R KUMAR & COMPANY INVENTORY"],
      ["Buyer wise status of order received, qty shipped and shipment due report"],
      [`Generated On: ${dayjs().format('DD/MM/YYYY hh:mm A')}`],
      [],
      ["Buyer Name / PI No.", "Item Name", "Order Qty", "Qty Shipped", "Shipment Due Qty", "Status"]
    ]

    const dataRows = []
    const buyerRowIndices = []
    const detailRowIndices = []
    let currentRowIdx = 5 // starts after header rows (index 0 to 4)

    filteredBuyerRows.forEach(row => {
      // Add Buyer overall summary row
      buyerRowIndices.push(currentRowIdx)
      dataRows.push([
        row.buyerName,
        `(${row.itemTypesCount} Items, ${row.piCount} PIs)`,
        row.totalOrderQty,
        row.totalShippedQty,
        row.shipmentDueQty,
        row.status
      ])
      currentRowIdx++

      // Add each item detail row
      row.details.forEach(detail => {
        detailRowIndices.push(currentRowIdx)
        dataRows.push([
          `  ↳ PI: ${detail.piNo}`,
          detail.itemNo,
          detail.qty,
          detail.shippedQty,
          detail.dueQty,
          detail.status
        ])
        currentRowIdx++
      })
    })

    const totalRow = ["TOTAL", "", totalBuyerOrderQty, totalBuyerShippedQty, totalBuyerDueQty, ""]
    const totalRowIdx = currentRowIdx
    const fullAOA = [...headerAOA, ...dataRows, totalRow]
    const worksheet = XLSX.utils.aoa_to_sheet(fullAOA)

    worksheet['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 5 } },
      { s: { r: 2, c: 0 }, e: { r: 2, c: 5 } }
    ]

    const maxRow = fullAOA.length
    for (let r = 0; r < maxRow; r++) {
      for (let c = 0; c < 6; c++) {
        const address = XLSX.utils.encode_cell({ r, c })
        if (!worksheet[address]) worksheet[address] = { t: 's', v: '' }
        const cell = worksheet[address]

        cell.s = {
          font: { name: 'Segoe UI', sz: 10 },
          border: {
            top: { style: 'thin', color: { rgb: 'E5E7EB' } },
            bottom: { style: 'thin', color: { rgb: 'E5E7EB' } },
            left: { style: 'thin', color: { rgb: 'E5E7EB' } },
            right: { style: 'thin', color: { rgb: 'E5E7EB' } }
          }
        }

        if (r === 0) {
          cell.s.font = { name: 'Segoe UI', sz: 16, bold: true, color: { rgb: 'FFFFFF' } }
          cell.s.fill = { fgColor: { rgb: '0284C7' } }
          cell.s.alignment = { horizontal: 'center', vertical: 'center' }
          cell.s.border = {}
        } else if (r === 1) {
          cell.s.font = { name: 'Segoe UI', sz: 11, bold: true, color: { rgb: 'FFFFFF' } }
          cell.s.fill = { fgColor: { rgb: '0284C7' } }
          cell.s.alignment = { horizontal: 'center', vertical: 'center' }
          cell.s.border = {}
        } else if (r === 2) {
          cell.s.font = { name: 'Segoe UI', sz: 9, italic: true, color: { rgb: '4B5563' } }
          cell.s.fill = { fgColor: { rgb: 'F3F4F6' } }
          cell.s.alignment = { horizontal: 'center', vertical: 'center' }
          cell.s.border = { bottom: { style: 'medium', color: { rgb: '0284C7' } } }
        } else if (r === 3) {
          cell.s.border = {}
          cell.s.fill = { fgColor: { rgb: 'FFFFFF' } }
        } else if (r === 4) {
          cell.s.font = { name: 'Segoe UI', sz: 10, bold: true, color: { rgb: 'FFFFFF' } }
          cell.s.fill = { fgColor: { rgb: '374151' } }
          cell.s.alignment = { horizontal: (c >= 2 && c <= 4) ? 'right' : 'left', vertical: 'center' }
        } else if (buyerRowIndices.includes(r)) {
          cell.s.font = { name: 'Segoe UI', sz: 10, bold: true, color: { rgb: '0369A1' } }
          cell.s.fill = { fgColor: { rgb: 'E0F2FE' } }
          cell.s.alignment = { horizontal: (c >= 2 && c <= 4) ? 'right' : 'left', vertical: 'center' }
        } else if (detailRowIndices.includes(r)) {
          cell.s.font = { name: 'Segoe UI', sz: 9, color: { rgb: '475569' } }
          cell.s.alignment = { horizontal: (c >= 2 && c <= 4) ? 'right' : 'left', vertical: 'center' }
        } else if (r === totalRowIdx) {
          cell.s.font = { name: 'Segoe UI', sz: 10, bold: true, color: { rgb: '111827' } }
          cell.s.fill = { fgColor: { rgb: 'E2E8F0' } }
          cell.s.alignment = { horizontal: (c >= 2 && c <= 4) ? 'right' : 'center', vertical: 'center' }
          cell.s.border = {
            top: { style: 'thin', color: { rgb: '111827' } },
            bottom: { style: 'double', color: { rgb: '111827' } }
          }
        }
      }
    }

    worksheet['!cols'] = [28, 22, 16, 16, 18, 15].map(w => ({ wch: w }))
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Buyer Order Status")
    XLSX.writeFile(workbook, `Buyer_Wise_Order_Status_Report_${dayjs().format('YYYYMMDD')}.xlsx`)
  }

  const handlePrintBuyerPDF = () => {
    const printWindow = window.open('', '_blank')
    
    // Build nested rows for each buyer
    const rowsHTML = filteredBuyerRows.map(row => {
      const buyerRow = `
        <tr class="buyer-group-row">
          <td style="font-weight:700;color:#0369A1;background-color:#E0F2FE">${row.buyerName}</td>
          <td style="background-color:#E0F2FE"><em>(${row.itemTypesCount} Items, ${row.piCount} PIs)</em></td>
          <td class="text-right" style="font-weight:700;background-color:#E0F2FE">${row.totalOrderQty.toLocaleString()}</td>
          <td class="text-right" style="font-weight:700;color:#00A06B;background-color:#E0F2FE">${row.totalShippedQty.toLocaleString()}</td>
          <td class="text-right" style="font-weight:700;color:${row.shipmentDueQty > 0 ? '#EF4444' : '#00C07F'};background-color:#E0F2FE">${row.shipmentDueQty.toLocaleString()}</td>
          <td class="text-center" style="font-weight:700;background-color:#E0F2FE">${row.status}</td>
        </tr>
      `
      
      const itemRows = row.details.map(item => `
        <tr class="item-detail-row">
          <td style="padding-left:25px;color:#475569">↳ PI: ${item.piNo}</td>
          <td style="color:#0284C7;font-weight:600">${item.itemNo}</td>
          <td class="text-right" style="color:#475569">${item.qty.toLocaleString()}</td>
          <td class="text-right" style="color:#00A06B">${item.shippedQty.toLocaleString()}</td>
          <td class="text-right" style="color:${item.dueQty > 0 ? '#EF4444' : '#00C07F'}">${item.dueQty.toLocaleString()}</td>
          <td class="text-center" style="color:#475569">${item.status}</td>
        </tr>
      `).join('')
      
      return buyerRow + itemRows
    }).join('')

    printWindow.document.write(`
      <html><head><title>Buyer Wise Order & Shipment Status Report</title>
      <style>
        body{font-family:'Segoe UI',Arial,sans-serif;margin:15px;color:#1F2937}
        .header{text-align:center;margin-bottom:20px;border-bottom:3px double #0284C7;padding-bottom:12px}
        .header h1{margin:0;font-size:22px;color:#111827;letter-spacing:1px}
        .header p{margin:5px 0 0;color:#6B7280;font-size:12px;font-weight:600;text-transform:uppercase}
        .meta-info{display:flex;justify-content:space-between;margin-bottom:15px;font-size:11px;color:#4B5563}
        table{width:100%;border-collapse:collapse;margin-top:10px;font-size:10px}
        th,td{border:1px solid #D1D5DB;padding:6px 8px;vertical-align:middle}
        th{background-color:#374151;color:#FFFFFF;font-weight:700;text-transform:uppercase;font-size:8px;text-align:left}
        .buyer-group-row td{font-size:10px;border-top:1px solid #93C5FD;border-bottom:1px solid #93C5FD}
        .item-detail-row td{font-size:9px;background-color:#FCFDFE}
        .total-row{font-weight:bold;background-color:#E2E8F0!important}
        .no-wrap{white-space:nowrap}
        .text-center{text-align:center}
        .text-right{text-align:right}
        @media print{@page{size:portrait;margin:10mm}}
      </style>
      </head><body>
      <div class="header"><h1>R KUMAR & COMPANY INVENTORY</h1><p>Buyer Wise Order & Shipment Status Report</p></div>
      <div class="meta-info"><div><strong>Generated On:</strong> ${dayjs().format('DD/MM/YYYY hh:mm A')}</div></div>
      <table><thead><tr>
        <th>Buyer Name / PI No.</th><th>Item Name</th>
        <th class="text-right">Order Qty</th>
        <th class="text-right">Qty Shipped</th>
        <th class="text-right">Shipment Due Qty</th>
        <th class="text-center">Status</th>
      </tr></thead><tbody>
        ${rowsHTML}
        <tr class="total-row">
          <td colspan="2" class="text-right">GRAND TOTAL:</td>
          <td class="text-right">${totalBuyerOrderQty.toLocaleString()}</td>
          <td class="text-right">${totalBuyerShippedQty.toLocaleString()}</td>
          <td class="text-right" style="color:${totalBuyerDueQty > 0 ? '#EF4444' : '#00C07F'}">${totalBuyerDueQty.toLocaleString()}</td>
          <td></td>
        </tr>
      </tbody></table>
      <script>window.onload=function(){window.print();window.close()}<\/script>
      </body></html>`)
    printWindow.document.close()
  }

  const handleExportFgExcel = () => {
    const headerAOA = [
      ["R KUMAR & COMPANY INVENTORY"],
      ["Closing Stock of Finished Goods / PI Wise Report"],
      [`Generated On: ${dayjs().format('DD/MM/YYYY hh:mm A')}`],
      [],
      ["PI No.", "Buyer Name", "Item Name", "PI Qty", "Cut Qty", "Print Issued", "Print Received", "Stitch Issued", "Stitch Received", "Finished (Packed)", "Finish Rejection", "Shipped Qty", "Pending to Finish", "Closing Stock", "Status"]
    ]
    const dataRows = filteredFgRows.map(row => [
      row.piNo, row.buyerName, row.itemNo,
      row.piQty, row.cutQty,
      row.printingIssued, row.printingReceived,
      row.stitchingIssued, row.stitchingReceived,
      row.finishedQty, row.finishRejection,
      row.shippedQty, row.pendingFinish, row.closingStock, row.status
    ])
    const totalRow = ["TOTAL", "", "", totalFgPiQty, totalFgCutQty, totalFgPrintingIssued, totalFgPrintingReceived, totalFgStitchingIssued, totalFgStitchingReceived, totalFgFinished, totalFgRejection, totalFgShipped, totalFgPendingFinish, totalFgClosing, ""]
    const fullAOA = [...headerAOA, ...dataRows, totalRow]
    const worksheet = XLSX.utils.aoa_to_sheet(fullAOA)
    worksheet['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 14 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 14 } },
      { s: { r: 2, c: 0 }, e: { r: 2, c: 14 } },
      { s: { r: 5 + dataRows.length, c: 0 }, e: { r: 5 + dataRows.length, c: 2 } }
    ]
    const maxRow = fullAOA.length
    for (let r = 0; r < maxRow; r++) {
      for (let c = 0; c < 15; c++) {
        const address = XLSX.utils.encode_cell({ r, c })
        if (!worksheet[address]) worksheet[address] = { t: 's', v: '' }
        const cell = worksheet[address]
        cell.s = { font: { name: 'Segoe UI', sz: 10 }, border: { top: { style: 'thin', color: { rgb: 'E5E7EB' } }, bottom: { style: 'thin', color: { rgb: 'E5E7EB' } }, left: { style: 'thin', color: { rgb: 'E5E7EB' } }, right: { style: 'thin', color: { rgb: 'E5E7EB' } } } }
        if (r === 0) { cell.s.font = { name: 'Segoe UI', sz: 16, bold: true, color: { rgb: 'FFFFFF' } }; cell.s.fill = { fgColor: { rgb: '059669' } }; cell.s.alignment = { horizontal: 'center', vertical: 'center' }; cell.s.border = {} }
        else if (r === 1) { cell.s.font = { name: 'Segoe UI', sz: 12, bold: true, color: { rgb: 'FFFFFF' } }; cell.s.fill = { fgColor: { rgb: '059669' } }; cell.s.alignment = { horizontal: 'center', vertical: 'center' }; cell.s.border = {} }
        else if (r === 2) { cell.s.font = { name: 'Segoe UI', sz: 9, italic: true, color: { rgb: '4B5563' } }; cell.s.fill = { fgColor: { rgb: 'F3F4F6' } }; cell.s.alignment = { horizontal: 'center' }; cell.s.border = { bottom: { style: 'medium', color: { rgb: '059669' } } } }
        else if (r === 3) { cell.s.border = {}; cell.s.fill = { fgColor: { rgb: 'FFFFFF' } } }
        else if (r === 4) { cell.s.font = { name: 'Segoe UI', sz: 10, bold: true, color: { rgb: 'FFFFFF' } }; cell.s.fill = { fgColor: { rgb: '374151' } }; cell.s.alignment = { horizontal: (c >= 3 && c <= 9) ? 'right' : 'left', vertical: 'center' } }
        else if (r < maxRow - 1) {
          cell.s.alignment = { horizontal: (c >= 3 && c <= 9) ? 'right' : 'left', vertical: 'center' }
          if (r % 2 === 0) cell.s.fill = { fgColor: { rgb: 'F9FAFB' } }
          if (c === 9) {
            const v = cell.v
            if (typeof v === 'number') cell.s.font = { name: 'Segoe UI', sz: 10, bold: true, color: { rgb: v > 0 ? '059669' : '6B7280' } }
          }
        } else {
          cell.s.font = { name: 'Segoe UI', sz: 10, bold: true }; cell.s.fill = { fgColor: { rgb: 'E5E7EB' } }
          cell.s.alignment = { horizontal: (c >= 3 && c <= 9) ? 'right' : 'center', vertical: 'center' }
          cell.s.border = { top: { style: 'thin', color: { rgb: '111827' } }, bottom: { style: 'double', color: { rgb: '111827' } } }
        }
      }
    }
    worksheet['!cols'] = [14, 20, 14, 10, 10, 13, 14, 14, 15, 16, 16, 12, 15, 14, 14].map(w => ({ wch: w }))
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Finished Goods Stock")
    XLSX.writeFile(workbook, `Finished_Goods_Closing_Stock_PI_Wise_${dayjs().format('YYYYMMDD')}.xlsx`)
  }

  const handlePrintFgPDF = () => {
    const printWindow = window.open('', '_blank')
    const tableRows = filteredFgRows.map(row => `
      <tr>
        <td style="font-weight:700;color:#4F46E5">${row.piNo}</td>
        <td>${row.buyerName}</td>
        <td>${row.itemNo}</td>
        <td class="text-right">${row.piQty.toLocaleString()}</td>
        <td class="text-right">${row.cutQty.toLocaleString()}</td>
        <td class="text-right" style="color:#4F46E5;font-weight:bold">${row.printingIssued.toLocaleString()}</td>
        <td class="text-right" style="color:#6366F1">${row.printingReceived.toLocaleString()}</td>
        <td class="text-right" style="color:#7C3AED;font-weight:bold">${row.stitchingIssued.toLocaleString()}</td>
        <td class="text-right" style="color:#A855F7">${row.stitchingReceived.toLocaleString()}</td>
        <td class="text-right">${row.finishedQty.toLocaleString()}</td>
        <td class="text-right" style="color:${row.finishRejection > 0 ? '#EF4444' : '#6B7280'}">${row.finishRejection.toLocaleString()}</td>
        <td class="text-right" style="color:#00A06B;font-weight:bold">${row.shippedQty.toLocaleString()}</td>
        <td class="text-right" style="color:${row.pendingFinish > 0 ? '#F59E0B' : '#6B7280'};font-weight:bold">${row.pendingFinish.toLocaleString()}</td>
        <td class="text-right" style="font-weight:bold;color:${row.closingStock > 0 ? '#059669' : '#6B7280'}">${row.closingStock.toLocaleString()}</td>
        <td class="text-center" style="font-weight:700;color:${row.status === 'In Stock' ? '#059669' : row.status === 'Not Finished' ? '#F59E0B' : '#6B7280'}">${row.status}</td>
      </tr>`).join('')
    printWindow.document.write(`
      <html><head><title>Closing Stock of Finished Goods / PI Wise</title>
      <style>body{font-family:'Segoe UI',Arial,sans-serif;margin:15px;color:#1F2937}.header{text-align:center;margin-bottom:20px;border-bottom:3px double #059669;padding-bottom:12px}.header h1{margin:0;font-size:22px;color:#111827;letter-spacing:1px}.header p{margin:5px 0 0;color:#6B7280;font-size:12px;font-weight:600;text-transform:uppercase}.meta-info{display:flex;justify-content:space-between;margin-bottom:15px;font-size:11px;color:#4B5563}table{width:100%;border-collapse:collapse;margin-top:10px;font-size:9px}th,td{border:1px solid #D1D5DB;padding:5px 7px;text-align:left;vertical-align:middle}th{background-color:#F3F4F6;font-weight:700;text-transform:uppercase;font-size:8px;color:#374151}tr:nth-child(even){background-color:#F9FAFB}.total-row{font-weight:bold;background-color:#E5E7EB!important}.text-center{text-align:center}.text-right{text-align:right}@media print{@page{size:landscape;margin:10mm}}</style>
      </head><body>
      <div class="header"><h1>R KUMAR & COMPANY INVENTORY</h1><p>Closing Stock of Finished Goods / PI Wise Report</p></div>
      <div class="meta-info"><div><strong>Generated On:</strong> ${dayjs().format('DD/MM/YYYY hh:mm A')}</div></div>
      <table><thead><tr>
        <th>PI No.</th><th>Buyer Name</th><th>Item Name</th>
        <th class="text-right">PI Qty</th>
        <th class="text-right">Cut Qty</th>
        <th class="text-right">Print Issued</th>
        <th class="text-right">Print Received</th>
        <th class="text-right">Stitch Issued</th>
        <th class="text-right">Stitch Received</th>
        <th class="text-right">Finished (Packed)</th>
        <th class="text-right">Finish Rej.</th>
        <th class="text-right">Shipped Qty</th>
        <th class="text-right">Pending to Finish</th>
        <th class="text-right">Closing Stock</th>
        <th class="text-center">Status</th>
      </tr></thead><tbody>
        ${tableRows}
        <tr class="total-row">
          <td colspan="3" class="text-right">TOTAL:</td>
          <td class="text-right">${totalFgPiQty.toLocaleString()}</td>
          <td class="text-right">${totalFgCutQty.toLocaleString()}</td>
          <td class="text-right">${totalFgPrintingIssued.toLocaleString()}</td>
          <td class="text-right">${totalFgPrintingReceived.toLocaleString()}</td>
          <td class="text-right">${totalFgStitchingIssued.toLocaleString()}</td>
          <td class="text-right">${totalFgStitchingReceived.toLocaleString()}</td>
          <td class="text-right">${totalFgFinished.toLocaleString()}</td>
          <td class="text-right">${totalFgRejection.toLocaleString()}</td>
          <td class="text-right">${totalFgShipped.toLocaleString()}</td>
          <td class="text-right">${totalFgPendingFinish.toLocaleString()}</td>
          <td class="text-right" style="color:${totalFgClosing > 0 ? '#059669' : '#6B7280'}">${totalFgClosing.toLocaleString()}</td>
          <td></td>
        </tr>
      </tbody></table>
      <script>window.onload=function(){window.print();window.close()}<\/script>
      </body></html>`)
    printWindow.document.close()
  }

  const handleExportCutIssueExcel = () => {
    const headers = ["Item Name", "PI No.", "Cutting Received"]
    if (cutIssueTypeFilter === 'All' || cutIssueTypeFilter === 'Printer') {
      headers.push("Printing Issue")
    }
    if (cutIssueTypeFilter === 'All' || cutIssueTypeFilter === 'Fabricator') {
      headers.push("Fabricator Issue")
    }
    headers.push("Closing Stock (Due)", "Status")

    const headerAOA = [
      ["R KUMAR & COMPANY INVENTORY"],
      ["Closing Stock / Cutting Issue due to Fabricator/Printing "],
      [`Generated On: ${dayjs().format('DD/MM/YYYY hh:mm A')}`],
      [],
      headers
    ]

    const dataRows = filteredCutIssueRows.map(row => {
      const r = [row.itemNo, row.piNo, row.cuttingReceived]
      if (cutIssueTypeFilter === 'All' || cutIssueTypeFilter === 'Printer') {
        r.push(row.printingIssue)
      }
      if (cutIssueTypeFilter === 'All' || cutIssueTypeFilter === 'Fabricator') {
        r.push(row.fabricatorIssue)
      }
      r.push(row.closingStock, row.status)
      return r
    })

    const totalColumns = headers.length
    const totalRow = ["TOTAL", ""]
    totalRow.push(totalCutIssueReceived)
    if (cutIssueTypeFilter === 'All' || cutIssueTypeFilter === 'Printer') {
      totalRow.push(totalCutIssuePrintingIssue)
    }
    if (cutIssueTypeFilter === 'All' || cutIssueTypeFilter === 'Fabricator') {
      totalRow.push(totalCutIssueFabricatorIssue)
    }
    totalRow.push(totalCutIssueClosing, "")

    const fullAOA = [...headerAOA, ...dataRows, totalRow]
    const worksheet = XLSX.utils.aoa_to_sheet(fullAOA)
    worksheet['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: totalColumns - 1 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: totalColumns - 1 } },
      { s: { r: 2, c: 0 }, e: { r: 2, c: totalColumns - 1 } },
      { s: { r: 5 + dataRows.length, c: 0 }, e: { r: 5 + dataRows.length, c: 1 } }
    ]
    const maxRow = fullAOA.length
    for (let r = 0; r < maxRow; r++) {
      for (let c = 0; c < totalColumns; c++) {
        const address = XLSX.utils.encode_cell({ r, c })
        if (!worksheet[address]) worksheet[address] = { t: 's', v: '' }
        const cell = worksheet[address]
        cell.s = { font: { name: 'Segoe UI', sz: 10, color: { rgb: "1F2937" } }, border: { top: { style: "thin", color: { rgb: "E5E7EB" } }, bottom: { style: "thin", color: { rgb: "E5E7EB" } }, left: { style: "thin", color: { rgb: "E5E7EB" } }, right: { style: "thin", color: { rgb: "E5E7EB" } } } }
        if (r === 0) { cell.s.font = { name: 'Segoe UI', sz: 16, bold: true, color: { rgb: "FFFFFF" } }; cell.s.fill = { fgColor: { rgb: "7C3AED" } }; cell.s.alignment = { horizontal: "center", vertical: "center" }; cell.s.border = {} }
        else if (r === 1) { cell.s.font = { name: 'Segoe UI', sz: 12, bold: true, color: { rgb: "FFFFFF" } }; cell.s.fill = { fgColor: { rgb: "7C3AED" } }; cell.s.alignment = { horizontal: "center", vertical: "center" }; cell.s.border = {} }
        else if (r === 2) { cell.s.font = { name: 'Segoe UI', sz: 9, italic: true, color: { rgb: "4B5563" } }; cell.s.fill = { fgColor: { rgb: "F3F4F6" } }; cell.s.alignment = { horizontal: "center", vertical: "center" }; cell.s.border = { bottom: { style: "medium", color: { rgb: "7C3AED" } } } }
        else if (r === 3) { cell.s.border = {}; cell.s.fill = { fgColor: { rgb: "FFFFFF" } } }
        else if (r === 4) { cell.s.font = { name: 'Segoe UI', sz: 10, bold: true, color: { rgb: "FFFFFF" } }; cell.s.fill = { fgColor: { rgb: "374151" } }; cell.s.alignment = { horizontal: (c >= 2 && c <= totalColumns - 2) ? "right" : "left", vertical: "center" } }
        else if (r < maxRow - 1) { cell.s.alignment = { horizontal: (c >= 2 && c <= totalColumns - 2) ? "right" : "left", vertical: "center" }; if (r % 2 === 0) cell.s.fill = { fgColor: { rgb: "F9FAFB" } } }
        else { cell.s.font = { name: 'Segoe UI', sz: 10, bold: true, color: { rgb: "111827" } }; cell.s.fill = { fgColor: { rgb: "E5E7EB" } }; cell.s.alignment = { horizontal: (c >= 2 && c <= totalColumns - 2) ? "right" : "center", vertical: "center" }; cell.s.border = { top: { style: "thin", color: { rgb: "111827" } }, bottom: { style: "double", color: { rgb: "111827" } } } }
      }
    }
    worksheet['!cols'] = Array(totalColumns).fill(18).map((w, idx) => ({ wch: idx === 0 ? 25 : idx === 1 ? 15 : w }))
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Cutting Issue Report")
    XLSX.writeFile(workbook, `Closing_Stock_Cutting_Issue_Fabricator_Printing_${dayjs().format('YYYYMMDD')}.xlsx`)
  }

  const handlePrintCutIssuePDF = () => {
    const printWindow = window.open('', '_blank')
    const tableRows = filteredCutIssueRows.map(row => {
      let middleCells = ''
      if (cutIssueTypeFilter === 'All' || cutIssueTypeFilter === 'Printer') {
        middleCells += `<td class="no-wrap text-right">${Number(row.printingIssue || 0).toLocaleString()}</td>`
      }
      if (cutIssueTypeFilter === 'All' || cutIssueTypeFilter === 'Fabricator') {
        middleCells += `<td class="no-wrap text-right">${Number(row.fabricatorIssue || 0).toLocaleString()}</td>`
      }
      return `
        <tr>
          <td>${row.itemNo}</td>
          <td>${row.piNo}</td>
          <td class="no-wrap text-right">${Number(row.cuttingReceived || 0).toLocaleString()}</td>
          ${middleCells}
          <td class="no-wrap text-right" style="font-weight:bold;color:${row.closingStock > 0 ? '#EF4444' : '#00C07F'}">${Number(row.closingStock || 0).toLocaleString()}</td>
          <td class="no-wrap text-center" style="font-weight:700;color:${row.status === 'Completed' ? '#00A06B' : '#DC2626'}">${row.status}</td>
        </tr>
      `
    }).join('')

    let headersHTML = ''
    if (cutIssueTypeFilter === 'All' || cutIssueTypeFilter === 'Printer') {
      headersHTML += `<th class="text-right">Printing Issue</th>`
    }
    if (cutIssueTypeFilter === 'All' || cutIssueTypeFilter === 'Fabricator') {
      headersHTML += `<th class="text-right">Fabricator Issue</th>`
    }

    let footerCells = ''
    if (cutIssueTypeFilter === 'All' || cutIssueTypeFilter === 'Printer') {
      footerCells += `<td class="text-right">${totalCutIssuePrintingIssue.toLocaleString()}</td>`
    }
    if (cutIssueTypeFilter === 'All' || cutIssueTypeFilter === 'Fabricator') {
      footerCells += `<td class="text-right">${totalCutIssueFabricatorIssue.toLocaleString()}</td>`
    }

    printWindow.document.write(`
      <html><head><title>Closing Stock / Cutting Issue due to Fabricator/Printing </title>
      <style>body{font-family:'Segoe UI',Arial,sans-serif;margin:15px;color:#1F2937}.header{text-align:center;margin-bottom:20px;border-bottom:3px double #7C3AED;padding-bottom:12px}.header h1{margin:0;font-size:22px;color:#111827;letter-spacing:1px}.header p{margin:5px 0 0;color:#6B7280;font-size:12px;font-weight:600;text-transform:uppercase}.meta-info{display:flex;justify-content:space-between;margin-bottom:15px;font-size:11px;color:#4B5563}table{width:100%;border-collapse:collapse;margin-top:10px;font-size:10px}th,td{border:1px solid #D1D5DB;padding:6px 8px;text-align:left;vertical-align:middle}th{background-color:#F3F4F6;font-weight:700;text-transform:uppercase;font-size:8px;color:#374151}tr:nth-child(even){background-color:#F9FAFB}.total-row{font-weight:bold;background-color:#E5E7EB!important}.no-wrap{white-space:nowrap}.text-center{text-align:center}.text-right{text-align:right}@media print{@page{size:landscape;margin:10mm}}</style>
      </head><body>
      <div class="header"><h1>R KUMAR & COMPANY INVENTORY</h1><p>Closing Stock / Cutting Issue due to Fabricator/Printing </p></div>
      <div class="meta-info"><div><strong>Generated On:</strong> ${dayjs().format('DD/MM/YYYY hh:mm A')}</div></div>
      <table><thead><tr>
        <th>Item Name</th><th>PI No.</th>
        <th class="text-right">Cutting Received</th>
        ${headersHTML}
        <th class="text-right">Closing Stock (Due)</th>
        <th class="text-center">Status</th>
      </tr></thead><tbody>
        ${tableRows}
        <tr class="total-row">
          <td colspan="2" class="text-right">TOTAL:</td>
          <td class="text-right">${totalCutIssueReceived.toLocaleString()}</td>
          ${footerCells}
          <td class="text-right" style="color:${totalCutIssueClosing > 0 ? '#EF4444' : '#00C07F'}">${totalCutIssueClosing.toLocaleString()}</td>
          <td></td>
        </tr>
      </tbody></table>
      <script>window.onload=function(){window.print();window.close()}<\/script>
      </body></html>`)
    printWindow.document.close()
  }

  const handleExportPipelineExcel = () => {
    const headerAOA = [
      ["R KUMAR & COMPANY INVENTORY"],
      ["Fabricator Wise Issue, Received and Due Qty Report"],
      [`Generated On: ${dayjs().format('DD/MM/YYYY hh:mm A')}`],
      [],
      ["Fabricator Name", "Item Name", "PI No.", "Total Issued", "Total Received", "Rej (Fab)", "Rej (Fac)", "Due Qty", "Status"]
    ]

    const dataRows = filteredPipelineRows.map(row => [
      row.fabricatorName,
      row.itemNo,
      row.piNo,
      row.totalIssued,
      row.totalReceived,
      row.rejFab,
      row.rejFac,
      row.closingStock,
      row.status
    ])

    const totalRow = [
      "TOTAL", "", "",
      totalPipelineIssued,
      totalPipelineReceived,
      totalPipelineRejFab,
      totalPipelineRejFac,
      totalPipelineClosing,
      ""
    ]

    const fullAOA = [...headerAOA, ...dataRows, totalRow]
    const worksheet = XLSX.utils.aoa_to_sheet(fullAOA)

    worksheet['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 8 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 8 } },
      { s: { r: 2, c: 0 }, e: { r: 2, c: 8 } },
      { s: { r: 5 + dataRows.length, c: 0 }, e: { r: 5 + dataRows.length, c: 2 } }
    ]

    const maxRow = fullAOA.length
    for (let r = 0; r < maxRow; r++) {
      for (let c = 0; c < 9; c++) {
        const address = XLSX.utils.encode_cell({ r, c })
        if (!worksheet[address]) worksheet[address] = { t: 's', v: '' }
        const cell = worksheet[address]

        cell.s = {
          font: { name: 'Segoe UI', sz: 10, color: { rgb: "1F2937" } },
          border: {
            top: { style: "thin", color: { rgb: "E5E7EB" } }, bottom: { style: "thin", color: { rgb: "E5E7EB" } },
            left: { style: "thin", color: { rgb: "E5E7EB" } }, right: { style: "thin", color: { rgb: "E5E7EB" } }
          }
        }

        if (r === 0) {
          cell.s.font = { name: 'Segoe UI', sz: 16, bold: true, color: { rgb: "FFFFFF" } }
          cell.s.fill = { fgColor: { rgb: "4F46E5" } }
          cell.s.alignment = { horizontal: "center", vertical: "center" }
          cell.s.border = {}
        } else if (r === 1) {
          cell.s.font = { name: 'Segoe UI', sz: 12, bold: true, color: { rgb: "FFFFFF" } }
          cell.s.fill = { fgColor: { rgb: "4F46E5" } }
          cell.s.alignment = { horizontal: "center", vertical: "center" }
          cell.s.border = {}
        } else if (r === 2) {
          cell.s.font = { name: 'Segoe UI', sz: 9, italic: true, color: { rgb: "4B5563" } }
          cell.s.fill = { fgColor: { rgb: "F3F4F6" } }
          cell.s.alignment = { horizontal: "center", vertical: "center" }
          cell.s.border = { bottom: { style: "medium", color: { rgb: "6C63FF" } } }
        } else if (r === 3) {
          cell.s.border = {}
          cell.s.fill = { fgColor: { rgb: "FFFFFF" } }
        } else if (r === 4) {
          cell.s.font = { name: 'Segoe UI', sz: 10, bold: true, color: { rgb: "FFFFFF" } }
          cell.s.fill = { fgColor: { rgb: "374151" } }
          cell.s.alignment = {
            horizontal: (c >= 3 && c <= 7) ? "right" : "left",
            vertical: "center"
          }
        } else if (r < maxRow - 1) {
          cell.s.alignment = {
            horizontal: (c >= 3 && c <= 7) ? "right" : "left",
            vertical: "center"
          }
          if (r % 2 === 0) cell.s.fill = { fgColor: { rgb: "F9FAFB" } }
        } else {
          cell.s.font = { name: 'Segoe UI', sz: 10, bold: true, color: { rgb: "111827" } }
          cell.s.fill = { fgColor: { rgb: "E5E7EB" } }
          cell.s.alignment = { horizontal: (c >= 3 && c <= 7) ? "right" : "center", vertical: "center" }
          cell.s.border = { top: { style: "thin", color: { rgb: "111827" } }, bottom: { style: "double", color: { rgb: "111827" } } }
        }
      }
    }

    const widths = [20, 15, 15, 25, 18, 12, 12, 20, 15]
    worksheet['!cols'] = widths.map(w => ({ wch: w }))

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Fabricator Wise Report")
    XLSX.writeFile(workbook, `Fabricator_Wise_Issue_Received_Due_${dayjs().format('YYYYMMDD')}.xlsx`)
  }

  const handlePrintPipelinePDF = () => {
    const printWindow = window.open('', '_blank')
    const tableRows = filteredPipelineRows.map(row => `
      <tr>
        <td>${row.fabricatorName}</td>
        <td>${row.itemNo}</td>
        <td>${row.piNo}</td>
        <td class="no-wrap text-right">${Number(row.totalIssued || 0).toLocaleString()}</td>
        <td class="no-wrap text-right">${Number(row.totalReceived || 0).toLocaleString()}</td>
        <td class="no-wrap text-right">${Number(row.rejFab || 0).toLocaleString()}</td>
        <td class="no-wrap text-right">${Number(row.rejFac || 0).toLocaleString()}</td>
        <td class="no-wrap text-right" style="font-weight: bold; color: ${row.closingStock > 0 ? '#EF4444' : '#00C07F'};">${Number(row.closingStock || 0).toLocaleString()}</td>
        <td class="no-wrap text-center" style="font-weight: 700; color: ${row.status === 'Completed' ? '#00A06B' : '#DC2626'};">${row.status}</td>
      </tr>
    `).join('')

    printWindow.document.write(`
      <html>
        <head>
          <title>Fabricator Wise Issue, Received and Due Qty Report</title>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; margin: 15px; color: #1F2937; }
            .header { text-align: center; margin-bottom: 20px; border-bottom: 3px double #6C63FF; padding-bottom: 12px; }
            .header h1 { margin: 0; font-size: 22px; color: #111827; letter-spacing: 1px; }
            .header p { margin: 5px 0 0; color: #6B7280; font-size: 12px; font-weight: 600; text-transform: uppercase; }
            .meta-info { display: flex; justify-content: space-between; margin-bottom: 15px; font-size: 11px; color: #4B5563; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 10px; }
            th, td { border: 1px solid #D1D5DB; padding: 6px 8px; text-align: left; vertical-align: middle; }
            th { background-color: #F3F4F6; font-weight: 700; text-transform: uppercase; font-size: 8px; color: #374151; }
            tr:nth-child(even) { background-color: #F9FAFB; }
            .total-row { font-weight: bold; background-color: #E5E7EB !important; }
            .no-wrap { white-space: nowrap; }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            @media print {
              @page { size: landscape; margin: 10mm; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>R KUMAR & COMPANY INVENTORY</h1>
            <p>Fabricator Wise Issue, Received and Due Qty Report</p>
          </div>
          <div class="meta-info">
            <div><strong>Generated On:</strong> ${dayjs().format('DD/MM/YYYY hh:mm A')}</div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Fabricator Name</th>
                <th>Item Name</th>
                <th>PI No.</th>
                <th class="text-right">Total Issued</th>
                <th class="text-right">Total Received</th>
                <th class="text-right">Rej (Fab)</th>
                <th class="text-right">Rej (Fac)</th>
                <th class="text-right">Due Qty</th>
                <th class="text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
              <tr class="total-row">
                <td colspan="3" class="text-right">TOTAL:</td>
                <td class="text-right">${totalPipelineIssued.toLocaleString()}</td>
                <td class="text-right">${totalPipelineReceived.toLocaleString()}</td>
                <td class="text-right">${totalPipelineRejFab.toLocaleString()}</td>
                <td class="text-right">${totalPipelineRejFac.toLocaleString()}</td>
                <td class="text-right" style="color: ${totalPipelineClosing > 0 ? '#EF4444' : '#00C07F'};">${totalPipelineClosing.toLocaleString()}</td>
                <td></td>
              </tr>
            </tbody>
          </table>
          <script>
            window.onload = function() {
              window.print();
              window.close();
            }
          </script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  // ==========================================
  // EXPORT / PRINT ACTIONS FOR PO DUE
  // ==========================================
  const handleExportPoDueExcel = () => {
    const headerAOA = [
      ["R KUMAR & COMPANY INVENTORY"],
      ["Purchase Order Wise Incoming Due Report"],
      [`Generated On: ${dayjs().format('DD/MM/YYYY hh:mm A')} | Status Filter: ${statusFilter} | Supplier Filter: ${supplierFilter}`],
      [],
      ["PO Date", "PO No.", "Supplier", "Material Name", "Color", "Unit", "Ordered Qty", "Received Qty", "Due Qty", "Status"]
    ]

    const dataRows = filteredPoDueRows.map(row => [
      row.date ? dayjs(row.date).format('DD/MM/YYYY') : '—',
      row.poNo,
      row.supplier,
      row.materialName,
      row.color || '—',
      unitLabel(row.unit),
      row.orderedQty,
      row.receivedQty,
      row.dueQty,
      row.status
    ])

    const totalRow = [
      "TOTAL", "", "", "", "", "",
      poDueTotalOrdered,
      poDueTotalOrdered - poDueTotalDue,
      poDueTotalDue,
      ""
    ]

    const fullAOA = [...headerAOA, ...dataRows, totalRow]
    const worksheet = XLSX.utils.aoa_to_sheet(fullAOA)

    worksheet['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 9 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 9 } },
      { s: { r: 2, c: 0 }, e: { r: 2, c: 9 } },
      { s: { r: 5 + dataRows.length, c: 0 }, e: { r: 5 + dataRows.length, c: 5 } }
    ]

    const maxRow = fullAOA.length
    for (let r = 0; r < maxRow; r++) {
      for (let c = 0; c < 11; c++) {
        const address = XLSX.utils.encode_cell({ r, c })
        if (!worksheet[address]) worksheet[address] = { t: 's', v: '' }
        const cell = worksheet[address]

        cell.s = {
          font: { name: 'Segoe UI', sz: 10, color: { rgb: "1F2937" } },
          border: {
            top: { style: "thin", color: { rgb: "E5E7EB" } }, bottom: { style: "thin", color: { rgb: "E5E7EB" } },
            left: { style: "thin", color: { rgb: "E5E7EB" } }, right: { style: "thin", color: { rgb: "E5E7EB" } }
          }
        }

        if (r === 0) {
          cell.s.font = { name: 'Segoe UI', sz: 16, bold: true, color: { rgb: "FFFFFF" } }
          cell.s.fill = { fgColor: { rgb: "4F46E5" } }
          cell.s.alignment = { horizontal: "center", vertical: "center" }
          cell.s.border = {}
        } else if (r === 1) {
          cell.s.font = { name: 'Segoe UI', sz: 12, bold: true, color: { rgb: "FFFFFF" } }
          cell.s.fill = { fgColor: { rgb: "4F46E5" } }
          cell.s.alignment = { horizontal: "center", vertical: "center" }
          cell.s.border = {}
        } else if (r === 2) {
          cell.s.font = { name: 'Segoe UI', sz: 9, italic: true, color: { rgb: "4B5563" } }
          cell.s.fill = { fgColor: { rgb: "F3F4F6" } }
          cell.s.alignment = { horizontal: "center", vertical: "center" }
          cell.s.border = { bottom: { style: "medium", color: { rgb: "6C63FF" } } }
        } else if (r === 3) {
          cell.s.border = {}
          cell.s.fill = { fgColor: { rgb: "FFFFFF" } }
        } else if (r === 4) {
          cell.s.font = { name: 'Segoe UI', sz: 10, bold: true, color: { rgb: "FFFFFF" } }
          cell.s.fill = { fgColor: { rgb: "374151" } }
          cell.s.alignment = {
            horizontal: (c === 6 || c === 7 || c === 8 || c === 9) ? "right" : (c === 5 || c === 10) ? "center" : "left",
            vertical: "center"
          }
        } else if (r < maxRow - 1) {
          cell.s.alignment = {
            horizontal: (c === 6 || c === 7 || c === 8 || c === 9) ? "right" : (c === 0 || c === 1 || c === 5 || c === 10) ? "center" : "left",
            vertical: "center"
          }
          if (r % 2 === 0) cell.s.fill = { fgColor: { rgb: "F9FAFB" } }
          if (c === 10) {
            const val = cell.v
            cell.s.font = { name: 'Segoe UI', sz: 10, bold: true, color: { rgb: val === 'Fully Received' ? "00A06B" : val === 'Partially Received' ? "D97706" : "DC2626" } }
          }
        } else {
          cell.s.font = { name: 'Segoe UI', sz: 10, bold: true, color: { rgb: "111827" } }
          cell.s.fill = { fgColor: { rgb: "E5E7EB" } }
          cell.s.alignment = { horizontal: (c === 6 || c === 7 || c === 8 || c === 9) ? "right" : (c === 0) ? "center" : "left", vertical: "center" }
          cell.s.border = { top: { style: "thin", color: { rgb: "111827" } }, bottom: { style: "double", color: { rgb: "111827" } } }
        }
      }
    }

    const widths = [14, 15, 25, 25, 12, 10, 15, 15, 15, 15, 20]
    worksheet['!cols'] = widths.map(w => ({ wch: w }))

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Incoming Due Report")
    XLSX.writeFile(workbook, `PO_Incoming_Due_Report_${dayjs().format('YYYYMMDD')}.xlsx`)
  }

  const handlePrintPoDuePDF = () => {
    const printWindow = window.open('', '_blank')
    const tableRows = filteredPoDueRows.map(row => `
      <tr>
        <td class="no-wrap">${row.date ? dayjs(row.date).format('DD/MM/YYYY') : '—'}</td>
        <td class="no-wrap" style="font-weight: 700;">${row.poNo}</td>
        <td>${row.supplier}</td>
        <td>${row.materialName}</td>
        <td class="no-wrap">${row.color || '—'}</td>
        <td class="no-wrap text-center">${unitLabel(row.unit)}</td>
        <td class="no-wrap text-right">${Number(row.orderedQty || 0).toLocaleString()}</td>
        <td class="no-wrap text-right">${Number(row.receivedQty || 0).toLocaleString()}</td>
        <td class="no-wrap text-right" style="font-weight: bold; color: ${row.dueQty > 0 ? '#EF4444' : '#00C07F'};">${Number(row.dueQty || 0).toLocaleString()}</td>
        <td class="no-wrap text-center" style="font-weight: 700; color: ${row.status === 'Fully Received' ? '#00A06B' : row.status === 'Partially Received' ? '#D97706' : '#DC2626'};">${row.status}</td>
      </tr>
    `).join('')

    printWindow.document.write(`
      <html>
        <head>
          <title>Purchase Order Wise Incoming Due Report</title>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; margin: 15px; color: #1F2937; }
            .header { text-align: center; margin-bottom: 20px; border-bottom: 3px double #6C63FF; padding-bottom: 12px; }
            .header h1 { margin: 0; font-size: 22px; color: #111827; letter-spacing: 1px; }
            .header p { margin: 5px 0 0; color: #6B7280; font-size: 12px; font-weight: 600; text-transform: uppercase; }
            .meta-info { display: flex; justify-content: space-between; margin-bottom: 15px; font-size: 11px; color: #4B5563; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 10px; }
            th, td { border: 1px solid #D1D5DB; padding: 6px 8px; text-align: left; vertical-align: middle; }
            th { background-color: #F3F4F6; font-weight: 700; text-transform: uppercase; font-size: 9px; color: #374151; }
            tr:nth-child(even) { background-color: #F9FAFB; }
            .total-row { font-weight: bold; background-color: #E5E7EB !important; }
            .no-wrap { white-space: nowrap; }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            @media print {
              @page { size: landscape; margin: 10mm; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>R KUMAR & COMPANY INVENTORY</h1>
            <p>Purchase Order Wise Incoming Due Report</p>
          </div>
          <div class="meta-info">
            <div><strong>Generated On:</strong> ${dayjs().format('DD/MM/YYYY hh:mm A')}</div>
            <div><strong>Filters Applied:</strong> Supplier: ${supplierFilter} | Status: ${statusFilter}</div>
          </div>
          <table>
            <thead>
              <tr>
                <th class="no-wrap">PO Date</th>
                <th class="no-wrap">PO No.</th>
                <th>Supplier</th>
                <th>Material Name</th>
                <th class="no-wrap">Color</th>
                <th class="no-wrap text-center">Unit</th>
                <th class="no-wrap text-right">Ordered Qty</th>
                <th class="no-wrap text-right">Received Qty</th>
                <th class="no-wrap text-right">Due Qty</th>
                <th class="no-wrap text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
              <tr class="total-row">
                <td colspan="6" class="text-right">TOTAL:</td>
                <td class="no-wrap text-right">${poDueTotalOrdered.toLocaleString()}</td>
                <td class="no-wrap text-right">${(poDueTotalOrdered - poDueTotalDue).toLocaleString()}</td>
                <td class="no-wrap text-right" style="color: ${poDueTotalDue > 0 ? '#EF4444' : '#00C07F'};">${poDueTotalDue.toLocaleString()}</td>
                <td></td>
              </tr>
            </tbody>
          </table>
          <script>
            window.onload = function() {
              window.print();
              window.close();
            }
          </script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  // ==========================================
  // EXPORT / PRINT ACTIONS FOR CLOSING STOCK
  // ==========================================
  const handleExportStockExcel = () => {
    const totalStockOpening = filteredStockRows.reduce((sum, r) => sum + (r.openingQty || 0), 0)
    const totalStockOrdered = filteredStockRows.reduce((sum, r) => sum + (r.orderedQty || 0), 0)

    const headerAOA = [
      ["R KUMAR & COMPANY INVENTORY"],
      ["Raw Material / Accessories Closing Stock Report"],
      [`Generated On: ${dayjs().format('DD/MM/YYYY hh:mm A')} | Status Filter: ${stockStatusFilter}`],
      [],
      ["Material Name", "Color", "Unit", "Opening Qty", "Ordered Qty", "Total Received", "Consumed (Cutting)", "Issued (Printing)", "Issued (Stitching)", "Closing Stock", "Status"]
    ]

    const dataRows = filteredStockRows.map(row => [
      row.name,
      row.color || '—',
      unitLabel(row.unit),
      row.openingQty,
      row.orderedQty,
      row.received,
      row.cutRejection > 0
        ? `${row.cutConsumed} (${row.cutRejection} rejected)`
        : row.cutConsumed,
      row.printIssued,
      row.stitchIssued,
      row.closingStock,
      row.status
    ])

    const totalRow = [
      "TOTAL", "", "",
      totalStockOpening,
      totalStockOrdered,
      totalStockReceived,
      totalStockCutRejection > 0
        ? `${totalStockCutConsumed} (${totalStockCutRejection} rejected)`
        : totalStockCutConsumed,
      totalStockPrintIssued,
      totalStockStitchIssued,
      totalStockClosing,
      ""
    ]

    const fullAOA = [...headerAOA, ...dataRows, totalRow]
    const worksheet = XLSX.utils.aoa_to_sheet(fullAOA)

    worksheet['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 10 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 10 } },
      { s: { r: 2, c: 0 }, e: { r: 2, c: 10 } },
      { s: { r: 5 + dataRows.length, c: 0 }, e: { r: 5 + dataRows.length, c: 2 } }
    ]

    const maxRow = fullAOA.length
    for (let r = 0; r < maxRow; r++) {
      for (let c = 0; c < 11; c++) {
        const address = XLSX.utils.encode_cell({ r, c })
        if (!worksheet[address]) worksheet[address] = { t: 's', v: '' }
        const cell = worksheet[address]

        cell.s = {
          font: { name: 'Segoe UI', sz: 10, color: { rgb: "1F2937" } },
          border: {
            top: { style: "thin", color: { rgb: "E5E7EB" } }, bottom: { style: "thin", color: { rgb: "E5E7EB" } },
            left: { style: "thin", color: { rgb: "E5E7EB" } }, right: { style: "thin", color: { rgb: "E5E7EB" } }
          }
        }

        if (r === 0) {
          cell.s.font = { name: 'Segoe UI', sz: 16, bold: true, color: { rgb: "FFFFFF" } }
          cell.s.fill = { fgColor: { rgb: "4F46E5" } }
          cell.s.alignment = { horizontal: "center", vertical: "center" }
          cell.s.border = {}
        } else if (r === 1) {
          cell.s.font = { name: 'Segoe UI', sz: 12, bold: true, color: { rgb: "FFFFFF" } }
          cell.s.fill = { fgColor: { rgb: "4F46E5" } }
          cell.s.alignment = { horizontal: "center", vertical: "center" }
          cell.s.border = {}
        } else if (r === 2) {
          cell.s.font = { name: 'Segoe UI', sz: 9, italic: true, color: { rgb: "4B5563" } }
          cell.s.fill = { fgColor: { rgb: "F3F4F6" } }
          cell.s.alignment = { horizontal: "center", vertical: "center" }
          cell.s.border = { bottom: { style: "medium", color: { rgb: "6C63FF" } } }
        } else if (r === 3) {
          cell.s.border = {}
          cell.s.fill = { fgColor: { rgb: "FFFFFF" } }
        } else if (r === 4) {
          cell.s.font = { name: 'Segoe UI', sz: 10, bold: true, color: { rgb: "FFFFFF" } }
          cell.s.fill = { fgColor: { rgb: "374151" } }
          cell.s.alignment = {
            horizontal: (c >= 3 && c <= 9) ? "right" : (c === 2 || c === 10) ? "center" : "left",
            vertical: "center"
          }
        } else if (r < maxRow - 1) {
          cell.s.alignment = {
            horizontal: (c >= 3 && c <= 9) ? "right" : (c === 1 || c === 2 || c === 10) ? "center" : "left",
            vertical: "center"
          }
          if (r % 2 === 0) cell.s.fill = { fgColor: { rgb: "F9FAFB" } }
          if (c === 10) {
            const val = cell.v
            cell.s.font = { name: 'Segoe UI', sz: 10, bold: true, color: { rgb: val === 'In Stock' ? "00A06B" : val === 'Low Stock' ? "D97706" : "DC2626" } }
          }
        } else {
          cell.s.font = { name: 'Segoe UI', sz: 10, bold: true, color: { rgb: "111827" } }
          cell.s.fill = { fgColor: { rgb: "E5E7EB" } }
          cell.s.alignment = { horizontal: (c >= 3 && c <= 9) ? "right" : (c === 0) ? "center" : "left", vertical: "center" }
          cell.s.border = { top: { style: "thin", color: { rgb: "111827" } }, bottom: { style: "double", color: { rgb: "111827" } } }
        }
      }
    }

    const widths = [25, 12, 10, 15, 15, 15, 18, 18, 18, 15, 15]
    worksheet['!cols'] = widths.map(w => ({ wch: w }))

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Closing Stock")
    XLSX.writeFile(workbook, `RM_Closing_Stock_Report_${dayjs().format('YYYYMMDD')}.xlsx`)
  }

  const handlePrintStockPDF = () => {
    const totalStockOpening = filteredStockRows.reduce((sum, r) => sum + (r.openingQty || 0), 0)
    const totalStockOrdered = filteredStockRows.reduce((sum, r) => sum + (r.orderedQty || 0), 0)
    const printWindow = window.open('', '_blank')
    const tableRows = filteredStockRows.map(row => `
      <tr>
        <td>${row.name}</td>
        <td class="no-wrap">${row.color || '—'}</td>
        <td class="no-wrap text-center">${unitLabel(row.unit)}</td>
        <td class="no-wrap text-right">${Number(row.openingQty || 0).toLocaleString()}</td>
        <td class="no-wrap text-right">${Number(row.orderedQty || 0).toLocaleString()}</td>
        <td class="no-wrap text-right">${Number(row.received || 0).toLocaleString()}</td>
        <td class="no-wrap text-right">${
          row.cutRejection > 0
            ? `${Number(row.cutConsumed || 0).toLocaleString()} (${Number(row.cutRejection || 0).toLocaleString()} rejected)`
            : Number(row.cutConsumed || 0).toLocaleString()
        }</td>
        <td class="no-wrap text-right">${Number(row.printIssued || 0).toLocaleString()}</td>
        <td class="no-wrap text-right">${Number(row.stitchIssued || 0).toLocaleString()}</td>
        <td class="no-wrap text-right" style="font-weight: bold; color: ${row.closingStock > 100 ? '#00A06B' : row.closingStock > 0 ? '#D97706' : '#DC2626'};">${Number(row.closingStock || 0).toLocaleString()}</td>
        <td class="no-wrap text-center" style="font-weight: 700; color: ${row.status === 'In Stock' ? '#00A06B' : row.status === 'Low Stock' ? '#D97706' : '#DC2626'};">${row.status}</td>
      </tr>
    `).join('')

    printWindow.document.write(`
      <html>
        <head>
          <title>Raw Material / Accessories Closing Stock Report</title>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; margin: 15px; color: #1F2937; }
            .header { text-align: center; margin-bottom: 20px; border-bottom: 3px double #6C63FF; padding-bottom: 12px; }
            .header h1 { margin: 0; font-size: 22px; color: #111827; letter-spacing: 1px; }
            .header p { margin: 5px 0 0; color: #6B7280; font-size: 12px; font-weight: 600; text-transform: uppercase; }
            .meta-info { display: flex; justify-content: space-between; margin-bottom: 15px; font-size: 11px; color: #4B5563; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 10px; }
            th, td { border: 1px solid #D1D5DB; padding: 6px 8px; text-align: left; vertical-align: middle; }
            th { background-color: #F3F4F6; font-weight: 700; text-transform: uppercase; font-size: 9px; color: #374151; }
            tr:nth-child(even) { background-color: #F9FAFB; }
            .total-row { font-weight: bold; background-color: #E5E7EB !important; }
            .no-wrap { white-space: nowrap; }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            @media print {
              @page { size: landscape; margin: 10mm; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>R KUMAR & COMPANY INVENTORY</h1>
            <p>Raw Material / Accessories Closing Stock Report</p>
          </div>
          <div class="meta-info">
            <div><strong>Generated On:</strong> ${dayjs().format('DD/MM/YYYY hh:mm A')}</div>
            <div><strong>Filters Applied:</strong> Status Filter: ${stockStatusFilter}</div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Material Name</th>
                <th class="no-wrap">Color</th>
                <th class="no-wrap text-center">Unit</th>
                <th class="no-wrap text-right">Opening Qty</th>
                <th class="no-wrap text-right">Ordered Qty</th>
                <th class="no-wrap text-right">Total Received</th>
                <th class="no-wrap text-right">Consumed (Cutting)</th>
                <th class="no-wrap text-right">Issued (Printing)</th>
                <th class="no-wrap text-right">Issued (Stitching)</th>
                <th class="no-wrap text-right">Closing Stock</th>
                <th class="no-wrap text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
              <tr class="total-row">
                <td colspan="3" class="text-right">TOTAL:</td>
                <td class="no-wrap text-right">${totalStockOpening.toLocaleString()}</td>
                <td class="no-wrap text-right">${totalStockOrdered.toLocaleString()}</td>
                <td class="no-wrap text-right">${totalStockReceived.toLocaleString()}</td>
                <td class="no-wrap text-right">${
                  totalStockCutRejection > 0
                    ? `${totalStockCutConsumed.toLocaleString()} (${totalStockCutRejection.toLocaleString()} rejected)`
                    : totalStockCutConsumed.toLocaleString()
                }</td>
                <td class="no-wrap text-right">${totalStockPrintIssued.toLocaleString()}</td>
                <td class="no-wrap text-right">${totalStockStitchIssued.toLocaleString()}</td>
                <td class="no-wrap text-right">${totalStockClosing.toLocaleString()}</td>
                <td></td>
              </tr>
            </tbody>
          </table>
          <script>
            window.onload = function() {
              window.print();
              window.close();
            }
          </script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  return (
    <Box className="page-enter" sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {activeReport === 'po-due' && (
          <>
            {/* PO Due Report Top Toolbar */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>PO Wise Incoming Due Report</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>Track raw materials ordered vs received against POs</Typography>
              </Box>
              <Stack direction="row" spacing={1.5}>
                <Button
                  variant="outlined"
                  color="secondary"
                  startIcon={<PrintRoundedIcon />}
                  onClick={handlePrintPoDuePDF}
                  sx={{ borderRadius: 2.5, fontWeight: 700, textTransform: 'none' }}
                >
                  Print / PDF
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<FileDownloadRoundedIcon />}
                  onClick={handleExportPoDueExcel}
                  sx={{ borderRadius: 2.5, fontWeight: 700, textTransform: 'none', boxShadow: '0 4px 14px 0 rgba(0,192,127,0.25)' }}
                >
                  Export Excel
                </Button>
              </Stack>
            </Box>



            {/* Filter Bar */}
            <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
                  <Box sx={{ flex: '1 1 220px', minWidth: 200 }}>
                    <TextField
                      fullWidth
                      size="small"
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      placeholder="Search PO, Supplier, Material..."
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchRoundedIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                          </InputAdornment>
                        )
                      }}
                    />
                  </Box>

                  <Box sx={{ flex: '0 0 auto', width: { xs: '100%', sm: '160px' } }}>
                    <TextField
                      fullWidth
                      size="small"
                      select
                      label="Supplier"
                      value={supplierFilter}
                      onChange={e => setSupplierFilter(e.target.value)}
                    >
                      {Array.from(suppliersSet).map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                    </TextField>
                  </Box>

                  <Box sx={{ flex: '0 0 auto', width: { xs: '100%', sm: '180px' } }}>
                    <TextField
                      fullWidth
                      size="small"
                      select
                      label="Due Status"
                      value={statusFilter}
                      onChange={e => setStatusFilter(e.target.value)}
                    >
                      <MenuItem value="All">All Items</MenuItem>
                      <MenuItem value="Pending">Pending Only (Incoming Due)</MenuItem>
                      <MenuItem value="Completed">Completed Only</MenuItem>
                    </TextField>
                  </Box>

                  <Box sx={{ flex: '0 0 auto', width: { xs: '100%', sm: '150px' } }}>
                    <DatePicker
                      label="Start PO Date"
                      format="DD/MM/YYYY"
                      value={startDate}
                      onChange={val => setStartDate(val)}
                      slotProps={{ textField: { size: 'small', fullWidth: true } }}
                    />
                  </Box>

                  <Box sx={{ flex: '0 0 auto', width: { xs: '100%', sm: '150px' } }}>
                    <DatePicker
                      label="End PO Date"
                      format="DD/MM/YYYY"
                      value={endDate}
                      onChange={val => setEndDate(val)}
                      slotProps={{ textField: { size: 'small', fullWidth: true } }}
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Table Card */}
            <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflowX: 'auto' }}>
              <Box className="grid-table-row" sx={{ display: 'grid', gridTemplateColumns: COL_PO_DUE, px: 2.5, py: 1.5, borderBottom: '1px solid', borderColor: 'divider', bgcolor: '#F8F9FC', minWidth: '1150px' }}>
                {['PO Date', 'PO No.', 'Supplier', 'Material Name', 'Color', 'Unit', 'Ordered Qty', 'Received Qty', 'Due Qty', 'Status'].map(h => (
                  <Typography key={h} variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.62rem', textTransform: 'uppercase', textAlign: (h === 'Ordered Qty' || h === 'Received Qty' || h === 'Due Qty') ? 'right' : (h === 'Status' || h === 'Unit') ? 'center' : 'left' }}>
                    {h}
                  </Typography>
                ))}
              </Box>

              <Stack divider={<Divider />} sx={{ minWidth: '1150px' }}>
                {paginatedPoDueRows.length === 0 ? (
                  <Box sx={{ py: 6, textAlign: 'center' }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>No records found matching filters.</Typography>
                  </Box>
                ) : (
                  paginatedPoDueRows.map(row => (
                    <Box key={row.id} className="grid-table-row" sx={{ display: 'grid', gridTemplateColumns: COL_PO_DUE, px: 2.5, py: 1.5, alignItems: 'center', '&:hover': { bgcolor: 'rgba(108,99,255,0.03)' } }}>
                      <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                        {row.date ? dayjs(row.date).format('DD/MM/YYYY') : '—'}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                        {row.poNo}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {row.supplier}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {row.materialName}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {row.color || '—'}
                      </Typography>
                      <Typography variant="caption" sx={{ textAlign: 'center', color: 'text.secondary' }}>
                        {unitLabel(row.unit) || '—'}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, textAlign: 'right' }}>
                        {row.orderedQty.toLocaleString()}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, textAlign: 'right', color: '#00C07F' }}>
                        {row.receivedQty.toLocaleString()}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 800, textAlign: 'right', color: row.dueQty > 0 ? 'error.main' : 'success.main' }}>
                        {row.dueQty.toLocaleString()}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Chip
                          label={row.status}
                          size="small"
                          icon={row.status === 'Fully Received' ? <CheckCircleRoundedIcon style={{ fontSize: 13 }} /> : <ErrorOutlineRoundedIcon style={{ fontSize: 13 }} />}
                          sx={{
                            fontWeight: 700,
                            fontSize: '0.62rem',
                            bgcolor: row.status === 'Fully Received' ? 'rgba(0,192,127,0.1)' : row.status === 'Partially Received' ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)',
                            color: row.status === 'Fully Received' ? '#00C07F' : row.status === 'Partially Received' ? '#F59E0B' : '#EF4444'
                          }}
                        />
                      </Box>
                    </Box>
                  ))
                )}
              </Stack>

              {filteredPoDueRows.length > 20 && (
                <TablePagination
                  component="div"
                  count={filteredPoDueRows.length}
                  page={page}
                  onPageChange={(e, newPage) => setPage(newPage)}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={e => {
                    setRowsPerPage(parseInt(e.target.value, 10))
                    setPage(0)
                  }}
                  rowsPerPageOptions={[20, 50, 100]}
                />
              )}
            </Card>
          </>
        )}

        {activeReport === 'closing-stock' && (
          <>
            {/* Closing Stock Top Toolbar */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>Raw Material / Accessories Closing Stock Report</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>Track current available inventory balance per material per color</Typography>
              </Box>
              <Stack direction="row" spacing={1.5}>
                <Button
                  variant="outlined"
                  color="secondary"
                  startIcon={<PrintRoundedIcon />}
                  onClick={handlePrintStockPDF}
                  sx={{ borderRadius: 2.5, fontWeight: 700, textTransform: 'none' }}
                >
                  Print / PDF
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<FileDownloadRoundedIcon />}
                  onClick={handleExportStockExcel}
                  sx={{ borderRadius: 2.5, fontWeight: 700, textTransform: 'none', boxShadow: '0 4px 14px 0 rgba(0,192,127,0.25)' }}
                >
                  Export Excel
                </Button>
              </Stack>
            </Box>



            {/* Filter Bar */}
            <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      size="small"
                      value={stockSearch}
                      onChange={e => setStockSearch(e.target.value)}
                      placeholder="Search Material Name, Color..."
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchRoundedIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                          </InputAdornment>
                        )
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      size="small"
                      select
                      label="Stock Level Status"
                      value={stockStatusFilter}
                      onChange={e => setStockStatusFilter(e.target.value)}
                    >
                      <MenuItem value="All">All Items</MenuItem>
                      <MenuItem value="InStock">In Stock Only (&gt; 100)</MenuItem>
                      <MenuItem value="LowStock">Low Stock Only (1 - 100)</MenuItem>
                      <MenuItem value="OutOfStock">Out of Stock Only (0 / negative)</MenuItem>
                    </TextField>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Table Card */}
            <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflowX: 'auto' }}>
              <Box className="grid-table-row" sx={{ display: 'grid', gridTemplateColumns: COL_STOCK, px: 2.5, py: 1.5, borderBottom: '1px solid', borderColor: 'divider', bgcolor: '#F8F9FC', minWidth: '1100px' }}>
                {['Material Name', 'Color', 'Unit', 'Opening Qty', 'Ordered Qty', 'Total Received', 'Consumed (Cutting)', 'Issued (Printing)', 'Issued (Stitching)', 'Closing Stock', 'Status'].map(h => (
                  <Typography key={h} variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.62rem', textTransform: 'uppercase', textAlign: (h === 'Total Received' || h === 'Consumed (Cutting)' || h === 'Issued (Printing)' || h === 'Issued (Stitching)' || h === 'Closing Stock' || h === 'Opening Qty' || h === 'Ordered Qty') ? 'right' : (h === 'Unit' || h === 'Status') ? 'center' : 'left' }}>
                    {h}
                  </Typography>
                ))}
              </Box>

              <Stack divider={<Divider />} sx={{ minWidth: '1100px' }}>
                {paginatedStockRows.length === 0 ? (
                  <Box sx={{ py: 6, textAlign: 'center' }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>No records found matching filters.</Typography>
                  </Box>
                ) : (
                  paginatedStockRows.map(row => (
                    <Box key={`${row.name}-${row.color}`} className="grid-table-row" sx={{ display: 'grid', gridTemplateColumns: COL_STOCK, px: 2.5, py: 1.5, alignItems: 'center', '&:hover': { bgcolor: 'rgba(108,99,255,0.03)' } }}>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {row.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {row.color || '—'}
                      </Typography>
                      <Typography variant="caption" sx={{ textAlign: 'center', color: 'text.secondary' }}>
                        {unitLabel(row.unit) || '—'}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, textAlign: 'right', color: 'text.secondary' }}>
                        {row.openingQty.toLocaleString()}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, textAlign: 'right', color: 'text.secondary' }}>
                        {row.orderedQty.toLocaleString()}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, textAlign: 'right' }}>
                        {row.received.toLocaleString()}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, textAlign: 'right', color: 'text.secondary' }}>
                        {row.cutRejection > 0
                          ? `${row.cutConsumed.toLocaleString()} (${row.cutRejection.toLocaleString()} rejected)`
                          : row.cutConsumed.toLocaleString()
                        }
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, textAlign: 'right', color: 'text.secondary' }}>
                        {row.printIssued.toLocaleString()}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, textAlign: 'right', color: 'text.secondary' }}>
                        {row.stitchIssued.toLocaleString()}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 800, textAlign: 'right', color: row.closingStock > 100 ? 'success.main' : row.closingStock > 0 ? 'warning.main' : 'error.main' }}>
                        {row.closingStock.toLocaleString()}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Chip
                          label={row.status}
                          size="small"
                          icon={row.status === 'In Stock' ? <CheckCircleRoundedIcon style={{ fontSize: 13 }} /> : row.status === 'Low Stock' ? <WarningAmberRoundedIcon style={{ fontSize: 13 }} /> : <ErrorOutlineRoundedIcon style={{ fontSize: 13 }} />}
                          sx={{
                            fontWeight: 700,
                            fontSize: '0.62rem',
                            bgcolor: row.status === 'In Stock' ? 'rgba(0,192,127,0.1)' : row.status === 'Low Stock' ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)',
                            color: row.status === 'In Stock' ? '#00C07F' : row.status === 'Low Stock' ? '#F59E0B' : '#EF4444'
                          }}
                        />
                      </Box>
                    </Box>
                  ))
                )}
              </Stack>

              {filteredStockRows.length > 20 && (
                <TablePagination
                  component="div"
                  count={filteredStockRows.length}
                  page={stockPage}
                  onPageChange={(e, newPage) => setStockPage(newPage)}
                  rowsPerPage={stockRowsPerPage}
                  onRowsPerPageChange={e => {
                    setStockRowsPerPage(parseInt(e.target.value, 10))
                    setStockPage(0)
                  }}
                  rowsPerPageOptions={[20, 50, 100]}
                />
              )}
            </Card>
          </>
        )}

        {activeReport === 'production-pipeline' && (
          <>
            {/* Pipeline Report Top Toolbar */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>Fabricator Wise Issue, Received and Due Qty Report</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>Track items issued to stitching fabricators, received back, rejections, and pending due balance</Typography>
              </Box>
              <Stack direction="row" spacing={1.5}>
                <Button
                  variant="outlined"
                  color="secondary"
                  startIcon={<PrintRoundedIcon />}
                  onClick={handlePrintPipelinePDF}
                  sx={{ borderRadius: 2.5, fontWeight: 700, textTransform: 'none' }}
                >
                  Print / PDF
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<FileDownloadRoundedIcon />}
                  onClick={handleExportPipelineExcel}
                  sx={{ borderRadius: 2.5, fontWeight: 700, textTransform: 'none', boxShadow: '0 4px 14px 0 rgba(0,192,127,0.25)' }}
                >
                  Export Excel
                </Button>
              </Stack>
            </Box>

            {/* Filter Bar */}
            <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={8}>
                    <TextField
                      fullWidth
                      size="small"
                      value={pipelineSearch}
                      onChange={e => setPipelineSearch(e.target.value)}
                      placeholder="Search Fabricator, Item, PI..."
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchRoundedIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                          </InputAdornment>
                        )
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Autocomplete
                      size="small"
                      options={['All', ...pipelineAllPIs]}
                      value={pipelinePiFilter}
                      onChange={(e, val) => { setPipelinePiFilter(val || 'All'); setPipelinePage(0) }}
                      renderInput={(params) => (
                        <TextField {...params} label="Filter by PI No." placeholder="Search PI..." />
                      )}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Table Card */}
            <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflowX: 'auto' }}>
              <Box className="grid-table-row" sx={{ display: 'grid', gridTemplateColumns: COL_PIPELINE, px: 2.5, py: 1.5, borderBottom: '1px solid', borderColor: 'divider', bgcolor: '#F8F9FC', minWidth: '1200px' }}>
                {['Fabricator Name', 'Item Name', 'PI No.', 'Total Issued', 'Total Received', 'Rej (Fab)', 'Rej (Fac)', 'Due Qty', 'Status'].map(h => (
                  <Typography key={h} variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.62rem', textTransform: 'uppercase', textAlign: (h === 'Total Issued' || h === 'Total Received' || h === 'Rej (Fab)' || h === 'Rej (Fac)' || h === 'Due Qty') ? 'right' : h === 'Status' ? 'center' : 'left' }}>
                    {h}
                  </Typography>
                ))}
              </Box>

              <Stack divider={<Divider />} sx={{ minWidth: '1200px' }}>
                {paginatedPipelineRows.length === 0 ? (
                  <Box sx={{ py: 6, textAlign: 'center' }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>No records found matching search query.</Typography>
                  </Box>
                ) : (
                  paginatedPipelineRows.map((row, rIdx) => (
                    <Box key={rIdx} className="grid-table-row" sx={{ display: 'grid', gridTemplateColumns: COL_PIPELINE, px: 2.5, py: 1.5, alignItems: 'center', '&:hover': { bgcolor: 'rgba(108,99,255,0.03)' } }}>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {row.fabricatorName}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                        {row.itemNo}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {row.piNo}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, textAlign: 'right' }}>
                        {row.totalIssued.toLocaleString()}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, textAlign: 'right' }}>
                        {row.totalReceived.toLocaleString()}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, textAlign: 'right', color: row.rejFab > 0 ? 'error.main' : 'text.disabled' }}>
                        {row.rejFab.toLocaleString()}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, textAlign: 'right', color: row.rejFac > 0 ? 'warning.main' : 'text.disabled' }}>
                        {row.rejFac.toLocaleString()}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 800, textAlign: 'right', color: row.closingStock > 0 ? 'error.main' : 'success.main' }}>
                        {row.closingStock.toLocaleString()}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Chip
                          label={row.status}
                          size="small"
                          icon={row.status === 'Completed' ? <CheckCircleRoundedIcon style={{ fontSize: 13 }} /> : <WarningAmberRoundedIcon style={{ fontSize: 13 }} />}
                          sx={{
                            fontWeight: 700,
                            fontSize: '0.62rem',
                            bgcolor: row.status === 'Completed' ? 'rgba(0,192,127,0.1)' : 'rgba(239,68,68,0.1)',
                            color: row.status === 'Completed' ? '#00C07F' : '#EF4444'
                          }}
                        />
                      </Box>
                    </Box>
                  ))
                )}
              </Stack>

              {filteredPipelineRows.length > 20 && (
                <TablePagination
                  component="div"
                  count={filteredPipelineRows.length}
                  page={pipelinePage}
                  onPageChange={(e, newPage) => setPipelinePage(newPage)}
                  rowsPerPage={pipelineRowsPerPage}
                  onRowsPerPageChange={e => {
                    setPipelineRowsPerPage(parseInt(e.target.value, 10))
                    setPipelinePage(0)
                  }}
                  rowsPerPageOptions={[20, 50, 100]}
                />
              )}
            </Card>
          </>
        )}

        {activeReport === 'cutting-issue' && (
          <>
            {/* Cutting Issue Report Top Toolbar */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>Closing Stock / Cutting Issue due to Fabricator/Printing </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>Track cut panels, printing issues, fabricator issues, and pending closing stock</Typography>
              </Box>
              <Stack direction="row" spacing={1.5}>
                <Button
                  variant="outlined"
                  color="secondary"
                  startIcon={<PrintRoundedIcon />}
                  onClick={handlePrintCutIssuePDF}
                  sx={{ borderRadius: 2.5, fontWeight: 700, textTransform: 'none' }}
                >
                  Print / PDF
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<FileDownloadRoundedIcon />}
                  onClick={handleExportCutIssueExcel}
                  sx={{ borderRadius: 2.5, fontWeight: 700, textTransform: 'none', boxShadow: '0 4px 14px 0 rgba(0,192,127,0.25)' }}
                >
                  Export Excel
                </Button>
              </Stack>
            </Box>

            {/* Filter Bar */}
            <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      size="small"
                      value={cutIssueSearch}
                      onChange={e => setCutIssueSearch(e.target.value)}
                      placeholder="Search Item, PI..."
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchRoundedIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                          </InputAdornment>
                        )
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Autocomplete
                      size="small"
                      options={['All', ...cutIssueAllPIs]}
                      value={cutIssuePiFilter}
                      onChange={(e, val) => { setCutIssuePiFilter(val || 'All'); setCutIssuePage(0) }}
                      renderInput={(params) => (
                        <TextField {...params} label="Filter by PI No." placeholder="Search PI..." />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <TextField
                      fullWidth
                      select
                      size="small"
                      label="Filter by Type"
                      value={cutIssueTypeFilter}
                      onChange={e => { setCutIssueTypeFilter(e.target.value); setCutIssuePage(0) }}
                    >
                      <MenuItem value="All">All</MenuItem>
                      <MenuItem value="Printer">Printer</MenuItem>
                      <MenuItem value="Fabricator">Fabricator</MenuItem>
                    </TextField>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Table Card */}
            {(() => {
              const colTemplate = cutIssueTypeFilter === 'All'
                ? '2fr 1.5fr 1.5fr 1.5fr 1.5fr 1.5fr 100px'
                : '2fr 1.5fr 1.5fr 1.5fr 1.5fr 100px';

              const tableHeaders = ['Item Name', 'PI No.', 'Cutting Received'];
              if (cutIssueTypeFilter === 'All' || cutIssueTypeFilter === 'Printer') {
                tableHeaders.push('Printing Issue');
              }
              if (cutIssueTypeFilter === 'All' || cutIssueTypeFilter === 'Fabricator') {
                tableHeaders.push('Fabricator Issue');
              }
              tableHeaders.push('Closing Stock (Due)', 'Status');

              return (
                <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflowX: 'auto' }}>
                  <Box className="grid-table-row" sx={{ display: 'grid', gridTemplateColumns: colTemplate, px: 2.5, py: 1.5, borderBottom: '1px solid', borderColor: 'divider', bgcolor: '#F8F9FC', minWidth: '1000px' }}>
                    {tableHeaders.map(h => (
                      <Typography key={h} variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.62rem', textTransform: 'uppercase', textAlign: (h === 'Cutting Received' || h === 'Printing Issue' || h === 'Fabricator Issue' || h === 'Closing Stock (Due)') ? 'right' : h === 'Status' ? 'center' : 'left' }}>
                        {h}
                      </Typography>
                    ))}
                  </Box>

                  <Stack divider={<Divider />} sx={{ minWidth: '1000px' }}>
                    {paginatedCutIssueRows.length === 0 ? (
                      <Box sx={{ py: 6, textAlign: 'center' }}>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>No records found matching search query.</Typography>
                      </Box>
                    ) : (
                      paginatedCutIssueRows.map((row, rIdx) => (
                        <Box key={rIdx} className="grid-table-row" sx={{ display: 'grid', gridTemplateColumns: colTemplate, px: 2.5, py: 1.5, alignItems: 'center', '&:hover': { bgcolor: 'rgba(124,58,237,0.03)' } }}>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>{row.itemNo}</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{row.piNo}</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600, textAlign: 'right' }}>{row.cuttingReceived.toLocaleString()}</Typography>
                          
                          {(cutIssueTypeFilter === 'All' || cutIssueTypeFilter === 'Printer') && (
                            <Typography variant="body2" sx={{ fontWeight: 600, textAlign: 'right' }}>{row.printingIssue.toLocaleString()}</Typography>
                          )}
                          {(cutIssueTypeFilter === 'All' || cutIssueTypeFilter === 'Fabricator') && (
                            <Typography variant="body2" sx={{ fontWeight: 600, textAlign: 'right' }}>{row.fabricatorIssue.toLocaleString()}</Typography>
                          )}
                          
                          <Typography variant="body2" sx={{ fontWeight: 800, textAlign: 'right', color: row.closingStock > 0 ? 'error.main' : 'success.main' }}>{row.closingStock.toLocaleString()}</Typography>
                          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                            <Chip
                              label={row.status} size="small"
                              icon={row.status === 'Completed' ? <CheckCircleRoundedIcon style={{ fontSize: 13 }} /> : <WarningAmberRoundedIcon style={{ fontSize: 13 }} />}
                              sx={{ fontWeight: 700, fontSize: '0.62rem', bgcolor: row.status === 'Completed' ? 'rgba(0,192,127,0.1)' : 'rgba(239,68,68,0.1)', color: row.status === 'Completed' ? '#00C07F' : '#EF4444' }}
                            />
                          </Box>
                        </Box>
                      ))
                    )}
                  </Stack>

                  {filteredCutIssueRows.length > 20 && (
                    <TablePagination
                      component="div"
                      count={filteredCutIssueRows.length}
                      page={cutIssuePage}
                      onPageChange={(e, newPage) => setCutIssuePage(newPage)}
                      rowsPerPage={cutIssueRowsPerPage}
                      onRowsPerPageChange={e => { setCutIssueRowsPerPage(parseInt(e.target.value, 10)); setCutIssuePage(0) }}
                      rowsPerPageOptions={[20, 50, 100]}
                    />
                  )}
                </Card>
              )
            })()}
          </>
        )}

        {activeReport === 'print-fabricator' && (
          <>
            {/* Print Fabricator Report Top Toolbar */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>Closing Stock / Printing Issue due to Fabricator</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>Track printed panels received and stitching issues, and closing balance due</Typography>
              </Box>
              <Stack direction="row" spacing={1.5}>
                <Button variant="outlined" color="secondary" startIcon={<PrintRoundedIcon />} onClick={handlePrintPrintFabPDF} sx={{ borderRadius: 2.5, fontWeight: 700, textTransform: 'none' }}>Print / PDF</Button>
                <Button variant="contained" color="success" startIcon={<FileDownloadRoundedIcon />} onClick={handleExportPrintFabExcel} sx={{ borderRadius: 2.5, fontWeight: 700, textTransform: 'none', boxShadow: '0 4px 14px 0 rgba(0,192,127,0.25)' }}>Export Excel</Button>
              </Stack>
            </Box>

            {/* Filter Bar */}
            <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={8}>
                    <TextField
                      fullWidth size="small"
                      value={printFabSearch}
                      onChange={e => setPrintFabSearch(e.target.value)}
                      placeholder="Search Item, PI..."
                      InputProps={{ startAdornment: (<InputAdornment position="start"><SearchRoundedIcon sx={{ color: 'text.secondary', fontSize: 20 }} /></InputAdornment>) }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Autocomplete
                      size="small"
                      options={['All', ...printFabAllPIs]}
                      value={printFabPiFilter}
                      onChange={(e, val) => { setPrintFabPiFilter(val || 'All'); setPrintFabPage(0) }}
                      renderInput={(params) => <TextField {...params} label="Filter by PI No." placeholder="Search PI..." />}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Table */}
            <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflowX: 'auto' }}>
              <Box className="grid-table-row" sx={{ display: 'grid', gridTemplateColumns: COL_PRINTING_DUE, px: 2.5, py: 1.5, borderBottom: '1px solid', borderColor: 'divider', bgcolor: '#F8F9FC', minWidth: '1000px' }}>
                {['Item Name', 'PI No.', 'Printing Received', 'Stitching Issue', 'Due Qty', 'Status'].map(h => (
                  <Typography key={h} variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.62rem', textTransform: 'uppercase', textAlign: (h === 'Printing Received' || h === 'Stitching Issue' || h === 'Due Qty') ? 'right' : h === 'Status' ? 'center' : 'left' }}>
                    {h}
                  </Typography>
                ))}
              </Box>

              <Stack divider={<Divider />} sx={{ minWidth: '1000px' }}>
                {paginatedPrintFabRows.length === 0 ? (
                  <Box sx={{ py: 6, textAlign: 'center' }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>No records found matching search query.</Typography>
                  </Box>
                ) : (
                  paginatedPrintFabRows.map((row, rIdx) => (
                    <Box key={rIdx} className="grid-table-row" sx={{ display: 'grid', gridTemplateColumns: COL_PRINTING_DUE, px: 2.5, py: 1.5, alignItems: 'center', '&:hover': { bgcolor: 'rgba(108,99,255,0.03)' } }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>{row.itemNo}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{row.piNo}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, textAlign: 'right' }}>{row.printingReceived.toLocaleString()}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, textAlign: 'right' }}>{row.stitchingIssue.toLocaleString()}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 800, textAlign: 'right', color: row.dueQty > 0 ? 'error.main' : 'success.main' }}>{row.dueQty.toLocaleString()}</Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Chip
                          label={row.status} size="small"
                          icon={row.status === 'Completed' ? <CheckCircleRoundedIcon style={{ fontSize: 13 }} /> : <WarningAmberRoundedIcon style={{ fontSize: 13 }} />}
                          sx={{ fontWeight: 700, fontSize: '0.62rem', bgcolor: row.status === 'Completed' ? 'rgba(0,192,127,0.1)' : 'rgba(239,68,68,0.1)', color: row.status === 'Completed' ? '#00C07F' : '#EF4444' }}
                        />
                      </Box>
                    </Box>
                  ))
                )}
              </Stack>

              {filteredPrintFabRows.length > 20 && (
                <TablePagination
                  component="div"
                  count={filteredPrintFabRows.length}
                  page={printFabPage}
                  onPageChange={(e, newPage) => setPrintFabPage(newPage)}
                  rowsPerPage={printFabRowsPerPage}
                  onRowsPerPageChange={e => { setPrintFabRowsPerPage(parseInt(e.target.value, 10)); setPrintFabPage(0) }}
                  rowsPerPageOptions={[20, 50, 100]}
                />
              )}
            </Card>
          </>
        )}

        {activeReport === 'finished-goods' && (
          <>
            {/* Finished Goods Report Top Toolbar */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>Closing Stock of Finished Goods / PI Wise</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>Track packed bags ready for dispatch vs already shipped — closing inventory per PI</Typography>
              </Box>
              <Stack direction="row" spacing={1.5}>
                <Button variant="outlined" color="secondary" startIcon={<PrintRoundedIcon />} onClick={handlePrintFgPDF} sx={{ borderRadius: 2.5, fontWeight: 700, textTransform: 'none' }}>Print / PDF</Button>
                <Button variant="contained" color="success" startIcon={<FileDownloadRoundedIcon />} onClick={handleExportFgExcel} sx={{ borderRadius: 2.5, fontWeight: 700, textTransform: 'none', boxShadow: '0 4px 14px 0 rgba(0,192,127,0.25)' }}>Export Excel</Button>
              </Stack>
            </Box>

            {/* Filter Bar */}
            <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={8}>
                    <TextField
                      fullWidth size="small"
                      value={fgSearch}
                      onChange={e => setFgSearch(e.target.value)}
                      placeholder="Search PI No, Buyer Name, Item Name..."
                      InputProps={{ startAdornment: (<InputAdornment position="start"><SearchRoundedIcon sx={{ color: 'text.secondary', fontSize: 20 }} /></InputAdornment>) }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Autocomplete
                      size="small"
                      options={['All', ...fgAllPIs]}
                      value={fgPiFilter}
                      onChange={(e, val) => { setFgPiFilter(val || 'All'); setFgPage(0) }}
                      renderInput={(params) => <TextField {...params} label="Filter by PI No." placeholder="Search PI..." />}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Table */}
            <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflowX: 'auto' }}>
              <Box className="grid-table-row" sx={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 1.2fr 75px 75px 100px 105px 100px 110px 105px 90px 120px 105px 105px 110px', px: 2.5, py: 1.5, borderBottom: '1px solid', borderColor: 'divider', bgcolor: '#F8F9FC', minWidth: '1700px' }}>
                {['PI No.', 'Buyer Name', 'Item Name', 'PI Qty', 'Cut Qty', 'Print Issued', 'Print Recv.', 'Stitch Issued', 'Stitch Recv.', 'Finished (Packed)', 'Finish Rej.', 'Shipped Qty', 'Pending to Finish', 'Closing Stock', 'Status'].map(h => (
                  <Typography key={h} variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.60rem', textTransform: 'uppercase', textAlign: (['PI Qty','Cut Qty','Print Issued','Print Recv.','Stitch Issued','Stitch Recv.','Finished (Packed)','Finish Rej.','Shipped Qty','Pending to Finish','Closing Stock'].includes(h)) ? 'right' : h === 'Status' ? 'center' : 'left' }}>
                    {h}
                  </Typography>
                ))}
              </Box>

              <Stack divider={<Divider />} sx={{ minWidth: '1700px' }}>
                {paginatedFgRows.length === 0 ? (
                  <Box sx={{ py: 6, textAlign: 'center' }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>No records found matching filters.</Typography>
                  </Box>
                ) : (
                  paginatedFgRows.map((row, rIdx) => (
                    <Box key={rIdx} className="grid-table-row" sx={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 1.2fr 75px 75px 100px 105px 100px 110px 105px 90px 120px 105px 105px 110px', px: 2.5, py: 1.5, alignItems: 'center', '&:hover': { bgcolor: 'rgba(5,150,105,0.03)' } }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>{row.piNo}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{row.buyerName}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>{row.itemNo}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, textAlign: 'right' }}>{row.piQty.toLocaleString()}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, textAlign: 'right' }}>{row.cutQty.toLocaleString()}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, textAlign: 'right', color: row.printingIssued > 0 ? '#4F46E5' : 'text.disabled' }}>{row.printingIssued.toLocaleString()}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, textAlign: 'right', color: row.printingReceived > 0 ? '#6366F1' : 'text.disabled' }}>{row.printingReceived.toLocaleString()}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, textAlign: 'right', color: row.stitchingIssued > 0 ? '#7C3AED' : 'text.disabled' }}>{row.stitchingIssued.toLocaleString()}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, textAlign: 'right', color: row.stitchingReceived > 0 ? '#A855F7' : 'text.disabled' }}>{row.stitchingReceived.toLocaleString()}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, textAlign: 'right' }}>{row.finishedQty.toLocaleString()}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, textAlign: 'right', color: row.finishRejection > 0 ? 'error.main' : 'text.disabled' }}>{row.finishRejection.toLocaleString()}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, textAlign: 'right', color: '#00A06B' }}>{row.shippedQty.toLocaleString()}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, textAlign: 'right', color: row.pendingFinish > 0 ? 'warning.main' : 'text.disabled' }}>{row.pendingFinish.toLocaleString()}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 800, textAlign: 'right', color: row.closingStock > 0 ? 'success.main' : 'text.disabled' }}>{row.closingStock.toLocaleString()}</Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Chip
                          label={row.status} size="small"
                          icon={
                            row.status === 'In Stock' ? <CheckCircleRoundedIcon style={{ fontSize: 13 }} /> :
                            row.status === 'Not Finished' ? <WarningAmberRoundedIcon style={{ fontSize: 13 }} /> :
                            <ErrorOutlineRoundedIcon style={{ fontSize: 13 }} />
                          }
                          sx={{
                            fontWeight: 700,
                            fontSize: '0.62rem',
                            bgcolor: row.status === 'In Stock' ? 'rgba(5,150,105,0.1)' : row.status === 'Not Finished' ? 'rgba(245,158,11,0.1)' : 'rgba(107,114,128,0.1)',
                            color: row.status === 'In Stock' ? '#059669' : row.status === 'Not Finished' ? '#F59E0B' : '#6B7280'
                          }}
                        />
                      </Box>
                    </Box>
                  ))
                )}
              </Stack>

              {filteredFgRows.length > 20 && (
                <TablePagination
                  component="div"
                  count={filteredFgRows.length}
                  page={fgPage}
                  onPageChange={(e, newPage) => setFgPage(newPage)}
                  rowsPerPage={fgRowsPerPage}
                  onRowsPerPageChange={e => { setFgRowsPerPage(parseInt(e.target.value, 10)); setFgPage(0) }}
                  rowsPerPageOptions={[20, 50, 100]}
                />
              )}
            </Card>
          </>
        )}

        {activeReport === 'buyer-status' && (
          <>
            {/* Buyer Wise Report Top Toolbar */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>Buyer wise status of order received, qty shipped and shipment due report</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>Track overall order quantity received from buyers, total shipped, pending shipment due balance and order status</Typography>
              </Box>
              <Stack direction="row" spacing={1.5}>
                <Button
                  variant="outlined"
                  color="secondary"
                  startIcon={<PrintRoundedIcon />}
                  onClick={handlePrintBuyerPDF}
                  sx={{ borderRadius: 2.5, fontWeight: 700, textTransform: 'none' }}
                >
                  Print / PDF
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<FileDownloadRoundedIcon />}
                  onClick={handleExportBuyerExcel}
                  sx={{ borderRadius: 2.5, fontWeight: 700, textTransform: 'none', boxShadow: '0 4px 14px 0 rgba(2,132,199,0.25)' }}
                >
                  Export Excel
                </Button>
              </Stack>
            </Box>

            {/* Filter Bar */}
            <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      size="small"
                      value={buyerSearch}
                      onChange={e => setBuyerSearch(e.target.value)}
                      placeholder="Search Buyer Name..."
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchRoundedIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                          </InputAdornment>
                        )
                      }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Table */}
            <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflowX: 'auto' }}>
              <Box className="grid-table-row" sx={{ display: 'grid', gridTemplateColumns: COL_BUYER_STATUS, px: 2.5, py: 1.5, borderBottom: '1px solid', borderColor: 'divider', bgcolor: '#F8F9FC', minWidth: '1000px' }}>
                {['Buyer Name', 'Total Items (Types)', 'Total Orders (PI Count)', 'Total Order Received Qty', 'Total Qty Shipped', 'Shipment Due Qty', 'Status'].map(h => (
                  <Typography key={h} variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.62rem', textTransform: 'uppercase', textAlign: (['Total Items (Types)', 'Total Orders (PI Count)', 'Total Order Received Qty', 'Total Qty Shipped', 'Shipment Due Qty'].includes(h)) ? 'right' : h === 'Status' ? 'center' : 'left' }}>
                    {h}
                  </Typography>
                ))}
              </Box>

              <Stack divider={<Divider />} sx={{ minWidth: '1000px' }}>
                {paginatedBuyerRows.length === 0 ? (
                  <Box sx={{ py: 6, textAlign: 'center' }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>No records found matching search query.</Typography>
                  </Box>
                ) : (
                  paginatedBuyerRows.map((row, rIdx) => (
                    <Box key={rIdx} className="grid-table-row" sx={{ display: 'grid', gridTemplateColumns: COL_BUYER_STATUS, px: 2.5, py: 1.5, alignItems: 'center', '&:hover': { bgcolor: 'rgba(2,132,199,0.03)' } }}>
                      <Typography
                        variant="body2"
                        onClick={() => setSelectedBuyerDetails(row)}
                        sx={{
                          fontWeight: 700,
                          color: 'primary.main',
                          cursor: 'pointer',
                          textDecoration: 'underline',
                          '&:hover': { color: 'primary.dark' }
                        }}
                      >
                        {row.buyerName}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, textAlign: 'right' }}>{row.itemTypesCount.toLocaleString()}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, textAlign: 'right' }}>{row.piCount.toLocaleString()}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, textAlign: 'right' }}>{row.totalOrderQty.toLocaleString()}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, textAlign: 'right', color: '#00A06B' }}>{row.totalShippedQty.toLocaleString()}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 800, textAlign: 'right', color: row.shipmentDueQty > 0 ? 'error.main' : 'success.main' }}>{row.shipmentDueQty.toLocaleString()}</Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Chip
                          label={row.status} size="small"
                          icon={
                            row.status === 'Completed' ? <CheckCircleRoundedIcon style={{ fontSize: 13 }} /> :
                            row.status === 'Partial' ? <WarningAmberRoundedIcon style={{ fontSize: 13 }} /> :
                            <ErrorOutlineRoundedIcon style={{ fontSize: 13 }} />
                          }
                          sx={{
                            fontWeight: 700,
                            fontSize: '0.62rem',
                            bgcolor: row.status === 'Completed' ? 'rgba(0,192,127,0.1)' : row.status === 'Partial' ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)',
                            color: row.status === 'Completed' ? '#00C07F' : row.status === 'Partial' ? '#F59E0B' : '#EF4444'
                          }}
                        />
                      </Box>
                    </Box>
                  ))
                )}
              </Stack>

              {filteredBuyerRows.length > 20 && (
                <TablePagination
                  component="div"
                  count={filteredBuyerRows.length}
                  page={buyerPage}
                  onPageChange={(e, newPage) => setBuyerPage(newPage)}
                  rowsPerPage={buyerRowsPerPage}
                  onRowsPerPageChange={e => { setBuyerRowsPerPage(parseInt(e.target.value, 10)); setBuyerPage(0) }}
                  rowsPerPageOptions={[20, 50, 100]}
                />
              )}
            </Card>

            {/* Drilldown Dialog for Buyer Items Details */}
            <Dialog
              open={Boolean(selectedBuyerDetails)}
              onClose={() => setSelectedBuyerDetails(null)}
              maxWidth="md"
              fullWidth
              PaperProps={{ sx: { borderRadius: 3 } }}
            >
              <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>Items Breakdown</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>Buyer Name: <strong>{selectedBuyerDetails?.buyerName}</strong></Typography>
                </Box>
                <IconButton onClick={() => setSelectedBuyerDetails(null)} size="small">
                  <CloseRoundedIcon />
                </IconButton>
              </DialogTitle>

              <DialogContent dividers sx={{ p: 0 }}>
                <Box sx={{ minWidth: '700px' }}>
                  {/* Table Header */}
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1.5fr 2fr 1.5fr 1.5fr 1.5fr 1fr', px: 3, py: 1.5, bgcolor: '#F8F9FC', borderBottom: '1px solid', borderColor: 'divider' }}>
                    {['PI No.', 'Item Name', 'Order Qty', 'Qty Shipped', 'Shipment Due Qty', 'Status'].map(h => (
                      <Typography key={h} variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.62rem', textTransform: 'uppercase', textAlign: (['Order Qty', 'Qty Shipped', 'Shipment Due Qty'].includes(h)) ? 'right' : h === 'Status' ? 'center' : 'left' }}>
                        {h}
                      </Typography>
                    ))}
                  </Box>

                  {/* Table Body */}
                  <Stack divider={<Divider />}>
                    {selectedBuyerDetails?.details?.map((item, idx) => (
                      <Box key={idx} sx={{ display: 'grid', gridTemplateColumns: '1.5fr 2fr 1.5fr 1.5fr 1.5fr 1fr', px: 3, py: 1.5, alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{item.piNo}</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>{item.itemNo}</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, textAlign: 'right' }}>{item.qty.toLocaleString()}</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, textAlign: 'right', color: '#00A06B' }}>{item.shippedQty.toLocaleString()}</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 800, textAlign: 'right', color: item.dueQty > 0 ? 'error.main' : 'success.main' }}>{item.dueQty.toLocaleString()}</Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                          <Chip
                            label={item.status} size="small"
                            icon={
                              item.status === 'Completed' ? <CheckCircleRoundedIcon style={{ fontSize: 11 }} /> :
                              item.status === 'Partial' ? <WarningAmberRoundedIcon style={{ fontSize: 11 }} /> :
                              <ErrorOutlineRoundedIcon style={{ fontSize: 11 }} />
                            }
                            sx={{
                              fontWeight: 700,
                              fontSize: '0.6rem',
                              height: 20,
                              bgcolor: item.status === 'Completed' ? 'rgba(0,192,127,0.1)' : item.status === 'Partial' ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)',
                              color: item.status === 'Completed' ? '#00C07F' : item.status === 'Partial' ? '#F59E0B' : '#EF4444'
                            }}
                          />
                        </Box>
                      </Box>
                    ))}
                  </Stack>
                </Box>
              </DialogContent>

              <DialogActions sx={{ p: 2, justifyContent: 'space-between', bgcolor: '#F8F9FC' }}>
                <Box sx={{ display: 'flex', gap: 3 }}>
                  <Typography variant="body2">Total Orders: <strong>{selectedBuyerDetails?.totalOrderQty?.toLocaleString()}</strong></Typography>
                  <Typography variant="body2">Total Shipped: <strong>{selectedBuyerDetails?.totalShippedQty?.toLocaleString()}</strong></Typography>
                  <Typography variant="body2" sx={{ color: (selectedBuyerDetails?.shipmentDueQty || 0) > 0 ? 'error.main' : 'success.main' }}>Total Due: <strong>{selectedBuyerDetails?.shipmentDueQty?.toLocaleString()}</strong></Typography>
                </Box>
                <Button variant="outlined" onClick={() => setSelectedBuyerDetails(null)} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}>Close</Button>
              </DialogActions>
            </Dialog>
          </>
        )}

        {activeReport === 'shipment-schedule' && (
          <>
            {/* Shipment Schedule Report Top Toolbar */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>Shipment Schedule — Date wise</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>Date-wise schedule of pending and completed shipments sorted by delivery date</Typography>
              </Box>
              <Stack direction="row" spacing={1.5}>
                <Button variant="outlined" color="secondary" startIcon={<PrintRoundedIcon />} onClick={handlePrintSchedulePDF} sx={{ borderRadius: 2.5, fontWeight: 700, textTransform: 'none' }}>Print / PDF</Button>
                <Button variant="contained" color="success" startIcon={<FileDownloadRoundedIcon />} onClick={handleExportScheduleExcel} sx={{ borderRadius: 2.5, fontWeight: 700, textTransform: 'none', boxShadow: '0 4px 14px 0 rgba(124,58,237,0.25)' }}>Export Excel</Button>
              </Stack>
            </Box>

            {/* Filter Bar */}
            <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth size="small"
                      value={scheduleSearch}
                      onChange={e => setScheduleSearch(e.target.value)}
                      placeholder="Search PI No., Buyer, Item..."
                      InputProps={{ startAdornment: <InputAdornment position="start"><SearchRoundedIcon sx={{ color: 'text.secondary', fontSize: 20 }} /></InputAdornment> }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <DatePicker
                      label="From Date"
                      value={scheduleStartDate}
                      onChange={val => setScheduleStartDate(val)}
                      slotProps={{ textField: { size: 'small', fullWidth: true } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <DatePicker
                      label="To Date"
                      value={scheduleEndDate}
                      onChange={val => setScheduleEndDate(val)}
                      slotProps={{ textField: { size: 'small', fullWidth: true } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <Button fullWidth variant="outlined" onClick={() => { setScheduleStartDate(null); setScheduleEndDate(null); setScheduleSearch('') }} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}>Clear</Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>


            {/* Table */}
            <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflowX: 'auto' }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: '130px 130px 2fr 2fr 1.2fr 1.2fr 1.3fr 120px', px: 2.5, py: 1.5, borderBottom: '1px solid', borderColor: 'divider', bgcolor: '#F8F9FC', minWidth: '1100px' }}>
                {['Delivery Date', 'PI No.', 'Buyer Name', 'Item Name', 'Order Qty', 'Qty Shipped', 'Shipment Due Qty', 'Status'].map(h => (
                  <Typography key={h} variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.62rem', textTransform: 'uppercase', textAlign: (['Order Qty', 'Qty Shipped', 'Shipment Due Qty'].includes(h)) ? 'right' : h === 'Status' ? 'center' : 'left' }}>
                    {h}
                  </Typography>
                ))}
              </Box>

              <Stack divider={<Divider />} sx={{ minWidth: '1100px' }}>
                {paginatedScheduleRows.length === 0 ? (
                  <Box sx={{ py: 6, textAlign: 'center' }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>No records found matching your filters.</Typography>
                  </Box>
                ) : (
                  paginatedScheduleRows.map((row, rIdx) => (
                    <Box key={rIdx} sx={{ display: 'grid', gridTemplateColumns: '130px 130px 2fr 2fr 1.2fr 1.2fr 1.3fr 120px', px: 2.5, py: 1.5, alignItems: 'center', bgcolor: row.status === 'Delayed' ? 'rgba(239,68,68,0.03)' : 'transparent', '&:hover': { bgcolor: 'rgba(124,58,237,0.03)' } }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: row.status === 'Delayed' ? 'error.main' : 'text.primary' }}>
                        {row.deliveryDate ? dayjs(row.deliveryDate).format('DD/MM/YYYY') : '—'}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#7C3AED' }}>{row.piNo}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{row.buyerName}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>{row.itemNo}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, textAlign: 'right' }}>{row.orderQty.toLocaleString()}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, textAlign: 'right', color: '#00A06B' }}>{row.shippedQty.toLocaleString()}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 800, textAlign: 'right', color: row.dueQty > 0 ? 'error.main' : 'success.main' }}>{row.dueQty.toLocaleString()}</Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Chip
                          label={row.status} size="small"
                          icon={
                            row.status === 'Shipped' ? <CheckCircleRoundedIcon style={{ fontSize: 12 }} /> :
                            row.status === 'Delayed' ? <ErrorOutlineRoundedIcon style={{ fontSize: 12 }} /> :
                            row.status === 'Partially Shipped' ? <WarningAmberRoundedIcon style={{ fontSize: 12 }} /> :
                            <WarningAmberRoundedIcon style={{ fontSize: 12 }} />
                          }
                          sx={{
                            fontWeight: 700, fontSize: '0.6rem',
                            bgcolor: row.status === 'Shipped' ? 'rgba(0,192,127,0.1)' : row.status === 'Delayed' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
                            color: row.status === 'Shipped' ? '#00C07F' : row.status === 'Delayed' ? '#EF4444' : '#F59E0B'
                          }}
                        />
                      </Box>
                    </Box>
                  ))
                )}
              </Stack>

              {filteredScheduleRows.length > 20 && (
                <TablePagination
                  component="div"
                  count={filteredScheduleRows.length}
                  page={schedulePage}
                  onPageChange={(e, newPage) => setSchedulePage(newPage)}
                  rowsPerPage={scheduleRowsPerPage}
                  onRowsPerPageChange={e => { setScheduleRowsPerPage(parseInt(e.target.value, 10)); setSchedulePage(0) }}
                  rowsPerPageOptions={[20, 50, 100]}
                />
              )}
            </Card>
          </>
        )}

        {activeReport === 'pi-qc' && (
          <>
            {/* PI QC Report Top Toolbar */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>PI Wise QC Report</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>Quality control metrics showing finishing quantities alongside rejections across printing, stitching, and finishing</Typography>
              </Box>
              <Stack direction="row" spacing={1.5}>
                <Button variant="outlined" color="secondary" startIcon={<PrintRoundedIcon />} onClick={handlePrintQcPDF} sx={{ borderRadius: 2.5, fontWeight: 700, textTransform: 'none' }}>Print / PDF</Button>
                <Button variant="contained" color="success" startIcon={<FileDownloadRoundedIcon />} onClick={handleExportQcExcel} sx={{ borderRadius: 2.5, fontWeight: 700, textTransform: 'none', boxShadow: '0 4px 14px 0 rgba(220,38,38,0.25)' }}>Export Excel</Button>
              </Stack>
            </Box>

            {/* Filter Bar */}
            <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth size="small"
                      value={qcSearch}
                      onChange={e => setQcSearch(e.target.value)}
                      placeholder="Search PI No., Buyer, Item..."
                      InputProps={{ startAdornment: <InputAdornment position="start"><SearchRoundedIcon sx={{ color: 'text.secondary', fontSize: 20 }} /></InputAdornment> }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Table */}
            <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflowX: 'auto' }}>
              <Box className="grid-table-row" sx={{ display: 'grid', gridTemplateColumns: COL_QC, px: 2.5, py: 1.5, borderBottom: '1px solid', borderColor: 'divider', bgcolor: '#F8F9FC', minWidth: '1200px' }}>
                {['PI No.', 'Buyer Name', 'Item Name', 'Finished Qty', 'Print Rej', 'Stitch Rej', 'Finish Rej', 'Total Rejections', 'Rej %', 'QC Checked By'].map(h => (
                  <Typography key={h} variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.62rem', textTransform: 'uppercase', textAlign: (['Finished Qty', 'Print Rej', 'Stitch Rej', 'Finish Rej', 'Total Rejections', 'Rej %'].includes(h)) ? 'right' : 'left' }}>
                    {h}
                  </Typography>
                ))}
              </Box>

              <Stack divider={<Divider />} sx={{ minWidth: '1200px' }}>
                {paginatedQcRows.length === 0 ? (
                  <Box sx={{ py: 6, textAlign: 'center' }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>No records found matching search query.</Typography>
                  </Box>
                ) : (
                  paginatedQcRows.map((row, rIdx) => (
                    <Box key={rIdx} className="grid-table-row" sx={{ display: 'grid', gridTemplateColumns: COL_QC, px: 2.5, py: 1.5, alignItems: 'center', '&:hover': { bgcolor: 'rgba(220,38,38,0.03)' } }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: 'error.main' }}>{row.piNo}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{row.buyerName}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>{row.itemNo}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, textAlign: 'right' }}>{row.finishedQty.toLocaleString()}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, textAlign: 'right', color: row.printRej > 0 ? 'error.main' : 'text.disabled' }}>{row.printRej.toLocaleString()}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, textAlign: 'right', color: row.stitchRej > 0 ? 'error.main' : 'text.disabled' }}>{row.stitchRej.toLocaleString()}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, textAlign: 'right', color: row.finishRej > 0 ? 'error.main' : 'text.disabled' }}>{row.finishRej.toLocaleString()}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, textAlign: 'right', color: row.totalRej > 0 ? 'error.main' : 'success.main' }}>{row.totalRej.toLocaleString()}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 800, textAlign: 'right', color: row.rejPercentage > 5 ? 'error.main' : 'text.primary' }}>{row.rejPercentage.toFixed(2)}%</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{row.qcCheckersStr}</Typography>
                    </Box>
                  ))
                )}
              </Stack>

              {filteredQcRows.length > 20 && (
                <TablePagination
                  component="div"
                  count={filteredQcRows.length}
                  page={qcPage}
                  onPageChange={(e, newPage) => setQcPage(newPage)}
                  rowsPerPage={qcRowsPerPage}
                  onRowsPerPageChange={e => { setQcRowsPerPage(parseInt(e.target.value, 10)); setQcPage(0) }}
                  rowsPerPageOptions={[20, 50, 100]}
                />
              )}
            </Card>
          </>
        )}
    </Box>
  )
}
