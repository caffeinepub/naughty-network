import { Maximize, Pause, Play, Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface VideoPlayerProps {
  videoUrl?: string;
  posterUrl?: string;
  title?: string;
}

function getEmbedUrl(url: string): string | null {
  if (!url) return null;
  // YouTube
  const ytId = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)?([\w-]{11})(?:[&?]|$)/,
  );
  const ytIdFull = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([\w-]{11})/,
  );
  if (ytIdFull) {
    return `https://www.youtube.com/embed/${ytIdFull[1]}?autoplay=0&rel=0&modestbranding=1&showinfo=0&controls=1&iv_load_policy=3&fs=1&color=white&hl=en`;
  }
  if (ytId && (url.includes("youtube") || url.includes("youtu.be"))) {
    return `https://www.youtube.com/embed/${ytId[1]}?autoplay=0&rel=0&modestbranding=1&showinfo=0&controls=1&iv_load_policy=3&fs=1&color=white&hl=en`;
  }
  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}?title=0&byline=0&portrait=0&badge=0&autopause=0&player_id=0`;
  }
  return null;
}

function isEmbedUrl(url: string): boolean {
  return !!(
    url &&
    (url.includes("youtube.com") ||
      url.includes("youtu.be") ||
      url.includes("vimeo.com"))
  );
}

export default function VideoPlayer({
  videoUrl,
  posterUrl,
  title,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);

  const embedUrl = videoUrl ? getEmbedUrl(videoUrl) : null;
  const isEmbed = videoUrl ? isEmbedUrl(videoUrl) : false;

  // biome-ignore lint/correctness/useExhaustiveDependencies: videoUrl is a prop, not a ref
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.pause();
    v.load();
    setPlaying(false);
    setProgress(0);
  }, [videoUrl]);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (playing) {
      v.pause();
    } else {
      v.play();
    }
    setPlaying(!playing);
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  const handleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      container.requestFullscreen();
    }
  };

  const handleTimeUpdate = () => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    setProgress((v.currentTime / v.duration) * 100);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const v = videoRef.current;
    if (!v) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = x / rect.width;
    v.currentTime = pct * v.duration;
  };

  // No video
  if (!videoUrl) {
    return (
      <div
        className="relative w-full aspect-video bg-card rounded-lg overflow-hidden flex items-center justify-center"
        style={{
          backgroundImage: posterUrl ? `url(${posterUrl})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        data-ocid="video.canvas_target"
      >
        {!posterUrl && (
          <div className="absolute inset-0 bg-gradient-to-br from-card to-black/50" />
        )}
        <div className="relative z-10 flex flex-col items-center gap-3 text-muted-foreground">
          <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
            <Play size={32} className="text-white ml-1" />
          </div>
          {title && (
            <p className="text-sm font-medium text-white/60">{title}</p>
          )}
          <p className="text-xs text-muted-foreground">No video available</p>
        </div>
      </div>
    );
  }

  // YouTube / Vimeo embed — wrapped in branded container, title hidden
  if (isEmbed && embedUrl) {
    return (
      <div
        ref={containerRef}
        className="relative w-full aspect-video bg-black rounded-lg overflow-hidden"
        data-ocid="video.canvas_target"
      >
        {/* Overlay bar covers platform title/branding at top */}
        <div
          className="absolute top-0 left-0 right-0 z-10 pointer-events-none"
          style={{
            height: "52px",
            background: "linear-gradient(to bottom, #000 55%, transparent)",
          }}
        />

        {/* iframe fills container — no title attribute exposed */}
        <iframe
          key={embedUrl}
          src={embedUrl}
          title="Video Player"
          className="absolute inset-0 w-full h-full"
          style={{ border: "none" }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen; web-share"
          allowFullScreen
          referrerPolicy="no-referrer"
          sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
        />

        {/* Custom fullscreen button */}
        <button
          type="button"
          onClick={handleFullscreen}
          className="absolute bottom-3 right-3 z-20 text-white bg-black/50 rounded p-1.5 hover:bg-primary/80 transition-colors"
          aria-label="Fullscreen"
        >
          <Maximize size={16} />
        </button>
      </div>
    );
  }

  // Direct MP4 / other video URL
  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-video bg-black rounded-lg overflow-hidden group"
      data-ocid="video.canvas_target"
    >
      {/* biome-ignore lint/a11y/useMediaCaption: streaming video player */}
      <video
        key={videoUrl}
        ref={videoRef}
        src={videoUrl}
        poster={posterUrl}
        className="w-full h-full object-contain"
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setPlaying(false)}
        title="Video Player"
        controlsList="nodownload noremoteplayback"
        disablePictureInPicture
      />

      {/* Controls overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button
          type="button"
          className="absolute bottom-12 left-4 right-4 h-1 bg-white/30 rounded cursor-pointer"
          onClick={handleProgressClick}
          aria-label="Seek video"
        >
          <div
            className="h-full bg-primary rounded transition-all"
            style={{ width: `${progress}%` }}
          />
        </button>

        <div className="absolute bottom-3 left-4 right-4 flex items-center gap-3">
          <button
            type="button"
            onClick={togglePlay}
            className="text-white hover:text-primary transition-colors"
            data-ocid="video.play.button"
          >
            {playing ? <Pause size={20} /> : <Play size={20} />}
          </button>
          <button
            type="button"
            onClick={toggleMute}
            className="text-white hover:text-primary transition-colors"
            data-ocid="video.mute.button"
          >
            {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
          <div className="flex-1" />
          <button
            type="button"
            onClick={handleFullscreen}
            className="text-white hover:text-primary transition-colors"
            data-ocid="video.fullscreen.button"
          >
            <Maximize size={18} />
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={togglePlay}
        className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
      >
        {!playing && (
          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
            <Play size={28} className="text-white ml-1" />
          </div>
        )}
      </button>
    </div>
  );
}
