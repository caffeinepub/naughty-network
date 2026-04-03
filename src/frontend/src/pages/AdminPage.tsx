import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Check,
  ChevronDown,
  ChevronRight,
  Edit2,
  Film,
  Loader2,
  Lock,
  Plus,
  Trash2,
  Upload,
  Users,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { ExternalBlob } from "../backend";
import type { Episode, Show } from "../backend";
type UserRecord = {
  principal: { toString(): string };
  name: string;
  joinedAt: bigint;
};
import {
  useAllShows,
  useAllUsers,
  useCreateEpisode,
  useCreateShow,
  useDeleteEpisode,
  useDeleteShow,
  useEpisodesByShow,
  useUpdateEpisode,
  useUpdateShow,
} from "../hooks/useQueries";

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FilePickerButton({
  accept,
  file,
  onFile,
  label,
  ocid,
}: {
  accept: string;
  file: File | null;
  onFile: (f: File | null) => void;
  label: string;
  ocid: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-3 cursor-pointer">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="border-border flex-shrink-0"
          asChild
          data-ocid={ocid}
        >
          <span>
            <Upload size={14} className="mr-1.5" />
            {label}
          </span>
        </Button>
        <input
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => onFile(e.target.files?.[0] ?? null)}
        />
        {file && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onFile(null);
            }}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={14} />
          </button>
        )}
      </label>
      {file && (
        <p className="text-xs text-muted-foreground pl-1">
          <span className="font-medium text-foreground/80">{file.name}</span>
          {" · "}
          {formatFileSize(file.size)}
        </p>
      )}
    </div>
  );
}

