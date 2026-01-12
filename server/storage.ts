import { db } from "./db";
import {
  leads, events, scoringRules, scoreHistory,
  type Lead, type InsertLead, type InsertEvent, type InsertScoringRule,
  type ScoringRule, type ScoreHistory, type Event
} from "@shared/schema";
import { eq, desc, asc } from "drizzle-orm";

export interface IStorage {
  getLeads(): Promise<Lead[]>;
  getLead(id: number): Promise<Lead | undefined>;
  getLeadByEmail(email: string): Promise<Lead | undefined>;
  createLead(lead: InsertLead): Promise<Lead>;
  updateLeadScore(id: number, score: number): Promise<Lead>;
  deleteLead(id: number): Promise<void>;

  createEvent(event: InsertEvent): Promise<Event>;
  getEventsByLead(leadId: number): Promise<Event[]>;
  getAllEvents(): Promise<Event[]>;

  getRules(): Promise<ScoringRule[]>;
  getRuleByEventType(eventType: string): Promise<ScoringRule | undefined>;
  updateRule(id: number, rule: Partial<InsertScoringRule>): Promise<ScoringRule>;
  createRule(rule: InsertScoringRule): Promise<ScoringRule>;

  addScoreHistory(history: { leadId: number, scoreChange: number, newScore: number, reason: string }): Promise<ScoreHistory>;
  getScoreHistory(leadId: number): Promise<ScoreHistory[]>;
}

export class DatabaseStorage implements IStorage {
  async getLeads(): Promise<Lead[]> {
    return await db.select().from(leads).orderBy(desc(leads.score));
  }

  async getLead(id: number): Promise<Lead | undefined> {
    const [lead] = await db.select().from(leads).where(eq(leads.id, id));
    return lead;
  }

  async getLeadByEmail(email: string): Promise<Lead | undefined> {
    const [lead] = await db.select().from(leads).where(eq(leads.email, email));
    return lead;
  }

  async createLead(insertLead: InsertLead): Promise<Lead> {
    const [lead] = await db.insert(leads).values(insertLead).returning();
    return lead;
  }

  async updateLeadScore(id: number, score: number): Promise<Lead> {
    const [lead] = await db.update(leads)
      .set({ score, lastActiveAt: new Date() })
      .where(eq(leads.id, id))
      .returning();
    return lead;
  }

  async deleteLead(id: number): Promise<void> {
    await db.delete(events).where(eq(events.leadId, id));
    await db.delete(scoreHistory).where(eq(scoreHistory.leadId, id));
    await db.delete(leads).where(eq(leads.id, id));
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const [event] = await db.insert(events).values(insertEvent).returning();
    return event;
  }

  async getEventsByLead(leadId: number): Promise<Event[]> {
    return await db.select().from(events)
      .where(eq(events.leadId, leadId))
      .orderBy(desc(events.createdAt));
  }

  async getAllEvents(): Promise<Event[]> {
    return await db.select().from(events).orderBy(desc(events.createdAt)).limit(100);
  }

  async getRules(): Promise<ScoringRule[]> {
    return await db.select().from(scoringRules).orderBy(asc(scoringRules.id));
  }

  async getRuleByEventType(eventType: string): Promise<ScoringRule | undefined> {
    const [rule] = await db.select().from(scoringRules).where(eq(scoringRules.eventType, eventType));
    return rule;
  }

  async updateRule(id: number, rule: Partial<InsertScoringRule>): Promise<ScoringRule> {
    const [updated] = await db.update(scoringRules)
      .set(rule)
      .where(eq(scoringRules.id, id))
      .returning();
    return updated;
  }

  async createRule(rule: InsertScoringRule): Promise<ScoringRule> {
    const [created] = await db.insert(scoringRules).values(rule).returning();
    return created;
  }

  async addScoreHistory(history: { leadId: number, scoreChange: number, newScore: number, reason: string }): Promise<ScoreHistory> {
    const [entry] = await db.insert(scoreHistory).values(history).returning();
    return entry;
  }

  async getScoreHistory(leadId: number): Promise<ScoreHistory[]> {
    return await db.select().from(scoreHistory)
      .where(eq(scoreHistory.leadId, leadId))
      .orderBy(desc(scoreHistory.createdAt));
  }
}

export const storage = new DatabaseStorage();
