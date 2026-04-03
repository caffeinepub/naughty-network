import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Play } from "lucide-react";
import { useState } from "react";
import type { Episode } from "../backend";

interface EpisodeListProps {
  episodes: Episode[];
  isLoading?: boolean;
  onSelectEpisode: (episode: Episode) => void;
  selectedEpisodeId?: bigint;
}

export default function EpisodeList({
  episodes,
  isLoading,
  onSelectEpisode,
  selectedEpisodeId,
}: EpisodeListProps) {
  const seasons = [
    ...new Set(episodes.map((e) => Number(e.seasonNumber))),
  ].sort((a, b) => a - b);
  const [selectedSeason, setSelectedSeason] = useState<number>(seasons[0] ?? 1);

  if (isLoading) {
    return (
      <div className="space-y-3" data-ocid="episode_list.loading_state">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (!episodes.length) {
    return (
      <div
        className="text-center py-12 text-muted-foreground"
        data-ocid="episode_list.empty_state"
      >
        <p className="text-sm">No episodes available yet.</p>
      </div>
    );
  }

  const filteredEpisodes = episodes
    .filter((e) => Number(e.seasonNumber) === selectedSeason)
    .sort((a, b) => Number(a.episodeNumber) - Number(b.episodeNumber));

  const formatDuration = (seconds: bigint) => {
    const mins = Math.floor(Number(seconds) / 60);
    return `${mins}m`;
  };

  return (
    <div data-ocid="episode_list.panel">
      <Tabs
        value={`season-${selectedSeason}`}
        onValueChange={(v) =>
          setSelectedSeason(Number(v.replace("season-", "")))
        }
      >
        <TabsList className="bg-card border border-border mb-4">
          {seasons.map((s) => (
            <TabsTrigger
              key={s}
              value={`season-${s}`}
              data-ocid={`episode_list.tab.${s}`}
            >
              Season {s}
            </TabsTrigger>
          ))}
        </TabsList>

        {seasons.map((s) => (
          <TabsContent key={s} value={`season-${s}`} className="space-y-2">
            {filteredEpisodes.map((ep, idx) => (
              <button
                type="button"
                key={ep.id.toString()}
                onClick={() => onSelectEpisode(ep)}
                className={`w-full flex items-start gap-4 p-3 rounded-lg text-left transition-colors hover:bg-white/5 ${
                  selectedEpisodeId === ep.id
                    ? "bg-white/10 border border-white/20"
                    : "bg-card"
                }`}
                data-ocid={`episode_list.item.${idx + 1}`}
              >
                <div className="relative flex-shrink-0 w-28 aspect-video bg-black/40 rounded overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-black text-white/20">
                      {Number(ep.episodeNumber)}
                    </span>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <Play size={20} className="text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold truncate">
                      {Number(ep.episodeNumber)}. {ep.title}
                    </p>
                    {ep.duration > 0n && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
                        <Clock size={10} />
                        {formatDuration(ep.duration)}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {ep.description}
                  </p>
                </div>
              </button>
            ))}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
