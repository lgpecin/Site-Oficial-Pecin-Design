import { useState } from "react";
import { Card } from "./ui/card";
import { Skeleton } from "./ui/skeleton";

interface ProjectCardProps {
  title: string;
  category: string;
  image: string;
  description: string;
  onClick?: () => void;
}

const ProjectCard = ({ title, category, image, description, onClick }: ProjectCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const rotations = [-2, 1.5, -1.2, 2, -1.8, 1.3];
  const rot = rotations[(title.charCodeAt(0) + title.length) % rotations.length];

  return (
    <Card 
      onClick={onClick} 
      style={{ ["--card-rot" as any]: `${rot}deg`, contain: 'layout' }}
      className="project-card group overflow-hidden border-2 border-transparent shadow-lg cursor-pointer bg-card optimize-rendering active:scale-[0.99] origin-center transition-[transform,border-color,box-shadow] duration-300 ease-out hover:border-primary hover:shadow-[0_0_0_1px_hsl(var(--primary)/0.4),0_10px_30px_-10px_hsl(var(--primary)/0.35)]"
    >
      <div className="relative aspect-square overflow-hidden">
        {!imageLoaded && (
          <Skeleton className="absolute inset-0 w-full h-full rounded-none" />
        )}
        <img
          src={image}
          alt={`${title} - ${category}`}
          className={`w-full h-full object-cover transition-[transform,opacity] duration-500 ease-out md:group-hover:scale-105 will-change-transform ${!imageLoaded ? 'opacity-0 scale-105' : 'opacity-100 scale-100'}`}
          loading="lazy"
          decoding="async"
          width="600"
          height="600"
          onLoad={() => setImageLoaded(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-out flex items-end p-3 sm:p-6">
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
