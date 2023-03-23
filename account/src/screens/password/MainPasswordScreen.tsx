import { gql } from "@apollo/client/core";
import { Link, useNavigate } from "@solidjs/router";
import { createRenderEffect, createSignal, Show } from "solid-js";
import toast from "solid-toast";
import GqlClient from "../../api/gqlClient";
import ConfirmButton from "../../components/button/ConfirmButton";
import PasswordTextField from "../../components/form/PasswordTextField";
import ArrowBackIcon from "../../components/icon/ArrowBackIcon";
import LoadingSpinner from "../../components/loading/LoadingSpinner";
import SiteHead from "../../data/siteHead";
import SitePath from "../../data/sitePath";
import showGqlError from "../../helpers/showGqlError";

export default function MainPasswordScreen() {
  const navigate = useNavigate();
  const [isLoadingChangePassword, setIsLoadingChangePassword] =
    createSignal(false);

  createRenderEffect(() => {
    SiteHead.title = "Password";
  });

  async function changePassword(
    event: Event & {
      submitter: HTMLElement;
    } & {
      currentTarget: HTMLFormElement;
      target: Element;
    }
  ) {
    event.preventDefault();

    if (isLoadingChangePassword()) return;

    const target = event.target as typeof event.target & {
      old_password: { value: string };
      new_password: { value: string };
      confirm_new_password: { value: string };
    };

    try {
      if (target.new_password.value !== target.confirm_new_password.value) {
        throw "New password doesn't match";
      }

      setIsLoadingChangePassword(true);

      const result = await GqlClient.client.mutate<{
        changePassword: { isSuccess: boolean };
      }>({
        mutation: gql`
          mutation ChangePassword(
            $oldPassword: String!
            $newPassword: String!
          ) {
            changePassword(
              oldPassword: $oldPassword
              newPassword: $newPassword
            ) {
              isSuccess
            }
          }
        `,
        variables: {
          oldPassword: target.old_password.value,
          newPassword: target.new_password.value,
        },
      });

      if (!result.data?.changePassword) throw result.errors;

      toast.success("Password changed");
      navigate(SitePath.homePath);
    } catch (e) {
      showGqlError(e);
    } finally {
      setIsLoadingChangePassword(false);
    }
  }

  return (
    <div class="min-w-screen min-h-screen flex items-center">
      <div class="w-full max-w-md mx-auto p-10 border-2 rounded-lg">
        <div class="flex items-center gap-x-2">
          <Link href={SitePath.homePath} class="flex">
            <ArrowBackIcon />
          </Link>
          <div>
            <h1 class="text-2xl text-center">Password</h1>
          </div>
        </div>
        <form onsubmit={changePassword} class="mt-8">
          <div>
            <div>
              <PasswordTextField
                name="old_password"
                placeholder="Old password"
                required
              />
            </div>
            <div class="mt-2">
              <PasswordTextField
                name="new_password"
                placeholder="New password"
                required
              />
            </div>
            <div class="mt-2">
              <PasswordTextField
                name="confirm_new_password"
                placeholder="Confirm new password"
                required
              />
            </div>
          </div>
          <div class="mt-10">
            <div class="w-fit ml-auto">
              <ConfirmButton type="submit">
                <Show
                  when={!isLoadingChangePassword()}
                  fallback={
                    <div class="p-0.5">
                      <LoadingSpinner />
                    </div>
                  }
                >
                  Change password
                </Show>
              </ConfirmButton>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
