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
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    /* ---------- READ EXCEL ---------- */
    const arrayBuffer = await file.arrayBuffer()
    const workbook = XLSX.read(arrayBuffer, { type: 'array' })

    const sheet = workbook.Sheets['Alignments']
    if (!sheet) {
      return NextResponse.json(
        { error: 'Alignments sheet missing' },
        { status: 400 }
      )
    }

    const rows = XLSX.utils.sheet_to_json<AlignmentRow>(sheet)

    /* ---------- CACHE REMEDIES ---------- */
    const { data: remedies } = await supabase
      .from('remedies')
      .select('id, name')

    const remedyMap = new Map<string, string>(
      (remedies ?? []).map(r => [r.name.toLowerCase(), r.id])
    )

    /* ---------- PROCESS ROWS ---------- */
    for (const row of rows) {
      if (!row.ailment_name || !row.related_remedies) continue

      // 🔹 Fetch ailment ID
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

        // ✅ If already exists → skip
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
    return NextResponse.json({ error: 'Import failed' }, { status: 500 })
  }
}
