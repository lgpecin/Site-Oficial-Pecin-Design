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
    <Card onClick={onClick} className="group overflow-hidden border-0 shadow-lg hover-lift cursor-pointer bg-card">
      <div className="relative aspect-square overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
          <div className="text-primary-foreground">
            <p className="text-sm font-medium mb-1">{category}</p>
            <p className="text-sm opacity-90">{description}</p>
          </div>
        </div>
      </div>
      <div className="p-6">
        <span className="text-xs font-medium text-primary mb-2 block">{category}</span>
        <h3 className="text-xl font-semibold text-card-foreground">{title}</h3>
      </div>
    </Card>
  );
};

export default ProjectCard;
