import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { rewriteRequestSchema, type RewriteRequest, type RewriteResponse, type AIStatus } from "@shared/schema";
import { Link } from "wouter";
import { 
  Copy, 
  FileText, 
  Key, 
  Loader2, 
  Shield, 
  Search, 
  Image, 
  HelpCircle,
  CheckCircle,
  Clock,
  Trash2,
  Download,
  Rocket,
  Languages,
  Bot,
  Camera,
  RefreshCw,
  Settings,
  AlertCircle,
  Trophy,
  User,
  ExternalLink,
  Layers,
  BarChart3,
  Sparkles,
  LinkIcon,
  Tags,
  Code,
  XCircle
} from "lucide-react";

export default function Home() {
  const [characterCount, setCharacterCount] = useState(0);
  const [metaCharCount, setMetaCharCount] = useState(0);
  const [result, setResult] = useState<RewriteResponse | null>(null);
  const { toast } = useToast();

  // Get AI status
  const { data: aiStatus } = useQuery<AIStatus>({
    queryKey: ["/api/ai-status"],
    retry: false
  });

  const form = useForm<RewriteRequest>({
    resolver: zodResolver(rewriteRequestSchema),
    defaultValues: {
      originalContent: "",
      targetKeyword: "",
      keywordLink: "",
      companyName: "",
      authorName: "",
      authorDescription: "",
    },
  });

  const rewriteMutation = useMutation({
    mutationFn: async (data: RewriteRequest) => {
      const response = await apiRequest("POST", "/api/rewrite", data);
      return response.json() as Promise<RewriteResponse>;
    },
    onSuccess: (data) => {
      setResult(data);
      setMetaCharCount(data.metaDescription.length);
      toast({
        title: "Conteúdo reescrito com sucesso!",
        description: "O artigo foi otimizado para SEO e está livre de plágio.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro no processamento",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: RewriteRequest) => {
    rewriteMutation.mutate(data);
  };

  const handleCopyToClipboard = async (text: string, successMessage: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copiado!",
        description: successMessage,
      });
    } catch (error) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar para a área de transferência",
        variant: "destructive",
      });
    }
  };

  const handleClearContent = () => {
    form.reset();
    setCharacterCount(0);
    setResult(null);
    setMetaCharCount(0);
  };

  const handleCopyAllContent = () => {
    if (!result) return;
    
    const fullContent = `${result.rewrittenContent}

META DESCRIPTION:
${result.metaDescription}

IMAGEM DESTACADA:
Título: ${result.featuredImage.title}
ALT Text: ${result.featuredImage.altText}
Palavras-chave: ${result.featuredImage.keywords.join(", ")}

FAQ:
${result.faq.map((item, index) => `${index + 1}. ${item.question}\nR: ${item.answer}`).join("\n\n")}`;

    handleCopyToClipboard(fullContent, "Todo o conteúdo foi copiado!");
  };

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <FileText className="text-white h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">SEO Content Rewriter</h1>
                  <p className="text-sm text-gray-500">RankMath Compatible</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* AI Status Badge */}
              {aiStatus?.isConfigured ? (
                <Badge variant="default" className="bg-secondary text-secondary-foreground">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  IA Configurada
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  IA Não Configurada
                </Badge>
              )}
              
              {/* Settings Button */}
              <Link href="/config">
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Configurações
                </Button>
              </Link>
              
              <span className="text-sm text-gray-500 flex items-center">
                <Shield className="h-4 w-4 text-secondary mr-1" />
                Antiplágio Avançado
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          
          {/* Input Section */}
          <div className="space-y-6">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              {/* Keyword Input */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center space-x-3">
                    <Key className="h-5 w-5 text-primary" />
                    <span>SEO e Configurações</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="targetKeyword">Palavra-chave Principal *</Label>
                    <Input
                      id="targetKeyword"
                      {...form.register("targetKeyword")}
                      placeholder="Digite sua palavra-chave principal..."
                      className="h-11 mt-1"
                    />
                    {form.formState.errors.targetKeyword && (
                      <p className="text-sm text-red-600 mt-1">{form.formState.errors.targetKeyword.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="keywordLink">Link para Palavra-chave (opcional)</Label>
                    <Input
                      id="keywordLink"
                      {...form.register("keywordLink")}
                      placeholder="https://seusite.com/pagina-da-palavra-chave"
                      className="h-11 mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">A primeira menção da palavra-chave receberá este link</p>
                    {form.formState.errors.keywordLink && (
                      <p className="text-sm text-red-600 mt-1">{form.formState.errors.keywordLink.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="companyName">Nome da Empresa (opcional)</Label>
                    <Input
                      id="companyName"
                      {...form.register("companyName")}
                      placeholder="Ex: Minha Empresa Digital"
                      className="h-11 mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">Será mencionado naturalmente no texto</p>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 pt-2">
                    <Badge variant="outline" className="text-primary border-primary">
                      RankMath Ready
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Author Info */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center space-x-3">
                    <Bot className="h-5 w-5 text-secondary" />
                    <span>Informações do Autor</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="authorName">Nome do Autor (opcional)</Label>
                    <Input
                      id="authorName"
                      {...form.register("authorName")}
                      placeholder="João Silva"
                      className="h-11 mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="authorDescription">Descrição do Autor (opcional)</Label>
                    <Textarea
                      id="authorDescription"
                      {...form.register("authorDescription")}
                      placeholder="Ex: Especialista em marketing digital há 10 anos, formado em comunicação..."
                      className="h-20 mt-1 text-sm resize-none"
                    />
                    <p className="text-xs text-gray-500 mt-1">A IA criará uma biografia profissional baseada nesta descrição</p>
                  </div>
                </CardContent>
              </Card>

              {/* Article Input */}
              <Card>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-primary" />
                      <span>Artigo Original</span>
                    </CardTitle>
                    <div className="flex items-center space-x-2 text-sm">
                      <span className="text-gray-500">{characterCount.toLocaleString()}</span>
                      <span className="text-gray-400">/ 80.000</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    {...form.register("originalContent")}
                    className="h-96 resize-none text-sm leading-relaxed"
                    placeholder="Cole aqui o artigo original completo que você deseja reescrever...

Instruções:
✅ Mantenha toda a estrutura original
✅ Inclua títulos, subtítulos e parágrafos
✅ Suporte até 80.000 caracteres
✅ O conteúdo será reescrito linha por linha"
                    onChange={(e) => {
                      form.setValue("originalContent", e.target.value);
                      setCharacterCount(e.target.value.length);
                    }}
                  />
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-secondary mr-1" />
                        Antiplágio
                      </span>
                      <span className="flex items-center">
                        <Languages className="h-4 w-4 text-secondary mr-1" />
                        Linguagem Simples
                      </span>
                      <span className="flex items-center">
                        <Bot className="h-4 w-4 text-secondary mr-1" />
                        IA Avançada
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleClearContent}
                      className="text-gray-600 hover:text-gray-800"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Limpar
                    </Button>
                  </div>
                  
                  {form.formState.errors.originalContent && (
                    <p className="text-sm text-red-600">{form.formState.errors.originalContent.message}</p>
                  )}
                </CardContent>
              </Card>

              {/* Process Button */}
              <Card>
                <CardContent className="pt-6">
                  <Button
                    type="submit"
                    disabled={rewriteMutation.isPending}
                    className="w-full h-14 bg-primary hover:bg-blue-700 text-lg"
                  >
                    {rewriteMutation.isPending ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-3 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      <>
                        <Bot className="h-5 w-5 mr-3" />
                        Reescrever Artigo com IA
                      </>
                    )}
                  </Button>
                  
                  <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center justify-center py-2 bg-green-50 text-green-700 rounded-lg">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>~2-5 minutos</span>
                    </div>
                    <div className="flex items-center justify-center py-2 bg-blue-50 text-blue-700 rounded-lg">
                      <Shield className="h-4 w-4 mr-2" />
                      <span>100% Original</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </form>
          </div>

          {/* Output Section */}
          <div className="space-y-6">
            
            {/* Processing Status */}
            {rewriteMutation.isPending && (
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center space-x-3">
                    <Loader2 className="h-5 w-5 text-primary animate-spin" />
                    <span>Status do Processamento</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Analisando conteúdo original...</span>
                      <CheckCircle className="h-4 w-4 text-secondary" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Removendo plágio...</span>
                      <Loader2 className="h-4 w-4 text-primary animate-spin" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Otimizando SEO...</span>
                      <Clock className="h-4 w-4 text-gray-400" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Gerando conteúdo final...</span>
                      <Clock className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                  
                  <div>
                    <Progress value={45} className="h-2" />
                    <p className="text-sm text-gray-500 mt-2">Processando... 45% concluído</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Rewritten Content */}
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-secondary" />
                    <span>Conteúdo Reescrito</span>
                  </CardTitle>
                  {result && (
                    <Button
                      onClick={() => handleCopyToClipboard(result.rewrittenContent, "Conteúdo reescrito copiado!")}
                      className="bg-secondary hover:bg-green-700"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copiar Tudo
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 rounded-lg p-4 h-96 overflow-y-auto border-l-4 border-secondary">
                  {result ? (
                    <div 
                      className="text-sm leading-relaxed prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: result.rewrittenContent }}
                    />
                  ) : (
                    <div className="text-sm text-gray-500 italic text-center py-20">
                      O conteúdo reescrito aparecerá aqui após o processamento...
                      <br /><br />
                      ✅ 100% livre de plágio<br />
                      ✅ SEO otimizado para RankMath<br />
                      ✅ Mantendo estrutura original<br />
                      ✅ Linguagem simples e acessível
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* SEO Extras */}
            {result && (
              <div className="space-y-6">
                
                {/* Meta Description */}
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center space-x-3">
                      <Search className="h-5 w-5 text-primary" />
                      <span>Meta Description</span>
                      <Badge variant="outline" className="text-blue-800 border-blue-800">RankMath</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Textarea
                      value={result.metaDescription}
                      onChange={(e) => setMetaCharCount(e.target.value.length)}
                      className="h-20 text-sm resize-none"
                      readOnly
                    />
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">
                        Caracteres: <span className={metaCharCount > 155 ? "text-red-600" : ""}>{metaCharCount}</span>/155
                      </span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-primary hover:text-blue-700"
                        onClick={() => handleCopyToClipboard(result.metaDescription, "Meta description copiada!")}
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        Copiar
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Google Quality Scores */}
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center space-x-3">
                      <Shield className="h-5 w-5 text-primary" />
                      <span>Métricas de Qualidade Google</span>
                      <Badge variant="outline" className="text-green-800 border-green-800">12 Critérios</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Utilidade (Helpfulness)</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-16 h-2 bg-gray-200 rounded-full">
                              <div 
                                className="h-2 bg-green-500 rounded-full" 
                                style={{ width: `${result.helpfulnessScore || 0}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-green-600">{result.helpfulnessScore || 0}%</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Qualidade (Quality)</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-16 h-2 bg-gray-200 rounded-full">
                              <div 
                                className="h-2 bg-blue-500 rounded-full" 
                                style={{ width: `${result.qualityScore || 0}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-blue-600">{result.qualityScore || 0}%</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">E-A-T Score</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-16 h-2 bg-gray-200 rounded-full">
                              <div 
                                className="h-2 bg-purple-500 rounded-full" 
                                style={{ width: `${result.eatScore || 0}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-purple-600">{result.eatScore || 0}%</span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Estrutura</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-16 h-2 bg-gray-200 rounded-full">
                              <div 
                                className="h-2 bg-orange-500 rounded-full" 
                                style={{ width: `${result.structureScore || 0}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-orange-600">{result.structureScore || 0}%</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Otimização IA</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-16 h-2 bg-gray-200 rounded-full">
                              <div 
                                className="h-2 bg-cyan-500 rounded-full" 
                                style={{ width: `${result.aiOptimizationScore || 0}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-cyan-600">{result.aiOptimizationScore || 0}%</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">SEO Geral</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-16 h-2 bg-gray-200 rounded-full">
                              <div 
                                className="h-2 bg-primary rounded-full" 
                                style={{ width: `${result.seoScore || 0}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-primary">{result.seoScore || 0}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Score Médio:</span>
                        <Badge variant="outline" className="text-primary border-primary">
                          {Math.round(((result.helpfulnessScore || 0) + (result.qualityScore || 0) + (result.eatScore || 0) + (result.structureScore || 0) + (result.aiOptimizationScore || 0) + (result.seoScore || 0)) / 6)}%
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Rich Content Suggestions */}
                {result.richContent && (
                  <Card>
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center space-x-3">
                        <Layers className="h-5 w-5 text-primary" />
                        <span>Sugestões de Conteúdo Rico</span>
                        <Badge variant="outline" className="text-purple-800 border-purple-800">Google Critério 7</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {result.richContent.suggestedGraphics && result.richContent.suggestedGraphics.length > 0 && (
                        <div>
                          <Label className="font-medium text-gray-700">Gráficos e Infográficos Sugeridos:</Label>
                          <div className="space-y-2 mt-2">
                            {result.richContent.suggestedGraphics.map((graphic, index) => (
                              <div key={index} className="bg-purple-50 border border-purple-200 rounded p-3">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <Badge variant="secondary" className="mb-1">{graphic.type}</Badge>
                                    <p className="text-sm font-medium text-gray-800">{graphic.title}</p>
                                    <p className="text-xs text-gray-600 mt-1">{graphic.description}</p>
                                  </div>
                                  <BarChart3 className="h-5 w-5 text-purple-600" />
                                </div>
                                {graphic.dataPoints && graphic.dataPoints.length > 0 && (
                                  <div className="mt-2">
                                    <p className="text-xs text-gray-500">Dados sugeridos:</p>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {graphic.dataPoints.map((point, idx) => (
                                        <Badge key={idx} variant="outline" className="text-xs">{point}</Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {result.richContent.visualElements && result.richContent.visualElements.length > 0 && (
                        <div>
                          <Label className="font-medium text-gray-700">Elementos Visuais:</Label>
                          <div className="space-y-2 mt-2">
                            {result.richContent.visualElements.map((element, index) => (
                              <div key={index} className="bg-blue-50 border border-blue-200 rounded p-3">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <Badge variant="secondary" className="mb-1">{element.type}</Badge>
                                    <p className="text-sm text-gray-700">{element.content}</p>
                                    <p className="text-xs text-gray-500 mt-1">Posição: {element.position}</p>
                                  </div>
                                  <Sparkles className="h-4 w-4 text-blue-600" />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Citations and Evidence */}
                {result.citations && result.citations.length > 0 && (
                  <Card>
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center space-x-3">
                        <ExternalLink className="h-5 w-5 text-primary" />
                        <span>Citações e Evidências</span>
                        <Badge variant="outline" className="text-blue-800 border-blue-800">Google Critério 8</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {result.citations.map((citation, index) => (
                          <div key={index} className="bg-gray-50 border border-gray-200 rounded p-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <Badge variant="secondary">{citation.type}</Badge>
                                  <Badge 
                                    variant="outline" 
                                    className={citation.credibility === 'high' ? 'text-green-800 border-green-800' : citation.credibility === 'medium' ? 'text-yellow-800 border-yellow-800' : 'text-red-800 border-red-800'}
                                  >
                                    {citation.credibility === 'high' ? 'Alta Credibilidade' : citation.credibility === 'medium' ? 'Média Credibilidade' : 'Baixa Credibilidade'}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-700 mb-1">{citation.text}</p>
                                <a 
                                  href={citation.suggestedLink} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-600 hover:text-blue-800 underline"
                                >
                                  {citation.suggestedLink}
                                </a>
                              </div>
                              <ExternalLink className="h-4 w-4 text-gray-400 mt-1" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Internal Linking Suggestions */}
                {result.internalLinking && result.internalLinking.length > 0 && (
                  <Card>
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center space-x-3">
                        <LinkIcon className="h-5 w-5 text-primary" />
                        <span>Sugestões de Links Internos</span>
                        <Badge variant="outline" className="text-orange-800 border-orange-800">Google Critério 10</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {result.internalLinking.map((link, index) => (
                          <div key={index} className="bg-orange-50 border border-orange-200 rounded p-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-800">"{link.anchorText}"</span>
                              <Badge variant="outline" className="text-xs">
                                Score: {Math.round(link.relevanceScore * 100)}%
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-600 mb-1">Página: {link.targetPage}</p>
                            <p className="text-xs text-gray-500">Contexto: {link.context}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Entity Optimization */}
                {result.entities && (
                  <Card>
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center space-x-3">
                        <Tags className="h-5 w-5 text-primary" />
                        <span>Otimização de Entidades</span>
                        <Badge variant="outline" className="text-cyan-800 border-cyan-800">Google Critério 11</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        {result.entities.brands && result.entities.brands.length > 0 && (
                          <div>
                            <Label className="font-medium text-gray-700">Marcas Mencionadas:</Label>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {result.entities.brands.map((brand, index) => (
                                <Badge key={index} variant="outline" className="text-xs">{brand}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        {result.entities.people && result.entities.people.length > 0 && (
                          <div>
                            <Label className="font-medium text-gray-700">Pessoas Influentes:</Label>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {result.entities.people.map((person, index) => (
                                <Badge key={index} variant="outline" className="text-xs">{person}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        {result.entities.locations && result.entities.locations.length > 0 && (
                          <div>
                            <Label className="font-medium text-gray-700">Localizações:</Label>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {result.entities.locations.map((location, index) => (
                                <Badge key={index} variant="outline" className="text-xs">{location}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        {result.entities.concepts && result.entities.concepts.length > 0 && (
                          <div>
                            <Label className="font-medium text-gray-700">Conceitos-chave:</Label>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {result.entities.concepts.map((concept, index) => (
                                <Badge key={index} variant="outline" className="text-xs">{concept}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Schema Markup */}
                {result.schemaMarkup && (
                  <Card>
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center space-x-3">
                        <Code className="h-5 w-5 text-primary" />
                        <span>Schema Markup</span>
                        <Badge variant="outline" className="text-green-800 border-green-800">Google Critério 12</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-3">
                        <div className={`flex items-center justify-between p-2 rounded ${result.schemaMarkup.articleSchema ? 'bg-green-50' : 'bg-gray-50'}`}>
                          <span className="text-sm">Article Schema</span>
                          {result.schemaMarkup.articleSchema ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-gray-400" />
                          )}
                        </div>
                        <div className={`flex items-center justify-between p-2 rounded ${result.schemaMarkup.authorSchema ? 'bg-green-50' : 'bg-gray-50'}`}>
                          <span className="text-sm">Author Schema</span>
                          {result.schemaMarkup.authorSchema ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-gray-400" />
                          )}
                        </div>
                        <div className={`flex items-center justify-between p-2 rounded ${result.schemaMarkup.faqSchema ? 'bg-green-50' : 'bg-gray-50'}`}>
                          <span className="text-sm">FAQ Schema</span>
                          {result.schemaMarkup.faqSchema ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-gray-400" />
                          )}
                        </div>
                        <div className={`flex items-center justify-between p-2 rounded ${result.schemaMarkup.organizationSchema ? 'bg-green-50' : 'bg-gray-50'}`}>
                          <span className="text-sm">Organization Schema</span>
                          {result.schemaMarkup.organizationSchema ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Featured Image Suggestion */}
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center space-x-3">
                      <Image className="h-5 w-5 text-primary" />
                      <span>Imagem Destacada</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                      <div className="text-center">
                        <Camera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">Sugestão de imagem foi gerada automaticamente</p>
                      </div>
                    </div>
                    <div className="space-y-3 text-sm">
                      <div>
                        <Label className="font-medium text-gray-700">Título sugerido:</Label>
                        <p className="text-gray-600 bg-gray-50 p-2 rounded mt-1">{result.featuredImage.title}</p>
                      </div>
                      <div>
                        <Label className="font-medium text-gray-700">ALT Text:</Label>
                        <p className="text-gray-600 bg-gray-50 p-2 rounded mt-1">{result.featuredImage.altText}</p>
                      </div>
                      <div>
                        <Label className="font-medium text-gray-700">Palavras-chave:</Label>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {result.featuredImage.keywords.map((keyword, index) => (
                            <Badge key={index} variant="secondary">{keyword}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* FAQ Section */}
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center space-x-3">
                      <HelpCircle className="h-5 w-5 text-primary" />
                      <span>FAQ Automático ({result.faq.length} perguntas)</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="space-y-2">
                      {result.faq.map((item, index) => (
                        <AccordionItem key={index} value={`item-${index}`} className="border border-gray-200 rounded-lg">
                          <AccordionTrigger className="px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-t-lg text-left">
                            <span className="font-medium text-gray-900 text-sm">{item.question}</span>
                          </AccordionTrigger>
                          <AccordionContent className="px-4 py-3">
                            <p className="text-sm text-gray-600">{item.answer}</p>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>

                {/* Case Studies Section */}
                {result.caseStudies && result.caseStudies.length > 0 && (
                  <Card>
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center space-x-3">
                        <Trophy className="h-5 w-5 text-yellow-600" />
                        <span>Casos de Sucesso</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {result.caseStudies.map((caseStudy, index) => (
                          <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gradient-to-br from-yellow-50 to-orange-50">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-semibold text-gray-900 text-sm">{caseStudy.title}</h4>
                              {caseStudy.externalLink && (
                                <a 
                                  href={caseStudy.externalLink} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-primary hover:text-blue-700 text-xs flex items-center"
                                >
                                  <ExternalLink className="h-3 w-3 mr-1" />
                                  Ver caso
                                </a>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{caseStudy.description}</p>
                            <div className="bg-white p-2 rounded border-l-4 border-green-500">
                              <p className="text-xs font-medium text-green-700">Resultados:</p>
                              <p className="text-xs text-green-600">{caseStudy.results}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* CTA Section */}
                {result.ctaSection && (
                  <Card>
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center space-x-3">
                        <Rocket className="h-5 w-5 text-green-600" />
                        <span>Call-to-Action</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200 text-center">
                        <h3 className="text-xl font-bold text-gray-900 mb-3">{result.ctaSection.title}</h3>
                        <p className="text-gray-700 mb-4 leading-relaxed">{result.ctaSection.text}</p>
                        <Button 
                          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 text-sm font-medium"
                          onClick={() => handleCopyToClipboard(
                            `**${result.ctaSection!.title}**\n\n${result.ctaSection!.text}\n\n[${result.ctaSection!.buttonText}]`, 
                            "CTA copiado!"
                          )}
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copiar CTA
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Author Bio Section */}
                {result.authorBio && (
                  <Card>
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center space-x-3">
                        <User className="h-5 w-5 text-secondary" />
                        <span>Biografia do Autor</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                        <p className="text-sm text-gray-700 leading-relaxed">{result.authorBio}</p>
                        <div className="flex justify-end mt-3">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-primary hover:text-blue-700 text-xs"
                            onClick={() => handleCopyToClipboard(result.authorBio || "", "Biografia copiada!")}
                          >
                            <Copy className="h-3 w-3 mr-1" />
                            Copiar biografia
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Actions */}
        {result && (
          <Card className="mt-8">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Shield className="h-4 w-4 text-secondary" />
                    <span>Conteúdo 100% Original</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Rocket className="h-4 w-4 text-primary" />
                    <span>Otimizado para RankMath</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Button 
                    variant="outline"
                    onClick={handleCopyAllContent}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Exportar
                  </Button>
                  <Button 
                    onClick={handleCopyAllContent}
                    className="bg-secondary hover:bg-green-700"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copiar Tudo
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
              <span className="flex items-center">
                <Bot className="h-4 w-4 mr-1 text-primary" />
                Powered by Advanced AI
              </span>
              <span className="flex items-center">
                <Languages className="h-4 w-4 mr-1 text-secondary" />
                Linguagem Simples
              </span>
              <span className="flex items-center">
                <Search className="h-4 w-4 mr-1 text-accent" />
                SEO Otimizado
              </span>
            </div>
            <p className="text-sm text-gray-400">
              Ferramenta profissional para reescrita de conteúdo SEO compatível com RankMath
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
