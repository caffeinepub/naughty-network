import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "motion/react";
import { useMemo } from "react";
import HeroSection from "../components/HeroSection";
import ShowRow from "../components/ShowRow";
import { useAllShows, useFeaturedShow } from "../hooks/useQueries";

export default function HomePage() {
  const { data: shows = [], isLoading: showsLoading } = useAllShows(true);
  const { data: featuredShow, isLoading: featuredLoading } = useFeaturedShow();

  const heroShow =
    featuredShow ?? shows.find((s) => s.isFeatured) ?? shows[0] ?? null;

  const rows = useMemo(() => {
    const shuffled = [...shows];
    return {
      trending: shuffled.slice(0, Math.min(8, shuffled.length)),
      newEpisodes: [...shuffled]
        .reverse()
        .slice(0, Math.min(8, shuffled.length)),
      popular: shuffled.filter((_, i) => i % 2 === 0).slice(0, 8),
      recommended: shuffled.filter((_, i) => i % 3 !== 0).slice(0, 8),
      continueWatching: shuffled.slice(0, Math.min(4, shuffled.length)),
    };
  }, [shows]);

  const isLoading = showsLoading && featuredLoading;

  return (
    <main className="min-h-screen" data-ocid="home.page">
      {/* Hero */}
      {isLoading ? (
        <div
          className="w-full h-[90vh] min-h-[500px]"
          data-ocid="home.loading_state"
        >
          <Skeleton className="w-full h-full" />
        </div>
      ) : heroShow ? (
        <HeroSection show={heroShow} />
      ) : (
        <div
          className="relative w-full h-[90vh] min-h-[500px] overflow-hidden flex items-center justify-center bg-black"
          data-ocid="home.empty_state"
        >
          {/* Subtle grid overlay */}
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
              backgroundSize: "80px 80px",
            }}
          />
          {/* Radial glow */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_50%,rgba(220,38,38,0.08),transparent)]" />
          {/* Bottom fade */}
          <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent" />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative z-10 text-center px-4"
          >
            <p className="text-xs font-bold uppercase tracking-[0.4em] text-primary mb-6 opacity-80">
              Naughty Network
            </p>
            <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tight text-white leading-none mb-6">
              Content
              <br />
              <span className="text-white/30">Coming Soon</span>
            </h1>
            <p className="text-white/50 text-sm md:text-base max-w-sm mx-auto leading-relaxed">
              Exclusive series and episodic content is on its way.
              <br />
              Stay tuned.
            </p>
          </motion.div>
        </div>
      )}

      {/* Rows */}
      {shows.length > 0 && (
        <section className="relative z-10 -mt-24 pb-8" data-ocid="home.section">
          <ShowRow title="🔥 Trending Shows" shows={rows.trending} />
          <ShowRow title="🆕 New Episodes" shows={rows.newEpisodes} />
          <ShowRow title="⭐ Popular Series" shows={rows.popular} />
          <ShowRow title="💡 Recommended For You" shows={rows.recommended} />
          <ShowRow title="▶️ Continue Watching" shows={rows.continueWatching} />
        </section>
      )}
    </main>
  );
}
