import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { AppShell } from '../../components/AppShell'
import { getBusinessGraph, listContentAssets } from '../../server/graph.functions'
import { FileText } from 'lucide-react'

export const Route = createFileRoute('/content/')({
  loader: async () => {
    const graph = await getBusinessGraph()
    if (!graph) throw redirect({ to: '/onboarding' })
    const content = await listContentAssets()
    return { content }
  },
  component: ContentWorkspace,
})

const statusColor: Record<string, string> = {
  draft: 'bg-amber-100 text-amber-700',
  approved: 'bg-blue-100 text-blue-700',
  rejected: 'bg-red-100 text-red-700',
  published: 'bg-emerald-100 text-emerald-700',
}

function ContentWorkspace() {
  const { content } = Route.useLoaderData()

  return (
    <AppShell>
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Content Workspace</h1>
      <p className="text-slate-500 mb-6">
        Every asset here is traceable back to the opportunity, product, audience, and goal that produced it.
      </p>

      <div className="space-y-3">
        {content.map((asset) => (
          <Link
            key={asset.id}
            to="/content/$id"
            params={{ id: String(asset.id) }}
            className="block bg-white rounded-xl shadow-sm p-5 border border-slate-100 hover:border-indigo-200 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-slate-400" />
                <span className="font-medium text-slate-900">{asset.title}</span>
              </div>
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColor[asset.status] || 'bg-slate-100 text-slate-600'}`}
              >
                {asset.status}
              </span>
            </div>
          </Link>
        ))}
        {content.length === 0 && (
          <p className="text-slate-500">
            No content yet. Go to Opportunities and select "Engineer this content".
          </p>
        )}
      </div>
    </AppShell>
  )
}
