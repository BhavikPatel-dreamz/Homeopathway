import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import * as XLSX from 'xlsx'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

/**
 * Shape of exported ailment row (LIMITED COLUMNS)
 */
interface AilmentExportRow {
  name: string
  description: string | null
  icon: string | null
  slug: string | null
}

export async function GET() {
  try {
    // ✅ Fetch ONLY required columns
    const { data, error } = await supabase
      .from('ailments')
      .select('name, description, icon, slug')
      .order('name', { ascending: true })

    if (error) throw error

    const rows: AilmentExportRow[] = data ?? []

    // ✅ Create workbook
    const workbook = XLSX.utils.book_new()

    const worksheet = XLSX.utils.json_to_sheet(rows)

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      'Ailments'
    )

    // ✅ Generate ArrayBuffer (web-safe)
    const array = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    })

    const buffer = new Uint8Array(array).buffer

    return new Response(new Blob([buffer]), {
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition':
          'attachment; filename="ailments.xlsx"',
      },
    })
  } catch (error) {
    console.error('AILMENTS EXPORT ERROR:', error)

    return NextResponse.json(
      { error: 'Export failed' },
      { status: 500 }
    )
  }
}
