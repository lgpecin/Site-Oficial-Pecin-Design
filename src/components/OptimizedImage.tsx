// FASE 2: Component para imagens otimizadas com WebP e fallback
interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  loading?: "lazy" | "eager";
  fetchPriority?: "high" | "low" | "auto";
  onClick?: () => void;
}

export const OptimizedImage = ({
  src,
  alt,
  className,
  width,
  height,
  loading = "lazy",
  fetchPriority = "auto",
  onClick,
}: OptimizedImageProps) => {
  // Convert to WebP if it's a PNG/JPG
  const webpSrc = src.replace(/\.(png|jpg|jpeg)$/i, '.webp');
  const isExternal = src.startsWith('http');
  
  return (
    <picture>
      {!isExternal && (
        <source srcSet={webpSrc} type="image/webp" />
      )}
      <img
        src={src}
        alt={alt}
        className={className}
        width={width}
        height={height}
        loading={loading}
        fetchPriority={fetchPriority}
        decoding="async"
        onClick={onClick}
      />
    </picture>
  );
};
