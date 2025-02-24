import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Content } from "@shared/schema";

interface Props {
  campaignId: number;
  contents: Content[];
}

export default function ContentGenerator({ campaignId, contents }: Props) {
  const [prompt, setPrompt] = useState("");
  const [type, setType] = useState<"text" | "image">("text");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/campaigns/${campaignId}/generate`, {
        prompt,
        type,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/campaigns/${campaignId}/contents`] });
      toast({
        title: "Content generated",
        description: "Your content has been generated successfully.",
      });
      setPrompt("");
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Select value={type} onValueChange={(value: "text" | "image") => setType(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="text">Text</SelectItem>
            <SelectItem value="image">Image</SelectItem>
          </SelectContent>
        </Select>

        <Button 
          onClick={() => mutation.mutate()} 
          disabled={mutation.isPending || !prompt}
        >
          Generate
        </Button>
      </div>

      <Textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter your prompt here..."
        className="h-32"
      />

      <div className="space-y-4">
        {contents.map((content) => (
          <div
            key={content.id}
            className="p-4 rounded-lg border bg-card text-card-foreground"
          >
            {content.type === "image" ? (
              <img 
                src={content.content} 
                alt="Generated content" 
                className="w-full rounded-lg"
              />
            ) : (
              <p>{content.content}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
