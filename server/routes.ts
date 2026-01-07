import type { Express } from "express";
import type { Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

async function seedRules() {
  const defaults = [
    { eventType: "page_view", points: 5 },
    { eventType: "email_open", points: 10 },
    { eventType: "form_submission", points: 20 },
    { eventType: "demo_request", points: 50 },
    { eventType: "purchase", points: 100 },
  ];

  const existing = await storage.getRules();
  if (existing.length === 0) {
    for (const rule of defaults) {
      await storage.createRule({ ...rule, isActive: true });
    }
  }
}

async function seedLeads() {
  const existing = await storage.getLeads();
  if (existing.length === 0) {
    await storage.createLead({
      name: "Alice Johnson",
      email: "alice@example.com",
      company: "Tech Corp",
      status: "engaged"
    });
    await storage.createLead({
      name: "Bob Smith",
      email: "bob@startup.io",
      company: "Startup Inc",
      status: "new"
    });
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  function broadcast(type: string, payload: any) {
    const message = JSON.stringify({ type, payload });
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  await seedRules();
  await seedLeads();

  app.get(api.leads.list.path, async (req, res) => {
    const leads = await storage.getLeads();
    res.json(leads);
  });

  app.get(api.leads.get.path, async (req, res) => {
    const lead = await storage.getLead(Number(req.params.id));
    if (!lead) return res.status(404).json({ message: "Lead not found" });

    const history = await storage.getScoreHistory(lead.id);
    res.json({ ...lead, history });
  });

  app.post(api.leads.create.path, async (req, res) => {
    try {
      const input = api.leads.create.input.parse(req.body);
      const lead = await storage.createLead(input);
      broadcast("leadCreated", { lead });
      res.status(201).json(lead);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.delete(api.leads.delete.path, async (req, res) => {
    await storage.deleteLead(Number(req.params.id));
    res.status(204).end();
  });

  app.post(api.events.ingest.path, async (req, res) => {
    try {
      const input = api.events.ingest.input.parse(req.body);
      let leadId = input.leadId;

      if (!leadId && input.email) {
        const lead = await storage.getLeadByEmail(input.email);
        if (lead) {
          leadId = lead.id;
        } else {
          return res.status(400).json({ message: "Lead not found for email provided" });
        }
      }

      if (!leadId) {
        return res.status(400).json({ message: "Lead ID or Email required" });
      }

      const event = await storage.createEvent({
        leadId,
        eventType: input.eventType,
        payload: input.payload || {},
      });

      const rule = await storage.getRuleByEventType(input.eventType);
      let scoreUpdated = false;
      let newScore = 0;

      if (rule && rule.isActive) {
        const lead = await storage.getLead(leadId);
        if (lead) {
          const points = rule.points;
          newScore = lead.score + points;
          await storage.updateLeadScore(leadId, newScore);
          await storage.addScoreHistory({
            leadId,
            scoreChange: points,
            newScore,
            reason: input.eventType
          });
          scoreUpdated = true;

          broadcast("scoreUpdate", {
            leadId,
            newScore,
            scoreChange: points,
            reason: input.eventType
          });
        }
      }

      res.status(201).json({ success: true, scoreUpdated, newScore });
    } catch (err) {
       if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.get(api.events.list.path, async (req, res) => {
    const events = await storage.getAllEvents();
    res.json(events);
  });

  app.get(api.rules.list.path, async (req, res) => {
    const rules = await storage.getRules();
    res.json(rules);
  });

  app.put(api.rules.update.path, async (req, res) => {
    const id = Number(req.params.id);
    const input = api.rules.update.input.parse(req.body);
    const updated = await storage.updateRule(id, input);
    res.json(updated);
  });

  app.post(api.rules.reset.path, async (req, res) => {
     await seedRules();
     const rules = await storage.getRules();
     res.json(rules);
  });

  return httpServer;
}
