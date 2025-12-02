import { Link } from "react-router-dom";
import { Settings } from "lucide-react";

const FloatingAdminButton = () => {
  return (
    <Link
      to="/admin"
      className="fixed bottom-6 left-6 z-50 transition-all duration-300 hover:scale-110 group"
      aria-label="Painel Administrativo"
    >
      <div className="relative">
        <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center shadow-2xl border-2 border-primary/20">
          <Settings className="h-8 w-8 text-primary-foreground animate-spin-slow group-hover:rotate-180 transition-transform duration-500" />
        </div>
        {/* Pulsing ring effect */}
        <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
      </div>
    </Link>
  );
};

export default FloatingAdminButton;
