import { 
  type Campaign, type InsertCampaign,
  type Content, type InsertContent,
  type Deployment, type InsertDeployment
} from "@shared/schema";

export interface IStorage {
  // Campaigns
  createCampaign(campaign: InsertCampaign): Promise<Campaign>;
  getCampaign(id: number): Promise<Campaign | undefined>;
  getAllCampaigns(): Promise<Campaign[]>;
  updateCampaignStatus(id: number, status: string): Promise<Campaign>;
  updateCampaignPlatforms(id: number, platforms: string[]): Promise<Campaign>;

  // Contents
  createContent(content: InsertContent): Promise<Content>;
  getContentsByCampaign(campaignId: number): Promise<Content[]>;
  updateContent(id: number, content: Partial<Content>): Promise<Content>;

  // Deployments
  createDeployment(deployment: InsertDeployment): Promise<Deployment>;
  getDeploymentsByCampaign(campaignId: number): Promise<Deployment[]>;
  updateDeployment(id: number, deployment: Partial<Deployment>): Promise<Deployment>;
  getDeployment(id: number): Promise<Deployment | undefined>;
}

export class MemStorage implements IStorage {
  private campaigns: Map<number, Campaign>;
  private contents: Map<number, Content>;
  private deployments: Map<number, Deployment>;
  private currentIds: { [key: string]: number };

  constructor() {
    this.campaigns = new Map();
    this.contents = new Map();
    this.deployments = new Map();
    this.currentIds = { campaigns: 1, contents: 1, deployments: 1 };
  }

  async createCampaign(campaign: InsertCampaign): Promise<Campaign> {
    const id = this.currentIds.campaigns++;
    const newCampaign = { 
      ...campaign, 
      id, 
      createdAt: new Date() 
    };
    this.campaigns.set(id, newCampaign);
    return newCampaign;
  }

  async getCampaign(id: number): Promise<Campaign | undefined> {
    return this.campaigns.get(id);
  }

  async getAllCampaigns(): Promise<Campaign[]> {
    return Array.from(this.campaigns.values());
  }

  async updateCampaignStatus(id: number, status: string): Promise<Campaign> {
    const campaign = this.campaigns.get(id);
    if (!campaign) throw new Error("Campaign not found");
    const updated = { ...campaign, status };
    this.campaigns.set(id, updated);
    return updated;
  }

  async updateCampaignPlatforms(id: number, platforms: string[]): Promise<Campaign> {
    const campaign = this.campaigns.get(id);
    if (!campaign) throw new Error("Campaign not found");
    const updated = { ...campaign, platforms };
    this.campaigns.set(id, updated);
    return updated;
  }

  async createContent(content: InsertContent): Promise<Content> {
    const id = this.currentIds.contents++;
    const newContent = { ...content, id };
    this.contents.set(id, newContent);
    return newContent;
  }

  async getContentsByCampaign(campaignId: number): Promise<Content[]> {
    return Array.from(this.contents.values())
      .filter(content => content.campaignId === campaignId);
  }

  async updateContent(id: number, content: Partial<Content>): Promise<Content> {
    const existing = this.contents.get(id);
    if (!existing) throw new Error("Content not found");
    const updated = { ...existing, ...content };
    this.contents.set(id, updated);
    return updated;
  }

  async createDeployment(deployment: InsertDeployment): Promise<Deployment> {
    const id = this.currentIds.deployments++;
    const newDeployment = { ...deployment, id };
    this.deployments.set(id, newDeployment);
    return newDeployment;
  }

  async getDeploymentsByCampaign(campaignId: number): Promise<Deployment[]> {
    return Array.from(this.deployments.values())
      .filter(deployment => deployment.campaignId === campaignId);
  }

  async updateDeployment(id: number, deployment: Partial<Deployment>): Promise<Deployment> {
    const existing = this.deployments.get(id);
    if (!existing) throw new Error("Deployment not found");
    const updated = { ...existing, ...deployment };
    this.deployments.set(id, updated);
    return updated;
  }
  async getDeployment(id: number): Promise<Deployment | undefined> {
    return this.deployments.get(id);
  }
}

export const storage = new MemStorage();