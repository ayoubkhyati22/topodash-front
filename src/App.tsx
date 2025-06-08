//import node module libraries
import { createBrowserRouter, RouterProvider } from "react-router-dom";

//import routes files
import AuthenticationLayout from "layouts/AuthenticationLayout";
import RootLayout from "layouts/RootLayout";
import SignIn from "./pages/auth/SignIn";
import ForgetPassword from "pages/auth/ForgetPassword";
import SignUp from "./pages/auth/SignUp";
import Dashboard from "pages/dashboard/Index";
import NotFound from "pages/dashboard/pages/NotFound";
import Documentation from "pages/dashboard/Documentation";
import ChangeLog from "pages/dashboard/Changelog";
import Collaborateur from "pages/dashboard/user/Collaborateur";
import User from "pages/dashboard/admin/users/User";
import Country from "pages/dashboard/admin/referentiel/coutries/Country";
import Topographe from "pages/dashboard/shared/topographes/Topographe";
import TopographeDetailPage from "pages/dashboard/shared/topographes/TopographeDetailPage";
import Client from "pages/dashboard/shared/clients/Client";
import ClientDetailPage from "pages/dashboard/shared/clients/ClientDetailPage";
import Technicien from "pages/dashboard/shared/techniciens/Technicien";
import TechnicienDetailPage from "pages/dashboard/shared/techniciens/TechnicienDetailPage";
import Project from "pages/dashboard/shared/projets/Project";
import ProjectDetailPage from "pages/dashboard/shared/projets/ProjectDetailPage";

const App = () => {
  const router = createBrowserRouter([
    {
      id: "root",
      path: "/",
      Component: RootLayout,
      errorElement: <NotFound />,
      children: [
        {
          id: "dashboard",
          path: "/",
          Component: Dashboard,
        },
        {
          id: "client",
          path: "/clients",
          Component: Client,
        },
        {
          id: "client-detail",
          path: "/clients/:id",
          Component: ClientDetailPage,
        },
        {
          id: "collaborateur",
          path: "/collaborateurs",
          Component: Collaborateur,
        },
        {
          id: "projet",
          path: "/projects",
          Component: Project,
        },
        {
          id: "projet-detail",
          path: "/projects/:id",
          Component: ProjectDetailPage,
        },
        {
          id: "user",
          path: "/users",
          Component: User,
        },
        {
          id: "topographe",
          path: "/topographes",
          Component: Topographe,
        },
        {
          id: "topographe-detail",
          path: "/topographes/:id",
          Component: TopographeDetailPage,
        },
        {
          id: "technicien",
          path: "/techniciens",
          Component: Technicien,
        },
        {
          id: "technicien-detail",
          path: "/techniciens/:id",
          Component: TechnicienDetailPage,
        },
        {
          id: "country",
          path: "/countries",
          Component: Country,
        },
        {
          id: "documentation",
          path: "/documentation",
          Component: Documentation,
        },
        {
          id: "changelog",
          path: "/changelog",
          Component: ChangeLog,
        },               
      ],
    },
    {
      id: "auth",
      path: "/auth",
      Component: AuthenticationLayout,
      children: [
        {
          id: "sign-in",
          path: "sign-in",
          Component: SignIn,
        },
        {
          id: "sign-up",
          path: "sign-up",
          Component: SignUp,
        },
        {
          id: "forget-password",
          path: "forget-password",
          Component: ForgetPassword,
        },
      ],
    },
  ]);
  return <RouterProvider router={router} />;
};

export default App;