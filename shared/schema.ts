import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  company: text("company"),
  score: integer("score").default(0).notNull(),
  status: text("status").default("new").notNull(),
  lastActiveAt: timestamp("last_active_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const scoringRules = pgTable("scoring_rules", {
  id: serial("id").primaryKey(),
  eventType: text("event_type").notNull().unique(),
  points: integer("points").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
});

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  leadId: integer("lead_id").references(() => leads.id).notNull(),
  eventType: text("event_type").notNull(),
  payload: jsonb("payload"),
  processed: boolean("processed").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const scoreHistory = pgTable("score_history", {
  id: serial("id").primaryKey(),
  leadId: integer("lead_id").references(() => leads.id).notNull(),
  scoreChange: integer("score_change").notNull(),
  newScore: integer("new_score").notNull(),
  reason: text("reason").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const leadsRelations = relations(leads, ({ many }) => ({
  events: many(events),
  scoreHistory: many(scoreHistory),
}));

export const eventsRelations = relations(events, ({ one }) => ({
  lead: one(leads, {
    fields: [events.leadId],
    references: [leads.id],
  }),
}));

export const scoreHistoryRelations = relations(scoreHistory, ({ one }) => ({
  lead: one(leads, {
    fields: [scoreHistory.leadId],
    references: [leads.id],
  }),
}));

export const insertLeadSchema = createInsertSchema(leads).omit({ id: true, score: true, lastActiveAt: true, createdAt: true });
export const insertEventSchema = createInsertSchema(events).omit({ id: true, processed: true, createdAt: true });
export const insertRuleSchema = createInsertSchema(scoringRules).omit({ id: true });

export type Lead = typeof leads.$inferSelect;
export type InsertLead = z.infer<typeof insertLeadSchema>;

export type ScoringRule = typeof scoringRules.$inferSelect;
export type InsertScoringRule = z.infer<typeof insertRuleSchema>;

export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;

export type ScoreHistory = typeof scoreHistory.$inferSelect;

export type CreateLeadRequest = InsertLead;
export type CreateEventRequest = InsertEvent & { email?: string };
export type UpdateRuleRequest = Partial<InsertScoringRule>;

export type LeadResponse = Lead & {
  recentEvents?: Event[];
  scoreHistory?: ScoreHistory[];
};
