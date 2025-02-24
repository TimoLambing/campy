import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { SiFacebook, SiInstagram, SiTiktok } from "react-icons/si";
import type { Deployment } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface Props {
  campaignId: number;
  selectedPlatforms: string[];
  deployments: Deployment[];
}

const platforms = [
  { id: "facebook", name: "Facebook", icon: SiFacebook },
  { id: "instagram", name: "Instagram", icon: SiInstagram },
  { id: "tiktok", name: "TikTok", icon: SiTiktok },
];

export default function PlatformSelector({ campaignId, selectedPlatforms, deployments }: Props) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const updatePlatformsMutation = useMutation({
    mutationFn: async (platform: string) => {
      const newPlatforms = selectedPlatforms.includes(platform) 
        ? selectedPlatforms.filter(p => p !== platform)
        : [...selectedPlatforms, platform];

      const res = await apiRequest("PATCH", `/api/campaigns/${campaignId}/platforms`, {
        platforms: newPlatforms,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/campaigns/${campaignId}`] });
    },
  });

  const deployMutation = useMutation({
    mutationFn: async (platform: string) => {
      const res = await apiRequest("POST", `/api/campaigns/${campaignId}/deploy`, {
        platform,
        status: "generating",
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: [
          `/api/campaigns/${campaignId}`,
          `/api/campaigns/${campaignId}/deployments`
        ] 
      });
      toast({
        title: "Deployment started",
        description: "The banner is being generated and will be displayed shortly.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Deployment failed",
        description: error.message || "Failed to deploy campaign.",
        variant: "destructive",
      });
    },
  });

  const handlePlatformClick = async (platform: string) => {
    try {
      // First update platform selection
      await updatePlatformsMutation.mutateAsync(platform);

      // Then trigger deployment if not already selected
      if (!selectedPlatforms.includes(platform)) {
        await deployMutation.mutateAsync(platform);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update platform selection.",
        variant: "destructive",
      });
    }
  };

  const getDeploymentStatus = (platformId: string) => {
    const deployment = deployments.find(d => d.platform === platformId);
    return deployment?.status || "pending";
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {platforms.map(({ id, name, icon: Icon }) => {
          const isSelected = selectedPlatforms.includes(id);
          const status = getDeploymentStatus(id);
          const isGenerating = status === "generating";
          const isComplete = status === "complete";
          const isPending = updatePlatformsMutation.isPending || deployMutation.isPending;

          return (
            <Button
              key={id}
              variant={isSelected ? "secondary" : "outline"}
              className="h-24 relative"
              onClick={() => handlePlatformClick(id)}
              disabled={isPending || isGenerating}
            >
              <div className="flex flex-col items-center gap-2">
                <Icon className="h-8 w-8" />
                <span>{name}</span>
              </div>
              {isGenerating && (
                <Loader2 className="absolute top-2 right-2 h-4 w-4 animate-spin text-primary" />
              )}
              {isComplete && (
                <CheckCircle className="absolute top-2 right-2 h-4 w-4 text-green-500" />
              )}
            </Button>
          );
        })}
      </div>

      <div className="space-y-2">
        {deployments.map((deployment) => (
          <Card key={deployment.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {deployment.platform === "facebook" && <SiFacebook className="h-5 w-5" />}
                {deployment.platform === "instagram" && <SiInstagram className="h-5 w-5" />}
                {deployment.platform === "tiktok" && <SiTiktok className="h-5 w-5" />}
                <span className="capitalize">{deployment.platform}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground capitalize">
                  {deployment.status}
                </span>
                {deployment.bannerPreview && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(`/api/banners/${deployment.id}`, '_blank')}
                  >
                    View Banner
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}