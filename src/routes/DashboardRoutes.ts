import { DashboardMenuProps } from "types";
import { v4 as uuid } from "uuid";

export const DashboardMenu: DashboardMenuProps[] = [
  {
    id: uuid(),
    title: "Tableau de bord",
    icon: "home",
    link: "/",
  },
  {
    id: uuid(),
    title: "TOPOGRAPHE",
    grouptitle: true,
  },
  {
    id: uuid(),
    title: "Clients",
    icon: "briefcase",
    link: "/clients",
  },
  {
    id: uuid(),
    title: "Collaborateurs",
    icon: "users",
    link: "/Collaborateurs",
  },
  {
    id: uuid(),
    title: "Projets",
    icon: "folder",
    link: "/projets",
  },
  {
    id: uuid(),
    title: "Administration",
    grouptitle: true,
  },
  {
    id: uuid(),
    title: "Utilisateurs",
    icon: "users",
    link: "/users",
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
