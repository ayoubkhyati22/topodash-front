import { DashboardMenuProps } from "types";
import { v4 as uuid } from "uuid";

export const DashboardMenu: DashboardMenuProps[] = [
  {
    id: uuid(),
    title: "Tableau de bord",
    icon: "home",
    link: "/",
    allowedRoles: ["ADMIN", "USER"],
  },
  {
    id: uuid(),
    title: "TOPOGRAPHE",
    grouptitle: true,
    allowedRoles: ["USER"],
  },
  {
    id: uuid(),
    title: "Clients",
    icon: "briefcase",
    link: "/clients",
    allowedRoles: ["ADMIN", "TOPOGRAPHE"],
  },
  {
    id: uuid(),
    title: "Collaborateurs",
    icon: "users",
    link: "/collaborateurs",
    allowedRoles: ["USER"],
  },
  {
    id: uuid(),
    title: "Projets",
    icon: "folder",
    link: "/projets",
    allowedRoles: ["USER"],
  },
  {
    id: uuid(),
    title: "Administration",
    grouptitle: true,
    allowedRoles: ["ADMIN"],
  },
  {
    id: uuid(),
    title: "Utilisateurs",
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
    allowedRoles: ["ADMIN","TOPOGRAPHE"],
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
  {
    id: uuid(),
    title: "Documentation",
    grouptitle: true,
  },
  {
    id: uuid(),
    title: "Docs",
    icon: "clipboard",
    link: "/documentation",
  },
  {
    id: uuid(),
    title: "Changelog",
    icon: "git-pull-request",
    link: "/changelog",
  },
];