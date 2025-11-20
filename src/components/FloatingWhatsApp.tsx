import { useState, useEffect } from "react";
import whatsappLogo from "@/assets/whatsapp-logo.png";
const FloatingWhatsApp = () => {
  const [isVisible, setIsVisible] = useState(true);
  useEffect(() => {
    const handleScroll = () => {
      const contactSection = document.getElementById("contact");
      if (contactSection) {
        const rect = contactSection.getBoundingClientRect();
        const isInContactSection = rect.top <= window.innerHeight && rect.bottom >= 0;
        setIsVisible(!isInContactSection);
      }
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Check initial position

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  return <a href="https://wa.me/5511999999999?text=Olá! Vim através do seu portfólio." target="_blank" rel="noopener noreferrer" className={`fixed bottom-6 right-6 z-50 transition-all duration-300 hover:scale-110 ${isVisible ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`} aria-label="Fale no WhatsApp">
      <img src={whatsappLogo} alt="WhatsApp" className="w-32 h-32 object-contain drop-shadow-2xl" />
    </a>;
};
export default FloatingWhatsApp;