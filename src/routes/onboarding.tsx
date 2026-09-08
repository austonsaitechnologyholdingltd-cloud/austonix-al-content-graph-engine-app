import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useServerFn } from '@tanstack/react-start'
import { completeOnboarding } from '../server/graph.functions'
import { AppShell } from '../components/AppShell'
import { ArrowRight } from 'lucide-react'

export const Route = createFileRoute('/onboarding')({
  component: Onboarding,
})

const voices = ['Professional', 'Conversational', 'Technical', 'Educational', 'Direct', 'Authoritative']

function Onboarding() {
  const navigate = useNavigate()
  const submit = useServerFn(completeOnboarding)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPending(true)
    setError(null)
    const fd = new FormData(e.currentTarget)
    try {
      await submit({
        data: {
          businessName: String(fd.get('businessName') || ''),
          industry: String(fd.get('industry') || ''),
          description: String(fd.get('description') || ''),
          website: String(fd.get('website') || ''),
          voice: String(fd.get('voice') || 'Professional'),
          positioning: String(fd.get('positioning') || ''),
          preferredVocabulary: String(fd.get('preferredVocabulary') || ''),
          prohibitedVocabulary: String(fd.get('prohibitedVocabulary') || ''),
          productName: String(fd.get('productName') || ''),
          productDescription: String(fd.get('productDescription') || ''),
          audienceName: String(fd.get('audienceName') || ''),
          audienceDescription: String(fd.get('audienceDescription') || ''),
          audiencePainPoints: String(fd.get('audiencePainPoints') || ''),
          goalTitle: String(fd.get('goalTitle') || ''),
          goalDescription: String(fd.get('goalDescription') || ''),
        },
      })
      await navigate({ to: '/' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setPending(false)
    }
  }

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-900">Understand the business</h1>
        <p className="text-slate-500 mt-1 mb-8">
          AUSTONIX builds your Business Growth Graph from this. It is the foundation for every
          recommendation the platform makes.
        </p>

        <form onSubmit={handleSubmit} className="space-y-8">
          <Section title="Business">
            <Field label="Business name" name="businessName" required />
            <Field label="Industry" name="industry" required />
            <Field label="What does the business do?" name="description" textarea required />
            <Field label="Website (optional)" name="website" />
          </Section>

          <Section title="Brand DNA">
            <SelectField label="Voice" name="voice" options={voices} />
            <Field label="Positioning / core promise" name="positioning" textarea required />
            <Field label="Preferred vocabulary (comma separated)" name="preferredVocabulary" />
            <Field label="Prohibited vocabulary (comma separated)" name="prohibitedVocabulary" />
          </Section>

          <Section title="Product">
            <Field label="Product / service name" name="productName" required />
            <Field label="Description" name="productDescription" textarea required />
          </Section>

          <Section title="Audience">
            <Field label="Audience segment name" name="audienceName" required />
            <Field label="Description" name="audienceDescription" textarea required />
            <Field label="Known pain points" name="audiencePainPoints" textarea />
          </Section>

          <Section title="Business goal">
            <Field label="Primary goal" name="goalTitle" required />
            <Field label="Why it matters" name="goalDescription" textarea />
          </Section>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={pending}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-medium rounded-lg py-3 transition-colors"
          >
            {pending ? 'Building your Growth Graph…' : 'Build my Business Growth Graph'}
            {!pending && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>
      </div>
    </AppShell>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-100">
      <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">
        {title}
      </h2>
      <div className="space-y-4">{children}</div>
    </div>
  )
}

function Field({
  label,
  name,
  required,
  textarea,
}: {
  label: string
  name: string
  required?: boolean
  textarea?: boolean
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      {textarea ? (
        <textarea
          name={name}
          required={required}
          rows={3}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      ) : (
        <input
          name={name}
          required={required}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      )}
    </label>
  )
}

function SelectField({ label, name, options }: { label: string; name: string; options: string[] }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <select
        name={name}
        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  )
}
