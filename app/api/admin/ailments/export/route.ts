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
 * Excel export row with helper columns
 */
interface AilmentExportRow {
  name: string
  description: string | null
  icon: string | null
  slug: string | null
  ailment_name: string
  related_remedies: string
}

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('ailments')
      .select('name, description, icon, slug')
      .order('name', { ascending: true })

    if (error) throw error

    const rows: AilmentExportRow[] = (data ?? []).map(a => ({
      name: a.name,
      description: a.description,
      icon: a.icon,
      slug: a.slug,
      ailment_name: a.name,      // 👈 helper column
      related_remedies: '',      // 👈 user fills this
    }))

    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.json_to_sheet(rows)

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Ailments')

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
          'attachment; filename="ailments-with-remedies.xlsx"',
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
