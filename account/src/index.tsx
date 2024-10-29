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

render(() => <Router>{routes}</Router>, root!);
