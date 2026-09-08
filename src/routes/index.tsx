import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { AppShell } from '../components/AppShell'
import { getBusinessGraph, listOpportunities, listContentAssets, getInsights } from '../server/graph.functions'
import { Sparkles, FileText, Lightbulb, ArrowRight } from 'lucide-react'

export const Route = createFileRoute('/')({
  loader: async () => {
    const graph = await getBusinessGraph()
    if (!graph) {
      throw redirect({ to: '/onboarding' })
    }
    const [opportunities, content, insights] = await Promise.all([
      listOpportunities(),
      listContentAssets(),
      getInsights(),
    ])
    return { graph, opportunities, content, insights }
  },
  component: Home,
})

function Home() {
  const { graph, opportunities, content, insights } = Route.useLoaderData()
  const openOpportunities = opportunities.filter((o) => o.status === 'open')
  const topOpportunity = openOpportunities[0]
  const drafts = content.filter((c) => c.status === 'draft')
  const published = content.filter((c) => c.status === 'published')
  const latestInsight = insights[0]

  return (
    <AppShell>
      <div className="mb-8">
        <p className="text-sm text-indigo-600 font-medium">Your Business Growth Brief</p>
        <h1 className="text-3xl font-bold text-slate-900 mt-1">
          Good day. Here is what matters for {graph.business.name}.
        </h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Stat label="Priority opportunities" value={openOpportunities.length} icon={Sparkles} color="bg-indigo-500" />
        <Stat label="Content in draft" value={drafts.length} icon={FileText} color="bg-amber-500" />
        <Stat label="Published assets" value={published.length} icon={FileText} color="bg-emerald-500" />
        <Stat label="Insights learned" value={insights.length} icon={Lightbulb} color="bg-violet-500" />
      </div>

      {topOpportunity ? (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-100 mb-8">
          <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-2">
            Top opportunity · score {topOpportunity.score.toFixed(0)} · confidence{' '}
            {Math.round(topOpportunity.confidence * 100)}%
          </p>
          <h2 className="text-xl font-semibold text-slate-900">{topOpportunity.title}</h2>
          <p className="text-slate-600 mt-2">{topOpportunity.description}</p>
          <p className="text-sm text-slate-500 mt-3 border-l-2 border-indigo-200 pl-3">
            Evidence: {topOpportunity.evidence}
          </p>
          <p className="text-sm text-slate-700 mt-3">
            <span className="font-medium">Expected outcome:</span> {topOpportunity.expectedOutcome}
          </p>
          <Link
            to="/opportunities"
            className="mt-5 inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg px-4 py-2.5 text-sm transition-colors"
          >
            Engineer this content
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-100 mb-8 text-slate-500">
          No open opportunities right now — check the Opportunities view or add a knowledge source.
        </div>
      )}

      {latestInsight && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-100">
          <p className="text-xs font-semibold text-violet-600 uppercase tracking-wide mb-2">
            Latest insight — the graph learned something
          </p>
          <p className="text-slate-800">{latestInsight.summary}</p>
          <p className="text-sm text-slate-500 mt-2">{latestInsight.evidence}</p>
        </div>
      )}
    </AppShell>
  )
}

function Stat({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string
  value: number
  icon: any
  color: string
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4 border border-slate-100">
      <div className={`${color} p-2.5 rounded-lg`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
      </div>
    </div>
  )
}
