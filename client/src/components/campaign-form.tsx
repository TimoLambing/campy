import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { insertCampaignSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function CampaignForm({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();
  const form = useForm({
    resolver: zodResolver(insertCampaignSchema),
    defaultValues: {
      name: "",
      target: {},
      platforms: [],
      status: "draft",
    },
  });

  const mutation = useMutation({
    mutationFn: async (values) => {
      const res = await apiRequest("POST", "/api/campaigns", values);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Campaign created",
        description: "Your campaign has been created successfully.",
      });
    },
  });

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Campaign</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Campaign Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full"
              disabled={mutation.isPending}
            >
              Create Campaign
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
