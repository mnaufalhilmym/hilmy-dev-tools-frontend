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
    children: [
      {
        path: "/",
        component: lazy(() => import("./screens/MainScreen")),
      },
      {
        path: getLastScreenPath(SitePath.signInPath),
        children: [
          {
            path: "/",
            component: lazy(() => import("./screens/signIn/SignInScreen")),
          },
          {
            path: getLastScreenPath(SitePath.resetPasswordPath),
            component: lazy(
              () => import("./screens/signIn/resetPassword/ResetPasswordScreen")
            ),
          },
        ],
      },
      {
        path: getLastScreenPath(SitePath.signUpPath),
        children: [
          {
            path: "/",
            component: lazy(() => import("./screens/signUp/SignUpScreen")),
          },
          {
            path: getLastScreenPath(SitePath.verifySignUpPath),
            component: lazy(
              () => import("./screens/signUp/SignUpVerifyScreen")
            ),
          },
        ],
      },
    ],
  },
];

const App: Component = () => {
  const Routes = useRoutes(routes);

  createRenderEffect(async () => {
    await Promise.all([GqlClient.init(), SiteHead.init()]);
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
