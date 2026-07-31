import React from 'react'
import HandymanRoundedIcon from '@mui/icons-material/HandymanRounded'
import VendorPage from '../../components/VendorPage'

const data = [
  { id: 1, name: 'Stitch & Sew Works',    contact: 'Ramesh Yadav',  phone: '9876123450', email: 'ramesh@stitchsew.com',  address: '3, Garment Nagar',      city: 'Kolkata',    status: 'Active'   },
  { id: 2, name: 'A1 Fabrication Hub',    contact: 'Mahesh Patel',  phone: '9723456789', email: 'mahesh@a1fab.in',       address: '21, Tailor Street',     city: 'Howrah',     status: 'Active'   },
  { id: 3, name: 'Quality Stitchers',     contact: 'Sunita Devi',   phone: '9634512345', email: 'sunita@qstitchers.com', address: '7, Weaver Colony',      city: 'Serampore',  status: 'Active'   },
  { id: 4, name: 'Craft & Fabric Unit',   contact: 'Ajay Kumar',    phone: '9512340987', email: 'ajay@craftfabric.co',   address: '14, Mill Workers Lane', city: 'Barrackpore',status: 'Inactive' },
]

export default function Fabricators() {
  return (
    <VendorPage
      title="Fabricators"
      subtitle="Manage stitching & fabrication vendors"
      icon={<HandymanRoundedIcon />}
      color="#EC4899"
      bg="rgba(236,72,153,0.1)"
      initialData={data}
    />
  )
}
