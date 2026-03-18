
export async function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}