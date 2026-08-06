import React from 'react'
import ContentCutRoundedIcon from '@mui/icons-material/ContentCutRounded'
import VendorPage from '../../components/VendorPage'

const data = [
  { id: 1, name: 'Apex Cutting Services', gstin: '19AAACA8899F1Z6', address: '88, Leather Goods Complex, Kolkata', contactNo: '9836612345 / anil@apexcut.com', status: 'Active' },
  { id: 2, name: 'Precision Die Cutters', gstin: '19AAACP7788G1Z7', address: '12, Industrial Sector B, Howrah', contactNo: '9837722334 / vijay@precisiondie.com', status: 'Active' },
  { id: 3, name: 'Quality Slitting Works', gstin: '19AAACQ6677H1Z8', address: '4, Mill Area Rd, Serampore', contactNo: '9838833445 / rajesh@qualityslitting.in', status: 'Active' },
  { id: 4, name: 'Eastern Die & Cut', gstin: '19AAACE5566I1Z9', address: '19, G.T. Road, Asansol', contactNo: '9839944556 / vikram@easterndie.com', status: 'Inactive' },
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
