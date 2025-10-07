import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import project1 from "@/assets/project1.jpg";
import project2 from "@/assets/project2.jpg";
import project3 from "@/assets/project3.jpg";
import project4 from "@/assets/project4.jpg";
import project1Banner from "@/assets/project1-banner.jpg";
import project2Banner from "@/assets/project2-banner.jpg";
import project3Banner from "@/assets/project3-banner.jpg";
import project4Banner from "@/assets/project4-banner.jpg";
import project1Detail1 from "@/assets/project1-detail1.jpg";
import project1Detail2 from "@/assets/project1-detail2.jpg";
import project2Detail1 from "@/assets/project2-detail1.jpg";
import project2Detail2 from "@/assets/project2-detail2.jpg";
import project3Detail1 from "@/assets/project3-detail1.jpg";
import project3Detail2 from "@/assets/project3-detail2.jpg";
import project4Detail1 from "@/assets/project4-detail1.jpg";
import project4Detail2 from "@/assets/project4-detail2.jpg";

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const projects = [
    {
      title: "Have Fun Turismo",
      category: "Social Media",
      image: project1,
      bannerImage: project1Banner,
      detailImages: [project1Detail1, project1Detail2],
      description: "Design de interface moderna para app de exercícios",
      fullDescription: "Desenvolvimento completo de interface para aplicativo mobile de fitness, focado em usabilidade e engajamento do usuário. O projeto incluiu pesquisa de usuário, wireframes, prototipagem e testes de usabilidade.",
      technologies: ["Figma", "Adobe XD", "Prototyping"],
      year: "2024",
    },
    {
      title: "Shopping Avenida Center",
      category: "Branding e Social Media",
      image: project2,
      bannerImage: project2Banner,
      detailImages: [project2Detail1, project2Detail2],
      description: "Criação completa de identidade visual corporativa",
      fullDescription: "Projeto completo de identidade visual incluindo logotipo, paleta de cores, tipografia e aplicações em diversos materiais. Desenvolvido com foco em transmitir os valores da marca e criar impacto visual memorável.",
      technologies: ["Illustrator", "Photoshop", "InDesign"],
      year: "2024",
    },
    {
      title: "Orla",
      category: "Branding",
      image: project3,
      bannerImage: project3Banner,
      detailImages: [project3Detail1, project3Detail2],
      description: "Landing page otimizada para conversão",
      fullDescription: "Design de website e-commerce com foco em UX e otimização de conversão. Inclui sistema de navegação intuitivo, páginas de produto otimizadas e checkout simplificado.",
      technologies: ["Figma", "HTML/CSS", "React"],
      year: "2024",
    },
    {
      title: "Retrospectiva 2025",
      category: "Social Media e Branding",
      image: project4,
      bannerImage: project4Banner,
      detailImages: [project4Detail1, project4Detail2],
      description: "Conjunto de ilustrações 3D para marketing",
      fullDescription: "Série de ilustrações 3D criadas para campanhas de marketing digital. Cada ilustração foi desenvolvida com atenção aos detalhes, cores vibrantes e estilo moderno para aumentar o engajamento.",
      technologies: ["Blender", "Cinema 4D", "After Effects"],
      year: "2024",
    },
  ];

  const projectIndex = parseInt(id || "0");
  const project = projects[projectIndex];

  if (!project) {
    navigate("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-6">
          {/* Botão voltar */}
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-8"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>

          {/* Título e metadados */}
          <div className="max-w-6xl mx-auto mb-12 animate-fade-up">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 text-foreground">
              {project.title}
            </h1>
            <div className="flex flex-wrap gap-3 mb-8">
              <span className="inline-block px-4 py-2 bg-primary/90 text-primary-foreground rounded-full text-sm font-medium">
                {project.category}
              </span>
              <span className="inline-block px-4 py-2 bg-secondary text-secondary-foreground rounded-full text-sm font-medium">
                {project.year}
              </span>
            </div>
          </div>

          {/* Imagem principal */}
          <div className="max-w-6xl mx-auto mb-16 animate-scale-in">
            <div className="relative w-full overflow-hidden rounded-2xl shadow-2xl">
              <img
                src={project.bannerImage}
                alt={project.title}
                className="w-full h-auto object-cover"
                style={{ aspectRatio: "16/9" }}
              />
            </div>
          </div>

          {/* Sobre o projeto */}
          <div className="max-w-4xl mx-auto mb-16 animate-fade-up">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
              Sobre o Projeto
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {project.fullDescription}
            </p>
          </div>

          {/* Imagens de detalhes */}
          <div className="max-w-6xl mx-auto mb-16 space-y-12">
            {project.detailImages.map((image, index) => (
              <div 
                key={index} 
                className="animate-fade-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="relative w-full overflow-hidden rounded-2xl shadow-xl">
                  <img
                    src={image}
                    alt={`${project.title} - Detalhe ${index + 1}`}
                    className="w-full h-auto object-cover"
                    style={{ aspectRatio: "16/9" }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Softwares Utilizados */}
          <div className="max-w-4xl mx-auto animate-fade-up">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
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
      </main>
    </div>
  );
};

export default ProjectDetails;
