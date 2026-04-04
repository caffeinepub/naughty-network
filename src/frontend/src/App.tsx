import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createHashHistory,
  createRootRoute,
  createRoute,
  createRouter,
  useNavigate,
} from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import Footer from "./components/Footer";
import IntroAnimation from "./components/IntroAnimation";
import Navbar from "./components/Navbar";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import AdminPage from "./pages/AdminPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import MyListPage from "./pages/MyListPage";
import ProfilePage from "./pages/ProfilePage";
import SeriesPage from "./pages/SeriesPage";
import ShowPage from "./pages/ShowPage";
import UsernameSetupPage from "./pages/UsernameSetupPage";

// Auth guard wrapper for protected routes
function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, isLoading } = useAuth();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  if (!isLoggedIn) {
    setTimeout(() => navigate({ to: "/login" }), 0);
    return null;
  }

  return <>{children}</>;
}

function RootLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}

const rootRoute = createRootRoute();

// Login route (standalone, no Navbar/Footer)
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
});

// Public layout route (Navbar + Footer, no auth required)
const layoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "layout",
  component: RootLayout,
});

// Public routes
const indexRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/",
  component: HomePage,
});

const showRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/show/$id",
  component: ShowPage,
});

const seriesRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: "/series",
  component: SeriesPage,
});

// Protected layout: same RootLayout but wrapped in AuthGuard
function ProtectedLayout() {
  return (
    <AuthGuard>
      <RootLayout />
    </AuthGuard>
  );
}

const protectedRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "protected",
  component: ProtectedLayout,
});

const myListRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/my-list",
  component: MyListPage,
});

const adminRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/admin",
  component: AdminPage,
});

const profileRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: "/profile",
  component: ProfilePage,
});

const routeTree = rootRoute.addChildren([
  loginRoute,
  layoutRoute.addChildren([indexRoute, showRoute, seriesRoute]),
  protectedRoute.addChildren([myListRoute, adminRoute, profileRoute]),
]);

const hashHistory = createHashHistory();
const router = createRouter({ routeTree, history: hashHistory });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// Username setup overlay -- shown when user has II identity but no username yet
function UsernameSetupOverlay() {
  const { needsUsername } = useAuth();
  if (!needsUsername) return null;
  return <UsernameSetupPage />;
}

export default function App() {
  return (
    <AuthProvider>
      <IntroAnimation />
      <UsernameSetupOverlay />
      <RouterProvider router={router} />
      <Toaster richColors position="bottom-right" />
    </AuthProvider>
  );
}
