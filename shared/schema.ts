import { pgTable, text, serial, integer, boolean, json, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const campaigns = pgTable("campaigns", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  target: json("target").notNull(),
  status: text("status").notNull().default("draft"),
  platforms: text("platforms").array().notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const contents = pgTable("contents", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").notNull(),
  type: text("type").notNull(), // text, image, landingPage
  content: text("content").notNull(),
  platform: text("platform").notNull(),
  status: text("status").notNull().default("draft"),
});

export const deployments = pgTable("deployments", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").notNull(),
  platform: text("platform").notNull(),
  status: text("status").notNull(),
  bannerHtml: text("banner_html"),
  bannerPreview: text("banner_preview"),
  cost: integer("cost"),
  metrics: json("metrics"),
});

export const insertCampaignSchema = createInsertSchema(campaigns).omit({
  id: true,
  createdAt: true,
});

export const insertContentSchema = createInsertSchema(contents).omit({
  id: true,
});

export const insertDeploymentSchema = createInsertSchema(deployments).omit({
  id: true,
});

export type Campaign = typeof campaigns.$inferSelect;
export type InsertCampaign = z.infer<typeof insertCampaignSchema>;
export type Content = typeof contents.$inferSelect;
export type InsertContent = z.infer<typeof insertContentSchema>;
export type Deployment = typeof deployments.$inferSelect;
export type InsertDeployment = z.infer<typeof insertDeploymentSchema>;