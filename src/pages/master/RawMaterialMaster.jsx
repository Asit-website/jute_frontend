import React, { useState, useEffect, useRef } from 'react'
import {
  Box, Typography, Card, CardContent, Button, Chip, IconButton,
  TextField, InputAdornment, Dialog, DialogTitle, DialogContent,
  DialogActions, Grid, Stack, Divider, Tooltip, Avatar, MenuItem, TablePagination, Alert
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import dayjs from 'dayjs'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded'
import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded'
import ShoppingCartCheckoutRoundedIcon from '@mui/icons-material/ShoppingCartCheckoutRounded'
import PaletteRoundedIcon from '@mui/icons-material/PaletteRounded'
import { getMasters, saveMaster, deleteMaster } from '../workflow/mockDb'

const UOMS = ['MTR', 'KG', 'PCS', 'ROLL', 'BAG', 'TON']
const statusColor = { Active: 'success', Inactive: 'error' }

// Palette of soft chip colors for color variants
const COLOR_PALETTE = [
  '#6C63FF','#F59E0B','#EC4899','#14B8A6','#00C07F',
  '#8B5CF6','#3B82F6','#EF4444','#F97316','#10B981',
  '#6366F1','#D946EF','#0EA5E9','#84CC16','#78716C',
]
const getChipColor = (idx) => COLOR_PALETTE[idx % COLOR_PALETTE.length]

const COL = '2fr 1.5fr 100px 120px 100px'
const HEADS = ['Raw Material Name', 'Colours', 'Unit', 'Status', 'Actions']

const emptyForm = { name: '', variants: [], uom: 'KG', description: '', status: 'Active' }

export default function RawMaterialMaster() {
  const [items, setItems]           = useState([])
  const [search, setSearch]         = useState('')
  const [dialog, setDialog]         = useState(false)
  const [editId, setEditId]         = useState(null)
  const [form, setForm]             = useState(emptyForm)
  const [colorInput, setColorInput] = useState('')
  const [deleteId, setDeleteId]     = useState(null)
  const [submitted, setSubmitted]   = useState(false)
  const [page, setPage]             = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(20)
  const [validationError, setValidationError] = useState('')
  const [uomOptions, setUomOptions] = useState(['MTR', 'KG', 'PCS', 'ROLL', 'BAG', 'TON'])
  const colorInputRef = useRef()

  const load = () => getMasters('materials').then(data => setItems(data)).catch(console.error)
  useEffect(() => {
    load()
    getMasters('units')
      .then(data => {
        const codes = data.filter(u => u.status === 'Active').map(u => u.name)
        if (codes.length > 0) {
          setUomOptions(codes)
        }
      })
      .catch(err => console.error(err))
  }, [])
  useEffect(() => { setPage(0) }, [search])

  // Group items by name for display
  const grouped = {}
  items.forEach(i => {
    if (!grouped[i.name]) grouped[i.name] = []
    grouped[i.name].push(i)
  })

  const filtered = Object.entries(grouped).filter(([name, entries]) =>
    name.toLowerCase().includes(search.toLowerCase()) ||
    entries.some(e => (e.color || '').toLowerCase().includes(search.toLowerCase()))
  ).sort((a, b) => a[0].localeCompare(b[0]))

  // ── Dialog open ────────────────────────────────────────────────────────────
  const openAdd = () => {
    setSubmitted(false)
    setEditId(null)
    setColorInput('')
    setValidationError('')
    setForm({
      ...emptyForm,
      uom: uomOptions.includes('KG') ? 'KG' : (uomOptions[0] || 'KG')
    })
    setDialog(true)
  }

  // Edit: opens the FIRST entry of the group (name, uom, status); editing all colors together
  const openEdit = (entries) => {
    setSubmitted(false)
    setEditId(entries.map(e => e.id)) // array of ids for this material group
    setColorInput('')
    setValidationError('')
    setForm({
      name: entries[0].name,
      variants: entries.map(e => ({
        color: e.color || '',
        openingQty: e.openingQty !== undefined && e.openingQty !== null ? e.openingQty : '',
        openingDate: e.openingDate || ''
      })).filter(v => v.color),
      uom: entries[0].uom || 'KG',
      description: entries[0].description || '',
      status: entries[0].status || 'Active',
    })
    setDialog(true)
  }

  // ── Color chip helpers ─────────────────────────────────────────────────────
  const addColorChip = () => {
    const val = colorInput.trim()
    if (!val) return
    setValidationError('')
    const normalize = (str) => (str || '').replace(/[\s\.]+/g, '').toLowerCase();
    const normVal = normalize(val);
    if (form.variants.some(v => normalize(v.color) === normVal)) {
      setValidationError('Colour can not be same.');
      setColorInput('')
      return
    }
    setForm({
      ...form,
      variants: [...form.variants, { color: val, openingQty: '', openingDate: '' }]
    })
    setColorInput('')
    colorInputRef.current?.focus()
  }

  const removeColorChip = (idx) => {
    setForm({
      ...form,
      variants: form.variants.filter((_, i) => i !== idx)
    })
  }

  const handleColorKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addColorChip() }
  }

  // ── Save ───────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setSubmitted(true)
    setValidationError('')
    if (!form.name) return

    // Normalize and check for duplicate Raw Material Name
    const normalize = (str) => (str || '').replace(/[\s\.]+/g, '').toLowerCase();
    const normFormName = normalize(form.name);

    for (const existingName of Object.keys(grouped)) {
      const isSelf = editId && items.some(it => editId.includes(it.id) && it.name === existingName);
      if (!isSelf && normalize(existingName) === normFormName) {
        setValidationError('Raw Material Name can not be same.');
        return;
      }
    }

    try {
      if (editId) {
        // Delete old entries for this material group, then re-create
        const oldIds = Array.isArray(editId) ? editId : [editId]
        for (const id of oldIds) await deleteMaster('materials', id)
      }
      // Create entries per color variant. If variants list is empty, save a single entry with empty color.
      const variantsToSave = form.variants.length > 0 ? form.variants : [{ color: '', openingQty: 0, openingDate: null }]
      for (const variant of variantsToSave) {
        await saveMaster('materials', {
          name: form.name,
          color: variant.color || '',
          uom: form.uom,
          description: form.description,
          status: form.status,
          openingDate: variant.openingDate || null,
          openingQty: variant.openingQty !== '' && variant.openingQty !== undefined && variant.openingQty !== null ? parseInt(variant.openingQty, 10) : 0
        })
      }
      await load()
      setDialog(false)
    } catch (err) {
      setValidationError(err.message)
    }
  }

  // ── Delete (whole group) ───────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteId) return
    try {
      const ids = Array.isArray(deleteId) ? deleteId : [deleteId]
      for (const id of ids) await deleteMaster('materials', id)
      await load()
      setDeleteId(null)
    } catch (err) {
      alert(err.message)
    }
  }

  const paginatedGroups = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)

  return (
    <Box className="page-enter">
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: 'rgba(108,99,255,0.1)', color: '#6C63FF', borderRadius: 2, width: 46, height: 46 }}>
            <ShoppingCartCheckoutRoundedIcon />
          </Avatar>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', lineHeight: 1.2 }}>Raw Material Master</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>Maintain raw materials catalog with colour variants</Typography>
          </Box>
        </Box>
        <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={openAdd}
          sx={{ borderRadius: 2, fontWeight: 700, background: 'linear-gradient(135deg,#6C63FF,#9B94FF)', boxShadow: '0 4px 14px rgba(108,99,255,0.35)' }}>
          Add Raw Material
        </Button>
      </Box>

      {/* Search */}
      <Card sx={{ mb: 2.5 }}>
        <CardContent sx={{ p: 2 }}>
          <TextField fullWidth size="small" placeholder="Search by Raw Material Name, colour..."
            value={search} onChange={e => setSearch(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchRoundedIcon sx={{ color: '#9CA3AF', fontSize: 18 }} /></InputAdornment> }} />
        </CardContent>
      </Card>

      {/* Table */}
      <Card sx={{ overflowX: 'auto' }}>
        <Box className="grid-table-row" sx={{ display: 'grid', gridTemplateColumns: COL, px: 2, py: 1.25, bgcolor: '#F8F9FC', borderBottom: '1px solid', borderColor: 'divider', minWidth: '900px' }}>
          {HEADS.map(h => (
            <Typography key={h} variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: '0.05em' }}>{h}</Typography>
          ))}
        </Box>

        {paginatedGroups.length === 0 ? (
          <Box sx={{ py: 6, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>No raw materials found.</Typography>
          </Box>
        ) : (
          <Stack divider={<Divider />}>
            {paginatedGroups.map(([name, entries]) => (
              <Box key={name} className="grid-table-row" sx={{ display: 'grid', gridTemplateColumns: COL, px: 2, py: 1.5, alignItems: 'center', '&:hover': { bgcolor: 'rgba(108,99,255,0.03)' }, transition: 'background 0.15s', minWidth: '900px' }}>
                {/* Name */}
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>{name}</Typography>
                  {entries[0].description && (
                    <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.68rem' }}>{entries[0].description}</Typography>
                  )}
                </Box>

                {/* Colour chips */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {entries.filter(e => e.color).length === 0 ? (
                    <Typography variant="caption" sx={{ color: 'text.disabled' }}>—</Typography>
                  ) : (
                    entries.filter(e => e.color).map((e, idx) => (
                      <Chip
                        key={e.id}
                        icon={<PaletteRoundedIcon style={{ fontSize: 11 }} />}
                        label={e.color}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          fontSize: '0.65rem',
                          height: 22,
                          bgcolor: `${getChipColor(idx)}18`,
                          color: getChipColor(idx),
                          border: `1px solid ${getChipColor(idx)}44`,
                          '& .MuiChip-icon': { color: getChipColor(idx) },
                        }}
                      />
                    ))
                  )}
                </Box>

                {/* UOM */}
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>{entries[0].uom}</Typography>

                {/* Status */}
                <Chip label={entries[0].status} size="small" color={statusColor[entries[0].status]} variant="outlined" sx={{ fontWeight: 600, fontSize: '0.65rem', height: 22, width: 'fit-content' }} />

                {/* Actions */}
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <Tooltip title="Edit">
                    <IconButton size="small" sx={{ color: 'primary.main' }} onClick={() => openEdit(entries)}>
                      <EditRoundedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete All Colours">
                    <IconButton size="small" sx={{ color: 'error.main' }} onClick={() => setDeleteId(entries.map(e => e.id))}>
                      <DeleteRoundedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            ))}
          </Stack>
        )}

        {filtered.length > rowsPerPage && (
          <TablePagination
            component="div" count={filtered.length} page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={e => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0) }}
            rowsPerPageOptions={[10, 20, 50]}
          />
        )}
        <Box sx={{ px: 2, py: 1.5, bgcolor: '#F8F9FC', borderTop: '1px solid', borderColor: 'divider' }}>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Showing {paginatedGroups.length} of {filtered.length} materials ({items.length} total colour variants)
          </Typography>
        </Box>
      </Card>

      {/* ── Add/Edit Dialog ──────────────────────────────────────────────────── */}
      <Dialog open={dialog} onClose={() => setDialog(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>{editId ? 'Edit Raw Material' : 'Add Raw Material'}</DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 2.5 }}>
          {validationError && (
            <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>
              {validationError}
            </Alert>
          )}
          <Grid container spacing={2}>
            {/* Name */}
            <Grid size={12}>
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#374151', mb: 0.5, display: 'block' }}>Raw Material Name *</Typography>
              <TextField fullWidth size="small" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Raw Jute Fibre A-Grade"
                error={submitted && !form.name}
                helperText={submitted && !form.name ? 'Required' : ''} />
            </Grid>

            {/* Colour chip input */}
            <Grid size={12}>
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#374151', mb: 0.5, display: 'block' }}>
                Colours <span style={{ color: '#9CA3AF', fontWeight: 400 }}>(Type & press Enter to add multiple)</span>
              </Typography>

              {/* Chips display */}
              {form.variants.filter(v => v.color).length > 0 && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 1.25 }}>
                  {form.variants.filter(v => v.color).map((v, idx) => (
                    <Chip
                      key={v.color}
                      icon={<PaletteRoundedIcon style={{ fontSize: 12 }} />}
                      label={v.color}
                      onDelete={() => {
                        const index = form.variants.findIndex(varItem => varItem.color === v.color);
                        if (index !== -1) removeColorChip(index);
                      }}
                      size="small"
                      sx={{
                        fontWeight: 700, fontSize: '0.7rem', height: 26,
                        bgcolor: `${getChipColor(idx)}18`,
                        color: getChipColor(idx),
                        border: `1px solid ${getChipColor(idx)}44`,
                        '& .MuiChip-icon': { color: getChipColor(idx) },
                        '& .MuiChip-deleteIcon': { color: `${getChipColor(idx)}99`, '&:hover': { color: getChipColor(idx) } },
                      }}
                    />
                  ))}
                </Box>
              )}

              {/* Color input row */}
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  inputRef={colorInputRef}
                  fullWidth size="small"
                  value={colorInput}
                  onChange={e => setColorInput(e.target.value)}
                  onKeyDown={handleColorKeyDown}
                  placeholder="e.g. Natural, Green, Blue..."
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PaletteRoundedIcon sx={{ fontSize: 18, color: '#9CA3AF' }} />
                      </InputAdornment>
                    )
                  }}
                />
                <Button
                  variant="outlined" size="small"
                  onClick={addColorChip}
                  disabled={!colorInput.trim()}
                  startIcon={<AddCircleOutlineRoundedIcon />}
                  sx={{ fontWeight: 700, borderRadius: 2, whiteSpace: 'nowrap', minWidth: 110 }}>
                  Add Colour
                </Button>
              </Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5, display: 'block' }}>
                Each colour will be tracked separately in inventory & PO.
              </Typography>
            </Grid>

            {/* Unit */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#374151', mb: 0.5, display: 'block' }}>Unit *</Typography>
              <TextField fullWidth size="small" select value={form.uom} onChange={e => setForm({ ...form, uom: e.target.value })}>
                {uomOptions.map(u => <MenuItem key={u} value={u}>{u}</MenuItem>)}
              </TextField>
            </Grid>

            {/* Status */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#374151', mb: 0.75, display: 'block' }}>Status</Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 0.25 }}>
                {['Active', 'Inactive'].map(s => (
                  <Chip key={s} label={s} clickable onClick={() => setForm({ ...form, status: s })}
                    color={form.status === s ? statusColor[s] : 'default'}
                    variant={form.status === s ? 'filled' : 'outlined'}
                    sx={{ fontWeight: 700 }} />
                ))}
              </Box>
            </Grid>

            {/* Color Variant Settings */}
            {form.variants.filter(v => v.color).length > 0 && (
              <Grid size={12}>
                <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, p: 2, bgcolor: '#F8F9FC' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary', mb: 1.5 }}>
                    Color Variant Settings (Opening Stock)
                  </Typography>
                  <Stack spacing={1.5}>
                    {form.variants.filter(v => v.color).map((v, idx) => (
                      <Box key={v.color} sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2, alignItems: 'center', bgcolor: '#ffffff', p: 1.5, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PaletteRoundedIcon sx={{ color: getChipColor(idx), fontSize: 18 }} />
                          <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                            {v.color}
                          </Typography>
                        </Box>
                        <DatePicker
                          label="Opening Date"
                          format="DD/MM/YYYY"
                          value={v.openingDate ? dayjs(v.openingDate) : null}
                          onChange={val => {
                            const updated = form.variants.map(varItem =>
                              varItem.color === v.color
                                ? { ...varItem, openingDate: val ? val.format('YYYY-MM-DD') : '' }
                                : varItem
                            )
                            setForm({ ...form, variants: updated })
                          }}
                          slotProps={{
                            textField: {
                              size: 'small',
                              fullWidth: true
                            }
                          }}
                        />
                        <TextField
                          label="Opening Qty"
                          size="small"
                          type="number"
                          value={v.openingQty}
                          onChange={e => {
                            const updated = form.variants.map(varItem =>
                              varItem.color === v.color
                                ? { ...varItem, openingQty: e.target.value }
                                : varItem
                            )
                            setForm({ ...form, variants: updated })
                          }}
                          placeholder="e.g. 100"
                        />
                      </Box>
                    ))}
                  </Stack>
                </Box>
              </Grid>
            )}

            {/* Description */}
            <Grid size={12}>
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#374151', mb: 0.5, display: 'block' }}>Description</Typography>
              <TextField fullWidth size="small" multiline rows={2} value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })} />
            </Grid>
          </Grid>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button onClick={() => setDialog(false)} variant="outlined" sx={{ borderRadius: 2, fontWeight: 600 }}>Cancel</Button>
          <Button onClick={handleSave} variant="contained"
            sx={{ borderRadius: 2, fontWeight: 700, background: 'linear-gradient(135deg,#6C63FF,#9B94FF)', boxShadow: 'none' }}>
            {editId ? 'Save Changes' : 'Add Raw Material'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Delete Raw Material?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            This will delete the material and <strong>all its colour variants</strong>. This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button onClick={() => setDeleteId(null)} variant="outlined" sx={{ borderRadius: 2, fontWeight: 600 }}>Cancel</Button>
          <Button onClick={handleDelete} variant="contained" color="error" sx={{ borderRadius: 2, fontWeight: 700 }}>Delete All</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
