import { Outlet, useLocation, useNavigate } from "@solidjs/router";
import { createRenderEffect } from "solid-js";
import SitePath from "../data/sitePath";
import { getTokenFromCookie } from "../helpers/cookie";

export default function MainWrapper() {
  const location = useLocation();
  const navigate = useNavigate();

  createRenderEffect(() => {
    const token = getTokenFromCookie();
    const isInAuthScreen =
      location.pathname.startsWith(SitePath.signInPath) ||
      location.pathname.startsWith(SitePath.signUpPath);

    if (!token) {
      if (!isInAuthScreen) {
        navigate(SitePath.signInPath, { replace: true });
      }
    } else {
      if (isInAuthScreen) {
        navigate(SitePath.homePath, { replace: true });
      }
    }
  });

  return <Outlet />;
}
