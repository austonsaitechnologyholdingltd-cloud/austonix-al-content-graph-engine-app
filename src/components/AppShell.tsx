import { Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { Brain, LayoutGrid, Sparkles, FileText, Network } from 'lucide-react'

const nav = [
  { to: '/', label: 'Command Center', icon: LayoutGrid },
  { to: '/opportunities', label: 'Strategy & Opportunities', icon: Sparkles },
  { to: '/content', label: 'Content Workspace', icon: FileText },
  { to: '/graph', label: 'Business Graph', icon: Network },
]

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2 font-semibold text-slate-900 shrink-0">
            <div className="bg-indigo-600 text-white rounded-lg p-1.5">
              <Brain className="w-5 h-5" />
            </div>
            <span>AUSTONIX</span>
            <span className="hidden lg:inline text-xs font-normal text-slate-400 ml-1">
              AI Content-Graph Engine
            </span>
          </Link>
          <nav className="flex items-center gap-1 overflow-x-auto">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 px-3 py-2 rounded-lg transition-colors whitespace-nowrap"
                activeProps={{ className: 'text-indigo-600 bg-indigo-50' }}
              >
                <item.icon className="w-4 h-4" />
                <span className="hidden md:inline">{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
    </div>
  )
}
