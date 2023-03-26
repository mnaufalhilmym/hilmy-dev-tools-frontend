import { gql } from "@apollo/client/core";
import { Link, useSearchParams } from "@solidjs/router";
import { createRenderEffect, createSignal, For, Show } from "solid-js";
import GqlClient from "../api/gqlClient";
import AppsIcon from "../components/icon/AppsIcon";
import Logout from "../components/icon/Logout";
import ManageAccounts from "../components/icon/ManageAccounts";
import LoadingSkeleton from "../components/loading/LoadingSkeleton";
import { CenterModal } from "../components/modal/CenterModal";
import SiteHead from "../data/siteHead";
import SitePath from "../data/sitePath";
import { deleteCookie } from "../helpers/cookie";
import getBgProfilePicture from "../helpers/getBgProfilePicture";
import showGqlError from "../helpers/showGqlError";
import Account from "../types/account.type";
import Apprepo from "../types/apprepo.type";
import styles from "./MainScreen.module.css";

export default function MainScreen() {
  const [params, setParams] = useSearchParams<{ invalidate?: string }>();
  const [accountAndApps, setAccountAndApps] = createSignal<{
    account: Account;
    apprepos: Apprepo[];
  }>();
  const [headerModalShown, setHeaderModalShown] = createSignal<string>();
  const [isLoadingGetAccountAndApps, setIsLoadingGetAccountAndApps] =
    createSignal(false);
  const [isLoadingDeleteAccount, setIsLoadingDeleteAccount] =
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
        fetchPolicy: params.invalidate ? "network-only" : "cache-first",
      });

      if (params.invalidate) {
        setParams({ invalidate: undefined });
        return;
      }

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
    SiteHead.title = undefined;

    getAccountAndApps();
  });

  async function deleteAccount() {
    try {
      setIsLoadingDeleteAccount(true);

      const result = await GqlClient.client.mutate<{
        deleteAccount: { isSuccess: boolean };
      }>({
        mutation: gql`
          mutation DeleteAccount {
            deleteAccount {
              isSuccess
            }
          }
        `,
      });

      if (!result.data?.deleteAccount.isSuccess) throw result.errors;

      signOut();
    } catch (e) {
      showGqlError(e);
    } finally {
      setIsLoadingDeleteAccount(false);
    }
  }

  function signOut() {
    deleteCookie("token");
    GqlClient.update();
    window.location.reload();
  }

  function showModalDeleteAccount() {
    CenterModal.content = ModalConfirmDeleteAccount();
    CenterModal.isShow = true;
  }

  function showModalSignOut() {
    CenterModal.content = ModalConfirmSignOut();
    CenterModal.isShow = true;
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
    <>
      <div class="fixed top-0 w-full">
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
                  "background-color": accountAndApps()?.account.email
                    ? getBgProfilePicture(
                        accountAndApps()!.account.email[0].toUpperCase()
                      )
                    : "transparent",
                }}
              >
                <Show
                  when={accountAndApps()?.account.email}
                  fallback={<LoadingSkeleton width="100%" height="100%" />}
                >
                  {accountAndApps()?.account.email[0].toUpperCase()}
                </Show>
              </div>
            </button>
          </div>
        </div>

        <ModalApps />
        <ModalAccount />
      </div>

      <div class="min-w-screen min-h-screen flex flex-col">
        <div class="flex-1 flex flex-col justify-center">
          <div>
            <div
              class="w-24 h-24 mx-auto flex items-center justify-center text-6xl text-white rounded-full overflow-hidden"
              style={{
                "background-color": accountAndApps()?.account.email
                  ? getBgProfilePicture(
                      accountAndApps()!.account.email[0].toUpperCase()
                    )
                  : "transparent",
              }}
            >
              <Show
                when={accountAndApps()?.account.email}
                fallback={<LoadingSkeleton width="100%" height="100%" />}
              >
                {accountAndApps()?.account.email[0].toUpperCase()}
              </Show>
            </div>
            <div class="mt-4">
              <Show
                when={accountAndApps()?.account.email}
                fallback={
                  <div class="w-fit mx-auto rounded overflow-hidden">
                    <LoadingSkeleton width="300px" height="32px" />
                  </div>
                }
              >
                <span class="mx-auto block font-bold text-2xl text-center">
                  {accountAndApps()!.account.email}
                </span>
              </Show>
            </div>
            <button
              type="button"
              onclick={showModalSignOut}
              class="mx-auto block text-center"
            >
              Sign out
            </button>
          </div>
          <div class="mt-6">
            <Link
              href={SitePath.emailPath}
              class="w-fit mx-auto block text-center"
            >
              Change email
            </Link>
            <Link
              href={SitePath.passwordPath}
              class="w-fit mx-auto block text-center"
            >
              Change password
            </Link>
          </div>
          <div class="mt-8">
            <button
              type="button"
              onclick={showModalDeleteAccount}
              class="mx-auto block text-center"
            >
              Delete account
            </button>
          </div>
        </div>
      </div>
    </>
  );

  function ModalConfirmSignOut() {
    function cancel() {
      CenterModal.isShow = false;
    }

    return (
      <div>
        <div>
          <span>Are you sure you want to sign out from this account?</span>
        </div>
        <div class="mt-4 flex justify-between">
          <button
            type="button"
            onclick={cancel}
            class="px-4 py-1.5 hover:bg-black/5 active:bg-black/10 hover:drop-shadow rounded transition duration-200"
          >
            Cancel
          </button>
          <button
            type="button"
            onclick={signOut}
            class="px-4 py-1.5 bg-red-500 hover:bg-red-600 active:bg-red-700 hover:drop-shadow text-white rounded transition duration-200"
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  function ModalConfirmDeleteAccount() {
    function cancel() {
      CenterModal.isShow = false;
    }

    return (
      <div>
        <div>
          <span>Are you sure you want to delete this account?</span>
        </div>
        <div class="mt-4 flex justify-between">
          <button
            type="button"
            onclick={cancel}
            class="px-4 py-1.5 hover:bg-black/5 active:bg-black/10 hover:drop-shadow rounded transition duration-200"
          >
            Cancel
          </button>
          <button
            type="button"
            onclick={deleteAccount}
            class="px-4 py-1.5 bg-red-500 hover:bg-red-600 active:bg-red-700 hover:drop-shadow text-white rounded transition duration-200"
          >
            Delete
          </button>
        </div>
      </div>
    );
  }

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
                      "background-color": accountAndApps()?.account.email
                        ? getBgProfilePicture(
                            accountAndApps()!.account.email[0].toUpperCase()
                          )
                        : "transparent",
                    }}
                  >
                    <Show
                      when={accountAndApps()?.account.email}
                      fallback={<LoadingSkeleton width="100%" height="100%" />}
                    >
                      {accountAndApps()?.account.email[0].toUpperCase()}
                    </Show>
                  </div>
                  <div class="min-w-0 flex-1">
                    <Show
                      when={accountAndApps()?.account.email}
                      fallback={
                        <div class="mx-auto rounded overflow-hidden">
                          <LoadingSkeleton width="100%" height="24px" />
                        </div>
                      }
                    >
                      <span class="mx-auto block font-bold truncate">
                        {accountAndApps()!.account.email}
                      </span>
                    </Show>
                  </div>
                </div>
                <div class="ml-20 my-2 flex flex-wrap gap-2">
                  <Link
                    href={SitePath.homePath}
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
                <For each={accountAndApps()?.apprepos}>
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
