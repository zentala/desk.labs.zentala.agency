type Props = {
  baseSrc: string;
  hoverSrc?: string;
  alt: string;
  caption?: string;
};

export default function FigureSwap({ baseSrc, hoverSrc, alt, caption }: Props) {
  return <figure className="group"><div className="relative overflow-hidden rounded-2xl border border-line bg-surface"><img src={baseSrc} alt={alt} className="aspect-[4/3] h-full w-full object-cover" />{hoverSrc && <img src={hoverSrc} alt="" aria-hidden="true" className="absolute inset-0 aspect-[4/3] h-full w-full object-cover opacity-0 transition group-hover:opacity-100" />}</div>{caption && <figcaption className="mt-3 text-sm leading-6 text-ink-muted">{caption}</figcaption>}</figure>;
}
