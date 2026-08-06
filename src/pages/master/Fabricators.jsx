import React from 'react'
import HandymanRoundedIcon from '@mui/icons-material/HandymanRounded'
import VendorPage from '../../components/VendorPage'

const data = [
  { id: 1, name: 'Stitch & Sew Works',    gstin: '19AAACS5566N1ZE', address: '3, Garment Nagar, Kolkata', contactNo: '9876123450 / ramesh@stitchsew.com', status: 'Active'   },
  { id: 2, name: 'A1 Fabrication Hub',    gstin: '19AAACA6677O1ZF', address: '21, Tailor Street, Howrah', contactNo: '9723456789 / mahesh@a1fab.in', status: 'Active'   },
  { id: 3, name: 'Quality Stitchers',     gstin: '19AAACQ7788P1ZG', address: '7, Weaver Colony, Serampore', contactNo: '9634512345 / sunita@qstitchers.com', status: 'Active'   },
  { id: 4, name: 'Craft & Fabric Unit',   gstin: '19AAACC8899Q1ZH', address: '14, Mill Workers Lane, Barrackpore', contactNo: '9512340987 / ajay@craftfabric.co', status: 'Inactive' },
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
