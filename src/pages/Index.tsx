import { lazy, Suspense, useState, useEffect } from "react";
import { MessageCircle } from "lucide-react";
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import ProjectCard from "@/components/ProjectCard";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import { useInView } from "@/hooks/use-in-view";
import { TypewriterText } from "@/components/TypewriterText";
import { AnimatedSection } from "@/components/AnimatedSection";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import placeholderProject from "@/assets/placeholder-project.jpg";

// Lazy loading de componentes menos críticos para otimizar carregamento inicial
const About = lazy(() => import("@/components/About"));
const ServiceSteps = lazy(() => import("@/components/ServiceSteps"));
const FAQ = lazy(() => import("@/components/FAQ"));
const Contact = lazy(() => import("@/components/Contact"));
const SocialMedia = lazy(() => import("@/components/SocialMedia"));

interface Project {
  id: string;
  title: string;
  category: string;
  image: string;
  bannerImage: string;
  detailImages: string[];
  description: string;
  fullDescription: string;
  technologies: string[];
  year: string;
}

const Index = () => {
  const { ref: projectsRef, isInView: projectsInView } = useInView({ threshold: 0.1, triggerOnce: true });
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          project_images (image_url, display_order),
          project_technologies (technology)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedProjects: Project[] = (data || []).map((project) => ({
        id: project.id,
        title: project.title,
        category: project.category,
        image: project.banner_image || placeholderProject,
        bannerImage: project.banner_image || placeholderProject,
        detailImages: project.project_images
          ?.sort((a, b) => a.display_order - b.display_order)
          .map((img) => img.image_url) || [placeholderProject],
        description: project.description,
        fullDescription: project.full_description,
        technologies: project.project_technologies?.map((t) => t.technology) || [],
        year: project.year.toString(),
      }));

      setProjects(formattedProjects);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const project = selectedProject !== null ? projects[selectedProject] : null;

  return (
    <div className="min-h-screen">
      <Navigation />
      <Hero />
      
      <section id="projects" className="py-16">
        <div className="container mx-auto px-6">
          <div ref={projectsRef} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 min-h-[3rem]">
              <TypewriterText text="Resultados. Sem Enrolação." isInView={projectsInView} speed={50} />
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Estes são alguns projetos com resultados únicos.
            </p>
          </div>
          
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">
              Carregando projetos...
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Nenhum projeto disponível no momento.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8 max-w-6xl mx-auto">
              {projects.map((project, index) => (
                <AnimatedSection key={project.id}>
                  <ProjectCard 
                    {...project} 
                    onClick={() => setSelectedProject(index)}
                  />
                </AnimatedSection>
              ))}
            </div>
          )}
        </div>
      </section>

      <FloatingWhatsApp />

      <Dialog open={selectedProject !== null} onOpenChange={() => setSelectedProject(null)}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
          {project && (
            <div className="space-y-12">
              {/* Título e metadados */}
              <div>
                <DialogTitle className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                  {project.title}
                </DialogTitle>
                <div className="flex flex-wrap gap-3">
                  <span className="inline-block px-4 py-2 bg-primary/90 text-primary-foreground rounded-full text-sm font-medium">
                    {project.category}
                  </span>
                  <span className="inline-block px-4 py-2 bg-secondary text-secondary-foreground rounded-full text-sm font-medium">
                    {project.year}
                  </span>
                </div>
              </div>

              {/* Imagem principal */}
              <div className="relative w-full overflow-hidden rounded-2xl shadow-2xl">
                <img
                  src={project.bannerImage}
                  alt={project.title}
                  className="w-full h-auto object-cover"
                  style={{ aspectRatio: "16/9" }}
                />
              </div>

              {/* Sobre o projeto */}
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-4">
                  Sobre o Projeto
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {project.fullDescription}
                </p>
              </div>

              {/* Imagens de detalhes */}
              <div className="space-y-8">
                {project.detailImages.map((image, index) => (
                  <div key={index} className="relative w-full overflow-hidden rounded-2xl shadow-xl">
                    <img
                      src={image}
                      alt={`${project.title} - Detalhe ${index + 1}`}
                      className="w-full h-auto object-cover"
                      style={{ aspectRatio: "16/9" }}
                    />
                  </div>
                ))}
              </div>

              {/* Softwares Utilizados */}
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-4">
                  Softwares Utilizados
                </h2>
                <div className="flex flex-wrap gap-3">
                  {project.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="inline-block px-6 py-3 bg-primary/10 text-primary rounded-full text-base font-medium hover:bg-primary/20 transition-colors"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Suspense fallback={<div className="py-16" />}>
        <About />
        <ServiceSteps />
        <FAQ />
        <Contact />
        <SocialMedia />
      </Suspense>
      
      <footer className="py-8 border-t border-border relative">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-muted-foreground text-center md:text-left">
              © 2025 Portfolio. Todos os direitos reservados.
            </p>
            <a
              href="https://wa.me/5511999999999?text=Olá! Vim através do seu portfólio."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              <MessageCircle className="h-5 w-5" />
              Fale no WhatsApp
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