function UploadProgress({ progress }: { progress: number }) {
  if (progress <= 0 || progress >= 100) return null;
  return (
    <div className="w-full bg-border rounded h-1.5">
      <div
        className="bg-primary h-full rounded transition-all"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

function ShowForm({
  onSuccess,
  existing,
}: { onSuccess: () => void; existing?: Show }) {
  const [title, setTitle] = useState(existing?.title ?? "");
  const [description, setDescription] = useState(existing?.description ?? "");
  const [genre, setGenre] = useState(existing?.genre ?? "");
  const [isPublic, setIsPublic] = useState(existing?.isPublic ?? true);
  const [isFeatured, setIsFeatured] = useState(existing?.isFeatured ?? false);
  const [thumbFile, setThumbFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const createMutation = useCreateShow();
  const updateMutation = useUpdateShow();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let thumbnailBlob: ExternalBlob | null = null;
      if (thumbFile) {
        const bytes = new Uint8Array(await thumbFile.arrayBuffer());
        thumbnailBlob = ExternalBlob.fromBytes(bytes).withUploadProgress((p) =>
          setUploadProgress(p),
        );
      } else if (existing?.thumbnailBlob) {
        thumbnailBlob = existing.thumbnailBlob; // preserve existing
      }
      if (existing) {
        await updateMutation.mutateAsync({
          id: existing.id,
          title,
          description,
          genre,
          thumbnailBlob,
          isFeatured,
          isPublic,
        });
        toast.success("Show updated!");
      } else {
        await createMutation.mutateAsync({
          title,
          description,
          genre,
          thumbnailBlob,
          isPublic,
        });
        toast.success("Show created!");
      }
      onSuccess();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("Upload error:", err);
      toast.error(`Failed to save: ${msg.slice(0, 120)}`);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;
  const existingThumbURL = existing?.thumbnailBlob?.getDirectURL();

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4"
      data-ocid="admin.show.modal"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Title</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Show title"
            className="bg-card border-border"
            data-ocid="admin.show.title.input"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Genre</Label>
          <Input
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            required
            placeholder="e.g. Drama, Thriller"
            className="bg-card border-border"
            data-ocid="admin.show.genre.input"
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Description</Label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          placeholder="Show description"
          rows={3}
          className="bg-card border-border"
          data-ocid="admin.show.description.textarea"
        />
      </div>
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex items-center gap-2">
          <Switch
            checked={isPublic}
            onCheckedChange={setIsPublic}
            id="isPublic"
            data-ocid="admin.show.public.switch"
          />
          <Label htmlFor="isPublic">Public</Label>
        </div>
        {existing && (
          <div className="flex items-center gap-2">
            <Switch
              checked={isFeatured}
              onCheckedChange={setIsFeatured}
              id="isFeatured"
              data-ocid="admin.show.featured.switch"
            />
            <Label htmlFor="isFeatured">Featured (Hero)</Label>
          </div>
        )}
      </div>

      {/* Thumbnail */}
      <div className="space-y-2">
        <Label>Thumbnail</Label>
        {existingThumbURL && !thumbFile && (
          <div className="w-24 aspect-video rounded overflow-hidden border border-border mb-2">
            <img
              src={existingThumbURL}
              alt="Current thumbnail"
              className="w-full h-full object-cover"
            />
          </div>
        )}
        {thumbFile && (
          <div className="w-24 aspect-video rounded overflow-hidden border border-border mb-2">
            <img
              src={URL.createObjectURL(thumbFile)}
              alt="New thumbnail preview"
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <FilePickerButton
          accept="image/*"
          file={thumbFile}
          onFile={setThumbFile}
          label={
            thumbFile
              ? "Change image"
              : existing
                ? "Replace image"
                : "Choose image"
          }
          ocid="admin.show.thumbnail.upload_button"
        />
        <UploadProgress progress={uploadProgress} />
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="bg-primary hover:bg-primary/90"
        data-ocid="admin.show.submit_button"
      >
        {isPending ? (
          <>
            <Loader2 size={14} className="mr-2 animate-spin" /> Saving...
          </>
        ) : (
          <>
            <Check size={14} className="mr-2" />
            {existing ? "Update Show" : "Create Show"}
          </>
        )}
      </Button>
    </form>
  );
}

function EpisodeForm({
  shows,
  initialShowId,
  onSuccess,
}: { shows: Show[]; initialShowId?: bigint | null; onSuccess: () => void }) {
  const [showId, setShowId] = useState<bigint | null>(
    initialShowId ?? shows[0]?.id ?? null,
  );
  const [season, setSeason] = useState("1");
  const [episode, setEpisode] = useState("1");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("0");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const createMutation = useCreateEpisode();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showId) return;
    try {
      let videoBlob: ExternalBlob | null = null;
      if (videoFile) {
        const bytes = new Uint8Array(await videoFile.arrayBuffer());
        videoBlob = ExternalBlob.fromBytes(bytes).withUploadProgress((p) =>
          setUploadProgress(p),
        );
      }
      await createMutation.mutateAsync({
        showId,
        seasonNumber: BigInt(season),
        episodeNumber: BigInt(episode),
        title,
        description,
        videoBlob,
        duration: BigInt(Math.round(Number(duration) * 60)),
      });
      toast.success("Episode created!");
      onSuccess();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("Upload error:", err);
      toast.error(`Failed to save: ${msg.slice(0, 120)}`);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4"
      data-ocid="admin.episode.modal"
    >
      <div className="space-y-1.5">
        <Label>Show</Label>
        <select
          value={showId?.toString() ?? ""}
          onChange={(e) => setShowId(BigInt(e.target.value))}
          className="w-full px-3 py-2 bg-card border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          data-ocid="admin.episode.show.select"
        >
          {shows.map((s) => (
            <option key={s.id.toString()} value={s.id.toString()}>
              {s.title}
            </option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Season</Label>
          <Input
            type="number"
            min="1"
            value={season}
            onChange={(e) => setSeason(e.target.value)}
            required
            className="bg-card border-border"
            data-ocid="admin.episode.season.input"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Episode #</Label>
          <Input
            type="number"
            min="1"
            value={episode}
            onChange={(e) => setEpisode(e.target.value)}
            required
            className="bg-card border-border"
            data-ocid="admin.episode.number.input"
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Title</Label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="Episode title"
          className="bg-card border-border"
          data-ocid="admin.episode.title.input"
        />
      </div>
      <div className="space-y-1.5">
        <Label>Description</Label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Episode description"
          rows={2}
          className="bg-card border-border"
          data-ocid="admin.episode.description.textarea"
        />
      </div>
      <div className="space-y-1.5">
        <Label>Duration (minutes)</Label>
        <Input
          type="number"
          min="0"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          className="bg-card border-border"
          data-ocid="admin.episode.duration.input"
        />
      </div>
      <div className="space-y-1.5">
        <Label>Video File</Label>
        <FilePickerButton
          accept="video/*"
          file={videoFile}
          onFile={setVideoFile}
          label={videoFile ? "Change video" : "Choose video"}
          ocid="admin.episode.video.upload_button"
        />
        <UploadProgress progress={uploadProgress} />
      </div>
      <Button
        type="submit"
        disabled={createMutation.isPending}
        className="bg-primary hover:bg-primary/90"
        data-ocid="admin.episode.submit_button"
      >
        {createMutation.isPending ? (
          <>
            <Loader2 size={14} className="mr-2 animate-spin" /> Creating...
          </>
        ) : (
          <>
            <Plus size={14} className="mr-2" /> Create Episode
          </>
        )}
      </Button>
    </form>
  );
}

function EpisodeEditForm({
  episode,
  showId,
  onSuccess,
  onCancel,
}: {
  episode: Episode;
  showId: bigint;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [season, setSeason] = useState(String(Number(episode.seasonNumber)));
  const [epNum, setEpNum] = useState(String(Number(episode.episodeNumber)));
  const [title, setTitle] = useState(episode.title);
  const [description, setDescription] = useState(episode.description);
  const [duration, setDuration] = useState(
    String(Math.round(Number(episode.duration) / 60)),
  );
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const updateMutation = useUpdateEpisode();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let videoBlob: ExternalBlob | null = null;
      if (videoFile) {
        const bytes = new Uint8Array(await videoFile.arrayBuffer());
        videoBlob = ExternalBlob.fromBytes(bytes).withUploadProgress((p) =>
          setUploadProgress(p),
        );
      } else if (episode.videoBlob) {
        videoBlob = episode.videoBlob; // preserve existing
      }
      await updateMutation.mutateAsync({
        id: episode.id,
        showId,
        seasonNumber: BigInt(season),
        episodeNumber: BigInt(epNum),
        title,
        description,
        videoBlob,
        duration: BigInt(Math.round(Number(duration) * 60)),
      });
      toast.success("Episode updated!");
      onSuccess();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("Upload error:", err);
      toast.error(`Failed to save: ${msg.slice(0, 120)}`);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-3 p-4 bg-background/50 rounded-lg border border-border/60 space-y-3"
      data-ocid="admin.episode.edit.modal"
    >
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Season</Label>
          <Input
            type="number"
            min="1"
            value={season}
            onChange={(e) => setSeason(e.target.value)}
            required
            className="bg-card border-border h-8 text-sm"
            data-ocid="admin.episode.edit.season.input"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Episode #</Label>
          <Input
            type="number"
            min="1"
            value={epNum}
            onChange={(e) => setEpNum(e.target.value)}
            required
            className="bg-card border-border h-8 text-sm"
            data-ocid="admin.episode.edit.number.input"
          />
        </div>
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Title</Label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="bg-card border-border h-8 text-sm"
          data-ocid="admin.episode.edit.title.input"
        />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Description</Label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="bg-card border-border text-sm"
          data-ocid="admin.episode.edit.description.textarea"
        />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Duration (minutes)</Label>
        <Input
          type="number"
          min="0"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          className="bg-card border-border h-8 text-sm"
          data-ocid="admin.episode.edit.duration.input"
        />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Replace Video (optional)</Label>
        <FilePickerButton
          accept="video/*"
          file={videoFile}
          onFile={setVideoFile}
          label={videoFile ? "Change video" : "Upload new video"}
          ocid="admin.episode.edit.video.upload_button"
        />
        <UploadProgress progress={uploadProgress} />
      </div>
      <div className="flex gap-2 pt-1">
        <Button
          type="submit"
          size="sm"
          disabled={updateMutation.isPending}
          className="bg-primary hover:bg-primary/90"
          data-ocid="admin.episode.edit.save_button"
        >
          {updateMutation.isPending ? (
            <Loader2 size={12} className="mr-1.5 animate-spin" />
          ) : (
            <Check size={12} className="mr-1.5" />
          )}
          Save
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={onCancel}
          className="border-border"
          data-ocid="admin.episode.edit.cancel_button"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

function SeasonSection({
  seasonNumber,
  episodes,
  showId,
  onDeleteEpisode,
  deletePending,
}: {
  seasonNumber: number;
  episodes: Episode[];
  showId: bigint;
  onDeleteEpisode: (ep: Episode) => void;
  deletePending: boolean;
}) {
  const [open, setOpen] = useState(true);
  const [editingId, setEditingId] = useState<bigint | null>(null);

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-card hover:bg-card/80 transition-colors"
        data-ocid="admin.season.toggle"
      >
        <div className="flex items-center gap-2">
          {open ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
          <span className="font-semibold text-sm">Season {seasonNumber}</span>
          <Badge variant="outline" className="text-xs">
            {episodes.length} episode{episodes.length !== 1 ? "s" : ""}
          </Badge>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="divide-y divide-border/50">
              {[...episodes]
                .sort(
                  (a, b) => Number(a.episodeNumber) - Number(b.episodeNumber),
                )
                .map((ep, i) => (
                  <div
                    key={ep.id.toString()}
                    data-ocid={`admin.episode.item.${i + 1}`}
                  >
                    <div className="flex items-center gap-4 px-4 py-3">
                      <div className="flex-shrink-0 text-center w-10">
                        <p className="text-xs text-muted-foreground">EP</p>
                        <p className="text-lg font-black leading-none">
                          {Number(ep.episodeNumber)}
                        </p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">
                          {ep.title}
                        </p>
                        {ep.description && (
                          <p className="text-xs text-muted-foreground truncate mt-0.5">
                            {ep.description}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground/60 mt-0.5">
                          {Math.round(Number(ep.duration) / 60)} min
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setEditingId(editingId === ep.id ? null : ep.id)
                          }
                          className="h-8 w-8 p-0 border-border hover:border-white/40"
                          data-ocid={`admin.episode.edit_button.${i + 1}`}
                        >
                          {editingId === ep.id ? (
                            <X size={13} />
                          ) : (
                            <Edit2 size={13} />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onDeleteEpisode(ep)}
                          disabled={deletePending}
                          className="h-8 w-8 p-0 border-red-500/30 text-red-400 hover:bg-red-500/10"
                          data-ocid={`admin.episode.delete_button.${i + 1}`}
                        >
                          <Trash2 size={13} />
                        </Button>
                      </div>
                    </div>
                    <AnimatePresence>
                      {editingId === ep.id && (
                        <motion.div
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.15 }}
                          className="px-4 pb-3"
                        >
                          <EpisodeEditForm
                            episode={ep}
                            showId={showId}
                            onSuccess={() => setEditingId(null)}
                            onCancel={() => setEditingId(null)}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function useAdminAuth() {
  const [unlocked, setUnlocked] = useState(
    () => sessionStorage.getItem("nn_admin_auth") === "1",
  );
  const unlock = (password: string) => {
    if (password === "20417") {
      sessionStorage.setItem("nn_admin_auth", "1");
      setUnlocked(true);
      return true;
    }
    return false;
  };
  return { unlocked, unlock };
}

function PasswordGate({ onUnlock }: { onUnlock: (pw: string) => boolean }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [shaking, setShaking] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = onUnlock(password);
    if (!ok) {
      setError(true);
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
    }
  };

  return (
    <main
      className="min-h-screen flex items-center justify-center"
      data-ocid="admin.page"
    >
      <motion.div
        animate={shaking ? { x: [-10, 10, -8, 8, -4, 4, 0] } : { x: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-card border border-border rounded-2xl p-10 w-full max-w-sm shadow-2xl"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Lock size={28} className="text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Access</h1>
          <p className="text-muted-foreground text-sm mt-1 text-center">
            Enter the admin password to continue
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="admin-password">Password</Label>
            <Input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(false);
              }}
              placeholder="Enter password"
              autoFocus
              data-ocid="admin.input"
            />
            {error && (
              <p
                className="text-sm text-destructive"
                data-ocid="admin.error_state"
              >
                Incorrect password. Try again.
              </p>
            )}
          </div>
          <Button
            type="submit"
            className="w-full"
            data-ocid="admin.submit_button"
          >
            Unlock
          </Button>
        </form>
      </motion.div>
    </main>
  );
}

export default function AdminPage() {
  const { unlocked, unlock } = useAdminAuth();
  const { data: shows = [], isLoading: showsLoading } = useAllShows(false);
  const { data: users = [], isLoading: usersLoading } = useAllUsers();
  const deleteMutation = useDeleteShow();
  const [editingShow, setEditingShow] = useState<Show | null>(null);
  const [showShowForm, setShowShowForm] = useState(false);
  const [showEpisodeForm, setShowEpisodeForm] = useState(false);
  const [selectedShowId, setSelectedShowId] = useState<bigint | null>(null);
  const [activeTab, setActiveTab] = useState("shows");
  const [quickAddShowId, setQuickAddShowId] = useState<bigint | null>(null);
  const { data: episodes = [] } = useEpisodesByShow(selectedShowId);
  const deleteEpMutation = useDeleteEpisode();

  if (!unlocked) {
    return <PasswordGate onUnlock={unlock} />;
  }

  const handleDeleteShow = async (id: bigint) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Show deleted.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("Delete show error:", err);
      toast.error(`Failed to delete: ${msg.slice(0, 120)}`);
    }
  };

  const handleDeleteEpisode = async (ep: Episode) => {
    if (!selectedShowId) return;
    try {
      await deleteEpMutation.mutateAsync({
        episodeId: ep.id,
        showId: selectedShowId,
      });
      toast.success("Episode deleted.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("Delete episode error:", err);
      toast.error(`Failed to delete: ${msg.slice(0, 120)}`);
    }
  };

  const handleQuickAddEpisode = (showId: bigint) => {
    setQuickAddShowId(showId);
    setSelectedShowId(showId);
    setShowEpisodeForm(true);
    setActiveTab("episodes");
  };

  // Group episodes by season
  const episodesBySeason = episodes.reduce(
    (acc, ep) => {
      const sn = Number(ep.seasonNumber);
      if (!acc[sn]) acc[sn] = [];
      acc[sn].push(ep);
      return acc;
    },
    {} as Record<number, Episode[]>,
  );
  const sortedSeasons = Object.keys(episodesBySeason)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <main
      className="min-h-screen pt-24 pb-16 max-w-screen-xl mx-auto px-4 md:px-8"
      data-ocid="admin.page"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-8">
          Admin Dashboard
        </h1>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-card border border-border mb-8">
            <TabsTrigger value="shows" data-ocid="admin.shows.tab">
              Shows
            </TabsTrigger>
            <TabsTrigger value="episodes" data-ocid="admin.episodes.tab">
              Episodes
            </TabsTrigger>
            <TabsTrigger value="users" data-ocid="admin.users.tab">
              <Users size={14} className="mr-1.5" />
              Users
            </TabsTrigger>
          </TabsList>

          {/* SHOWS TAB */}
          <TabsContent value="shows">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Manage Shows</h2>
              <Button
                onClick={() => {
                  setEditingShow(null);
                  setShowShowForm(!showShowForm);
                }}
                className="bg-primary hover:bg-primary/90"
                data-ocid="admin.show.open_modal_button"
              >
                <Plus size={15} className="mr-2" /> Add Show
              </Button>
            </div>

            <AnimatePresence>
              {(showShowForm || editingShow) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mb-8 overflow-hidden"
                >
                  <div className="p-6 bg-card rounded-lg border border-border">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">
                        {editingShow ? "Edit Show" : "New Show"}
                      </h3>
                      <button
                        type="button"
                        onClick={() => {
                          setShowShowForm(false);
                          setEditingShow(null);
                        }}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    <ShowForm
                      existing={editingShow ?? undefined}
                      onSuccess={() => {
                        setShowShowForm(false);
                        setEditingShow(null);
                      }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {showsLoading ? (
              <div className="space-y-3" data-ocid="admin.shows.loading_state">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-lg" />
                ))}
              </div>
            ) : shows.length === 0 ? (
              <div
                className="text-center py-12 text-muted-foreground"
                data-ocid="admin.shows.empty_state"
              >
                <Film size={48} className="mx-auto mb-3 opacity-30" />
                <p>No shows yet. Create your first show!</p>
              </div>
            ) : (
              <div className="space-y-3" data-ocid="admin.shows.list">
                {shows.map((show, i) => (
                  <motion.div
                    key={show.id.toString()}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-center gap-4 p-4 bg-card rounded-lg border border-border hover:border-white/20 transition-colors"
                    data-ocid={`admin.show.item.${i + 1}`}
                  >
                    <div className="w-16 aspect-video bg-black/40 rounded overflow-hidden flex-shrink-0">
                      <img
                        src={
                          show.thumbnailBlob?.getDirectURL() ??
                          `https://picsum.photos/seed/${encodeURIComponent(show.title)}/160/90`
                        }
                        alt={show.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{show.title}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <Badge variant="outline" className="text-xs">
                          {show.genre}
                        </Badge>
                        {show.isPublic ? (
                          <Badge className="text-xs bg-green-600/20 text-green-400 border border-green-600/30">
                            Public
                          </Badge>
                        ) : (
                          <Badge className="text-xs bg-yellow-600/20 text-yellow-400 border border-yellow-600/30">
                            Private
                          </Badge>
                        )}
                        {show.isFeatured && (
                          <Badge className="text-xs bg-primary/20 text-primary border border-primary/30">
                            Featured
                          </Badge>
                        )}
                        {selectedShowId === show.id && episodes.length > 0 && (
                          <Badge className="text-xs bg-white/10 text-white/70 border border-white/20">
                            {episodes.length} ep
                            {episodes.length !== 1 ? "s" : ""}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleQuickAddEpisode(show.id)}
                        className="h-8 border-border hover:border-primary/60 hover:text-primary transition-colors"
                        title="Add Episode"
                        data-ocid={`admin.show.add_episode_button.${i + 1}`}
                      >
                        <Film size={12} className="mr-1" />
                        <Plus size={10} />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingShow(show);
                          setShowShowForm(false);
                        }}
                        className="h-8 w-8 p-0 border-border hover:border-white/40"
                        data-ocid={`admin.show.edit_button.${i + 1}`}
                      >
                        <Edit2 size={13} />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteShow(show.id)}
                        disabled={deleteMutation.isPending}
                        className="h-8 w-8 p-0 border-red-500/30 text-red-400 hover:bg-red-500/10"
                        data-ocid={`admin.show.delete_button.${i + 1}`}
                      >
                        <Trash2 size={13} />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* EPISODES TAB */}
          <TabsContent value="episodes">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Manage Episodes</h2>
              <Button
                onClick={() => setShowEpisodeForm(!showEpisodeForm)}
                className="bg-primary hover:bg-primary/90"
                data-ocid="admin.episode.open_modal_button"
                disabled={shows.length === 0}
              >
                <Plus size={15} className="mr-2" /> Add Episode
              </Button>
            </div>

            <AnimatePresence>
              {showEpisodeForm && shows.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mb-8 overflow-hidden"
                >
                  <div className="p-6 bg-card rounded-lg border border-border">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">New Episode</h3>
                      <button
                        type="button"
                        onClick={() => {
                          setShowEpisodeForm(false);
                          setQuickAddShowId(null);
                        }}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    <EpisodeForm
                      shows={shows}
                      initialShowId={quickAddShowId}
                      onSuccess={() => {
                        setShowEpisodeForm(false);
                        setQuickAddShowId(null);
                      }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Show selector */}
            <div className="mb-6">
              <Label className="mb-2 block">View episodes for show:</Label>
              <select
                value={selectedShowId?.toString() ?? ""}
                onChange={(e) =>
                  setSelectedShowId(
                    e.target.value ? BigInt(e.target.value) : null,
                  )
                }
                className="px-3 py-2 bg-card border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring min-w-[220px]"
                data-ocid="admin.episodes.show.select"
              >
                <option value="">— Select a show —</option>
                {shows.map((s) => (
                  <option key={s.id.toString()} value={s.id.toString()}>
                    {s.title}
                  </option>
                ))}
              </select>
            </div>

            {selectedShowId && episodes.length === 0 ? (
              <div
                className="text-center py-12 text-muted-foreground"
                data-ocid="admin.episodes.empty_state"
              >
                <Film size={40} className="mx-auto mb-3 opacity-30" />
                <p>No episodes for this show yet.</p>
                <Button
                  className="mt-4 bg-primary hover:bg-primary/90"
                  onClick={() => setShowEpisodeForm(true)}
                  data-ocid="admin.episodes.add.primary_button"
                >
                  <Plus size={14} className="mr-2" /> Add First Episode
                </Button>
              </div>
            ) : selectedShowId && sortedSeasons.length > 0 ? (
              <div className="space-y-4" data-ocid="admin.episodes.list">
                {sortedSeasons.map((sn) => (
                  <SeasonSection
                    key={sn}
                    seasonNumber={sn}
                    episodes={episodesBySeason[sn]}
                    showId={selectedShowId}
                    onDeleteEpisode={handleDeleteEpisode}
                    deletePending={deleteEpMutation.isPending}
                  />
                ))}
              </div>
            ) : !selectedShowId ? (
              <div className="text-center py-12 text-muted-foreground/50">
                <Film size={40} className="mx-auto mb-3 opacity-20" />
                <p>Select a show to view its episodes</p>
              </div>
            ) : null}
          </TabsContent>

          {/* USERS TAB */}
          <TabsContent value="users">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Registered Users</h2>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-sm text-muted-foreground">
                  {!usersLoading &&
                    `${users.length} user${
                      users.length !== 1 ? "s" : ""
                    } · live`}
                </span>
              </div>
            </div>
            {usersLoading ? (
              <div className="space-y-3" data-ocid="admin.users.loading_state">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-lg" />
                ))}
              </div>
            ) : users.length === 0 ? (
              <div
                className="text-center py-16 text-muted-foreground"
                data-ocid="admin.users.empty_state"
              >
                <Users size={48} className="mx-auto mb-3 opacity-30" />
                <p>No users have signed up yet.</p>
              </div>
            ) : (
              <div className="space-y-3" data-ocid="admin.users.list">
                {users.map((user: UserRecord, i: number) => (
                  <motion.div
                    key={user.principal.toString()}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-center gap-4 p-4 bg-card rounded-lg border border-border hover:border-white/20 transition-colors"
                    data-ocid={`admin.user.item.${i + 1}`}
                  >
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex-shrink-0">
                      <Users size={16} className="text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">
                        {user.name || "Anonymous"}
                      </p>
                      <p className="text-xs text-muted-foreground truncate font-mono mt-0.5">
                        {user.principal.toString().slice(0, 8)}...
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs text-muted-foreground">Joined</p>
                      <p className="text-sm font-medium">
                        {new Date(
                          Number(user.joinedAt) / 1_000_000,
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>
    </main>
  );
}
