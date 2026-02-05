// Use a global backing so the progress store survives module reloads
// (useful in development and when Next's HMR creates multiple module
// instances). For production with multiple server instances a shared
// store (Redis/DB) is recommended instead.
const globalKey = '__homeopathway_import_progress_store__'
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const g: any = globalThis as any
if (!g[globalKey]) g[globalKey] = new Map<string, number>()
const store: Map<string, number> = g[globalKey]

export function setProgress(id: string, value: number) {
  if (!id) return
  store.set(id, Math.max(0, Math.min(100, Math.round(value))))
}

export function getProgress(id: string) {
  if (!id) return 0
  return store.get(id) ?? 0
}

export function clearProgress(id: string) {
  if (!id) return
  store.delete(id)
}
