import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import ProjectCard from "@/components/ProjectCard";
import About from "@/components/About";
import Contact from "@/components/Contact";
import project1 from "@/assets/project1.jpg";
import project2 from "@/assets/project2.jpg";
import project3 from "@/assets/project3.jpg";
import project4 from "@/assets/project4.jpg";

const Index = () => {
  const projects = [
    {
      title: "App Mobile Fitness",
      category: "UI/UX Design",
      image: project1,
      description: "Design de interface moderna para app de exercícios",
    },
    {
      title: "Identidade Visual Brand",
      category: "Branding",
      image: project2,
      description: "Criação completa de identidade visual corporativa",
    },
    {
      title: "Website E-commerce",
      category: "Web Design",
      image: project3,
      description: "Landing page otimizada para conversão",
    },
    {
      title: "Ilustrações 3D",
      category: "3D Design",
      image: project4,
      description: "Conjunto de ilustrações 3D para marketing",
    },
  ];

  return (
    <div className="min-h-screen">
      <Navigation />
      <Hero />
      
      <section id="projects" className="py-32">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 animate-fade-up">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Projetos Selecionados</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Uma coleção dos meus trabalhos mais recentes, focados em criar experiências visuais únicas e impactantes.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {projects.map((project, index) => (
              <div
                key={project.title}
                className="animate-fade-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <ProjectCard {...project} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <About />
      <Contact />
      
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-6 text-center text-muted-foreground">
          <p>© 2025 Portfolio. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
