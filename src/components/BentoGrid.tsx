import bento1 from "@/assets/bento1.jpg";
import bento2 from "@/assets/bento2.jpg";
import bento3 from "@/assets/bento3.jpg";
import bento4 from "@/assets/bento4.jpg";
import bento5 from "@/assets/bento5.jpg";
import bento6 from "@/assets/bento6.jpg";

const BentoGrid = () => {
  const bentoItems = [
    {
      image: bento1,
      title: "Design 1",
      span: "md:col-span-2 md:row-span-2",
    },
    {
      image: bento2,
      title: "Design 2",
      span: "md:col-span-2 md:row-span-1",
    },
    {
      image: bento3,
      title: "Design 3",
      span: "md:col-span-1 md:row-span-2",
    },
    {
      image: bento4,
      title: "Design 4",
      span: "md:col-span-1 md:row-span-1",
    },
    {
      image: bento5,
      title: "Design 5",
      span: "md:col-span-2 md:row-span-1",
    },
    {
      image: bento6,
      title: "Design 6",
      span: "md:col-span-1 md:row-span-1",
    },
  ];

  return (
    <section className="py-32 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16 animate-fade-up">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Galeria de Projetos
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Uma coleção visual dos meus trabalhos mais criativos
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-7xl mx-auto auto-rows-[200px]">
          {bentoItems.map((item, index) => (
            <div
              key={index}
              className={`group relative overflow-hidden rounded-2xl ${item.span} animate-fade-up cursor-pointer`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BentoGrid;
