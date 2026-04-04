import { Input } from "@/components/ui/input";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ChevronDown,
  ListVideo,
  LogOut,
  Menu,
  Search,
  Settings,
  ShieldCheck,
  User,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useRegisterUser } from "../hooks/useQueries";

export default function Navbar() {
  const { identity, login, clear, loginStatus } = useInternetIdentity();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const isAuthenticated = !!identity;
  const { mutate: registerUser } = useRegisterUser();

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    if (identity && !identity.getPrincipal().isAnonymous()) {
      registerUser();
    }
  }, [identity, registerUser]);

  const handleLogout = async () => {
    await clear();
    qc.clear();
    setProfileOpen(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate({ to: "/series", search: { q: searchTerm } } as never);
      setSearchOpen(false);
      setSearchTerm("");
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-gradient-to-b from-black/90 to-transparent backdrop-blur-sm border-b border-white/5">
      <div className="max-w-screen-2xl mx-auto px-4 md:px-8 h-full flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex-shrink-0" data-ocid="nav.link">
          <span className="text-xl md:text-2xl font-black uppercase tracking-tight">
            <span className="text-primary">NAUGHTY</span>
            <span className="text-foreground ml-1">NETWORK</span>
          </span>
        </Link>

        {/* Center nav links */}
        <div className="hidden md:flex items-center gap-8">
          <Link
            to="/"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            data-ocid="nav.home.link"
          >
            Home
          </Link>
          <Link
            to="/series"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            data-ocid="nav.series.link"
          >
            Series
          </Link>
          <Link
            to="/my-list"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            data-ocid="nav.mylist.link"
          >
            My List
          </Link>
          <Link
            to="/admin"
            className="text-sm font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1.5"
            data-ocid="nav.admin.link"
          >
            <ShieldCheck size={14} />
            Admin
          </Link>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <AnimatePresence>
            {searchOpen && (
              <motion.form
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 220, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
                onSubmit={handleSearchSubmit}
              >
                <Input
                  autoFocus
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search shows..."
                  className="h-8 bg-black/60 border-white/20 text-sm"
                  data-ocid="nav.search_input"
                />
              </motion.form>
            )}
          </AnimatePresence>
          <button
            type="button"
            onClick={() => setSearchOpen(!searchOpen)}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Search"
            data-ocid="nav.search_button"
          >
            <Search size={18} />
          </button>

          {/* Profile or Login */}
          {isAuthenticated ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-1.5 p-1.5 rounded-md hover:bg-white/10 transition-colors"
                data-ocid="nav.profile.button"
              >
                <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center">
                  <User size={14} className="text-primary-foreground" />
                </div>
                <ChevronDown size={14} className="text-muted-foreground" />
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-lg shadow-2xl overflow-hidden z-50"
                    data-ocid="nav.dropdown_menu"
                  >
                    <Link
                      to="/my-list"
                      className="flex items-center gap-2.5 px-4 py-3 text-sm hover:bg-white/10 transition-colors"
                      onClick={() => setProfileOpen(false)}
                      data-ocid="nav.mylist.link"
                    >
                      <ListVideo size={15} /> My List
                    </Link>
                    <Link
                      to="/profile"
                      className="flex items-center gap-2.5 px-4 py-3 text-sm hover:bg-white/10 transition-colors"
                      onClick={() => setProfileOpen(false)}
                      data-ocid="nav.profile.link"
                    >
                      <Settings size={15} /> Profile
                    </Link>
                    <Link
                      to="/admin"
                      className="flex items-center gap-2.5 px-4 py-3 text-sm hover:bg-white/10 transition-colors text-primary"
                      onClick={() => setProfileOpen(false)}
                      data-ocid="nav.admin.link"
                    >
                      <ShieldCheck size={15} /> Admin
                    </Link>
                    <div className="border-t border-border" />
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-3 text-sm hover:bg-white/10 transition-colors text-red-400"
                      data-ocid="nav.logout.button"
                    >
                      <LogOut size={15} /> Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => login()}
              disabled={loginStatus === "logging-in"}
              className="hidden md:flex items-center px-4 py-1.5 bg-primary text-primary-foreground text-sm font-semibold rounded hover:bg-primary/90 transition-colors disabled:opacity-50"
              data-ocid="nav.login.button"
            >
              {loginStatus === "logging-in" ? "Logging in..." : "Sign In"}
            </button>
          )}

          {/* Mobile menu toggle */}
          <button
            type="button"
            className="md:hidden p-2 text-muted-foreground hover:text-foreground"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
            data-ocid="nav.menu.button"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-black/95 border-t border-white/10 overflow-hidden"
          >
            <div className="flex flex-col px-4 py-4 gap-1">
              <Link
                to="/"
                className="py-3 text-sm font-medium hover:text-primary transition-colors"
                onClick={() => setMenuOpen(false)}
                data-ocid="nav.mobile.home.link"
              >
                Home
              </Link>
              <Link
                to="/series"
                className="py-3 text-sm font-medium hover:text-primary transition-colors"
                onClick={() => setMenuOpen(false)}
                data-ocid="nav.mobile.series.link"
              >
                Series
              </Link>
              <Link
                to="/my-list"
                className="py-3 text-sm font-medium hover:text-primary transition-colors"
                onClick={() => setMenuOpen(false)}
                data-ocid="nav.mobile.mylist.link"
              >
                My List
              </Link>
              <Link
                to="/admin"
                className="py-3 text-sm font-medium text-primary flex items-center gap-1.5"
                onClick={() => setMenuOpen(false)}
                data-ocid="nav.mobile.admin.link"
              >
                <ShieldCheck size={14} /> Admin
              </Link>
              {isAuthenticated ? (
                <>
                  <Link
                    to="/profile"
                    className="py-3 text-sm font-medium hover:text-primary transition-colors"
                    onClick={() => setMenuOpen(false)}
                    data-ocid="nav.mobile.profile.link"
                  >
                    Profile
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="py-3 text-sm font-medium text-red-400 text-left"
                    data-ocid="nav.mobile.logout.button"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    login();
                    setMenuOpen(false);
                  }}
                  className="py-3 text-sm font-semibold text-primary text-left"
                  data-ocid="nav.mobile.login.button"
                >
                  Sign In
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
