import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { LogOut, FolderOpen, Users, DollarSign, UserCog, Image, Star, Calendar, Home, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

interface DashboardLayoutProps {
  children: React.ReactNode;
  currentSection: string;
  onSectionChange: (section: string) => void;
  onSignOut: () => void;
}

const mainSections = [
  { id: 'home', label: 'Início', icon: Home },
  { id: 'portfolio', label: 'Portfólio', icon: FolderOpen },
  { id: 'clients', label: 'Clientes', icon: Users },
  { id: 'services', label: 'Orçamentos', icon: DollarSign },
  { id: 'users', label: 'Usuários', icon: UserCog },
];

const studioSections = [
  { id: 'moodboard', label: 'Moodboard', icon: Image },
  { id: 'saved', label: 'Salvos', icon: Star },
  { id: 'planning', label: 'Planejamento', icon: Calendar },
];

const DashboardLayout = ({ children, currentSection, onSectionChange, onSignOut }: DashboardLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Painel Administrativo</h1>
          <div className="flex gap-2">
            <Link to="/">
              <Button variant="outline" size="sm">
                <Globe className="h-4 w-4 mr-2" />
                Ver Site
              </Button>
            </Link>
            <Button variant="outline" onClick={onSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 min-h-[calc(100vh-73px)] border-r bg-card/50">
          <nav className="p-4 space-y-6">
            {/* Main sections */}
            <div className="space-y-2">
              {mainSections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => onSectionChange(section.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                      currentSection === section.id
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{section.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Studio sections */}
            <div className="space-y-2 pt-6 border-t">
              <p className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Studio
              </p>
              {studioSections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => onSectionChange(section.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                      currentSection === section.id
                        ? "bg-accent text-accent-foreground"
                        : "hover:bg-accent/50"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{section.label}</span>
                  </button>
                );
              })}
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
