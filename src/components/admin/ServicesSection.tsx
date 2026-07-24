import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Users, LayoutTemplate, Wallet } from "lucide-react";
import ClientsList from "./budgets/ClientsList";
import ClientServicesView from "./budgets/ClientServicesView";
import TemplatesSection from "./TemplatesSection";
import ExpensesSection from "./budgets/ExpensesSection";
import type { BudgetClient } from "./budgets/types";

export type Service = {
  id: string;
  name: string;
  description: string | null;
  category: string;
  price: number;
  delivery_days: number;
  hours: number;
  icon: string | null;
  color: string | null;
  is_active: boolean;
  display_order: number;
};

const ServicesSection = () => {
  const [activeClient, setActiveClient] = useState<BudgetClient | null>(null);
  const [tab, setTab] = useState<"clients" | "templates" | "expenses">("clients");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Orçamentos</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gerencie clientes, templates de serviços e os custos do seu negócio.
        </p>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
        <TabsList>
          <TabsTrigger value="clients">
            <Users className="w-4 h-4 mr-2" />
            Clientes
          </TabsTrigger>
          <TabsTrigger value="templates">
            <LayoutTemplate className="w-4 h-4 mr-2" />
            Templates de Serviços
          </TabsTrigger>
          <TabsTrigger value="expenses">
            <Wallet className="w-4 h-4 mr-2" />
            Custos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="clients" className="mt-6">
          {activeClient ? (
            <ClientServicesView
              client={activeClient}
              onBack={() => setActiveClient(null)}
            />
          ) : (
            <ClientsList onOpenClient={setActiveClient} />
          )}
        </TabsContent>

        <TabsContent value="templates" className="mt-6">
          <TemplatesSection />
        </TabsContent>

        <TabsContent value="expenses" className="mt-6">
          <ExpensesSection />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ServicesSection;

