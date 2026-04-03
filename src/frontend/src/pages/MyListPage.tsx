import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import { ListVideo } from "lucide-react";
import { motion } from "motion/react";
import { useMemo } from "react";
import ShowCard from "../components/ShowCard";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useAllShows, useWatchlist } from "../hooks/useQueries";

export default function MyListPage() {
  const { identity, login } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const { data: watchlistIds = [], isLoading: wlLoading } = useWatchlist();
  const { data: allShows = [], isLoading: showsLoading } = useAllShows(true);

  const watchlistShows = useMemo(
    () => allShows.filter((s) => watchlistIds.some((id) => id === s.id)),
    [allShows, watchlistIds],
  );

  if (!isAuthenticated) {
    return (
      <main
        className="min-h-screen flex items-center justify-center"
        data-ocid="mylist.page"
      >
        <div className="text-center">
          <ListVideo
            size={64}
            className="mx-auto mb-4 text-muted-foreground opacity-40"
          />
          <h2 className="text-2xl font-bold mb-2">Sign in to view your list</h2>
          <p className="text-muted-foreground mb-6">
            Keep track of your favorite shows.
          </p>
          <button
            type="button"
            onClick={() => login()}
            className="px-6 py-2 bg-primary text-primary-foreground font-semibold rounded hover:bg-primary/90 transition-colors"
            data-ocid="mylist.login.button"
          >
            Sign In
          </button>
        </div>
      </main>
    );
  }

  const isLoading = wlLoading || showsLoading;

  return (
    <main
      className="min-h-screen pt-24 pb-16 max-w-screen-2xl mx-auto px-4 md:px-8"
      data-ocid="mylist.page"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-8">
          My List
        </h1>

        {isLoading ? (
          <div
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
            data-ocid="mylist.loading_state"
          >
            {Array.from({ length: 6 }).map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton array
              <div key={i}>
                <Skeleton className="aspect-video w-full rounded-md mb-2" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            ))}
          </div>
        ) : watchlistShows.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-24 text-muted-foreground"
            data-ocid="mylist.empty_state"
          >
            <ListVideo size={64} className="mb-4 opacity-30" />
            <p className="text-lg font-medium">Your list is empty</p>
            <p className="text-sm mt-1 mb-6">
              Add shows from the{" "}
              <Link to="/series" className="text-primary hover:underline">
                series page
              </Link>
              .
            </p>
          </div>
        ) : (
          <div
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
            data-ocid="mylist.list"
          >
            {watchlistShows.map((show, i) => (
              <div key={show.id.toString()} data-ocid={`mylist.item.${i + 1}`}>
                <ShowCard show={show} index={i} />
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </main>
  );
}
