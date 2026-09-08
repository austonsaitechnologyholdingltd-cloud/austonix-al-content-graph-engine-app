import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { useServerFn } from '@tanstack/react-start'
import { AppShell } from '../../components/AppShell'
import {
  getContentAsset,
  approveContentAsset,
  rejectContentAsset,
  publishContentAsset,
  getEngagementForAsset,
} from '../../server/graph.functions'
import { CheckCircle2, XCircle, Send, TrendingUp } from 'lucide-react'

export const Route = createFileRoute('/content/$id')({
  loader: async ({ params }) => {
    const id = Number(params.id)
    const asset = await getContentAsset({ data: { id } })
    if (!asset) throw new Error('Content asset not found')
    const engagement = await getEngagementForAsset({ data: { contentAssetId: id } })
    return { asset, engagement }
  },
  component: ContentDetail,
})

const statusColor: Record<string, string> = {
  draft: 'bg-amber-100 text-amber-700',
  approved: 'bg-blue-100 text-blue-700',
  rejected: 'bg-red-100 text-red-700',
  published: 'bg-emerald-100 text-emerald-700',
}

function ContentDetail() {
  const { asset, engagement } = Route.useLoaderData()
  const router = useRouter()
  const approveFn = useServerFn(approveContentAsset)
  const rejectFn = useServerFn(rejectContentAsset)
  const publishFn = useServerFn(publishContentAsset)
  const [pending, setPending] = useState<string | null>(null)
  const [notes, setNotes] = useState('')

  async function run(action: string, fn: () => Promise<unknown>) {
    setPending(action)
    try {
      await fn()
      await router.invalidate()
    } finally {
      setPending(null)
    }
  }

  return (
    <AppShell>
      <div className="max-w-2xl">
        <div className="flex items-center gap-2 mb-3">
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColor[asset.status] || 'bg-slate-100 text-slate-600'}`}
          >
            {asset.status}
          </span>
          <span className="text-xs text-slate-400">version {asset.version}</span>
        </div>

        <h1 className="text-2xl font-bold text-slate-900 mb-4">{asset.title}</h1>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-100 whitespace-pre-line text-slate-700 leading-relaxed">
          {asset.body}
        </div>

        {asset.callToAction && (
          <p className="mt-3 text-sm font-medium text-indigo-700 bg-indigo-50 rounded-lg px-4 py-2.5">
            Call to action: {asset.callToAction}
          </p>
        )}

        {asset.status === 'draft' && (
          <div className="mt-6 flex flex-col gap-3">
            <div className="flex gap-3">
              <button
                onClick={() => run('approve', () => approveFn({ data: { id: asset.id } }))}
                disabled={!!pending}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg px-4 py-2.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                {pending === 'approve' ? 'Approving…' : 'Approve'}
              </button>
              <button
                onClick={() =>
                  run('reject', () => rejectFn({ data: { id: asset.id, notes } }))
                }
                disabled={!!pending}
                className="flex items-center gap-2 bg-red-100 hover:bg-red-200 disabled:opacity-60 text-red-700 text-sm font-medium rounded-lg px-4 py-2.5"
              >
                <XCircle className="w-4 h-4" />
                {pending === 'reject' ? 'Rejecting…' : 'Reject'}
              </button>
            </div>
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional feedback if rejecting (feeds back into Brand DNA)"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
        )}

        {asset.status === 'approved' && (
          <button
            onClick={() => run('publish', () => publishFn({ data: { id: asset.id } }))}
            disabled={!!pending}
            className="mt-6 flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg px-4 py-2.5"
          >
            <Send className="w-4 h-4" />
            {pending === 'publish' ? 'Publishing…' : 'Publish'}
          </button>
        )}

        {asset.status === 'rejected' && asset.qualityNotes && (
          <p className="mt-4 text-sm text-red-700 bg-red-50 rounded-lg px-4 py-2.5">
            Feedback: {asset.qualityNotes}
          </p>
        )}

        {asset.status === 'published' && engagement.length > 0 && (
          <div className="mt-6 bg-white rounded-xl shadow-sm p-6 border border-slate-100">
            <p className="flex items-center gap-2 text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-3">
              <TrendingUp className="w-4 h-4" /> Performance feedback
            </p>
            <div className="grid grid-cols-4 gap-4 text-center">
              <MetricBox label="Views" value={engagement[0].views} />
              <MetricBox label="Reactions" value={engagement[0].reactions} />
              <MetricBox label="Comments" value={engagement[0].comments} />
              <MetricBox label="Clicks" value={engagement[0].clicks} />
            </div>
            {engagement[0].leadsSignaled > 0 && (
              <p className="mt-4 text-sm font-medium text-emerald-700">
                This content generated a qualified lead signal.
              </p>
            )}
          </div>
        )}
      </div>
    </AppShell>
  )
}

function MetricBox({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-xl font-bold text-slate-900">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  )
}
