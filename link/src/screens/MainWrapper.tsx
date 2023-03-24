import { gql } from "@apollo/client/core";
import { Link, Outlet, useLocation, useSearchParams } from "@solidjs/router";
import { createRenderEffect, createSignal, For, Show } from "solid-js";
import GqlClient from "../api/gqlClient";
import AddIcon from "../components/icon/AddIcon";
import AppsIcon from "../components/icon/AppsIcon";
import LinkIcon from "../components/icon/LinkIcon";
import Logout from "../components/icon/Logout";
import ManageAccounts from "../components/icon/ManageAccounts";
import LoadingSkeleton from "../components/loading/LoadingSkeleton";
import SiteHead from "../data/siteHead";
import SitePath from "../data/sitePath";
import { deleteCookie, readCookie, saveCookie } from "../helpers/cookie";
import getBgProfilePicture from "../helpers/getBgProfilePicture";
import showGqlError from "../helpers/showGqlError";
import Account from "../types/account.type";
import Apprepo from "../types/apprepo.type";
import styles from "./MainWrapper.module.css";

export default function MainWrapper() {
  const location = useLocation();
  const [params, setParams] = useSearchParams<{ token?: string }>();
  const [account, setAccount] = createSignal<Account>();
  const [apps, setApps] = createSignal<Apprepo[]>([]);
  const [headerModalShown, setHeaderModalShown] = createSignal<string>();
  const [isLoaded, setIsLoaded] = createSignal(false);
  const [isLoadingGetAccount, setIsLoadingGetAccount] = createSignal(false);
  const [isLoadingGetApps, setIsLoadingGetApps] = createSignal(false);

  async function getAccountAndApps() {
    try {
      setIsLoadingGetAccount(true);

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

      setAccount(result.data.account);
      setApps(result.data.apprepos);
    } catch (e) {
      showGqlError(e);
    } finally {
      setIsLoadingGetAccount(false);
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

  function signOut() {
    deleteCookie("token");
    GqlClient.update();
    window.location.reload();
  }

  function toggleModalAccount() {
    if (headerModalShown() === "account") {
      setHeaderModalShown();
    } else {
      setHeaderModalShown("account");
    }
  }

  function toggleModalApps() {
    if (headerModalShown() === "apps") {
      setHeaderModalShown();
    } else {
      setHeaderModalShown("apps");
    }
  }

  return (
    <Show when={isLoaded()}>
      <div class="fixed z-50 top-0 w-full">
        <div class="py-3 px-3.5 flex justify-between items-center">
          <Link href={SitePath.homePath}>
            <h1 class="px-1.5 font-bold text-xl">
              {import.meta.env.VITE_SITE_NAME}
            </h1>
          </Link>
          <div class="flex gap-x-2 items-center">
            <button
              type="button"
              onclick={toggleModalApps}
              class="flex p-2 hover:bg-black/5 active:bg-black/10 rounded-full transition duration-200"
              classList={{
                "!bg-black/10": headerModalShown() === "apps",
              }}
            >
              <AppsIcon />
            </button>
            <button
              type="button"
              onclick={toggleModalAccount}
              class="p-1 hover:bg-black/5 active:bg-black/10 rounded-full transition duration-200"
              classList={{
                "!bg-black/10": headerModalShown() === "account",
              }}
            >
              <div
                class="w-8 h-8 mx-auto flex items-center justify-center text-white rounded-full overflow-hidden"
                style={{
                  "background-color": account()?.email
                    ? getBgProfilePicture(account()!.email[0].toUpperCase())
                    : "transparent",
                }}
              >
                <Show
                  when={account()?.email}
                  fallback={<LoadingSkeleton width="100%" height="100%" />}
                >
                  {account()?.email[0].toUpperCase()}
                </Show>
              </div>
            </button>
          </div>
        </div>

        <ModalApps />
        <ModalAccount />
      </div>

      <div class="h-screen pt-16 flex">
        <div class="h-full pr-4 border-r space-y-2">
          <Link
            href={SitePath.homePath}
            class="w-full py-2 pl-8 pr-16 flex items-center gap-x-2 hover:bg-teal-50 rounded-r-full"
            classList={{
              "!bg-teal-100": location.pathname === SitePath.homePath,
            }}
          >
            <AddIcon />
            <span>Create</span>
          </Link>
          <Link
            href={SitePath.linksPath}
            class="w-full py-2 pl-8 pr-16 flex items-center gap-x-2 hover:bg-teal-50 rounded-r-full"
            classList={{
              "!bg-teal-100": location.pathname.startsWith(SitePath.linksPath),
            }}
          >
            <LinkIcon />
            <span>Links</span>
          </Link>
        </div>

        <div class="relative w-full">
          <Outlet />
        </div>
      </div>
    </Show>
  );

  function ModalAccount() {
    return (
      <Show when={headerModalShown() === "account"}>
        <div class="absolute right-0 min-w-0 max-w-full px-4">
          <div class="min-w-0 w-full max-w-sm bg-white drop-shadow-lg rounded-3xl border border-teal-200 overflow-hidden">
            <div class="p-2 bg-teal-100/40">
              <div class="p-4 bg-white rounded-2xl">
                <div class="flex items-center gap-x-3.5">
                  <div
                    class="flex-none w-16 h-16 mx-auto flex items-center justify-center text-4xl text-white rounded-full overflow-hidden"
                    style={{
                      "background-color": account()?.email
                        ? getBgProfilePicture(account()!.email[0].toUpperCase())
                        : "transparent",
                    }}
                  >
                    <Show
                      when={account()?.email}
                      fallback={<LoadingSkeleton width="100%" height="100%" />}
                    >
                      {account()?.email[0].toUpperCase()}
                    </Show>
                  </div>
                  <div class="min-w-0 flex-1">
                    <Show
                      when={account()?.email}
                      fallback={
                        <div class="mx-auto rounded overflow-hidden">
                          <LoadingSkeleton width="100%" height="24px" />
                        </div>
                      }
                    >
                      <span class="mx-auto block font-bold truncate">
                        {account()!.email}
                      </span>
                    </Show>
                  </div>
                </div>
                <div class="ml-20 my-2 flex flex-wrap gap-2">
                  <Link
                    href={import.meta.env.VITE_SITE_ACCOUNT_URL}
                    rel="noopener noreferrer"
                    target="_black"
                    onclick={toggleModalAccount}
                    class="py-1.5 px-4 flex gap-x-2 items-center font-bold text-sm border border-black hover:bg-black/5 active:bg-black/10 rounded-lg"
                  >
                    <ManageAccounts />
                    <span>Manage</span>
                  </Link>
                  <button
                    type="button"
                    onclick={signOut}
                    class="py-1.5 px-4 flex gap-x-2 items-center font-bold text-sm border border-black hover:bg-black/5 active:bg-black/10 rounded-lg"
                  >
                    <Logout />
                    <span>Sign out</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Show>
    );
  }

  function ModalApps() {
    return (
      <Show when={headerModalShown() === "apps"}>
        <div class="absolute right-0 sm:right-16 px-2 sm:px-0">
          <div class="w-full max-w-xs bg-white drop-shadow-lg rounded-lg border overflow-hidden">
            <div
              class={`max-h-96 py-2 px-3 overflow-y-auto ${styles["custom-scrollbar"]}`}
            >
              <div class="grid grid-cols-3">
                <For each={apps()}>
                  {(app) => (
                    <div class="w-24 p-2 aspect-square">
                      <Link
                        href={app.link}
                        rel="noopener noreferrer"
                        target="_blank"
                        onclick={toggleModalApps}
                        class="block w-full h-full p-2 flex flex-col hover:bg-teal-100/50 active:bg-teal-100/80 rounded-lg"
                      >
                        <div class="min-h-0 min-w-0 flex-1 w-fit mx-auto flex items-center justify-center">
                          <img src={app.icon} alt={app.name} />
                        </div>
                        <span class="flex-none block text-center truncate">
                          {app.name}
                        </span>
                      </Link>
                    </div>
                  )}
                </For>
              </div>
            </div>
          </div>
        </div>
      </Show>
    );
  }
}
