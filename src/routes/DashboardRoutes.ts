import { DashboardMenuProps } from "types";
import { v4 as uuid } from "uuid";

export const DashboardMenu: DashboardMenuProps[] = [
  // Tous : Tableau de bord
  {
    id: uuid(),
    title: "Tableau de bord",
    icon: "home",
    link: "/",
    allowedRoles: ["ADMIN", "TOPOGRAPHE"],
  },

  // 👑 ADMIN : Administration
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
    allowedRoles: ["ADMIN"],
  },
  {
    id: uuid(),
    title: "Techniciens",
    icon: "users",
    link: "/techniciens",
    allowedRoles: ["ADMIN"],
  },
  {
    id: uuid(),
    title: "Projets",
    icon: "folder",
    link: "/projets",
    allowedRoles: ["ADMIN"],
  },

  // 👑 ADMIN : Référentiel
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

  // 🔐 TOPOGRAPHE : Gestion
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
  {
    id: uuid(),
    title: "Techniciens",
    icon: "users",
    link: "/techniciens",
    allowedRoles: ["TOPOGRAPHE"],
  },
  {
    id: uuid(),
    title: "Projets",
    icon: "folder",
    link: "/projets",
    allowedRoles: ["TOPOGRAPHE"],
  },

  // Documentation : visible pour les deux rôles
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
