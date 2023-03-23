import { RouteDefinition, useRoutes } from "@solidjs/router";
import { Component, createRenderEffect, lazy } from "solid-js";
import { Toaster } from "solid-toast";
import GqlClient from "./api/gqlClient";
import Head from "./components/head/Head";
import { CenterModalWrapper } from "./components/modal/CenterModal";
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
        path: getLastScreenPath(SitePath.signInPath),
        children: [
          {
            path: "/",
            component: lazy(() => import("./screens/signIn/SignInScreen")),
          },
          {
            path: getLastScreenPath(SitePath.requestResetPasswordPath),
            children: [
              {
                path: "/",
                component: lazy(
                  () =>
                    import(
                      "./screens/signIn/resetPassword/RequestResetPasswordScreen"
                    )
                ),
              },
              {
                path: getLastScreenPath(
                  SitePath.verifyRequestResetPasswordPath
                ),
                component: lazy(
                  () =>
                    import(
                      "./screens/signIn/resetPassword/VerifyRequestResetPasswordScreen"
                    )
                ),
              },
              {
                path: getLastScreenPath(SitePath.resetPasswordPath),
                component: lazy(
                  () =>
                    import("./screens/signIn/resetPassword/ResetPasswordScreen")
                ),
              },
            ],
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
      {
        path: getLastScreenPath(SitePath.passwordPath),
        component: lazy(() => import("./screens/password/MainPasswordScreen")),
      },
      {
        path: getLastScreenPath(SitePath.emailPath),
        children: [
          {
            path: "/",
            component: lazy(() => import("./screens/email/MainEmailScreen")),
          },
          {
            path: getLastScreenPath(SitePath.verifyEmailPath),
            component: lazy(() => import("./screens/email/VerifyEmailScreen")),
          },
        ],
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
      <CenterModalWrapper />
    </>
  );
};

export default App;
