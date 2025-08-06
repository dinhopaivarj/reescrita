import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const configs = pgTable("configs", {
  id: serial("id").primaryKey(),
  aiProvider: text("ai_provider").notNull(), // 'openai' or 'gemini'
  apiKey: text("api_key").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const rewriteHistory = pgTable("rewrite_history", {
  id: serial("id").primaryKey(),
  originalContent: text("original_content").notNull(),
  rewrittenContent: text("rewritten_content").notNull(),
  targetKeyword: text("target_keyword"),
  keywordLink: text("keyword_link"),
  companyName: text("company_name"),
  authorName: text("author_name"),
  authorDescription: text("author_description"),
  wordCount: integer("word_count"),
  keywordDensity: text("keyword_density"),
  seoScore: integer("seo_score"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertConfigSchema = createInsertSchema(configs).pick({
  aiProvider: true,
  apiKey: true,
});

export const configSchema = z.object({
  aiProvider: z.enum(["openai", "gemini"]),
  apiKey: z.string().min(1, "API key is required"),
});

export const rewriteRequestSchema = z.object({
  originalContent: z.string().min(10, "Content must be at least 10 characters long"),
  targetKeyword: z.string().min(1, "Target keyword is required"),
  keywordLink: z.string().url("Invalid URL format").optional().or(z.literal("")),
  companyName: z.string().min(1, "Company name is required"),
  authorName: z.string().min(1, "Author name is required"),
  authorDescription: z.string().min(1, "Author description is required"),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertConfig = z.infer<typeof insertConfigSchema>;
export type Config = typeof configs.$inferSelect;
export type RewriteRequest = z.infer<typeof rewriteRequestSchema>;
export type RewriteHistory = typeof rewriteHistory.$inferSelect;

export interface RewriteResponse {
  rewrittenContent: string;
  wordCount: number;
  keywordDensity: string;
  seoScore: number;
  readabilityScore: string;
  metaDescription: string;
  
  // Enhanced SEO fields for Google's 12 criteria
  helpfulnessScore: number;
  qualityScore: number;
  eatScore: number;
  structureScore: number;
  aiOptimizationScore: number;
  
  featuredImage: {
    title: string;
    altText: string;
    keywords: string[];
  };
  
  // Enhanced FAQ section (minimum 8 questions)
  faq: Array<{
    question: string;
    answer: string;
  }>;
  
  caseStudies: Array<{
    title: string;
    description: string;
    results: string;
    externalLink: string;
  }>;
  
  // Rich content suggestions
  richContent: {
    suggestedGraphics: Array<{
      type: 'chart' | 'infographic' | 'diagram' | 'table';
      title: string;
      description: string;
      dataPoints: string[];
    }>;
    suggestedImages: Array<{
      position: string;
      description: string;
      altText: string;
      caption: string;
    }>;
    visualElements: Array<{
      type: 'card' | 'callout' | 'highlight' | 'quote';
      content: string;
      position: string;
    }>;
  };
  
  // Citations and evidence
  citations: Array<{
    type: 'study' | 'statistic' | 'expert' | 'source';
    text: string;
    suggestedLink: string;
    credibility: 'high' | 'medium' | 'low';
  }>;
  
  // Internal linking suggestions
  internalLinking: Array<{
    anchorText: string;
    targetPage: string;
    context: string;
    relevanceScore: number;
  }>;
  
  // Entity optimization
  entities: {
    brands: string[];
    people: string[];
    locations: string[];
    concepts: string[];
  };
  
  // Schema markup suggestions
  schemaMarkup: {
    articleSchema: boolean;
    authorSchema: boolean;
    faqSchema: boolean;
    organizationSchema: boolean;
    reviewSchema: boolean;
  };
  
  authorBio?: string;
  ctaSection?: {
    title: string;
    text: string;
    buttonText: string;
  };
}

export interface AIStatus {
  isConfigured: boolean;
  provider?: "openai" | "gemini";
  hasKey: boolean;
}
