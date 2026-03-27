import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Language = "pt" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Detect if user is likely Brazilian
const detectLanguage = (): Language => {
  // Check localStorage first
  const saved = localStorage.getItem("preferred-language");
  if (saved === "pt" || saved === "en") return saved;

  // Check browser language
  const browserLang = navigator.language || (navigator as any).userLanguage || "";
  if (browserLang.startsWith("pt")) return "pt";

  // Check timezone for Brazil
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz?.startsWith("America/Sao_Paulo") || tz?.startsWith("America/Fortaleza") || 
        tz?.startsWith("America/Recife") || tz?.startsWith("America/Bahia") ||
        tz?.startsWith("America/Belem") || tz?.startsWith("America/Manaus") ||
        tz?.startsWith("America/Cuiaba") || tz?.startsWith("America/Porto_Velho") ||
        tz?.startsWith("America/Rio_Branco") || tz?.startsWith("America/Noronha") ||
        tz?.startsWith("America/Maceio") || tz?.startsWith("America/Araguaina")) {
      return "pt";
    }
  } catch {}

  return "en";
};

const translations: Record<Language, Record<string, string>> = {
  pt: {
    // Navigation
    "nav.projects": "Projetos",
    "nav.about": "Sobre",
    "nav.contact": "Contato",

    // Hero
    "hero.title_line1": "Bora tornar seu projeto",
    "hero.title_line2": "em algo",
    "hero.word1": "único?",
    "hero.word2": "transformador?",
    "hero.word3": "poderoso?",
    "hero.word4": "animal?",
    "hero.subtitle": "Aqui é simples: eu gosto de canalizar todo o caos criativo em visuais lindos e estratégicos.",
    "hero.cta_whatsapp": "Vamos conversar!",
    "hero.cta_projects": "Se liga no meu trampo",

    // Projects
    "projects.title": "Um pouquinho do que eu faço.",
    "projects.subtitle": "Esqueça os templates prontos. Aqui só entra suor, neurônios queimados e estratégias visuais que funcionam pra valer! Se liga:",
    "projects.filter_all": "Todos",
    "projects.loading": "Carregando projetos...",
    "projects.empty": "Nenhum projeto disponível nesta categoria.",
    "projects.about_project": "Sobre o Projeto",
    "projects.software_used": "Softwares Utilizados",
    "projects.notes": "Observações e Autoria",
    "projects.detail": "Detalhe",

    // About
    "about.title": "E quem sou eu?",
    "about.skill1_title": "Design Criativo",
    "about.skill1_desc": "Criação de identidades visuais únicas que contam histórias",
    "about.skill2_title": "UI/UX Design",
    "about.skill2_desc": "Interfaces intuitivas focadas na experiência do usuário",
    "about.skill3_title": "Estratégia Visual",
    "about.skill3_desc": "Soluções de design alinhadas aos objetivos do negócio",
    "about.skill4_title": "Branding",
    "about.skill4_desc": "Desenvolvimento completo\nde marcas com propósito\ne personalidade",
    "about.bio": "Eu me chamo Léo, sou de Maringá (PR), tenho 22 anos e já atuo na área há mais de seis anos. Desde que me entendo por gente, busco olhar para as coisas com um viés artístico e peguei gosto em desenhar, rabiscar, escrever, criar... me encontrei no design e me apaixonei em dar vidas aos mais diversos projetos.",

    // Service Steps
    "steps.title": "Como é trabalhar comigo?",
    "steps.subtitle": "É suuuuper importante que todas etapas sejam bem claras. Então, quando você entra em contato comigo para desenrolarmos um projeto, é isso que acontece:",
    "steps.step": "Etapa",
    "steps.step1_title": "Reunião",
    "steps.step1_desc": "Conversamos sobre suas necessidades, objetivos e visão para o projeto. É o momento de alinhar expectativas e entender o que você precisa.",
    "steps.step1_duration": "30-60 min",
    "steps.step2_title": "Briefing",
    "steps.step2_desc": "Recebo todas as informações detalhadas do projeto: público-alvo, referências visuais, materiais existentes e requisitos específicos.",
    "steps.step2_duration": "1-2 dias",
    "steps.step3_title": "Contrato",
    "steps.step3_desc": "Formalizamos nossa parceria com um contrato claro, definindo prazos, valores, entregas e termos de trabalho.",
    "steps.step3_duration": "1 dia",
    "steps.step4_title": "Apresentação",
    "steps.step4_desc": "Apresento as primeiras propostas criativas. Você terá a oportunidade de avaliar as direções visuais e dar seu feedback.",
    "steps.step4_duration": "5-7 dias",
    "steps.step5_title": "Validação",
    "steps.step5_desc": "Refinamos o projeto com base no seu feedback. Fazemos os ajustes necessários até que tudo esteja perfeito.",
    "steps.step5_duration": "3-5 dias",
    "steps.step6_title": "Entrega Final",
    "steps.step6_desc": "Você recebe todos os arquivos finais nos formatos adequados, prontos para uso. Inclui manual de aplicação quando necessário.",
    "steps.step6_duration": "1-2 dias",
    "steps.disclaimer": "O cronograma de trabalho e entrega pode variar e é definido com precisão conforme a definição do escopo do projeto durante a fase de briefing e contrato.",
    "steps.disclaimer_label": "Observação:",

    // FAQ
    "faq.title": "Ficou com alguma dúvida?",
    "faq.footer": "Caso tenha ficado com alguma outra dúvida, pode sempre me dar um alô pra gente conversar sobre!",
    "faq.q1": "Quais serviços de design podemos desenvolver?",
    "faq.a1_intro": "Trabalho com bastante coisa mesmo! A gente sempre pode conversar sobre projetos mais diferentes, mas geralmente, o que costumo desenvolver são os itens abaixo:",
    "faq.q2": "Qual é o prazo médio de entrega dos projetos?",
    "faq.a2": "O prazo varia de acordo com a complexidade e escopo do projeto. Em média, projetos de identidade visual levam de 2 a 4 semanas, enquanto designs de apps e websites podem levar de 4 a 8 semanas. Sempre discuto os prazos no início do projeto para garantir alinhamento com suas expectativas.",
    "faq.q3": "Você oferece revisões no projeto?",
    "faq.a3": "Sim! Cada projeto inclui rodadas de revisão para garantir sua total satisfação. O número de revisões varia de acordo com o pacote escolhido, mas geralmente incluo de 2 a 3 rodadas de ajustes. Revisões adicionais podem ser solicitadas conforme necessário.",
    "faq.q4": "Quais formatos de arquivo são entregues?",
    "faq.a4": "Entrego todos os arquivos necessários para uso imediato e futuro. Para identidade visual, você recebe arquivos editáveis (AI, PSD) e formatos finais (PNG, JPG, SVG, PDF). Para projetos web/app, entrego protótipos navegáveis e arquivos de design completos no Figma ou Adobe XD.",
    "faq.q5": "Você trabalha com clientes remotos?",
    "faq.a5": "Absolutamente! Trabalho com clientes de todo o Brasil e do mundo através de videochamadas e ferramentas de colaboração online. A comunicação remota permite flexibilidade e eficiência, mantendo a qualidade do trabalho em todos os projetos.",
    "faq.q6": "Podemos marcar uma reunião para conversar sobre algum projeto?",
    "faq.a6": "É claro! Só me mandar uma mensagem e a gente encaixa a melhor data para ambos, para conversamos sobre ideias e projetos e também para me conhecer melhor. Se for de Maringá, dá até pra gente ir tomar um café enquanto conversamos sobre!",
    "faq.service1": "Social Media",
    "faq.service2": "Branding",
    "faq.service3": "Motion Design",
    "faq.service4": "Webdesign",
    "faq.service5": "Ativação de Marca",
    "faq.service6": "Criação de Ebooks",
    "faq.service7": "Planejamento Estratégico",
    "faq.service8": "Design de Produtos e Embalagens",

    // Contact
    "contact.title": "Vamos Conversar?",
    "contact.subtitle": "Tem um projeto em mente? Fale comigo por e-mail ou WhatsApp.",
    "contact.cta_whatsapp": "Chamar no WhatsApp",
    "contact.or": "ou",
    "contact.send_email": "Enviar um e-mail",
    "contact.name_placeholder": "Seu nome",
    "contact.email_placeholder": "Seu e-mail",
    "contact.message_placeholder": "Sua mensagem",
    "contact.send_button": "Enviar Mensagem",
    "contact.toast_title": "Mensagem enviada!",
    "contact.toast_desc": "Obrigado pelo contato. Responderei em breve!",

    // Social Media
    "social.title": "Me acompanhe pelas redes sociais",
    "social.subtitle": "Fique por dentro dos meus projetos e novidades",

    // Footer
    "footer.rights": "© 2025 Pecin Design. Todos os direitos reservados.",
    "footer.whatsapp": "Fale no WhatsApp",

    // Floating WhatsApp
    "floating.whatsapp": "Fale no WhatsApp",
  },
  en: {
    // Navigation
    "nav.projects": "Projects",
    "nav.about": "About",
    "nav.contact": "Contact",

    // Hero
    "hero.title_line1": "Let's turn your project",
    "hero.title_line2": "into something",
    "hero.word1": "unique?",
    "hero.word2": "transformative?",
    "hero.word3": "powerful?",
    "hero.word4": "amazing?",
    "hero.subtitle": "It's simple: I love channeling all creative chaos into beautiful and strategic visuals.",
    "hero.cta_whatsapp": "Let's talk!",
    "hero.cta_projects": "Check out my work",

    // Projects
    "projects.title": "A little of what I do.",
    "projects.subtitle": "Forget ready-made templates. Here you'll find sweat, burned neurons, and visual strategies that truly work! Check it out:",
    "projects.filter_all": "All",
    "projects.loading": "Loading projects...",
    "projects.empty": "No projects available in this category.",
    "projects.about_project": "About the Project",
    "projects.software_used": "Software Used",
    "projects.notes": "Notes & Credits",
    "projects.detail": "Detail",

    // About
    "about.title": "Who am I?",
    "about.skill1_title": "Creative Design",
    "about.skill1_desc": "Creating unique visual identities that tell stories",
    "about.skill2_title": "UI/UX Design",
    "about.skill2_desc": "Intuitive interfaces focused on user experience",
    "about.skill3_title": "Visual Strategy",
    "about.skill3_desc": "Design solutions aligned with business goals",
    "about.skill4_title": "Branding",
    "about.skill4_desc": "Complete brand development\nwith purpose\nand personality",
    "about.bio": "My name is Léo, I'm from Maringá (PR), Brazil. I'm 22 years old and have been working in design for over six years. For as long as I can remember, I've looked at things with an artistic eye — I fell in love with drawing, sketching, writing, creating... I found myself in design and became passionate about bringing all kinds of projects to life.",

    // Service Steps
    "steps.title": "What's it like working with me?",
    "steps.subtitle": "It's super important that every step is crystal clear. So when you reach out to start a project, here's what happens:",
    "steps.step": "Step",
    "steps.step1_title": "Meeting",
    "steps.step1_desc": "We talk about your needs, goals, and vision for the project. It's time to align expectations and understand what you need.",
    "steps.step1_duration": "30-60 min",
    "steps.step2_title": "Briefing",
    "steps.step2_desc": "I gather all the project details: target audience, visual references, existing materials, and specific requirements.",
    "steps.step2_duration": "1-2 days",
    "steps.step3_title": "Contract",
    "steps.step3_desc": "We formalize our partnership with a clear contract, defining deadlines, pricing, deliverables, and terms of work.",
    "steps.step3_duration": "1 day",
    "steps.step4_title": "Presentation",
    "steps.step4_desc": "I present the first creative proposals. You'll have the opportunity to evaluate the visual directions and give your feedback.",
    "steps.step4_duration": "5-7 days",
    "steps.step5_title": "Validation",
    "steps.step5_desc": "We refine the project based on your feedback. We make the necessary adjustments until everything is perfect.",
    "steps.step5_duration": "3-5 days",
    "steps.step6_title": "Final Delivery",
    "steps.step6_desc": "You receive all final files in the appropriate formats, ready to use. Includes an application manual when necessary.",
    "steps.step6_duration": "1-2 days",
    "steps.disclaimer": "The work and delivery timeline may vary and is precisely defined according to the project scope during the briefing and contract phase.",
    "steps.disclaimer_label": "Note:",

    // FAQ
    "faq.title": "Got any questions?",
    "faq.footer": "If you have any other questions, feel free to reach out and we can chat about it!",
    "faq.q1": "What design services can we develop?",
    "faq.a1_intro": "I work with quite a lot! We can always talk about different projects, but generally, here's what I usually develop:",
    "faq.q2": "What's the average project delivery time?",
    "faq.a2": "Timelines vary depending on the complexity and scope of the project. On average, visual identity projects take 2 to 4 weeks, while app and website designs can take 4 to 8 weeks. I always discuss deadlines at the start of the project to ensure alignment with your expectations.",
    "faq.q3": "Do you offer revisions on the project?",
    "faq.a3": "Yes! Each project includes revision rounds to ensure your full satisfaction. The number of revisions varies by the chosen package, but I generally include 2 to 3 rounds of adjustments. Additional revisions can be requested as needed.",
    "faq.q4": "What file formats are delivered?",
    "faq.a4": "I deliver all necessary files for immediate and future use. For visual identity, you receive editable files (AI, PSD) and final formats (PNG, JPG, SVG, PDF). For web/app projects, I deliver navigable prototypes and complete design files in Figma or Adobe XD.",
    "faq.q5": "Do you work with remote clients?",
    "faq.a5": "Absolutely! I work with clients from all over Brazil and the world through video calls and online collaboration tools. Remote communication allows flexibility and efficiency while maintaining work quality across all projects.",
    "faq.q6": "Can we schedule a meeting to discuss a project?",
    "faq.a6": "Of course! Just send me a message and we'll find the best date for both of us to discuss ideas and projects, and also to get to know me better.",
    "faq.service1": "Social Media",
    "faq.service2": "Branding",
    "faq.service3": "Motion Design",
    "faq.service4": "Web Design",
    "faq.service5": "Brand Activation",
    "faq.service6": "Ebook Creation",
    "faq.service7": "Strategic Planning",
    "faq.service8": "Product & Packaging Design",

    // Contact
    "contact.title": "Let's Talk?",
    "contact.subtitle": "Have a project in mind? Reach me by email or WhatsApp.",
    "contact.cta_whatsapp": "Chat on WhatsApp",
    "contact.or": "or",
    "contact.send_email": "Send an email",
    "contact.name_placeholder": "Your name",
    "contact.email_placeholder": "Your email",
    "contact.message_placeholder": "Your message",
    "contact.send_button": "Send Message",
    "contact.toast_title": "Message sent!",
    "contact.toast_desc": "Thanks for reaching out. I'll reply soon!",

    // Social Media
    "social.title": "Follow me on social media",
    "social.subtitle": "Stay updated on my projects and news",

    // Footer
    "footer.rights": "© 2025 Pecin Design. All rights reserved.",
    "footer.whatsapp": "Chat on WhatsApp",

    // Floating WhatsApp
    "floating.whatsapp": "Chat on WhatsApp",
  },
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(() => detectLanguage());

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("preferred-language", lang);
    document.documentElement.lang = lang;
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key] || translations.pt[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
};
