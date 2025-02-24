import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertCampaignSchema, insertContentSchema, insertDeploymentSchema } from "@shared/schema";
import { analyzeImage, generateImage, summarizeArticle, generateCampaignText, generateLandingPage } from "./ai/openai";

export async function registerRoutes(app: Express): Promise<Server> {
  // Campaigns
  app.post("/api/campaigns", async (req, res) => {
    try {
      const campaign = insertCampaignSchema.parse(req.body);
      const result = await storage.createCampaign(campaign);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/campaigns", async (req, res) => {
    const campaigns = await storage.getAllCampaigns();
    res.json(campaigns);
  });

  app.get("/api/campaigns/:id", async (req, res) => {
    const campaign = await storage.getCampaign(Number(req.params.id));
    if (!campaign) {
      res.status(404).json({ error: "Campaign not found" });
      return;
    }
    res.json(campaign);
  });

  // Chat and Content Generation
  app.post("/api/chat", async (req, res) => {
    try {
      const { message } = z.object({
        message: z.string(),
      }).parse(req.body);

      const response = await generateCampaignText(message);
      res.json({ response });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/campaigns/:id/generate", async (req, res) => {
    try {
      const { prompt, type } = z.object({
        prompt: z.string(),
        type: z.enum(["text", "image"]),
      }).parse(req.body);

      let content;
      if (type === "text") {
        content = await summarizeArticle(prompt);
      } else {
        const result = await generateImage(prompt);
        content = result.url;
      }

      const newContent = await storage.createContent({
        campaignId: Number(req.params.id),
        type,
        content,
        platform: "all",
        status: "generated",
      });

      res.json(newContent);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/campaigns/:id/contents", async (req, res) => {
    const contents = await storage.getContentsByCampaign(Number(req.params.id));
    res.json(contents);
  });

  // Deployments
  app.post("/api/campaigns/:id/deploy", async (req, res) => {
    try {
      const campaignId = Number(req.params.id);
      const { platform } = z.object({
        platform: z.string(),
        status: z.string(),
      }).parse(req.body);

      // Create initial deployment
      const deployment = await storage.createDeployment({
        campaignId,
        platform,
        status: "generating",
      });

      // Start banner generation
      const campaign = await storage.getCampaign(campaignId);
      const contents = await storage.getContentsByCampaign(campaignId);

      if (!campaign || !contents.length) {
        throw new Error("Campaign or contents not found");
      }

      const textContent = contents.find(c => c.type === "text")?.content || "";
      const imageContent = contents.find(c => c.type === "image")?.content || "";

      // Generate platform-specific banner HTML
      const bannerHtml = await generateLandingPage({
        name: campaign.name,
        description: textContent,
        target: {
          platform,
          imageUrl: imageContent,
          ...campaign.target,
        },
      });

      if (!bannerHtml) {
        throw new Error("Failed to generate banner HTML");
      }

      // Update deployment with banner HTML
      await storage.updateDeployment(deployment.id, {
        bannerHtml,
        bannerPreview: bannerHtml,
        status: "complete",
      });

      res.json(deployment);
    } catch (error: any) {
      console.error("Deployment error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/campaigns/:id/deployments", async (req, res) => {
    const deployments = await storage.getDeploymentsByCampaign(Number(req.params.id));
    res.json(deployments);
  });

  app.patch("/api/campaigns/:id/platforms", async (req, res) => {
    try {
      const { platforms } = z.object({
        platforms: z.array(z.string()),
      }).parse(req.body);

      const result = await storage.updateCampaignPlatforms(Number(req.params.id), platforms);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}