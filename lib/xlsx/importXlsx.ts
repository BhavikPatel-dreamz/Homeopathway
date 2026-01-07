import * as XLSX from 'xlsx'

export interface ParsedAlignment {
  ailment_id: string
  remedy_id: string
}

/**
 * Strict UUID v4 validation
 */
function isValidUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  )
}

export function parseImportXlsx(
  arrayBuffer: ArrayBuffer
): { alignments: ParsedAlignment[] } {
  const workbook = XLSX.read(arrayBuffer, { type: 'array' })

  const sheet = workbook.Sheets['Alignments']
  if (!sheet) {
    throw new Error('Alignments sheet not found')
  }

  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet)

  const alignments: ParsedAlignment[] = []

  for (const row of rows) {
    const ailment_id = String(row.ailment_id ?? '').trim()
    const remedy_id = String(row.remedy_id ?? '').trim()

    // 🚫 Skip empty or invalid rows
    if (!ailment_id || !remedy_id) continue
    if (!isValidUuid(ailment_id) || !isValidUuid(remedy_id)) continue

    alignments.push({ ailment_id, remedy_id })
  }

  return { alignments }
}
