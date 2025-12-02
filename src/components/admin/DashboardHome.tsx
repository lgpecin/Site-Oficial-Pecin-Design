import { Button } from '@/components/ui/button';
import { FolderOpen, DollarSign, UserCog } from 'lucide-react';

interface DashboardHomeProps {
  onNavigate: (section: string) => void;
}

const DashboardHome = ({ onNavigate }: DashboardHomeProps) => {
  const mainSections = [
    { id: 'portfolio', label: 'Portfólio', icon: FolderOpen, description: 'Projetos públicos do site' },
    { id: 'services', label: 'Orçamentos', icon: DollarSign, description: 'Serviços e preços' },
    { id: 'users', label: 'Usuários', icon: UserCog, description: 'Controle de acesso' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-16">
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-bold">Painel Administrativo</h1>
        <p className="text-lg text-muted-foreground">Selecione uma seção para começar</p>
      </div>

      {/* Main Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mainSections.map((section) => {
          const Icon = section.icon;
          return (
            <button
              key={section.id}
              onClick={() => onNavigate(section.id)}
              className="group relative p-8 bg-card border-2 border-border rounded-2xl hover:border-primary transition-all duration-300 hover:scale-105 hover:shadow-xl"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="p-4 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors">
                  <Icon className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">{section.label}</h3>
                  <p className="text-sm text-muted-foreground">{section.description}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DashboardHome;