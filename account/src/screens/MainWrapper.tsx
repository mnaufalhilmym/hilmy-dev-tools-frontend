import { useLocation, useNavigate, useSearchParams } from "@solidjs/router";
import { createRenderEffect, JSX } from "solid-js";
import SitePath from "../data/sitePath";
import { readCookie } from "../helpers/cookie";
import Head from "../components/head/Head";
import { Toaster } from "solid-toast";
import SiteHead from "../data/siteHead";
import GqlClient from "../api/gqlClient";

interface Props {
  children?: JSX.Element;
}

export default function MainWrapper(props: Props) {
  const location = useLocation();
  const [params, setParams] = useSearchParams<{ redirect?: string }>();
  const navigate = useNavigate();

  createRenderEffect(() => {
    SiteHead.init();
    GqlClient.init();
  });

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

  return (
    <>
      <Head />
      {props.children}
      <Toaster position="top-right" gutter={8} />
    </>
  );
}
