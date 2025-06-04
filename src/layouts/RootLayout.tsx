//import node module libraries
import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "components/navbars/sidebar/Sidebar";
import Header from "components/navbars/topbar/Header";
import { useAuth } from "../AuthContext";

const RootLayout = () => {
  const [showMenu, setShowMenu] = useState(true);
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  console.log("Current user:", user);

  const ToggleMenu = () => {
    return setShowMenu(!showMenu);
  };

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      navigate("/auth/sign-in");
      return;
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return null;

  return (
    <section className="bg-light">
      <div id="db-wrapper" className={`${showMenu ? "" : "toggled"}`}>
        <div className="navbar-vertical navbar">
          <Sidebar showMenu={showMenu} toggleMenu={ToggleMenu} />
        </div>
        <div id="page-content">
          <div className="header">
            <Header toggleMenu={ToggleMenu} />
          </div>
          <Outlet />
        </div>
      </div>
    </section>
  );
};

export default RootLayout;