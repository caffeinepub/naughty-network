import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft, Check, Plus, Star } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import type { Episode } from "../backend";
import EpisodeList from "../components/EpisodeList";
import ShowRow from "../components/ShowRow";
import VideoPlayer from "../components/VideoPlayer";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAddToWatchlist,
  useAllShows,
  useEpisodesByShow,
  useRemoveFromWatchlist,
  useShow,
  useWatchlist,
} from "../hooks/useQueries";

export default function ShowPage() {
  const { id } = useParams({ from: "/show/$id" });
  const navigate = useNavigate();
  const showId = BigInt(id);
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const { data: show, isLoading: showLoading } = useShow(showId);
  const { data: episodes = [], isLoading: epsLoading } =
    useEpisodesByShow(showId);
  const { data: watchlist = [] } = useWatchlist();
  const { data: allShows = [] } = useAllShows(true);
  const addMutation = useAddToWatchlist();
  const removeMutation = useRemoveFromWatchlist();

  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);

  const isInList = watchlist.some((wid) => wid === showId);
  const activeEpisode = selectedEpisode ?? episodes[0] ?? null;

  const posterUrl =
    show?.thumbnailBlob?.getDirectURL() ??
    (show
      ? `https://picsum.photos/seed/${encodeURIComponent(show.title)}/1280/720`
      : undefined);

  const suggestedShows = allShows
    .filter((s) => s.id !== showId && (!show || s.genre === show.genre))
    .slice(0, 8);

  const handleWatchlist = () => {
    if (!isAuthenticated) return;
    if (isInList) {
      removeMutation.mutate(showId);
    } else {
      addMutation.mutate(showId);
    }
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
        {/* Back button */}
        <button
          type="button"
          onClick={() => navigate({ to: "/" })}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
          data-ocid="show.back.button"
        >
          <ArrowLeft size={16} /> Back to Home
        </button>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left: player + info */}
          <div className="xl:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <VideoPlayer
                videoBlob={activeEpisode?.videoBlob}
                posterUrl={posterUrl}
                title={activeEpisode?.title}
              />

              {/* Show info */}
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
                  {isAuthenticated && (
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
                      {isInList ? <Check size={15} /> : <Plus size={15} />}
                      {isInList ? "In My List" : "Add to My List"}
                    </button>
                  )}
                </div>
                <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                  {show.description}
                </p>
              </div>
            </motion.div>
          </div>

          {/* Right: episode list */}
          <div className="xl:col-span-1">
            <h2 className="text-lg font-semibold mb-4">Episodes</h2>
            <EpisodeList
              episodes={episodes}
              isLoading={epsLoading}
              onSelectEpisode={setSelectedEpisode}
              selectedEpisodeId={activeEpisode?.id}
            />
          </div>
        </div>

        {/* Suggested shows */}
        {suggestedShows.length > 0 && (
          <div className="mt-12">
            <ShowRow title="More Like This" shows={suggestedShows} />
          </div>
        )}
      </div>
    </main>
  );
}
