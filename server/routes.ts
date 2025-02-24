import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertCampaignSchema, insertContentSchema, insertDeploymentSchema } from "@shared/schema";
import { analyzeImage, generateImage, summarizeArticle } from "./ai/openai";

export async function registerRoutes(app: Express): Promise<Server> {
  // Campaigns
  app.post("/api/campaigns", async (req, res) => {
    try {
      const campaign = insertCampaignSchema.parse(req.body);
      const result = await storage.createCampaign(campaign);
      res.json(result);
    } catch (error) {
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

  // Content Generation
  app.post("/api/campaigns/:id/generate", async (req, res) => {
    const { prompt, type } = z.object({
      prompt: z.string(),
      type: z.enum(["text", "image"]),
    }).parse(req.body);

    try {
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
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/campaigns/:id/contents", async (req, res) => {
    const contents = await storage.getContentsByCampaign(Number(req.params.id));
    res.json(contents);
  });

  // Deployments
  app.post("/api/campaigns/:id/deploy", async (req, res) => {
    const deployment = insertDeploymentSchema.parse({
      ...req.body,
      campaignId: Number(req.params.id),
    });
    
    const result = await storage.createDeployment(deployment);
    res.json(result);
  });

  app.get("/api/campaigns/:id/deployments", async (req, res) => {
    const deployments = await storage.getDeploymentsByCampaign(Number(req.params.id));
    res.json(deployments);
  });

  const httpServer = createServer(app);
  return httpServer;
}
