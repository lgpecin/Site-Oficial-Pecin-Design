import { Link } from "react-router-dom";
import { Settings } from "lucide-react";

const FloatingAdminButton = () => {
  return (
    <Link
      to="/admin"
      className="fixed bottom-6 left-6 z-50 transition-transform duration-200 ease-out md:hover:scale-110 active:scale-[0.97] group"
      aria-label="Painel Administrativo"
    >
      <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center shadow-2xl border-2 border-primary/20">
        <Settings className="h-8 w-8 text-primary-foreground group-hover:rotate-180 transition-transform duration-300 ease-out" />
      </div>
    </Link>

  );
};

export default FloatingAdminButton;
