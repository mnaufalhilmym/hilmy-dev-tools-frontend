import { gql } from "@apollo/client/core";
import { Link, useNavigate, useSearchParams } from "@solidjs/router";
import { createRenderEffect, createSignal, Show } from "solid-js";
import GqlClient from "../api/gqlClient";
import DangerButton from "../components/button/DangerButton";
import PlainButton from "../components/button/PlainButton";
import LoadingSkeleton from "../components/loading/LoadingSkeleton";
import { Modal } from "../components/modal/ModalWrapper";
import SiteHead from "../data/siteHead";
import SitePath from "../data/sitePath";
import { removeCookie } from "../helpers/cookie";
import getBgProfilePicture from "../helpers/getBgProfilePicture";
import showGqlError from "../helpers/showGqlError";

interface Account {
  email: string;
}

export default function MainScreen() {
  const gqlClient = GqlClient.client;
  const [params, setParams] = useSearchParams<{ invalidate?: string }>();
  const [isLoadingGetAccount, setIsLoadingGetAccount] = createSignal(false);
  const [isLoadingDeleteAccount, setIsLoadingDeleteAccount] =
    createSignal(false);
  const [account, setAccount] = createSignal<Account>();

  async function getAccount() {
    try {
      setIsLoadingGetAccount(true);

      const result = await gqlClient.query<{
        account: Account;
      }>({
        query: gql`
          query Account {
            account {
              email
            }
          }
        `,
        fetchPolicy: params.invalidate ? "network-only" : "cache-first",
      });

      if (params.invalidate) {
        setParams({ invalidate: undefined });
        return;
      }

      if (!result.data.account.email) throw result.errors;

      setAccount(result.data.account);
    } catch (e) {
      showGqlError(e);
    } finally {
      setIsLoadingGetAccount(false);
    }
  }

  createRenderEffect(() => {
    SiteHead.title = undefined;
    getAccount();
  });

  async function deleteAccount() {
    try {
      setIsLoadingDeleteAccount(true);

      const result = await gqlClient.mutate<{
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
    removeCookie("token");
    GqlClient.update();
    window.location.reload();
  }

  function showModalDeleteAccount() {
    Modal.content = ModalConfirmDeleteAccount();
    Modal.isShow = true;
  }

  function showModalSignOut() {
    Modal.content = ModalConfirmSignOut();
    Modal.isShow = true;
  }

  return (
    <div class="min-w-screen min-h-screen flex flex-col justify-center">
      <div>
        <div
          class="w-24 h-24 mx-auto flex items-center justify-center text-6xl text-white rounded-full overflow-hidden"
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
        <div class="mt-4">
          <Show
            when={account()?.email}
            fallback={
              <div class="w-fit mx-auto rounded overflow-hidden">
                <LoadingSkeleton width="300px" height="32px" />
              </div>
            }
          >
            <span class="mx-auto block font-bold text-2xl text-center">
              {account()!.email}
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
        <Link href={SitePath.emailPath} class="w-fit mx-auto block text-center">
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
  );

  function ModalConfirmSignOut() {
    function cancel() {
      Modal.isShow = false;
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
      Modal.isShow = false;
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
