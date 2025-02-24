import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import CampaignForm from "@/components/campaign-form";
import { Plus } from "lucide-react";
import type { Campaign } from "@shared/schema";

export default function Home() {
  const { data: campaigns } = useQuery<Campaign[]>({
    queryKey: ["/api/campaigns"],
  });

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">AI Campaign Manager</h1>
        <CampaignForm>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Campaign
          </Button>
        </CampaignForm>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {campaigns?.map((campaign) => (
          <Link key={campaign.id} href={`/campaign/${campaign.id}`}>
            <Card className="hover:bg-accent cursor-pointer transition-colors">
              <CardHeader>
                <CardTitle>{campaign.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Status: {campaign.status}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Platforms: {campaign.platforms.join(", ")}
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
