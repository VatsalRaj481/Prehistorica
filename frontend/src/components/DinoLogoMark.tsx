interface DinoLogoMarkProps {
  className?: string;
  alt?: string;
}

export default function DinoLogoMark({ className = "h-7 w-7", alt = "Prehistorica Museum Crest" }: DinoLogoMarkProps) {
  return (
    <img
      src="/logo.png"
      alt={alt}
      className={`object-contain select-none shrink-0 ${className}`}
      draggable={false}
    />
  );
}
