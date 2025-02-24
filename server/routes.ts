import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertCampaignSchema, insertContentSchema, insertDeploymentSchema } from "@shared/schema";
import { analyzeImage, generateImage, summarizeArticle, generateCampaignText, generateLandingPage } from "./ai/openai";
import { generateBannerHTML } from "./utils/bannerGenerator";

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

  // Banner preview route
  app.get("/api/banners/:deploymentId", async (req, res) => {
    try {
      const deploymentId = Number(req.params.deploymentId);
      const deployment = await storage.getDeployment(deploymentId);

      if (!deployment) {
        res.status(404).json({ error: "Banner not found" });
        return;
      }

      // If requesting HTML preview
      if (req.headers.accept?.includes("text/html")) {
        res.setHeader("Content-Type", "text/html");
        res.setHeader("Cache-Control", "no-cache");
        res.send(deployment.bannerHtml);
        return;
      }

      res.json({
        ...deployment,
        previewUrl: `/api/banners/${deploymentId}`,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Content Generation
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
      }).parse(req.body);

      // Get campaign and content data first
      const campaign = await storage.getCampaign(campaignId);
      const contents = await storage.getContentsByCampaign(campaignId);

      if (!campaign) {
        throw new Error("Campaign not found");
      }

      if (!contents.length) {
        throw new Error("No content found for this campaign");
      }

      const textContent = contents.find(c => c.type === "text")?.content;
      const imageContent = contents.find(c => c.type === "image")?.content;

      if (!textContent || !imageContent) {
        throw new Error("Both text and image content are required");
      }

      // Create initial deployment
      const deployment = await storage.createDeployment({
        campaignId,
        platform,
        status: "generating",
        cost: null,
        metrics: {},
      });

      try {
        // Generate banner HTML using our utility
        const bannerHtml = generateBannerHTML({
          name: campaign.name,
          description: textContent,
          imageUrl: imageContent,
          platform,
        });

        if (!bannerHtml) {
          throw new Error("Failed to generate banner HTML");
        }

        // Update deployment with banner HTML
        const updatedDeployment = await storage.updateDeployment(deployment.id, {
          bannerHtml,
          bannerPreview: bannerHtml,
          status: "complete",
        });

        // Update campaign status
        await storage.updateCampaignStatus(campaignId, "deployed");

        // Return deployment with banner URL
        res.json({
          ...updatedDeployment,
          previewUrl: `/api/banners/${deployment.id}`,
        });
      } catch (error: any) {
        // If banner generation fails, update deployment status
        await storage.updateDeployment(deployment.id, {
          status: "failed",
          bannerHtml: "",
          bannerPreview: "",
        });
        throw error;
      }
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