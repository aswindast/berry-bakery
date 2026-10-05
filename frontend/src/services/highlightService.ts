import { apiConfig } from '../lib/api'

export type HomepageHighlight = { id: string; title: string; description: string; image: string; displayOrder: number }

export async function fetchHighlights(): Promise<HomepageHighlight[]> {
  const response = await fetch(`${apiConfig.baseUrl}/highlights`)
  if (!response.ok) throw new Error(`Failed to fetch homepage highlights: ${response.statusText}`)
  const json = await response.json() as { data: HomepageHighlight[] }
  return json.data
}
