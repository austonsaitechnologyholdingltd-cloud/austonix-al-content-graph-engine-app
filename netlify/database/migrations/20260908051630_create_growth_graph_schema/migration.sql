CREATE TABLE "audiences" (
	"id" serial PRIMARY KEY,
	"tenant_id" text DEFAULT 'default' NOT NULL,
	"business_id" integer NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"pain_points" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "brands" (
	"id" serial PRIMARY KEY,
	"tenant_id" text DEFAULT 'default' NOT NULL,
	"business_id" integer NOT NULL,
	"voice" text,
	"positioning" text,
	"preferred_vocabulary" text,
	"prohibited_vocabulary" text,
	"editorial_rules" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "businesses" (
	"id" serial PRIMARY KEY,
	"tenant_id" text DEFAULT 'default' NOT NULL,
	"name" text NOT NULL,
	"industry" text,
	"description" text,
	"website" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "channels" (
	"id" serial PRIMARY KEY,
	"tenant_id" text DEFAULT 'default' NOT NULL,
	"business_id" integer NOT NULL,
	"name" text NOT NULL,
	"is_connected" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "content_assets" (
	"id" serial PRIMARY KEY,
	"tenant_id" text DEFAULT 'default' NOT NULL,
	"business_id" integer NOT NULL,
	"opportunity_id" integer,
	"topic_id" integer,
	"product_id" integer,
	"audience_id" integer,
	"goal_id" integer,
	"channel_id" integer,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"call_to_action" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"quality_notes" text,
	"version" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"approved_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "engagements" (
	"id" serial PRIMARY KEY,
	"tenant_id" text DEFAULT 'default' NOT NULL,
	"publication_id" integer NOT NULL,
	"content_asset_id" integer NOT NULL,
	"views" integer DEFAULT 0 NOT NULL,
	"reactions" integer DEFAULT 0 NOT NULL,
	"comments" integer DEFAULT 0 NOT NULL,
	"clicks" integer DEFAULT 0 NOT NULL,
	"leads_signaled" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "goals" (
	"id" serial PRIMARY KEY,
	"tenant_id" text DEFAULT 'default' NOT NULL,
	"business_id" integer NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"priority" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "insights" (
	"id" serial PRIMARY KEY,
	"tenant_id" text DEFAULT 'default' NOT NULL,
	"business_id" integer NOT NULL,
	"content_asset_id" integer,
	"topic_id" integer,
	"summary" text NOT NULL,
	"evidence" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "knowledge_sources" (
	"id" serial PRIMARY KEY,
	"tenant_id" text DEFAULT 'default' NOT NULL,
	"business_id" integer NOT NULL,
	"source_type" text NOT NULL,
	"title" text NOT NULL,
	"content" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "opportunities" (
	"id" serial PRIMARY KEY,
	"tenant_id" text DEFAULT 'default' NOT NULL,
	"business_id" integer NOT NULL,
	"topic_id" integer,
	"goal_id" integer,
	"product_id" integer,
	"audience_id" integer,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"recommended_action" text NOT NULL,
	"expected_outcome" text,
	"evidence" text NOT NULL,
	"score" real DEFAULT 0 NOT NULL,
	"confidence" real DEFAULT 0.6 NOT NULL,
	"status" text DEFAULT 'open' NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" serial PRIMARY KEY,
	"tenant_id" text DEFAULT 'default' NOT NULL,
	"business_id" integer NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "publications" (
	"id" serial PRIMARY KEY,
	"tenant_id" text DEFAULT 'default' NOT NULL,
	"content_asset_id" integer NOT NULL,
	"channel_id" integer,
	"status" text DEFAULT 'published' NOT NULL,
	"published_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "topics" (
	"id" serial PRIMARY KEY,
	"tenant_id" text DEFAULT 'default' NOT NULL,
	"business_id" integer NOT NULL,
	"title" text NOT NULL,
	"goal_id" integer,
	"product_id" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "audiences" ADD CONSTRAINT "audiences_business_id_businesses_id_fkey" FOREIGN KEY ("business_id") REFERENCES "businesses"("id");--> statement-breakpoint
ALTER TABLE "brands" ADD CONSTRAINT "brands_business_id_businesses_id_fkey" FOREIGN KEY ("business_id") REFERENCES "businesses"("id");--> statement-breakpoint
ALTER TABLE "channels" ADD CONSTRAINT "channels_business_id_businesses_id_fkey" FOREIGN KEY ("business_id") REFERENCES "businesses"("id");--> statement-breakpoint
ALTER TABLE "content_assets" ADD CONSTRAINT "content_assets_business_id_businesses_id_fkey" FOREIGN KEY ("business_id") REFERENCES "businesses"("id");--> statement-breakpoint
ALTER TABLE "content_assets" ADD CONSTRAINT "content_assets_opportunity_id_opportunities_id_fkey" FOREIGN KEY ("opportunity_id") REFERENCES "opportunities"("id");--> statement-breakpoint
ALTER TABLE "content_assets" ADD CONSTRAINT "content_assets_topic_id_topics_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "topics"("id");--> statement-breakpoint
ALTER TABLE "content_assets" ADD CONSTRAINT "content_assets_product_id_products_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id");--> statement-breakpoint
ALTER TABLE "content_assets" ADD CONSTRAINT "content_assets_audience_id_audiences_id_fkey" FOREIGN KEY ("audience_id") REFERENCES "audiences"("id");--> statement-breakpoint
ALTER TABLE "content_assets" ADD CONSTRAINT "content_assets_goal_id_goals_id_fkey" FOREIGN KEY ("goal_id") REFERENCES "goals"("id");--> statement-breakpoint
ALTER TABLE "content_assets" ADD CONSTRAINT "content_assets_channel_id_channels_id_fkey" FOREIGN KEY ("channel_id") REFERENCES "channels"("id");--> statement-breakpoint
ALTER TABLE "engagements" ADD CONSTRAINT "engagements_publication_id_publications_id_fkey" FOREIGN KEY ("publication_id") REFERENCES "publications"("id");--> statement-breakpoint
ALTER TABLE "engagements" ADD CONSTRAINT "engagements_content_asset_id_content_assets_id_fkey" FOREIGN KEY ("content_asset_id") REFERENCES "content_assets"("id");--> statement-breakpoint
ALTER TABLE "goals" ADD CONSTRAINT "goals_business_id_businesses_id_fkey" FOREIGN KEY ("business_id") REFERENCES "businesses"("id");--> statement-breakpoint
ALTER TABLE "insights" ADD CONSTRAINT "insights_business_id_businesses_id_fkey" FOREIGN KEY ("business_id") REFERENCES "businesses"("id");--> statement-breakpoint
ALTER TABLE "insights" ADD CONSTRAINT "insights_content_asset_id_content_assets_id_fkey" FOREIGN KEY ("content_asset_id") REFERENCES "content_assets"("id");--> statement-breakpoint
ALTER TABLE "insights" ADD CONSTRAINT "insights_topic_id_topics_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "topics"("id");--> statement-breakpoint
ALTER TABLE "knowledge_sources" ADD CONSTRAINT "knowledge_sources_business_id_businesses_id_fkey" FOREIGN KEY ("business_id") REFERENCES "businesses"("id");--> statement-breakpoint
ALTER TABLE "opportunities" ADD CONSTRAINT "opportunities_business_id_businesses_id_fkey" FOREIGN KEY ("business_id") REFERENCES "businesses"("id");--> statement-breakpoint
ALTER TABLE "opportunities" ADD CONSTRAINT "opportunities_topic_id_topics_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "topics"("id");--> statement-breakpoint
ALTER TABLE "opportunities" ADD CONSTRAINT "opportunities_goal_id_goals_id_fkey" FOREIGN KEY ("goal_id") REFERENCES "goals"("id");--> statement-breakpoint
ALTER TABLE "opportunities" ADD CONSTRAINT "opportunities_product_id_products_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id");--> statement-breakpoint
ALTER TABLE "opportunities" ADD CONSTRAINT "opportunities_audience_id_audiences_id_fkey" FOREIGN KEY ("audience_id") REFERENCES "audiences"("id");--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_business_id_businesses_id_fkey" FOREIGN KEY ("business_id") REFERENCES "businesses"("id");--> statement-breakpoint
ALTER TABLE "publications" ADD CONSTRAINT "publications_content_asset_id_content_assets_id_fkey" FOREIGN KEY ("content_asset_id") REFERENCES "content_assets"("id");--> statement-breakpoint
ALTER TABLE "publications" ADD CONSTRAINT "publications_channel_id_channels_id_fkey" FOREIGN KEY ("channel_id") REFERENCES "channels"("id");--> statement-breakpoint
ALTER TABLE "topics" ADD CONSTRAINT "topics_business_id_businesses_id_fkey" FOREIGN KEY ("business_id") REFERENCES "businesses"("id");--> statement-breakpoint
ALTER TABLE "topics" ADD CONSTRAINT "topics_goal_id_goals_id_fkey" FOREIGN KEY ("goal_id") REFERENCES "goals"("id");--> statement-breakpoint
ALTER TABLE "topics" ADD CONSTRAINT "topics_product_id_products_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id");