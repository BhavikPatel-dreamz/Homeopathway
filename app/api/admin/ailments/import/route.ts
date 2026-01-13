import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import * as XLSX from 'xlsx'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface AlignmentRow {
  ailment_name: string
  related_remedies: string
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get('file')

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      )
    }

    let rows: AlignmentRow[] = []

    /* =====================================================
       READ CSV
    ===================================================== */
    if (file.name.toLowerCase().endsWith('.csv')) {
      const text = await file.text()
      const lines = text.split('\n').filter(l => l.trim())

      if (lines.length < 2) {
        return NextResponse.json(
          { error: 'CSV file is empty or invalid' },
          { status: 400 }
        )
      }

      const headers = lines[0]
        .split(',')
        .map(h => h.trim().toLowerCase())

      rows = lines.slice(1).map(line => {
        const values = line
          .split(',')
          .map(v => v.replace(/^"|"$/g, '').trim())

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const row: any = {}
        headers.forEach((h, i) => {
          row[h] = values[i]
        })

        return row as AlignmentRow
      })
    }

    /* =====================================================
       READ XLSX
    ===================================================== */
    if (file.name.toLowerCase().endsWith('.xlsx')) {
      const arrayBuffer = await file.arrayBuffer()
      const workbook = XLSX.read(arrayBuffer, { type: 'array' })

      const sheet =
        workbook.Sheets['Alignments'] ||
        workbook.Sheets[workbook.SheetNames[0]]

      if (!sheet) {
        return NextResponse.json(
          { error: 'Alignments sheet missing' },
          { status: 400 }
        )
      }

      rows = XLSX.utils.sheet_to_json<AlignmentRow>(sheet)
    }

    if (!rows.length) {
      return NextResponse.json(
        { error: 'No valid rows found' },
        { status: 400 }
      )
    }

    /* =====================================================
       CACHE REMEDIES
    ===================================================== */
    const { data: remedies, error: remediesError } = await supabase
      .from('remedies')
      .select('id, name')

    if (remediesError) throw remediesError

    const remedyMap = new Map<string, string>(
      (remedies ?? []).map(r => [r.name.toLowerCase(), r.id])
    )

    /* =====================================================
       PROCESS ROWS
    ===================================================== */
    for (const row of rows) {
      if (!row.ailment_name || !row.related_remedies) continue

      const { data: ailment } = await supabase
        .from('ailments')
        .select('id')
        .eq('name', row.ailment_name)
        .single()

      if (!ailment) continue

      const ailmentId = ailment.id

      const remedyNames = row.related_remedies
        .split(',')
        .map(r => r.trim().toLowerCase())
        .filter(Boolean)

      for (const remedyName of remedyNames) {
        const remedyId = remedyMap.get(remedyName)
        if (!remedyId) continue

        /* ---------- CHECK IF ALIGNMENT EXISTS ---------- */
        const { data: existing } = await supabase
          .from('ailment_remedies')
          .select('id')
          .eq('ailment_id', ailmentId)
          .eq('remedy_id', remedyId)
          .maybeSingle()

        if (existing) continue

        /* ---------- CREATE NEW ALIGNMENT ---------- */
        await supabase.from('ailment_remedies').insert({
          ailment_id: ailmentId,
          remedy_id: remedyId,
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('ALIGNMENT IMPORT ERROR:', error)
    return NextResponse.json(
      { error: 'Import failed' },
      { status: 500 }
    )
  }
}
