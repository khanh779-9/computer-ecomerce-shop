export interface ArtProps {
  type?: string;
  tint?: string;
  src?: string;
  alt?: string;
  className?: string;
}

export function Art({ type = "laptop", tint: _tint, src, alt, className }: ArtProps) {
  const imgSrc =
    src ||
    (type && (type.startsWith("/") || type.startsWith("http"))
      ? type
      : `/images/products/${type || "laptop"}.svg`);

  return (
    <img
      src={imgSrc}
      alt={alt || `${type} image`}
      className={className || "h-full w-full object-contain filter drop-shadow-xs transition-transform duration-300"}
      loading="lazy"
      onError={(e) => {
        const target = e.currentTarget;
        if (!target.src.endsWith("/images/products/laptop.svg")) {
          target.src = "/images/products/laptop.svg";
        }
      }}
    />
  );
}
