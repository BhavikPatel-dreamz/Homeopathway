import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import * as XLSX from 'xlsx'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

/**
 * Shape of one row in Remedies XLSX sheet
 */
interface RemedyImportRow {
  id?: string
  name?: string
  scientific_name?: string
  common_name?: string
  description?: string
  key_symptoms?: string
  slug?: string
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get('file')

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const workbook = XLSX.read(arrayBuffer, { type: 'array' })

    const sheet = workbook.Sheets['Remedies']
    if (!sheet) {
      return NextResponse.json(
        { error: 'Remedies sheet missing' },
        { status: 400 }
      )
    }

    const rows = XLSX.utils.sheet_to_json<RemedyImportRow>(sheet)

    for (const row of rows) {
      if (!row.id) continue

      const { error } = await supabase
        .from('remedies')
        .update({
          name: row.name ?? null,
          scientific_name: row.scientific_name ?? null,
          common_name: row.common_name ?? null,
          description: row.description ?? null,
          key_symptoms: row.key_symptoms ?? null,
          slug: row.slug ?? null,
        })
        .eq('id', row.id)

      if (error) throw error
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('REMEDIES IMPORT ERROR:', error)
    return NextResponse.json({ error: 'Import failed' }, { status: 500 })
  }
}
