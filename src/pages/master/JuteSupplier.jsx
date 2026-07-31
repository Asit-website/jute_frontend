import React from 'react'
import AgricultureRoundedIcon from '@mui/icons-material/AgricultureRounded'
import VendorPage from '../../components/VendorPage'

const data = [
  { id: 1, name: 'Bengal Jute Suppliers',  contact: 'Ravi Kumar',   phone: '9876543210', email: 'ravi@bengaljute.com',  address: '12, Jute Market Road', city: 'Kolkata',  status: 'Active'   },
  { id: 2, name: 'Green Fibre Works',      contact: 'Mohan Das',    phone: '9812345678', email: 'mohan@greenfibre.in',  address: '45, Industrial Area',  city: 'Murshidabad', status: 'Active' },
  { id: 3, name: 'Eastern Jute Traders',   contact: 'Suresh Patel', phone: '9701234567', email: 'suresh@ejtraders.com', address: '8, Mill Lane',          city: 'Howrah',   status: 'Inactive' },
  { id: 4, name: 'Sunrise Raw Materials',  contact: 'Amit Singh',   phone: '9654321098', email: 'amit@sunrise.co.in',   address: '22, Supply Nagar',      city: 'Barrackpore', status: 'Active' },
]

export default function JuteSupplier() {
  return (
    <VendorPage
      title="Jute Sheet Supplier"
      subtitle="Manage raw jute sheet suppliers"
      icon={<AgricultureRoundedIcon />}
      color="#00C07F"
      bg="rgba(0,192,127,0.1)"
      initialData={data}
    />
  )
}
