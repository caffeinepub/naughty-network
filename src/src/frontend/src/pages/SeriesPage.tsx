import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search } from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import ShowCard from "../components/ShowCard";
import { useAllShows, useSearchShows } from "../hooks/useQueries";

const GENRES = [
  "All",
  "Thriller",
  "Drama",
  "Sci-Fi",
  "Crime",
  "Action",
  "Horror",
];

export default function SeriesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");

  const { data: allShows = [], isLoading } = useAllShows(true);
  const { data: searchResults = [], isFetching: searching } =
    useSearchShows(searchTerm);

  const baseShows = searchTerm.trim() ? searchResults : allShows;
  const filtered = useMemo(() => {
    if (selectedGenre === "All") return baseShows;
    return baseShows.filter((s) => s.genre === selectedGenre);
  }, [baseShows, selectedGenre]);

  return (
    <main
      className="min-h-screen pt-24 pb-16 max-w-screen-2xl mx-auto px-4 md:px-8"
      data-ocid="series.page"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-8">
          All Series
        </h1>

        {/* Search + filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative max-w-md w-full">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search shows..."
              className="pl-9 bg-card border-border"
              data-ocid="series.search_input"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {GENRES.map((g) => (
              <button
                type="button"
                key={g}
                onClick={() => setSelectedGenre(g)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  selectedGenre === g
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-muted-foreground hover:bg-white/10 border border-border"
                }`}
                data-ocid="series.genre.tab"
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {isLoading || searching ? (
          <div
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
            data-ocid="series.loading_state"
          >
            {Array.from({ length: 12 }).map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton array
              <div key={i}>
                <Skeleton className="aspect-video w-full rounded-md mb-2" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-24 text-muted-foreground"
            data-ocid="series.empty_state"
          >
            <Search size={48} className="mb-4 opacity-30" />
            <p className="text-lg font-medium">No shows found</p>
            <p className="text-sm mt-1">
              Try a different search or genre filter.
            </p>
          </div>
        ) : (
          <div
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
            data-ocid="series.list"
          >
            {filtered.map((show, i) => (
              <div
                key={show.id.toString()}
                className="w-full"
                data-ocid={`series.item.${i + 1}`}
              >
                <ShowCard show={show} index={i} />
              </div>
            ))}
          </div>
        )}

        {!isLoading && !searching && filtered.length > 0 && (
          <p className="mt-6 text-xs text-muted-foreground text-center">
            Showing {filtered.length} series
            {selectedGenre !== "All" && (
              <Badge variant="outline" className="ml-2 text-xs">
                {selectedGenre}
              </Badge>
            )}
          </p>
        )}
      </motion.div>
    </main>
  );
}
