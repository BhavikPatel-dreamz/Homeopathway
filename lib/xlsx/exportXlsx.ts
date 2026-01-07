import * as XLSX from 'xlsx'

export interface ExportAilment {
  id: string
  name: string
  slug?: string | null
  icon?: string | null
  description?: string | null
}

export interface ExportRemedy {
  id: string
  name: string
  slug?: string | null
}

export interface ExportAlignment {
  ailment_id: string
  remedy_id: string
}

export interface ExportData {
  ailments: ExportAilment[]
  remedies: ExportRemedy[]
  alignments: ExportAlignment[]
}

/**
 * ✅ Returns ArrayBuffer (100% Web + TS compatible)
 */
export function buildExportXlsx(data: ExportData): ArrayBuffer {
  const workbook = XLSX.utils.book_new()

  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.json_to_sheet(data.ailments),
    'Ailments'
  )

  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.json_to_sheet(data.remedies),
    'Remedies'
  )

  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.json_to_sheet(data.alignments),
    'Alignments'
  )

  const array = XLSX.write(workbook, {
    bookType: 'xlsx',
    type: 'array', // number[]
  })

  // ✅ Convert number[] → ArrayBuffer
  return new Uint8Array(array).buffer
}
