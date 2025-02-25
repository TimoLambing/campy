import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import type { Campaign, Content, Deployment } from "@shared/schema";
import ContentGenerator from "@/components/content-generator";
import PlatformSelector from "@/components/platform-selector";
import ProgressTracker from "@/components/progress-tracker";
import CodeDisplay from "@/components/code-display";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

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

  const latestDeployment = deployments?.find(d => d.status === "complete");

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <Link href="/">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>
        <h1 className="text-4xl font-bold">{campaign.name}</h1>
      </div>

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
                deployments={deployments || []} 
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
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

          {latestDeployment?.bannerHtml && (
            <CodeDisplay
              title="Generated Banner HTML"
              code={latestDeployment.bannerHtml}
              language="html"
            />
          )}
        </div>
      </div>
    </div>
  );
}