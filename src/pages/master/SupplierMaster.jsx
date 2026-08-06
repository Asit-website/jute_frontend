import React from 'react'
import AgricultureRoundedIcon from '@mui/icons-material/AgricultureRounded'
import VendorPage from '../../components/VendorPage'

const data = [
  { id: 1, name: 'Bengal Jute Suppliers',  gstin: '19AAACB4567B1Z2', address: '12, Jute Market Road, Kolkata', contactNo: '9876543210 / ravi@bengaljute.com', status: 'Active'   },
  { id: 2, name: 'Green Fibre Works',      gstin: '19AAACG7890C1Z3', address: '45, Industrial Area, Murshidabad', contactNo: '9812345678 / mohan@greenfibre.in', status: 'Active' },
  { id: 3, name: 'Eastern Jute Traders',   gstin: '19AAACE1122D1Z4', address: '8, Mill Lane, Howrah',          contactNo: '9701234567 / suresh@ejtraders.com', status: 'Inactive' },
  { id: 4, name: 'Sunrise Raw Materials',  gstin: '19AAACS3344E1Z5', address: '22, Supply Nagar, Barrackpore', contactNo: '9654321098 / amit@sunrise.co.in',   status: 'Active' },
]

export default function SupplierMaster() {
  return (
    <VendorPage
      title="Supplier Master"
      subtitle="Manage suppliers"
      icon={<AgricultureRoundedIcon />}
      color="#00C07F"
      bg="rgba(0,192,127,0.1)"
      initialData={data}
    />
  )
}
