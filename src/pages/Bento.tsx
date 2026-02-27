import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import logo from "@/assets/logo.png";
import whatsappLogo from "@/assets/whatsapp-logo.png";
import profilePhoto from "/lovable-uploads/4fe5d4dc-16c5-44e5-b939-02a046d020cc.png";
import placeholderProject from "@/assets/placeholder-project.jpg";
import { Instagram, Linkedin, Mail, ArrowRight, MapPin, ExternalLink } from "lucide-react";
import BehanceIcon from "@/components/icons/BehanceIcon";
import { Link } from "react-router-dom";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface BentoProject {
  id: string;
  title: string;
  category: string;
  banner_image: string | null;
}

const BentoImage = ({ src, alt, className }: { src: string; alt: string; className?: string }) => {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="relative w-full h-full">
      {!loaded && <Skeleton className="absolute inset-0 rounded-none" />}
      <img
        src={src}
        alt={alt}
        className={`${className ?? ""} transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
        onLoad={() => setLoaded(true)}
        loading="eager"
        decoding="sync"
      />
    </div>
  );
};

const BentoSkeleton = () => (
  <div className="min-h-screen bg-background flex items-center justify-center p-2 sm:p-6 md:p-8">
    <div className="w-full max-w-5xl">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 auto-rows-[minmax(70px,1fr)] sm:auto-rows-[minmax(120px,1fr)]">
        <Skeleton className="col-span-2 row-span-1 rounded-2xl h-[120px]" />
        <Skeleton className="col-span-2 row-span-2 rounded-2xl" />
        <Skeleton className="col-span-1 row-span-1 rounded-2xl" />
        <Skeleton className="col-span-1 row-span-1 rounded-2xl" />
        <Skeleton className="col-span-1 row-span-1 rounded-2xl" />
        <Skeleton className="col-span-1 row-span-1 rounded-2xl" />
        <Skeleton className="col-span-1 row-span-1 rounded-2xl" />
        <Skeleton className="col-span-1 row-span-1 rounded-2xl" />
        <Skeleton className="col-span-1 row-span-1 rounded-2xl" />
        <Skeleton className="col-span-1 row-span-1 rounded-2xl" />
        <Skeleton className="col-span-1 row-span-1 rounded-2xl" />
        <Skeleton className="col-span-1 row-span-1 rounded-2xl" />
      </div>
    </div>
  </div>
);

const Bento = () => {
  const { settings, loading: settingsLoading } = useSiteSettings();

  const { data: projects = [], isLoading: projectsLoading } = useQuery({
    queryKey: ["bento-projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("id, title, category, banner_image")
        .order("display_order", { ascending: true })
        .limit(6);
      if (error) throw error;
      return (data || []) as BentoProject[];
    },
    staleTime: 2 * 60 * 1000,
  });

  const isLoading = settingsLoading || projectsLoading;

  if (isLoading) return <BentoSkeleton />;

  const waUrl = `https://wa.me/${settings.whatsapp_number}?text=${encodeURIComponent(settings.whatsapp_message)}`;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-2 sm:p-6 md:p-8">
      <div className="w-full max-w-5xl">
        {/* Bento Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 auto-rows-[minmax(70px,1fr)] sm:auto-rows-[minmax(120px,1fr)]">

          {/* Logo + Info — spans 2 cols, 1 row */}
          <div
            className="col-span-2 row-span-1 bg-card rounded-2xl p-3 sm:p-6 flex flex-col items-center justify-center gap-1 sm:gap-2 border border-border"
          >
            <img src={logo} alt="Pecin Design" className="h-10 sm:h-20 w-auto" />
            <p className="text-[10px] sm:text-sm text-muted-foreground text-center">Designer Gráfico & Diretor de Arte</p>
            <p className="text-[10px] sm:text-sm text-muted-foreground flex items-center gap-1">
              <MapPin className="w-3 h-3" /> Maringá/PR
            </p>
          </div>

          {/* Photo — 2 cols, 2 rows */}
          <div className="col-span-2 row-span-2 rounded-2xl overflow-hidden relative group">
            <BentoImage
              src={profilePhoto}
              alt="Léo - Designer"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[0.92] group-hover:rounded-2xl"
            />
          </div>

          {/* WhatsApp CTA */}
          <button
            onClick={() => window.open(waUrl, "_blank", "noopener,noreferrer")}
            className="col-span-1 row-span-1 bg-primary/10 hover:bg-primary/20 border border-primary/20 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all duration-300 group p-3 cursor-pointer"
          >
            <img src={whatsappLogo} alt="WhatsApp" className="w-10 h-10 sm:w-12 sm:h-12 object-contain group-hover:scale-110 transition-transform" />
            <span className="text-xs sm:text-sm font-medium text-primary">WhatsApp</span>
          </button>

          {/* Email */}
          <a
            href={`mailto:${settings.site_email}`}
            className="col-span-1 row-span-1 bg-card border border-border hover:border-primary/40 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all duration-300 group p-3"
          >
            <Mail className="w-8 h-8 sm:w-10 sm:h-10 text-muted-foreground group-hover:text-primary transition-colors" />
            <span className="text-xs sm:text-sm text-muted-foreground group-hover:text-foreground transition-colors truncate max-w-full px-1">
              E-mail
            </span>
          </a>

          {/* Projects grid — 4 cols, 2 rows on sm+, 2 cols on mobile */}
          {projects.slice(0, 4).map((project) => (
            <Link
              key={project.id}
              to={`/?project=${project.id}#projects`}
              className="col-span-1 row-span-1 rounded-2xl overflow-hidden border border-border relative group cursor-pointer"
            >
              <BentoImage
                src={project.banner_image || placeholderProject}
                alt={project.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-2">
                <p className="text-xs sm:text-sm font-semibold text-center leading-tight">{project.title}</p>
                <span className="text-[10px] sm:text-xs text-primary mt-1">{project.category}</span>
              </div>
            </Link>
          ))}

          {/* Social links row */}
          <a
            href={settings.instagram_url}
            target="_blank"
            rel="noopener noreferrer"
            className="col-span-1 row-span-1 bg-card border border-border hover:border-pink-500/40 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all duration-300 group p-3"
          >
            <Instagram className="w-7 h-7 sm:w-8 sm:h-8 text-muted-foreground group-hover:text-pink-500 transition-colors" />
            <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">Instagram</span>
          </a>

          <a
            href={settings.linkedin_url}
            target="_blank"
            rel="noopener noreferrer"
            className="col-span-1 row-span-1 bg-card border border-border hover:border-blue-500/40 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all duration-300 group p-3"
          >
            <Linkedin className="w-7 h-7 sm:w-8 sm:h-8 text-muted-foreground group-hover:text-blue-600 transition-colors" />
            <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">LinkedIn</span>
          </a>

          {/* Behance — Ver portfólio */}
          <a
            href={settings.behance_url}
            target="_blank"
            rel="noopener noreferrer"
            className="col-span-1 row-span-1 bg-primary/10 hover:bg-primary/20 border border-primary/20 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all duration-300 group p-3"
          >
            <BehanceIcon className="w-7 h-7 sm:w-8 sm:h-8 text-primary group-hover:scale-110 transition-transform" />
            <span className="text-xs font-medium text-primary">Ver portfólio</span>
          </a>

          {/* Ver site */}
          <Link
            to="/"
            className="col-span-1 row-span-1 bg-primary/10 hover:bg-primary/20 border border-primary/20 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all duration-300 group p-3"
          >
            <ExternalLink className="w-7 h-7 sm:w-8 sm:h-8 text-primary group-hover:scale-110 transition-transform" />
            <span className="text-xs font-medium text-primary">Ver site</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Bento;
