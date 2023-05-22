import { gql } from "@apollo/client/core";
import { Link, useSearchParams } from "@solidjs/router";
import { createRenderEffect, createSignal, Show } from "solid-js";
import GqlClient from "../api/gqlClient";
import LoadingSkeleton from "../components/loading/LoadingSkeleton";
import { CenterModal } from "../components/modal/CenterModal";
import SiteHead from "../data/siteHead";
import SitePath from "../data/sitePath";
import getBgProfilePicture from "../helpers/getBgProfilePicture";
import showGqlError from "../helpers/showGqlError";
import Account from "../types/account.type";
import Apprepo from "../types/apprepo.type";
import signOut from "../helpers/signOut";
import Header from "../components/header/Header";

export default function MainScreen() {
  const [params, setParams] = useSearchParams<{ invalidate?: string }>();
  const [accountAndApps, setAccountAndApps] = createSignal<{
    account: Account;
    apprepos: Apprepo[];
  }>();
  const [isLoadingGetAccountAndApps, setIsLoadingGetAccountAndApps] =
    createSignal(false);
  const [isLoadingDeleteAccount, setIsLoadingDeleteAccount] =
    createSignal(false);

  const CenterModalLayer = new CenterModal();

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

  function showModalDeleteAccount() {
    CenterModalLayer.content = ModalConfirmDeleteAccount();
    CenterModalLayer.isShow = true;
  }

  function showModalSignOut() {
    CenterModalLayer.content = ModalConfirmSignOut();
    CenterModalLayer.isShow = true;
  }

  return (
    <>
      <Header
        apprepos={accountAndApps()?.apprepos}
        email={accountAndApps()?.account.email}
      />

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

      {CenterModalLayer.render()}
    </>
  );

  function ModalConfirmSignOut() {
    function cancel() {
      CenterModalLayer.isShow = false;
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
      CenterModalLayer.isShow = false;
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
}
