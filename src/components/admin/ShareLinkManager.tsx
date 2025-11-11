import { Service } from "./ServicesSection";

interface ShareLinkManagerProps {
  services: Service[];
}

const ShareLinkManager = ({ services }: ShareLinkManagerProps) => {
  return (
    <div className="space-y-4">
      <p className="text-muted-foreground">
        Gerenciamento de links compartilháveis para serviços
      </p>
      {/* Conteúdo existente do gerenciador de serviços */}
    </div>
  );
};

export default ShareLinkManager;
