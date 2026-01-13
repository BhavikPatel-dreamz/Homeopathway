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

    // Try to find a sheet named 'Remedies', otherwise fall back to the first sheet (works for CSV)
    let sheet = workbook.Sheets['Remedies']
    if (!sheet) {
      const firstSheetName = Object.keys(workbook.Sheets)[0]
      sheet = workbook.Sheets[firstSheetName]
    }

    if (!sheet) {
      return NextResponse.json(
        { error: 'No sheets found in uploaded file' },
        { status: 400 }
      )
    }

    const rows = XLSX.utils.sheet_to_json<RemedyImportRow>(sheet)

    // small util to create a slug from a name when missing
    const slugify = (input?: string | null) => {
      if (!input) return null
      return input
        .toString()
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '')
    }

    for (const row of rows) {
      // Allow CSV cells to contain comma-separated key_symptoms; keep as-is if already array-like
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const keySymptomsVal: any = row.key_symptoms ?? null

      const key_symptoms = typeof keySymptomsVal === 'string' && keySymptomsVal.includes(',')
        ? keySymptomsVal.split(',').map(s => s.trim()).filter(Boolean)
        : keySymptomsVal

      const payload = {
        name: row.name ?? null,
        scientific_name: row.scientific_name ?? null,
        common_name: row.common_name ?? null,
        description: row.description ?? null,
        key_symptoms: key_symptoms ?? null,
        slug: row.slug ?? slugify(row.name ?? null),
      }

      if (row.id) {
        const { error } = await supabase
          .from('remedies')
          .update(payload)
          .eq('id', row.id)

        if (error) throw error
      } else {
        // Insert new remedy when there's no id
        const { data: inserted, error } = await supabase
          .from('remedies')
          .insert(payload)
          .select()
          .single()

        if (error) throw error
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('REMEDIES IMPORT ERROR:', error)
    return NextResponse.json({ error: 'Import failed' }, { status: 500 })
  }
}
