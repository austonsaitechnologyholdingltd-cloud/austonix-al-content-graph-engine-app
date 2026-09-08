import { createFileRoute, useNavigate, redirect } from '@tanstack/react-router'
import { useState } from 'react'
import { useServerFn } from '@tanstack/react-start'
import { AppShell } from '../components/AppShell'
import {
  getBusinessGraph,
  listOpportunities,
  engineerContentFromOpportunity,
} from '../server/graph.functions'
import { Sparkles, Wand2 } from 'lucide-react'

export const Route = createFileRoute('/opportunities')({
  loader: async () => {
    const graph = await getBusinessGraph()
    if (!graph) throw redirect({ to: '/onboarding' })
    const opportunities = await listOpportunities()
    return { opportunities }
  },
  component: Opportunities,
})

function Opportunities() {
  const { opportunities } = Route.useLoaderData()
  const navigate = useNavigate()
  const engineer = useServerFn(engineerContentFromOpportunity)
  const [pendingId, setPendingId] = useState<number | null>(null)

  async function handleEngineer(opportunityId: number) {
    setPendingId(opportunityId)
    try {
      const asset = await engineer({ data: { opportunityId } })
      await navigate({ to: '/content/$id', params: { id: String(asset.id) } })
    } finally {
      setPendingId(null)
    }
  }

  return (
    <AppShell>
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Opportunity Radar</h1>
      <p className="text-slate-500 mb-6">
        Prioritized reasons to act, ranked and scored from your Business Growth Graph.
      </p>

      <div className="space-y-4">
        {opportunities.map((opp) => (
          <div key={opp.id} className="bg-white rounded-xl shadow-sm p-6 border border-slate-100">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    {opp.status} · score {opp.score.toFixed(0)} · confidence{' '}
                    {Math.round(opp.confidence * 100)}%
                  </span>
                </div>
                <h2 className="text-lg font-semibold text-slate-900">{opp.title}</h2>
                <p className="text-slate-600 mt-1">{opp.description}</p>
                <p className="text-sm text-slate-500 mt-2 border-l-2 border-indigo-200 pl-3">
                  {opp.evidence}
                </p>
              </div>
              {opp.status === 'open' && (
                <button
                  onClick={() => handleEngineer(opp.id)}
                  disabled={pendingId === opp.id}
                  className="shrink-0 flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg px-4 py-2.5 transition-colors"
                >
                  <Wand2 className="w-4 h-4" />
                  {pendingId === opp.id ? 'Engineering…' : 'Engineer this content'}
                </button>
              )}
            </div>
          </div>
        ))}
        {opportunities.length === 0 && (
          <p className="text-slate-500">No opportunities yet.</p>
        )}
      </div>
    </AppShell>
  )
}
