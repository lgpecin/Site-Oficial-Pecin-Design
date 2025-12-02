import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  BarChart3, 
  Eye, 
  Users, 
  FolderOpen, 
  MessageSquare,
  TrendingUp,
  Calendar,
  Clock
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const StatisticsSection = () => {
  // Fetch statistics
  const { data: projectsCount } = useQuery({
    queryKey: ["stats-projects"],
    queryFn: async () => {
      const { count } = await supabase
        .from("projects")
        .select("*", { count: "exact", head: true });
      return count || 0;
    },
  });

  const { data: servicesCount } = useQuery({
    queryKey: ["stats-services"],
    queryFn: async () => {
      const { count } = await supabase
        .from("services")
        .select("*", { count: "exact", head: true });
      return count || 0;
    },
  });

  const { data: usersCount } = useQuery({
    queryKey: ["stats-users"],
    queryFn: async () => {
      const { count } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });
      return count || 0;
    },
  });

  const { data: shareLinksCount } = useQuery({
    queryKey: ["stats-share-links"],
    queryFn: async () => {
      const { count } = await supabase
        .from("service_share_links")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true);
      return count || 0;
    },
  });

  const stats = [
    {
      title: "Projetos no Portfólio",
      value: projectsCount,
      icon: FolderOpen,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      description: "Projetos publicados no site",
    },
    {
      title: "Serviços Ativos",
      value: servicesCount,
      icon: BarChart3,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      description: "Serviços disponíveis para orçamento",
    },
    {
      title: "Usuários Registrados",
      value: usersCount,
      icon: Users,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      description: "Total de contas criadas",
    },
    {
      title: "Links Compartilhados",
      value: shareLinksCount,
      icon: MessageSquare,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
      description: "Links de orçamento ativos",
    },
  ];

  const getCurrentDate = () => {
    return new Date().toLocaleDateString("pt-BR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-4xl font-bold flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <BarChart3 className="h-8 w-8 text-primary" />
          </div>
          Estatísticas
        </h2>
        <p className="text-muted-foreground text-lg">
          Visão geral do desempenho do seu portfólio
        </p>
      </div>

      <Separator />

      {/* Date Info */}
      <Card className="border-2">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Última atualização</p>
                <p className="text-lg font-semibold capitalize">{getCurrentDate()}</p>
              </div>
            </div>
            <Badge variant="secondary" className="gap-2">
              <Clock className="h-3 w-3" />
              Em tempo real
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className={`p-3 ${stat.bgColor} rounded-lg`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <CardTitle className="text-3xl font-bold">
                  {stat.value !== undefined ? stat.value : "..."}
                </CardTitle>
                <CardDescription className="text-sm font-medium">
                  {stat.title}
                </CardDescription>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Additional Info */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" />
              Visibilidade
            </CardTitle>
            <CardDescription>Status de publicação do site</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-500/10 rounded-lg border border-green-500/20">
              <div>
                <p className="font-medium text-green-700 dark:text-green-400">Site Público</p>
                <p className="text-sm text-muted-foreground">Visível para todos</p>
              </div>
              <Badge variant="default" className="bg-green-600">Ativo</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Performance
            </CardTitle>
            <CardDescription>Status geral do portfólio</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Projetos completos</span>
                <span className="font-semibold">{projectsCount || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Orçamentos disponíveis</span>
                <span className="font-semibold">{servicesCount || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Links ativos</span>
                <span className="font-semibold">{shareLinksCount || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info Banner */}
      <div className="p-6 bg-muted/50 rounded-lg border">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-primary/10 rounded-lg">
            <BarChart3 className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1 space-y-2">
            <h3 className="font-semibold text-lg">Estatísticas em Tempo Real</h3>
            <p className="text-sm text-muted-foreground">
              Todos os números são atualizados automaticamente conforme você faz alterações no painel administrativo. 
              As estatísticas refletem o estado atual do banco de dados e são calculadas dinamicamente.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsSection;
