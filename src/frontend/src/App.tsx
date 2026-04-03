import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createHashHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import Footer from "./components/Footer";
import IntroAnimation from "./components/IntroAnimation";
import Navbar from "./components/Navbar";
import AdminPage from "./pages/AdminPage";
import HomePage from "./pages/HomePage";
import MyListPage from "./pages/MyListPage";
import ProfilePage from "./pages/ProfilePage";
import SeriesPage from "./pages/SeriesPage";
import ShowPage from "./pages/ShowPage";

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

const rootRoute = createRootRoute({ component: RootLayout });

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const showRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/show/$id",
  component: ShowPage,
});

const seriesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/series",
  component: SeriesPage,
});

const myListRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/my-list",
  component: MyListPage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminPage,
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/profile",
  component: ProfilePage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  showRoute,
  seriesRoute,
  myListRoute,
  adminRoute,
  profileRoute,
]);

const hashHistory = createHashHistory();
const router = createRouter({ routeTree, history: hashHistory });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <>
      <IntroAnimation />
      <RouterProvider router={router} />
      <Toaster richColors position="bottom-right" />
    </>
  );
}
