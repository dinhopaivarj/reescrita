import type { Express } from "express";
import { createServer, type Server } from "http";
import { rewriteRequestSchema, configSchema } from "@shared/schema";
import { rewriteContentWithSEO as rewriteWithOpenAI } from "./services/openai";
import { rewriteContentWithSEO as rewriteWithGemini } from "./services/gemini";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get AI configuration status
  app.get("/api/ai-status", async (req, res) => {
    try {
      const config = await storage.getConfig();
      
      res.json({
        isConfigured: !!config,
        provider: config?.aiProvider || undefined,
        hasKey: !!(config?.apiKey)
      });
      
    } catch (error) {
      console.error("Erro ao verificar status da IA:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Save AI configuration
  app.post("/api/config", async (req, res) => {
    try {
      const validatedConfig = configSchema.parse(req.body);
      await storage.saveConfig({
        aiProvider: validatedConfig.aiProvider,
        apiKey: validatedConfig.apiKey,
      });
      res.json({ success: true, message: "Configuração salva com sucesso" });
    } catch (error) {
      console.error("Erro ao salvar configuração:", error);
      if (error instanceof Error) {
        if (error.message.includes("validation")) {
          return res.status(400).json({ message: error.message });
        }
      }
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Test AI connection
  app.post("/api/test-connection", async (req, res) => {
    try {
      const { aiProvider, apiKey } = req.body;
      
      if (!aiProvider || !apiKey) {
        return res.status(400).json({ message: "Provider and API key are required" });
      }

      // Test with a simple request
      const testContent = "Este é um teste de conexão.";
      
      if (aiProvider === "gemini") {
        await rewriteWithGemini(testContent, "teste", "", "Test Company", "Test Author", "Test Description", apiKey);
      } else if (aiProvider === "openai") {
        await rewriteWithOpenAI(testContent, "teste", "", "Test Company", "Test Author", "Test Description", apiKey);
      } else {
        return res.status(400).json({ message: "Unsupported AI provider" });
      }

      res.json({ success: true, message: "Conexão testada com sucesso" });
    } catch (error) {
      console.error("Erro ao testar conexão:", error);
      res.status(400).json({ success: false, message: "Falha na conexão com a IA" });
    }
  });

  // Rewrite content using configured AI
  app.post("/api/rewrite", async (req, res) => {
    try {
      // Validate request body
      const validatedData = rewriteRequestSchema.parse(req.body);
      
      // Get current AI configuration
      const config = await storage.getConfig();
      
      if (!config || !config.apiKey) {
        return res.status(500).json({ 
          message: "IA não configurada. Configure sua chave de API nas configurações." 
        });
      }
      
      let result;
      
      // Create a simple web search function for dynamic case studies
      const simpleWebSearch = async (query: string) => {
        try {
          // Search for Brazilian companies and case studies related to the keyword
          const searchQuery = `case study "${validatedData.targetKeyword}" empresa brasileira resultado crescimento site:linkedin.com OR site:exame.com OR site:estadao.com.br OR site:g1.globo.com`;
          
          // For now, return structured mock data that would be replaced by real search
          // This allows the system to work while maintaining the structure for real implementation
          return {
            results: [
              {
                title: `Caso de Sucesso com ${validatedData.targetKeyword}`,
                snippet: `Empresa brasileira cresceu 150% utilizando estratégias de ${validatedData.targetKeyword}`,
                url: "https://www.linkedin.com/pulse/caso-sucesso-brasileiro"
              }
            ]
          };
        } catch (error) {
          console.log('Web search not available, using fallback');
          return { results: [] };
        }
      };

      // Use appropriate AI service based on configuration
      if (config.aiProvider === "gemini") {
        result = await rewriteWithGemini(
          validatedData.originalContent,
          validatedData.targetKeyword,
          validatedData.keywordLink,
          validatedData.companyName,
          validatedData.authorName,
          validatedData.authorDescription,
          config.apiKey,
          simpleWebSearch
        );
      } else if (config.aiProvider === "openai") {
        result = await rewriteWithOpenAI(
          validatedData.originalContent,
          validatedData.targetKeyword,
          validatedData.keywordLink,
          validatedData.companyName,
          validatedData.authorName,
          validatedData.authorDescription,
          config.apiKey,
          simpleWebSearch
        );
      } else {
        return res.status(500).json({ 
          message: "Provedor de IA não suportado" 
        });
      }

      // Save to history (simplified to avoid schema conflicts)
      try {
        await storage.saveRewriteHistory({
          originalContent: validatedData.originalContent,
          rewrittenContent: result.rewrittenContent,
          targetKeyword: validatedData.targetKeyword,
          keywordLink: validatedData.keywordLink || null,
          companyName: validatedData.companyName,
          authorName: validatedData.authorName,
          authorDescription: validatedData.authorDescription,
          wordCount: result.wordCount,
          keywordDensity: result.keywordDensity,
          seoScore: result.seoScore,
        });
      } catch (historyError) {
        console.log('Erro ao salvar histórico, continuando...', historyError);
        // Continue even if history saving fails
      }
      
      res.json(result);
      
    } catch (error) {
      console.error("Erro na rota /api/rewrite:", error);
      
      if (error instanceof Error) {
        // Handle Zod validation errors
        if (error.message.includes("validation")) {
          return res.status(400).json({ message: error.message });
        }
        
        // Handle AI service errors
        return res.status(500).json({ message: error.message });
      }
      
      res.status(500).json({ 
        message: "Erro interno do servidor ao processar o conteúdo" 
      });
    }
  });

  // Get statistics
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getStats();
      // Calculate time saved (rough estimate: 30 minutes per article)
      const timesSaved = Math.round((stats.totalRewrites * 30) / 60); // hours
      
      res.json({
        totalRewrites: stats.totalRewrites,
        avgSeoScore: stats.avgSeoScore,
        timesSaved: `${timesSaved}h`
      });
    } catch (error) {
      console.error("Erro ao obter estatísticas:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
