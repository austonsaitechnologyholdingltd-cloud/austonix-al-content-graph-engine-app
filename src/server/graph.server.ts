// Server-only helpers implementing the AUSTONIX Business Growth Graph MVP loop:
// Understand (business/brand/product/audience/goal) -> Discover (opportunities)
// -> Create (content) -> Approve -> Publish -> Measure -> Learn (insights).
import { eq, desc } from 'drizzle-orm'
import { db } from '../../db/index.js'
import {
  businesses,
  brands,
  products,
  audiences,
  goals,
  topics,
  opportunities,
  contentAssets,
  channels,
  publications,
  engagements,
  insights,
} from '../../db/schema.js'

const TENANT = 'default'

export async function getBusinessGraph() {
  const [business] = await db
    .select()
    .from(businesses)
    .where(eq(businesses.tenantId, TENANT))
    .orderBy(desc(businesses.id))
    .limit(1)

  if (!business) return null

  const [brand] = await db
    .select()
    .from(brands)
    .where(eq(brands.businessId, business.id))
  const productList = await db
    .select()
    .from(products)
    .where(eq(products.businessId, business.id))
  const audienceList = await db
    .select()
    .from(audiences)
    .where(eq(audiences.businessId, business.id))
  const goalList = await db
    .select()
    .from(goals)
    .where(eq(goals.businessId, business.id))
  const channelList = await db
    .select()
    .from(channels)
    .where(eq(channels.businessId, business.id))

  return {
    business,
    brand: brand ?? null,
    products: productList,
    audiences: audienceList,
    goals: goalList,
    channels: channelList,
  }
}

export type OnboardingInput = {
  businessName: string
  industry: string
  description: string
  website?: string
  voice: string
  positioning: string
  preferredVocabulary: string
  prohibitedVocabulary: string
  productName: string
  productDescription: string
  audienceName: string
  audienceDescription: string
  audiencePainPoints: string
  goalTitle: string
  goalDescription: string
}

// Rule-based opportunity scoring — explainable by design (Principle 19).
// score = businessRelevance + audienceDemand + timing + contentFit + commercialPotential + confidence - effort - risk
function scoreOpportunity(parts: {
  businessRelevance: number
  audienceDemand: number
  timing: number
  contentFit: number
  commercialPotential: number
  confidence: number
  effort: number
  risk: number
}) {
  return (
    parts.businessRelevance +
    parts.audienceDemand +
    parts.timing +
    parts.contentFit +
    parts.commercialPotential +
    parts.confidence -
    parts.effort -
    parts.risk
  )
}

export async function completeOnboarding(input: OnboardingInput) {
  const [business] = await db
    .insert(businesses)
    .values({
      tenantId: TENANT,
      name: input.businessName,
      industry: input.industry,
      description: input.description,
      website: input.website,
    })
    .returning()

  await db.insert(brands).values({
    tenantId: TENANT,
    businessId: business.id,
    voice: input.voice,
    positioning: input.positioning,
    preferredVocabulary: input.preferredVocabulary,
    prohibitedVocabulary: input.prohibitedVocabulary,
  })

  const [product] = await db
    .insert(products)
    .values({
      tenantId: TENANT,
      businessId: business.id,
      name: input.productName,
      description: input.productDescription,
    })
    .returning()

  const [audience] = await db
    .insert(audiences)
    .values({
      tenantId: TENANT,
      businessId: business.id,
      name: input.audienceName,
      description: input.audienceDescription,
      painPoints: input.audiencePainPoints,
    })
    .returning()

  const [goal] = await db
    .insert(goals)
    .values({
      tenantId: TENANT,
      businessId: business.id,
      title: input.goalTitle,
      description: input.goalDescription,
      priority: 1,
    })
    .returning()

  await db.insert(channels).values([
    { tenantId: TENANT, businessId: business.id, name: 'LinkedIn' },
    { tenantId: TENANT, businessId: business.id, name: 'Email' },
    { tenantId: TENANT, businessId: business.id, name: 'Telegram' },
  ])

  const [topic] = await db
    .insert(topics)
    .values({
      tenantId: TENANT,
      businessId: business.id,
      title: `Getting started with ${input.productName}`,
      goalId: goal.id,
      productId: product.id,
    })
    .returning()

  const evidence = `Business goal "${goal.title}" targets audience "${audience.name}", who experience: ${audience.painPoints || 'unspecified pain points'}. No prior content exists for topic "${topic.title}", making it a first-mover educational opportunity.`

  const score = scoreOpportunity({
    businessRelevance: 8,
    audienceDemand: 7,
    timing: 6,
    contentFit: 8,
    commercialPotential: 6,
    confidence: 7,
    effort: 3,
    risk: 1,
  })

  await db.insert(opportunities).values({
    tenantId: TENANT,
    businessId: business.id,
    topicId: topic.id,
    goalId: goal.id,
    productId: product.id,
    audienceId: audience.id,
    title: `Educate ${audience.name} on getting started with ${product.name}`,
    description: `Publish an educational post that walks ${audience.name} through the first steps of using ${product.name}, directly supporting the goal "${goal.title}".`,
    recommendedAction: 'Create an educational content asset and publish to LinkedIn and Email.',
    expectedOutcome: 'Increase qualified engagement and generate early product interest.',
    evidence,
    score,
    confidence: 0.78,
    status: 'open',
  })

  return business
}

