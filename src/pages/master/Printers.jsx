import React from 'react'
import PrintRoundedIcon from '@mui/icons-material/PrintRounded'
import VendorPage from '../../components/VendorPage'

const data = [
  { id: 1, name: 'Kolkata Color Press',  contact: 'Deepak Roy',    phone: '9832109876', email: 'deepak@kcpress.com',    address: '5, Press Colony',       city: 'Kolkata',    status: 'Active'   },
  { id: 2, name: 'PrintMaster India',    contact: 'Vikas Sharma',  phone: '9754321098', email: 'vikas@printmaster.in',  address: '17, Graphics Zone',     city: 'Howrah',     status: 'Active'   },
  { id: 3, name: 'Flex & Print Works',   contact: 'Sanjay Gupta',  phone: '9612345678', email: 'sanjay@flexprint.com',  address: '30, Industrial Estate', city: 'Durgapur',   status: 'Active'   },
  { id: 4, name: 'Digital Ink Studio',   contact: 'Priya Nair',    phone: '9501234567', email: 'priya@digitalink.co',   address: '9, Offset Lane',        city: 'Asansol',    status: 'Inactive' },
]

export default function Printers() {
  return (
    <VendorPage
      title="Printers"
      subtitle="Manage printing vendors"
      icon={<PrintRoundedIcon />}
      color="#8B5CF6"
      bg="rgba(139,92,246,0.1)"
      initialData={data}
    />
  )
}
