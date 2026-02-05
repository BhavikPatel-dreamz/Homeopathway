/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import * as XLSX from 'xlsx'
import { setProgress, clearProgress } from '@/lib/importProgress'

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
  emoji?: string
  icon?: string
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
    // If the uploaded file is a CSV, decode as UTF-8 text first so
    // characters like emoji are preserved correctly when parsed.
    const isCSV = typeof (file as any).name === 'string' && (file as any).name.toLowerCase().endsWith('.csv')
    const workbook = isCSV
      ? XLSX.read(new TextDecoder('utf-8').decode(arrayBuffer), { type: 'string' })
      : XLSX.read(arrayBuffer, { type: 'array' })

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

    // Import progress identifier (client should provide this so we can
    // report processing progress back). It's optional but helpful.
    const importId = String(formData.get('importId') || '') || null

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

    // Try to extract an auth token from the Authorization header. The client
    // includes the user's access token so we can run the import as that user
    // (honoring RLS). If no token is provided we will reject the request.
    const authHeader = req.headers.get('authorization') || ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Create a supabase client bound to the user's token so queries run
    // as the authenticated user and respect RLS policies.
    const userSupabase = createClient(
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

    // Decode the token payload to get the user id
    let currentUserId: string | null = null
    try {
      const parts = token.split('.')
      if (parts.length >= 2) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString())
        currentUserId = payload.sub || payload.user_id || null
      }
    } catch (e) {
      console.warn('Failed to parse auth token payload', e)
    }

    // Ensure the user is allowed to import (admin or moderator)
    if (!currentUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profileData, error: profileError } = await userSupabase
      .from('profiles')
      .select('role')
      .eq('id', currentUserId)
      .single()

    if (profileError) {
      console.error('Failed to load user profile for import:', profileError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const role = profileData?.role || null
    if (role !== 'admin' && role !== 'moderator') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Use userSupabase below to perform inserts/updates so RLS checks operate
    // against the authenticated user.
    const db = userSupabase

    // initialize progress
    if (importId) setProgress(importId, 5)

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      // update progress per-row (scale processing to 80%):
      if (importId) {
        const pct = 10 + Math.round((i / rows.length) * 80)
        setProgress(importId, pct)
      }
      // Allow CSV/XLSX cells to contain comma-, semicolon- or pipe-separated `key_symptoms`.
      // Always convert string cells into an array of trimmed values so Postgres receives
      // a proper array literal (text[]) instead of a malformed string.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const keySymptomsVal: any = row.key_symptoms ?? null

      const key_symptoms = typeof keySymptomsVal === 'string'
        ? keySymptomsVal.split(/[;,|]+/).map((s: string) => s.trim()).filter(Boolean)
        : keySymptomsVal

      // Accept either `emoji` or `icon` column names from the sheet and map
      // to the `icon` column in the DB. Trim whitespace if present.
      const iconVal = (row.icon ?? row.emoji ?? null)
      const icon = typeof iconVal === 'string' ? iconVal.trim() || null : iconVal

      const payload = {
        name: row.name ?? null,
        scientific_name: row.scientific_name ?? null,
        common_name: row.common_name ?? null,
        description: row.description ?? null,
        key_symptoms: key_symptoms ?? null,
        // `icon` column in DB
        icon: icon ?? null,
        slug: row.slug ?? slugify(row.name ?? null),
      }

      if (row.id) {
        const { error } = await db
          .from('remedies')
          .update(payload)
          .eq('id', row.id)

        if (error) throw error
      } else {
        // Insert new remedy when there's no id. Include `created_by` and timestamps
        // so RLS policies that require ownership or audit fields will pass.
        const insertPayload = {
          ...payload,
          created_by: currentUserId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }

        // Use upsert on `slug` to avoid duplicate-key errors when the same slug
        // already exists. This will update the existing row instead of failing.
        const { data: upserted, error: upsertError } = await db
          .from('remedies')
          .upsert(insertPayload, { onConflict: 'slug' })
          .select()
          .maybeSingle()

        if (upsertError) {
          // Fallback: if upsert isn't supported or still errors, try to update by slug
          const slug = insertPayload.slug
          if (slug) {
            const { error: updateErr } = await db
              .from('remedies')
              .update({ ...payload, updated_at: new Date().toISOString() })
              .eq('slug', slug)

            if (updateErr) throw updateErr
          } else {
            throw upsertError
          }
        }
      }
    }

    if (importId) setProgress(importId, 100)
    if (importId) setTimeout(() => clearProgress(importId), 30_000)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('REMEDIES IMPORT ERROR:', error)
    return NextResponse.json({ error: 'Import failed' }, { status: 500 })
  }
}
