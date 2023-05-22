import { gql } from "@apollo/client/core";
import { Link, Outlet, useLocation, useSearchParams } from "@solidjs/router";
import { createRenderEffect, createSignal, Show } from "solid-js";
import GqlClient from "../api/gqlClient";
import AddIcon from "../components/icon/AddIcon";
import LinkIcon from "../components/icon/LinkIcon";
import SiteHead from "../data/siteHead";
import SitePath from "../data/sitePath";
import { readCookie, saveCookie } from "../helpers/cookie";
import showGqlError from "../helpers/showGqlError";
import Account from "../types/account.type";
import Apprepo from "../types/apprepo.type";
import Header from "../components/header/Header";

export default function MainWrapper() {
  const location = useLocation();
  const [params, setParams] = useSearchParams<{ token?: string }>();
  const [accountAndApps, setAccountAndApps] = createSignal<{
    account: Account;
    apprepos: Apprepo[];
  }>();
  const [isLoaded, setIsLoaded] = createSignal(false);
  const [isLoadingGetAccountAndApps, setIsLoadingGetAccountAndApps] =
    createSignal(false);

  async function getAccountAndApps() {
    try {
      setIsLoadingGetAccountAndApps(true);

      const result = await GqlClient.client.query<{
        account: Account;
        apprepos: Apprepo[];
      }>({
        query: gql`
          query AccountAndApprepos {
            account {
              email
            }
            apprepos {
              name
              icon
              link
            }
          }
        `,
        fetchPolicy: "cache-first",
      });

      if (!result.data.account.email || !result.data.apprepos)
        throw result.errors;

      setAccountAndApps(result.data);
    } catch (e) {
      showGqlError(e);
    } finally {
      setIsLoadingGetAccountAndApps(false);
    }
  }

  createRenderEffect(() => {
    let token: string | undefined;
    if (params.token) {
      token = params.token;
      setParams({ token: undefined });
      saveCookie({ key: "token", value: token });
      GqlClient.update();
      return;
    } else {
      token = readCookie("token");
    }

    if (!token) {
      if (import.meta.env.VITE_SITE_ACCOUNT_URL) {
        window.location.replace(
          `${import.meta.env.VITE_SITE_ACCOUNT_URL}?redirect=${
            window.location.href
          }`
        );
      } else {
        throw new Error("VITE_SITE_ACCOUNT_URL not found.");
      }
    } else {
      setIsLoaded(true);
    }

    SiteHead.title = undefined;
  });

  createRenderEffect(() => {
    if (isLoaded()) {
      getAccountAndApps();
    }
  });

  return (
    <>
      <Header
        apprepos={accountAndApps()?.apprepos}
        email={accountAndApps()?.account.email}
      />

      <div class="fixed top-16 w-full md:hidden flex gap-x-2 border-b">
        <Link href={SitePath.homePath} class="px-4">
          <div class="relative py-2">
            <div
              class="flex items-center gap-x-1 hover:text-teal-500"
              classList={{
                "text-teal-500": location.pathname === SitePath.homePath,
              }}
            >
              <span class="flex text-2xl">
                <AddIcon />
              </span>
              <span>Create</span>
            </div>
            <Show when={location.pathname === SitePath.homePath}>
              <div class="absolute w-full bottom-0">
                <div class="w-full h-[3px] mx-1 bg-teal-500 rounded-t-full" />
              </div>
            </Show>
          </div>
        </Link>
        <Link href={SitePath.linksPath} class="px-4">
          <div class="relative py-2">
            <div
              class="flex items-center gap-x-1 hover:text-teal-500"
              classList={{
                "text-teal-500": location.pathname.startsWith(
                  SitePath.linksPath
                ),
              }}
            >
              <span class="flex text-2xl">
                <LinkIcon />
              </span>
              <span>Links</span>
            </div>
            <Show when={location.pathname.startsWith(SitePath.linksPath)}>
              <div class="absolute w-full bottom-0">
                <div class="w-full h-[3px] mx-1 bg-teal-500 rounded-t-full" />
              </div>
            </Show>
          </div>
        </Link>
      </div>

      <div class="h-screen pt-[105px] md:pt-16 flex">
        <div class="hidden md:block h-full pr-4 border-r space-y-2">
          <Link
            href={SitePath.homePath}
            class="w-full py-2 pl-8 pr-16 flex items-center gap-x-2 hover:bg-teal-50 rounded-r-full"
            classList={{
              "!bg-teal-100": location.pathname === SitePath.homePath,
            }}
          >
            <span class="flex text-2xl">
              <AddIcon />
            </span>
            <span>Create</span>
          </Link>
          <Link
            href={SitePath.linksPath}
            class="w-full py-2 pl-8 pr-16 flex items-center gap-x-2 hover:bg-teal-50 rounded-r-full"
            classList={{
              "!bg-teal-100": location.pathname.startsWith(SitePath.linksPath),
            }}
          >
            <span class="flex text-2xl">
              <LinkIcon />
            </span>
            <span>Links</span>
          </Link>
        </div>

        <div class="w-full overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </>
  );
}
