import { Card } from "./ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./ui/carousel";
import Autoplay from "embla-carousel-autoplay";

interface FeaturedProject {
  title: string;
  category: string;
  bannerImage: string;
  description: string;
}

interface FeaturedProjectsProps {
  projects: FeaturedProject[];
  onProjectClick?: (index: number) => void;
}

const FeaturedProjects = ({ projects, onProjectClick }: FeaturedProjectsProps) => {
  return (
    <section className="py-12 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12 animate-fade-up">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">A prova do que eu faço:</h2>
          <p className="text-muted-foreground">
            Aqui estão algums projetos que mostram como transformei desafios de marca em soluções visuais estratégicas.
          </p>
        </div>

        {/* Grid para mobile e tablet */}
        <div className="grid grid-cols-2 gap-3 md:hidden mb-8">
          {projects.map((project, index) => (
            <Card 
              key={index}
              className="overflow-hidden border-0 shadow-lg cursor-pointer transition-transform hover:scale-[1.02]"
              onClick={() => onProjectClick?.(index)}
            >
              <div className="relative h-[200px]">
                <img
                  src={project.bannerImage}
                  alt={project.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/50 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <span className="inline-block px-2 py-1 bg-primary/90 text-primary-foreground rounded-full text-xs font-medium mb-2">
                    {project.category}
                  </span>
                  <h3 className="text-sm font-bold mb-1 line-clamp-2">
                    {project.title}
                  </h3>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Carousel para desktop */}
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          plugins={[
            Autoplay({
              delay: 5000,
            }),
          ]}
          className="w-full max-w-6xl mx-auto hidden md:block"
        >
          <CarouselContent>
            {projects.map((project, index) => (
              <CarouselItem key={index}>
                <Card 
                  className="overflow-hidden border-0 shadow-lg cursor-pointer transition-transform hover:scale-[1.02]"
                  onClick={() => onProjectClick?.(index)}
                >
                  <div className="relative h-[400px] md:h-[500px] lg:h-[600px]">
                    <img
                      src={project.bannerImage}
                      alt={project.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/50 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
                      <span className="inline-block px-4 py-2 bg-primary/90 text-primary-foreground rounded-full text-sm font-medium mb-4">
                        {project.category}
                      </span>
                      <h3 className="text-3xl md:text-5xl font-bold mb-4">
                        {project.title}
                      </h3>
                      <p className="text-lg text-muted-foreground max-w-2xl">
                        {project.description}
                      </p>
                    </div>
                  </div>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-4" />
          <CarouselNext className="right-4" />
        </Carousel>
      </div>
    </section>
  );
};

export default FeaturedProjects;
