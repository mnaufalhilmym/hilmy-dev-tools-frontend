import {
  Outlet,
  useLocation,
  useNavigate,
  useSearchParams,
} from "@solidjs/router";
import { createRenderEffect } from "solid-js";
import SitePath from "../data/sitePath";
import { readCookie } from "../helpers/cookie";

export default function MainWrapper() {
  const location = useLocation();
  const [params, setParams] = useSearchParams<{ redirect?: string }>();
  const navigate = useNavigate();

  createRenderEffect(() => {
    const token = readCookie("token");
    const isInAuthScreen =
      location.pathname.startsWith(SitePath.signInPath) ||
      location.pathname.startsWith(SitePath.signUpPath);

    if (params.redirect) {
      sessionStorage.setItem("redirect", params.redirect);
    }
    if (!token) {
      if (!isInAuthScreen) {
        navigate(SitePath.signInPath, { replace: true });
      }
    } else {
      if (isInAuthScreen) {
        navigate(SitePath.homePath, { replace: true });
      }
    }
    if (params.redirect) {
      setParams({ redirect: undefined });
    }
  });

  return <Outlet />;
}
