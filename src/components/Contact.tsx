import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Mail, MessageSquare } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

const Contact = () => {
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
    <section id="contact" className="py-32">
      <div className="container mx-auto px-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12 animate-fade-up">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <MessageSquare className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Vamos Conversar?</h2>
            <p className="text-lg text-muted-foreground">
              Tem um projeto em mente? Entre em contato e vamos criar algo incrível juntos.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 animate-scale-in">
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
        </div>
      </div>
    </section>
  );
};

export default Contact;
