import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft, Check, Lock, Play, Plus, Star } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import type { Episode } from "../backend";
import AuthModal from "../components/AuthModal";
import EpisodeList from "../components/EpisodeList";
import ShowRow from "../components/ShowRow";
import VideoPlayer from "../components/VideoPlayer";
import { useAuth } from "../hooks/useAuth";
import {
  useAddToWatchlist,
  useAllShows,
  useEpisodesByShow,
  useRemoveFromWatchlist,
  useShow,
  useWatchlist,
} from "../hooks/useQueries";

export default function ShowPage() {
  const params = useParams({ strict: false });
  const id = params.id as string;
  const navigate = useNavigate();
  const showId = BigInt(id);
  const { isLoggedIn } = useAuth();

  const { data: show, isLoading: showLoading } = useShow(showId);
  const { data: episodes = [], isLoading: epsLoading } =
    useEpisodesByShow(showId);
  const { data: watchlist = [] } = useWatchlist();
  const { data: allShows = [] } = useAllShows(true);
  const addMutation = useAddToWatchlist();
  const removeMutation = useRemoveFromWatchlist();

  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const isInList = watchlist.some((wid) => wid === showId);
  const activeEpisode = selectedEpisode ?? episodes[0] ?? null;

  const posterUrl =
    show?.thumbnailUrl ||
    (show
      ? `https://picsum.photos/seed/${encodeURIComponent(show.title)}/1280/720`
      : undefined);

  const suggestedShows = allShows
    .filter((s) => s.id !== showId && (!show || s.genre === show.genre))
    .slice(0, 8);

  const handleWatchlist = () => {
    if (!isLoggedIn) return;
    if (isInList) {
      removeMutation.mutate(showId);
    } else {
      addMutation.mutate(showId);
    }
  };

  const handleEpisodeSelect = (episode: Episode) => {
    if (!isLoggedIn) {
      setAuthModalOpen(true);
      return;
    }
    setSelectedEpisode(episode);
  };

  const ratingNum = (showId % 20n) + 70n;
  const ratingDisplay = (Number(ratingNum) / 10).toFixed(1);

  if (showLoading) {
    return (
      <div
        className="min-h-screen pt-24 px-4 md:px-8 max-w-screen-2xl mx-auto"
        data-ocid="show.loading_state"
      >
        <Skeleton className="w-full aspect-video rounded-lg mb-6" />
        <Skeleton className="h-10 w-64 mb-4" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (!show) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        data-ocid="show.error_state"
      >
        <p className="text-muted-foreground">Show not found.</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen pt-20 pb-16" data-ocid="show.page">
      <div className="max-w-screen-xl mx-auto px-4 md:px-8">
        <button
          type="button"
          onClick={() => navigate({ to: "/" })}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
          data-ocid="show.back.button"
        >
          <ArrowLeft size={16} /> Back to Home
        </button>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Video player or locked overlay */}
              {isLoggedIn ? (
                <VideoPlayer
                  videoUrl={activeEpisode?.videoUrl || undefined}
                  posterUrl={posterUrl}
                  title={activeEpisode?.title}
                />
              ) : (
                <div
                  className="relative w-full aspect-video rounded-xl overflow-hidden group"
                  data-ocid="show.locked.canvas_target"
                >
                  {/* Blurred poster background */}
                  {posterUrl && (
                    <img
                      src={posterUrl}
                      alt={show.title}
                      className="absolute inset-0 w-full h-full object-cover scale-105"
                      style={{ filter: "blur(8px) brightness(0.35)" }}
                    />
                  )}
                  {/* Dark overlay */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.4) 100%)",
                    }}
                  />
                  {/* Lock content */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8">
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center"
                      style={{
                        background: "oklch(0.49 0.22 26 / 0.15)",
                        border: "2px solid oklch(0.49 0.22 26 / 0.5)",
                      }}
                    >
                      <Lock size={28} className="text-primary" />
                    </div>
                    <div className="text-center">
                      <p className="text-white font-bold text-lg mb-1">
                        Sign in to watch
                      </p>
                      <p className="text-white/60 text-sm">
                        Create a free account to start streaming
                      </p>
                    </div>
                    <Button
                      type="button"
                      onClick={() => setAuthModalOpen(true)}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6"
                      data-ocid="show.locked.open_modal_button"
                    >
                      <Play size={15} className="mr-2" />
                      Watch Now
                    </Button>
                  </div>
                  {/* Hover pulse */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    style={{ background: "oklch(0.49 0.22 26 / 0.04)" }}
                  />
                </div>
              )}

              <div className="mt-6">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-2">
                      {show.title}
                    </h1>
                    <div className="flex items-center gap-3 flex-wrap">
                      <Badge
                        variant="outline"
                        className="text-xs border-primary/50 text-primary"
                      >
                        {show.genre}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Star
                          size={13}
                          className="text-yellow-400 fill-yellow-400"
                        />
                        <span className="text-sm font-semibold text-yellow-400">
                          {ratingDisplay}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {episodes.length} episodes
                      </span>
                    </div>
                  </div>
                  {isLoggedIn && (
                    <button
                      type="button"
                      onClick={handleWatchlist}
                      className={`flex items-center gap-2 px-4 py-2 rounded text-sm font-semibold transition-colors ${
                        isInList
                          ? "bg-green-600/20 text-green-400 border border-green-600/40 hover:bg-red-600/20 hover:text-red-400 hover:border-red-600/40"
                          : "bg-white/10 text-foreground border border-white/20 hover:bg-primary hover:text-primary-foreground hover:border-primary"
                      }`}
                      data-ocid="show.watchlist.button"
                    >
                      {isInList ? (
                        <>
                          <Check size={15} /> In My List
                        </>
                      ) : (
                        <>
                          <Plus size={15} /> Add to My List
                        </>
                      )}
                    </button>
                  )}
                </div>

                <p className="mt-4 text-muted-foreground leading-relaxed">
                  {show.description}
                </p>
              </div>
            </motion.div>
          </div>

          <div className="xl:col-span-1">
            <h2 className="text-lg font-semibold mb-4">Episodes</h2>
            <EpisodeList
              episodes={episodes}
              isLoading={epsLoading}
              onSelectEpisode={handleEpisodeSelect}
              selectedEpisodeId={activeEpisode?.id}
            />
          </div>
        </div>

        {suggestedShows.length > 0 && (
          <div className="mt-12">
            <ShowRow title="More Like This" shows={suggestedShows} />
          </div>
        )}
      </div>

      {/* Auth modal for locked content */}
      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </main>
  );
}
