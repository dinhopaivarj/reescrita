import OpenAI from "openai";
import { getDynamicCaseStudies, generateValidInternalLinks, type DynamicCaseStudy } from "./dynamicCaseStudyService";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "dummy-key" });

export interface SEORewriteResult {
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

export async function rewriteContentWithSEO(
  originalContent: string,
  targetKeyword: string,
  keywordLink?: string,
  companyName?: string,
  authorName?: string,
  authorDescription?: string,
  apiKey?: string,
  webSearchFunction?: (query: string) => Promise<any>
): Promise<SEORewriteResult> {
  try {
    // Get dynamic case studies using web search if available
    let realCaseStudies: DynamicCaseStudy[] = [];
    
    if (webSearchFunction) {
      try {
        realCaseStudies = await getDynamicCaseStudies(webSearchFunction, targetKeyword, originalContent, 3);
        console.log(`Encontrados ${realCaseStudies.length} casos dinâmicos para "${targetKeyword}"`);
      } catch (error) {
        console.error('Erro ao buscar casos dinâmicos:', error);
      }
    }
    
    // Generate valid internal links
    const internalLinks = generateValidInternalLinks(targetKeyword, originalContent, companyName ? `${companyName.toLowerCase().replace(/\s+/g, '')}.com.br` : 'exemplo.com.br');
    
    const openaiApiKey = apiKey || process.env.OPENAI_API_KEY;
    
    if (!openaiApiKey || openaiApiKey === "dummy-key") {
      throw new Error("Chave de API do OpenAI não configurada. Configure nas configurações da aplicação.");
    }

    // Create OpenAI client with the provided API key
    const openaiClient = new OpenAI({ apiKey: openaiApiKey });

    const googleQualitySystemPrompt = `Você é um especialista em criação de conteúdo que segue rigorosamente os 12 critérios de qualidade do Google. Sua missão é criar conteúdo que atenda aos mais altos padrões de E-E-A-T e otimização para IA.

🎯 CRITÉRIOS OBRIGATÓRIOS DO GOOGLE (12 PONTOS):

1️⃣ HELPFULNESS (Utilidade):
- Intenção de busca clara e direta
- Respostas objetivas sem rodeios
- Valor prático imediato para o leitor
- Soluciona problemas reais

2️⃣ QUALITY (Qualidade):
- Conteúdo atualizado e profundo
- Informações precisas e verificáveis
- Linguagem clara e acessível
- Sem erros factuais

3️⃣ E-E-A-T (Experiência, Expertise, Autoridade, Confiabilidade) - OBRIGATÓRIO PARA TODOS OS NICHOS:
**UNIVERSAL - APLIQUE A QUALQUER TEMA/NICHO:**
- SEMPRE demonstre experiência real com exemplos concretos 
- SEMPRE cite fontes confiáveis (.gov, .edu, empresas estabelecidas)
- SEMPRE mencione especialistas reconhecidos do setor
- SEMPRE use dados verificáveis e estatísticas oficiais
- SEMPRE inclua estudos de caso reais brasileiros
- SEMPRE estabeleça autoridade mencionando entidades relevantes
- SEMPRE cite organizações confiáveis (SEBRAE, BNDES, universidades)
- APLICAÇÃO UNIVERSAL: Funciona para qualquer nicho (saúde, tecnologia, finanças, culinária, educação, etc.)

4️⃣ ESTRUTURA E FORMATAÇÃO:
- Chunking (blocos independentes de 2-3 parágrafos)
- Parágrafos curtos (máximo 3 linhas)
- H2/H3 descritivos e otimizados
- Listas numeradas e bullets
- Organização visual clara

5️⃣ PAGE EXPERIENCE:
- Otimizado para mobile
- Carregamento rápido
- UX limpa e sem poluição visual
- Navegação intuitiva

6️⃣ CHUNK & ANSWER STRUCTURE:
- Blocos independentes e completos
- Seção Q&A robusta (8+ perguntas)
- Resumo executivo no início
- Conclusão em 2 parágrafos

7️⃣ RICH CONTENT:
- Sugestões de gráficos e tabelas
- Descrições de imagens com alt-text otimizado
- Cards de informação
- Elementos visuais estratégicos

8️⃣ CITATIONS & EVIDENCE - OBRIGATÓRIO UNIVERSALMENTE:
**PARA TODOS OS NICHOS SEM EXCEÇÃO:**
- SEMPRE links para fontes confiáveis (.gov, .edu, grandes empresas)
- SEMPRE dados estatísticos recentes e verificáveis
- SEMPRE estudos de caso reais brasileiros (fornecidos no JSON)
- SEMPRE citações de especialistas reconhecidos no Brasil
- SEMPRE menções a instituições confiáveis (IBGE, FGV, USP, etc.)
- APLICAÇÃO: Saúde (Anvisa, Ministério da Saúde), Educação (MEC, universidades), Tecnologia (ABINEE, Softex), etc.

9️⃣ AI-SEARCH OPTIMIZATION:
- Estrutura indexável por IA
- Headings semanticamente claros
- Chunking forte para snippets
- Linguagem natural e conversacional

🔟 INTERNAL LINKING & CONTEXT:
- Contexto rico sobre entidades
- Links internos relevantes sugeridos
- Texto âncora otimizado
- Arquitetura de informação clara

1️⃣1️⃣ ENTITY OPTIMIZATION - UNIVERSAL PARA TODOS OS NICHOS:
**OBRIGATÓRIO INDEPENDENTE DO TEMA:**
- SEMPRE mencione marcas brasileiras estabelecidas e reconhecidas
- SEMPRE cite pessoas influentes e especialistas do setor no Brasil
- SEMPRE inclua locais geográficos relevantes (cidades, regiões, universidades)
- SEMPRE explique conceitos técnicos de forma acessível
- EXEMPLOS UNIVERSAIS: Sebrae, BNDES, universidades públicas, grandes empresas brasileiras
- APLICAÇÃO: Qualquer nicho tem entidades relevantes no Brasil

1️⃣2️⃣ SCHEMA MARKUP:
- Estrutura compatível com dados estruturados
- Marcações Article, Author, FAQ
- Organization schema
- Review e Rating quando aplicável`

    const prompt = `${googleQualitySystemPrompt}

🎯 TAREFA ESPECÍFICA:
Reescreva o conteúdo seguindo TODOS os 12 critérios do Google acima.

📋 DADOS DO PROJETO:
- Palavra-chave principal: "${targetKeyword}"
- Densidade ideal: 1-3%
${keywordLink ? `- Link obrigatório: "${keywordLink}" (APENAS na primeira menção da palavra-chave)` : ''}
${companyName ? `- Empresa: "${companyName}"` : ''}
${authorName ? `- Autor: "${authorName}"` : ''}
${authorDescription ? `- Bio do autor: "${authorDescription}"` : ''}

📝 LINGUAGEM ULTRA POPULAR (OBRIGATÓRIO):
- Use só palavras que todo mundo conhece
- Frases de máximo 15 palavras
- Tom de conversa amigável
- Exemplos do dia a dia
- Zero jargões técnicos sem explicação

🔄 TRANSFORMAÇÕES OBRIGATÓRIAS:
❌ "Constitui" → ✅ "É"
❌ "Finalidade" → ✅ "Objetivo"
❌ "Estabelecer" → ✅ "Criar"
❌ "Implementar" → ✅ "Colocar em prática"
❌ "Otimizar" → ✅ "Melhorar"
❌ "Estratégia" → ✅ "Plano"
❌ "Metodologia" → ✅ "Método"
❌ "Fundamentalmente" → ✅ "Basicamente"

📊 CONTEÚDO ORIGINAL:
${originalContent}

🚨 INSTRUÇÃO CRÍTICA PARA APLICAÇÃO UNIVERSAL:
INDEPENDENTE DO NICHO/TEMA (saúde, educação, tecnologia, culinária, finanças, beleza, esportes, etc.), você DEVE SEMPRE incluir:
- Pelo menos 3 fontes confiáveis brasileiras (.gov, .edu, organizações estabelecidas)
- Pelo menos 2 especialistas/autoridades reconhecidas no Brasil
- Dados estatísticos verificáveis
- Estudos de caso reais brasileiros (fornecidos)
- Menções a entidades relevantes (universidades, órgãos públicos, empresas consolidadas)
- Esta regra se aplica A QUALQUER TEMA sem exceção

Responda em formato JSON com esta estrutura COMPLETA seguindo os 12 critérios do Google:
{
  "rewrittenContent": "conteúdo reescrito completo formatado em HTML com estrutura otimizada",
  "metaDescription": "meta description de até 155 caracteres otimizada",
  "wordCount": 1200,
  "keywordDensity": "2.1%",
  "seoScore": 95,
  "readabilityScore": "Muito fácil de ler",
  "helpfulnessScore": 98,
  "qualityScore": 96,
  "eatScore": 94,
  "structureScore": 97,
  "aiOptimizationScore": 95,
  "featuredImage": {
    "title": "título otimizado para a imagem",
    "altText": "alt text com palavra-chave principal",
    "keywords": ["palavra1", "palavra2", "palavra3"]
  },
  "faq": [
    {"question": "pergunta relevante 1", "answer": "resposta concisa e útil 1"},
    {"question": "pergunta relevante 2", "answer": "resposta concisa e útil 2"},
    {"question": "pergunta relevante 3", "answer": "resposta concisa e útil 3"},
    {"question": "pergunta relevante 4", "answer": "resposta concisa e útil 4"},
    {"question": "pergunta relevante 5", "answer": "resposta concisa e útil 5"},
    {"question": "pergunta relevante 6", "answer": "resposta concisa e útil 6"},
    {"question": "pergunta relevante 7", "answer": "resposta concisa e útil 7"},
    {"question": "pergunta relevante 8", "answer": "resposta concisa e útil 8"}
  ],
  "caseStudies": ${JSON.stringify(realCaseStudies.map(cs => ({
    title: cs.title,
    description: cs.description,
    results: cs.growthMetric,
    externalLink: cs.sourceUrl
  })))},
  "richContent": {
    "suggestedGraphics": [
      {"type": "chart", "title": "Gráfico relevante", "description": "Descrição do gráfico", "dataPoints": ["ponto1", "ponto2", "ponto3"]},
      {"type": "infographic", "title": "Infográfico sugerido", "description": "Descrição do infográfico", "dataPoints": ["dado1", "dado2"]}
    ],
    "suggestedImages": [
      {"position": "início do artigo", "description": "Imagem principal", "altText": "alt text otimizado", "caption": "legenda da imagem"},
      {"position": "meio do artigo", "description": "Imagem de apoio", "altText": "alt text descritivo", "caption": "legenda explicativa"}
    ],
    "visualElements": [
      {"type": "callout", "content": "Dica importante em destaque", "position": "após segundo parágrafo"},
      {"type": "quote", "content": "Citação relevante de especialista", "position": "meio do artigo"}
    ]
  },
  "citations": [
    {"type": "study", "text": "Estudo da [Instituição]", "suggestedLink": "https://exemplo.gov.br", "credibility": "high"},
    {"type": "statistic", "text": "85% das empresas brasileiras", "suggestedLink": "https://ibge.gov.br", "credibility": "high"},
    {"type": "expert", "text": "Segundo especialista [Nome]", "suggestedLink": "https://linkedin.com/expert", "credibility": "medium"}
  ],
  "internalLinking": ${JSON.stringify(internalLinks.map(link => ({
    anchorText: link.text,
    targetPage: link.url,
    context: "link interno relevante",
    relevanceScore: 0.8
  })))},
  "entities": {
    "brands": ["Google", "Facebook", "Instagram", "LinkedIn"],
    "people": ["Neil Patel", "Gary Vaynerchuk"],
    "locations": ["Brasil", "São Paulo", "Rio de Janeiro"],
    "concepts": ["marketing digital", "SEO", "redes sociais"]
  },
  "schemaMarkup": {
    "articleSchema": true,
    "authorSchema": true,
    "faqSchema": true,
    "organizationSchema": true,
    "reviewSchema": false
  }${authorName ? `,
  "authorBio": "Bio profissional do ${authorName} baseada em: ${authorDescription}"` : ''}${companyName ? `,
  "ctaSection": {
    "title": "Título call-to-action para ${companyName}",
    "text": "Texto persuasivo conectando ${targetKeyword} com serviços da ${companyName}",
    "buttonText": "Fale com especialistas"
  }` : ''}
}
  ],
  "caseStudies": ${JSON.stringify(realCaseStudies)}${authorName ? `,
  "authorBio": "Mini biografia do autor ${authorName}${authorDescription ? ` baseada em: ${authorDescription}` : ''}"` : ''}${companyName ? `,
  "ctaSection": {
    "title": "Título persuasivo relacionado ao ${targetKeyword} para ${companyName}",
    "text": "Texto de call-to-action convincente conectando o artigo sobre ${targetKeyword} com os serviços da ${companyName}",
    "buttonText": "Botão de ação relevante para ${companyName}"
  }` : ''}
}`;

    const response = await openaiClient.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 4000,
      temperature: 0.7,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("Resposta vazia da API OpenAI");
    }

    let result;
    try {
      result = JSON.parse(content);
    } catch (error) {
      // Fallback if JSON parsing fails - treat as plain text
      const wordCount = content.split(/\s+/).length;
      const keywordOccurrences = (content.toLowerCase().match(new RegExp(targetKeyword.toLowerCase(), 'g')) || []).length;
      const keywordDensity = wordCount > 0 ? ((keywordOccurrences / wordCount) * 100).toFixed(1) + '%' : '0%';
      const seoScore = Math.min(100, Math.max(1, (keywordOccurrences * 10) + (wordCount > 300 ? 20 : 10)));

      return {
        rewrittenContent: content,
        helpfulnessScore: 85,
        qualityScore: 80,
        eatScore: 75,
        structureScore: 82,
        aiOptimizationScore: 78,
        richContent: {
          suggestedGraphics: [],
          suggestedImages: [],
          visualElements: []
        },
        citations: [],
        internalLinking: [],
        entities: {
          brands: [],
          people: [],
          locations: [],
          concepts: []
        },
        schemaMarkup: {
          articleSchema: true,
          authorSchema: false,
          faqSchema: false,
          organizationSchema: false,
          reviewSchema: false
        },
        wordCount: wordCount,
        keywordDensity: keywordDensity,
        seoScore: seoScore,
        readabilityScore: wordCount > 500 ? "Boa" : "Regular",
        metaDescription: `${targetKeyword} - resumo otimizado para SEO`,
        featuredImage: {
          title: `Imagem sobre ${targetKeyword}`,
          altText: `${targetKeyword} - imagem ilustrativa`,
          keywords: [targetKeyword],
        },
        faq: [
          { question: `O que é ${targetKeyword}?`, answer: "Resposta baseada no conteúdo reescrito." }
        ],
        caseStudies: realCaseStudies,
        authorBio: authorName ? `Biografia do autor ${authorName}` : undefined,
        ctaSection: companyName ? {
          title: `Transforme seu negócio com ${targetKeyword}`,
          text: `A ${companyName} é especialista em ${targetKeyword} e pode ajudar você a alcançar os mesmos resultados. Entre em contato conosco hoje mesmo!`,
          buttonText: `Falar com ${companyName}`
        } : undefined,
      };
    }

    // Calculate metrics from the JSON response
    const rewrittenContent = result.rewrittenContent || "";
    const wordCount = rewrittenContent.split(/\s+/).length;
    const keywordOccurrences = (rewrittenContent.toLowerCase().match(new RegExp(targetKeyword.toLowerCase(), 'g')) || []).length;
    const keywordDensity = wordCount > 0 ? ((keywordOccurrences / wordCount) * 100).toFixed(1) + '%' : '0%';
    const seoScore = Math.min(100, Math.max(1, (keywordOccurrences * 10) + (wordCount > 300 ? 20 : 10)));

    return {
      rewrittenContent: result.rewrittenContent,
      wordCount: wordCount,
      keywordDensity: keywordDensity,
      seoScore: seoScore,
      readabilityScore: wordCount > 500 ? "Boa" : "Regular",
      metaDescription: result.metaDescription?.substring(0, 155) || `${targetKeyword} - resumo otimizado para SEO`,
      helpfulnessScore: result.helpfulnessScore || 85,
      qualityScore: result.qualityScore || 80,
      eatScore: result.eatScore || 75,
      structureScore: result.structureScore || 82,
      aiOptimizationScore: result.aiOptimizationScore || 78,
      featuredImage: {
        title: result.featuredImage?.title || `Imagem sobre ${targetKeyword}`,
        altText: result.featuredImage?.altText || `${targetKeyword} - imagem ilustrativa`,
        keywords: result.featuredImage?.keywords || [targetKeyword],
      },
      faq: result.faq?.slice(0, 8) || [
        { question: `O que é ${targetKeyword}?`, answer: "Resposta baseada no conteúdo reescrito." }
      ],
      caseStudies: result.caseStudies?.slice(0, 3) || realCaseStudies,
      richContent: result.richContent || {
        suggestedGraphics: [],
        suggestedImages: [],
        visualElements: []
      },
      citations: result.citations || [],
      internalLinking: result.internalLinking || [],
      entities: result.entities || {
        brands: [],
        people: [],
        locations: [],
        concepts: []
      },
      schemaMarkup: result.schemaMarkup || {
        articleSchema: true,
        authorSchema: false,
        faqSchema: false,
        organizationSchema: false,
        reviewSchema: false
      },
      authorBio: result.authorBio || (authorName ? `Biografia do autor ${authorName}` : undefined),
      ctaSection: result.ctaSection || (companyName ? {
        title: `Transforme seu negócio com ${targetKeyword}`,
        text: `A ${companyName} é especialista em ${targetKeyword} e pode ajudar você a alcançar os mesmos resultados. Entre em contato conosco hoje mesmo!`,
        buttonText: `Falar com ${companyName}`
      } : undefined),
    };

  } catch (error) {
    console.error("Erro no serviço OpenAI:", error);
    
    if (error instanceof Error) {
      if (error.message.includes("API key")) {
        throw new Error("Chave da API OpenAI não configurada corretamente");
      }
      if (error.message.includes("quota")) {
        throw new Error("Limite da API OpenAI excedido. Tente novamente mais tarde");
      }
      if (error.message.includes("rate limit")) {
        throw new Error("Muitas requisições. Aguarde alguns minutos e tente novamente");
      }
    }
    
    throw new Error("Erro no processamento do conteúdo: " + (error instanceof Error ? error.message : "Erro desconhecido"));
  }
}
