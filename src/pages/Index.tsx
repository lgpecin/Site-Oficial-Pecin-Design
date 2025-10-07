import { lazy, Suspense, useState } from "react";
import { MessageCircle, X } from "lucide-react";
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import FeaturedProjects from "@/components/FeaturedProjects";
import ProjectCard from "@/components/ProjectCard";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Lazy loading de componentes menos críticos para otimizar carregamento inicial
const About = lazy(() => import("@/components/About"));
const ServiceSteps = lazy(() => import("@/components/ServiceSteps"));
const FAQ = lazy(() => import("@/components/FAQ"));
const Contact = lazy(() => import("@/components/Contact"));
const SocialMedia = lazy(() => import("@/components/SocialMedia"));
import placeholderProject from "@/assets/placeholder-project.jpg";

const Index = () => {
  const [selectedProject, setSelectedProject] = useState<number | null>(null);

  const projects = [
    {
      title: "Have Fun Turismo",
      category: "Social Media",
      image: placeholderProject,
      bannerImage: placeholderProject,
      detailImages: [placeholderProject, placeholderProject],
      description: "Design de interface moderna para app de exercícios",
      fullDescription: "Desenvolvimento completo de interface para aplicativo mobile de fitness, focado em usabilidade e engajamento do usuário. O projeto incluiu pesquisa de usuário, wireframes, prototipagem e testes de usabilidade.",
      technologies: ["Figma", "Adobe XD", "Prototyping"],
      year: "2024",
      featured: true,
    },
    {
      title: "Shopping Avenida Center",
      category: "Branding e Social Media",
      image: placeholderProject,
      bannerImage: placeholderProject,
      detailImages: [placeholderProject, placeholderProject],
      description: "Criação completa de identidade visual corporativa",
      fullDescription: "Projeto completo de identidade visual incluindo logotipo, paleta de cores, tipografia e aplicações em diversos materiais. Desenvolvido com foco em transmitir os valores da marca e criar impacto visual memorável.",
      technologies: ["Illustrator", "Photoshop", "InDesign"],
      year: "2024",
      featured: true,
    },
    {
      title: "Orla",
      category: "Branding",
      image: placeholderProject,
      bannerImage: placeholderProject,
      detailImages: [placeholderProject, placeholderProject],
      description: "Landing page otimizada para conversão",
      fullDescription: "Design de website e-commerce com foco em UX e otimização de conversão. Inclui sistema de navegação intuitivo, páginas de produto otimizadas e checkout simplificado.",
      technologies: ["Figma", "HTML/CSS", "React"],
      year: "2024",
      featured: false,
    },
    {
      title: "Retrospectiva 2025",
      category: "Social Media e Branding",
      image: placeholderProject,
      bannerImage: placeholderProject,
      detailImages: [placeholderProject, placeholderProject],
      description: "Conjunto de ilustrações 3D para marketing",
      fullDescription: "Série de ilustrações 3D criadas para campanhas de marketing digital. Cada ilustração foi desenvolvida com atenção aos detalhes, cores vibrantes e estilo moderno para aumentar o engajamento.",
      technologies: ["Blender", "Cinema 4D", "After Effects"],
      year: "2024",
      featured: true,
    },
  ];

  const featuredProjects = projects.filter(project => project.featured);
  const project = selectedProject !== null ? projects[selectedProject] : null;

  return (
    <div className="min-h-screen">
      <Navigation />
      <Hero />
      <FeaturedProjects 
        projects={featuredProjects} 
        onProjectClick={(index) => {
          const realIndex = projects.findIndex(p => p === featuredProjects[index]);
          setSelectedProject(realIndex);
        }}
      />
      
      <section id="projects" className="py-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 animate-fade-up">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Resultados. Sem Enrolação.</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Estes são alguns projetos com resultados únicos.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-2 gap-4 md:gap-8 max-w-6xl mx-auto">
            {projects.map((project, index) => (
              <div
                key={project.title}
                className="animate-fade-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <ProjectCard 
                  {...project} 
                  onClick={() => setSelectedProject(index)}
                />
              </div>
            ))}
          </div>
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
