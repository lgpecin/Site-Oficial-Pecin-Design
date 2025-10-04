import { useState, lazy, Suspense } from "react";
import { MessageCircle } from "lucide-react";
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import FeaturedProjects from "@/components/FeaturedProjects";
import ProjectCard from "@/components/ProjectCard";

// Lazy loading de componentes menos críticos para otimizar carregamento inicial
const About = lazy(() => import("@/components/About"));
const BentoGrid = lazy(() => import("@/components/BentoGrid"));
const FAQ = lazy(() => import("@/components/FAQ"));
const Contact = lazy(() => import("@/components/Contact"));
const SocialMedia = lazy(() => import("@/components/SocialMedia"));
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import project1 from "@/assets/project1.jpg";
import project2 from "@/assets/project2.jpg";
import project3 from "@/assets/project3.jpg";
import project4 from "@/assets/project4.jpg";
import project1Detail1 from "@/assets/project1-detail1.jpg";
import project1Detail2 from "@/assets/project1-detail2.jpg";
import project2Detail1 from "@/assets/project2-detail1.jpg";
import project2Detail2 from "@/assets/project2-detail2.jpg";
import project3Detail1 from "@/assets/project3-detail1.jpg";
import project3Detail2 from "@/assets/project3-detail2.jpg";
import project4Detail1 from "@/assets/project4-detail1.jpg";
import project4Detail2 from "@/assets/project4-detail2.jpg";
import project1Banner from "@/assets/project1-banner.jpg";
import project2Banner from "@/assets/project2-banner.jpg";
import project3Banner from "@/assets/project3-banner.jpg";
import project4Banner from "@/assets/project4-banner.jpg";

const Index = () => {
  const [selectedProject, setSelectedProject] = useState<number | null>(null);

  const projects = [
    {
      title: "Have Fun Turismo",
      category: "Social Media",
      image: project5,
      bannerImage: project1Banner,
      description: "Design de interface moderna para app de exercícios",
      fullDescription: "Desenvolvimento completo de interface para aplicativo mobile de fitness, focado em usabilidade e engajamento do usuário. O projeto incluiu pesquisa de usuário, wireframes, prototipagem e testes de usabilidade.",
      gallery: [project1, project1Detail1, project1Detail2],
      technologies: ["Figma", "Adobe XD", "Prototyping"],
      year: "2024",
      featured: true,
    },
    {
      title: "Shopping Avenida Center",
      category: "Branding e Social Media",
      image: project2,
      bannerImage: project1Banner,
      description: "Criação completa de identidade visual corporativa",
      fullDescription: "Projeto completo de identidade visual incluindo logotipo, paleta de cores, tipografia e aplicações em diversos materiais. Desenvolvido com foco em transmitir os valores da marca e criar impacto visual memorável.",
      gallery: [project1, project1Detail1, project1Detail2],
      technologies: ["Illustrator", "Photoshop", "InDesign"],
      year: "2024",
      featured: true,
    },
    {
      title: "Orla",
      category: "Branding",
      image: project3,
      bannerImage: project3Banner,
      description: "Landing page otimizada para conversão",
      fullDescription: "Design de website e-commerce com foco em UX e otimização de conversão. Inclui sistema de navegação intuitivo, páginas de produto otimizadas e checkout simplificado.",
      gallery: [project3, project3Detail1, project3Detail2],
      technologies: ["Figma", "HTML/CSS", "React"],
      year: "2024",
      featured: false,
    },
    {
      title: "Retrospectiva 2025",
      category: "Social Media e Branding",
      image: project4,
      bannerImage: project4Banner,
      description: "Conjunto de ilustrações 3D para marketing",
      fullDescription: "Série de ilustrações 3D criadas para campanhas de marketing digital. Cada ilustração foi desenvolvida com atenção aos detalhes, cores vibrantes e estilo moderno para aumentar o engajamento.",
      gallery: [project4, project4Detail1, project4Detail2],
      technologies: ["Blender", "Cinema 4D", "After Effects"],
      year: "2024",
      featured: true,
    },
  ];

  const featuredProjects = projects.filter(project => project.featured);

  return (
    <div className="min-h-screen">
      <Navigation />
      <Hero />
      <FeaturedProjects 
        projects={featuredProjects} 
        onProjectClick={(index) => {
          // Encontra o índice real do projeto no array completo
          const realIndex = projects.findIndex(p => p === featuredProjects[index]);
          // Rola até a seção de projetos
          document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" });
          // Aguarda um pouco para o scroll completar antes de abrir o modal
          setTimeout(() => setSelectedProject(realIndex), 500);
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
          
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
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

      <Dialog open={selectedProject !== null} onOpenChange={() => setSelectedProject(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedProject !== null && (
            <>
              <DialogHeader>
                <DialogTitle className="text-3xl font-bold">
                  {projects[selectedProject].title}
                </DialogTitle>
                <p className="text-primary font-medium">{projects[selectedProject].category}</p>
              </DialogHeader>
              
              <div className="space-y-6 mt-4">
                <div className="grid grid-cols-1 gap-4">
                  {projects[selectedProject].gallery.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`${projects[selectedProject].title} - ${idx + 1}`}
                      className="w-full rounded-lg object-cover"
                    />
                  ))}
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold mb-2">Sobre o Projeto</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {projects[selectedProject].fullDescription}
                  </p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Tecnologias</h3>
                    <div className="flex flex-wrap gap-2">
                      {projects[selectedProject].technologies.map((tech) => (
                        <span
                          key={tech}
                          className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Ano</h3>
                    <p className="text-muted-foreground">{projects[selectedProject].year}</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Suspense fallback={<div className="py-16" />}>
        <About />
        <BentoGrid />
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
