import React from 'react'
import ContentCutRoundedIcon from '@mui/icons-material/ContentCutRounded'
import VendorPage from '../../components/VendorPage'

const data = [
  { id: 1, name: 'Apex Cutting Services', contact: 'Anil Mehta', phone: '9836612345', email: 'anil@apexcut.com', address: '88, Leather Goods Complex', city: 'Kolkata', status: 'Active' },
  { id: 2, name: 'Precision Die Cutters', contact: 'Vijay Khemka', phone: '9837722334', email: 'vijay@precisiondie.com', address: '12, Industrial Sector B', city: 'Howrah', status: 'Active' },
  { id: 3, name: 'Quality Slitting Works', contact: 'Rajesh Sen', phone: '9838833445', email: 'rajesh@qualityslitting.in', address: '4, Mill Area Rd', city: 'Serampore', status: 'Active' },
  { id: 4, name: 'Eastern Die & Cut', contact: 'Vikram Roy', phone: '9839944556', email: 'vikram@easterndie.com', address: '19, G.T. Road', city: 'Asansol', status: 'Inactive' },
]

export default function Cutters() {
  return (
    <VendorPage
      title="Cutters"
      subtitle="Manage material cutting vendors & job workers"
      icon={<ContentCutRoundedIcon />}
      color="#F59E0B"
      bg="rgba(245,158,11,0.1)"
      initialData={data}
    />
  )
}
