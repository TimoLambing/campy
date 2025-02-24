import type { Campaign, Content, Deployment } from "@shared/schema";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  Share2,
} from "lucide-react";

interface Props {
  campaign: Campaign;
  contents: Content[];
  deployments: Deployment[];
}

export default function ProgressTracker({ campaign, contents, deployments }: Props) {
  const steps = [
    {
      id: "content",
      name: "Content Generation",
      icon: FileText,
      status: contents.length > 0 ? "complete" : "pending",
    },
    {
      id: "platforms",
      name: "Platform Selection",
      icon: Share2,
      status: campaign.platforms.length > 0 ? "complete" : "pending",
    },
    {
      id: "deployment",
      name: "Deployment",
      icon: Clock,
      status: deployments.length > 0 ? "complete" : "pending",
    },
  ];

  const completedSteps = steps.filter((step) => step.status === "complete").length;
  const progress = (completedSteps / steps.length) * 100;

  return (
    <div className="space-y-8">
      <Progress value={progress} className="h-2" />

      <div className="space-y-4">
        {steps.map((step) => {
          const Icon = step.icon;
          const StatusIcon = step.status === "complete" ? CheckCircle : AlertCircle;

          return (
            <div
              key={step.id}
              className="flex items-center gap-4 p-4 rounded-lg border bg-card"
            >
              <Icon className="h-6 w-6 text-muted-foreground" />
              <div className="flex-1">
                <h3 className="font-medium">{step.name}</h3>
              </div>
              <StatusIcon
                className={`h-5 w-5 ${
                  step.status === "complete"
                    ? "text-green-500"
                    : "text-muted-foreground"
                }`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
