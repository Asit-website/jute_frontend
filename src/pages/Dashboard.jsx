import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Grid, Card, CardContent, Typography, Avatar,
  Chip, Stack, Divider, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button,
  MenuItem, IconButton, Tooltip as MuiTooltip
} from '@mui/material'
import { getDb, getMasters, saveMaster, deleteMaster } from './workflow/mockDb'
import { useAuth } from '../context/AuthContext'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded'
import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'

import ShoppingCartRoundedIcon from '@mui/icons-material/ShoppingCartRounded'
import LocalShippingRoundedIcon from '@mui/icons-material/LocalShippingRounded'
import ContentCutRoundedIcon from '@mui/icons-material/ContentCutRounded'
import PrintRoundedIcon from '@mui/icons-material/PrintRounded'
import HandymanRoundedIcon from '@mui/icons-material/HandymanRounded'
import InventoryRoundedIcon from '@mui/icons-material/InventoryRounded'
import GrassRoundedIcon from '@mui/icons-material/GrassRounded'
import WarehouseRoundedIcon from '@mui/icons-material/WarehouseRounded'

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Box sx={{ bgcolor: '#1F2937', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 2, p: 1.5, minWidth: 140 }}>
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', display: 'block', mb: 0.5 }}>{label}</Typography>
        {payload.map((p) => (
          <Box key={p.name} sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
            <Typography variant="caption" sx={{ color: p.color }}>{p.name}</Typography>
            <Typography variant="caption" sx={{ color: '#fff', fontWeight: 700 }}>{p.value}</Typography>
          </Box>
        ))}
      </Box>
    )
  }
  return null
}

