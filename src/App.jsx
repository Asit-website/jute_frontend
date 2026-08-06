import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Orders from './pages/Orders'
import Reports from './pages/Reports'
import Settings from './pages/Settings'

// Master Pages
import SupplierMaster from './pages/master/SupplierMaster'
import Printers from './pages/master/Printers'
import Fabricators from './pages/master/Fabricators'
import BuyerMaster from './pages/master/BuyerMaster'
import UnitMaster from './pages/master/UnitMaster'
import Cutters from './pages/master/Cutters'
import Finishers from './pages/master/Finishers'
import RawMaterialMaster from './pages/master/RawMaterialMaster'

// Workflow Pages
import PIEntry from './pages/workflow/PIEntry'
import PORawMaterial from './pages/workflow/PORawMaterial'
import RMStockIn from './pages/workflow/RMStockIn'
import Cutting from './pages/workflow/Cutting'
import PrinterJob from './pages/workflow/PrinterJob'
import StitcherJob from './pages/workflow/StitcherJob'
import FinishingPacking from './pages/workflow/FinishingPacking'
import Shipment from './pages/workflow/Shipment'

function App() {
  return (
    <Routes>
      {/* Public Route */}
      <Route path="/login" element={<Login />} />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="orders" element={<Orders />} />

        {/* Master Routes */}
        <Route path="master/raw-material-master" element={<RawMaterialMaster />} />
        <Route path="master/buyer" element={<BuyerMaster />} />
        <Route path="master/unit" element={<UnitMaster />} />
        <Route path="master/supplier" element={<SupplierMaster />} />
        <Route path="master/printers" element={<Printers />} />
        <Route path="master/cutters" element={<Cutters />} />
        <Route path="master/fabricators" element={<Fabricators />} />
        <Route path="master/finishers" element={<Finishers />} />

        {/* Production Workflow Routes */}
        <Route path="workflow/pi-entry" element={<PIEntry />} />
        <Route path="workflow/po-raw-material" element={<PORawMaterial />} />
        <Route path="workflow/rm-stock-in" element={<RMStockIn />} />
        <Route path="workflow/cutting" element={<Cutting />} />
        <Route path="workflow/printer-job" element={<PrinterJob />} />
        <Route path="workflow/stitcher-job" element={<StitcherJob />} />
        <Route path="workflow/finishing" element={<FinishingPacking />} />
        <Route path="workflow/shipment" element={<Shipment />} />

        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App
