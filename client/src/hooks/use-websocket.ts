import { useEffect, useRef, useCallback } from "react";
import { z } from "zod";
import { ws } from "@shared/routes";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export function useWebSocket() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}`;

    const connect = () => {
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;

      socket.onopen = () => {
        console.log("WebSocket connected");
      };

      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);

          if (message.type === 'scoreUpdate') {
            const data = ws.receive.scoreUpdate.parse(message.payload);
            queryClient.invalidateQueries({ queryKey: ['/api/leads'] });
            queryClient.invalidateQueries({ queryKey: ['/api/leads', data.leadId] });

            toast({
              title: "Score Updated",
              description: `Lead #${data.leadId} changed by ${data.scoreChange} (${data.reason})`,
              duration: 3000,
            });
          }

          if (message.type === 'leadCreated') {
            const data = ws.receive.leadCreated.parse(message.payload);
            queryClient.invalidateQueries({ queryKey: ['/api/leads'] });

            toast({
              title: "New Lead",
              description: `${data.lead.name} from ${data.lead.company || 'Unknown'} just joined.`,
              duration: 3000,
            });
          }

        } catch (err) {
          console.error("Failed to parse WS message", err);
        }
      };

      socket.onclose = () => {
        console.log("WebSocket disconnected, retrying...");
        setTimeout(connect, 3000);
      };
    };

    connect();

    return () => {
      socketRef.current?.close();
    };
  }, [queryClient, toast]);

  return socketRef.current;
}
