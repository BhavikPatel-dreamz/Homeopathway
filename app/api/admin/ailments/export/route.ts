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
  ailment_name?: string
  related_remedies?: string
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const format = (url.searchParams.get('format') || 'csv').toLowerCase()

    const { data, error } = await supabase
      .from('ailments')
      .select('id,name,description,slug,remedies_count,icon')
      .order('name', { ascending: true })

    if (error) {
      console.error('AILMENT EXPORT ERROR:', error)
      return NextResponse.json({ error: 'Failed to fetch ailments' }, { status: 500 })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows = (data || []) as Array<any>

    // Enrich each ailment with a comma-separated `related_remedies` field
    for (const row of rows) {
      try {
        const ailmentId = row.id
        if (!ailmentId) {
          row.related_remedies = ''
          continue
        }

        const { data: arData, error: arError } = await supabase
          .from('ailment_remedies')
          .select('remedy_id')
          .eq('ailment_id', ailmentId)

        if (arError || !arData || arData.length === 0) {
          row.related_remedies = ''
          continue
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const remedyIds = arData.map((r: any) => r.remedy_id)
        const { data: remediesData } = await supabase
          .from('remedies')
          .select('name')
          .in('id', remedyIds)

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const remedyNames = (remediesData || []).map((r: any) => r.name).filter(Boolean)
        row.related_remedies = remedyNames.join(', ')
      } catch (e) {
        console.error('Failed to load related remedies for ailment', row.id, e)
        row.related_remedies = ''
      }
    }

    // Remove internal `id` before exporting
    const exportRows = rows.map(({ id, ...rest }) => ({ ...rest }))

    if (format === 'csv') {
      const worksheet = XLSX.utils.json_to_sheet(exportRows)
      const csv = XLSX.utils.sheet_to_csv(worksheet)
      return new Response(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename="ailments.csv"',
        },
      })
    }

    // default to xlsx
    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.json_to_sheet(exportRows)
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Ailments')
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })

    return new Response(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="ailments.xlsx"',
      },
    })
  } catch (err) {
    console.error('AILMENT EXPORT ERROR:', err)
    return NextResponse.json({ error: 'Export failed' }, { status: 500 })
  }
}

/**
 * Generate URL-friendly slug
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get('file')

    // Try to extract a user id from an Authorization: Bearer <token> header
    // so we can populate `created_by` for auto-created remedies.
    const authHeader = req.headers.get('authorization') || ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
    let currentUserId: string | null = null
    if (token) {
      try {
        const parts = token.split('.')
        if (parts.length >= 2) {
          const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString())
          currentUserId = payload.sub || payload.user_id || null
        }
      } catch (e) {
        console.warn('Failed to parse auth token payload', e)
      }
    }

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    /* =====================================================
       READ CSV OR XLSX
    ===================================================== */
    const arrayBuffer = await file.arrayBuffer()
    const workbook = XLSX.read(arrayBuffer, { type: 'array' })

    const sheetName = workbook.SheetNames[0]
    const sheet = workbook.Sheets[sheetName]

    if (!sheet) {
      return NextResponse.json(
        { error: 'Sheet not found in file' },
        { status: 400 }
      )
    }

    const rows = XLSX.utils.sheet_to_json<AlignmentRow>(sheet)

    /* =====================================================
       CACHE REMEDIES (NAME → ID)
    ===================================================== */
    const { data: existingRemedies } = await supabase
      .from('remedies')
      .select('id, name')

    const remedyMap = new Map<string, string>()
    for (const r of existingRemedies ?? []) {
      remedyMap.set(r.name.toLowerCase(), r.id)
    }

    /* =====================================================
       PROCESS EACH ROW
    ===================================================== */
    for (const row of rows) {
      if (!row.ailment_name || !row.related_remedies) continue

      /* ---------- GET AILMENT ---------- */
      const { data: ailment } = await supabase
        .from('ailments')
        .select('id')
        .eq('name', row.ailment_name)
        .single()

      if (!ailment?.id) continue
      const ailmentId: string = ailment.id

      /* ---------- SPLIT REMEDIES ---------- */
      const remedyNames = row.related_remedies
        .split(',')
        .map(r => r.trim())
        .filter(Boolean)

      for (const remedyNameRaw of remedyNames) {
        const remedyKey = remedyNameRaw.toLowerCase()

        let remedyId: string | undefined = remedyMap.get(remedyKey)

        /* =====================================================
           AUTO-CREATE REMEDY IF NOT EXISTS
        ===================================================== */
        if (!remedyId) {
          const slug = slugify(remedyNameRaw)

          const { data: newRemedy, error } = await supabase
            .from('remedies')
            .insert({
              name: remedyNameRaw,
              slug,
              average_rating: 0,
              review_count: 0,
              icon: null,
              created_by: currentUserId,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .select('id')
            .single()

          if (error || !newRemedy?.id) continue

          remedyId = newRemedy.id
          remedyMap.set(remedyKey, remedyId!)
        }

        /* =====================================================
           FINAL TYPE GUARD (REQUIRED)
        ===================================================== */
        if (typeof remedyId !== 'string') continue

        /* =====================================================
           CHECK EXISTING LINK
        ===================================================== */
        const { data: existingLink } = await supabase
          .from('ailment_remedies')
          .select('id')
          .eq('ailment_id', ailmentId)
          .eq('remedy_id', remedyId!)
          .maybeSingle()

        if (existingLink) continue

        /* =====================================================
           CREATE LINK
        ===================================================== */
        await supabase.from('ailment_remedies').insert({
          ailment_id: ailmentId,
          remedy_id: remedyId!,
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Import completed successfully (auto-created remedies)',
    })
  } catch (error) {
    console.error('AILMENT IMPORT ERROR:', error)
    return NextResponse.json(
      { error: 'Import failed' },
      { status: 500 }
    )
  }
}
