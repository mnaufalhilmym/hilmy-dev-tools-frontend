/* @refresh reload */
import { render } from "solid-js/web";

import "./index.css";
import { RouteDefinition, Router } from "@solidjs/router";
import { lazy } from "solid-js";
import getLastScreenPath from "./helpers/getLastScreenPath";
import SitePath from "./data/sitePath";

const root = document.getElementById("root");

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    "Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got mispelled?"
  );
}

const routes: RouteDefinition[] = [
  {
    path: SitePath.homePath,
    component: lazy(() => import("./screens/MainWrapper")),
    children: [
      {
        path: "/",
        component: lazy(() => import("./screens/MainScreen")),
      },
      {
        path: `${getLastScreenPath(SitePath.linksPath)}/:id?`,
        component: lazy(() => import("./screens/links/[id]/MainLinksScreen")),
      },
    ],
  },
];

render(() => <Router>{routes}</Router>, root!);
