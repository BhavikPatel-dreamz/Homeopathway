const store = new Map<string, number>()

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
