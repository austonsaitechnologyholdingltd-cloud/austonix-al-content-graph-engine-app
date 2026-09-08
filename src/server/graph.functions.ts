import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import * as graphServer from './graph.server.js'

export const getBusinessGraph = createServerFn({ method: 'GET' }).handler(async () => {
  return graphServer.getBusinessGraph()
})

const OnboardingSchema = z.object({
  businessName: z.string().min(1),
  industry: z.string().min(1),
  description: z.string().min(1),
  website: z.string().optional(),
  voice: z.string().min(1),
  positioning: z.string().min(1),
  preferredVocabulary: z.string(),
  prohibitedVocabulary: z.string(),
  productName: z.string().min(1),
  productDescription: z.string().min(1),
  audienceName: z.string().min(1),
  audienceDescription: z.string().min(1),
  audiencePainPoints: z.string(),
  goalTitle: z.string().min(1),
  goalDescription: z.string(),
})

export const completeOnboarding = createServerFn({ method: 'POST' })
  .inputValidator(OnboardingSchema)
  .handler(async ({ data }) => {
    return graphServer.completeOnboarding(data)
  })

export const listOpportunities = createServerFn({ method: 'GET' }).handler(async () => {
  return graphServer.listOpportunities()
})

export const listContentAssets = createServerFn({ method: 'GET' }).handler(async () => {
  return graphServer.listContentAssets()
})

export const getContentAsset = createServerFn({ method: 'GET' })
  .inputValidator((data: { id: number }) => data)
  .handler(async ({ data }) => {
    return graphServer.getContentAsset(data.id)
  })

export const engineerContentFromOpportunity = createServerFn({ method: 'POST' })
  .inputValidator((data: { opportunityId: number }) => data)
  .handler(async ({ data }) => {
    return graphServer.engineerContentFromOpportunity(data.opportunityId)
  })

export const approveContentAsset = createServerFn({ method: 'POST' })
  .inputValidator((data: { id: number }) => data)
  .handler(async ({ data }) => {
    return graphServer.approveContentAsset(data.id)
  })

export const rejectContentAsset = createServerFn({ method: 'POST' })
  .inputValidator((data: { id: number; notes: string }) => data)
  .handler(async ({ data }) => {
    return graphServer.rejectContentAsset(data.id, data.notes)
  })

export const publishContentAsset = createServerFn({ method: 'POST' })
  .inputValidator((data: { id: number }) => data)
  .handler(async ({ data }) => {
    return graphServer.publishContentAsset(data.id)
  })

export const getInsights = createServerFn({ method: 'GET' }).handler(async () => {
  return graphServer.getInsights()
})

export const getEngagementForAsset = createServerFn({ method: 'GET' })
  .inputValidator((data: { contentAssetId: number }) => data)
  .handler(async ({ data }) => {
    return graphServer.getEngagementForAsset(data.contentAssetId)
  })
