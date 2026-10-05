import type { ReactNode } from 'react'
import { Footer } from '../components/navigation/Footer'
import { Navbar } from '../components/navigation/Navbar'

export function AppShell({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-berry-cream text-berry-text"><Navbar /><main id="main-content">{children}</main><Footer /></div>
}
