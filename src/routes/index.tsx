import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { AppShell } from '../components/AppShell'
import { getBusinessGraph, listOpportunities, listContentAssets, getInsights } from '../server/graph.functions'
import { Sparkles, FileText, Lightbulb, ArrowRight, Network, Target, Users, Package, CheckCircle2 } from 'lucide-react'

export const Route = createFileRoute('/')({
  loader: async () => {
    const graph = await getBusinessGraph()
    if (!graph) throw redirect({ to: '/onboarding' })
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
  const graphNodes = 1 + (graph.brand ? 1 : 0) + graph.products.length + graph.audiences.length + graph.goals.length + graph.channels.length
  const strategyCoverage = Math.min(100, Math.round((Math.min(opportunities.length, 3) / 3) * 40 + (Math.min(content.length, 3) / 3) * 35 + (Math.min(insights.length, 3) / 3) * 25))

  return (
    <AppShell>
      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-600">Growth Intelligence Command Center</span>
          <span className="text-xs rounded-full bg-emerald-50 text-emerald-700 px-2.5 py-1 font-medium">Graph active</span>
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mt-1">Good day. Here is what matters for {graph.business.name}.</h1>
        <p className="text-slate-500 mt-2 max-w-3xl">AUSTONIX converts your business context into opportunities, content decisions and a continuously learning growth graph.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Stat label="Priority opportunities" value={openOpportunities.length} icon={Sparkles} color="bg-indigo-500" />
        <Stat label="Content in draft" value={drafts.length} icon={FileText} color="bg-amber-500" />
        <Stat label="Published assets" value={published.length} icon={CheckCircle2} color="bg-emerald-500" />
        <Stat label="Insights learned" value={insights.length} icon={Lightbulb} color="bg-violet-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        <MiniCard icon={Network} label="Graph entities" value={graphNodes} detail="Business, brand, products, audiences, goals and channels" />
        <MiniCard icon={Target} label="Strategy coverage" value={`${strategyCoverage}%`} detail="Opportunity → content → learning maturity" />
        <MiniCard icon={Users} label="Audience nodes" value={graph.audiences.length} detail="Audience segments currently connected to the graph" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 border border-slate-100">
          <div className="flex items-start justify-between gap-4 mb-5">
            <div>
              <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-1">Recommended next move</p>
              <h2 className="text-xl font-semibold text-slate-900">Turn the highest-value opportunity into content.</h2>
            </div>
            <Sparkles className="w-5 h-5 text-indigo-500 shrink-0" />
          </div>
          {topOpportunity ? (
            <>
              <h3 className="font-semibold text-slate-900">{topOpportunity.title}</h3>
              <p className="text-slate-600 mt-2">{topOpportunity.description}</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
                <Metric label="Score" value={topOpportunity.score.toFixed(0)} />
                <Metric label="Confidence" value={`${Math.round(topOpportunity.confidence * 100)}%`} />
                <Metric label="Status" value={topOpportunity.status} />
                <Metric label="Action" value="Engineer" />
              </div>
              <Link to="/opportunities" className="mt-5 inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg px-4 py-2.5 text-sm transition-colors">
                Open strategy radar <ArrowRight className="w-4 h-4" />
              </Link>
            </>
          ) : (
            <p className="text-slate-500">No open opportunities yet. Add more business context to expand the graph.</p>
          )}
        </div>

        <div className="bg-slate-900 rounded-xl p-6 text-white">
          <p className="text-xs font-semibold text-indigo-300 uppercase tracking-wide mb-2">Graph status</p>
          <h2 className="text-lg font-semibold">Your intelligence foundation</h2>
          <div className="space-y-4 mt-5">
            <StatusRow label="Business identity" complete={Boolean(graph.business)} />
            <StatusRow label="Brand DNA" complete={Boolean(graph.brand)} />
            <StatusRow label="Audience intelligence" complete={graph.audiences.length > 0} />
            <StatusRow label="Growth goals" complete={graph.goals.length > 0} />
            <StatusRow label="Content learning" complete={insights.length > 0} />
          </div>
          <Link to="/graph" className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-indigo-300 hover:text-white">Inspect business graph <ArrowRight className="w-4 h-4" /></Link>
        </div>
      </div>

      {latestInsight && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-100">
          <p className="text-xs font-semibold text-violet-600 uppercase tracking-wide mb-2">Latest graph learning</p>
          <p className="text-slate-800 font-medium">{latestInsight.summary}</p>
          <p className="text-sm text-slate-500 mt-2">{latestInsight.evidence}</p>
        </div>
      )}
    </AppShell>
  )
}

function Stat({ label, value, icon: Icon, color }: { label: string; value: number; icon: any; color: string }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4 border border-slate-100">
      <div className={`${color} p-2.5 rounded-lg`}><Icon className="w-5 h-5 text-white" /></div>
      <div><p className="text-xs text-slate-500">{label}</p><p className="text-2xl font-bold text-slate-900">{value}</p></div>
    </div>
  )
}

function MiniCard({ icon: Icon, label, value, detail }: { icon: any; label: string; value: number | string; detail: string }) {
  return <div className="bg-white rounded-xl shadow-sm p-5 border border-slate-100"><Icon className="w-4 h-4 text-indigo-500 mb-3" /><p className="text-xs text-slate-500">{label}</p><p className="text-2xl font-bold text-slate-900 mt-1">{value}</p><p className="text-xs text-slate-400 mt-1">{detail}</p></div>
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg bg-slate-50 p-3"><p className="text-[11px] uppercase tracking-wide text-slate-400">{label}</p><p className="text-sm font-semibold text-slate-800 mt-1 capitalize">{value}</p></div>
}

function StatusRow({ label, complete }: { label: string; complete: boolean }) {
  return <div className="flex items-center justify-between text-sm"><span className="text-slate-300">{label}</span><span className={complete ? 'text-emerald-400' : 'text-slate-500'}>{complete ? 'Ready' : 'Pending'}</span></div>
}
