import { Card } from "./ui/card";

interface ProjectCardProps {
  title: string;
  category: string;
  image: string;
  description: string;
  onClick?: () => void;
}

const ProjectCard = ({ title, category, image, description, onClick }: ProjectCardProps) => {
  return (
    <Card 
      onClick={onClick} 
      className="group overflow-hidden border-0 shadow-lg hover-lift cursor-pointer bg-card optimize-rendering"
      style={{ contain: 'layout' }}
    >
      <div className="relative aspect-square overflow-hidden">
        <img
          src={image}
          alt={`${title} - ${category}`}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 will-change-transform"
          loading="eager"
          decoding="sync"
          width="600"
          height="600"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3 sm:p-6">
          <div className="text-primary-foreground">
            <p className="text-xs sm:text-sm font-medium mb-1">{category}</p>
            <p className="text-xs sm:text-sm opacity-90 line-clamp-2">{description}</p>
          </div>
        </div>
      </div>
      <div className="p-3 sm:p-6">
        <span className="text-[10px] sm:text-xs font-medium text-primary mb-1 sm:mb-2 block">{category}</span>
        <h3 className="text-sm sm:text-xl font-semibold text-card-foreground min-h-[2.5rem] sm:min-h-[3.5rem] line-clamp-2">{title}</h3>
      </div>
    </Card>
  );
};

export default ProjectCard;
