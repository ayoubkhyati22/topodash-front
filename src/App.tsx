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
import Client from "pages/dashboard/user/Client";
import Collaborateur from "pages/dashboard/user/Collaborateur";
import Projet from "pages/dashboard/user/Projet";
import User from "pages/dashboard/admin/users/User";

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
          id: "collaborateur",
          path: "/collaborateurs",
          Component: Collaborateur,
        },
        {
          id: "projet",
          path: "/projets",
          Component: Projet,
        },
        {
          id: "user",
          path: "/users",
          Component: User,
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
