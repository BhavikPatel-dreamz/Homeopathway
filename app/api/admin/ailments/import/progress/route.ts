import { NextResponse } from 'next/server'
import { getProgress } from '@/lib/importProgress'

export const runtime = 'nodejs'

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const id = url.searchParams.get('importId') || ''
    const progress = getProgress(id)
    return NextResponse.json({ progress })
  } catch (err) {
    return NextResponse.json({ progress: 0 })
  }
}
