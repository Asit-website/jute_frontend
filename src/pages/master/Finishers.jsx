import React from 'react'
import DoneAllRoundedIcon from '@mui/icons-material/DoneAllRounded'
import VendorPage from '../../components/VendorPage'

const data = [
  { id: 1, name: 'Standard Finishing Unit', contact: 'Manoj Bajpayee', phone: '9830098765', email: 'manoj@standardfinish.com', address: '14, Lamination Colony', city: 'Kolkata', status: 'Active' },
  { id: 2, name: 'Royal Jute Finishers', contact: 'Sunil Shetty', phone: '9831187654', email: 'sunil@royaljute.in', address: '55, Processing Zone', city: 'Howrah', status: 'Active' },
  { id: 3, name: 'Perfect Glazing & Packing', contact: 'Govinda Sen', phone: '9832276543', email: 'govinda@perfectglazing.com', address: '9, Packaging Park', city: 'Hooghly', status: 'Active' },
  { id: 4, name: 'Elite Coating Services', contact: 'Karan Johar', phone: '9833365432', email: 'karan@elitecoating.co.in', address: '22, Chemical Complex', city: 'Durgapur', status: 'Inactive' },
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
