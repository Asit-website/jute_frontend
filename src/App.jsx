import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import CustomerOrder from './pages/CustomerOrder'
import RawMaterial from './pages/RawMaterial'
import Orders from './pages/Orders'
import Reports from './pages/Reports'
import Settings from './pages/Settings'
import JuteSupplier from './pages/master/JuteSupplier'
import Printers from './pages/master/Printers'
import Fabricators from './pages/master/Fabricators'
import ItemMaster from './pages/master/ItemMaster'
import BuyerMaster from './pages/master/BuyerMaster'
import UnitMaster from './pages/master/UnitMaster'
import Cutters from './pages/master/Cutters'
import Finishers from './pages/master/Finishers'
import PurchaseItemMaster from './pages/master/PurchaseItemMaster'

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
        <Route path="customer-order" element={<CustomerOrder />} />
        <Route path="raw-material" element={<RawMaterial />} />
        <Route path="orders" element={<Orders />} />
        <Route path="master/item" element={<ItemMaster />} />
        <Route path="master/purchase-item" element={<PurchaseItemMaster />} />
        <Route path="master/buyer" element={<BuyerMaster />} />
        <Route path="master/unit" element={<UnitMaster />} />
        <Route path="master/jute-supplier" element={<JuteSupplier />} />
        <Route path="master/printers" element={<Printers />} />
        <Route path="master/cutters" element={<Cutters />} />
        <Route path="master/fabricators" element={<Fabricators />} />
        <Route path="master/finishers" element={<Finishers />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App
