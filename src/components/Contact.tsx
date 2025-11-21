import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Mail, MessageSquare } from "lucide-react";
import whatsappLogo from "@/assets/whatsapp-logo.png";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { useInView } from "@/hooks/use-in-view";
import { TypewriterText } from "./TypewriterText";
import { AnimatedSection } from "./AnimatedSection";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const Contact = () => {
  const { ref, isInView } = useInView({ threshold: 0.1, triggerOnce: true });
  const { settings } = useSiteSettings();
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Mensagem enviada!",
      description: "Obrigado pelo contato. Responderei em breve!",
    });
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <section id="contact" className="py-16">
      <div className="container mx-auto px-6">
        <div className="max-w-2xl mx-auto">
          <div ref={ref} className="text-center mb-12">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <MessageSquare className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 min-h-[3rem]">
              <TypewriterText text="Vamos Conversar?" isInView={isInView} speed={70} />
            </h2>
            <p className="text-lg text-muted-foreground">
              Tem um projeto em mente? Entre em contato por e-mail ou WhatsApp.
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-4 mb-8 animate-fade-up items-center justify-center">
            <Button 
              size="lg"
              onClick={() => window.open(`https://wa.me/${settings.whatsapp_number}?text=${encodeURIComponent(settings.whatsapp_message)}`, '_blank')}
            >
              <img src={whatsappLogo} alt="WhatsApp" className="mr-2 w-5 h-5 object-contain" />
              Chamar no WhatsApp
            </Button>
            <div className="text-center text-muted-foreground py-4 md:py-0 md:flex md:items-center">
              ou
            </div>
            <div className="flex items-center justify-center text-muted-foreground font-medium">
              Envie um e-mail
            </div>
          </div>

          <AnimatedSection>
            <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Input
                placeholder="Seu nome"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="h-12"
              />
            </div>
            <div>
              <Input
                type="email"
                placeholder="Seu e-mail"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="h-12"
              />
            </div>
            <div>
              <Textarea
                placeholder="Sua mensagem"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required
                className="min-h-[150px] resize-none"
              />
            </div>
              <Button type="submit" size="lg" className="w-full">
                <Mail className="mr-2 h-4 w-4" />
                Enviar Mensagem
              </Button>
            </form>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
};

export default Contact;
