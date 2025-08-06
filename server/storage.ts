import { configs, rewriteHistory, users, type User, type InsertUser, type Config, type InsertConfig, type RewriteHistory } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getConfig(): Promise<Config | undefined>;
  saveConfig(config: InsertConfig): Promise<Config>;
  saveRewriteHistory(history: Omit<RewriteHistory, 'id' | 'createdAt'>): Promise<RewriteHistory>;
  getRewriteHistory(limit?: number): Promise<RewriteHistory[]>;
  getStats(): Promise<{
    totalRewrites: number;
    avgSeoScore: number;
    totalWordCount: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getConfig(): Promise<Config | undefined> {
    const [config] = await db.select().from(configs).orderBy(desc(configs.updatedAt)).limit(1);
    return config || undefined;
  }

  async saveConfig(configData: InsertConfig): Promise<Config> {
    // Delete existing config and insert new one (simple approach for single user)
    await db.delete(configs);
    
    const [config] = await db
      .insert(configs)
      .values({
        ...configData,
        updatedAt: new Date(),
      })
      .returning();
    return config;
  }

  async saveRewriteHistory(historyData: Omit<RewriteHistory, 'id' | 'createdAt'>): Promise<RewriteHistory> {
    const [history] = await db
      .insert(rewriteHistory)
      .values({
        ...historyData,
        createdAt: new Date(),
      })
      .returning();
    return history;
  }

  async getRewriteHistory(limit: number = 10): Promise<RewriteHistory[]> {
    return await db.select().from(rewriteHistory).orderBy(desc(rewriteHistory.createdAt)).limit(limit);
  }

  async getStats(): Promise<{
    totalRewrites: number;
    avgSeoScore: number;
    totalWordCount: number;
  }> {
    const history = await db.select().from(rewriteHistory);
    
    const totalRewrites = history.length;
    const avgSeoScore = history.length > 0 
      ? Math.round(history.reduce((sum, item) => sum + (item.seoScore || 0), 0) / history.length)
      : 0;
    const totalWordCount = history.reduce((sum, item) => sum + (item.wordCount || 0), 0);

    return {
      totalRewrites,
      avgSeoScore,
      totalWordCount,
    };
  }
}

export const storage = new DatabaseStorage();
