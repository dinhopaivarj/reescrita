import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { configSchema, type Config, type AIStatus } from "@shared/schema";
import { 
  Settings, 
  Bot, 
  Key, 
  CheckCircle, 
  AlertCircle, 
  Save,
  ArrowLeft,
  ExternalLink
} from "lucide-react";
import { Link } from "wouter";

export default function ConfigPage() {
  const [selectedProvider, setSelectedProvider] = useState<"openai" | "gemini">("gemini");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<Config>({
    resolver: zodResolver(configSchema),
    defaultValues: {
      aiProvider: "gemini",
      apiKey: "",
    },
  });

  // Get AI status
  const { data: aiStatus, isLoading: isLoadingStatus } = useQuery<AIStatus>({
    queryKey: ["/api/ai-status"],
    retry: false
  });

  // Save configuration mutation
  const saveConfigMutation = useMutation({
    mutationFn: async (data: Config) => {
      const response = await apiRequest("POST", "/api/config", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Configuração salva!",
        description: "A IA está configurada e pronta para usar.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/ai-status"] });
    },
    onError: (error) => {
      toast({
        title: "Erro ao salvar",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: Config) => {
    saveConfigMutation.mutate(data);
  };

  useEffect(() => {
    if (aiStatus?.provider) {
      setSelectedProvider(aiStatus.provider);
      form.setValue("aiProvider", aiStatus.provider);
    }
  }, [aiStatus, form]);

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
              </Link>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <Settings className="text-white h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">Configurações</h1>
                  <p className="text-sm text-gray-500">Configure sua IA preferida</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {aiStatus?.isConfigured ? (
                <Badge variant="default" className="bg-secondary text-secondary-foreground">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Configurado
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Não Configurado
                </Badge>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Status Section */}
          <div className="md:col-span-1">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-3">
                  <Bot className="h-5 w-5 text-primary" />
                  <span>Status da IA</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoadingStatus ? (
                  <div className="text-sm text-gray-500">Verificando...</div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Status:</span>
                      <span className={`text-sm font-medium ${aiStatus?.isConfigured ? 'text-secondary' : 'text-red-600'}`}>
                        {aiStatus?.isConfigured ? 'Configurado' : 'Não configurado'}
                      </span>
                    </div>
                    
                    {aiStatus?.provider && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Provedor:</span>
                        <span className="text-sm font-medium capitalize">
                          {aiStatus.provider === 'gemini' ? 'Google Gemini' : 'OpenAI'}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Chave API:</span>
                      <span className={`text-sm font-medium ${aiStatus?.hasKey ? 'text-secondary' : 'text-red-600'}`}>
                        {aiStatus?.hasKey ? 'Configurada' : 'Ausente'}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Configuration Form */}
          <div className="md:col-span-2">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              {/* Provider Selection */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center space-x-3">
                    <Bot className="h-5 w-5 text-primary" />
                    <span>Escolha sua IA</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Gemini Option */}
                    <div 
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                        selectedProvider === 'gemini' ? 'border-primary bg-blue-50' : 'border-gray-200'
                      }`}
                      onClick={() => {
                        setSelectedProvider('gemini');
                        form.setValue('aiProvider', 'gemini');
                      }}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                          <Bot className="text-white h-4 w-4" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">Google Gemini</h3>
                          <p className="text-sm text-gray-500">Modelo avançado 2.5-flash</p>
                        </div>
                      </div>
                      <div className="mt-3 text-xs text-gray-600">
                        ✓ Rápido e eficiente<br />
                        ✓ Excelente para reescrita<br />
                        ✓ Suporte a JSON estruturado
                      </div>
                    </div>

                    {/* OpenAI Option */}
                    <div 
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                        selectedProvider === 'openai' ? 'border-primary bg-blue-50' : 'border-gray-200'
                      }`}
                      onClick={() => {
                        setSelectedProvider('openai');
                        form.setValue('aiProvider', 'openai');
                      }}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                          <Bot className="text-white h-4 w-4" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">OpenAI</h3>
                          <p className="text-sm text-gray-500">Modelo GPT-4o</p>
                        </div>
                      </div>
                      <div className="mt-3 text-xs text-gray-600">
                        ✓ Altamente confiável<br />
                        ✓ Excelente qualidade de texto<br />
                        ✓ Suporte robusto a JSON
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* API Key Input */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center space-x-3">
                    <Key className="h-5 w-5 text-primary" />
                    <span>Chave da API</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="apiKey">
                      Chave da API {selectedProvider === 'gemini' ? 'Gemini' : 'OpenAI'}
                    </Label>
                    <Input
                      id="apiKey"
                      type="password"
                      placeholder={
                        selectedProvider === 'gemini' 
                          ? 'AIza...' 
                          : 'sk-...'
                      }
                      {...form.register("apiKey")}
                      className="font-mono text-sm"
                    />
                    {form.formState.errors.apiKey && (
                      <p className="text-sm text-red-600">{form.formState.errors.apiKey.message}</p>
                    )}
                  </div>

                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <ExternalLink className="h-4 w-4 text-blue-600 mt-0.5" />
                      <div className="text-sm">
                        <p className="text-blue-800 font-medium">Como obter sua chave:</p>
                        <div className="mt-1 text-blue-700">
                          {selectedProvider === 'gemini' ? (
                            <>
                              1. Acesse <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline">Google AI Studio</a><br />
                              2. Faça login com sua conta Google<br />
                              3. Clique em "Create API key"<br />
                              4. Cole a chave que começa com "AIza..."
                            </>
                          ) : (
                            <>
                              1. Acesse <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="underline">OpenAI Platform</a><br />
                              2. Faça login em sua conta<br />
                              3. Clique em "Create new secret key"<br />
                              4. Cole a chave que começa com "sk-..."
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Save Button */}
              <Card>
                <CardContent className="pt-6">
                  <Button
                    type="submit"
                    disabled={saveConfigMutation.isPending}
                    className="w-full h-12 bg-primary hover:bg-blue-700"
                  >
                    {saveConfigMutation.isPending ? (
                      <>
                        <Save className="h-4 w-4 mr-2 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Salvar Configuração
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}