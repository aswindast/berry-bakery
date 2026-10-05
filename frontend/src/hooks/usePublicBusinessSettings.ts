import { useEffect, useState } from 'react'
import { fetchPublicBusinessSettings, type PublicBusinessSettings } from '../services/businessSettingsService'

export function usePublicBusinessSettings() {
  const [settings, setSettings] = useState<PublicBusinessSettings | null>(null)
  useEffect(() => {
    let active = true
    fetchPublicBusinessSettings().then((value) => { if (active) setSettings(value) }).catch(() => undefined)
    return () => { active = false }
  }, [])
  return settings
}
