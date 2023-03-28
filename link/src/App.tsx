import { RouteDefinition, useRoutes } from "@solidjs/router";
import { Component, createRenderEffect, lazy } from "solid-js";
import { Toaster } from "solid-toast";
import GqlClient from "./api/gqlClient";
import Head from "./components/head/Head";
import SiteHead from "./data/siteHead";
import SitePath from "./data/sitePath";
import getLastScreenPath from "./helpers/getLastScreenPath";

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

const App: Component = () => {
  const Routes = useRoutes(routes);

  createRenderEffect(() => {
    SiteHead.init();
    GqlClient.init();
  });

  return (
    <>
      <Head />
      <Routes />
      <Toaster position="top-right" gutter={8} />
    </>
  );
};

export default App;
