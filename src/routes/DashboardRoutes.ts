import { DashboardMenuProps } from "types";
import { v4 as uuid } from "uuid";

export const DashboardMenu: DashboardMenuProps[] = [
  {
    id: uuid(),
    title: "Tableau de bord",
    icon: "home",
    link: "/",
    allowedRoles: ["ADMIN", "USER", "TOPOGRAPHE", "MANAGER"], // Available to all
  },
  {
    id: uuid(),
    title: "TOPOGRAPHE",
    grouptitle: true,
    allowedRoles: ["ADMIN", "TOPOGRAPHE"],
  },
  {
    id: uuid(),
    title: "Clients",
    icon: "briefcase",
    link: "/clients",
    allowedRoles: ["ADMIN", "TOPOGRAPHE", "MANAGER"],
  },
  {
    id: uuid(),
    title: "Collaborateurs",
    icon: "users",
    link: "/collaborateurs",
    allowedRoles: ["ADMIN", "TOPOGRAPHE", "MANAGER"],
  },
  {
    id: uuid(),
    title: "Projets",
    icon: "folder",
    link: "/projets",
    allowedRoles: ["ADMIN", "TOPOGRAPHE", "USER", "MANAGER"],
  },
  {
    id: uuid(),
    title: "Administration",
    grouptitle: true,
    allowedRoles: ["ADMIN"], // Only admins
  },
  {
    id: uuid(),
    title: "Utilisateurs",
    icon: "users",
    link: "/users",
    allowedRoles: ["ADMIN"], // Only admins
  },
  {
    id: uuid(),
    title: "Documentation",
    grouptitle: true,
    // No allowedRoles = show to everyone
  },
  {
    id: uuid(),
    title: "Docs",
    icon: "clipboard",
    link: "/documentation",
    // No allowedRoles = show to everyone
  },
  {
    id: uuid(),
    title: "Changelog",
    icon: "git-pull-request",
    link: "/changelog",
    // No allowedRoles = show to everyone
  },
];