import { lazy, Suspense, useState, memo } from "react";
import whatsappLogo from "@/assets/whatsapp-logo.png";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/Navigation";
import logo from "@/assets/logo.png";
import Hero from "@/components/Hero";
import ProjectCard from "@/components/ProjectCard";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import FloatingAdminButton from "@/components/FloatingAdminButton";
import Lightbox from "@/components/Lightbox";
import { useInView } from "@/hooks/use-in-view";
import { TypewriterText } from "@/components/TypewriterText";
import { AnimatedSection } from "@/components/AnimatedSection";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import placeholderProject from "@/assets/placeholder-project.jpg";
import { useQuery } from "@tanstack/react-query";

// Lazy loading de componentes menos críticos para otimizar carregamento inicial
const About = lazy(() => import("@/components/About"));
const ServiceSteps = lazy(() => import("@/components/ServiceSteps"));
const FAQ = lazy(() => import("@/components/FAQ"));
const Contact = lazy(() => import("@/components/Contact"));
const SocialMedia = lazy(() => import("@/components/SocialMedia"));
interface ProjectMedia {
  url: string;
  type: 'image' | 'video';
  metadata?: {
    width: number;
    height: number;
  };
}
interface Project {
  id: string;
  title: string;
  category: string;
  image: string;
  bannerImage: string;
  bannerType: 'image' | 'video';
  detailMedia: ProjectMedia[];
  description: string;
  fullDescription: string;
  technologies: string[];
  year: string;
  imageSpacing: number;
  hideBanner?: boolean;
}
const Index = () => {
  const {
    ref: projectsRef,
    isInView: projectsInView
  } = useInView({
    threshold: 0.1,
    triggerOnce: true
  });
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [lightboxImage, setLightboxImage] = useState<{
    src: string;
    alt: string;
    projectIndex: number;
    mediaIndex: number;
  } | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("Todos");
  const {
    isAdmin
  } = useAuth();

  // Use React Query for projects
  const {
    data: projects = [],
    isLoading: loading
  } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('projects').select(`
          *,
          project_images (image_url, display_order, file_type, metadata),
          project_technologies (technology)
        `).order('display_order', {
        ascending: true
      }).limit(20);
      if (error) throw error;
      const formattedProjects: Project[] = (data || []).map((project: any) => {
        const sortedMedia = project.project_images?.sort((a: any, b: any) => a.display_order - b.display_order) || [];
        return {
          id: project.id,
          title: project.title,
          category: project.category,
          image: project.banner_image || placeholderProject,
          bannerImage: project.banner_image || placeholderProject,
          bannerType: 'image' as 'image' | 'video',
          detailMedia: sortedMedia.map((img: any) => ({
            url: img.image_url,
            type: (img.file_type || 'image') as 'image' | 'video',
            metadata: img.metadata
          })),
          description: project.description,
          fullDescription: project.full_description,
          technologies: project.project_technologies?.map((t: any) => t.technology) || [],
          year: project.year.toString(),
          imageSpacing: project.image_spacing ?? 16,
          hideBanner: project.hide_banner ?? false
        };
      });
      return formattedProjects;
    },
    enabled: projectsInView,
    // Only load when projects section is visible
    staleTime: 2 * 60 * 1000,
    // 2 minutes
    gcTime: 5 * 60 * 1000 // 5 minutes
  });
  const project = selectedProject !== null ? projects[selectedProject] : null;

  // Extrair categorias únicas
  const categories = ["Todos", ...Array.from(new Set(projects.map(p => p.category)))];

  // Filtrar projetos por categoria
  const filteredProjects = selectedCategory === "Todos" ? projects : projects.filter(p => p.category === selectedCategory);

  // Funções de navegação do lightbox
  const handleLightboxPrevious = () => {
    if (!lightboxImage) return;
    const currentProject = projects[lightboxImage.projectIndex];
    const images = currentProject.detailMedia.filter(m => m.type === 'image');
    const currentImageIndex = images.findIndex(m => m.url === lightboxImage.src);
    if (currentImageIndex > 0) {
      const prevImage = images[currentImageIndex - 1];
      setLightboxImage({
        src: prevImage.url,
        alt: `${currentProject.title} - Detalhe ${currentImageIndex}`,
        projectIndex: lightboxImage.projectIndex,
        mediaIndex: currentImageIndex - 1
      });
    }
  };
  const handleLightboxNext = () => {
    if (!lightboxImage) return;
    const currentProject = projects[lightboxImage.projectIndex];
    const images = currentProject.detailMedia.filter(m => m.type === 'image');
    const currentImageIndex = images.findIndex(m => m.url === lightboxImage.src);
    if (currentImageIndex < images.length - 1) {
      const nextImage = images[currentImageIndex + 1];
      setLightboxImage({
        src: nextImage.url,
        alt: `${currentProject.title} - Detalhe ${currentImageIndex + 2}`,
        projectIndex: lightboxImage.projectIndex,
        mediaIndex: currentImageIndex + 1
      });
    }
  };
  const getLightboxNavigationInfo = () => {
    if (!lightboxImage) return {
      hasPrevious: false,
      hasNext: false
    };
    const currentProject = projects[lightboxImage.projectIndex];
    const images = currentProject.detailMedia.filter(m => m.type === 'image');
    const currentImageIndex = images.findIndex(m => m.url === lightboxImage.src);
    return {
      hasPrevious: currentImageIndex > 0,
      hasNext: currentImageIndex < images.length - 1
    };
  };
  return <div className="min-h-screen">
      <header>
        <Navigation />
        
        {/* Admin floating button */}
        {isAdmin && <FloatingAdminButton />}
      </header>
      
      <main>
        <Hero />
      
        <section id="projects" className="py-12 sm:py-16" aria-label="Projetos">
          <div className="container mx-auto px-6">
          <div ref={projectsRef} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 min-h-[3rem]">
              <TypewriterText text="Um pouquinho do que eu faço." isInView={projectsInView} speed={50} />
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-4">
              Esqueça os templates prontos. Aqui só entra suor, neurónios queimados e estratégias visuais que funcionam pra valer! Se liga:













                                                                                                                       
            </p>
            
            {/* Filtros de categoria */}
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-12">
              {categories.map(category => <button key={category} onClick={() => setSelectedCategory(category)} className={`px-3 py-1.5 sm:px-6 sm:py-2 rounded-full text-xs sm:text-base font-medium transition-all ${selectedCategory === category ? 'bg-primary text-primary-foreground shadow-lg scale-105' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}>
                  {category}
                </button>)}
            </div>
          </div>
          
          {loading ? <div className="text-center py-12 text-muted-foreground">
              Carregando projetos...
            </div> : filteredProjects.length === 0 ? <div className="text-center py-12 text-muted-foreground">
              Nenhum projeto disponível nesta categoria.
            </div> : <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 md:gap-8 max-w-7xl mx-auto px-2 sm:px-4">
              {filteredProjects.map((project, index) => {
              const originalIndex = projects.findIndex(p => p.id === project.id);
              return <AnimatedSection key={project.id}>
                    <ProjectCard {...project} onClick={() => setSelectedProject(originalIndex)} />
                  </AnimatedSection>;
            })}
            </div>}
          </div>
        </section>

        <Suspense fallback={<div className="py-16" />}>
          <About />
          <ServiceSteps />
          <FAQ />
          <Contact />
          <SocialMedia />
        </Suspense>
      </main>

      <FloatingWhatsApp />

      <Dialog open={selectedProject !== null} onOpenChange={() => setSelectedProject(null)}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
          {project && <div className="space-y-12">
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

              {/* Mídia principal */}
              {!project.hideBanner && <div className="relative w-full overflow-hidden rounded-2xl shadow-2xl">
                {project.bannerType === 'video' ? <video src={project.bannerImage} controls className="w-full h-auto" style={{
              maxWidth: '1920px',
              margin: '0 auto',
              display: 'block'
            }} preload="metadata" /> : <img src={project.bannerImage} alt={`${project.title} - Banner do projeto`} className="w-full h-auto" style={{
              maxWidth: '1920px',
              margin: '0 auto',
              display: 'block'
            }} loading="lazy" decoding="async" />}
              </div>}

              {/* Sobre o projeto */}
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-4">
                  Sobre o Projeto
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {project.fullDescription}
                </p>
              </div>

              {/* Mídias de detalhes */}
              <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: `${project.imageSpacing}px`
          }}>
                {project.detailMedia.map((media, index) => <div key={index} className="relative w-full overflow-hidden shadow-xl" style={{
              borderRadius: project.imageSpacing === 0 ? '0' : '1rem'
            }}>
                    {media.type === 'video' ? <video src={media.url} controls className="w-full h-auto" style={{
                maxWidth: '1920px',
                margin: '0 auto',
                display: 'block'
              }} preload="metadata" /> : <img src={media.url} alt={`${project.title} - Detalhe ${index + 1}`} className="w-full h-auto cursor-pointer hover:opacity-95 transition-opacity" style={{
                maxWidth: '1920px',
                margin: '0 auto',
                display: 'block'
              }} onClick={() => setLightboxImage({
                src: media.url,
                alt: `${project.title} - Detalhe ${index + 1}`,
                projectIndex: selectedProject!,
                mediaIndex: index
              })} loading="lazy" decoding="async" />}
                  </div>)}
              </div>

              {/* Softwares Utilizados */}
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-4">
                  Softwares Utilizados
                </h2>
                <div className="flex flex-wrap gap-3">
                  {project.technologies.map(tech => <span key={tech} className="inline-block px-6 py-3 bg-primary/10 text-primary rounded-full text-base font-medium hover:bg-primary/20 transition-colors">
                      {tech}
                    </span>)}
                </div>
              </div>
            </div>}
        </DialogContent>
      </Dialog>

      {lightboxImage && <Lightbox src={lightboxImage.src} alt={lightboxImage.alt} onClose={() => setLightboxImage(null)} onPrevious={handleLightboxPrevious} onNext={handleLightboxNext} hasPrevious={getLightboxNavigationInfo().hasPrevious} hasNext={getLightboxNavigationInfo().hasNext} />}
      
      <footer className="py-8 border-t border-border relative">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <img src={logo} alt="Pecin Design - Logo" className="h-8 w-auto hover:scale-110 transition-transform duration-300" loading="lazy" />
              <p className="text-muted-foreground text-center md:text-left">
                © 2025 Pecin Design. Todos os direitos reservados.
              </p>
            </div>
            <a href="https://wa.me/5511999999999?text=Olá! Vim através do seu portfólio." target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium" aria-label="Fale no WhatsApp">
              <img src={whatsappLogo} alt="WhatsApp" className="w-5 h-5 object-contain" aria-hidden="true" />
              Fale no WhatsApp
            </a>
          </div>
        </div>
      </footer>
    </div>;
};
export default Index;