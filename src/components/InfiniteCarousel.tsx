import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSiteSettings } from "@/hooks/useSiteSettings";

interface CarouselImage {
  id: string;
  image_url: string;
  display_order: number;
}

// Fallback images from assets
import slide1 from "@/assets/carousel/slide-1.png";
import slide2 from "@/assets/carousel/slide-2.png";
import slide3 from "@/assets/carousel/slide-3.png";
import slide4 from "@/assets/carousel/slide-4.png";
import slide5 from "@/assets/carousel/slide-5.png";
import slide6 from "@/assets/carousel/slide-6.png";

const fallbackImages = [slide1, slide2, slide3, slide4, slide5, slide6];

const InfiniteCarousel = () => {
  const [images, setImages] = useState<string[]>([]);
  const { settings } = useSiteSettings();
  const speed = Number(settings.carousel_speed) || 15;

  useEffect(() => {
    const fetchImages = async () => {
      const { data, error } = await supabase
        .from("carousel_images")
        .select("*")
        .order("display_order", { ascending: true });

      if (error || !data || data.length === 0) {
        setImages(fallbackImages);
      } else {
        setImages(data.map((img: CarouselImage) => img.image_url));
      }
    };
    fetchImages();
  }, []);

  if (images.length === 0) return null;

  // Duplicate images twice for seamless loop (translate -50% to loop first half)
  const duplicated = [...images, ...images];
  const duration = images.length * speed;

  return (
    <section className="w-full overflow-hidden py-8">
      <div
        className="flex animate-marquee"
        style={{
          animationDuration: `${duration}s`,
        }}
      >
        {duplicated.map((src, i) => (
          <img
            key={i}
            src={src}
            alt={`Portfolio ${(i % images.length) + 1}`}
            className="h-[300px] sm:h-[400px] w-auto flex-shrink-0"
            loading="lazy"
            draggable={false}
          />
        ))}
      </div>
    </section>
  );
};

export default InfiniteCarousel;
