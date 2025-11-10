import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import DashboardLayout from '@/components/admin/DashboardLayout';
import ProjectList from '@/components/admin/ProjectList';
import ProjectForm from '@/components/admin/ProjectForm';
import ClientsSection from '@/components/admin/ClientsSection';
import SheetsSection from '@/components/admin/SheetsSection';
import UsersSection from '@/components/admin/UsersSection';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const Admin = () => {
  const [currentSection, setCurrentSection] = useState('projects');
  const [showForm, setShowForm] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | undefined>();
  const [refreshKey, setRefreshKey] = useState(0);
  const { isAdmin, loading, signOut, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    } else if (!loading && user && !isAdmin) {
      navigate('/');
    }
  }, [user, isAdmin, loading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleEdit = (projectId: string) => {
    setEditingProjectId(projectId);
    setShowForm(true);
  };

  const handleSuccess = () => {
    setShowForm(false);
    setEditingProjectId(undefined);
    setRefreshKey(prev => prev + 1);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingProjectId(undefined);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const renderSection = () => {
    switch (currentSection) {
      case 'projects':
        return showForm ? (
          <ProjectForm
            projectId={editingProjectId}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold">Projetos</h2>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Projeto
              </Button>
            </div>
            <ProjectList onEdit={handleEdit} refresh={refreshKey} />
          </div>
        );
      case 'clients':
        return <ClientsSection />;
      case 'sheets':
        return <SheetsSection />;
      case 'users':
        return <UsersSection />;
      default:
        return null;
    }
  };

  return (
    <DashboardLayout
      currentSection={currentSection}
      onSectionChange={(section) => {
        setCurrentSection(section);
        setShowForm(false);
        setEditingProjectId(undefined);
      }}
      onSignOut={handleSignOut}
    >
      {renderSection()}
    </DashboardLayout>
  );
};

export default Admin;
