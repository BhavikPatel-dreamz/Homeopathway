import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import * as XLSX from 'xlsx'
import { setProgress, clearProgress } from '@/lib/importProgress'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface AlignmentRow {
  ailment_name: string
  related_remedies?: string
}

interface AilmentImportRow {
  name?: string
  ailment_name?: string
  description?: string
  slug?: string
  remedies_count?: number
  icon?: string
  related_remedies?: string
}

const slugify = (input?: string | null) => {
  if (!input) return null
  return input
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

export async function POST(req: Request) {
  let progressId: string | null = null
  try {
    const formData = await req.formData()
    // extract import id early so clients can poll server progress during processing
    progressId = String(formData.get('importId') || '') || null
    if (progressId) setProgress(progressId, 2)
    const file = formData.get('file')

    if (!file || typeof (file as File).name !== 'string') {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    const f = file as File

    let rows: Array<AilmentImportRow | AlignmentRow> = []

    // READ CSV
    if (f.name.toLowerCase().endsWith('.csv')) {
      const text = await f.text()
      const lines = text.split('\n').filter(l => l.trim())

      if (lines.length < 2) {
        return NextResponse.json({ error: 'CSV file is empty or invalid' }, { status: 400 })
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

        return row as AilmentImportRow | AlignmentRow
      })
    }

    // READ XLSX
    if (f.name.toLowerCase().endsWith('.xlsx') || f.name.toLowerCase().endsWith('.xls')) {
      const arrayBuffer = await f.arrayBuffer()
      const workbook = XLSX.read(arrayBuffer, { type: 'array' })

      const sheet = workbook.Sheets['Alignments'] || workbook.Sheets[workbook.SheetNames[0]]
      if (!sheet) {
        return NextResponse.json({ error: 'Alignments sheet missing' }, { status: 400 })
      }

      // parse as plain objects
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      rows = XLSX.utils.sheet_to_json<any>(sheet).map((r: any) => {
        // normalize keys to lower-case with underscores
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const normalized: any = {}
        Object.keys(r).forEach(k => {
          const key = String(k).trim().toLowerCase().replace(/\s+/g, '_')
          normalized[key] = r[k]
        })
        return normalized as AilmentImportRow | AlignmentRow
      })
    }

    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: 'No valid rows found' }, { status: 400 })
    }

    // (import id already extracted earlier)

    // auth: expect Authorization: Bearer <token>
    const authHeader = req.headers.get('authorization') || ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
    if (!token) {
      if (progressId) {
        setProgress(progressId, 0)
        setTimeout(() => clearProgress(progressId!), 30_000)
      }
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const db = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
            apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          },
        },
      }
    )

    // decode token payload to get current user id (best effort)
    let currentUserId: string | null = null
    try {
      const parts = token.split('.')
      if (parts.length >= 2) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString())
        currentUserId = payload.sub || payload.user_id || null
      }
    } catch (e) {
      // ignore
    }

    if (!currentUserId) {
      if (progressId) {
        setProgress(progressId, 0)
        setTimeout(() => clearProgress(progressId!), 30_000)
      }
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profileData, error: profileError } = await db
      .from('profiles')
      .select('role')
      .eq('id', currentUserId)
      .single()

    if (profileError) {
      console.error('Failed to load user profile for import:', profileError)
      if (progressId) {
        setProgress(progressId, 0)
        setTimeout(() => clearProgress(progressId!), 30_000)
      }
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const role = profileData?.role || null
    if (role !== 'admin' && role !== 'moderator') {
      if (progressId) {
        setProgress(progressId, 0)
        setTimeout(() => clearProgress(progressId!), 30_000)
      }
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Create a service-role client for writes to avoid RLS insert/update
    // failures. We validated the user's role above, so using the service key
    // here is safe for server-side operations.
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    let writeDb = db
    if (serviceKey) {
      writeDb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey)
    }

    // cache remedies
    const { data: remedies, error: remediesError } = await db.from('remedies').select('id, name, slug')
    if (remediesError) throw remediesError

    const remedyMap = new Map<string, string>()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(remedies ?? []).forEach((r: any) => {
      if (r.name) remedyMap.set(String(r.name).toLowerCase(), r.id)
      if (r.slug) remedyMap.set(String(r.slug).toLowerCase(), r.id)
    })

    if (progressId) setProgress(progressId, 5)

    for (let i = 0; i < rows.length; i++) {
      const raw = rows[i] as AilmentImportRow | AlignmentRow

      if (progressId) {
        const pct = 10 + Math.round((i / rows.length) * 80)
        setProgress(progressId, pct)
      }

const name =
  ('name' in raw && raw.name
    ? raw.name
    : 'ailment_name' in raw
    ? raw.ailment_name
    : ''
  )
    ?.toString()
    .trim()

      if (!name) continue

      const description = (raw as AilmentImportRow).description ?? null
      const slugVal = (raw as AilmentImportRow).slug ? String((raw as AilmentImportRow).slug).trim() : slugify(name)
      const iconVal = (raw as AilmentImportRow).icon ?? null

      // find or create ailment
      let ailmentId: string | null = null

      if (slugVal) {
        const { data: existingBySlug } = await db.from('ailments').select('id').eq('slug', slugVal).maybeSingle()
        if (existingBySlug) ailmentId = existingBySlug.id
      }

      if (!ailmentId) {
        const { data: existingByName } = await db.from('ailments').select('id').eq('name', name).maybeSingle()
        if (existingByName) ailmentId = existingByName.id
      }

      if (!ailmentId) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const insertPayload: any = {
          name,
          description,
          slug: slugVal ?? null,
          icon: iconVal ?? null,
          created_by: currentUserId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }

        if (slugVal) {
          // use the trusted write client for upsert/insert to avoid RLS errors
          const { data: upserted, error: upsertErr } = await writeDb.from('ailments').upsert(insertPayload, { onConflict: 'slug' }).select().maybeSingle()
          if (upsertErr) {
            const { data: inserted, error: insertErr } = await writeDb.from('ailments').insert(insertPayload).select().maybeSingle()
            if (insertErr) throw insertErr
            ailmentId = inserted?.id || null
          } else {
            ailmentId = upserted?.id || null
          }
        } else {
          const { data: inserted, error: insertErr } = await writeDb.from('ailments').insert(insertPayload).select().maybeSingle()
          if (insertErr) throw insertErr
          ailmentId = inserted?.id || null
        }
      }

      if (!ailmentId) continue

      // parse related remedies
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const relatedRaw = (raw as any).related_remedies || ''
      const related = String(relatedRaw)
        .split(/[;,|]+/)
        .map(s => s.trim().toLowerCase())
        .filter(Boolean)

      const matchedRemedyIds = Array.from(new Set(related.map(r => remedyMap.get(r)).filter(Boolean)))

      for (let idx = 0; idx < matchedRemedyIds.length; idx++) {
        const remedyId = matchedRemedyIds[idx]
        if (!remedyId) continue

        const { data: existing } = await writeDb
          .from('ailment_remedies')
          .select('id')
          .eq('ailment_id', ailmentId)
          .eq('remedy_id', remedyId)
          .maybeSingle()

        if (existing) continue

              await writeDb.from('ailment_remedies').insert({
          ailment_id: ailmentId,
          remedy_id: remedyId,
          rank: idx + 1,
          created_by: currentUserId,
          created_at: new Date().toISOString(),
        })
      }

      try {
        await writeDb.from('ailments').update({ remedies_count: matchedRemedyIds.length }).eq('id', ailmentId)
      } catch (e) {
        // ignore
      }
    }

    if (progressId) setProgress(progressId, 100)
    if (progressId) setTimeout(() => clearProgress(progressId!), 30_000)

    return NextResponse.json({ success: true })
  } catch (error) {
    if (progressId) {
      try {
        setProgress(progressId, 0)
        setTimeout(() => clearProgress(progressId!), 30_000)
      } catch (e) {
        // ignore
      }
    }
    console.error('ALIGNMENT IMPORT ERROR:', error)
    return NextResponse.json({ error: 'Import failed' }, { status: 500 })
  }
}
