import { useNavigate } from "@tanstack/react-router";
import { Info, Play } from "lucide-react";
import { motion } from "motion/react";
import type { Show } from "../backend";

interface HeroSectionProps {
  show: Show;
}

export default function HeroSection({ show }: HeroSectionProps) {
  const navigate = useNavigate();
  const thumbnailUrl =
    show.thumbnailUrl ||
    `https://picsum.photos/seed/${encodeURIComponent(show.title)}/1280/720`;

  return (
    <div className="relative w-full h-[90vh] min-h-[500px] overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={thumbnailUrl}
          alt={show.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-transparent to-transparent" />
      </div>

      <div className="relative z-10 flex flex-col justify-end h-full max-w-screen-2xl mx-auto px-4 md:px-16 pb-24 md:pb-32">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="max-w-xl"
        >
          <span className="inline-block px-2 py-0.5 text-xs font-bold uppercase tracking-widest bg-primary text-primary-foreground rounded mb-4">
            {show.genre}
          </span>
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tight leading-none mb-4 text-white">
            {show.title}
          </h1>
          <p className="text-sm md:text-base text-white/80 leading-relaxed mb-8 line-clamp-3">
            {show.description}
          </p>
          <div className="flex gap-3 flex-wrap">
            <button
              type="button"
              onClick={() =>
                navigate({
                  to: "/show/$id",
                  params: { id: show.id.toString() },
                })
              }
              className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-bold rounded hover:bg-primary/90 transition-colors text-sm"
              data-ocid="hero.watch_button"
            >
              <Play size={16} fill="currentColor" /> Watch Now
            </button>
            <button
              type="button"
              onClick={() =>
                navigate({
                  to: "/show/$id",
                  params: { id: show.id.toString() },
                })
              }
              className="flex items-center gap-2 px-6 py-3 bg-white/20 text-white font-bold rounded hover:bg-white/30 transition-colors backdrop-blur-sm text-sm border border-white/20"
              data-ocid="hero.info_button"
            >
              <Info size={16} /> More Info
            </button>
          </div>
        </motion.div>
      </div>

      <div className="absolute right-8 bottom-24 md:bottom-32 flex items-center gap-2">
        <span className="px-2 py-1 border border-white/60 text-white/60 text-xs font-bold tracking-widest">
          TV-MA
        </span>
      </div>
    </div>
  );
}