// ── Mini-table card component ─────────────────────────────────────────────────
function StageCard({ title, subtitle, icon, color, bg, path, columns, rows, onViewAll }) {
  return (
    <Card sx={{ height: 320, display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
            <Avatar sx={{ bgcolor: bg, color: color, width: 34, height: 34, borderRadius: 2 }}>
              {React.cloneElement(icon, { style: { fontSize: 17 } })}
            </Avatar>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary', lineHeight: 1.2 }}>{title}</Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.68rem' }}>{subtitle}</Typography>
            </Box>
          </Box>
          <Chip
            label="View All"
            size="small"
            variant="outlined"
            onClick={onViewAll}
            sx={{ fontWeight: 600, cursor: 'pointer', fontSize: '0.65rem', height: 22, borderColor: color, color: color, '&:hover': { bgcolor: bg } }}
          />
        </Box>

        {/* Column Headers */}
        <Box sx={{ display: 'grid', gridTemplateColumns: columns.map(c => c.flex).join(' '), px: 1, mb: 0.75 }}>
          {columns.map(c => (
            <Typography key={c.key} variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.6rem', letterSpacing: '0.05em', textAlign: c.align || 'left' }}>
              {c.label}
            </Typography>
          ))}
        </Box>
        <Divider />

        {/* Rows */}
        <Box sx={{ flex: 1, overflowY: 'auto' }}>
          {rows.length === 0 ? (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <Typography variant="caption" sx={{ color: 'text.disabled' }}>No records yet</Typography>
            </Box>
          ) : (
            <Stack divider={<Divider />}>
              {rows.map((row, idx) => (
                <Box key={idx} sx={{ display: 'grid', gridTemplateColumns: columns.map(c => c.flex).join(' '), px: 1, py: 1, alignItems: 'center', '&:hover': { bgcolor: `${bg}` }, transition: 'background 0.15s' }}>
                  {columns.map(c => (
                    <Typography key={c.key} variant="caption" sx={{ fontWeight: c.bold ? 700 : 500, color: c.bold ? color : 'text.primary', textAlign: c.align || 'left', fontSize: '0.72rem' }} noWrap>
                      {row[c.key] ?? '—'}
                    </Typography>
                  ))}
                </Box>
              ))}
            </Stack>
          )}
        </Box>
      </CardContent>
    </Card>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate()

  const [piRows,      setPiRows]      = useState([])
  const [poRows,      setPoRows]      = useState([])
  const [rmRows,      setRmRows]      = useState([])
  const [cutRows,     setCutRows]     = useState([])
  const [printIssueRows,   setPrintIssueRows]   = useState([])
  const [printReceiveRows, setPrintReceiveRows] = useState([])
  const [stitchIssueRows,  setStitchIssueRows]  = useState([])
  const [stitchReceiveRows,setStitchReceiveRows]= useState([])
  const [finishRows,  setFinishRows]  = useState([])
  const [shipRows,    setShipRows]    = useState([])
  const [printerSummaryRows, setPrinterSummaryRows] = useState([])
  const [fabricatorSummaryRows, setFabricatorSummaryRows] = useState([])
  const [orderTrendData, setOrderTrendData] = useState([])
  const [materialStatusData, setMaterialStatusData] = useState([])
  const { user } = useAuth()
  const [companies, setCompanies] = useState([])
  const [companyDialog, setCompanyDialog] = useState(false)
  const [companyForm, setCompanyForm] = useState({ name: '', email: '', password: '', phone: '' })
  const [companySubmitted, setCompanySubmitted] = useState(false)

  const loadCompanies = () => {
    getMasters('companies')
      .then(data => setCompanies(data))
      .catch(err => console.error(err))
  }

  useEffect(() => {
    if (user?.role === 'superadmin') {
      loadCompanies()
    }
  }, [user])

  const handleSaveCompany = async () => {
    setCompanySubmitted(true)
    const isEdit = !!companyForm.id
    if (!companyForm.name || !companyForm.email || (!isEdit && !companyForm.password)) return
    try {
      await saveMaster('companies', companyForm)
      loadCompanies()
      setCompanyDialog(false)
      setCompanyForm({ name: '', email: '', password: '', phone: '', status: 'Active' })
      setCompanySubmitted(false)
    } catch (err) {
      alert(err.message)
    }
  }

  const handleEditCompany = (company) => {
    setCompanyForm({
      id: company.id,
      name: company.name,
      email: company.email,
      phone: company.phone || '',
      status: company.status || 'Active',
      password: ''
    })
    setCompanySubmitted(false)
    setCompanyDialog(true)
  }

  const handleDeleteCompany = async (id) => {
    if (window.confirm('Are you sure you want to delete this company? This will also delete all associated admin and user accounts.')) {
      try {
        await deleteMaster('companies', id)
        loadCompanies()
      } catch (err) {
        alert(err.message)
      }
    }
  }

  const handleSwitchToCompany = (company) => {
    const url = `/dashboard?companyEmail=${encodeURIComponent(company.email)}&companyName=${encodeURIComponent(company.name)}&companyId=${company.id}`;
    window.open(url, '_blank');
  }

  useEffect(() => {
    getDb(['pis', 'pos', 'receipts', 'cuttings', 'printerJobs', 'stitcherJobs', 'finishing', 'shipments'])
      .then(data => {
        // ── PI Entry ────────────────────────────────────────────────
        const pis = []
        if (data.pis) {
          ;[...data.pis].reverse().slice(0, 5).forEach(pi => {
            const buyers = [...new Set((pi.products || []).map(p => p.buyerName).filter(Boolean))].join(', ') || '—'
            const items = [...new Set((pi.products || []).map(p => p.itemNo).filter(Boolean))].join(', ') || '—'
            const totQty = (pi.products || []).reduce((s, p) => s + Number(p.qty || 0), 0)
            pis.push({ piNo: pi.piNo, buyer: buyers, item: items, qty: totQty.toLocaleString() })
          })
        }
        setPiRows(pis)

        // ── Raw Material PO ───────────────────────────────────────────
        const pos = []
        if (data.pos) {
          ;[...data.pos].reverse().slice(0, 5).forEach(po => {
            const itemNames = [...new Set((po.items || []).map(it => it.name).filter(Boolean))].join(', ') || '—'
            const totQty = (po.items || []).reduce((s, it) => s + Number(it.qty || 0), 0)
            pos.push({ poNo: po.poNo || '—', supplier: po.supplier || '—', item: itemNames, qty: totQty.toLocaleString() })
          })
        }
        setPoRows(pos)

        // ── RM Stock In ────────────────────────────────────────────────
        const rms = []
        if (data.receipts) {
          ;[...data.receipts].reverse().slice(0, 5).forEach(r => {
            const itemNames = [...new Set((r.items || []).map(it => it.name).filter(Boolean))].join(', ') || '—'
            const totQty = (r.items || []).reduce((s, it) => s + Number(it.qty || 0), 0)
            rms.push({ date: r.date || '—', supplier: r.supplier || '—', item: itemNames, qty: totQty.toLocaleString() })
          })
        }
        setRmRows(rms)

        // ── Cutting Issues ───────────────────────────────────────────
        const cuts = []
        if (data.cuttings) {
          ;[...data.cuttings].reverse().slice(0, 5).forEach(c => {
            const totQty = (c.items || []).reduce((s, it) => s + Number(it.qty || 0), 0)
            const itemNames = [...new Set((c.items || []).map(it => it.itemNo).filter(Boolean))].join(', ') || '—'
            cuts.push({ date: c.date || '—', piNo: c.piNo || '—', item: itemNames, qty: totQty.toLocaleString() })
          })
        }
        setCutRows(cuts)

        // ── Printer Job Issues ────────────────────────────────────────
        const printIssues = []
        if (data.printerJobs?.issues) {
          ;[...data.printerJobs.issues].reverse().slice(0, 5).forEach(i => {
            printIssues.push({ date: i.date || '—', piNo: i.piNo || '—', item: i.itemNo || '—', qty: Number(i.qty || 0).toLocaleString() })
          })
        }
        setPrintIssueRows(printIssues)

        // ── Printer Job Receives ─────────────────────────────────────
        const printReceives = []
        if (data.printerJobs?.receives) {
          ;[...data.printerJobs.receives].reverse().slice(0, 5).forEach(r => {
            printReceives.push({ date: r.date || r.receiveDate || '—', piNo: r.piNo || '—', item: r.itemNo || '—', qty: Number(r.qty || 0).toLocaleString() })
          })
        }
        setPrintReceiveRows(printReceives)

        // ── Stitcher Job Issues ───────────────────────────────────────
        const stitchIssues = []
        if (data.stitcherJobs?.issues) {
          ;[...data.stitcherJobs.issues].reverse().slice(0, 5).forEach(i => {
            stitchIssues.push({ date: i.date || '—', piNo: i.piNo || '—', item: i.itemNo || '—', qty: Number(i.qty || 0).toLocaleString() })
          })
        }
        setStitchIssueRows(stitchIssues)

        // ── Stitcher Job Receives ────────────────────────────────────
        const stitchReceives = []
        if (data.stitcherJobs?.receives) {
          ;[...data.stitcherJobs.receives].reverse().slice(0, 5).forEach(r => {
            stitchReceives.push({ date: r.date || r.receiveDate || '—', piNo: r.piNo || '—', item: r.itemNo || '—', qty: Number(r.qty || 0).toLocaleString() })
          })
        }
        setStitchReceiveRows(stitchReceives)

        // ── Finishing ────────────────────────────────────────────────
        const finishes = []
        if (data.finishing) {
          ;[...data.finishing].reverse().slice(0, 5).forEach(f => {
            finishes.push({ date: f.date || '—', piNo: f.piNo || '—', item: f.itemNo || '—', qty: Number(f.qty || 0).toLocaleString() })
          })
        }
        setFinishRows(finishes)

        // ── Shipment ─────────────────────────────────────────────────
        const ships = []
        if (data.shipments) {
          ;[...data.shipments].reverse().slice(0, 5).forEach(s => {
            ships.push({ date: s.date || '—', piNo: s.piNo || '—', item: (s.items || []).map(it => it.itemNo).join(', ') || '—', qty: Number(s.qty || 0).toLocaleString() })
          })
        }
        setShipRows(ships)

        // ── Order Trend (dynamic from PIs & Shipments) ────────────────
        const trendMap = {}
        const addTrend = (dateStr, key) => {
          if (!dateStr) return
          const d = new Date(dateStr)
          if (isNaN(d.getTime())) return
          const mkey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
          if (!trendMap[mkey]) {
            trendMap[mkey] = { ts: d.getTime(), month: d.toLocaleString('en', { month: 'short' }), orders: 0, dispatched: 0 }
          }
          trendMap[mkey][key] += 1
        }
        ;(data.pis || []).forEach(pi => addTrend(pi.date, 'orders'))
        ;(data.shipments || []).forEach(s => addTrend(s.date, 'dispatched'))
        setOrderTrendData(Object.values(trendMap).sort((a, b) => a.ts - b.ts))

        // ── Material Pipeline (dynamic from production stages) ─────────
        const sumItems = (items) => (items || []).reduce((s, it) => s + Number(it.qty || 0), 0)
        const pipeline = [
          { name: 'At Cutting',      value: (data.cuttings || []).reduce((s, c) => s + sumItems(c.items), 0),     fill: '#F59E0B' },
          { name: 'With Printer',    value: (data.printerJobs?.issues || []).reduce((s, i) => s + Number(i.qty || 0), 0), fill: '#8B5CF6' },
          { name: 'With Fabricator', value: (data.stitcherJobs?.issues || []).reduce((s, i) => s + Number(i.qty || 0), 0), fill: '#EC4899' },
          { name: 'Ready Dispatch',  value: (data.finishing || []).reduce((s, f) => s + Number(f.qty || 0), 0),   fill: '#00C07F' },
          { name: 'Finished Stock',  value: (data.shipments || []).reduce((s, sh) => s + Number(sh.qty || 0), 0), fill: '#14B8A6' },
        ]
        setMaterialStatusData(pipeline)

        // ── Printer Summary ───────────────────────────────────────────
        const printerSummary = {}
        if (data.printerJobs?.issues) {
          data.printerJobs.issues.forEach(i => {
            const name = i.printerName
            if (name) {
              if (!printerSummary[name]) printerSummary[name] = { issued: 0, received: 0 }
              printerSummary[name].issued += Number(i.qty || 0)
            }
          })
        }
        if (data.printerJobs?.receives) {
          data.printerJobs.receives.forEach(r => {
            const name = r.printerName
            if (name) {
              if (!printerSummary[name]) printerSummary[name] = { issued: 0, received: 0 }
              printerSummary[name].received += Number(r.qty || 0)
            }
          })
        }
        setPrinterSummaryRows(
          Object.entries(printerSummary).map(([name, p]) => ({
            name,
            issued: p.issued.toLocaleString(),
            received: p.received.toLocaleString(),
            due: Math.max(0, p.issued - p.received).toLocaleString()
          }))
        )

        // ── Fabricator Summary ─────────────────────────────────────────
        const fabricatorSummary = {}
        if (data.stitcherJobs?.issues) {
          data.stitcherJobs.issues.forEach(i => {
            const name = i.fabricatorName
            if (name) {
              if (!fabricatorSummary[name]) fabricatorSummary[name] = { issued: 0, received: 0 }
              fabricatorSummary[name].issued += Number(i.qty || 0)
            }
          })
        }
        if (data.stitcherJobs?.receives) {
          data.stitcherJobs.receives.forEach(r => {
            const name = r.fabricatorName
            if (name) {
              if (!fabricatorSummary[name]) fabricatorSummary[name] = { issued: 0, received: 0 }
              fabricatorSummary[name].received += Number(r.qty || 0)
            }
          })
        }
        setFabricatorSummaryRows(
          Object.entries(fabricatorSummary).map(([name, f]) => ({
            name,
            issued: f.issued.toLocaleString(),
            received: f.received.toLocaleString(),
            due: Math.max(0, f.issued - f.received).toLocaleString()
          }))
        )
      })
      .catch(err => console.error(err))
  }, [])

  const dateItemQtyColumns = [
    { key: 'date',  label: 'Date',  flex: '0.9fr' },
    { key: 'piNo',  label: 'PI No.', flex: '0.8fr', bold: true },
    { key: 'item',  label: 'Item',  flex: '1.3fr' },
    { key: 'qty',   label: 'Qty',   flex: '0.6fr', align: 'right' },
  ]

  const poColumns = [
    { key: 'poNo',    label: 'PO No.',   flex: '0.8fr', bold: true },
    { key: 'supplier', label: 'Supplier', flex: '1.3fr' },
    { key: 'item',    label: 'Material', flex: '1fr' },
    { key: 'qty',     label: 'Qty',      flex: '0.6fr', align: 'right' },
  ]

  const rmColumns = [
    { key: 'date',     label: 'Date',    flex: '0.9fr' },
    { key: 'supplier', label: 'Supplier', flex: '1.3fr' },
    { key: 'item',     label: 'Material', flex: '1fr' },
    { key: 'qty',      label: 'Qty',      flex: '0.6fr', align: 'right' },
  ]

  if (user?.role === 'superadmin') {
    return (
      <Box className="page-enter">
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'rgba(108,99,255,0.1)', color: '#6C63FF', borderRadius: 2, width: 46, height: 46 }}>
              <WarehouseRoundedIcon />
            </Avatar>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', lineHeight: 1.2 }}>Superadmin Console</Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>Create and manage independent client companies and inventories</Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={() => { setCompanyForm({ name: '', email: '', password: '', phone: '', status: 'Active' }); setCompanySubmitted(false); setCompanyDialog(true) }}
            sx={{ borderRadius: 2, fontWeight: 700, background: 'linear-gradient(135deg,#6C63FF,#9B94FF)', boxShadow: '0 4px 14px rgba(108,99,255,0.35)' }}
          >
            Create Company
          </Button>
        </Box>

        {/* Company List Card */}
        <Card sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflowX: 'auto' }}>
          <Box className="grid-table-row" sx={{ display: 'grid', gridTemplateColumns: '1fr 2fr 2fr 1.5fr 1fr 1fr', px: 2.5, py: 1.5, borderBottom: '1px solid', borderColor: 'divider', bgcolor: '#F8F9FC', minWidth: '800px' }}>
            {['Company ID', 'Company Name', 'Admin Email', 'Phone Number', 'Status', 'Actions'].map(h => (
              <Typography key={h} variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.62rem', textTransform: 'uppercase', textAlign: h === 'Actions' ? 'right' : 'left' }}>
                {h}
              </Typography>
            ))}
          </Box>

          <Stack divider={<Divider />} sx={{ minWidth: '800px' }}>
            {companies.length === 0 ? (
              <Box sx={{ py: 6, textAlign: 'center' }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>No companies registered yet. Click Create Company to get started.</Typography>
              </Box>
            ) : (
              companies.map((company) => (
                <Box key={company.id} className="grid-table-row" sx={{ display: 'grid', gridTemplateColumns: '1fr 2fr 2fr 1.5fr 1fr 1fr', px: 2.5, py: 1.5, alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.secondary' }}>#{company.id}</Typography>
                  <Typography
                    variant="body2"
                    onClick={() => handleSwitchToCompany(company)}
                    sx={{
                      fontWeight: 700,
                      color: 'primary.main',
                      cursor: 'pointer',
                      '&:hover': { textDecoration: 'underline' }
                    }}
                  >
                    {company.name}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{company.email}</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{company.phone || '—'}</Typography>
                  <Box>
                    <Chip
                      label={company.status}
                      size="small"
                      color={company.status === 'Active' ? 'success' : 'error'}
                      sx={{ fontWeight: 700, fontSize: '0.62rem', width: 'fit-content' }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                    <MuiTooltip title="Edit Company">
                      <IconButton size="small" onClick={() => handleEditCompany(company)} color="primary">
                        <EditRoundedIcon fontSize="small" />
                      </IconButton>
                    </MuiTooltip>
                    <MuiTooltip title="Delete Company">
                      <IconButton size="small" onClick={() => handleDeleteCompany(company.id)} color="error">
                        <DeleteRoundedIcon fontSize="small" />
                      </IconButton>
                    </MuiTooltip>
                  </Box>
                </Box>
              ))
            )}
          </Stack>
        </Card>

        {/* Create / Edit Company Dialog */}
        <Dialog open={companyDialog} onClose={() => setCompanyDialog(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
          <DialogTitle sx={{ fontWeight: 800 }}>{companyForm.id ? 'Edit Company Profile' : 'Create New Company'}</DialogTitle>
          <DialogContent>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
              {companyForm.id 
                ? 'Update the company profile details. Leave the admin password blank if you do not want to change it.'
                : 'Enter the company profile and initial admin user account. The admin will be able to log in to manage their specific inventory independently.'
              }
            </Typography>
            <Stack spacing={2.5} sx={{ mt: 1 }}>
              <TextField
                fullWidth
                label="Company Name"
                value={companyForm.name}
                onChange={e => setCompanyForm({ ...companyForm, name: e.target.value })}
                error={companySubmitted && !companyForm.name}
                helperText={companySubmitted && !companyForm.name ? 'Required' : ''}
              />
              <TextField
                fullWidth
                label="Admin Email Address"
                type="email"
                value={companyForm.email}
                onChange={e => setCompanyForm({ ...companyForm, email: e.target.value })}
                error={companySubmitted && !companyForm.email}
                helperText={companySubmitted && !companyForm.email ? 'Required' : ''}
              />
              <TextField
                fullWidth
                label={companyForm.id ? "Admin Password (Leave blank to keep current)" : "Admin Password"}
                type="password"
                value={companyForm.password}
                onChange={e => setCompanyForm({ ...companyForm, password: e.target.value })}
                error={companySubmitted && !companyForm.id && !companyForm.password}
                helperText={companySubmitted && !companyForm.id && !companyForm.password ? 'Required' : ''}
              />
              <TextField
                fullWidth
                label="Company Phone (Optional)"
                value={companyForm.phone}
                onChange={e => setCompanyForm({ ...companyForm, phone: e.target.value })}
              />
              {companyForm.id && (
                <TextField
                  select
                  fullWidth
                  label="Status"
                  value={companyForm.status || 'Active'}
                  onChange={e => setCompanyForm({ ...companyForm, status: e.target.value })}
                >
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Inactive">Inactive</MenuItem>
                </TextField>
              )}
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2.5, gap: 1 }}>
            <Button onClick={() => setCompanyDialog(false)} sx={{ borderRadius: 2.5, fontWeight: 700, textTransform: 'none' }}>Cancel</Button>
            <Button onClick={handleSaveCompany} variant="contained" sx={{ borderRadius: 2.5, fontWeight: 700, textTransform: 'none', px: 3 }}>Save Company</Button>
          </DialogActions>
        </Dialog>
      </Box>
    )
  }

  return (
    <Box className="page-enter">
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', mb: 0.5 }}>Dashboard</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>Live overview of your production & order pipeline.</Typography>
      </Box>

      {/* ── Printer & Fabricator Summary Tables ── */}
      <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: 260, display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 1.5 }}>
                <Avatar sx={{ bgcolor: 'rgba(139,92,246,0.07)', color: '#8B5CF6', width: 34, height: 34, borderRadius: 2 }}>
                  <PrintRoundedIcon style={{ fontSize: 17 }} />
                </Avatar>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary', lineHeight: 1.2 }}>Printer Summary</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.68rem' }}>Printer wise total issues, receives & due</Typography>
                </Box>
              </Box>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', px: 1, mb: 0.75 }}>
                {['Printer Name', 'Issued', 'Received', 'Due'].map((h, i) => (
                  <Typography key={h} variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.6rem', letterSpacing: '0.05em', textAlign: i > 0 ? 'right' : 'left' }}>
                    {h}
                  </Typography>
                ))}
              </Box>
              <Divider />

              <Box sx={{ flex: 1, overflowY: 'auto' }}>
                {printerSummaryRows.length === 0 ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <Typography variant="caption" sx={{ color: 'text.disabled' }}>No printer records</Typography>
                  </Box>
                ) : (
                  <Stack divider={<Divider />}>
                    {printerSummaryRows.map((row, idx) => (
                      <Box key={idx} sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', px: 1, py: 1, alignItems: 'center', '&:hover': { bgcolor: 'rgba(139,92,246,0.02)' } }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.primary', fontSize: '0.72rem' }}>{row.name}</Typography>
                        <Typography variant="caption" sx={{ fontWeight: 500, color: 'text.primary', textAlign: 'right', fontSize: '0.72rem' }}>{row.issued}</Typography>
                        <Typography variant="caption" sx={{ fontWeight: 500, color: '#00C07F', textAlign: 'right', fontSize: '0.72rem' }}>{row.received}</Typography>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: row.due !== '0' ? 'error.main' : 'text.disabled', textAlign: 'right', fontSize: '0.72rem' }}>{row.due}</Typography>
                      </Box>
                    ))}
                  </Stack>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: 260, display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 1.5 }}>
                <Avatar sx={{ bgcolor: 'rgba(236,72,153,0.07)', color: '#EC4899', width: 34, height: 34, borderRadius: 2 }}>
                  <HandymanRoundedIcon style={{ fontSize: 17 }} />
                </Avatar>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary', lineHeight: 1.2 }}>Fabricator Summary</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.68rem' }}>Fabricator wise total issues, receives & due</Typography>
                </Box>
              </Box>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', px: 1, mb: 0.75 }}>
                {['Fabricator Name', 'Issued', 'Received', 'Due'].map((h, i) => (
                  <Typography key={h} variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.6rem', letterSpacing: '0.05em', textAlign: i > 0 ? 'right' : 'left' }}>
                    {h}
                  </Typography>
                ))}
              </Box>
              <Divider />

              <Box sx={{ flex: 1, overflowY: 'auto' }}>
                {fabricatorSummaryRows.length === 0 ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <Typography variant="caption" sx={{ color: 'text.disabled' }}>No fabricator records</Typography>
                  </Box>
                ) : (
                  <Stack divider={<Divider />}>
                    {fabricatorSummaryRows.map((row, idx) => (
                      <Box key={idx} sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', px: 1, py: 1, alignItems: 'center', '&:hover': { bgcolor: 'rgba(236,72,153,0.02)' } }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.primary', fontSize: '0.72rem' }}>{row.name}</Typography>
                        <Typography variant="caption" sx={{ fontWeight: 500, color: 'text.primary', textAlign: 'right', fontSize: '0.72rem' }}>{row.issued}</Typography>
                        <Typography variant="caption" sx={{ fontWeight: 500, color: '#00C07F', textAlign: 'right', fontSize: '0.72rem' }}>{row.received}</Typography>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: row.due !== '0' ? 'error.main' : 'text.disabled', textAlign: 'right', fontSize: '0.72rem' }}>{row.due}</Typography>
                      </Box>
                    ))}
                  </Stack>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ── 6 Stage Mini-Tables ── */}
      <Grid container spacing={2.5} sx={{ mb: 3.5 }}>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StageCard
            title="PI Entry" subtitle="Recent orders received"
            icon={<ShoppingCartRoundedIcon />} color="#6C63FF" bg="rgba(108,99,255,0.07)"
            path="/workflow/pi-entry"
            columns={[
              { key: 'piNo',  label: 'PI No.', flex: '0.8fr', bold: true },
              { key: 'buyer', label: 'Buyer',  flex: '1.4fr' },
              { key: 'item',  label: 'Item',   flex: '1fr' },
              { key: 'qty',   label: 'Qty',    flex: '0.6fr', align: 'right' },
            ]}
            rows={piRows}
            onViewAll={() => navigate('/workflow/pi-entry')}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StageCard
            title="Raw Material PO" subtitle="Recent material purchase orders"
            icon={<GrassRoundedIcon />} color="#10B981" bg="rgba(16,185,129,0.07)"
            path="/workflow/po-raw-material"
            columns={poColumns}
            rows={poRows}
            onViewAll={() => navigate('/workflow/po-raw-material')}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StageCard
            title="RM Stock In" subtitle="Recent stock received"
            icon={<WarehouseRoundedIcon />} color="#F97316" bg="rgba(249,115,22,0.07)"
            path="/workflow/rm-stock-in"
            columns={rmColumns}
            rows={rmRows}
            onViewAll={() => navigate('/workflow/rm-stock-in')}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StageCard
            title="Cutting" subtitle="Recent cutting entries"
            icon={<ContentCutRoundedIcon />} color="#F59E0B" bg="rgba(245,158,11,0.07)"
            path="/workflow/cutting"
            columns={dateItemQtyColumns}
            rows={cutRows}
            onViewAll={() => navigate('/workflow/cutting')}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StageCard
            title="Printing Issued" subtitle="Recent printing issues"
            icon={<PrintRoundedIcon />} color="#8B5CF6" bg="rgba(139,92,246,0.07)"
            path="/workflow/printer-job"
            columns={dateItemQtyColumns}
            rows={printIssueRows}
            onViewAll={() => navigate('/workflow/printer-job')}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <StageCard
            title="Printing Received" subtitle="Recent printing receives"
            icon={<PrintRoundedIcon />} color="#8B5CF6" bg="rgba(139,92,246,0.07)"
            path="/workflow/printer-job"
            columns={dateItemQtyColumns}
            rows={printReceiveRows}
            onViewAll={() => navigate('/workflow/printer-job')}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 6 }}>
          <StageCard
            title="Stitching Issued" subtitle="Recent stitching issues"
            icon={<HandymanRoundedIcon />} color="#EC4899" bg="rgba(236,72,153,0.07)"
            path="/workflow/stitcher-job"
            columns={dateItemQtyColumns}
            rows={stitchIssueRows}
            onViewAll={() => navigate('/workflow/stitcher-job')}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 6 }}>
          <StageCard
            title="Stitching Received" subtitle="Recent stitching receives"
            icon={<HandymanRoundedIcon />} color="#EC4899" bg="rgba(236,72,153,0.07)"
            path="/workflow/stitcher-job"
            columns={dateItemQtyColumns}
            rows={stitchReceiveRows}
            onViewAll={() => navigate('/workflow/stitcher-job')}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 6 }}>
          <StageCard
            title="Finishing & Packing" subtitle="Recent packing records"
            icon={<InventoryRoundedIcon />} color="#14B8A6" bg="rgba(20,184,166,0.07)"
            path="/workflow/finishing"
            columns={dateItemQtyColumns}
            rows={finishRows}
            onViewAll={() => navigate('/workflow/finishing')}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 6 }}>
          <StageCard
            title="Shipments" subtitle="Recent dispatches"
            icon={<LocalShippingRoundedIcon />} color="#00C07F" bg="rgba(0,192,127,0.07)"
            path="/workflow/shipment"
            columns={dateItemQtyColumns}
            rows={shipRows}
            onViewAll={() => navigate('/workflow/shipment')}
          />
        </Grid>

      </Grid>

      {/* ── Charts Row: Order Trend + Material Pipeline ── */}
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card sx={{ height: 320 }}>
            <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>Order Trend</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>New vs Dispatched — last 6 months</Typography>
                </Box>
                <Chip label="2026" size="small" variant="outlined" sx={{ fontWeight: 600, color: 'text.secondary', borderColor: 'divider' }} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={orderTrendData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gradOrders" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#6C63FF" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#6C63FF" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gradDispatched" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#00C07F" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#00C07F" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                    <Area type="monotone" dataKey="orders"     name="Total Orders" stroke="#6C63FF" strokeWidth={2.5} fill="url(#gradOrders)"     dot={{ r: 4, fill: '#6C63FF', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                    <Area type="monotone" dataKey="dispatched" name="Dispatched"    stroke="#00C07F" strokeWidth={2.5} fill="url(#gradDispatched)" dot={{ r: 4, fill: '#00C07F', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, lg: 6 }}>
          <Card sx={{ height: 320 }}>
            <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>Material Pipeline</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>Current stage distribution</Typography>
              </Box>
              <Box sx={{ display: 'flex', flex: 1, gap: 2, alignItems: 'center' }}>
                <Box sx={{ flex: 1, height: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={materialStatusData} cx="50%" cy="50%" innerRadius={55} outerRadius={88} paddingAngle={3} dataKey="value">
                        {materialStatusData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                      </Pie>
                      <Tooltip formatter={(val, name) => [val + ' units', name]} contentStyle={{ borderRadius: 10, border: '1px solid #E5E7EB', fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
                <Stack spacing={1.25} sx={{ minWidth: 155 }}>
                  {materialStatusData.map((m) => (
                    <Box key={m.name} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: m.fill, flexShrink: 0 }} />
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>{m.name}</Typography>
                      </Box>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.primary' }}>{m.value}</Typography>
                    </Box>
                  ))}
                </Stack>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
