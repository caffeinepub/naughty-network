import { useNavigate } from "@tanstack/react-router";
import { Check, Play, Plus, Star } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import type { Show } from "../backend";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAddToWatchlist,
  useRemoveFromWatchlist,
  useWatchlist,
} from "../hooks/useQueries";

interface ShowCardProps {
  show: Show;
  index?: number;
}

export default function ShowCard({ show, index = 0 }: ShowCardProps) {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const [hovered, setHovered] = useState(false);
  const { data: watchlist = [] } = useWatchlist();
  const addMutation = useAddToWatchlist();
  const removeMutation = useRemoveFromWatchlist();

  const isInList = watchlist.some((id) => id === show.id);
  const thumbnailUrl =
    show.thumbnailBlob?.getDirectURL() ??
    `https://picsum.photos/seed/${encodeURIComponent(show.title)}/400/225`;

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate({ to: "/show/$id", params: { id: show.id.toString() } });
  };

  const handleWatchlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) return;
    if (isInList) {
      removeMutation.mutate(show.id);
    } else {
      addMutation.mutate(show.id);
    }
  };

  // Fake rating for visual interest
  const rating = ((show.id % 20n) + 70n) / 10n;
  const ratingNum = Number(rating) / 10 + 7;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="relative w-52 flex-shrink-0 cursor-pointer group"
      onClick={() =>
        navigate({ to: "/show/$id", params: { id: show.id.toString() } })
      }
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      data-ocid={`show.card.${index + 1}`}
    >
      <div className="relative overflow-hidden rounded-md bg-card aspect-video transition-transform duration-300 group-hover:scale-105 group-hover:z-10 shadow-lg">
        <img
          src={thumbnailUrl}
          alt={show.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />

        {/* Hover overlay */}
        <div
          className={`absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent transition-opacity duration-200 ${hovered ? "opacity-100" : "opacity-0"}`}
        >
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <p className="text-xs font-bold uppercase truncate text-white mb-1">
              {show.title}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-0.5">
                <Star size={10} className="text-yellow-400 fill-yellow-400" />
                <span className="text-[10px] text-yellow-400 font-medium">
                  {ratingNum.toFixed(1)}
                </span>
              </div>
              <span className="text-[10px] text-muted-foreground bg-black/60 px-1.5 py-0.5 rounded">
                {show.genre}
              </span>
            </div>
            <div className="flex gap-1.5 mt-2">
              <button
                type="button"
                onClick={handlePlay}
                className="flex items-center gap-1 px-2 py-1 bg-primary text-primary-foreground text-[10px] font-semibold rounded hover:bg-primary/80 transition-colors"
                data-ocid={`show.play_button.${index + 1}`}
              >
                <Play size={10} fill="currentColor" /> Play
              </button>
              {isAuthenticated && (
                <button
                  type="button"
                  onClick={handleWatchlist}
                  className="flex items-center justify-center w-6 h-6 rounded-full border border-white/40 hover:bg-white/20 transition-colors"
                  data-ocid={`show.watchlist_button.${index + 1}`}
                >
                  {isInList ? (
                    <Check size={10} className="text-green-400" />
                  ) : (
                    <Plus size={10} />
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      <p className="mt-1.5 text-xs text-muted-foreground truncate px-0.5">
        {show.title}
      </p>
    </motion.div>
  );
}
