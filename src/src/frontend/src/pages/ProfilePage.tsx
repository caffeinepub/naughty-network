import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Save, User } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../hooks/useAuth";
import {
  useCallerUserProfile,
  useCallerUserRole,
  useSaveUserProfile,
} from "../hooks/useQueries";

export default function ProfilePage() {
  const { isLoggedIn, username, logout } = useAuth();
  const qc = useQueryClient();

  const { data: profile, isLoading } = useCallerUserProfile();
  const { data: role } = useCallerUserRole();
  const saveMutation = useSaveUserProfile();

  const [name, setName] = useState("");

  useEffect(() => {
    if (profile?.name) setName(profile.name);
    else if (username) setName(username);
  }, [profile?.name, username]);

  const handleSave = async () => {
    try {
      await saveMutation.mutateAsync({ name });
      toast.success("Profile saved!");
    } catch {
      toast.error("Failed to save profile.");
    }
  };

  const handleLogout = async () => {
    await logout();
    qc.clear();
  };

  return (
    <main
      className="min-h-screen pt-24 pb-16 max-w-screen-xl mx-auto px-4 md:px-8"
      data-ocid="profile.page"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-8">
          Profile
        </h1>

        <div className="max-w-md">
          {isLoading ? (
            <div className="space-y-4" data-ocid="profile.loading_state">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-2xl font-bold">
                  {name ? name[0]?.toUpperCase() : <User size={28} />}
                </div>
                <div>
                  <p className="font-semibold">{username ?? "Anonymous"}</p>
                  {role && (
                    <Badge
                      variant="outline"
                      className="text-xs mt-1 border-primary/50 text-primary capitalize"
                    >
                      {role}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Edit name */}
              <div className="space-y-2">
                <Label htmlFor="profile-name">Display Name</Label>
                <Input
                  id="profile-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="bg-card border-border"
                  data-ocid="profile.name.input"
                />
              </div>

              <Button
                onClick={handleSave}
                disabled={saveMutation.isPending || !name.trim()}
                className="bg-primary hover:bg-primary/90"
                data-ocid="profile.save.button"
              >
                {saveMutation.isPending ? (
                  <>
                    <Loader2 size={15} className="mr-2 animate-spin" />{" "}
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={15} className="mr-2" /> Save Profile
                  </>
                )}
              </Button>

              <div className="pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground mb-2">Account</p>
                <p className="text-sm font-medium">{username}</p>
              </div>

              {isLoggedIn && (
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="border-red-500/40 text-red-400 hover:bg-red-500/10"
                  data-ocid="profile.logout.button"
                >
                  Sign Out
                </Button>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </main>
  );
}
