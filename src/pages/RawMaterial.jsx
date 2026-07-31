import React, { useState } from 'react'
import {
  Box, Typography, Card, CardContent, Button, Chip, IconButton,
  TextField, InputAdornment, Dialog, DialogTitle, DialogContent,
  DialogActions, Grid, Stack, Divider, Tooltip, Avatar, MenuItem,
  Accordion, AccordionSummary, AccordionDetails,
} from '@mui/material'
import AddRoundedIcon           from '@mui/icons-material/AddRounded'
import SearchRoundedIcon        from '@mui/icons-material/SearchRounded'
import EditRoundedIcon          from '@mui/icons-material/EditRounded'
import DeleteRoundedIcon        from '@mui/icons-material/DeleteRounded'
import VisibilityRoundedIcon    from '@mui/icons-material/VisibilityRounded'
import WarehouseRoundedIcon     from '@mui/icons-material/WarehouseRounded'
import FilterListRoundedIcon    from '@mui/icons-material/FilterListRounded'
import ExpandMoreIcon           from '@mui/icons-material/ExpandMore'

// ─────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────
const MATERIAL_TYPES  = ['Jute Sheet', 'Cotton Sheet']
const TRANSPORT_MODES = ['By Hand', 'Road', 'Rail', 'Air', 'Courier']
const GST_RATES       = ['0', '0.25', '2.5', '5', '12', '18', '28']

const JUTE_SUPPLIERS   = ['Kamakshi Jute Industries Ltd.', 'Bengal Jute Suppliers', 'Green Fibre Works', 'Eastern Jute Traders']
const COTTON_SUPPLIERS = ['Hannuman Textile Mills Pvt. Ltd.', 'R Kumar & Company', 'Cotton Fabric House', 'Textile Zone']
const PURCHASE_ITEMS = [
  { sku: 'RAW-JUT-FIB', name: 'Raw Jute Fibre A-Grade', color: 'Natural', uom: 'KG', hsnCode: '53031010' },
  { sku: 'RAW-COT-YRN', name: 'Raw Cotton Yarn 40s', color: 'White', uom: 'KG', hsnCode: '52051110' },
  { sku: 'LMT-FLM-TRN', name: 'Lamination Film Transparent', color: 'Clear', uom: 'ROLL', hsnCode: '39201019' },
  { sku: 'PRT-INK-BLK', name: 'Printing Ink - Jet Black', color: 'Black', uom: 'KG', hsnCode: '32151110' },
  { sku: 'JUT-HES-NAT', name: 'Hessian Cloth', color: 'Natural', uom: 'MTR', hsnCode: '53010015' },
  { sku: 'JUT-CLO-GLD', name: 'Jute Cloth', color: 'Golden', uom: 'MTR', hsnCode: '53010015' },
  { sku: 'COT-SHT-WHT', name: 'Cotton Sheet', color: 'White', uom: 'MTR', hsnCode: '52091200' },
  { sku: 'COT-FAB-BLU', name: 'Cotton Fabric', color: 'Blue', uom: 'MTR', hsnCode: '52091200' },
]
const UNITS = ['MTR', 'PCS', 'KG', 'ROLL', 'BAG', 'TON']

// ─────────────────────────────────────────────────────────────
// Empty form – ALL fields from both bills
// ─────────────────────────────────────────────────────────────
const emptyRow = () => ({ description: '', unit: 'MTR', hsnCode: '', quantity: '', rate: '' })

const emptyForm = (type = 'Jute Sheet') => ({
  materialType: type,
  supplierName: '',
  stockInDate: '',
  invoiceNo: '', invoiceDate: '', dateOfSupply: '', destination: '',
  panNo: '', gstNo: '',
  goodsRows: [emptyRow()],
})

// ─────────────────────────────────────────────────────────────
// Calculation helpers
// ─────────────────────────────────────────────────────────────
const num = (v) => parseFloat(v || 0)
const fmtINR = (v) => num(v).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const calcAmount = (f) => {
  const quantity = num(f.quantity)
  const rate = num(f.rate)
  return quantity * rate
}

function calcJuteTotal(f) {
  const gross   = num(f.quantity) * num(f.rate)
  const taxable = gross + num(f.printingCharges) + num(f.handlingCharges) + num(f.insuranceCharges) + num(f.freightCharges)
  const sgst    = taxable * num(f.sgstPercent) / 100
  const cgst    = taxable * num(f.cgstPercent) / 100
  const igst    = taxable * num(f.igstPercent) / 100
  const tcs     = (taxable + sgst + cgst + igst) * num(f.tcsPercent) / 100
  return { gross, taxable, sgst, cgst, igst, tcs, total: taxable + sgst + cgst + igst + tcs + num(f.freightAdvance) - num(f.marketingTax) }
}

function calcCottonTotal(f) {
  const base  = num(f.quantity) * num(f.rate)
  const igst  = base * num(f.igstOutputPercent) / 100
  const round = num(f.roundOff)
  return { base, igst, total: base + igst + round }
}

const statusColor = { Received: 'success', Pending: 'warning' }
const COL = '110px 1fr 120px 95px 90px 75px 80px 100px 100px'
const HEADS = ['Material', 'Supplier', 'Invoice No', 'Stock IN', 'Qty', 'Rate', 'GST', 'Total ₹', 'Actions']

// ─────────────────────────────────────────────────────────────
// UI Helpers
// ─────────────────────────────────────────────────────────────
const FL = ({ children, req }) => (
  <Typography variant="caption" sx={{ fontWeight: 600, color: '#374151', mb: 0.5, display: 'block' }}>
    {children}{req && <span style={{ color: '#EF4444' }}> *</span>}
  </Typography>
)

const FInput = ({ label, value, onChange, type = 'text', placeholder, select, children, size = { xs: 12, sm: 6 }, req, multiline, rows }) => (
  <Grid size={size}>
    <FL req={req}>{label}</FL>
    {select
      ? <TextField fullWidth size="small" select value={value || ''} onChange={onChange}>{children}</TextField>
      : <TextField fullWidth size="small" type={type} value={value || ''} onChange={onChange} placeholder={placeholder} multiline={multiline} rows={rows} />
    }
  </Grid>
)

const ReadBox = ({ label, value, highlight, size = { xs: 12, sm: 4 } }) => (
  <Grid size={size}>
    <FL>{label}</FL>
    <Box sx={{ height: 40, px: 1.5, borderRadius: 2, bgcolor: highlight ? 'rgba(0,192,127,0.08)' : '#F9FAFB', border: `1px solid ${highlight ? 'rgba(0,192,127,0.3)' : '#E5E7EB'}`, display: 'flex', alignItems: 'center' }}>
      <Typography variant="body2" sx={{ fontWeight: 800, color: highlight ? '#00C07F' : '#374151' }}>₹{fmtINR(value)}</Typography>
    </Box>
  </Grid>
)

