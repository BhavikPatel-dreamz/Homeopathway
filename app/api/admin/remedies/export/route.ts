import { createClient } from '@supabase/supabase-js'
import * as XLSX from 'xlsx'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

/**
 * Shape of exported remedy row (LIMITED COLUMNS)
 */
interface RemedyExportRow {
  name: string
  description: string | null
  key_symptoms: string[] | null
  slug: string | null
  icon: string | null
}

export async function GET(req: Request) {
  try {
    // ✅ Fetch ONLY required columns
    const { data, error } = await supabase
      .from('remedies')
      .select('name, description, key_symptoms, slug, icon')
      .order('name', { ascending: true })

    if (error) throw error

    const rows: RemedyExportRow[] = data ?? []

    // allow format selection via ?format=csv (default xlsx)
    const url = new URL(req.url)
    const fmt = url.searchParams.get('format') || 'xlsx'

    // Create workbook
    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.json_to_sheet(rows)
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Remedies')

    if (fmt === 'csv') {
      const csv = XLSX.utils.sheet_to_csv(worksheet)
      return new Response(csv, {
        headers: {
          'Content-Disposition': 'attachment; filename="remedies.csv"',
          'Content-Type': 'text/csv; charset=utf-8',
        },
      })
    }

    const array = XLSX.write(workbook, {
      type: 'array',
      bookType: 'xlsx',
    })

    const buffer = new Uint8Array(array).buffer

    return new Response(new Blob([buffer]), {
      headers: {
        'Content-Disposition': 'attachment; filename="remedies.xlsx"',
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    })
  } catch (err) {
    console.error('Remedy export failed:', err)
    return new Response('Export failed', { status: 500 })
  }
}
