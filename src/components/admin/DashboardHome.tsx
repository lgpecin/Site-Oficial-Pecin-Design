import { Button } from '@/components/ui/button';
import { FolderOpen, Users, DollarSign, UserCog, Image, Star, Calendar } from 'lucide-react';

interface DashboardHomeProps {
  onNavigate: (section: string) => void;
}

const DashboardHome = ({ onNavigate }: DashboardHomeProps) => {
  const mainSections = [
    { id: 'portfolio', label: 'Portfólio', icon: FolderOpen, description: 'Projetos públicos do site' },
    { id: 'clients', label: 'Clientes', icon: Users, description: 'Gestão de clientes' },
    { id: 'services', label: 'Orçamentos', icon: DollarSign, description: 'Serviços e preços' },
    { id: 'users', label: 'Usuários', icon: UserCog, description: 'Controle de acesso' },
  ];

  const studioSections = [
    { id: 'moodboard', label: 'Moodboard', icon: Image, description: 'Canvas criativo' },
    { id: 'saved', label: 'Salvos', icon: Star, description: 'Favoritos' },
    { id: 'planning', label: 'Planejamento', icon: Calendar, description: 'Organize tarefas' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-16">
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-bold">Painel Administrativo</h1>
        <p className="text-lg text-muted-foreground">Selecione uma seção para começar</p>
      </div>

      {/* Main Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

      {/* Studio Section */}
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-2">STUDIO</h2>
          <p className="text-muted-foreground">Ferramentas criativas e organizacionais</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {studioSections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => onNavigate(section.id)}
                className="group relative p-6 bg-gradient-to-br from-accent/50 to-secondary/50 border-2 border-accent rounded-2xl hover:border-accent/80 transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="p-3 bg-background/80 rounded-full group-hover:bg-background transition-colors">
                    <Icon className="h-6 w-6 text-accent-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-1">{section.label}</h3>
                    <p className="text-sm text-muted-foreground">{section.description}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;