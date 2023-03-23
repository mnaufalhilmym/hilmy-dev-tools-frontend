import { gql } from "@apollo/client/core";
import { useNavigate, useSearchParams } from "@solidjs/router";
import { createRenderEffect, createSignal, Show } from "solid-js";
import toast from "solid-toast";
import GqlClient from "../../../api/gqlClient";
import ConfirmButton from "../../../components/button/ConfirmButton";
import PasswordTextField from "../../../components/form/PasswordTextField";
import LoadingSpinner from "../../../components/loading/LoadingSpinner";
import SiteHead from "../../../data/siteHead";
import SitePath from "../../../data/sitePath";
import showGqlError from "../../../helpers/showGqlError";

export default function ResetPasswordScreen() {
  const navigate = useNavigate();
  const [params] = useSearchParams<{ email?: string; code?: string }>();
  const [isLoadingResetPassword, setIsLoadingResetPassword] =
    createSignal(false);

  createRenderEffect(() => {
    if (!params.email || !params.code) {
      navigate(SitePath.requestResetPasswordPath, { replace: true });
      return;
    }

    SiteHead.title = "Set New Password";
  });

  function back() {
    navigate(SitePath.requestResetPasswordPath, { replace: true });
  }

  async function resetPassword(
    event: Event & {
      submitter: HTMLElement;
    } & {
      currentTarget: HTMLFormElement;
      target: Element;
    }
  ) {
    event.preventDefault();

    if (isLoadingResetPassword()) return;

    const target = event.target as typeof event.target & {
      new_password: { value: string };
      confirm_new_password: { value: string };
    };

    try {
      if (target.new_password.value !== target.confirm_new_password.value) {
        throw "New password doesn't match";
      }

      setIsLoadingResetPassword(true);

      const result = await GqlClient.client.mutate<{
        resetPassword: { isSuccess: boolean };
      }>({
        mutation: gql`
          mutation ResetPassword(
            $email: String!
            $verifyCode: String!
            $newPassword: String!
          ) {
            resetPassword(
              email: $email
              verifyCode: $verifyCode
              newPassword: $newPassword
            ) {
              isSuccess
            }
          }
        `,
        variables: {
          email: params.email,
          verifyCode: params.code,
          newPassword: target.new_password.value,
        },
      });

      if (!result.data?.resetPassword.isSuccess) throw result.errors;

      toast.success("Password changed");
      navigate(SitePath.signInPath, { replace: true });
    } catch (e) {
      showGqlError(e);
    } finally {
      setIsLoadingResetPassword(false);
    }
  }

  return (
    <div class="min-w-screen min-h-screen flex items-center">
      <div class="w-full max-w-md mx-auto p-10 border-2 rounded-lg">
        <div>
          <h1 class="text-2xl text-center">Set new password</h1>
        </div>
        <form onsubmit={resetPassword} class="mt-8">
          <div>
            <div>
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
          <div class="mt-10 -ml-1.5 flex items-center justify-between">
            <button
              type="button"
              onclick={back}
              class="px-1.5 py-1.5 text-teal-500 hover:text-teal-600 hover:bg-teal-50 active:bg-teal-100 rounded transition-colors duration-200"
            >
              Back
            </button>
            <ConfirmButton type="submit">
              <Show
                when={!isLoadingResetPassword()}
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
        </form>
      </div>
    </div>
  );
}
