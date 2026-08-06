import React from 'react'
import PrintRoundedIcon from '@mui/icons-material/PrintRounded'
import VendorPage from '../../components/VendorPage'

const data = [
  { id: 1, name: 'Kolkata Color Press',  gstin: '19AAACK1122J1ZA', address: '5, Press Colony, Kolkata', contactNo: '9832109876 / deepak@kcpress.com', status: 'Active'   },
  { id: 2, name: 'PrintMaster India',    gstin: '19AAACP2233K1ZB', address: '17, Graphics Zone, Howrah', contactNo: '9754321098 / vikas@printmaster.in', status: 'Active'   },
  { id: 3, name: 'Flex & Print Works',   gstin: '19AAACF3344L1ZC', address: '30, Industrial Estate, Durgapur', contactNo: '9612345678 / sanjay@flexprint.com', status: 'Active'   },
  { id: 4, name: 'Digital Ink Studio',   gstin: '19AAACD4455M1ZD', address: '9, Offset Lane, Asansol', contactNo: '9501234567 / priya@digitalink.co',   status: 'Inactive' },
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
