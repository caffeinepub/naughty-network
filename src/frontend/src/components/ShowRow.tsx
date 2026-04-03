import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState } from "react";
import type { Show } from "../backend";
import ShowCard from "./ShowCard";

interface ShowRowProps {
  title: string;
  shows: Show[];
}

export default function ShowRow({ title, shows }: ShowRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);

  const scroll = (dir: "left" | "right") => {
    const el = rowRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.8;
    el.scrollBy({
      left: dir === "right" ? amount : -amount,
      behavior: "smooth",
    });
  };

  const onScroll = () => {
    const el = rowRef.current;
    if (!el) return;
    setShowLeft(el.scrollLeft > 20);
    setShowRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 20);
  };

  if (!shows.length) return null;

  return (
    <div className="relative group/row mb-8">
      <h2 className="text-lg md:text-xl font-semibold mb-4 px-4 md:px-8 text-foreground">
        {title}
      </h2>

      {/* Left arrow */}
      {showLeft && (
        <button
          type="button"
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-10 h-10 rounded-full bg-black/70 border border-white/20 text-white opacity-0 group-hover/row:opacity-100 transition-opacity hover:bg-black/90 mt-5"
          aria-label="Scroll left"
          data-ocid="show_row.pagination_prev"
        >
          <ChevronLeft size={18} />
        </button>
      )}

      {/* Right arrow */}
      {showRight && (
        <button
          type="button"
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-10 h-10 rounded-full bg-black/70 border border-white/20 text-white opacity-0 group-hover/row:opacity-100 transition-opacity hover:bg-black/90 mt-5"
          aria-label="Scroll right"
          data-ocid="show_row.pagination_next"
        >
          <ChevronRight size={18} />
        </button>
      )}

      <div
        ref={rowRef}
        onScroll={onScroll}
        className="flex gap-3 overflow-x-auto scrollbar-hide px-4 md:px-8 pb-2"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {shows.map((show, i) => (
          <ShowCard key={show.id.toString()} show={show} index={i} />
        ))}
      </div>
    </div>
  );
}
