import { createClient } from '@supabase/supabase-js'
import * as XLSX from 'xlsx'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET() {
  const { data, error } = await supabase.from('remedies').select('*')
  if (error) return new Response('Export failed', { status: 500 })

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.json_to_sheet(data ?? []),
    'Remedies'
  )

  const array = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' })
  const buffer = new Uint8Array(array).buffer

  return new Response(new Blob([buffer]), {
    headers: {
      'Content-Disposition': 'attachment; filename="remedies.xlsx"',
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    },
  })
}
