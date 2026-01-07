import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { z } from "zod";


type IngestEventInput = z.infer<typeof api.events.ingest.input>;


export function useEvents() {
  return useQuery({
    queryKey: [api.events.list.path],
    queryFn: async () => {
      const res = await fetch(api.events.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch events");
      return api.events.list.responses[200].parse(await res.json());
    },
  });
}


export function useIngestEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: IngestEventInput) => {
      const res = await fetch(api.events.ingest.path, {
        method: api.events.ingest.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      
      if (!res.ok) {
        if (res.status === 400) {
          throw new Error("Invalid event data");
        }
        throw new Error("Failed to ingest event");
      }
      return api.events.ingest.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      
      queryClient.invalidateQueries({ queryKey: [api.events.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.leads.list.path] }); 
    },
  });
}
