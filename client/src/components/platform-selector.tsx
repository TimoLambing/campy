import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { SiFacebook, SiInstagram, SiTiktok } from "react-icons/si";

interface Props {
  campaignId: number;
  selectedPlatforms: string[];
}

const platforms = [
  { id: "facebook", name: "Facebook", icon: SiFacebook },
  { id: "instagram", name: "Instagram", icon: SiInstagram },
  { id: "tiktok", name: "TikTok", icon: SiTiktok },
];

export default function PlatformSelector({ campaignId, selectedPlatforms }: Props) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (platform: string) => {
      const res = await apiRequest("POST", `/api/campaigns/${campaignId}/deploy`, {
        platform,
        status: "pending",
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/campaigns/${campaignId}`] });
    },
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {platforms.map(({ id, name, icon: Icon }) => {
        const isSelected = selectedPlatforms.includes(id);
        return (
          <Button
            key={id}
            variant={isSelected ? "secondary" : "outline"}
            className="h-24 relative"
            onClick={() => mutation.mutate(id)}
            disabled={mutation.isPending}
          >
            <div className="flex flex-col items-center gap-2">
              <Icon className="h-8 w-8" />
              <span>{name}</span>
            </div>
            {isSelected && (
              <CheckCircle className="absolute top-2 right-2 h-4 w-4 text-primary" />
            )}
          </Button>
        );
      })}
    </div>
  );
}