const Sec = ({ title, children, defaultExpanded = true }) => (
  <Grid size={12}>
    <Accordion defaultExpanded={defaultExpanded} disableGutters elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '8px !important', mb: 0.5, '&:before': { display: 'none' } }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ minHeight: 40, bgcolor: '#F8F9FC', borderRadius: '8px 8px 0 0', '& .MuiAccordionSummary-content': { my: 0.5 } }}>
        <Typography variant="caption" sx={{ fontWeight: 800, color: '#6C63FF', textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.7rem' }}>{title}</Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ p: 2 }}>
        <Grid container spacing={2}>{children}</Grid>
      </AccordionDetails>
    </Accordion>
  </Grid>
)

// ─────────────────────────────────────────────────────────────
// Sample Data
// ─────────────────────────────────────────────────────────────
const initialData = [
  {
    id: 1, materialType: 'Jute Sheet', supplierName: 'Kamakshi Jute Industries Ltd.', stockInDate: '2026-07-19', status: 'Received',
    invoiceNo: 'B/26-27/8249', invoiceDate: '2026-07-19', transportMode: 'By Hand',
    lpNo: '00/26-27/0251', lpDate: '2026-07-19', vehicleNumber: '0000',
    saNo: 'SA/26-27/0080', saDate: '2026-06-08', dateOfSupply: '2026-07-19', reverseCharge: 'N',
    bookingStation: 'Kamarhatty Godown', destination: 'Lamination Plant',
    stateCode: 'West Bengal / 19', panNo: 'AACCK492R0', pcsoNo: '', contractNo: '', contractRate: '',
    gNoteNo: '5080', gNoteDate: '2026-06-08', brokerName: 'Avinash Sureka',
    billToName: 'R. Kumar & Company', billToAddress: '545/B, Hi Tech Chamber, Topsia Road South, Kolkata-700046', billToGstin: '19AFBPK2339C1ZT', billToPan: '', billToState: 'West Bengal', billToCode: '19',
    shipToName: 'Hanuman Uddyog LLP', shipToAddress: '1, Graham Road, PO: Kamarhatty 878, Kolkata - 700058', shipToGstin: '19AAQFH5441Q1ZI', shipToPan: '', shipToState: 'West Bengal', shipToCode: '19',
    hsnCode: '53010015', description: 'Hessian Cloth 51 Inch - 270 GSM 13 X 13', bsTs: '7', weight: '1.536', quantity: '4366', unit: 'Mtrs', rate: '80',
    grossValue: '349280', printingCharges: '0', handlingCharges: '0', insuranceCharges: '0', freightCharges: '0',
    sgstPercent: '2.5', cgstPercent: '2.5', igstPercent: '0', tcsPercent: '0', tcsOnAmount: '0', freightAdvance: '0', marketingTax: '0',
    totalAmountWords: 'Three Lakh Sixty Six Thousand Seven Hundred Forty Four Only',
    remarks: 'DELIVERY FROM GODOWN AT 1 GRAHAM ROAD KOLKATA 700058.',
    bankName: 'YES BANK', bankAccount: '019081300002831', bankIfsc: 'YESB0000190',
    bankBranch: 'Stephen House, 56 A, Hemanta Basu Sarani, Ground & Mezzanine Floor, Kolkata-700001', paymentTerms: '7 Days',
  },
  {
    id: 2, materialType: 'Cotton Sheet', supplierName: 'Hannuman Textile Mills Pvt. Ltd.', stockInDate: '2026-07-01', status: 'Received',
    invoiceNo: '26-27/49', eWayBillNo: '3422 7880 9951', invoiceDate: '2026-06-26',
    deliveryNote: '', modeOfPayment: '', referenceNoDate: '', otherReferences: '',
    buyerOrderNo: '', buyerOrderDate: '', dispatchDocNo: '', deliveryNoteDate: '',
    dispatchedThrough: 'EITA Logisolutions Pvt. Ltd.', destination: 'KOLKATA', termsOfDelivery: '',
    supplierGstin: '06AAICH2123C1Z7', supplierState: 'Haryana', supplierCode: '06',
    consigneeName: 'R Kumar & Company', consigneeAddress: 'Hi-Tech Chamber, 3rd Floor, Kolkata-700046', consigneeGstin: '19AFBPK2339C1ZT', consigneePan: 'AFBPK2339C', consigneeState: 'West Bengal', consigneeCode: '19', consigneePlaceOfSupply: 'West Bengal',
    buyerName: 'R Kumar & Company', buyerAddress: 'Hi-Tech Chamber, 3rd Floor, Kolkata-700046', buyerGstin: '19AFBPK2339C1ZT', buyerPan: 'AFBPK2339C', buyerState: 'West Bengal', buyerCode: '19', buyerPlaceOfSupply: 'West Bengal',
    description: '420 GSM 60"', hsnSac: '520912', quantity: '1770', unit: 'MTR', ratePer: 'MTR', rate: '147',
    igstOutputPercent: '5', igstOutputAmount: '13009.50', roundOff: '0.50',
    totalAmountWords: 'INR Two Lakh Seventy Three Thousand Two Hundred Only',
    taxableValue: '260190', taxIgstRate: '5', taxIgstAmount: '13009.50', totalTaxAmount: '13009.50',
    taxAmountWords: 'INR Thirteen Thousand Nine and Fifty paise Only',
    bankName: 'HDFC BANK', bankAccount: '50200114275391', bankIfscCode: 'HDFC0000572',
    declaration: 'We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.',
  },
]

// ─────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────
export default function RawMaterial() {
  const [items, setItems]       = useState(initialData)
  const [search, setSearch]     = useState('')
  const [filterType, setFilter] = useState('All')
  const [dialog, setDialog]     = useState(false)
  const [viewItem, setViewItem] = useState(null)
  const [editId, setEditId]     = useState(null)
  const [form, setForm]         = useState(emptyForm('Jute Sheet'))
  const [deleteId, setDeleteId] = useState(null)

  const filtered = items.filter(i => {
    const s = search.toLowerCase()
    return (filterType === 'All' || i.materialType === filterType) &&
      (i.supplierName.toLowerCase().includes(s) || i.invoiceNo.toLowerCase().includes(s) || (i.description||'').toLowerCase().includes(s))
  })

  const openAdd  = () => { setEditId(null); setForm(emptyForm('Jute Sheet')); setDialog(true) }
  const openEdit = (item) => { setEditId(item.id); setForm({ ...item, goodsRows: item.goodsRows || [emptyRow()] }); setDialog(true) }
  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }))
  const setMat = (v) => setForm(emptyForm(v))

  // goodsRows handlers
  const setRow = (idx, k) => (e) => setForm(p => {
    const rows = [...p.goodsRows]
    rows[idx] = { ...rows[idx], [k]: e.target.value }
    return { ...p, goodsRows: rows }
  })
  const handleProductSelect = (idx) => (e) => {
    const value = e.target.value
    const found = PURCHASE_ITEMS.find(p => `${p.name} — ${p.color}` === value)
    setForm(p => {
      const rows = [...p.goodsRows]
      rows[idx] = {
        ...rows[idx],
        description: value,
        unit: found ? found.uom : rows[idx].unit,
      }
      return { ...p, goodsRows: rows }
    })
  }

  const addRow    = () => setForm(p => ({ ...p, goodsRows: [...p.goodsRows, emptyRow()] }))
  const removeRow = (idx) => setForm(p => ({ ...p, goodsRows: p.goodsRows.filter((_, i) => i !== idx) }))

  const handleSave = () => {
    if (!form.invoiceNo || !form.supplierName) return
    if (editId) setItems(p => p.map(i => i.id === editId ? { ...form, id: editId } : i))
    else setItems(p => [...p, { ...form, id: Date.now() }])
    setDialog(false)
  }
  const handleDelete = () => { setItems(p => p.filter(i => i.id !== deleteId)); setDeleteId(null) }

  const isJute = form.materialType === 'Jute Sheet'

  const jTotals = isJute ? calcJuteTotal(form) : { gross: 0, taxable: 0, sgst: 0, cgst: 0, igst: 0, tcs: 0, total: 0 }
  const cTotals = !isJute ? calcCottonTotal(form) : { base: 0, igst: 0, total: 0 }

  const totalJute   = items.filter(i => i.materialType === 'Jute Sheet').reduce((s,i) => s + num(i.quantity), 0)
  const totalCotton = items.filter(i => i.materialType === 'Cotton Sheet').reduce((s,i) => s + num(i.quantity), 0)

  const getItemTotal = (item) => {
    if (item.materialType === 'Jute Sheet') return calcJuteTotal(item).total
    return calcCottonTotal(item).total
  }
  const totalValue = items.reduce((s, i) => s + getItemTotal(i), 0)

  return (
    <Box className="page-enter">
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: 'rgba(245,158,11,0.12)', color: '#F59E0B', borderRadius: 2, width: 46, height: 46 }}>
            <WarehouseRoundedIcon />
          </Avatar>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, lineHeight: 1.2 }}>Raw Material Inventory</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>Jute Sheet & Cotton Sheet — complete bill data entry</Typography>
          </Box>
        </Box>
        <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={openAdd}
          sx={{ borderRadius: 2, fontWeight: 700, background: 'linear-gradient(135deg,#6C63FF,#9B94FF)', boxShadow: '0 4px 14px rgba(108,99,255,0.35)' }}>
          Add Stock Entry
        </Button>
      </Box>

      {/* Summary */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Total Entries',      value: items.length,                        color: '#6C63FF', bg: 'rgba(108,99,255,0.08)' },
          { label: 'Jute Sheet (Mtrs)',  value: totalJute.toLocaleString(),          color: '#F59E0B', bg: 'rgba(245,158,11,0.08)' },
          { label: 'Cotton Sheet (MTR)', value: totalCotton.toLocaleString(),        color: '#EC4899', bg: 'rgba(236,72,153,0.08)' },
          { label: 'Total Value (₹)',    value: `₹${fmtINR(totalValue)}`,           color: '#00C07F', bg: 'rgba(0,192,127,0.08)' },
        ].map(s => (
          <Grid key={s.label} size={{ xs: 6, md: 3 }}>
            <Card><CardContent sx={{ p: 2.5 }}>
              <Typography variant="h5" sx={{ fontWeight: 800, color: s.color, mb: 0.25 }}>{s.value}</Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>{s.label}</Typography>
            </CardContent></Card>
          </Grid>
        ))}
      </Grid>

      {/* Filters */}
      <Card sx={{ mb: 2.5 }}>
        <CardContent sx={{ p: 2, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField size="small" placeholder="Search by supplier, invoice, description..."
            value={search} onChange={e => setSearch(e.target.value)} sx={{ flex: 1, minWidth: 240 }}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchRoundedIcon sx={{ color: '#9CA3AF', fontSize: 18 }} /></InputAdornment> }} />
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <FilterListRoundedIcon sx={{ color: 'text.secondary', fontSize: 18 }} />
            {['All', ...MATERIAL_TYPES].map(t => (
              <Chip key={t} label={t} size="small" clickable onClick={() => setFilter(t)}
                color={filterType === t ? 'primary' : 'default'} variant={filterType === t ? 'filled' : 'outlined'}
                sx={{ fontWeight: 600 }} />
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <Box sx={{ display: 'grid', gridTemplateColumns: COL, px: 2, py: 1.25, bgcolor: '#F8F9FC', borderBottom: '1px solid', borderColor: 'divider' }}>
          {HEADS.map(h => <Typography key={h} variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.6rem', letterSpacing: '0.04em' }}>{h}</Typography>)}
        </Box>
        {filtered.length === 0
          ? <Box sx={{ py: 6, textAlign: 'center' }}><Typography variant="body2" sx={{ color: 'text.secondary' }}>No entries found.</Typography></Box>
          : <Stack divider={<Divider />}>
              {filtered.map(item => {
                const t = getItemTotal(item)
                const gstPct = item.materialType === 'Jute Sheet'
                  ? `${item.sgstPercent}+${item.cgstPercent}+${item.igstPercent}`
                  : `${item.igstOutputPercent}%`
                return (
                  <Box key={item.id} sx={{ display: 'grid', gridTemplateColumns: COL, px: 2, py: 1.5, alignItems: 'center', '&:hover': { bgcolor: 'rgba(108,99,255,0.03)' }, transition: 'background 0.15s' }}>
                    <Chip label={item.materialType === 'Jute Sheet' ? 'Jute' : 'Cotton'} size="small"
                      sx={{ fontWeight: 700, fontSize: '0.65rem', height: 20, width: 'fit-content',
                        bgcolor: item.materialType === 'Jute Sheet' ? 'rgba(245,158,11,0.12)' : 'rgba(236,72,153,0.12)',
                        color: item.materialType === 'Jute Sheet' ? '#F59E0B' : '#EC4899' }} />
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.primary', display: 'block' }} noWrap>{item.supplierName}</Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.62rem' }} noWrap>{item.description}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 600, color: 'primary.main' }}>{item.invoiceNo}</Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.62rem', display: 'block' }}>{item.invoiceDate}</Typography>
                    </Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {item.stockInDate ? new Date(item.stockInDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' }) : '—'}
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>{item.quantity} <span style={{ color: '#9CA3AF', fontWeight: 400 }}>{item.unit}</span></Typography>
                    <Typography variant="caption">₹{item.rate}</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.6rem' }}>{gstPct}%</Typography>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#00C07F' }}>₹{fmtINR(t)}</Typography>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Tooltip title="View"><IconButton size="small" sx={{ color: 'text.secondary' }} onClick={() => setViewItem(item)}><VisibilityRoundedIcon fontSize="small" /></IconButton></Tooltip>
                      <Tooltip title="Edit"><IconButton size="small" sx={{ color: 'primary.main' }} onClick={() => openEdit(item)}><EditRoundedIcon fontSize="small" /></IconButton></Tooltip>
                      <Tooltip title="Delete"><IconButton size="small" sx={{ color: 'error.main' }} onClick={() => setDeleteId(item.id)}><DeleteRoundedIcon fontSize="small" /></IconButton></Tooltip>
                    </Box>
                  </Box>
                )
              })}
            </Stack>
        }
        <Box sx={{ px: 2, py: 1.5, bgcolor: '#F8F9FC', borderTop: '1px solid', borderColor: 'divider' }}>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>Showing {filtered.length} of {items.length} entries</Typography>
        </Box>
      </Card>

      {/* ══════════════════════════════════════════
          Add / Edit Dialog
      ══════════════════════════════════════════ */}
      <Dialog open={dialog} onClose={() => setDialog(false)} maxWidth="lg" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>
          {editId ? 'Edit Stock Entry' : 'New Raw Material Stock Entry'}
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2.5, maxHeight: '80vh', overflowY: 'auto' }}>
          <Grid container spacing={1.5}>

            {false && <>

            {/* ── Material Type & Stock IN ── */}
            <Sec title="Material & Stock Details">
              <Grid size={12}>
                <FL req>Material Type</FL>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {MATERIAL_TYPES.map(m => (
                    <Chip key={m} label={m} clickable onClick={() => setMat(m)} sx={{
                      fontWeight: 700,
                      bgcolor: form.materialType === m ? (m === 'Jute Sheet' ? 'rgba(245,158,11,0.15)' : 'rgba(236,72,153,0.15)') : 'transparent',
                      color: form.materialType === m ? (m === 'Jute Sheet' ? '#F59E0B' : '#EC4899') : 'text.secondary',
                      border: '1px solid', borderColor: form.materialType === m ? (m === 'Jute Sheet' ? '#F59E0B' : '#EC4899') : 'divider' }} />
                  ))}
                </Box>
              </Grid>
              <FInput label="Supplier Name" value={form.supplierName} onChange={set('supplierName')} select req size={{ xs: 12, sm: 6 }}>
                {(isJute ? JUTE_SUPPLIERS : COTTON_SUPPLIERS).map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </FInput>
              <FInput label="Date of Stock IN" value={form.stockInDate} onChange={set('stockInDate')} type="date" req size={{ xs: 12, sm: 3 }} />
              <Grid size={{ xs: 12, sm: 3 }}>
                <FL>Status</FL>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {['Received', 'Pending'].map(s => (
                    <Chip key={s} label={s} clickable onClick={() => setForm(p => ({ ...p, status: s }))}
                      color={form.status === s ? statusColor[s] : 'default'} variant={form.status === s ? 'filled' : 'outlined'} sx={{ fontWeight: 700 }} />
                  ))}
                </Box>
              </Grid>
            </Sec>

            {/* ════════════════════════════════════
                JUTE FIELDS
            ════════════════════════════════════ */}
            {isJute && <>
              <Sec title="Invoice Header — Jute">
                <FInput label="Invoice No" value={form.invoiceNo} onChange={set('invoiceNo')} req size={{ xs: 12, sm: 3 }} placeholder="B/26-27/8249" />
                <FInput label="Invoice Date" value={form.invoiceDate} onChange={set('invoiceDate')} type="date" req size={{ xs: 12, sm: 3 }} />
                <FInput label="Transport Mode" value={form.transportMode} onChange={set('transportMode')} select size={{ xs: 12, sm: 3 }}>
                  {TRANSPORT_MODES.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                </FInput>
                <FInput label="Vehicle Number" value={form.vehicleNumber} onChange={set('vehicleNumber')} size={{ xs: 12, sm: 3 }} placeholder="WB01AB1234 / 0000" />
                <FInput label="L.P. No" value={form.lpNo} onChange={set('lpNo')} size={{ xs: 12, sm: 3 }} placeholder="00/26-27/0251" />
                <FInput label="L.P. Date" value={form.lpDate} onChange={set('lpDate')} type="date" size={{ xs: 12, sm: 3 }} />
                <FInput label="S.A. No" value={form.saNo} onChange={set('saNo')} size={{ xs: 12, sm: 3 }} placeholder="SA/26-27/0080" />
                <FInput label="S.A. Date" value={form.saDate} onChange={set('saDate')} type="date" size={{ xs: 12, sm: 3 }} />
                <FInput label="Date of Supply" value={form.dateOfSupply} onChange={set('dateOfSupply')} type="date" size={{ xs: 12, sm: 3 }} />
                <FInput label="Reverse Charge (Y/N)" value={form.reverseCharge} onChange={set('reverseCharge')} select size={{ xs: 12, sm: 3 }}>
                  {['Y','N'].map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
                </FInput>
                <FInput label="Booking Station" value={form.bookingStation} onChange={set('bookingStation')} size={{ xs: 12, sm: 3 }} placeholder="Kamarhatty Godown" />
                <FInput label="Destination" value={form.destination} onChange={set('destination')} size={{ xs: 12, sm: 3 }} placeholder="Lamination Plant" />
                <FInput label="State / Code" value={form.stateCode} onChange={set('stateCode')} size={{ xs: 12, sm: 3 }} placeholder="West Bengal / 19" />
                <FInput label="PAN No" value={form.panNo} onChange={set('panNo')} size={{ xs: 12, sm: 3 }} placeholder="AACCK492R0" />
                <FInput label="PCSO No" value={form.pcsoNo} onChange={set('pcsoNo')} size={{ xs: 12, sm: 3 }} />
                <FInput label="Contract No" value={form.contractNo} onChange={set('contractNo')} size={{ xs: 12, sm: 3 }} />
                <FInput label="Contract Rate" value={form.contractRate} onChange={set('contractRate')} size={{ xs: 12, sm: 3 }} />
                <FInput label="G. Note No" value={form.gNoteNo} onChange={set('gNoteNo')} size={{ xs: 12, sm: 3 }} placeholder="5080" />
                <FInput label="G. Note Date" value={form.gNoteDate} onChange={set('gNoteDate')} type="date" size={{ xs: 12, sm: 3 }} />
                <FInput label="Broker Name" value={form.brokerName} onChange={set('brokerName')} size={{ xs: 12, sm: 6 }} placeholder="Avinash Sureka" />
              </Sec>

              <Sec title="Bill To Party — Jute">
                <FInput label="Name" value={form.billToName} onChange={set('billToName')} size={{ xs: 12, sm: 6 }} placeholder="R. Kumar & Company" />
                <FInput label="GSTIN" value={form.billToGstin} onChange={set('billToGstin')} size={{ xs: 12, sm: 3 }} placeholder="19AFBPK2339C1ZT" />
                <FInput label="PAN No" value={form.billToPan} onChange={set('billToPan')} size={{ xs: 12, sm: 3 }} />
                <FInput label="Address" value={form.billToAddress} onChange={set('billToAddress')} size={12} multiline rows={2} />
                <FInput label="State" value={form.billToState} onChange={set('billToState')} size={{ xs: 12, sm: 3 }} />
                <FInput label="Code" value={form.billToCode} onChange={set('billToCode')} size={{ xs: 12, sm: 3 }} />
              </Sec>

              <Sec title="Ship To Party — Jute">
                <FInput label="Name" value={form.shipToName} onChange={set('shipToName')} size={{ xs: 12, sm: 6 }} placeholder="Hanuman Uddyog LLP" />
                <FInput label="GSTIN" value={form.shipToGstin} onChange={set('shipToGstin')} size={{ xs: 12, sm: 3 }} placeholder="19AAQFH5441Q1ZI" />
                <FInput label="PAN No" value={form.shipToPan} onChange={set('shipToPan')} size={{ xs: 12, sm: 3 }} />
                <FInput label="Address" value={form.shipToAddress} onChange={set('shipToAddress')} size={12} multiline rows={2} />
                <FInput label="State" value={form.shipToState} onChange={set('shipToState')} size={{ xs: 12, sm: 3 }} />
                <FInput label="Code" value={form.shipToCode} onChange={set('shipToCode')} size={{ xs: 12, sm: 3 }} />
              </Sec>

              <Sec title="Goods Details — Jute">
                <FInput label="HSN Code" req value={form.hsnCode} onChange={set('hsnCode')} size={{ xs: 12, sm: 3 }} placeholder="53010015" />
                <FInput label="Description" req value={form.description} onChange={set('description')} size={{ xs: 12, sm: 9 }} placeholder="Hessian Cloth 51 Inch - 270 GSM 13 X 13" />
                <FInput label="B/S or T/S (Bags/Tons)" value={form.bsTs} onChange={set('bsTs')} size={{ xs: 12, sm: 3 }} type="number" placeholder="7" />
                <FInput label="Weight (Metric Tons)" value={form.weight} onChange={set('weight')} size={{ xs: 12, sm: 3 }} type="number" placeholder="1.536" />
                <FInput label="Quantity (Mtrs)" req value={form.quantity} onChange={set('quantity')} size={{ xs: 12, sm: 3 }} type="number" placeholder="4366" />
                <FInput label="Rate per Mtr (₹)" req value={form.rate} onChange={set('rate')} size={{ xs: 12, sm: 3 }} type="number" placeholder="80.00" />
              </Sec>

              <Sec title="Charges & Tax — Jute">
                <ReadBox label="Gross Value (₹)" value={jTotals.gross} size={{ xs: 12, sm: 4 }} />
                <FInput label="Printing Charges (₹)" value={form.printingCharges} onChange={set('printingCharges')} size={{ xs: 12, sm: 4 }} type="number" />
                <FInput label="Handling Charges (₹)" value={form.handlingCharges} onChange={set('handlingCharges')} size={{ xs: 12, sm: 4 }} type="number" />
                <FInput label="Insurance Charges (₹)" value={form.insuranceCharges} onChange={set('insuranceCharges')} size={{ xs: 12, sm: 4 }} type="number" />
                <FInput label="Freight Charges (₹)" value={form.freightCharges} onChange={set('freightCharges')} size={{ xs: 12, sm: 4 }} type="number" />
                <ReadBox label="Taxable Amount (₹)" value={jTotals.taxable} size={{ xs: 12, sm: 4 }} />

                <FInput label="SGST %" value={form.sgstPercent} onChange={set('sgstPercent')} select size={{ xs: 12, sm: 2 }}>
                  {GST_RATES.map(g => <MenuItem key={g} value={g}>{g}%</MenuItem>)}
                </FInput>
                <ReadBox label="SGST Amount (₹)" value={jTotals.sgst} size={{ xs: 12, sm: 4 }} />
                <FInput label="CGST %" value={form.cgstPercent} onChange={set('cgstPercent')} select size={{ xs: 12, sm: 2 }}>
                  {GST_RATES.map(g => <MenuItem key={g} value={g}>{g}%</MenuItem>)}
                </FInput>
                <ReadBox label="CGST Amount (₹)" value={jTotals.cgst} size={{ xs: 12, sm: 4 }} />
                <FInput label="IGST %" value={form.igstPercent} onChange={set('igstPercent')} select size={{ xs: 12, sm: 2 }}>
                  {GST_RATES.map(g => <MenuItem key={g} value={g}>{g}%</MenuItem>)}
                </FInput>
                <ReadBox label="IGST Amount (₹)" value={jTotals.igst} size={{ xs: 12, sm: 4 }} />
                <FInput label="TCS %" value={form.tcsPercent} onChange={set('tcsPercent')} size={{ xs: 12, sm: 3 }} type="number" />
                <FInput label="TCS On Amount (₹)" value={form.tcsOnAmount} onChange={set('tcsOnAmount')} size={{ xs: 12, sm: 3 }} type="number" />
                <FInput label="Freight Advance (₹)" value={form.freightAdvance} onChange={set('freightAdvance')} size={{ xs: 12, sm: 3 }} type="number" />
                <FInput label="LESS: Marketing Tax (₹)" value={form.marketingTax} onChange={set('marketingTax')} size={{ xs: 12, sm: 3 }} type="number" />
                <Grid size={12}>
                  <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(0,192,127,0.08)', border: '1px solid rgba(0,192,127,0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body1" sx={{ fontWeight: 700 }}>Total Amount (₹)</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 900, color: '#00C07F' }}>₹{fmtINR(jTotals.total)}</Typography>
                  </Box>
                </Grid>
                <FInput label="Total Invoice Amount in Words" value={form.totalAmountWords} onChange={set('totalAmountWords')} size={12} placeholder="Three Lakh Sixty Six Thousand Seven Hundred Forty Four Only" />
              </Sec>

              <Sec title="Remarks & Bank Details — Jute">
                <FInput label="Remarks" value={form.remarks} onChange={set('remarks')} size={12} multiline rows={2} placeholder="DELIVERY FROM GODOWN AT 1 GRAHAM ROAD KOLKATA 700058." />
                <FInput label="Bank Name" value={form.bankName} onChange={set('bankName')} size={{ xs: 12, sm: 4 }} placeholder="YES BANK" />
                <FInput label="Bank A/c No" value={form.bankAccount} onChange={set('bankAccount')} size={{ xs: 12, sm: 4 }} placeholder="019081300002831" />
                <FInput label="Bank IFSC" value={form.bankIfsc} onChange={set('bankIfsc')} size={{ xs: 12, sm: 4 }} placeholder="YESB0000190" />
                <FInput label="Branch Address" value={form.bankBranch} onChange={set('bankBranch')} size={{ xs: 12, sm: 8 }} multiline rows={2} />
                <FInput label="Payment Terms" value={form.paymentTerms} onChange={set('paymentTerms')} size={{ xs: 12, sm: 4 }} placeholder="7 Days" />
              </Sec>
            </>}

            {/* ════════════════════════════════════
                COTTON FIELDS
            ════════════════════════════════════ */}
            {!isJute && <>
              <Sec title="Invoice Header — Cotton">
                <FInput label="Invoice No" req value={form.invoiceNo} onChange={set('invoiceNo')} size={{ xs: 12, sm: 3 }} placeholder="26-27/49" />
                <FInput label="Invoice Date (Dated)" req value={form.invoiceDate} onChange={set('invoiceDate')} type="date" size={{ xs: 12, sm: 3 }} />
                <FInput label="E-Way Bill No" value={form.eWayBillNo} onChange={set('eWayBillNo')} size={{ xs: 12, sm: 3 }} placeholder="3422 7880 9951" />
                <FInput label="Delivery Note" value={form.deliveryNote} onChange={set('deliveryNote')} size={{ xs: 12, sm: 3 }} />
                <FInput label="Mode / Terms of Payment" value={form.modeOfPayment} onChange={set('modeOfPayment')} size={{ xs: 12, sm: 4 }} />
                <FInput label="Reference No & Date" value={form.referenceNoDate} onChange={set('referenceNoDate')} size={{ xs: 12, sm: 4 }} />
                <FInput label="Other References" value={form.otherReferences} onChange={set('otherReferences')} size={{ xs: 12, sm: 4 }} />
                <FInput label="Buyer's Order No" value={form.buyerOrderNo} onChange={set('buyerOrderNo')} size={{ xs: 12, sm: 4 }} />
                <FInput label="Buyer's Order Date" value={form.buyerOrderDate} onChange={set('buyerOrderDate')} type="date" size={{ xs: 12, sm: 4 }} />
                <FInput label="Dispatch Doc No" value={form.dispatchDocNo} onChange={set('dispatchDocNo')} size={{ xs: 12, sm: 4 }} />
                <FInput label="Delivery Note Date" value={form.deliveryNoteDate} onChange={set('deliveryNoteDate')} type="date" size={{ xs: 12, sm: 4 }} />
                <FInput label="Dispatched Through" value={form.dispatchedThrough} onChange={set('dispatchedThrough')} size={{ xs: 12, sm: 4 }} placeholder="EITA Logisolutions Pvt. Ltd." />
                <FInput label="Destination" value={form.destination} onChange={set('destination')} size={{ xs: 12, sm: 4 }} placeholder="KOLKATA" />
                <FInput label="Terms of Delivery" value={form.termsOfDelivery} onChange={set('termsOfDelivery')} size={{ xs: 12, sm: 4 }} />
              </Sec>

              <Sec title="Supplier Details — Cotton">
                <FInput label="Supplier GSTIN/UIN" value={form.supplierGstin} onChange={set('supplierGstin')} size={{ xs: 12, sm: 4 }} placeholder="06AAICH2123C1Z7" />
                <FInput label="Supplier State" value={form.supplierState} onChange={set('supplierState')} size={{ xs: 12, sm: 4 }} placeholder="Haryana" />
                <FInput label="State Code" value={form.supplierCode} onChange={set('supplierCode')} size={{ xs: 12, sm: 4 }} placeholder="06" />
              </Sec>

              <Sec title="Consignee (Ship To) — Cotton">
                <FInput label="Name" value={form.consigneeName} onChange={set('consigneeName')} size={{ xs: 12, sm: 6 }} placeholder="R Kumar & Company" />
                <FInput label="GSTIN/UIN" value={form.consigneeGstin} onChange={set('consigneeGstin')} size={{ xs: 12, sm: 3 }} placeholder="19AFBPK2339C1ZT" />
                <FInput label="PAN/IT No" value={form.consigneePan} onChange={set('consigneePan')} size={{ xs: 12, sm: 3 }} placeholder="AFBPK2339C" />
                <FInput label="Address" value={form.consigneeAddress} onChange={set('consigneeAddress')} size={12} multiline rows={2} />
                <FInput label="State Name" value={form.consigneeState} onChange={set('consigneeState')} size={{ xs: 12, sm: 4 }} />
                <FInput label="Code" value={form.consigneeCode} onChange={set('consigneeCode')} size={{ xs: 12, sm: 4 }} />
                <FInput label="Place of Supply" value={form.consigneePlaceOfSupply} onChange={set('consigneePlaceOfSupply')} size={{ xs: 12, sm: 4 }} />
              </Sec>

              <Sec title="Buyer (Bill To) — Cotton">
                <FInput label="Name" value={form.buyerName} onChange={set('buyerName')} size={{ xs: 12, sm: 6 }} placeholder="R Kumar & Company" />
                <FInput label="GSTIN/UIN" value={form.buyerGstin} onChange={set('buyerGstin')} size={{ xs: 12, sm: 3 }} placeholder="19AFBPK2339C1ZT" />
                <FInput label="PAN/IT No" value={form.buyerPan} onChange={set('buyerPan')} size={{ xs: 12, sm: 3 }} placeholder="AFBPK2339C" />
                <FInput label="Address" value={form.buyerAddress} onChange={set('buyerAddress')} size={12} multiline rows={2} />
                <FInput label="State Name" value={form.buyerState} onChange={set('buyerState')} size={{ xs: 12, sm: 4 }} />
                <FInput label="Code" value={form.buyerCode} onChange={set('buyerCode')} size={{ xs: 12, sm: 4 }} />
                <FInput label="Place of Supply" value={form.buyerPlaceOfSupply} onChange={set('buyerPlaceOfSupply')} size={{ xs: 12, sm: 4 }} />
              </Sec>

              <Sec title="Goods Details — Cotton">
                <FInput label="Description of Goods" req value={form.description} onChange={set('description')} size={{ xs: 12, sm: 6 }} placeholder='420 GSM 60"' />
                <FInput label="HSN/SAC Code" value={form.hsnSac} onChange={set('hsnSac')} size={{ xs: 12, sm: 3 }} placeholder="520912" />
                <FInput label="Per (Unit)" value={form.ratePer} onChange={set('ratePer')} size={{ xs: 12, sm: 3 }} placeholder="MTR" />
                <FInput label="Quantity" req value={form.quantity} onChange={set('quantity')} size={{ xs: 12, sm: 3 }} type="number" placeholder="1770" />
                <FInput label="Unit" value={form.unit} onChange={set('unit')} size={{ xs: 12, sm: 3 }} placeholder="MTR" />
                <FInput label="Rate (₹)" req value={form.rate} onChange={set('rate')} size={{ xs: 12, sm: 3 }} type="number" placeholder="147.00" />
                <ReadBox label="Amount (₹)" value={cTotals.base} size={{ xs: 12, sm: 3 }} />
              </Sec>

              <Sec title="Tax & Amount — Cotton">
                <FInput label="IGST Output %" value={form.igstOutputPercent} onChange={set('igstOutputPercent')} select size={{ xs: 12, sm: 3 }}>
                  {GST_RATES.map(g => <MenuItem key={g} value={g}>{g}%</MenuItem>)}
                </FInput>
                <ReadBox label="IGST Amount (₹)" value={cTotals.igst} size={{ xs: 12, sm: 3 }} />
                <FInput label="Round Off (₹)" value={form.roundOff} onChange={set('roundOff')} size={{ xs: 12, sm: 3 }} type="number" />
                <Grid size={12}>
                  <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(0,192,127,0.08)', border: '1px solid rgba(0,192,127,0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body1" sx={{ fontWeight: 700 }}>Total Amount (₹)</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 900, color: '#00C07F' }}>₹{fmtINR(cTotals.total)}</Typography>
                  </Box>
                </Grid>
                <FInput label="Amount Chargeable in Words" value={form.totalAmountWords} onChange={set('totalAmountWords')} size={12} placeholder="INR Two Lakh Seventy Three Thousand Two Hundred Only" />

                {/* Tax Breakup */}
                <Grid size={12}><Typography variant="caption" sx={{ fontWeight: 800, color: '#6B7280', textTransform: 'uppercase', fontSize: '0.65rem' }}>GST Tax Breakup (HSN/SAC Wise)</Typography></Grid>
                <FInput label="HSN/SAC" value={form.hsnSac} onChange={set('hsnSac')} size={{ xs: 12, sm: 3 }} />
                <FInput label="Taxable Value (₹)" value={form.taxableValue || String(cTotals.base)} onChange={set('taxableValue')} size={{ xs: 12, sm: 3 }} type="number" />
                <FInput label="IGST Rate %" value={form.taxIgstRate} onChange={set('taxIgstRate')} size={{ xs: 12, sm: 2 }} type="number" />
                <FInput label="IGST Amount (₹)" value={form.taxIgstAmount || String(cTotals.igst)} onChange={set('taxIgstAmount')} size={{ xs: 12, sm: 2 }} type="number" />
                <FInput label="Total Tax Amount (₹)" value={form.totalTaxAmount || String(cTotals.igst)} onChange={set('totalTaxAmount')} size={{ xs: 12, sm: 2 }} type="number" />
                <FInput label="Tax Amount in Words" value={form.taxAmountWords} onChange={set('taxAmountWords')} size={12} placeholder="INR Thirteen Thousand Nine and Fifty paise Only" />
              </Sec>

              <Sec title="Bank Details — Cotton">
                <FInput label="Bank Name" value={form.bankName} onChange={set('bankName')} size={{ xs: 12, sm: 4 }} placeholder="HDFC BANK" />
                <FInput label="A/c No" value={form.bankAccount} onChange={set('bankAccount')} size={{ xs: 12, sm: 4 }} placeholder="50200114275391" />
                <FInput label="Branch & IFS Code" value={form.bankIfscCode} onChange={set('bankIfscCode')} size={{ xs: 12, sm: 4 }} placeholder="HDFC0000572" />
                <FInput label="Declaration" value={form.declaration} onChange={set('declaration')} size={12} multiline rows={2} />
              </Sec>
            </>}
            </>}

            <Sec title="Material & Stock Details">
              <FInput label="Material Type" value={form.materialType} onChange={(e) => setMat(e.target.value)} select req size={{ xs: 12, sm: 4 }}>
                {MATERIAL_TYPES.map(type => <MenuItem key={type} value={type}>{type}</MenuItem>)}
              </FInput>
              <FInput label="Supplier Name" value={form.supplierName} onChange={set('supplierName')} select req size={{ xs: 12, sm: 4 }}>
                {(isJute ? JUTE_SUPPLIERS : COTTON_SUPPLIERS).map(name => <MenuItem key={name} value={name}>{name}</MenuItem>)}
              </FInput>
              <FInput label="Date of Stock IN" value={form.stockInDate} onChange={set('stockInDate')} type="date" req size={{ xs: 12, sm: 4 }} />
            </Sec>

            <Sec title="Invoice Details">
              <FInput label="Invoice No" value={form.invoiceNo} onChange={set('invoiceNo')} req size={{ xs: 12, sm: 4 }} />
              <FInput label="Invoice Date" value={form.invoiceDate} onChange={set('invoiceDate')} type="date" req size={{ xs: 12, sm: 4 }} />
              <FInput label="Date of Supply" value={form.dateOfSupply} onChange={set('dateOfSupply')} type="date" size={{ xs: 12, sm: 4 }} />
              <FInput label="Destination" value={form.destination} onChange={set('destination')} size={{ xs: 12, sm: 4 }} />
              <FInput label="PAN No" value={form.panNo} onChange={set('panNo')} size={{ xs: 12, sm: 4 }} />
              <FInput label="GST No" value={form.gstNo} onChange={set('gstNo')} size={{ xs: 12, sm: 4 }} />
            </Sec>

<Sec title="Product Details">
              {/* Column Headers */}
              <Grid size={12}>
                <Box sx={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 80px 110px 90px 90px 100px 36px',
                  gap: 1, px: 0.5, pb: 0.5,
                  borderBottom: '1px solid', borderColor: 'divider',
                }}>
                  {['Description (Product — Color)', 'Unit', 'HSN Code', 'Quantity', 'Rate (₹)', 'Amount (₹)', ''].map(h => (
                    <Typography key={h} variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.6rem', letterSpacing: '0.04em' }}>{h}</Typography>
                  ))}
                </Box>
              </Grid>

              {/* Dynamic Rows */}
              {(form.goodsRows || [emptyRow()]).map((row, idx) => {
                const rowAmt = num(row.quantity) * num(row.rate)
                return (
                  <Grid key={idx} size={12}>
                    <Box sx={{
                      display: 'grid',
                      gridTemplateColumns: '2fr 80px 110px 90px 90px 100px 36px',
                      gap: 1, alignItems: 'center',
                      bgcolor: idx % 2 === 0 ? 'transparent' : 'rgba(108,99,255,0.02)',
                      borderRadius: 1, p: 0.5,
                    }}>
                      {/* Description */}
                      <TextField size="small" select value={row.description || ''} onChange={handleProductSelect(idx)}>
                        {PURCHASE_ITEMS.map(p => (
                          <MenuItem key={p.sku} value={`${p.name} — ${p.color}`}>
                            {p.name} — {p.color}
                          </MenuItem>
                        ))}
                      </TextField>
                      {/* Unit */}
                      <TextField size="small" select value={row.unit || 'MTR'} onChange={setRow(idx, 'unit')}>
                        {UNITS.map(u => <MenuItem key={u} value={u}>{u}</MenuItem>)}
                      </TextField>
                      {/* HSN */}
                      <TextField size="small" value={row.hsnCode || ''} onChange={setRow(idx, 'hsnCode')} placeholder="e.g. 53010015" />
                      {/* Qty */}
                      <TextField size="small" type="number" value={row.quantity || ''} onChange={setRow(idx, 'quantity')} placeholder="0" />
                      {/* Rate */}
                      <TextField size="small" type="number" value={row.rate || ''} onChange={setRow(idx, 'rate')} placeholder="0.00" />
                      {/* Amount (read-only) */}
                      <Box sx={{ height: 40, px: 1.5, borderRadius: 1.5, bgcolor: 'rgba(0,192,127,0.07)', border: '1px solid rgba(0,192,127,0.25)', display: 'flex', alignItems: 'center' }}>
                        <Typography variant="caption" sx={{ fontWeight: 800, color: '#00C07F' }}>₹{fmtINR(rowAmt)}</Typography>
                      </Box>
                      {/* Delete row */}
                      <IconButton size="small" onClick={() => removeRow(idx)}
                        disabled={(form.goodsRows || []).length === 1}
                        sx={{ color: 'error.main', opacity: (form.goodsRows || []).length === 1 ? 0.3 : 1 }}>
                        <DeleteRoundedIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Grid>
                )
              })}

              {/* Row Total + Add More */}
              <Grid size={12}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1 }}>
                  <Button size="small" startIcon={<AddRoundedIcon />} onClick={addRow} variant="outlined"
                    sx={{ borderRadius: 2, fontWeight: 700, borderStyle: 'dashed', color: '#6C63FF', borderColor: '#6C63FF' }}>
                    Add More Row
                  </Button>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>{(form.goodsRows || []).length} product(s)</Typography>
                    <Box sx={{ px: 2, py: 0.75, borderRadius: 2, bgcolor: 'rgba(0,192,127,0.1)', border: '1px solid rgba(0,192,127,0.3)' }}>
                      <Typography variant="body2" sx={{ fontWeight: 900, color: '#00C07F' }}>
                        Total: ₹{fmtINR((form.goodsRows || []).reduce((s, r) => s + num(r.quantity) * num(r.rate), 0))}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Grid>
            </Sec>

          </Grid>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button onClick={() => setDialog(false)} variant="outlined" sx={{ borderRadius: 2, fontWeight: 600 }}>Cancel</Button>
          <Button onClick={handleSave} variant="contained"
            sx={{ borderRadius: 2, fontWeight: 700, background: 'linear-gradient(135deg,#6C63FF,#9B94FF)', boxShadow: 'none' }}>
            {editId ? 'Save Changes' : 'Add Entry'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── View Dialog ── */}
      <Dialog open={!!viewItem} onClose={() => setViewItem(null)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Stock Entry — {viewItem?.materialType}</DialogTitle>
        <Divider />
        {viewItem && (
          <DialogContent sx={{ pt: 2, maxHeight: '70vh', overflowY: 'auto' }}>
            {(viewItem.materialType === 'Jute Sheet'
              ? [
                  { title: 'Basic', rows: [['Stock IN Date', viewItem.stockInDate], ['Status', viewItem.status], ['Invoice No', viewItem.invoiceNo], ['Invoice Date', viewItem.invoiceDate], ['Transport', viewItem.transportMode], ['Vehicle No', viewItem.vehicleNumber || '—']] },
                  { title: 'Jute Reference Numbers', rows: [['L.P. No', viewItem.lpNo||'—'], ['L.P. Date', viewItem.lpDate||'—'], ['S.A. No', viewItem.saNo||'—'], ['S.A. Date', viewItem.saDate||'—'], ['Date of Supply', viewItem.dateOfSupply||'—'], ['Reverse Charge', viewItem.reverseCharge||'—'], ['G.Note No', viewItem.gNoteNo||'—'], ['G.Note Date', viewItem.gNoteDate||'—'], ['PCSO No', viewItem.pcsoNo||'—'], ['Contract No', viewItem.contractNo||'—'], ['Broker', viewItem.brokerName||'—']] },
                  { title: 'Station', rows: [['Booking Station', viewItem.bookingStation||'—'], ['Destination', viewItem.destination||'—'], ['State/Code', viewItem.stateCode||'—']] },
                  { title: 'Goods', rows: [['HSN Code', viewItem.hsnCode||'—'], ['Description', viewItem.description||'—'], ['B/S or T/S', viewItem.bsTs||'—'], ['Weight (MT)', viewItem.weight||'—'], ['Quantity', `${viewItem.quantity} ${viewItem.unit}`], ['Rate', `₹${viewItem.rate}/Mtr`]] },
                  { title: 'Tax & Total', rows: [['Gross Value', `₹${fmtINR(calcJuteTotal(viewItem).gross)}`], ['Taxable Amount', `₹${fmtINR(calcJuteTotal(viewItem).taxable)}`], [`SGST @${viewItem.sgstPercent}%`, `₹${fmtINR(calcJuteTotal(viewItem).sgst)}`], [`CGST @${viewItem.cgstPercent}%`, `₹${fmtINR(calcJuteTotal(viewItem).cgst)}`], [`IGST @${viewItem.igstPercent}%`, `₹${fmtINR(calcJuteTotal(viewItem).igst)}`], ['Total Amount', `₹${fmtINR(calcJuteTotal(viewItem).total)}`], ['Amount in Words', viewItem.totalAmountWords||'—']] },
                  { title: 'Bank', rows: [['Bank Name', viewItem.bankName||'—'], ['A/c No', viewItem.bankAccount||'—'], ['IFSC', viewItem.bankIfsc||'—'], ['Payment Terms', viewItem.paymentTerms||'—']] },
                ]
              : [
                  { title: 'Basic', rows: [['Stock IN Date', viewItem.stockInDate], ['Status', viewItem.status], ['Invoice No', viewItem.invoiceNo], ['Date', viewItem.invoiceDate], ['E-Way Bill No', viewItem.eWayBillNo||'—']] },
                  { title: 'Dispatch', rows: [['Dispatched Through', viewItem.dispatchedThrough||'—'], ['Destination', viewItem.destination||'—'], ['Buyer Order No', viewItem.buyerOrderNo||'—']] },
                  { title: 'Goods', rows: [['Description', viewItem.description||'—'], ['HSN/SAC', viewItem.hsnSac||'—'], ['Quantity', `${viewItem.quantity} ${viewItem.unit}`], ['Rate', `₹${viewItem.rate} per ${viewItem.ratePer}`], ['Amount', `₹${fmtINR(calcCottonTotal(viewItem).base)}`]] },
                  { title: 'Tax & Total', rows: [[`IGST @${viewItem.igstOutputPercent}%`, `₹${fmtINR(calcCottonTotal(viewItem).igst)}`], ['Round Off', `₹${viewItem.roundOff}`], ['Total Amount', `₹${fmtINR(calcCottonTotal(viewItem).total)}`], ['Amount in Words', viewItem.totalAmountWords||'—'], ['Tax Amount in Words', viewItem.taxAmountWords||'—']] },
                  { title: 'Bank', rows: [['Bank Name', viewItem.bankName||'—'], ['A/c No', viewItem.bankAccount||'—'], ['IFS Code', viewItem.bankIfscCode||'—']] },
                ]
            ).map(section => (
              <Box key={section.title} sx={{ mb: 2 }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: '#6C63FF', textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.68rem' }}>{section.title}</Typography>
                <Divider sx={{ my: 0.75 }} />
                <Grid container spacing={1}>
                  {section.rows.map(([label, value]) => (
                    <Grid key={label} size={{ xs: 6 }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block' }}>{label}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary', wordBreak: 'break-word' }}>{value}</Typography>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            ))}
          </DialogContent>
        )}
        <Divider />
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setViewItem(null)} variant="contained"
            sx={{ borderRadius: 2, fontWeight: 700, background: 'linear-gradient(135deg,#6C63FF,#9B94FF)', boxShadow: 'none' }}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* ── Delete ── */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Delete Entry?</DialogTitle>
        <DialogContent><Typography variant="body2" sx={{ color: 'text.secondary' }}>This action cannot be undone.</Typography></DialogContent>
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button onClick={() => setDeleteId(null)} variant="outlined" sx={{ borderRadius: 2, fontWeight: 600 }}>Cancel</Button>
          <Button onClick={handleDelete} variant="contained" color="error" sx={{ borderRadius: 2, fontWeight: 700 }}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
