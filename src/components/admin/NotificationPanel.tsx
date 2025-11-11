import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, CheckCircle, XCircle, MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

type Notification = {
  id: string;
  material_id: string;
  user_id: string;
  action_type: string;
  comment: string | null;
  created_at: string;
  material: {
    title: string;
    client_id: string;
    clients: {
      name: string;
      icon: string | null;
      color: string | null;
    };
  };
  profiles: {
    email: string;
  };
};

const NotificationPanel = () => {
  const { data: notifications = [] } = useQuery({
    queryKey: ["material-notifications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("material_approvals")
        .select(`
          *,
          material:materials!inner(
            title,
            client_id,
            clients!inner(
              name,
              icon,
              color
            )
          ),
          profiles!inner(email)
        `)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      return data as unknown as Notification[];
    },
    refetchInterval: 30000, // Atualiza a cada 30 segundos
  });

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case "approved":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "rejected":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "commented":
        return <MessageSquare className="w-4 h-4 text-blue-500" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getActionText = (actionType: string) => {
    switch (actionType) {
      case "approved":
        return "aprovou";
      case "rejected":
        return "reprovou";
      case "commented":
        return "comentou em";
      default:
        return "interagiu com";
    }
  };

  if (notifications.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notificações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhuma notificação recente
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Notificações Recentes
          <Badge variant="secondary">{notifications.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
          >
            <div
              className="p-2 rounded-full flex-shrink-0"
              style={{
                backgroundColor: `${notification.material.clients.color || "#6366f1"}20`,
              }}
            >
              {getActionIcon(notification.action_type)}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm">
                <span className="font-medium">{notification.profiles.email}</span>{" "}
                {getActionText(notification.action_type)}{" "}
                <span className="font-medium">"{notification.material.title}"</span>{" "}
                de{" "}
                <span className="font-medium">{notification.material.clients.name}</span>
              </p>
              
              {notification.comment && (
                <p className="text-sm text-muted-foreground mt-1 italic">
                  "{notification.comment}"
                </p>
              )}

              <p className="text-xs text-muted-foreground mt-1">
                {formatDistanceToNow(new Date(notification.created_at), {
                  addSuffix: true,
                  locale: ptBR,
                })}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default NotificationPanel;
