import { createFileRoute, useNavigate, redirect } from '@tanstack/react-router'
import { useState } from 'react'
import { useServerFn } from '@tanstack/react-start'
import { AppShell } from '../components/AppShell'
import { getBusinessGraph, listOpportunities, engineerContentFromOpportunity } from '../server/graph.functions'
import { Sparkles, Wand2, Target, ArrowRight } from 'lucide-react'

export const Route = createFileRoute('/opportunities')({
  loader: async () => {
    const graph = await getBusinessGraph()
    if (!graph) throw redirect({ to: '/onboarding' })
    const opportunities = await listOpportunities()
    return { graph, opportunities }
  },
  component: Opportunities,
})

function Opportunities() {
  const { graph, opportunities } = Route.useLoaderData()
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
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-600">Strategy Engine</span>
          <span className="text-xs rounded-full bg-slate-100 text-slate-600 px-2.5 py-1">{graph.business.name}</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Opportunity Radar</h1>
        <p className="text-slate-500 max-w-3xl">Prioritized reasons to act, ranked from your Business Growth Graph. Each opportunity connects an audience problem, business goal, product and recommended content action.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Summary label="Open opportunities" value={opportunities.filter((o) => o.status === 'open').length} />
        <Summary label="Actioned" value={opportunities.filter((o) => o.status === 'actioned').length} />
        <Summary label="Top score" value={opportunities.length ? opportunities[0].score.toFixed(0) : '—'} />
      </div>

      <div className="space-y-4">
        {opportunities.map((opp, index) => (
          <div key={opp.id} className="bg-white rounded-xl shadow-sm p-6 border border-slate-100">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="text-xs font-bold text-slate-400">#{index + 1}</span>
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{opp.status} · score {opp.score.toFixed(0)} · confidence {Math.round(opp.confidence * 100)}%</span>
                </div>
                <h2 className="text-lg font-semibold text-slate-900">{opp.title}</h2>
                <p className="text-slate-600 mt-1">{opp.description}</p>
              </div>
              {opp.status === 'open' && (
                <button onClick={() => handleEngineer(opp.id)} disabled={pendingId === opp.id} className="shrink-0 flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg px-4 py-2.5 transition-colors">
                  <Wand2 className="w-4 h-4" />
                  {pendingId === opp.id ? 'Engineering…' : 'Engineer content'}
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-5">
              <Insight label="Evidence" icon={Sparkles}>{opp.evidence}</Insight>
              <Insight label="Recommended action" icon={Target}>{opp.recommendedAction}</Insight>
              <Insight label="Expected outcome" icon={ArrowRight}>{opp.expectedOutcome}</Insight>
            </div>
          </div>
        ))}
        {opportunities.length === 0 && <p className="text-slate-500">No opportunities yet.</p>}
      </div>
    </AppShell>
  )
}

function Summary({ label, value }: { label: string; value: number | string }) {
  return <div className="bg-white rounded-xl shadow-sm p-5 border border-slate-100"><p className="text-xs text-slate-500">{label}</p><p className="text-2xl font-bold text-slate-900 mt-1">{value}</p></div>
}

function Insight({ label, icon: Icon, children }: { label: string; icon: any; children: string }) {
  return <div className="rounded-lg bg-slate-50 p-4"><div className="flex items-center gap-2 mb-2"><Icon className="w-3.5 h-3.5 text-indigo-500" /><p className="text-[11px] uppercase tracking-wide font-semibold text-slate-400">{label}</p></div><p className="text-sm text-slate-600 leading-5">{children}</p></div>
}
