import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  real,
} from 'drizzle-orm/pg-core'

// AUSTONIX Business Growth Graph — MVP node set.
// Every table carries tenant_id so the schema is ready for multi-tenancy
// even though this build runs a single default tenant.

export const businesses = pgTable('businesses', {
  id: serial().primaryKey(),
  tenantId: text('tenant_id').notNull().default('default'),
  name: text().notNull(),
  industry: text(),
  description: text(),
  website: text(),
  createdAt: timestamp('created_at').defaultNow(),
})

export const brands = pgTable('brands', {
  id: serial().primaryKey(),
  tenantId: text('tenant_id').notNull().default('default'),
  businessId: integer('business_id')
    .notNull()
    .references(() => businesses.id),
  voice: text(), // e.g. Professional, Conversational, Technical...
  positioning: text(),
  preferredVocabulary: text('preferred_vocabulary'), // comma separated
  prohibitedVocabulary: text('prohibited_vocabulary'),
  editorialRules: text('editorial_rules'),
  createdAt: timestamp('created_at').defaultNow(),
})

export const products = pgTable('products', {
  id: serial().primaryKey(),
  tenantId: text('tenant_id').notNull().default('default'),
  businessId: integer('business_id')
    .notNull()
    .references(() => businesses.id),
  name: text().notNull(),
  description: text(),
  createdAt: timestamp('created_at').defaultNow(),
})

export const audiences = pgTable('audiences', {
  id: serial().primaryKey(),
  tenantId: text('tenant_id').notNull().default('default'),
  businessId: integer('business_id')
    .notNull()
    .references(() => businesses.id),
  name: text().notNull(),
  description: text(),
  painPoints: text('pain_points'),
  createdAt: timestamp('created_at').defaultNow(),
})

export const goals = pgTable('goals', {
  id: serial().primaryKey(),
  tenantId: text('tenant_id').notNull().default('default'),
  businessId: integer('business_id')
    .notNull()
    .references(() => businesses.id),
  title: text().notNull(),
  description: text(),
  priority: integer().notNull().default(1),
  createdAt: timestamp('created_at').defaultNow(),
})

export const knowledgeSources = pgTable('knowledge_sources', {
  id: serial().primaryKey(),
  tenantId: text('tenant_id').notNull().default('default'),
  businessId: integer('business_id')
    .notNull()
    .references(() => businesses.id),
  sourceType: text('source_type').notNull(), // website, document, note...
  title: text().notNull(),
  content: text(),
  createdAt: timestamp('created_at').defaultNow(),
})

export const topics = pgTable('topics', {
  id: serial().primaryKey(),
  tenantId: text('tenant_id').notNull().default('default'),
  businessId: integer('business_id')
    .notNull()
    .references(() => businesses.id),
  title: text().notNull(),
  goalId: integer('goal_id').references(() => goals.id),
  productId: integer('product_id').references(() => products.id),
  createdAt: timestamp('created_at').defaultNow(),
})

// Opportunity: prioritized reason to act. Score + evidence make it explainable.
export const opportunities = pgTable('opportunities', {
  id: serial().primaryKey(),
  tenantId: text('tenant_id').notNull().default('default'),
  businessId: integer('business_id')
    .notNull()
    .references(() => businesses.id),
  topicId: integer('topic_id').references(() => topics.id),
  goalId: integer('goal_id').references(() => goals.id),
  productId: integer('product_id').references(() => products.id),
  audienceId: integer('audience_id').references(() => audiences.id),
  title: text().notNull(),
  description: text().notNull(),
  recommendedAction: text('recommended_action').notNull(),
  expectedOutcome: text('expected_outcome'),
  evidence: text().notNull(), // human-readable evidence used for scoring
  score: real().notNull().default(0),
  confidence: real().notNull().default(0.6),
  status: text().notNull().default('open'), // open | actioned | dismissed | expired
  createdAt: timestamp('created_at').defaultNow(),
})

export const channels = pgTable('channels', {
  id: serial().primaryKey(),
  tenantId: text('tenant_id').notNull().default('default'),
  businessId: integer('business_id')
    .notNull()
    .references(() => businesses.id),
  name: text().notNull(), // LinkedIn, Email, Telegram...
  isConnected: integer('is_connected').notNull().default(1),
  createdAt: timestamp('created_at').defaultNow(),
})

// Content Asset: traceable back to every entity that motivated it.
export const contentAssets = pgTable('content_assets', {
  id: serial().primaryKey(),
  tenantId: text('tenant_id').notNull().default('default'),
  businessId: integer('business_id')
    .notNull()
    .references(() => businesses.id),
  opportunityId: integer('opportunity_id').references(() => opportunities.id),
  topicId: integer('topic_id').references(() => topics.id),
  productId: integer('product_id').references(() => products.id),
  audienceId: integer('audience_id').references(() => audiences.id),
  goalId: integer('goal_id').references(() => goals.id),
  channelId: integer('channel_id').references(() => channels.id),
  title: text().notNull(),
  body: text().notNull(),
  callToAction: text('call_to_action'),
  status: text().notNull().default('draft'), // draft | approved | rejected | published
  qualityNotes: text('quality_notes'),
  version: integer().notNull().default(1),
  createdAt: timestamp('created_at').defaultNow(),
  approvedAt: timestamp('approved_at'),
})

export const publications = pgTable('publications', {
  id: serial().primaryKey(),
  tenantId: text('tenant_id').notNull().default('default'),
  contentAssetId: integer('content_asset_id')
    .notNull()
    .references(() => contentAssets.id),
  channelId: integer('channel_id').references(() => channels.id),
  status: text().notNull().default('published'), // scheduled | published | failed
  publishedAt: timestamp('published_at').defaultNow(),
})

export const engagements = pgTable('engagements', {
  id: serial().primaryKey(),
  tenantId: text('tenant_id').notNull().default('default'),
  publicationId: integer('publication_id')
    .notNull()
    .references(() => publications.id),
  contentAssetId: integer('content_asset_id')
    .notNull()
    .references(() => contentAssets.id),
  views: integer().notNull().default(0),
  reactions: integer().notNull().default(0),
  comments: integer().notNull().default(0),
  clicks: integer().notNull().default(0),
  leadsSignaled: integer('leads_signaled').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow(),
})

// Insight: what the graph learned, feeding back into future opportunity scoring.
export const insights = pgTable('insights', {
  id: serial().primaryKey(),
  tenantId: text('tenant_id').notNull().default('default'),
  businessId: integer('business_id')
    .notNull()
    .references(() => businesses.id),
  contentAssetId: integer('content_asset_id').references(() => contentAssets.id),
  topicId: integer('topic_id').references(() => topics.id),
  summary: text().notNull(),
  evidence: text().notNull(),
  createdAt: timestamp('created_at').defaultNow(),
})