export async function listOpportunities() {
  const graph = await getBusinessGraph()
  if (!graph) return []
  return db
    .select()
    .from(opportunities)
    .where(eq(opportunities.businessId, graph.business.id))
    .orderBy(desc(opportunities.score))
}

export async function getOpportunity(id: number) {
  const [opp] = await db.select().from(opportunities).where(eq(opportunities.id, id))
  return opp ?? null
}

export async function listContentAssets() {
  const graph = await getBusinessGraph()
  if (!graph) return []
  return db
    .select()
    .from(contentAssets)
    .where(eq(contentAssets.businessId, graph.business.id))
    .orderBy(desc(contentAssets.id))
}

export async function getContentAsset(id: number) {
  const [asset] = await db.select().from(contentAssets).where(eq(contentAssets.id, id))
  return asset ?? null
}

// Content Engineering Pipeline: opportunity -> brief -> draft (AI or fallback) -> stored asset.
export async function engineerContentFromOpportunity(opportunityId: number) {
  const graph = await getBusinessGraph()
  if (!graph) throw new Error('Business not onboarded yet')

  const opportunity = await getOpportunity(opportunityId)
  if (!opportunity) throw new Error('Opportunity not found')

  const product = graph.products.find((p) => p.id === opportunity.productId)
  const audience = graph.audiences.find((a) => a.id === opportunity.audienceId)
  const goal = graph.goals.find((g) => g.id === opportunity.goalId)
  const channel = graph.channels.find((c) => c.name === 'LinkedIn') ?? graph.channels[0]

  const draft = await generateDraft({
    business: graph.business,
    brand: graph.brand,
    product,
    audience,
    goal,
    opportunity,
  })

  const [asset] = await db
    .insert(contentAssets)
    .values({
      tenantId: TENANT,
      businessId: graph.business.id,
      opportunityId: opportunity.id,
      topicId: opportunity.topicId,
      productId: opportunity.productId,
      audienceId: opportunity.audienceId,
      goalId: opportunity.goalId,
      channelId: channel?.id,
      title: draft.title,
      body: draft.body,
      callToAction: draft.callToAction,
      status: 'draft',
    })
    .returning()

  await db
    .update(opportunities)
    .set({ status: 'actioned' })
    .where(eq(opportunities.id, opportunity.id))

  return asset
}

