// Mock Database Helper for JuteCRM Production Workflow

const defaultDb = {
  pis: [
    { id: 'PI-1001', date: '2026-08-01', piNo: 'PI/26-27/001', buyerName: 'Ramesh Traders', products: [{ productName: 'Jute Bags 40x60cm', description: 'Plain double warp bags', qty: 10000, deliveryDate: '2026-08-25', printing: 'Yes' }] },
    { id: 'PI-1002', date: '2026-08-02', piNo: 'PI/26-27/002', buyerName: 'Bengal Jute Co.', products: [{ productName: 'Hessian Cloth', description: 'Natural 270 GSM sheets', qty: 15000, deliveryDate: '2026-08-30', printing: 'No' }] },
  ],
  pos: [
    { id: 'PO-2001', date: '2026-08-02', supplier: 'Bengal Jute Suppliers', items: [{ name: 'Raw Jute Fibre A-Grade', color: 'Natural', qty: 5000, unit: 'KG', rate: 85 }] },
    { id: 'PO-2002', date: '2026-08-03', supplier: 'Green Fibre Works', items: [{ name: 'Raw Cotton Yarn 40s', color: 'White', qty: 2000, unit: 'KG', rate: 145 }] },
  ],
  receipts: [
    { id: 'REC-3001', date: '2026-08-04', supplier: 'Bengal Jute Suppliers', poId: 'PO-2001', items: [{ name: 'Raw Jute Fibre A-Grade', color: 'Natural', qty: 5000, unit: 'KG', rate: 85 }] }
  ],
  cuttings: [
    { id: 'CUT-4001', date: '2026-08-05', cutterName: 'Apex Cutting Services', piNo: 'PI/26-27/001', items: [{ name: 'Jute Bags 40x60cm', qty: 5000, rawMaterial: 'Raw Jute Fibre A-Grade', rawMaterialColor: 'Natural', rawMaterialUsed: 500, rawMaterialRejection: 10, billNo: 'B-CUT-102', billDate: '2026-08-05', billRec: 'Yes' }] }
  ],
  printerJobs: {
    issues: [
      { id: 'PRT-I-5001', date: '2026-08-05', printerName: 'Kolkata Color Press', itemNo: 'Jute Bags 40x60cm', qty: 3000, accessories: 'Ink & Thread', remarks: 'Fast delivery requested' }
    ],
    receives: [
      { id: 'PRT-R-5001', date: '2026-08-06', printerName: 'Kolkata Color Press', piNo: 'PI/26-27/001', qty: 3000, rejectionFabricator: 20, rejectionFactory: 10, rejectionRemarks: 'Minor ink smudges', billNo: 'INV-COL-990', billDate: '2026-08-06', billRec: 'Yes', qcCheckedBy: 'Sanjay Shah' }
    ]
  },
  stitcherJobs: {
    issues: [
      { id: 'ST-I-6001', date: '2026-08-06', fabricatorName: 'Stitch & Sew Works', piNo: 'PI/26-27/001', qty: 2900, accessories: 'Polyester Thread', remarks: 'Stitch standard A' }
    ],
    receives: [
      { id: 'ST-R-6001', date: '2026-08-07', fabricatorName: 'Stitch & Sew Works', piNo: 'PI/26-27/001', qty: 2880, rejectionFabricator: 15, rejectionFactory: 5, rejectionRemarks: 'Loose thread loops', billNo: 'BILL-ST-402', billDate: '2026-08-07', billRec: 'Yes', qcCheckedBy: 'Rohan Roy' }
    ]
  },
  finishing: [
    { id: 'FIN-7001', date: '2026-08-07', jobworkerName: 'Standard Finishing Unit', piNo: 'PI/26-27/001', qty: 2850, rejection: 10, ctnDims: '24x18x18', netWt: 120, grossWt: 125, pcsPerCtn: 100, billNo: 'FIN-B-822', billDate: '2026-08-07', billRec: 'Yes', qcCheckedBy: 'Pranab Sen' }
  ],
  shipments: [
    { id: 'SHIP-8001', date: '2026-08-08', invNo: 'INV-JUT-9002', party: 'Ramesh Traders', piNo: 'PI/26-27/001', qty: 2800 }
  ]
}

export const getDb = () => {
  const data = localStorage.getItem('jute_workflow_db')
  if (!data) {
    localStorage.setItem('jute_workflow_db', JSON.stringify(defaultDb))
    return defaultDb
  }
  return JSON.parse(data)
}

export const saveDb = (db) => {
  localStorage.setItem('jute_workflow_db', JSON.stringify(db))
}

export const resetDb = () => {
  localStorage.setItem('jute_workflow_db', JSON.stringify(defaultDb))
  return defaultDb
}
