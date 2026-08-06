import React from 'react'
import DoneAllRoundedIcon from '@mui/icons-material/DoneAllRounded'
import VendorPage from '../../components/VendorPage'

const data = [
  { id: 1, name: 'Standard Finishing Unit', gstin: '19AAACS1100R1ZI', address: '14, Lamination Colony, Kolkata', contactNo: '9830098765 / manoj@standardfinish.com', status: 'Active' },
  { id: 2, name: 'Royal Jute Finishers', gstin: '19AAACR2200S1ZJ', address: '55, Processing Zone, Howrah', contactNo: '9831187654 / sunil@royaljute.in', status: 'Active' },
  { id: 3, name: 'Perfect Glazing & Packing', gstin: '19AAACP3300T1ZK', address: '9, Packaging Park, Hooghly', contactNo: '9832276543 / govinda@perfectglazing.com', status: 'Active' },
  { id: 4, name: 'Elite Coating Services', gstin: '19AAACE4400U1ZL', address: '22, Chemical Complex, Durgapur', contactNo: '9833365432 / karan@elitecoating.co.in', status: 'Inactive' },
]

export default function Finishers() {
  return (
    <VendorPage
      title="Finishers"
      subtitle="Manage lamination, glazing & finishing vendors"
      icon={<DoneAllRoundedIcon />}
      color="#10B981"
      bg="rgba(16,185,129,0.1)"
      initialData={data}
    />
  )
}