async function generateDraft(context: {
  business: any
  brand: any
  product?: any
  audience?: any
  goal?: any
  opportunity: any
}) {
  const prompt = `You are the Content Engineer agent inside AUSTONIX, a graph-native AI content growth system.
Generate one educational LinkedIn post using this business context (graph evidence):

Business: ${context.business.name} (${context.business.industry}) — ${context.business.description}
Brand voice: ${context.brand?.voice || 'professional'}
Brand positioning: ${context.brand?.positioning || ''}
Preferred vocabulary: ${context.brand?.preferredVocabulary || ''}
Prohibited vocabulary (never use): ${context.brand?.prohibitedVocabulary || ''}
Product: ${context.product?.name || ''} — ${context.product?.description || ''}
Audience: ${context.audience?.name || ''} — pain points: ${context.audience?.painPoints || ''}
Goal: ${context.goal?.title || ''}
Opportunity: ${context.opportunity.title} — ${context.opportunity.description}

Respond ONLY with strict JSON of the shape:
{"title": "short compelling headline", "body": "3-5 short paragraphs, no fabricated statistics or quotes", "callToAction": "one line call to action"}`

  try {
    const Anthropic = (await import('@anthropic-ai/sdk')).default
    const anthropic = new Anthropic()
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-5',
      max_tokens: 800,
      messages: [{ role: 'user', content: prompt }],
    })
    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      if (parsed.title && parsed.body) return parsed
    }
  } catch (err) {
    console.error('AI content generation failed, using fallback draft', err)
  }

  // Fallback keeps the loop functional even if AI Gateway is unavailable.
  return {
    title: `Getting started with ${context.product?.name || 'our product'}`,
    body: `${context.audience?.name || 'Our audience'} often asks how to get started with ${context.product?.name || 'our product'}. Here are the first steps we recommend, based directly on ${context.business.name}'s approach.\n\nStart by clarifying the outcome you want. Then walk through setup with our team's guidance. Finally, measure results early so you can adjust quickly.\n\nThis keeps the process simple and avoids the most common early mistakes.`,
    callToAction: `Want a walkthrough tailored to your team? Reach out to ${context.business.name}.`,
  }
}

export async function approveContentAsset(id: number) {
  const [updated] = await db
    .update(contentAssets)
    .set({ status: 'approved', approvedAt: new Date() })
    .where(eq(contentAssets.id, id))
    .returning()
  return updated
}

export async function rejectContentAsset(id: number, notes: string) {
  const [updated] = await db
    .update(contentAssets)
    .set({ status: 'rejected', qualityNotes: notes })
    .where(eq(contentAssets.id, id))
    .returning()
  return updated
}

// Publish + simulate engagement + write an Insight back to the graph — closing the loop.
export async function publishContentAsset(id: number) {
  const asset = await getContentAsset(id)
  if (!asset) throw new Error('Content asset not found')
  if (asset.status !== 'approved') throw new Error('Content must be approved before publishing')

  const [publication] = await db
    .insert(publications)
    .values({
      tenantId: TENANT,
      contentAssetId: asset.id,
      channelId: asset.channelId,
      status: 'published',
    })
    .returning()

  await db
    .update(contentAssets)
    .set({ status: 'published' })
    .where(eq(contentAssets.id, asset.id))

  // Simulated performance signal — a real integration would poll channel analytics.
  const views = 200 + Math.round(Math.random() * 800)
  const reactions = Math.round(views * (0.03 + Math.random() * 0.05))
  const comments = Math.round(reactions * 0.2)
  const clicks = Math.round(views * (0.01 + Math.random() * 0.02))
  const leadsSignaled = clicks > 15 ? 1 : 0

  await db.insert(engagements).values({
    tenantId: TENANT,
    publicationId: publication.id,
    contentAssetId: asset.id,
    views,
    reactions,
    comments,
    clicks,
    leadsSignaled,
  })

  const summary =
    leadsSignaled > 0
      ? `"${asset.title}" generated ${clicks} clicks and a qualified lead signal — educational framing is working for this audience.`
      : `"${asset.title}" reached ${views} views with ${reactions} reactions. Engagement is healthy but no lead signal yet — consider a stronger call to action next time.`

  await db.insert(insights).values({
    tenantId: TENANT,
    businessId: asset.businessId,
    contentAssetId: asset.id,
    topicId: asset.topicId,
    summary,
    evidence: `${views} views, ${reactions} reactions, ${comments} comments, ${clicks} clicks, ${leadsSignaled} lead signal(s).`,
  })

  return { publication }
}

export async function getInsights() {
  const graph = await getBusinessGraph()
  if (!graph) return []
  return db
    .select()
    .from(insights)
    .where(eq(insights.businessId, graph.business.id))
    .orderBy(desc(insights.id))
}

export async function getEngagementForAsset(contentAssetId: number) {
  return db
    .select()
    .from(engagements)
    .where(eq(engagements.contentAssetId, contentAssetId))
    .orderBy(desc(engagements.id))
}
