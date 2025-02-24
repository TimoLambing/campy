import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import type { Campaign, Content, Deployment } from "@shared/schema";
import ContentGenerator from "@/components/content-generator";
import PlatformSelector from "@/components/platform-selector";
import ProgressTracker from "@/components/progress-tracker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CampaignPage() {
  const { id } = useParams<{ id: string }>();
  
  const { data: campaign } = useQuery<Campaign>({
    queryKey: [`/api/campaigns/${id}`],
  });

  const { data: contents } = useQuery<Content[]>({
    queryKey: [`/api/campaigns/${id}/contents`],
  });

  const { data: deployments } = useQuery<Deployment[]>({
    queryKey: [`/api/campaigns/${id}/deployments`],
  });

  if (!campaign) return null;

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-bold mb-8">{campaign.name}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Content Generation</CardTitle>
            </CardHeader>
            <CardContent>
              <ContentGenerator campaignId={Number(id)} contents={contents || []} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Platform Selection</CardTitle>
            </CardHeader>
            <CardContent>
              <PlatformSelector 
                campaignId={Number(id)} 
                selectedPlatforms={campaign.platforms} 
              />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Campaign Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <ProgressTracker 
              campaign={campaign}
              contents={contents || []}
              deployments={deployments || []}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
