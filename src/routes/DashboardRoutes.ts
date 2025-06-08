import { DashboardMenuProps } from "types";
import { v4 as uuid } from "uuid";

export const DashboardMenu: DashboardMenuProps[] = [
  // Accessible à tous
  {
    id: uuid(),
    title: "Tableau de bord",
    icon: "home",
    link: "/",
    allowedRoles: ["ADMIN", "TOPOGRAPHE"],
  },

  // ADMIN section
  {
    id: uuid(),
    title: "Administration",
    grouptitle: true,
    allowedRoles: ["ADMIN"],
  },
  {
    id: uuid(),
    title: "Tous les utilisateurs",
    icon: "users",
    link: "/users",
    allowedRoles: ["ADMIN"],
  },
  {
    id: uuid(),
    title: "Topographes",
    icon: "users",
    link: "/topographes",
    allowedRoles: ["ADMIN"],
  },
  {
    id: uuid(),
    title: "Clients",
    icon: "briefcase",
    link: "/clients",
    allowedRoles: ["ADMIN"],
  },

  {
    id: uuid(),
    title: "Réferentiel",
    grouptitle: true,
    allowedRoles: ["ADMIN"],
  },
  {
    id: uuid(),
    title: "Pays",
    icon: "globe",
    link: "/countries",
    allowedRoles: ["ADMIN"],
  },

  // TOPOGRAPHE section
  {
    id: uuid(),
    title: "Gestion",
    grouptitle: true,
    allowedRoles: ["TOPOGRAPHE"],
  },
  {
    id: uuid(),
    title: "Clients",
    icon: "briefcase",
    link: "/clients",
    allowedRoles: ["TOPOGRAPHE"],
  },

  // Documentation (visible pour tous)
  {
    id: uuid(),
    title: "Documentation",
    grouptitle: true,
    allowedRoles: ["ADMIN", "TOPOGRAPHE"],
  },
  {
    id: uuid(),
    title: "Docs",
    icon: "clipboard",
    link: "/documentation",
    allowedRoles: ["ADMIN", "TOPOGRAPHE"],
  },
  {
    id: uuid(),
    title: "Changelog",
    icon: "git-pull-request",
    link: "/changelog",
    allowedRoles: ["ADMIN", "TOPOGRAPHE"],
  },
];
