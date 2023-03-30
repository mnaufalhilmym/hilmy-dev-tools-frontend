import { gql } from "@apollo/client/core";
import { useNavigate } from "@solidjs/router";
import { createRenderEffect, createSignal, Show } from "solid-js";
import GqlClient from "../../../api/gqlClient";
import ConfirmButton from "../../../components/button/ConfirmButton";
import EmailTextField from "../../../components/form/EmailTextField";
import LoadingSpinner from "../../../components/loading/LoadingSpinner";
import SiteHead from "../../../data/siteHead";
import SitePath from "../../../data/sitePath";
import showGqlError from "../../../helpers/showGqlError";

export default function RequestResetPasswordScreen() {
  const navigate = useNavigate();
  const [isLoadingRequestResetPassword, setIsLoadingRequestResetPassword] =
    createSignal(false);

  createRenderEffect(() => {
    SiteHead.title = "Reset password";
  });

  function back() {
    navigate(SitePath.signInPath, { replace: true });
  }

  async function requestResetPassword(
    event: Event & {
      submitter: HTMLElement;
    } & {
      currentTarget: HTMLFormElement;
      target: Element;
    }
  ) {
    event.preventDefault();

    if (isLoadingRequestResetPassword()) return;

    const target = event.target as typeof event.target & {
      email: { value: string };
    };

    try {
      setIsLoadingRequestResetPassword(true);

      const result = await GqlClient.client.mutate<{
        requestResetPassword: { isSuccess: boolean };
      }>({
        mutation: gql`
          mutation RequestResetPassword($email: String!) {
            requestResetPassword(email: $email) {
              isSuccess
            }
          }
        `,
        variables: {
          email: target.email.value.toLowerCase(),
        },
      });

      if (!result.data?.requestResetPassword.isSuccess) throw result.errors;

      navigate(
        `${
          SitePath.verifyRequestResetPasswordPath
        }?email=${target.email.value.toLowerCase()}`
      );
    } catch (e) {
      showGqlError(e);
    } finally {
      setIsLoadingRequestResetPassword(false);
    }
  }

  return (
    <div class="min-w-screen min-h-screen flex sm:items-center">
      <div class="w-full max-w-md mx-auto p-6 sm:p-10 sm:border-2 rounded-lg">
        <div>
          <h1 class="text-2xl text-center">Request reset password</h1>
        </div>
        <form onsubmit={requestResetPassword} class="mt-8">
          <div>
            <EmailTextField name="email" placeholder="Email" required />
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
                when={!isLoadingRequestResetPassword()}
                fallback={
                  <div class="p-0.5">
                    <LoadingSpinner />
                  </div>
                }
              >
                Next
              </Show>
            </ConfirmButton>
          </div>
        </form>
      </div>
    </div>
  );
}
