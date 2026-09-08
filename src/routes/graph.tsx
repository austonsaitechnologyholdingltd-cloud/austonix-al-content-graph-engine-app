import { createFileRoute, redirect } from '@tanstack/react-router'
import { AppShell } from '../components/AppShell'
import {
  getBusinessGraph,
  listOpportunities,
  listContentAssets,
  getInsights,
} from '../server/graph.functions'
import { Building2, Palette, Package, Users, Target, Sparkles, FileText, Lightbulb } from 'lucide-react'

export const Route = createFileRoute('/graph')({
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
  component: GraphExplorer,
})

function GraphExplorer() {
  const { graph, opportunities, content, insights } = Route.useLoaderData()

  return (
    <AppShell>
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Graph Explorer</h1>
      <p className="text-slate-500 mb-6">
        Inspect the entities and relationships behind every recommendation AUSTONIX makes.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Node title="Business" icon={Building2}>
          <p className="font-medium text-slate-900">{graph.business.name}</p>
          <p className="text-sm text-slate-500">{graph.business.industry}</p>
          <p className="text-sm text-slate-600 mt-1">{graph.business.description}</p>
        </Node>

        <Node title="Brand DNA" icon={Palette}>
          <p className="text-sm text-slate-600">Voice: {graph.brand?.voice}</p>
          <p className="text-sm text-slate-600">Positioning: {graph.brand?.positioning}</p>
        </Node>

        <Node title="Products" icon={Package}>
          {graph.products.map((p) => (
            <p key={p.id} className="text-sm text-slate-700">
              • {p.name} — {p.description}
            </p>
          ))}
        </Node>

        <Node title="Audiences" icon={Users}>
          {graph.audiences.map((a) => (
            <p key={a.id} className="text-sm text-slate-700">
              • {a.name} — pain points: {a.painPoints}
            </p>
          ))}
        </Node>

        <Node title="Goals" icon={Target}>
          {graph.goals.map((g) => (
            <p key={g.id} className="text-sm text-slate-700">
              • {g.title}
            </p>
          ))}
        </Node>

        <Node title="Opportunities" icon={Sparkles}>
          {opportunities.map((o) => (
            <p key={o.id} className="text-sm text-slate-700">
              • {o.title} <span className="text-slate-400">({o.status}, score {o.score.toFixed(0)})</span>
            </p>
          ))}
        </Node>

        <Node title="Content assets" icon={FileText}>
          {content.map((c) => (
            <p key={c.id} className="text-sm text-slate-700">
              • {c.title} <span className="text-slate-400">({c.status})</span>
            </p>
          ))}
        </Node>

        <Node title="Insights (learned)" icon={Lightbulb}>
          {insights.map((i) => (
            <p key={i.id} className="text-sm text-slate-700">
              • {i.summary}
            </p>
          ))}
          {insights.length === 0 && <p className="text-sm text-slate-400">Nothing learned yet.</p>}
        </Node>
      </div>
    </AppShell>
  )
}

function Node({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-5 border border-slate-100">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-4 h-4 text-indigo-500" />
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">{title}</h2>
      </div>
      <div className="space-y-1">{children}</div>
    </div>
  )
}
